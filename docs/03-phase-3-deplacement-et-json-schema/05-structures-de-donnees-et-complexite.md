# 05 — Structures de données et complexité (ajouts de la phase 3)

> Notation : **n** = nombre de nœuds, **h** = profondeur de l'arbre, **k** = nombre d'enfants d'un parent, **c** = nombre de composants du catalogue, **P** = nombre total de propriétés déclarées.

## 1. La double liaison paie : détecter un cycle en O(h)

`estDansSousArbre(document, ancetreId, id)` **remonte** de `id` vers la racine en suivant les `parentId` :

```text
courant = nouveauParentId
tant que courant ≠ null :
    si courant = idDéplacé : cycle !
    courant = noeuds[courant].parentId        ← accès O(1) dans la table à plat
```

| Méthode | Coût |
|---|---|
| **Remonter** les `parentId` (notre choix, D54) | **O(h)** : au plus la profondeur de l'arbre |
| Parcourir le sous-arbre du nœud déplacé pour y chercher le nouveau parent | O(taille du sous-arbre), jusqu'à O(n) |

Sur une interface typique (n = 500 nœuds, h = 8 niveaux), on fait **8** pas au lieu de jusqu'à **500**. C'est la justification concrète de la redondance `parentId` + `enfants` décidée en phase 1 ([phase 1 › 04 §6](../01-phase-1-modele-pivot-et-editeur/04-metamodele.md)).

La boucle est **bornée** par n, au cas où un document corrompu contiendrait un cycle de `parentId`. Le service ne détient jamais un tel document, mais la fonction est aussi appelée par l'interface pendant un glissement.

## 2. Complexité de `deplacer-noeud`

| Étape | Coût |
|---|---|
| Recherches (nœud, parents, définition) | O(1) chacune |
| Contrôle de cycle | O(h) |
| Retrait de l'ancien parent, insertion dans le nouveau (`filter`, `slice`) | O(k) |
| Copie superficielle de la table `noeuds` (immuabilité, D7) | O(n) en références |
| **Total** | **O(n)**, dominé comme toujours par la copie de la table |

Seuls **4 objets** sont recréés : l'ancien parent, le nouveau parent, le nœud (son `parentId`) et la table. Le **sous-arbre** déplacé n'est **pas recopié** : ses nœuds sont partagés tels quels, car ils ne changent pas. Seul le lien de sa racine vers son parent change.

## 3. Le glisser-déposer : structures et coûts

| Opération | Coût | Remarque |
|---|---|---|
| `zoneDepot` | O(1) | Une division et deux comparaisons |
| `axeDesEnfants` | O(1) | Lecture de `direction` sur le parent |
| `cibleDepot` | O(k) | `filter` et `indexOf` dans les enfants du parent |
| `depotPermis` | O(h) | Le contrôle de cycle |
| **Un événement `dragover`** | **O(k + h)** | Le navigateur en envoie des dizaines par seconde : le calcul doit rester **très léger**, d'où ces fonctions sans parcours complet |

L'état du glissement tient dans **deux petites valeurs** : `glisse` (ce qu'on déplace) et `survol` (l'élément, la zone et l'axe). Le réaffichage n'a lieu que si l'un des deux **change** : on compare l'élément survolé et sa zone avant d'appeler `setSurvol`.

## 4. Le JSON Schema

| Opération | Coût |
|---|---|
| `genererSchemaJson(catalogue)` | **O(c + P)** : un passage sur chaque composant et chaque propriété |
| Taille du schéma | O(c + P) : 8,8 Ko aujourd'hui, pour 3 composants et 21 propriétés |
| Validation d'un document par Ajv | O(taille du document) × une constante liée au schéma. Ajv **compile** le schéma une fois en une fonction JavaScript spécialisée, puis chaque validation est rapide |

## 5. Les tests par propriétés : ordres de grandeur

| Test | Cas générés | Volume |
|---|---|---|
| Noyau : document toujours valide | 300 suites de 5 à 60 commandes | ≈ **3 600** commandes, chacune revalidée (compté le 29/10/2026) |
| Noyau : refus sans trace | 200 suites de 1 à 20 commandes | quelques milliers de commandes |
| Schéma : tout ce que produisent les commandes est conforme | 200 suites de 0 à 40 commandes | quelques milliers de commandes, chacune suivie d'une validation Ajv |
| Schéma ↔ noyau : cohérence sur documents corrompus | 1 000 documents | 1 000 × (Ajv + noyau) ; répartition mesurée dans [03 §6](03-json-schema-et-ses-limites.md) |

L'ensemble des 236 tests du projet (6 paquets) s'exécute en **6,9 s** (mesuré le 29/10/2026 avec `pnpm test`).
