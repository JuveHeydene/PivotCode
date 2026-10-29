# 04 — Journal de bord de la phase 4

> 29 octobre 2026. Problèmes numérotés `P4-xx`. Aucune nouvelle bibliothèque.

---

## 1. Chronologie

### Préparation
1. Question de l'auteur : « si JSON Schema n'arrive pas à exprimer quelque chose, pourra-t-on faire comprendre notre interface ailleurs ? » Réponse : oui, par la validation en deux couches. Piste évoquée : un format d'échange imbriqué.
2. Question suivante : « à plat contre imbriqué, quel est l'avantage ? Je croyais qu'à plat était plus structuré, parce qu'en imbriqué on peut se perdre. » Explication : les deux sont aussi structurés ; c'est au contraire le format à plat qui permet de « se perdre » (références cassées), et le format imbriqué qui l'interdit. Voir [02 §2](02-conception-et-theorie.md).
3. Décision de l'auteur : « ajoutons l'export imbriqué ». Le plan est consigné dans [01](01-guide-de-la-phase.md).

### Étapes 1 à 3 — Le paquet `format-imbrique`
4. `versImbrique`, `depuisImbrique`, `estFormatImbrique`. En relisant le code avant de lancer les tests, je trouve une erreur (P4-01).
5. 21 tests d'exemples et 3 tests par propriétés : tout passe du premier coup. **La mesure** montre pourtant que deux générateurs sont trop faibles (P4-02, P4-03). Je les corrige, puis je remesure (P4-04).

### Étape 4 — Le schéma imbriqué
6. `schemaProprietes` est extrait de `schemaComposant` pour être partagé ; ajout de `genererSchemaImbrique` ; second fichier publié.
7. 14 tests : schéma, 5 familles de limites, la seule limite restante, la tolérance, et deux tests par propriétés (conformité des exports, cohérence sur 1 000 corruptions). Répartition : 771 / 135 / 94 / **0 contradiction**.

### Étape 5 — L'éditeur
8. Panneau JSON : « À plat / Imbriqué », ⤓, import d'un document collé. 4 tests d'interface.
9. Recette Chrome : 3 nouveaux scénarios, 21/21. Sur les captures, deux défauts : un affichage (P4-05) et un lien d'erreur trompeur (P4-06).

### Étape 6 — Vérification et documentation
10. Vérification complète : typage, 279 tests, lint, construction, recette 21/21, recette d'export 12/12.
11. Documents de cette phase ; « Évolutions ultérieures » des phases 1 et 3 ; mise à jour de `reference/`.

---

## 2. Problèmes rencontrés et corrections

### P4-01 — Mon erreur : la chaîne vide comme marque de « pas d'identifiant »
- **Constat**, à la relecture avant les tests : pendant le parcours, j'avais noté un identifiant absent par `''`. Mais `"id": ""` est un identifiant **fourni** valide (un texte). Il aurait été pris pour un identifiant absent et remplacé en silence.
- **Correction** : `null` pour « pas encore d'identifiant », plus un indicateur `fabrique`, qui a servi ensuite pour P4-06.
- **Leçon** : ne jamais prendre comme marque une valeur que l'entrée peut légitimement contenir.

### P4-02 — Des documents aléatoires trop petits
- **Constat** : les tests d'aller-retour passaient, mais la mesure (D67) montrait des documents de **6,8 nœuds en moyenne**, et au plus 4 niveaux. C'est à peine plus que la démonstration de départ (7 nœuds).
- **Cause** : par défaut, fast-check **limite la taille** des tableaux générés (environ 10 éléments), même si l'on écrit `maxLength: 60`. Les suites de commandes étaient donc courtes. De plus, les suppressions retiraient des sous-arbres entiers.
- **Correction** : `size: 'max'`, au moins 5 commandes, plus d'ajouts (dont des conteneurs), moins de suppressions.
- **Résultat** : 9,8 nœuds en moyenne, **jusqu'à 25 nœuds et 7 niveaux**.

### P4-03 — Mon erreur : j'ai lu `freq` à l'envers
- **Constat** : le test de robustesse (« ne lève jamais d'exception ») passait, mais seulement **9 imports réussis sur 1 000**. Il n'explorait presque que des refus en surface.
- **Cause** : dans `fc.option(x, { freq: 5 })`, la probabilité d'obtenir **l'absence** est 1/5. Je pensais l'inverse. Les « propriétés quelconques » étaient donc présentes 4 fois sur 5, et la plupart des nœuds avaient une propriété inconnue.
- **Correction** : `fc.oneof` pondéré (4 contre 1 pour l'absence), moins de valeurs entièrement quelconques, et des propriétés obligatoires correctes par défaut.
- **Résultat** : **285 imports réussis sur 1 000**, et **9 codes d'erreur différents** atteints, dont `IDENTIFIANT_DEJA_UTILISE` (24 fois) et `ENFANTS_INTERDITS` (32 fois).

### P4-04 — Les mesures n'apparaissaient pas
- **Symptôme** : le `console.log` de mesure, placé dans un test, n'affichait rien.
- **Cause** : avec le rapporteur par défaut, Vitest n'affiche pas la sortie d'un test qui **réussit**.
- **Contournement** : un fichier de mesure **temporaire**, qui lève une erreur contenant les chiffres, lancé une fois puis **supprimé**. Les seuils qui comptent sont restés dans le vrai test de cohérence, sous forme d'assertions (au moins 100, 50 et 10 cas par catégorie).

### P4-05 — « À plat » sur deux lignes
- **Constat** sur la capture : dans le panneau JSON, assez étroit, le bouton « À plat » et le compteur « 5 nœud(s) » passaient sur deux lignes.
- **Correction** : `white-space: nowrap` et des boutons plus compacts dans cette ligne uniquement.

### P4-06 — Mon oubli : un lien « voir » qui pouvait montrer le mauvais nœud
- **Constat** sur la capture de P4-3 : une erreur d'import portait l'identifiant **fabriqué** `n5`, et le panneau proposait « voir ». Or l'éditeur contenait **déjà** un nœud `n5`, issu de l'import précédent. Ici c'était le même bouton, mais par **coïncidence** : dans un autre document, « voir » aurait sélectionné un nœud sans rapport.
- **Correction** : `depuisImbrique` retire l'identifiant d'une erreur quand il a été fabriqué, et garde le chemin dans le message. Un identifiant **fourni** est conservé, car il désigne bien le nœud que l'auteur a écrit. Un test a été ajouté.
- **Leçon** : un identifiant fabriqué n'a de sens qu'**à l'intérieur** du document qui l'a reçu.
