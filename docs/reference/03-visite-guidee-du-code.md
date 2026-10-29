# Visite guidée du code actuel

> 🟢 **Document de RÉFÉRENCE : il décrit l'état ACTUEL du système.**
> Dernière mise à jour : **29/10/2026, état à la fin de la phase 4**. Il est mis à jour à la fin de chaque phase.
> Versions figées : [phase 1 › 10](../01-phase-1-modele-pivot-et-editeur/10-visite-guidee-du-code.md), [phase 2 › 09](../02-phase-2-generateurs-react-vue/09-visite-guidee-du-code.md), [phase 3 › 09](../03-phase-3-deplacement-et-json-schema/09-visite-guidee-du-code.md) ; comparer montre l'évolution.

> Lis ce document **avec le code ouvert à côté**. Les chemins sont relatifs à la racine du dépôt.
> Ordre conseillé : le noyau du centre vers l'extérieur (domaine → application), puis les règles de rendu et les générateurs (Partie 1 bis), puis l'éditeur de l'extérieur vers l'intérieur (`main.tsx` → `Editeur.tsx` → composants).

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
| `noeud.ts` | `NoeudId`, `ValeurPropriete`, `Noeud`, `DocumentPivot` (tout en `readonly`) ; `trouverNoeud()` ; `estDansSousArbre()` *(phase 3, O(profondeur))* | **Le métamodèle structurel.** `trouverNoeud` est l'unique façon sûre de chercher un nœud (`Object.hasOwn`) |
| `composant.ts` | `DefinitionPropriete` (union de 4 variantes), `DefinitionComposant`, classe `Catalogue` (2 `Map`), `verifierValeur()`, `valeursParDefaut()` | **Le métamodèle du vocabulaire.** `verifierValeur` est utilisée **à la fois** par la validation (R5) et par la commande `modifier-propriete` : une seule définition de « valeur correcte » |
| `composants-base.ts` | Le tableau `composantsDeBase` : Texte, Bouton, Conteneur | Ajouter un composant = ajouter une entrée ici |
| `erreur.ts` | `CodeErreur` (16 codes), `ErreurModele`, fabrique `erreur()` | La fabrique omet `noeudId` quand il n'y en a pas : les tests comparent des objets exacts |
| `validation.ts` | Gardes de type, `validerDocument()` (R1 à R8), `copierDocumentValide()` | Lis-le **dans l'ordre** : chaque bloc correspond à une règle, commentée `// R1 — …` |
| `document-initial.ts` | `COMPOSANT_RACINE`, `creerDocumentInitial()` | Le document de départ : une racine Conteneur avec ses valeurs par défaut |
| `commandes.ts` | Types `Commande`, `Evenement`, `ResultatCommande` ; `appliquerCommande()` (un `switch`) ; une fonction par commande, dont `deplacerNoeud` *(phase 3)* | Chaque fonction : **1.** vérifier les préconditions → `echec(...)` ; **2.** construire le nouveau document par copies superficielles ; **3.** renvoyer les événements |

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
| `*.test.ts` | Voir [phase 1 › 09](../01-phase-1-modele-pivot-et-editeur/09-tests-et-recette.md) |

---

## Partie 1 bis — Règles de rendu et générateurs *(phase 2)*

| Paquet / fichier | Rôle |
|---|---|
| `packages/rendu-web/src/regles.ts` | **La table de règles** « composant → élément web » (balise, styles, texte, désactivé) ; classe `Lecteur` (valeur du nœud, sinon défaut du catalogue) ; tables `TAILLES`, `ALIGNEMENT`, `JUSTIFICATION` |
| `packages/rendu-web/src/arbre-web.ts` | `arbreWeb(document, catalogue, { inconnu })` : tout le document en arbre web ; `ErreurRendu` |
| `packages/rendu-web/src/palette.ts` | `PALETTE`, `POLICE`, `CSS_DE_BASE` |
| `packages/rendu-web/src/css.ts` | `versNomCss`, `styleEnLigne`, `nomDePaquet`, `echapperHtml` |
| `packages/rendu-web/src/document-demonstration.ts` | Le document de démonstration |
| `packages/generateur-react/src/jsx.ts` | Imprimeur JSX : `chaineJs`, `texteJsx` (échappement), `lignesJsx` |
| `packages/generateur-react/src/generer.ts` | `genererApp` (App.jsx), `genererProjetReact` (7 fichiers), `VERSIONS_REACT` |
| `packages/generateur-vue/src/template.ts` | Imprimeur de template : `texteVue` (entités et accolades), `lignesTemplate` (texte collé aux balises) |
| `packages/generateur-vue/src/generer.ts` | `genererApp` (App.vue), `genererProjetVue`, `VERSIONS_VUE` |

