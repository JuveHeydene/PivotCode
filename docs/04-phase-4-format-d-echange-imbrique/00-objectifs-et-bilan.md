# Phase 4 — Le format d'échange imbriqué : objectifs et bilan

| | |
|---|---|
| **Période** | 29 octobre 2026 (close le 29/10/2026) |
| **Origine** | Une question de l'auteur à la fin de la phase 3 : « si JSON Schema n'arrive pas à exprimer quelque chose, est-ce qu'on sera capable de faire comprendre notre interface ailleurs ? » La réponse a fait apparaître le choix « à plat contre imbriqué » (D8), puis la décision d'**ajouter** un format imbriqué pour l'échange. |
| **Correspond à** | Hors du plan d'origine : un **complément** de la phase 3 ([03 §4](../03-phase-3-deplacement-et-json-schema/03-json-schema-et-ses-limites.md)). Lot **P1** (métamodèle formel) de la [proposition de conception](../00-analyse-et-conception/02-proposition-de-conception-et-phases.md) |
| **Objectifs du projet servis** | **OQ2** (interopérabilité), OQ3 ; préparation directe de **OG4** et **OG5** : une IA produit plus sûrement un arbre qu'un annuaire sans référence cassée |
| **Plan suivi** | [01-guide-de-la-phase.md](01-guide-de-la-phase.md) |
| **Première décision de la phase** | D71 |

---

## 1. Objectifs de la phase (fixés au début)

### Objectif principal
> **Pouvoir échanger une interface sous une forme que JSON Schema sait vérifier presque entièrement, sans renoncer au format à plat qui sert à l'édition.**

### Objectifs détaillés

