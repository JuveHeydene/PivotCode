> 📁 **Note de classement (21/10/2026)** : ce document s'appelait `conception_plateforme/03_tranche_1_editeur_et_modele_pivot.md` dans le dépôt du mémoire. Son contenu n'a pas été modifié. Dans le texte, « document `01` » = [02-proposition-de-conception-et-phases.md](../00-analyse-et-conception/02-proposition-de-conception-et-phases.md), « document `02` » = [03-guide-de-demarrage.md](../00-analyse-et-conception/03-guide-de-demarrage.md), « document `03` » = [01-guide-de-la-phase.md](../01-phase-1-modele-pivot-et-editeur/01-guide-de-la-phase.md). Voir [docs/README.md §4](../README.md).

# 03 — TRANCHE 1 : l'éditeur visuel et le modèle pivot se répondent

> **Documents de la série**
> `01` Proposition de conception (la destination) · `02` Guide de démarrage (la méthode et la feuille de route) · **`03` Tranche 1 (ce document : le travail concret à faire maintenant)**
>
> Ce document te dit **quoi** construire, **dans quel ordre**, **pourquoi**, et **comment vérifier** que c'est réussi. Il ne donne **pas** le code complet : tu crées toi-même les fichiers, les types et les classes. Tu trouveras des **indices** repliés (cliquer sur « Indice ») à n'ouvrir que si tu bloques.

---

## 0. Le but de la tranche 1

À la fin, tu dois pouvoir faire ceci, **dans les deux sens** :

```
┌────────────────────────────── ÉDITEUR ─────────────────────────────────┐
│ PALETTE        │            CANEVAS              │ PROPRIÉTÉS          │
│ [+ Texte]      │  ┌──────────────────────────┐   │ Bouton b7f2…        │
│ [+ Bouton]     │  │ Bienvenue                │   │ libellé : [Valider] │
│ [+ Conteneur]  │  │ [Valider]  [Annuler]     │   │ variante: [princ.▾] │
│────────────────│  └──────────────────────────┘   │ [Supprimer]         │
│ ARBRE          │                                 │─────────────────────│
│ ▾ Conteneur    │                                 │ MODÈLE PIVOT (JSON) │
│    Texte       │                                 │ { "racineId": …,    │
│  ▾ Conteneur   │                                 │   "noeuds": { … } } │
│      Bouton    │                                 │ [Modifier][Appliquer]│
└────────────────┴─────────────────────────────────┴─────────────────────┘
```

| Sens | Ce que tu fais | Ce que tu dois voir |
|---|---|---|
| **Éditeur → modèle** | Tu cliques sur « + Bouton », puis tu changes son libellé dans le panneau | Le JSON du modèle pivot se met à jour **immédiatement** |
| **Modèle → éditeur** | Tu modifies le JSON à la main (libellé, nouveau nœud) et tu cliques « Appliquer » | Le canevas et l'arbre affichent le changement |
| **Garde-fou** | Tu écris un JSON incorrect (texte avec des enfants, virgule oubliée) | Un message d'erreur clair, et **rien ne change** |
| **Persistance** | Tu recharges la page | Ton travail est toujours là |

**Durée indicative : 2 à 3 semaines**, à raison de quelques heures par jour.

---

## 1. Ce que je retiens des deux propositions que tu m'as montrées (décisions)

Les deux textes que tu as reçus vont dans la bonne direction. Voici ce que l'on garde, ce que l'on simplifie, et pourquoi. **Recopie ce tableau dans ton journal : ce sont tes premières fiches de décision.**