| `packages/schema-json/src/generer-schema.ts` *(phase 3, complété en phase 4)* | `genererSchemaJson(catalogue)` : le catalogue traduit en JSON Schema 2020-12 ; `genererSchemaImbrique(catalogue)` : le schéma **récursif** du format imbriqué ; `schemaProprietes`, partagé par les deux |
| `packages/schema-json/schema/document-pivot.v1.schema.json` | Le schéma publié du format à plat (vérifié à jour par un test) |
| `packages/schema-json/schema/document-imbrique.v1.schema.json` *(phase 4)* | Le schéma publié du format imbriqué (idem) |
| `packages/format-imbrique/src/format-imbrique.ts` *(phase 4)* | `versImbrique(document, { ids? })` ; `depuisImbrique(candidat, catalogue)` (parcours avec pile, identifiants, construction, puis `validerDocument`, erreurs avec chemin) ; `estFormatImbrique` ; `FORMAT_IMBRIQUE` |

Ces paquets sont des **fonctions pures**, compilées sans les types du navigateur. Un export complet suivi à travers ce code : [phase 2 › 09 §3](../02-phase-2-generateurs-react-vue/09-visite-guidee-du-code.md).

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
| `src/Editeur.tsx` | Mise en page ; état local (sélection, erreurs, `apercu`) ; `Catalogue` construit depuis `lireCatalogue()` ; `executer` (affiche les erreurs) ; `ajouter` (palette → sélection du nouveau nœud) ; `exporter(cible)` (générateur → `telecharger`) ; raccourcis clavier ; barre : annuler, rétablir, exemple, nouveau, démo, export | Adaptateur entrant |
| `src/adaptateurs/telechargement.ts` | `creerZip` (fonction pure, `fflate`, date fixe), `telechargerZip` et `telechargerFichier` (Blob + lien de téléchargement). Injectés dans `Editeur` par les props `telecharger` et `telechargerUnFichier` | Adaptateur sortant |
| `src/glisser-deposer/regles-depot.ts` *(phase 3)* | Fonctions **pures** du glisser-déposer : `zoneDepot`, `axeDesEnfants`, `cibleDepot`, `depotPermis` | Noyau fonctionnel |
| `src/glisser-deposer/use-glisser-deposer.ts` *(phase 3)* | Hook : lit les événements `dragstart`, `dragover` et `drop`, tient l'état (`glisse`, `survol`), envoie `ajouter-noeud` ou `deplacer-noeud` | Adaptateur entrant (coquille impérative) |
| `src/outils-editeur.ts` | Fonctions **pures** de l'éditeur : `indexerCatalogue`, `cibleAjout`, `resume`, `documentVide`, `documentExemple` | — |
| `src/composants/Palette.tsx` | Un bouton par définition du catalogue | Interface pilotée par les métadonnées |
| `src/composants/Arbre.tsx` | `BrancheArbre` récursif ; `aria-current` sur la sélection | Composite |
| `src/composants/Canevas.tsx` | Affiche l'**arbre web** de `rendu-web` avec `createElement` (composant récursif `RenduWeb`) ; ne connaît aucun nom de composant. Mode **édition** (sélection, `stopPropagation`, repères, `aria-disabled`) ou **aperçu** (rendu exact, vrai `disabled`) | Interprète, Composite |
| `src/composants/PanneauProprietes.tsx` | `Champ` choisit le contrôle selon le type ; `ChampNombre` avec brouillon | Interface pilotée par les métadonnées |
| `src/composants/VueModelePivot.tsx` | État `lecture` / `édition` (union discriminée) ; présentation « À plat / Imbriqué » et ⤓ *(phase 4)* ; `JSON.parse` dans un `try/catch` ; un document imbriqué est d'abord converti par `depuisImbrique` ; commande `remplacer-document` ; liste des erreurs avec lien « voir » | — |
| `src/editeur.css` | Grille à 3 colonnes ; repères d'édition du canevas ; règles des boutons limitées à `button:not([data-noeud-id])`, pour ne pas toucher le canevas | — |
| `recette/recette.mjs` | Recette Chrome de la phase 1 (voir [phase 1 › 09](../01-phase-1-modele-pivot-et-editeur/09-tests-et-recette.md)) | — |
| `recette/export.mjs` | Recette d'**export et de parité** (voir [phase 2 › 08](../02-phase-2-generateurs-react-vue/08-tests-et-recette.md)) | — |

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
2. Dans `packages/rendu-web/src/regles.ts`, ajouter une règle `Image: (l) => ({ balise: 'img', … })`, et `'img'` au type `Balise`. C'est le **seul** endroit qui sait **à quoi ressemble** une image. Le canevas **et** les deux générateurs en profitent d'un coup. Il faut aussi traiter `<img>` comme un élément vide dans les deux imprimeurs.
3. Le **noyau** ne change pas (seulement ses **données**), et le **métamodèle structurel** non plus.
4. Si l'étape 2 est oubliée, le **test de complétude** de `rendu-web` échoue.