| N° | Objectif | Critère de réussite |
|---|---|---|
| O1 | **Conversion à plat → imbriqué** : chaque nœud contient ses enfants | Aucune référence entre nœuds dans le résultat (`parentId`, `racineId`, liste d'identifiants) |
| O2 | **Conversion imbriqué → à plat**, avec **validation complète** par le noyau | Tout document importé respecte R1 à R8 ; aucune exception, quelle que soit l'entrée |
| O3 | **Aller-retour exact** | à plat → imbriqué → à plat redonne **le même** document, sur des centaines de documents aléatoires |
| O4 | **Identifiants facultatifs** dans l'imbriqué | Un arbre sans aucun `id` s'importe ; les identifiants fabriqués sont prévisibles et n'entrent jamais en collision |
| O5 | **Un JSON Schema du format imbriqué**, produit à partir du catalogue et publié | Fichier publié, à jour (un test échoue sinon) |
| O6 | **Les limites de la phase 3 disparaissent** | Chacune des 6 limites est testée : impossible à écrire, ou refusée par le schéma |
| O7 | **Cohérence schéma imbriqué ↔ import** | 1 000 corruptions aléatoires : 0 contradiction ; seule différence permise : les identifiants en double |
| O8 | **Arbre très profond** | 50 000 niveaux, dans les deux sens, sans débordement de pile |
| O9 | **Dans l'éditeur** : voir, télécharger et coller le format imbriqué | Tests d'interface et recette Chrome |
| O10 | Aucune régression | Toutes les recettes précédentes passent |

---

## 2. Bilan

| N° | Atteint ? | Preuve |
|---|---|---|
| O1 | ✅ | Tests « à plat → imbriqué » : pas de `parentId`, pas d'`"enfants":[]` ; avec `{ ids: false }`, pas d'`id` |
| O2 | ✅ | `depuisImbrique` se termine par `validerDocument` ; 1 000 entrées aléatoires sans exception (285 imports réussis, 9 codes d'erreur différents atteints) |
| O3 | ✅ | 300 documents aléatoires (jusqu'à 25 nœuds et 7 niveaux) : égalité exacte après passage par du texte JSON ; 300 autres sans identifiants : même arbre |
| O4 | ✅ | `n1`, `n2`… dans l'ordre de lecture, en sautant ceux déjà pris (D72) ; recette P4-2 |
| O5 | ✅ | `genererSchemaImbrique` ; `schema/document-imbrique.v1.schema.json` (7,8 Ko) ; test « fichiers publiés » |
| O6 | ✅ | 5 tests, un par famille de limites ([02 §5](02-conception-et-theorie.md)) |
| O7 | ✅ | Lors d'une exécution : 771 refusés par les deux, 135 acceptés par les deux, 94 acceptés par le schéma mais refusés pour identifiant en double, **0 contradiction**. Des seuils vérifient que chaque catégorie est bien exercée |
| O8 | ✅ | Test des 50 000 niveaux, dans les deux sens |
| O9 | ✅ | 4 tests d'interface ; recette P4-1 à P4-3 dans Chrome, avec téléchargement réel |
| O10 | ✅ | Recette 21/21 (dont les 18 des phases 1 à 3) ; recette d'export 12/12, parité intacte |

**Chiffres** : 279 tests (236 avant), en 7 s environ ; recette Chrome 21/21 ; recette d'export 12/12 ; 8 décisions (D71 à D78) ; 6 problèmes consignés (P4-01 à P4-06, dont 3 erreurs de ma part, corrigées).

**Hors objectifs, mais fait** : les messages d'erreur d'import indiquent **où** est le problème (`racine.enfants[1].enfants[0]`). C'est indispensable dès que les identifiants sont absents.

**Reporté** : un bouton pour télécharger le **schéma** imbriqué depuis l'éditeur (il est dans le dépôt) ; l'export imbriqué **sans identifiants** depuis l'éditeur (la fonction l'offre déjà : `versImbrique(doc, { ids: false })`).

### Ce qu'il faut retenir de la phase en 5 phrases

1. **Les deux formes décrivent le même arbre.** « À plat » est un **annuaire** (rapide à modifier), « imbriqué » des **poupées russes** (impossibles à casser). On garde l'annuaire à l'intérieur et on échange en poupées russes.
2. Dans le format imbriqué, **il n'y a plus de référence entre nœuds**. Liens cassés, cycles, orphelins et racine absente deviennent **impossibles à écrire** en JSON.
3. JSON Schema vérifie donc **presque tout**. La **seule** règle globale qui reste est l'**unicité des identifiants**, et elle disparaît si on les omet.
4. L'import ne fait **jamais confiance** : conversion itérative, identifiants fabriqués de façon déterministe, puis validation complète par le noyau, avec des messages qui disent **où** est l'erreur.
5. Le noyau n'a pas changé d'une ligne : le nouveau format est un **adaptateur** de plus autour du même modèle.

---

## 3. Les documents de la phase, dans l'ordre de lecture

| N° | Document | Contenu | Temps |
|---|---|---|---|
| 01 | [01-guide-de-la-phase.md](01-guide-de-la-phase.md) | Le plan, en 6 étapes | 5 min |
| 02 | [02-conception-et-theorie.md](02-conception-et-theorie.md) | **À plat ou imbriqué**, le format, les algorithmes et leur complexité, le schéma récursif, les limites qui disparaissent, les patrons (4 diagrammes) | 25 min |
| 03 | [03-decisions.md](03-decisions.md) | D71 à D78, argumentées | 20 min |
| 04 | [04-journal-de-bord.md](04-journal-de-bord.md) | Chronologie et **6 problèmes** | 10 min |
| 05 | [05-tests-et-recette.md](05-tests-et-recette.md) | 279 tests, répartitions mesurées, 3 scénarios Chrome | 10 min |
| 06 | [06-visite-guidee-du-code.md](06-visite-guidee-du-code.md) | Fichiers ajoutés et modifiés ; un import suivi dans le code | 15 min |

Phase courte : les structures de données et les patrons sont regroupés dans le 02 au lieu d'avoir chacun leur fichier.

**Images de la phase (figées)** : [captures/](captures/) (vue imbriquée, import, erreur avec chemin) ; [diagrammes/](diagrammes/) (4 diagrammes, en `.png`, `.svg` et `.mmd`).

---

## 4. Évolutions ultérieures

> Cette section liste ce qui, réalisé dans cette phase, a été **révisé dans une phase suivante**. Le contenu de la phase n'est pas réécrit : on ajoute seulement un lien vers la phase où la révision est documentée.

| Élément de la phase 4 | Révisé en | Lien |
|---|---|---|
| *(aucune révision pour l'instant)* | | |
