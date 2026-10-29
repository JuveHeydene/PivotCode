# 06 — Visite guidée du code (ajouts et changements de la phase 4)

## 1. Nouveau paquet `packages/format-imbrique/`

| Fichier | Rôle |
|---|---|
| `src/format-imbrique.ts` | Types `DocumentImbrique`, `NoeudImbrique`, `OptionsExport`, `ResultatImport` ; constante `FORMAT_IMBRIQUE` ; **`versImbrique`**, **`depuisImbrique`**, `estFormatImbrique` ; fonction interne `chemin` |
| `src/index.ts` | L'API publique du paquet |
| `test/outils.ts` | Catalogue, `copie`, `serviceSur` (un vrai service sur une copie d'un document) |
| `test/conversion.test.ts` | 21 tests d'exemples |
| `test/proprietes.test.ts` | 3 tests par propriétés |

**Lecture commentée de `depuisImbrique`** :

```ts
// 0. Forme générale : { format: "pivot-imbrique", versionMetamodele: 1, racine: objet }, sinon FORME_INVALIDE.

// 1. Parcours en profondeur avec une pile, dans l'ordre de lecture.
const pile = [{ valeur: candidat.racine, parent: null, rang: 0 }];
while (pile.length > 0) {
  const { valeur, parent, rang } = pile.pop();
  // objet ? déjà vu (objet partagé ou circulaire) ? composant texte ? id, proprietes, enfants bien typés ?
  entrees.push({ valeur, parent, rang, id: id ?? null, fabrique: id === undefined, enfants: [] });
  if (parent !== null) entrees[parent].enfants[rang] = index;           // le lien parent → enfant vient de la POSITION
  for (let i = liste.length - 1; i >= 0; i--) pile.push({ valeur: liste[i], parent: index, rang: i }); // à l'envers : on lit dans l'ordre
}

// 2. Identifiants fournis uniques (sinon IDENTIFIANT_DEJA_UTILISE), puis fabrication n1, n2… en sautant ceux déjà pris.

// 3. Le document à plat : parentId et enfants sont CALCULÉS, donc cohérents par construction.
const noeuds = Object.fromEntries(entrees.map((e) => [e.id, { id: e.id, composant, proprietes, parentId: idDe(e.parent), enfants: e.enfants.map(idDe) }]));

// 4. validerDocument (R1 à R8). Chaque erreur reçoit son chemin ; un identifiant fabriqué est retiré.
```

## 2. `packages/schema-json/`

| Fichier | Changement |
|---|---|
| `src/generer-schema.ts` | `schemaProprietes` **extrait** de `schemaComposant` (partagé par les deux schémas) ; **`genererSchemaImbrique`**, `schemaComposantImbrique`, `IDENTIFIANT_SCHEMA_IMBRIQUE` ; commentaire d'en-tête mis à jour |
| `src/index.ts` | Exporte `genererSchemaImbrique` et `IDENTIFIANT_SCHEMA_IMBRIQUE` |
| `schema/document-imbrique.v1.schema.json` | **Nouveau** : le schéma publié (7,8 Ko) |
| `package.json` | Dépend de `@plateforme/format-imbrique` (pour la constante `FORMAT_IMBRIQUE`) |
| `test/outils.ts` | `schemaImbriqueAccepte`, `codesImport` |
| `test/imbrique.test.ts` | **Nouveau** : 14 tests |
| `test/fichier-publie.test.ts` | Vérifie les deux fichiers ; `pnpm --filter @plateforme/schema-json ecrire` régénère les deux |

## 3. Éditeur (`apps/editeur/`)

| Fichier | Changement |
|---|---|
| `src/composants/VueModelePivot.tsx` | État `format` (`'plat'` ou `'imbrique'`) ; boutons « À plat » et « Imbriqué » (`aria-pressed`) ; ⤓ (`aria-label` « Télécharger interface.….json ») ; `appliquer` : `estFormatImbrique` puis `depuisImbrique` avant `remplacer-document`. Nouvelles props : `catalogue`, `telechargerUnFichier` |
| `src/Editeur.tsx` | Passe `catalogue` et `telechargerUnFichier` au panneau JSON |
| `src/editeur.css` | `.choix-format` (boutons accolés, l'actif en couleur d'accent) ; ligne d'actions compacte et sans retour à la ligne (P4-05) |
| `src/Editeur.test.tsx` | 4 tests « Phase 4 » |
| `recette/recette.mjs` | Scénarios P4-1 à P4-3 ; vérification d'un vrai téléchargement (`waitForEvent('download')`) |
| `package.json` | Dépend de `@plateforme/format-imbrique` |

## 4. Un import suivi à travers le code

**Action** : l'utilisateur clique sur « Modifier », colle un document imbriqué **sans identifiants** (un conteneur, un bouton « Collé »), puis clique sur « Appliquer ».

1. **`VueModelePivot.appliquer`** fait `JSON.parse(brouillon)`. La syntaxe est correcte.
2. **`estFormatImbrique(valeur)`** est vrai (`format === "pivot-imbrique"`).
3. **`depuisImbrique(valeur, catalogue)`** :
   - parcours : 2 entrées, la racine (`parent: null`) et le bouton (`parent: 0, rang: 0`) ;
   - identifiants : aucun n'est fourni, donc la racine reçoit `n1` et le bouton `n2` ;
   - construction : `{ racineId: 'n1', noeuds: { n1: { …, parentId: null, enfants: ['n2'] }, n2: { …, parentId: 'n1', enfants: [] } } }` ;
   - `validerDocument` : aucune erreur, donc `{ succes: true, document }`.
4. **`service.executer({ type: 'remplacer-document', document })`** : le noyau **revalide** (D9), enregistre, range dans l'historique et prévient les abonnés.
5. React réaffiche le canevas (le bouton « Collé »), l'arbre et le JSON. **Ctrl+Z** revient au document précédent, sans aucun code propre au format imbriqué.

**Le noyau n'a pas été modifié.** Le format imbriqué est un adaptateur de plus autour du même modèle.
