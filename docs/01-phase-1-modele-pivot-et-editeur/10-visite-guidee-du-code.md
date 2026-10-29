# 10 — Visite guidée du code

> Lis ce document **avec le code ouvert à côté**. Les chemins sont relatifs à la racine du dépôt.
> Ordre conseillé : le noyau du centre vers l'extérieur (domaine → application), puis l'éditeur de l'extérieur vers l'intérieur (`main.tsx` → `Editeur.tsx` → composants).

---

## Partie 1 — Le noyau (`packages/noyau/`)

### Configuration

| Fichier | Rôle | Lignes importantes |
|---|---|---|
| `package.json` | Nom `@plateforme/noyau` ; `"exports": { ".": "./src/index.ts" }` (seul point d'entrée) ; **aucune** section `dependencies` ; scripts `test` (`vitest run`) et `typecheck` (`tsc --noEmit`) | `exports`, absence de `dependencies` |
| `tsconfig.json` | `"lib": ["ES2022"]` **sans DOM**, `"types": []`, `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `erasableSyntaxOnly` | Voir D5, D12 |

### Domaine (`src/domaine/`) — des fonctions pures, sans état

| Fichier | Contenu | À retenir |
|---|---|---|
| `noeud.ts` | `NoeudId`, `ValeurPropriete`, `Noeud`, `DocumentPivot` (tout en `readonly`) ; `trouverNoeud()` | **Le métamodèle structurel.** `trouverNoeud` est l'unique façon sûre de chercher un nœud (`Object.hasOwn`) |
| `composant.ts` | `DefinitionPropriete` (union de 4 variantes), `DefinitionComposant`, classe `Catalogue` (2 `Map`), `verifierValeur()`, `valeursParDefaut()` | **Le métamodèle du vocabulaire.** `verifierValeur` est utilisée **à la fois** par la validation (R5) et par la commande `modifier-propriete` : une seule définition de « valeur correcte » |
| `composants-base.ts` | Le tableau `composantsDeBase` : Texte, Bouton, Conteneur | Ajouter un composant = ajouter une entrée ici |
| `erreur.ts` | `CodeErreur` (16 codes), `ErreurModele`, fabrique `erreur()` | La fabrique omet `noeudId` quand il n'y en a pas : les tests comparent des objets exacts |
| `validation.ts` | Gardes de type, `validerDocument()` (R1 à R8), `copierDocumentValide()` | Lis-le **dans l'ordre** : chaque bloc correspond à une règle, commentée `// R1 — …` |
| `document-initial.ts` | `COMPOSANT_RACINE`, `creerDocumentInitial()` | Le document de départ : une racine Conteneur avec ses valeurs par défaut |
| `commandes.ts` | Types `Commande`, `Evenement`, `ResultatCommande` ; `appliquerCommande()` (un `switch`) ; une fonction par commande | Chaque fonction : **1.** vérifier les préconditions → `echec(...)` ; **2.** construire le nouveau document par copies superficielles ; **3.** renvoyer les événements |

### Application (`src/application/`) — le cœur vu de l'extérieur

| Fichier | Contenu |
|---|---|
| `ports/service-editeur.ts` | **Port entrant** `ServiceEditeur` (8 méthodes), `ResultatExecution`, `Ecouteur` |
| `ports/generateur-identifiants.ts` | **Port sortant** `GenerateurIdentifiants { nouveau(): NoeudId }` |
| `ports/depot-document.ts` | **Port sortant** `DepotDocument { charger(): unknown; enregistrer(doc): void }` |
| `editeur-applicatif.ts` | `EditeurApplicatif implements ServiceEditeur` : document courant, historique (2 piles), abonnés (`Set`), enregistrement |

Lecture commentée d'`EditeurApplicatif.executer` :

```ts
executer(commande: Commande): ResultatExecution {
  // 1. Le domaine (pur) calcule le résultat. On lui passe une FONCTION qui fabrique des
  //    identifiants : il ne connaît même pas le port GenerateurIdentifiants.
  const resultat = appliquerCommande(this.#document, commande, this.#catalogue, () => this.#identifiants.nouveau());
  // 2. Refusée : on ne touche à rien (ni document, ni dépôt, ni abonnés, ni historique).
  if (!resultat.succes) return { succes: false, erreurs: resultat.erreurs };
  // 3. Réussie ET le document a vraiment changé (sinon, c'était une commande sans effet, D18).
  if (resultat.document !== this.#document) {
    this.#passe.push(this.#document);                                  // historique
    if (this.#passe.length > TAILLE_HISTORIQUE) this.#passe.shift();   // borne à 100
    this.#futur = [];                                                  // une nouvelle action efface le « futur »
    this.#changer(resultat.document, resultat.evenements);             // remplacer + enregistrer + notifier
  }
  return { succes: true, evenements: resultat.evenements };
}
```

### API publique (`src/index.ts`)

Elle exporte les **types** (avec `export type`, à cause de `verbatimModuleSyntax`), `Catalogue`, `composantsDeBase`, `validerDocument`, `COMPOSANT_RACINE`, `trouverNoeud` et `EditeurApplicatif`. Elle **n'exporte pas** `appliquerCommande`, `copierDocumentValide` ni `creerDocumentInitial`. L'extérieur passe par le service (D2).

### Tests (`test/`)

| Fichier | Rôle |
|---|---|
| `doublures.ts` | `GenerateurSequentiel`, `DepotMemoire`, `copieProfonde`, `Modifiable<T>`, `copieModifiable` |
| `exemple.ts` | Le document de l'étape 2, avec `satisfies DocumentPivot` |
| `*.test.ts` | Voir [09](09-tests-et-recette.md) |

---

## Partie 2 — L'éditeur (`apps/editeur/`)

### Configuration

| Fichier | Rôle |
|---|---|
| `package.json` | `@plateforme/editeur` ; dépend de `react`, `react-dom` et `@plateforme/noyau: workspace:*` ; scripts `dev`, `build`, `typecheck`, `test`, `lint`, `recette` |
| `tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json` | *Project references* : le code de l'application (avec `"DOM"`, `jsx: react-jsx`) et la configuration Vite (avec les types Node) sont vérifiés séparément. On a ajouté `strict` et `noUncheckedIndexedAccess` |
| `vite.config.ts` | Plugin React + section `test` (environnement `jsdom`, fichiers `src/**/*.test.ts(x)`) |
| `index.html` | `lang="fr"`, titre, `<div id="root">`, charge `/src/main.tsx` |

### Le code, de l'extérieur vers l'intérieur

| Fichier | Rôle | Patron |
|---|---|---|
| `src/main.tsx` | **Racine de composition** : crée le `Catalogue`, `new EditeurApplicatif(catalogue, new GenerateurUuid(), new DepotLocalStorage('plateforme.document'))`, monte `<Editeur service={service} />` | Injection de dépendances |
| `src/adaptateurs/generateur-uuid.ts` | `crypto.randomUUID()` derrière le port | Adaptateur |
| `src/adaptateurs/depot-local-storage.ts` | `localStorage` derrière le port, avec `try/catch` en lecture et en écriture | Adaptateur |
| `src/adaptateurs/use-document.ts` | Hook React : `useSyncExternalStore(abonner, lireDocument)` | Adaptateur (Observateur → React) |
| `src/Editeur.tsx` | Mise en page, état local (sélection, erreurs), fonction `executer` (affiche les erreurs), `ajouter` (palette → sélection du nouveau nœud), raccourcis clavier, boutons de la barre | Adaptateur entrant |
| `src/outils-editeur.ts` | Fonctions **pures** de l'éditeur : `indexerCatalogue`, `cibleAjout`, `resume`, `documentVide`, `documentExemple` | — |
| `src/composants/Palette.tsx` | Un bouton par définition du catalogue | Interface pilotée par les métadonnées |
| `src/composants/Arbre.tsx` | `BrancheArbre` récursif ; `aria-current` sur la sélection | Composite |
| `src/composants/Canevas.tsx` | Table `rendus` + `RenduNoeud` récursif ; `stopPropagation` ; clic sur le fond = désélection | Interprète, Stratégie, Composite |
| `src/composants/PanneauProprietes.tsx` | `Champ` choisit le contrôle selon le type ; `ChampNombre` avec brouillon | Interface pilotée par les métadonnées |
| `src/composants/VueModelePivot.tsx` | État `lecture` / `édition` (union discriminée) ; `JSON.parse` dans un `try/catch` ; commande `remplacer-document` ; liste des erreurs avec lien « voir » | — |
| `src/editeur.css` | Grille à 3 colonnes (`grid-template-areas`), styles du canevas (conteneurs en pointillés, contour de sélection) | — |
| `recette/recette.mjs` | Recette Chrome (voir [09](09-tests-et-recette.md)) | — |

---

## Partie 3 — Une action suivie à travers le vrai code

**Action** : l'utilisateur a sélectionné le Bouton `b1` (« Valider ») et clique sur « + Texte ».

1. **`Palette.tsx`** : `onClick={() => onAjouter(d.nom)}` appelle `ajouter('Texte')` dans `Editeur.tsx`.
2. **`Editeur.tsx` → `ajouter`** :
   ```ts
   const resultat = executer({ type: 'ajouter-noeud', composant, ...cibleAjout(document, selectionId, index) });
   ```
   `cibleAjout` (dans `outils-editeur.ts`) voit que `b1` est un Bouton, qui n'accepte pas d'enfants. Elle renvoie donc `{ parentId: 'c1', position: 1 }` : **juste après** `b1`, dans son parent.
3. **`Editeur.tsx` → `executer`** appelle `service.executer(commande)` et mémorise les erreurs éventuelles.
4. **`EditeurApplicatif.executer`** (noyau) appelle `appliquerCommande(...)`.
5. **`commandes.ts` → `ajouterNoeud`** :
   - `trouverNoeud(document, 'c1')` : le parent existe ;
   - `catalogue.trouver('Conteneur').accepteEnfants === true` ;
   - `catalogue.trouver('Texte')` existe ;
   - `nouvelId()` donne un UUID, et l'on vérifie qu'il n'est pas déjà utilisé ;
   - `index = min(max(0, 1), 2) = 1`, puis `enfants = ['b1', <uuid>, 'b2']` ;
   - le nouveau nœud reçoit `{ contenu: 'Nouveau texte', taille: 'moyen' }` (valeurs par défaut du catalogue) ;
   - la fonction renvoie un **nouveau** document : `{ ...document, noeuds: { ...document.noeuds, c1: { ...c1, enfants }, [uuid]: nouveau } }`.
6. **Retour dans `EditeurApplicatif`** : historique, `#document = nouveau`, `depot.enregistrer(nouveau)` (→ `localStorage.setItem`), notification des abonnés.
7. **`useDocument`** : React est prévenu, rappelle `lireDocument()`, voit **une autre référence** et réaffiche `Editeur`.
8. **`Editeur` se réaffiche** avec le nouveau document. Le `Canevas` montre le nouveau `<p>Nouveau texte</p>` entre les deux boutons, l'`Arbre` affiche une ligne de plus et `VueModelePivot` montre le nouveau JSON.
9. **De retour dans `ajouter`** : l'événement `noeud-ajoute` donne l'UUID, et `setSelection(uuid)` sélectionne le nouveau texte. Le panneau de propriétés affiche alors « Contenu » et « Taille ».

Et si l'utilisateur avait collé ce même changement dans le JSON ? Les étapes 1 à 3 seraient remplacées par `VueModelePivot.appliquer` → `executer({ type: 'remplacer-document', … })`. Les étapes 6 à 8 seraient **strictement identiques**.

---

## Partie 4 — Comment ajouter un composant « Image » (exercice pour comprendre l'extensibilité)

1. Dans `composants-base.ts`, ajouter :
   ```ts
   { nom: 'Image', libelle: 'Image', accepteEnfants: false, proprietes: [
       { nom: 'source', libelle: 'Adresse', type: 'texte', defaut: 'https://…', obligatoire: true },
       { nom: 'largeur', libelle: 'Largeur (px)', type: 'nombre', defaut: 200, obligatoire: false } ] }
   ```
   → La **palette** affiche « + Image », le **panneau** affiche « Adresse » et « Largeur », la **validation** accepte et vérifie les nœuds Image, l'**arbre** affiche l'adresse. Tout cela **sans autre modification**.
2. Dans `Canevas.tsx`, ajouter une entrée `Image: ({ noeud, attributs }) => <img {...attributs} src=… width=… />` à la table `rendus`. C'est le seul endroit qui sait **à quoi ressemble** une image.
3. Le **noyau** ne change pas (seulement ses **données**), et le **métamodèle structurel** non plus.
