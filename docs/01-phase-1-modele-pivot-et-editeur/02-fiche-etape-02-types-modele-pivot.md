# Étape 2 — Les types du modèle pivot : feuille de route

> Source : `Memoire_Juve_recherche/ref_files/conception_plateforme/03_tranche_1_editeur_et_modele_pivot.md`, ÉTAPE 2 (décisions D7, D8 ; vocabulaire section 2).
> Durée prévue : 1 journée. Tu écris le code toi-même ; cette fiche te dit dans quel ordre avancer et quoi lire.

---

## 0. Avant de commencer : finir l'étape 1

- [ ] Créer `.gitignore` (`node_modules`, `dist`) et faire le premier commit (point 10 de l'étape 1).
- [ ] Créer `journal.md` à la racine s'il n'existe pas, et y recopier le tableau des décisions D1–D10.

---

## 1. Ce que tu dois comprendre (dans cet ordre)

### 1.1 Le modèle pivot, c'est quoi ici ?
Un **document JSON** qui décrit l'interface d'une application sans aucune technologie (ni React, ni HTML).
Il contient :
- `versionMetamodele` : le numéro de version de la **forme** du document (ici `1`) ;
- `racineId` : l'identifiant du nœud racine ;
- `noeuds` : une **table** `identifiant → nœud`.

Chaque nœud dit : **quel composant** il est, ses **propriétés**, son **parent**, ses **enfants** (dans l'ordre, par identifiants).

### 1.2 Pourquoi « à plat » et pas imbriqué ? (décision D8)
Comparer les deux formes d'arbre :

```
Imbriqué :  { composant: 'Conteneur', enfants: [ { composant: 'Texte', … }, … ] }
À plat   :  { noeuds: { racine: { enfants: ['t1'] }, t1: { parentId: 'racine' } } }
```

| Question | Imbriqué | À plat |
|---|---|---|
| Trouver le nœud `b2` | parcourir tout l'arbre, O(n) | `noeuds['b2']`, O(1) |
| Trouver le parent de `b2` | il faut le chercher | `noeuds['b2'].parentId` |
| Déplacer un nœud | recopier des sous-arbres | changer deux identifiants |
| Risque | — | `parentId` et `enfants` peuvent se **contredire** |

C'est la question du journal à la fin (§4).

### 1.3 Pourquoi immuable ? (décision D7)
Chaque commande produira un **nouveau** document au lieu de modifier l'ancien. React compare les objets par **référence** : si tu modifies l'objet en place, React ne voit rien. Les types de cette étape doivent donc décrire des **données**, sans méthodes.

### 1.4 Où se place ce que tu écris ? (métamodélisation)
- **M2, métamodèle** : les **types** que tu écris aujourd'hui (`Noeud`, `DocumentPivot`), puis le catalogue (étape 3).
- **M1, modèle** : le document JSON que tu écris à la main dans le journal.
- **M0** : l'application réelle qui tournera un jour dans le navigateur.

Relis la section sur M0–M3 du document `01` (vers la ligne 245).

---

## 2. Ce que tu fais

### 2.1 Écrire les types : `packages/noyau/src/domaine/noeud.ts`

| Type | Contenu |
|---|---|
| `NoeudId` | alias de `string` |
| `ValeurPropriete` | `string`, `number` ou `boolean` (type **union**) |
| `Noeud` | `id`, `composant`, `proprietes` (dictionnaire nom → `ValeurPropriete`), `parentId` (`NoeudId` ou `null`), `enfants` (tableau de `NoeudId`) |
| `DocumentPivot` | `versionMetamodele` (le **nombre littéral** `1`, pas `number`), `racineId`, `noeuds` (dictionnaire `NoeudId` → `Noeud`) |

Points d'attention liés à ton `tsconfig.json` :
- **Pas d'`enum`** : `erasableSyntaxOnly` les interdit. Utilise des unions (`'a' | 'b'`).
- **`verbatimModuleSyntax`** : quand tu importes un type ailleurs, écris `import type { Noeud } from './noeud'`. Dans `index.ts`, utilise `export type { … } from './domaine/noeud'`.
- Utilise `Record<K, V>` pour les dictionnaires.
- **À trancher toi-même (fiche de décision possible)** : mettre ou non `readonly` sur les champs et `ReadonlyArray` / `readonly NoeudId[]` pour `enfants`, afin que le compilateur **empêche** les modifications en place (D7). Le guide ne l'impose pas. Note ton choix et ta raison dans le journal.

### 2.2 Exposer les types : `packages/noyau/src/index.ts`
- [ ] Exporter les quatre types.
- [ ] Garder `additionner` et `test/essai.test.ts` pour l'instant, sinon `pnpm test` ne trouvera plus aucun test. Tu les supprimeras à l'étape 3, quand tu auras un vrai test.

### 2.3 Écrire le document à la main dans `journal.md`, AVANT tout code
Représenter :

```
racine  Conteneur (colonne)
├── t1  Texte « Bienvenue »
└── c1  Conteneur (ligne)
    ├── b1  Bouton « Valider »
    └── b2  Bouton « Annuler »
```

Le début est donné dans l'indice du guide (`racine` et `t1`). Complète `c1`, `b1`, `b2`.
Propriétés à utiliser (elles annoncent le catalogue de l'étape 3) :
- Conteneur : `direction` (`colonne` / `ligne`), `espacement` (nombre) ;
- Texte : `contenu`, `taille` (`petit` / `moyen` / `grand`) ;
- Bouton : `libelle`, `variante` (`principal` / `secondaire`).

### 2.4 Bonus : faire vérifier la **forme** par le compilateur
Recopie ton document dans un fichier, par exemple `packages/noyau/test/exemple.ts`, sous la forme :

```ts
import type { DocumentPivot } from '../src/index';

export const exemple = { /* ton JSON */ } satisfies DocumentPivot;
```

Lance `pnpm typecheck`. Le compilateur vérifie la **forme** : un champ manquant, une faute de frappe ou `versionMetamodele: 2` donnent une erreur.
Il ne vérifie **pas** la **cohérence** (un enfant qui n'existe pas, un mauvais `parentId`). C'est le travail de `validerDocument()` à l'étape 4, et ce fichier te servira de jeu de test à ce moment-là.

---

## 3. ✅ Vérification

- [ ] `pnpm typecheck` passe.
- [ ] `pnpm test` passe toujours (`1 passed`).
- [ ] Dans ton document : chaque identifiant cité dans un `enfants` existe dans `noeuds`.
- [ ] Chaque nœud cité comme enfant a un `parentId` qui pointe vers ce parent.
- [ ] La racine est le seul nœud avec `parentId: null`, et `racineId` pointe vers elle.
- [ ] Les nœuds `Texte` et `Bouton` ont `enfants: []`.
- [ ] Chaque clé de `noeuds` est égale au champ `id` du nœud.

Note quelque part cette liste de règles : c'est **le cahier des charges** de `validerDocument()` (étape 4).

---

## 4. 📓 Journal

Réponds avec tes mots :
1. Pourquoi stocker `parentId` **et** `enfants`, alors que l'un se déduit de l'autre ? Qu'y gagne-t-on, quel risque cela crée-t-il, et **qui** garantit la cohérence ? (Piste : étapes 4 et 5.)
2. Pourquoi `parentId: null` et non un champ absent ou `undefined` ? (Piste : que devient `undefined` avec `JSON.stringify` ?)
3. Pourquoi `versionMetamodele` est-il le littéral `1` et pas `number` ? Que se passera-t-il le jour où la forme du document changera ?
4. Pourquoi `Record` (objet simple) plutôt que `Map` ? (Décision D8 : affichage et sérialisation JSON.)
5. `readonly` : l'as-tu utilisé ? Pourquoi ?

---

## 5. Notions à fouiller (y compris sur Internet)

### TypeScript (priorité haute, nécessaire pour cette étape)
| Notion | Où lire |
|---|---|
| Alias de type (`type X = …`), types union, types littéraux | Handbook, *Everyday Types* : https://www.typescriptlang.org/docs/handbook/2/everyday-types.html |
| Types objets, propriétés `readonly` et optionnelles (`?`) | Handbook, *Object Types* : https://www.typescriptlang.org/docs/handbook/2/objects.html |
| `Record<K, V>`, `Readonly<T>` | *Utility Types* : https://www.typescriptlang.org/docs/handbook/utility-types.html |
| `type` ou `interface` : différences | Handbook, *Everyday Types*, section « Differences Between Type Aliases and Interfaces » |
| `import type` / `export type` | Option `verbatimModuleSyntax` : https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax |
| Pourquoi pas d'`enum` | Option `erasableSyntaxOnly` : https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly |
| L'opérateur `satisfies` (bonus §2.4) | Notes de version 4.9 : https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html |
| `null` et `undefined`, option `strictNullChecks` | https://www.typescriptlang.org/tsconfig/#strictNullChecks |

### Structures de données (priorité moyenne)
| Notion | Mots-clés à chercher |
|---|---|
| Données normalisées (à plat) | « Redux normalizing state shape » : https://redux.js.org/usage/structuring-reducers/normalizing-state-shape |
| Représenter un arbre | « adjacency list tree », « parent pointer tree » |
| Immuabilité et égalité par référence | « immutability JavaScript », « React state immutability » : https://react.dev/learn/updating-objects-in-state |
| Sérialisation JSON | https://www.json.org/json-fr.html ; le comportement de `JSON.stringify` avec `undefined` sur MDN |

### Ingénierie dirigée par les modèles (pour le mémoire)
| Notion | Mots-clés à chercher |
|---|---|
| Niveaux M0 à M3 | « OMG MOF four-layer metamodel architecture », « metamodeling M0 M1 M2 M3 » |
| Modèle pivot, PIM / PSM | « Model Driven Architecture PIM PSM », « pivot model / intermediate representation » |
| Versionner un format de données | « schema versioning », « schema migration JSON documents » |
| Exemples réels de modèles d'interface en JSON | le format d'exportation de GrapesJS, Craft.js (`serialize`), la structure des pages dans Builder.io ou Plasmic : comparer avec ton choix « à plat » |

> Conseil : pour la partie TypeScript, lis le Handbook **avant** d'écrire `noeud.ts`. Les liens de la troisième section servent surtout à **justifier tes choix dans le mémoire**.
