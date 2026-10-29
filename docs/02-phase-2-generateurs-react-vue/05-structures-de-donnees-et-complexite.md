# 05 — Structures de données et complexité (ajouts de la phase 2)

> Les structures de la phase 1 sont décrites dans [phase 1 › 06](../01-phase-1-modele-pivot-et-editeur/06-structures-de-donnees-et-complexite.md). Elles n'ont pas changé.
> Notation : **n** = nombre de nœuds, **p** = nombre de propriétés d'un nœud, **s** = nombre de propriétés de style d'un élément (au plus 11 aujourd'hui), **L** = longueur totale du code produit.

## 1. Nouvelles structures

| Structure | Où | Pourquoi celle-ci | Alternative écartée |
|---|---|---|---|
| **Table de règles** `Record<composant, Regle>` (une règle = une fonction) | `rendu-web/src/regles.ts` | Choisir la règle d'un nœud en **O(1)** ; ajouter un composant = ajouter une entrée (patron Stratégie) | Une suite de `if / else` : O(nombre de composants), et l'algorithme est modifié à chaque ajout |
| **Tables de correspondance** `Record<valeur du modèle, valeur CSS>` (`TAILLES`, `ALIGNEMENT`, `JUSTIFICATION`, `PALETTE`…) | `regles.ts`, `palette.ts` | Traduction d'une valeur en **O(1)**, lisible comme un dictionnaire | `switch` : plus long, et mélange les données avec le code |
| **Objet de style ordonné** `StyleWeb` | `element-web.ts` | En JavaScript, les clés textuelles d'un objet gardent leur **ordre d'insertion**. L'ordre d'écriture du CSS est donc fixé par la règle, ce qui garantit le **déterminisme** | Une `Map` : même ordre, mais moins pratique à étaler (`...`) et à passer à React |
| **Arbre web** `NoeudWeb` (enfants **imbriqués**) | `element-web.ts`, `arbre-web.ts` | Les générateurs et le canevas parcourent l'arbre de haut en bas : l'imbrication est la forme la plus directe pour écrire du code imbriqué | La table à plat du modèle pivot : très bien pour **modifier** (O(1) par identifiant), mais ici on ne fait que **parcourir** |
| **Tableau de lignes** `string[]`, joint à la fin | `jsx.ts`, `template.ts`, `generer.ts` | Concaténer des chaînes dans une boucle peut coûter cher. Accumuler des lignes puis faire **un seul** `join('\n')` est linéaire | `code += …` à chaque ligne : souvent bien optimisé par les moteurs, mais moins prévisible |
| **Liste de fichiers** `{ chemin, contenu }[]` | sortie des générateurs | Neutre : ni disque, ni zip ; l'ordre est fixe, ce qui garantit le déterminisme | Un objet `{ chemin: contenu }` : convenable aussi, mais un tableau rend l'ordre explicite |

**Remarque sur le changement de forme** : le modèle pivot est stocké **à plat** (D8), parce qu'on le **modifie** par identifiant. L'arbre web est **imbriqué**, parce qu'on ne fait que le **parcourir** pour produire une sortie imbriquée (HTML, JSX). On choisit la structure selon **l'usage**, et la conversion de l'une à l'autre est un parcours en O(n).

## 2. Complexité

| Opération | Coût | Détail |
|---|---|---|
| `decrireNoeud` (un nœud) | **O(s)** | Une recherche O(1) dans la table de règles, puis la lecture de quelques propriétés. Chacune est en O(1) : `Object.hasOwn`, sinon `catalogue.trouverPropriete` |
| `arbreWeb` (tout le document) | **O(n · s)**, donc **O(n)** puisque s est borné | Chaque nœud est traduit une fois. Parcours **récursif** : la profondeur de la pile d'appels égale celle de l'arbre, qui reste faible pour une interface (quelques dizaines de niveaux). La validation, elle, reste itérative (phase 1) parce qu'elle doit accepter **n'importe quel** document |
| `lignesJsx` / `lignesTemplate` | **O(n · s)** pour produire les lignes, + **O(L)** pour le `join` final | Chaque nœud produit un nombre de lignes borné par s. L'indentation recrée une petite chaîne par ligne, d'où O(L) en tout |
| `genererProjetReact` / `genererProjetVue` | **O(n + L)** | Les autres fichiers ont une taille constante |
| `creerZip` | **O(L)** | Conversion UTF-8 et calcul du CRC-32 (somme de contrôle du format zip), sans compression coûteuse |
| Rendu du canevas | **O(n)** | `arbreWeb`, puis un `createElement` par nœud |

**Ordres de grandeur mesurés le 29/10/2026** (sur cette machine) :
- générer le **projet React complet** à partir du document de démonstration (7 nœuds) prend environ **73 µs**. C'est une moyenne sur 2 000 générations, après 200 générations d'échauffement ;
- toute la **recette d'export** (construction de l'éditeur, deux exports, installation et construction des deux projets, trois pages Chrome) prend environ **6,6 s**, avec les dépendances déjà dans le cache de pnpm. Un premier lancement est plus long, à cause du téléchargement des paquets. La génération elle-même est négligeable : tout le temps part dans l'installation et la construction Vite.

## 3. Une subtilité : la récursion dans `arbreWeb`

En phase 1, la validation a été écrite **sans récursion** (pile explicite) pour supporter un arbre de 50 000 niveaux venu d'un JSON quelconque. Ici, la récursion est **acceptable**, pour deux raisons :
1. `arbreWeb` ne reçoit que des documents **déjà validés** (sans cycle) ;
2. une page réelle a une profondeur de quelques dizaines de niveaux, très loin de la limite de la pile d'appels (environ 10 000).

C'est une décision **d'adéquation à l'usage**, pas un oubli. Si un jour des documents très profonds étaient générés automatiquement (par exemple par une IA), il faudrait passer à une pile explicite, comme dans la validation.