| N° | Décision | Origine | Justification |
|---|---|---|---|
| D1 | **Le modèle pivot est au centre de l'hexagone** ; l'éditeur React est un **adaptateur** en périphérie. | Proposition reçue ✅ | C'est exactement le principe de l'architecture hexagonale. |
| D2 | **Le front ne modifie jamais le modèle directement : il envoie des commandes.** | Proposition reçue ✅ | Annuler / rétablir, mode proposition de l'IA et collaboration viendront se greffer dessus. |
| D3 | **Les commandes sont des données** (objets JSON `{ type: 'ajouter-noeud', … }`), pas des classes. | Proposition reçue ✅ (je corrige le guide précédent, qui utilisait des classes) | Une donnée se sérialise, s'enregistre dans un journal, s'envoie sur le réseau, et **une IA peut la produire**. |
| D4 | **Monodépôt pnpm avec un paquet par module** (`noyau`, `editeur`). | Seconde proposition reçue ✅ | Le paquet `noyau` ne déclare pas React : il **ne peut pas** l'importer. ⚠️ Cela n'est vrai qu'avec **pnpm**. npm, lui, place toutes les dépendances à la racine, et le noyau pourrait alors importer React « par accident ». |
| D5 | **Le noyau est compilé sans les types du navigateur** (`"lib": ["ES2022"]`, pas `"DOM"`). | Ajout | Écrire `document` ou `window` dans le noyau produit **une erreur de compilation**. C'est une garantie plus solide que le test par expressions régulières proposé (je l'ai vérifié sur un projet d'essai). |
| D6 | **Un seul port entrant, `ServiceEditeur`, défini par le noyau.** Pas d'`IEditeurAPI` ni de DTO supplémentaires pour l'instant. | Simplification de la proposition reçue | En architecture hexagonale, **c'est le cœur qui définit ses ports**. Le texte reçu définissait `IEditeurAPI` dans l'adaptateur, ce qui inverse la propriété du port. Les DTO seront utiles le jour où le noyau tournera **sur un serveur** : on écrira alors un adaptateur `ServiceEditeurHttp` qui implémente le **même** port. |
| D7 | **Le modèle est un document immuable** : chaque commande produit un **nouveau** document. | Ajout (correction d'un défaut du texte reçu) | Le texte reçu faisait `setApp(api.lireApplication())`. Si le modèle est modifié sur place, React reçoit **le même objet** et **ne réaffiche rien**. Avec un document immuable, chaque changement donne un nouvel objet : React le détecte, et l'historique (annuler) devient trivial. |
| D8 | **Le modèle est stocké « à plat »** : `noeuds: { id → nœud }`, avec `parentId` et la liste `enfants` (identifiants). | Document 01, section 4 | Accès à un nœud en *O(1)*. Un objet simple (et non une `Map`) s'affiche et se sérialise directement en JSON, ce qui est indispensable pour voir le modèle pivot. |
| D9 | **Le noyau ne fait jamais confiance à ce qui vient de l'extérieur** : un document collé en JSON est **entièrement validé** avant d'être accepté. | Ajout | C'est ce qui rend le sens « modèle → éditeur » sûr. Ce sera aussi indispensable quand l'IA produira des modèles. |
| D10 | **Les identifiants et le stockage sont des ports sortants.** | Ajout | Générer un identifiant aléatoire ou écrire dans le navigateur sont des **détails techniques**. Dans les tests, on les remplace par des versions prévisibles (`n1`, `n2`…). C'est la démonstration concrète que l'hexagone fonctionne. |

---

## 2. Le vocabulaire dont tu as besoin (à comprendre avant de coder)

| Terme | Définition simple | Dans la tranche 1 |
|---|---|---|
| **Domaine** | Les règles du métier, sans aucune technologie. Des types et des **fonctions pures** (même entrée → même sortie, aucun effet de bord). | Types du modèle, catalogue, validation, application des commandes. |
| **Application** (cas d'utilisation) | Orchestration : reçoit une demande, appelle le domaine, utilise les ports sortants, prévient les abonnés. | La classe `EditeurApplicatif`. |
| **Port entrant** (ou primaire) | Ce que le cœur **offre** au monde extérieur. Une interface définie **par le cœur**. | `ServiceEditeur`. |
| **Port sortant** (ou secondaire) | Ce dont le cœur **a besoin** du monde extérieur. Une interface définie **par le cœur**. | `GenerateurIdentifiants`, `DepotDocument`. |
| **Adaptateur entrant** | Technologie qui **pilote** le cœur via un port entrant. | L'interface React. |
| **Adaptateur sortant** | Technologie qui **implémente** un port sortant. | Identifiants UUID, stockage `localStorage` ; dans les tests : identifiants séquentiels, stockage en mémoire. |
| **Racine de composition** | Le **seul** endroit où l'on choisit les adaptateurs concrets et où l'on assemble tout. | `main.tsx`. |
| **Règle de dépendance** | Les dépendances pointent **vers le centre** : domaine ← application ← adaptateurs. Jamais l'inverse. | Le domaine n'importe rien de l'application, le noyau n'importe rien de l'éditeur. |

### Le schéma complet

```
 apps/editeur  (périphérie : React, navigateur)                   packages/noyau  (cœur : TypeScript pur)
 ───────────────────────────────────────────────                  ───────────────────────────────────────────
                                                                   ┌──────────── application ─────────────┐
  ADAPTATEUR ENTRANT                                               │                                      │
  Composants React ── useDocument() ──── appelle ────────────────▶ │  «port entrant» ServiceEditeur       │
  (palette, canevas,                                               │        ▲ implémente                  │
   arbre, propriétés, JSON)  ◀── prévient (abonnement) ─────────── │  EditeurApplicatif ─── appelle ──┐   │
                                                                   │        │ utilise                 │   │
  ADAPTATEURS SORTANTS                                             │        ▼                         │   │
  GenerateurUuid ─────────── implémente ─────────────────────────▶ │  «port sortant» GenerateurIdentif.│  │
  DepotLocalStorage ──────── implémente ─────────────────────────▶ │  «port sortant» DepotDocument     │   │
                                                                   └──────────────────────────────────┼───┘
  RACINE DE COMPOSITION : main.tsx                                 ┌──────────── domaine ─────────────▼───┐
  new EditeurApplicatif(catalogue,                                 │ Noeud, DocumentPivot, Catalogue      │
     new GenerateurUuid(), new DepotLocalStorage())                │ validerDocument()  appliquerCommande()│
                                                                   └──────────────────────────────────────┘
```

**Circuit d'une action** (à savoir réciter) :
1. Clic sur « + Bouton » → le composant React appelle `service.executer({ type: 'ajouter-noeud', … })`.
2. `EditeurApplicatif` appelle la fonction du domaine `appliquerCommande(document, commande, …)`.
3. Le domaine vérifie les règles et renvoie **un nouveau document** et une liste d'**événements**, ou une liste d'**erreurs**.
4. En cas de succès, `EditeurApplicatif` garde le nouveau document, l'**enregistre** via le port `DepotDocument` et **prévient ses abonnés**.
5. Le hook React `useDocument` reçoit la notification, relit le document et React réaffiche le canevas, l'arbre **et le JSON**.

Le sens « modèle → éditeur » emprunte **exactement le même circuit**, avec la commande `remplacer-document`.

---

## 3. L'arborescence cible

Tu vas créer ces fichiers toi-même, au fil des étapes.

```
plateforme/
├── package.json                  ← racine du monodépôt (scripts communs)
├── pnpm-workspace.yaml           ← déclare les paquets
├── journal.md                    ← ton journal de bord
│
├── packages/
│   └── noyau/                    ← LE CŒUR : aucune dépendance de production
│       ├── package.json
│       ├── tsconfig.json         ← sans "DOM"
│       ├── src/
│       │   ├── domaine/
│       │   │   ├── noeud.ts              NoeudId, ValeurPropriete, Noeud, DocumentPivot
│       │   │   ├── composant.ts          DefinitionPropriete, DefinitionComposant, Catalogue
│       │   │   ├── composants-base.ts    Texte, Bouton, Conteneur
│       │   │   ├── erreur.ts             ErreurModele
│       │   │   ├── validation.ts         validerDocument()
│       │   │   ├── document-initial.ts   creerDocumentInitial()
│       │   │   └── commandes.ts          Commande, Evenement, ResultatCommande, appliquerCommande()
│       │   ├── application/
│       │   │   ├── ports/
│       │   │   │   ├── service-editeur.ts          «port entrant»
│       │   │   │   ├── generateur-identifiants.ts  «port sortant»
│       │   │   │   └── depot-document.ts           «port sortant»
│       │   │   └── editeur-applicatif.ts
│       │   └── index.ts          ← ce que le noyau expose (API publique)
│       └── test/
│           ├── doublures.ts              GenerateurSequentiel, DepotMemoire (adaptateurs de test)
│           ├── validation.test.ts
│           ├── commandes.test.ts
│           └── editeur-applicatif.test.ts
│
└── apps/
    └── editeur/                  ← LA PÉRIPHÉRIE : React, navigateur
        └── src/
            ├── adaptateurs/
            │   ├── generateur-uuid.ts
            │   ├── depot-local-storage.ts
            │   └── use-document.ts
            ├── composants/
            │   ├── Palette.tsx
            │   ├── Canevas.tsx
            │   ├── Arbre.tsx
            │   ├── PanneauProprietes.tsx
            │   └── VueModelePivot.tsx
            ├── Editeur.tsx
            ├── editeur.css
            └── main.tsx          ← racine de composition
```

---

## ÉTAPE 1 — Installer et initialiser le monodépôt (½ journée)

### Objectif
Avoir un monodépôt avec un paquet `noyau` qui compile et dont les tests tournent.

### À comprendre
- **Monodépôt** : un seul dépôt Git, plusieurs paquets. Chaque paquet a son `package.json` et déclare **ses** dépendances.
- **pnpm** : gestionnaire de paquets qui stocke chaque dépendance **une seule fois** sur le disque et ne laisse un paquet importer **que** ce qu'il a déclaré.

### Ce que tu fais

1. Vérifie Node.js (`node --version` : tu as déjà la v24) et installe pnpm :
   ```bash
   npm install -g pnpm        # en cas d'erreur de permission : corepack enable pnpm
   pnpm --version
   ```
2. Crée le dossier (en dehors du dossier LaTeX), initialise Git et le `package.json` racine :
   ```bash
   mkdir -p ~/Lectures_\&_projects/plateforme && cd ~/Lectures_\&_projects/plateforme
   git init
   pnpm init
   ```
   Ouvre le `package.json` créé, ajoute `"private": true` (un monodépôt ne se publie pas).
3. Crée `pnpm-workspace.yaml` :
   ```yaml
   packages:
     - "packages/*"
     - "apps/*"
   ```
4. Installe TypeScript **à la racine** (outil partagé par tous les paquets) :
   ```bash
   pnpm add -D -w typescript
   ```
   `-w` signifie « à la racine de l'espace de travail ».
5. Crée `packages/noyau/package.json` **à la main** :
   ```json
   {
     "name": "@plateforme/noyau",
     "version": "0.0.1",
     "private": true,
     "type": "module",
     "exports": { ".": "./src/index.ts" },
     "scripts": {
       "test": "vitest run",
       "typecheck": "tsc --noEmit"
     }
   }
   ```
   - `name` : le nom par lequel les autres paquets l'importeront.
   - `exports` : le **seul** point d'entrée public du noyau. Personne ne pourra importer ses fichiers internes.
   - Pas de section `dependencies` : **le noyau ne dépend de rien**. C'est voulu.
6. Crée `packages/noyau/tsconfig.json` :
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "lib": ["ES2022"],
       "module": "ESNext",
       "moduleResolution": "bundler",
       "types": [],
       "strict": true,
       "verbatimModuleSyntax": true,
       "erasableSyntaxOnly": true,
       "noEmit": true,
       "skipLibCheck": true
     },
     "include": ["src", "test"]
   }
   ```
   Les lignes importantes :
   - `"lib": ["ES2022"]` sans `"DOM"` : `document` et `window` **n'existent pas** pour le noyau (décision D5).
   - `"types": []` : aucun type global (ni Node.js, ni navigateur) n'est chargé automatiquement.
   - `"verbatimModuleSyntax": true` : tu dois écrire `import type { … }` pour importer un type. Cela rend explicite ce qui est un type et ce qui est du code.
   - `"erasableSyntaxOnly": true` : interdit les `enum` et les **propriétés de paramètres** (`constructor(private x: …)`). Utilise des **unions de chaînes** (`'texte' | 'nombre'`) et déclare les champs explicitement. L'éditeur React utilise la même règle, donc le noyau doit la respecter.
7. Installe Vitest **dans le noyau seulement** :
   ```bash
   pnpm --filter @plateforme/noyau add -D vitest
   ```
8. Crée `packages/noyau/src/index.ts` avec une fonction bidon, et `packages/noyau/test/essai.test.ts` qui la teste. Dans les tests, importe **sans extension** : `from '../src/index'`.
9. Ajoute dans le `package.json` **racine** :
   ```json
   "scripts": {
     "test": "pnpm --filter @plateforme/noyau test",
     "typecheck": "pnpm -r typecheck",
     "dev": "pnpm --filter editeur dev"
   }
   ```
10. Crée un `.gitignore` contenant `node_modules` et `dist`, puis fais ton premier commit.

### ✅ Vérification
- `pnpm test` affiche `1 passed`.
- `pnpm typecheck` ne signale aucune erreur.
- **Expérience à faire absolument** : écris dans un fichier du noyau `import React from 'react'` puis `document.title`. Lance `pnpm typecheck` : **deux erreurs** (« Cannot find module 'react' », « Cannot find name 'document' »). Supprime ces lignes. Tu viens de **voir** la frontière de l'hexagone.

### 📓 Journal
Explique avec tes mots pourquoi le noyau ne peut pas importer React, et quelles **deux** protections l'en empêchent (D4 et D5).

---

## ÉTAPE 2 — Les types du modèle pivot (1 journée)

### Objectif
Définir la forme du modèle pivot. C'est la version 1 de ton **métamodèle**.

### À comprendre
- Le modèle pivot est un **document JSON** : un identifiant de racine et une table de nœuds.
- Chaque nœud dit **quel composant** il est, ses **propriétés** (valeurs), son **parent** et ses **enfants** (dans l'ordre).
- On stocke les enfants par **identifiants**, pas par objets imbriqués (décision D8).

### Ce que tu fais

Dans `src/domaine/noeud.ts`, déclare :

| Type | Contenu attendu |
|---|---|
| `NoeudId` | Alias de `string`. |
| `ValeurPropriete` | `string`, `number` ou `boolean`. |
| `Noeud` | `id`, `composant` (nom du composant, ex. `'Bouton'`), `proprietes` (dictionnaire nom → valeur), `parentId` (`NoeudId` ou `null` pour la racine), `enfants` (tableau de `NoeudId`). |
| `DocumentPivot` | `versionMetamodele` (le nombre `1`), `racineId`, `noeuds` (dictionnaire `NoeudId` → `Noeud`). |

Utilise `Record<K, V>` pour les dictionnaires.

Puis, **avant tout code**, écris à la main dans `journal.md` un document pivot complet qui représente : une racine `Conteneur` (colonne) contenant un `Texte` « Bienvenue » et un `Conteneur` (ligne) qui contient deux `Bouton` « Valider » et « Annuler ». Utilise des identifiants simples : `racine`, `t1`, `c1`, `b1`, `b2`.

<details>
<summary>Indice : le début du document attendu</summary>

```json
{
  "versionMetamodele": 1,
  "racineId": "racine",
  "noeuds": {
    "racine": {
      "id": "racine",
      "composant": "Conteneur",
      "proprietes": { "direction": "colonne", "espacement": 8 },
      "parentId": null,
      "enfants": ["t1", "c1"]
    },
    "t1": {
      "id": "t1",
      "composant": "Texte",
      "proprietes": { "contenu": "Bienvenue", "taille": "moyen" },
      "parentId": "racine",
      "enfants": []
    }
  }
}
```
À toi de compléter `c1`, `b1` et `b2`.
</details>

### ✅ Vérification
Ton document écrit à la main est **cohérent** : chaque identifiant présent dans un `enfants` existe dans `noeuds`, et son `parentId` pointe bien vers le parent. Cette vérification manuelle est **exactement** ce que tu automatiseras à l'étape 4.

### 📓 Journal
Pourquoi stocker `parentId` **et** `enfants`, alors que l'un se déduit de l'autre ? (Piste : vitesse d'accès dans les deux directions, mais risque d'incohérence. Qui garantit la cohérence ?)

---

## ÉTAPE 3 — Le catalogue des composants (½ journée)

### Objectif
Décrire les composants disponibles **par des données**, pour que l'éditeur (palette, panneau de propriétés) et la validation s'appuient dessus.

### À comprendre
Le nœud dit « je suis un Bouton avec le libellé Valider ». La **définition de composant** dit « un Bouton a une propriété `libelle` de type texte, obligatoire, valeur par défaut "Bouton", et n'accepte pas d'enfants ». Le nœud appartient au niveau **M1** (modèle), la définition au niveau **M2** (métamodèle).

### Ce que tu fais

1. Dans `src/domaine/composant.ts` :
   - `TypePropriete` : `'texte' | 'nombre' | 'booleen' | 'choix'` ;
   - `DefinitionPropriete` : `nom`, `libelle` (pour l'affichage), `type`, `defaut` (`ValeurPropriete`), `obligatoire`, `choix?` (liste de valeurs permises si `type === 'choix'`) ;
   - `DefinitionComposant` : `nom`, `libelle`, `accepteEnfants`, `proprietes` (tableau de `DefinitionPropriete`) ;
   - une classe `Catalogue` construite à partir d'un tableau de définitions, avec `lister()` et `trouver(nom)`. Range les définitions dans un dictionnaire pour que `trouver` soit en *O(1)*.
2. Dans `src/domaine/composants-base.ts`, exporte un tableau `composantsDeBase` :

| Composant | Accepte des enfants | Propriétés (type, défaut) |
|---|---|---|
| `Texte` | non | `contenu` (texte, « Nouveau texte », obligatoire) ; `taille` (choix `petit` / `moyen` / `grand`, `moyen`) |
| `Bouton` | non | `libelle` (texte, « Bouton », obligatoire) ; `variante` (choix `principal` / `secondaire`, `principal`) |
| `Conteneur` | **oui** | `direction` (choix `colonne` / `ligne`, `colonne`) ; `espacement` (nombre, 8) |

3. Exporte ces éléments depuis `src/index.ts`.

> **Pourquoi c'est important pour la suite** : ajouter un quatrième composant (Image, Champ de saisie…) consistera à **ajouter une ligne de données** dans ce tableau. L'éditeur et la validation fonctionneront sans modification. C'est la graine des plugins (document 01, section 3.3).

### ✅ Vérification
Un test : `new Catalogue(composantsDeBase).trouver('Bouton')?.accepteEnfants` vaut `false`, et `trouver('Inconnu')` vaut `undefined`.

---

## ÉTAPE 4 — La validation d'un document (1 à 2 journées)

### Objectif
Une fonction pure `validerDocument(candidat: unknown, catalogue: Catalogue): ErreurModele[]` qui renvoie **toutes** les erreurs d'un document, ou un tableau vide s'il est valide.

### À comprendre
- Le paramètre est de type `unknown` : la fonction doit accepter **n'importe quoi** (par exemple un JSON collé par l'utilisateur) et ne jamais planter (décision D9).
- On vérifie d'abord la **forme** (est-ce un objet ? `noeuds` existe-t-il ?), puis les **règles du métamodèle**.

### Ce que tu fais

1. `src/domaine/erreur.ts` : type `ErreurModele` avec `code` (ex. `'ENFANTS_INTERDITS'`), `message` (lisible, en français) et `noeudId?`.
2. `src/domaine/validation.ts` : implémente les règles suivantes, **dans cet ordre**.

| N° | Règle | Code d'erreur proposé |
|---|---|---|
| R1 | Le candidat est un objet avec `versionMetamodele === 1`, `racineId` (texte) et `noeuds` (objet). Sinon : **arrêter ici** (les règles suivantes n'ont pas de sens). | `FORME_INVALIDE` |
| R2 | Chaque nœud a la bonne forme (`id` texte, `composant` texte, `proprietes` objet, `parentId` texte ou `null`, `enfants` tableau de textes), et sa clé dans `noeuds` est égale à son `id`. | `NOEUD_MAL_FORME` |
| R3 | `racineId` existe dans `noeuds` et la racine a `parentId === null`. | `RACINE_INVALIDE` |
| R4 | Le composant de chaque nœud existe dans le catalogue. | `COMPOSANT_INCONNU` |
| R5 | Propriétés : chaque propriété obligatoire est présente ; chaque valeur a le bon type ; une valeur de type `choix` fait partie de la liste ; aucune propriété inconnue. | `PROPRIETE_…` |
| R6 | Un composant qui n'accepte pas d'enfants a `enfants` vide. | `ENFANTS_INTERDITS` |
| R7 | Chaque identifiant cité dans `enfants` existe, et le `parentId` de cet enfant désigne bien le nœud courant. | `LIEN_INCOHERENT` |
| R8 | **Chaque nœud est atteignable depuis la racine exactement une fois** : pas de nœud orphelin, pas de cycle, pas de nœud partagé entre deux parents. | `NOEUD_ORPHELIN`, `CYCLE_OU_PARTAGE` |

3. Exporte `validerDocument` depuis `index.ts`.

<details>
<summary>Indice : règle R8 en une seule passe, en O(n)</summary>

Parcours l'arbre depuis la racine avec une **pile** (parcours en profondeur) et un ensemble `vus` (`Set<NoeudId>`) :
- tu dépiles un identifiant ; s'il est **déjà** dans `vus`, c'est un cycle ou un partage → erreur, ne pas redescendre ;
- sinon, tu l'ajoutes à `vus` et tu empiles ses enfants.

À la fin, tout nœud de `noeuds` absent de `vus` est **orphelin**.
Chaque nœud est traité une fois, chaque lien une fois : la complexité est *O(n)*. Utilise une pile plutôt que la récursion : un arbre très profond ne fera pas déborder la pile d'appels.
</details>

<details>
<summary>Indice : tester un « unknown » sans planter</summary>

Écris de petites fonctions utilitaires : `estObjet(x): x is Record<string, unknown>` (vrai si `typeof x === 'object' && x !== null && !Array.isArray(x)`), `estTexte(x): x is string`, etc. Ces fonctions de **garde de type** permettent ensuite à TypeScript de connaître le type.
</details>

### Tests à écrire (`test/validation.test.ts`)

Voici le premier, **à recopier et comprendre** ; écris les autres sur le même modèle :

```ts
import { describe, it, expect } from 'vitest';
import { Catalogue, composantsDeBase, validerDocument } from '../src/index';
import type { DocumentPivot } from '../src/index';

