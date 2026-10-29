# 09 — Visite guidée du code (ajouts et changements de la phase 3)

## 1. Noyau (`packages/noyau/`)

| Fichier | Changement |
|---|---|
| `src/domaine/noeud.ts` | **`estDansSousArbre(document, ancetreId, id)`** : remonte les `parentId` (O(profondeur), boucle bornée) |
| `src/domaine/erreur.ts` | Codes `RACINE_IMMOBILE`, `DEPLACEMENT_CYCLIQUE` |
| `src/domaine/commandes.ts` | Commande et événement de déplacement ; **`deplacerNoeud`** ; fonction `borner` partagée avec `ajouterNoeud` |
| `src/index.ts` | Exporte `estDansSousArbre` |
| `test/commandes.test.ts` | 13 tests de déplacement |
| `test/proprietes.test.ts` | **Nouveau** : tests par propriétés (générateur d'« intentions », document de départ riche, pondérations) |

**Lecture commentée de `deplacerNoeud`** :

```ts
// 1. Vérifications : existe ? racine ? nouveau parent ? accepte des enfants ? cycle ?
if (estDansSousArbre(document, id, nouveauParentId)) return echec(erreur('DEPLACEMENT_CYCLIQUE', …));

// 2. La position est comptée SANS le nœud déplacé
const memeParent = ancienParent.id === nouveauParent.id;
const sansLeNoeud = ancienParent.enfants.filter((enfantId) => enfantId !== id);
const base = memeParent ? sansLeNoeud : nouveauParent.enfants;
const index = borner(position, base.length);
if (memeParent && index === ancienIndex) return { succes: true, document, evenements: [] }; // rien ne change

// 3. Nouveau document : 1 objet recréé (même parent) ou 3 (changement de parent), plus la table
const enfants = [...base.slice(0, index), id, ...base.slice(index)];
const noeuds = memeParent
  ? { ...document.noeuds, [ancienParent.id]: { ...ancienParent, enfants } }
  : { ...document.noeuds,
      [ancienParent.id]: { ...ancienParent, enfants: sansLeNoeud },   // retiré de l'ancien
      [nouveauParent.id]: { ...nouveauParent, enfants },              // inséré dans le nouveau
      [id]: { ...noeud, parentId: nouveauParent.id } };               // la double liaison reste cohérente
```

## 2. Nouveau paquet `packages/schema-json/`

| Fichier | Rôle |
|---|---|
| `src/generer-schema.ts` | `genererSchemaJson(catalogue)`, `schemaComposant`, `schemaPropriete` ; constantes `DIALECTE`, `IDENTIFIANT_SCHEMA` |
| `schema/document-pivot.v1.schema.json` | **Le schéma publié** (8,8 Ko) |
| `tsconfig.json` / `tsconfig.test.json` | `src/` sans Node ; `test/` avec Node (D69) |
| `test/outils.ts` | Compilation Ajv (strict), fonctions `schemaAccepte` et `codesNoyau` |
| `test/schema.test.ts` | 21 tests, dont les **limites** |
| `test/coherence.test.ts` | Tests par propriétés de cohérence |
| `test/fichier-publie.test.ts` | Fichier à jour ; régénération avec `ECRIRE_SCHEMA=1` (script `ecrire`) |

## 3. Éditeur (`apps/editeur/`)

| Fichier | Changement |
|---|---|
| `src/glisser-deposer/regles-depot.ts` | **Nouveau**, fonctions pures : `zoneDepot`, `axeDesEnfants`, `cibleDepot`, `depotPermis`, types `Glisse`, `Zone`, `Axe` |
| `src/glisser-deposer/use-glisser-deposer.ts` | **Nouveau**, le hook : état `glisse` et `survol` ; `debuter`, `survoler`, `quitter`, `deposer`, `terminer`, `indication` |
| `src/composants/Palette.tsx` | Boutons `draggable` (création par glisser) |
| `src/composants/Canevas.tsx` | En édition : éléments `draggable` (sauf la racine), gestionnaires de survol et de dépôt, classe d'indication |
| `src/composants/Arbre.tsx` | Lignes `draggable`, `data-arbre-id`, gestionnaires et indication (contexte `'arbre'`, axe vertical) |
| `src/composants/PanneauProprietes.tsx` | Boutons « ↑ Monter », « ↓ Descendre », « Supprimer » regroupés |
| `src/Editeur.tsx` | `useGlisserDeposer` ; calcul du rang et de `deplacerDe(±1)` ; bouton « ⤓ JSON Schema » ; prop `telechargerUnFichier` |
| `src/adaptateurs/telechargement.ts` | `TelechargerFichier`, `telechargerFichier` |
| `src/editeur.css` | Indications `depot-avant-v/h`, `depot-apres-v/h`, `depot-dedans` (voile intérieur + pointillés) ; barre compacte |
| `recette/recette.mjs` | Scénarios P3-1 à P3-7 ; `glisser`, `glisserDansLaMarge` |

## 4. Un glisser-déposer suivi à travers le code

**Action** : l'utilisateur glisse « Bienvenue » (`t1`) du canevas et le relâche sur la marge intérieure du conteneur `c1`.

1. **`dragstart` sur `t1`** (`Canevas.tsx`) appelle `glisser.debuter({ type: 'deplacer', id: 't1' }, e)` : `stopPropagation`, `setData` pour Firefox, puis `setGlisse(…)`.
2. **`dragover` sur `c1`**, répété pendant le mouvement, appelle `glisser.survoler('c1', 'canevas', e)`, puis `calculer` :
   - `axeDesEnfants(document, 'racine')` donne `'vertical'` (la racine est en colonne) ;
   - `zoneDepot(rect de c1, souris, 'vertical', true)` donne `'dedans'` (souris au milieu de la hauteur) ;
   - `cibleDepot(document, 'c1', 'dedans', 't1')` donne `{ parentId: 'c1', position: 2 }` ;
   - `depotPermis(…, { deplacer t1 }, 'c1')` : `c1` accepte des enfants, et `estDansSousArbre(document, 't1', 'c1')` est faux, donc c'est permis.
   - Ensuite, `e.preventDefault()` autorise le dépôt ; `setSurvol({ c1, dedans })` ; React réaffiche `c1` avec la classe `depot-dedans`.
3. **`drop` sur `c1`** appelle `glisser.deposer('c1', 'canevas', e)` : nouveau calcul, `terminer()`, puis `executer({ type: 'deplacer-noeud', id: 't1', nouveauParentId: 'c1', position: 2 })`, puis `selectionner('t1')`.
4. **Le noyau**, comme pour toute commande : `deplacerNoeud` produit un nouveau document ; le service l'enregistre, le range dans l'historique et prévient React ; canevas, arbre et JSON se réaffichent.

**Le glisser-déposer n'a rien coûté au noyau** en dehors de la commande `deplacer-noeud`, qui sert aussi à « Monter / Descendre ». Annuler fonctionne sans aucun code supplémentaire.