const catalogue = new Catalogue(composantsDeBase);

// Le type de retour explicite évite que TypeScript déduise `enfants: never[]` pour t1
function documentValide(): DocumentPivot {
  return {
    versionMetamodele: 1,
    racineId: 'racine',
    noeuds: {
      racine: { id: 'racine', composant: 'Conteneur', proprietes: { direction: 'colonne', espacement: 8 }, parentId: null, enfants: ['t1'] },
      t1: { id: 't1', composant: 'Texte', proprietes: { contenu: 'Bienvenue', taille: 'moyen' }, parentId: 'racine', enfants: [] },
    },
  };
}

describe('validerDocument', () => {
  it('accepte un document valide', () => {
    expect(validerDocument(documentValide(), catalogue)).toEqual([]);
  });

  it('refuse un Texte qui a des enfants', () => {
    const doc = documentValide();
    doc.noeuds.t1.enfants = ['racine'];
    const codes = validerDocument(doc, catalogue).map((e) => e.code);
    expect(codes).toContain('ENFANTS_INTERDITS');
  });
});
```

Ajoute au moins un test **par règle** (R1 à R8), plus : `null`, une chaîne de caractères, un tableau, un objet vide.

### ✅ Vérification
Tous les tests passent. Ton document écrit à la main à l'étape 2 est déclaré **valide**.

---

## ÉTAPE 5 — Les commandes (2 journées)

### Objectif
Une fonction pure `appliquerCommande(document, commande, catalogue, nouvelId)` qui renvoie **soit** un nouveau document avec des événements, **soit** des erreurs, **sans jamais modifier le document reçu**.

### À comprendre
- **Immuabilité** (décision D7) : on ne modifie pas l'objet reçu, on construit un nouvel objet en recopiant ce qui ne change pas (`{ ...ancien, champ: nouvelleValeur }`). Les nœuds non touchés sont **partagés** entre l'ancien et le nouveau document : la copie est **superficielle**.
- `nouvelId` est une simple fonction `() => NoeudId` passée en paramètre. Le domaine ne sait pas **comment** les identifiants sont fabriqués. Il ne dépend pas non plus du port de l'application (règle de dépendance).

### Ce que tu fais

Dans `src/domaine/commandes.ts` :

1. Le type `Commande` (union) :

| `type` | Champs | Règles à vérifier |
|---|---|---|
| `'ajouter-noeud'` | `parentId`, `composant`, `position?` | Le parent existe et accepte des enfants ; le composant existe. Le nouveau nœud reçoit les **valeurs par défaut** de sa définition. Sans `position`, il est ajouté à la fin ; une `position` hors limites est ramenée dans les limites. |
| `'supprimer-noeud'` | `id` | Le nœud existe et **n'est pas la racine**. Supprimer aussi **tous ses descendants** et le retirer de la liste `enfants` de son parent. |
| `'modifier-propriete'` | `id`, `nom`, `valeur` | Le nœud existe ; la propriété est déclarée par le composant ; la valeur a le bon type (et fait partie des choix si besoin). |
| `'remplacer-document'` | `document: unknown` | `validerDocument` ne renvoie **aucune** erreur. |

2. Le type `Evenement` (union) : `'noeud-ajoute'` (`id`, `parentId`), `'noeud-supprime'` (`id`), `'propriete-modifiee'` (`id`, `nom`), `'document-remplace'`.
3. Le type `ResultatCommande` :
   ```ts
   type ResultatCommande =
     | { succes: true; document: DocumentPivot; evenements: Evenement[] }
     | { succes: false; erreurs: ErreurModele[] };
   ```
   C'est une **union discriminée** : en testant `resultat.succes`, TypeScript sait quels champs existent.
4. La fonction `appliquerCommande`, avec un `switch (commande.type)`. Écris **une fonction par commande** (`ajouterNoeud`, `supprimerNoeud`…) pour garder le `switch` lisible.
5. Dans `src/domaine/document-initial.ts` : `creerDocumentInitial(catalogue, nouvelId)` renvoie un document contenant **seulement** une racine `Conteneur` avec ses valeurs par défaut.

<details>
<summary>Indice : modifier un nœud sans muter le document</summary>

```ts
const ancien = document.noeuds[id];
const nouveau = { ...ancien, proprietes: { ...ancien.proprietes, [nom]: valeur } };
return {
  succes: true,
  document: { ...document, noeuds: { ...document.noeuds, [id]: nouveau } },
  evenements: [{ type: 'propriete-modifiee', id, nom }],
};
```
Recopier `document.noeuds` coûte *O(n)* (copie superficielle des références). C'est négligeable pour l'instant ; le document 01 prévoit plus tard des structures à partage structurel, qui ramènent ce coût à *O(log n)*.
</details>

<details>
<summary>Indice : supprimer les descendants</summary>

Collecte d'abord les identifiants à supprimer avec un parcours (pile) depuis le nœud. Construis ensuite le nouveau dictionnaire **sans** ces identifiants, puis remplace le parent par une copie dont `enfants` ne contient plus le nœud.
</details>

### Tests à écrire (`test/commandes.test.ts`)

Pour chaque commande, au minimum :
- le **cas nominal** (le document résultat contient bien le changement) ;
- chaque **cas d'erreur** du tableau ;
- **le document d'origine n'a pas changé** (garde une copie avec `structuredClone` avant l'appel et compare avec `toEqual`) ;
- **le document résultat est valide** : `validerDocument(resultat.document, catalogue)` renvoie `[]`. C'est un **filet de sécurité** très puissant : la validation vérifie les commandes.

Pour `nouvelId`, utilise dans les tests un compteur prévisible :
```ts
let n = 0;
const nouvelId = () => `n${++n}`;
```

### ✅ Vérification
Tous les tests passent, y compris « le document d'origine n'a pas changé » pour chaque commande.

### 📓 Journal
Pourquoi le domaine reçoit-il `nouvelId` en paramètre au lieu d'appeler directement une fonction de génération aléatoire ? Que se passerait-il dans les tests sinon ?

---

## ÉTAPE 6 — La couche application : ports et `EditeurApplicatif` (1 à 2 journées)

### Objectif
Construire **le cœur vu de l'extérieur** : un service qui garde le document courant, exécute les commandes, enregistre et prévient les abonnés.

### À comprendre
- Le **patron Observateur** : des composants s'**abonnent** au service et reçoivent une notification à chaque changement. `abonner` renvoie une fonction de **désabonnement**.
- Les **ports** sont de simples interfaces TypeScript. La classe `EditeurApplicatif` ne connaît **que** ces interfaces, jamais une technologie.

### Ce que tu fais

1. Les ports sortants :
   - `application/ports/generateur-identifiants.ts` : interface `GenerateurIdentifiants` avec `nouveau(): NoeudId` ;
   - `application/ports/depot-document.ts` : interface `DepotDocument` avec `charger(): unknown` (renvoie `null` si rien n'est enregistré) et `enregistrer(document: DocumentPivot): void`.
     `charger` renvoie `unknown` parce que ce qui est stocké a pu être modifié ou corrompu (décision D9).
2. Le port entrant `application/ports/service-editeur.ts` : interface `ServiceEditeur` avec
   - `lireDocument(): DocumentPivot`
   - `lireCatalogue(): DefinitionComposant[]`
   - `executer(commande: Commande): { succes: true } | { succes: false; erreurs: ErreurModele[] }`
   - `abonner(ecouteur: (evenements: Evenement[]) => void): () => void`
3. La classe `application/editeur-applicatif.ts` : `EditeurApplicatif implements ServiceEditeur`.
   - Le **constructeur** reçoit le catalogue, un `GenerateurIdentifiants` et un `DepotDocument`. Il charge le document depuis le dépôt ; si rien n'est enregistré **ou si le document chargé est invalide**, il part de `creerDocumentInitial`.
   - `executer` appelle `appliquerCommande`. En cas de succès : remplace le document courant, l'enregistre, prévient chaque abonné avec les événements.
   - Les abonnés sont rangés dans un `Set` : l'ajout et le retrait se font en *O(1)*.
   - Rappel (`erasableSyntaxOnly`) : déclare les champs de la classe explicitement, sans `constructor(private …)`.
4. Exporte depuis `index.ts` : les types et ports (avec `export type { … }`), `EditeurApplicatif`, `Catalogue`, `composantsDeBase`, `validerDocument`.
   **N'exporte pas** `appliquerCommande` : l'extérieur doit passer par le service.

5. **Adaptateurs de test** (`test/doublures.ts`) :
   - `GenerateurSequentiel` : renvoie `n1`, `n2`, `n3`… ;
   - `DepotMemoire` : garde le document dans un champ, et compte le nombre d'enregistrements.

### Tests à écrire (`test/editeur-applicatif.test.ts`)
- Au démarrage avec un dépôt vide, le document contient seulement une racine `Conteneur`.
- Au démarrage avec un dépôt contenant un document **invalide**, le service repart du document initial (il ne plante pas).
- Après `executer(ajouter-noeud)` réussi : le nouveau nœud est dans `lireDocument()`, le dépôt a été appelé, l'abonné a reçu `noeud-ajoute`.
- Après une commande **refusée** : `succes` vaut `false`, le document n'a pas changé, l'abonné n'a **pas** été prévenu, rien n'a été enregistré.
- Après désabonnement, l'écouteur n'est plus appelé.
- `lireDocument()` renvoie **le même objet** (`toBe`) tant qu'aucune commande n'a réussi, et un **objet différent** après. Ce test est essentiel pour React (étape 8).

### ✅ Vérification
`pnpm test` passe entièrement. **Le cœur de ta tranche 1 est terminé, sans avoir écrit une ligne de React.** Fais un commit.

### 📓 Journal
Dessine le schéma de la section 2 de mémoire et place-y chaque fichier que tu as écrit.

---

## ÉTAPE 7 — Créer l'éditeur et le brancher sur le noyau (½ journée)

### Objectif
Une application React vide qui importe le noyau.

### Ce que tu fais
1. Depuis `apps/` :
   ```bash
   cd apps
   pnpm create vite@latest editeur --template react-ts
   cd ..
   pnpm install
   ```
2. Ajoute le noyau comme dépendance de l'éditeur :
   ```bash
   pnpm --filter editeur add "@plateforme/noyau@workspace:*"
   ```
   `workspace:*` signifie « le paquet local de ce monodépôt », pas une version téléchargée.
3. Fais le ménage dans `apps/editeur/src` : supprime `App.tsx`, `App.css`, `index.css` et le dossier `assets`, et retire leurs imports de `main.tsx`.
4. Dans `main.tsx`, importe `Catalogue` et `composantsDeBase` depuis `'@plateforme/noyau'`, puis affiche simplement la liste des noms de composants.
5. Lance `pnpm dev` (depuis la racine) et ouvre l'adresse affichée.

### ✅ Vérification
La page affiche « Texte, Bouton, Conteneur ». Les données viennent **du noyau**, sans étape de compilation intermédiaire : Vite lit directement le TypeScript du paquet `noyau` grâce au champ `exports`.

---

## ÉTAPE 8 — Les adaptateurs du navigateur et la racine de composition (½ journée)

### Objectif
Fournir les implémentations « réelles » des ports, et un **hook** qui fait le pont entre le service et React.

### Ce que tu fais

1. `adaptateurs/generateur-uuid.ts` : `GenerateurUuid implements GenerateurIdentifiants`, avec `crypto.randomUUID()`.
2. `adaptateurs/depot-local-storage.ts` : `DepotLocalStorage implements DepotDocument`.
   - `enregistrer` : `localStorage.setItem(cle, JSON.stringify(document))`.
   - `charger` : lit la clé, renvoie `null` si absente, `JSON.parse` sinon. Entoure le tout d'un `try/catch` (stockage bloqué, JSON corrompu) et renvoie `null` en cas d'échec.
3. `adaptateurs/use-document.ts` : le hook React qui **adapte** le patron Observateur du noyau au fonctionnement de React. React fournit pour cela `useSyncExternalStore` :

   ```ts
   import { useCallback, useSyncExternalStore } from 'react';
   import type { DocumentPivot, ServiceEditeur } from '@plateforme/noyau';

   export function useDocument(service: ServiceEditeur): DocumentPivot {
     const abonner = useCallback(
       (prevenirReact: () => void) => service.abonner(() => prevenirReact()),
       [service],
     );
     return useSyncExternalStore(abonner, () => service.lireDocument());
   }
   ```
   C'est le seul morceau que je te donne, car il dépend d'un détail de React. React appelle `lireDocument()` et compare le résultat avec le précédent **par référence**. Le document est immuable : la référence ne change **que** si une commande a réussi. C'est la raison d'être du dernier test de l'étape 6.
4. `main.tsx`, la **racine de composition** : c'est le **seul** fichier qui fait des `new`.
   - Crée le catalogue, puis `new EditeurApplicatif(catalogue, new GenerateurUuid(), new DepotLocalStorage())`.
   - Passe le service au composant `<Editeur service={service} />` par une propriété.

### ✅ Vérification
Une version provisoire d'`Editeur` affiche `JSON.stringify(document, null, 2)` dans une balise `<pre>`. Tu vois le document initial, avec un identifiant UUID pour la racine.

---

## ÉTAPE 9 — Voir le modèle pivot et le canevas (1 journée)

### Objectif
Afficher le même document **de deux façons** : en JSON, et rendu visuellement.

### À comprendre
Le canevas est un **interpréteur** du modèle (document 01, section 3.6) : il parcourt l'arbre et choisit, pour chaque nœud, quoi afficher selon son composant. C'est la même idée que les générateurs, mais au lieu d'**écrire** du code, il **affiche** directement.

### Ce que tu fais
1. `Editeur.tsx` : la mise en page en trois colonnes (CSS grid dans `editeur.css`), le hook `useDocument`, et l'état **local** `selectionId` (avec `useState`).
   > La sélection n'est **pas** dans le modèle pivot. C'est un état **de l'éditeur**, pas de l'application conçue. Cette distinction est importante pour le mémoire.
2. `VueModelePivot.tsx` (lecture seule pour l'instant) : `<pre>` avec le JSON indenté.
3. `Canevas.tsx` : un composant **récursif** `RenduNoeud({ document, id, … })` :
   - `Texte` → `<p>` (taille de police selon `taille`) ;
   - `Bouton` → `<button>` (style selon `variante`) ;
   - `Conteneur` → `<div>` en `display: flex`, avec `flexDirection` selon `direction`, `gap` selon `espacement`, et les enfants rendus **dans l'ordre** de `enfants`.
   - Un clic sur un élément le sélectionne (`event.stopPropagation()` pour que le clic ne remonte pas au conteneur parent). L'élément sélectionné reçoit un contour visible.
   - Pour qu'un conteneur vide reste cliquable, donne-lui une hauteur minimale et une bordure en pointillés.

### ✅ Vérification
Colle dans la console du navigateur ton document de l'étape 2 sous la clé de `localStorage`, puis recharge la page : le canevas l'affiche, et le JSON est identique.
(Si tu as mal recopié, le service rejette le document et repart du document initial : le garde-fou fonctionne.)

---

## ÉTAPE 10 — Sens éditeur → modèle : palette, arbre, suppression (1 à 2 journées)

### Objectif
Poser un composant dans l'éditeur et le voir apparaître dans le modèle pivot.

### Ce que tu fais
1. `Palette.tsx` : un bouton par définition de `service.lireCatalogue()` (« + Texte »…). Au clic, la palette détermine le **parent** :
   - si le nœud sélectionné **accepte des enfants**, c'est lui ;
   - sinon, c'est **son parent** (on ajoute « à côté ») ;
   - sans sélection, c'est la racine.

   Elle appelle ensuite `service.executer({ type: 'ajouter-noeud', parentId, composant })`.
   Remarque : la palette ne connaît **aucun** composant en dur. Elle lit le catalogue.
2. Affiche les **erreurs** renvoyées par `executer` dans une zone de messages de l'éditeur.
3. `Arbre.tsx` : liste indentée récursive (nom du composant + début de son texte principal), synchronisée avec `selectionId` dans les deux sens.
4. Bouton **Supprimer** (désactivé pour la racine) qui envoie `supprimer-noeud`.

### ✅ Vérification
- Ajoute un Bouton dans la racine : un nouveau nœud apparaît **dans le JSON**, son identifiant est ajouté à `racine.enfants`, et son `parentId` est correct.
- Ajoute un Conteneur, sélectionne-le, ajoute deux Textes : ils sont **dans** ce conteneur, dans le canevas comme dans le JSON.
- Supprime ce conteneur : ses deux Textes disparaissent aussi du JSON.

---

## ÉTAPE 11 — Le panneau de propriétés généré (1 journée)

### Objectif
Modifier les propriétés d'un nœud, avec un formulaire **construit automatiquement** à partir de sa définition.

### Ce que tu fais
`PanneauProprietes.tsx` : pour le nœud sélectionné, retrouve sa définition dans le catalogue et, **pour chaque `DefinitionPropriete`**, affiche un champ selon son `type` :

| Type | Champ |
|---|---|
| `texte` | `<input type="text">` |
| `nombre` | `<input type="number">` (convertir la saisie en nombre avant d'envoyer la commande) |
| `booleen` | `<input type="checkbox">` |
| `choix` | `<select>` avec les `choix` |

Chaque modification envoie `modifier-propriete`.

> **C'est un formulaire piloté par les métadonnées** : il ne connaît ni « Bouton » ni « libellé ». Ajoute une propriété `couleur` (texte) au Bouton dans `composants-base.ts` : le champ apparaît **tout seul** dans le panneau. (Il faudra aussi gérer cette propriété dans le canevas, sinon elle n'aura aucun effet visible.)

### ✅ Vérification
Tu changes le libellé d'un bouton : le canevas **et** le JSON changent à chaque frappe.

---

## ÉTAPE 12 — Sens modèle → éditeur : éditer le JSON (1 journée)

### Objectif
Modifier le modèle pivot **directement** et voir l'éditeur suivre.

### Ce que tu fais
Fais évoluer `VueModelePivot.tsx` en un petit éditeur à deux modes :
1. **Mode lecture** (par défaut) : le JSON suit le document en direct (comme à l'étape 9).
2. Bouton **Modifier** : passe en **mode édition**. Le texte actuel est copié dans un **brouillon** (`useState`) affiché dans un `<textarea>` ; il ne suit plus le document.
3. Bouton **Appliquer** :
   - `JSON.parse(brouillon)` dans un `try/catch`. En cas d'erreur de syntaxe, affiche le message et reste en mode édition ;
   - sinon, `service.executer({ type: 'remplacer-document', document: valeurLue })` ;
   - si la commande est refusée, affiche **la liste des erreurs de validation** (code, message, nœud concerné) et reste en mode édition ;
   - si elle réussit, reviens en mode lecture.
4. Bouton **Annuler** : abandonne le brouillon.

> Remarque : le canevas ne contient **aucun code spécial** pour ce sens. Il réagit à la commande `remplacer-document` exactement comme aux autres commandes, parce qu'il ne fait qu'observer le document. **C'est l'intérêt de l'architecture.**

### ✅ Vérification
- Change `"Valider"` en `"Envoyer"` dans le JSON et applique : le bouton du canevas change.
- **Ajoute un nœud à la main** dans le JSON. Choisis un identifiant, renseigne son `parentId` et ajoute son identifiant dans les `enfants` du parent. Applique : il apparaît dans le canevas et dans l'arbre.
- Ajoute un identifiant dans les `enfants` d'un `Texte` : l'erreur `ENFANTS_INTERDITS` s'affiche et le canevas **ne change pas**.
- Supprime une virgule : erreur de syntaxe, rien ne change.

---

## ÉTAPE 13 — Recette finale, nettoyage et journal (½ journée)

### Scénarios d'acceptation

Déroule-les dans l'ordre, et note le résultat (✅ / ❌) dans le journal :

| N° | Scénario | Résultat attendu |
|---|---|---|
| S1 | Ajouter un Bouton dans la racine | Nouveau nœud dans le JSON ; `racine.enfants` mis à jour |
| S2 | Modifier son libellé dans le panneau | JSON mis à jour à chaque frappe |
| S3 | Modifier un libellé dans le JSON + Appliquer | Canevas et arbre mis à jour |
| S4 | Ajouter un Texte à la main dans le JSON | Il apparaît dans le canevas |
| S5 | JSON invalide (règle du métamodèle **et** erreur de syntaxe) | Erreurs affichées ; document inchangé |
| S6 | Recharger la page | Document conservé |
| S7 | Supprimer un Conteneur qui a des enfants | Le nœud et tous ses descendants disparaissent du JSON |
| S8 | `pnpm typecheck`, `pnpm test` et `pnpm --filter editeur build` à la racine | Aucune erreur, tous les tests passent, l'éditeur se construit |
| S9 | Ajouter `import React from 'react'` dans un fichier du noyau | `pnpm typecheck` échoue (puis retirer la ligne) |

### Journal et mémoire
Rédige une page sur :
1. le schéma hexagonal avec **tes** fichiers ;
2. le circuit d'une commande (section 2) ;
3. les décisions D1 à D10 et leur justification ;
4. une capture de l'éditeur avec le JSON visible ;
5. ce qui t'a posé problème.

Cette page deviendra la première section du chapitre « Architecture » du mémoire.

Commit final avec une étiquette :
```bash
git tag tranche-1
```

---

## BONUS (si tu as du temps) — Annuler / rétablir

Grâce aux décisions D2 et D7, c'est presque gratuit : `EditeurApplicatif` garde une pile `passe` des **documents précédents** et une pile `futur`. Annuler revient à remettre le document précédent et à prévenir les abonnés. Ajoute `annuler()` et `retablir()` au port `ServiceEditeur`, teste-les, puis ajoute deux boutons et les raccourcis clavier Ctrl+Z / Ctrl+Y.

> Réfléchis : conserver des documents entiers est-il coûteux, alors que chaque document partage la plupart de ses nœuds avec le précédent ? (Réponse : non, grâce à l'immuabilité. Seules les références changent.)

---

## Et ensuite ?

La tranche 2 (décrite dans le document `02`) ajoutera : le déplacement de nœuds, le glisser-déposer et la validation par JSON Schema. La tranche 3 ajoutera les **premiers générateurs de code** (React et Vue), sous forme de nouveaux paquets du monodépôt **qui ne modifient pas le noyau**.
