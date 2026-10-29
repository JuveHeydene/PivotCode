# Phase 2 — Mise en page, style et générateurs de code React et Vue : objectifs et bilan

| | |
|---|---|
| **Période** | 29 octobre 2026 (close le 29/10/2026) |
| **Correspond à** | Tranche **T3** du [guide de démarrage](../00-analyse-et-conception/03-guide-de-demarrage.md) (générateurs) et une partie de **T5** (styles). Lots **P2** (styles) et **P4 (début)** de la [proposition de conception](../00-analyse-et-conception/02-proposition-de-conception-et-phases.md) |
| **Changement d'ordre** | La tranche T2 prévue (glisser-déposer, déplacement, JSON Schema) devient la **phase 3**. Raison : la proposition de conception (§5.0) demande une tranche verticale qui va jusqu'à **un générateur** avant d'enrichir le métamodèle. C'est aussi la **contribution principale 1** du mémoire (OG2) |
| **Objectifs du projet servis** | **OG1**, **OG2**, OQ1, OQ4, OQ6 ([objectifs du projet](../00-analyse-et-conception/00-objectifs-du-projet.md)) |
| **Plan suivi** | [01-guide-de-la-phase.md](01-guide-de-la-phase.md) |
| **Première décision de la phase** | D34 (la phase 1 s'arrête à D32 ; D33 = restructuration de la documentation) |

---

## 1. Objectifs de la phase (fixés au début)

### Objectif principal
> **Exporter le même modèle pivot en un projet React et en un projet Vue qui démarrent et affichent exactement ce que montre le canevas.**

### Objectifs détaillés

| N° | Objectif | Critère de réussite |
|---|---|---|
| O1 | **Mise en page relative au parent** : alignement et justification des enfants d'un conteneur, marges internes et externes | Les nouvelles propriétés apparaissent dans le panneau **sans code d'interface supplémentaire**, et le canevas les applique |
| O2 | **Style** : couleurs (palette fixe), fond, bordure, arrondi, gras, alignement du texte, bouton pleine largeur | Idem |
| O3 | **Compatibilité ascendante** : les documents de la phase 1 restent valides | Le document d'exemple de la phase 1 est toujours valide ; `versionMetamodele` reste 1 |
| O4 | **Une seule source de règles de rendu web**, partagée par le canevas et les deux générateurs | Parité par construction ; le canevas ne contient plus aucun nom de composant |
| O5 | **Générateur React** : modèle → projet Vite + React complet | Le projet généré s'installe, se construit et démarre |
| O6 | **Générateur Vue** : modèle → projet Vite + Vue complet | Idem |
| O7 | **Transformation déterministe** | Même modèle ⇒ exactement le même code, au caractère près (test) |
| O8 | **Sûreté du code généré** : les textes de l'utilisateur (`<`, `{`, `{{`, `&`, guillemets…) apparaissent tels quels et ne sont jamais interprétés comme du code | Tests unitaires + démonstration dans le navigateur |
| O9 | **Complétude des règles** : chaque composant du catalogue a une règle de rendu | Test qui échoue si un composant n'a pas de règle |
| O10 | **Export depuis l'éditeur** : boutons « Exporter React » et « Exporter Vue » qui téléchargent un `.zip` | Recette dans Chrome |
| O11 | **Parité visuelle mesurée** : canevas, application React et application Vue donnent **le même résultat** | Recette : pour chaque élément, balise, texte et styles calculés identiques dans les trois rendus |
| O12 | **Le noyau n'est pas modifié dans sa structure** (`Noeud`, `DocumentPivot`, commandes, validation, service) | Revue des différences ; tous les tests de la phase 1 passent |

---

## 2. Bilan

| N° | Atteint ? | Preuve |
|---|---|---|
| O1 | ✅ | Alignement, répartition, marges interne et externe dans le catalogue ; apparus seuls dans le panneau ; appliqués par le canevas (tests de l'éditeur) |
| O2 | ✅ | Palette de 8 couleurs, fond, bordure, arrondi, gras, alignement du texte, pleine largeur (D36) |
| O3 | ✅ | Toutes les nouvelles propriétés sont facultatives ; `versionMetamodele` = 1 ; le document d'exemple de la phase 1 reste valide (D37, D40) |
| O4 | ✅ | `@plateforme/rendu-web` : une seule table de règles ; `Canevas.tsx` ne contient plus aucun nom de composant (D39) |
| O5 | ✅ | Recette : projet React installé, construit (`vite build`), lancé, sans erreur console |
| O6 | ✅ | Idem pour Vue |
| O7 | ✅ | Tests de déterminisme : React, Vue et zip |
| O8 | ✅ | 15 tests d'échappement ; texte piège `<b>… {{ x }} {y} & "…"` affiché à l'identique dans les 3 rendus |
| O9 | ✅ | Test de complétude des règles |
| O10 | ✅ | Boutons « ⤓ Exporter React » et « ⤓ Exporter Vue » ; vrais téléchargements dans la recette |
| O11 | ✅ | **Parité : 7 éléments × 30 critères, pour React et pour Vue** ; test du test (6 écarts détectés lors du sabotage) |
| O12 | ✅ | Noyau : seuls des **données** (catalogue), les bornes `min` / `max` et un export ajoutés. `Noeud`, `DocumentPivot`, commandes, validation et service : inchangés |

**Chiffres** : 174 tests automatisés (113 en fin de phase 1) ; recette de la phase 1 : 11/11 ; recette d'export : 12/12 ; 19 décisions (D34 à D52) ; 10 problèmes rencontrés et corrigés (P2-01 à P2-10) ; génération d'un projet en ≈ 73 µs.

**Hors objectifs, mais fait** : le mode « Aperçu » (D47), le bouton « Charger la démo », la mesure des temps.

**Écart avec le plan** : un intermédiaire **commun aux cibles web** (l'arbre web) a été introduit, alors que le plan annonçait une transformation directe. Raison et portée : [03 §3.3](03-transformation-modele-vers-code.md) et D39.

**Reporté** : plusieurs pages et navigation ; logique (variables, événements) et PSM propre à chaque cible ; jetons de design modifiables ; option TypeScript pour les projets générés ; glisser-déposer et JSON Schema (phase 3).

### Ce qu'il faut retenir de la phase en 5 phrases

1. Le même modèle pivot produit maintenant un **projet React** et un **projet Vue** qui **démarrent** et affichent **exactement** ce que montre le canevas : c'est mesuré, pas seulement affirmé.
2. La transformation est **déterministe, par règles, sans IA**. Le modèle est fermé, donc chaque élément a une règle exacte ; un test garantit qu'aucune ne manque.
3. Les règles « modèle → web » ne sont écrites **qu'une fois** (`rendu-web`) et sont partagées par le canevas et les deux générateurs. La parité est vraie **par construction**.
4. La mise en page est **relative au parent** (flexbox) et les couleurs viennent d'une **palette nommée**. Le code généré est propre et l'interface s'adapte à l'écran.
5. Le **noyau n'a pas changé de structure**. On a ajouté une fonctionnalité majeure en **ajoutant des paquets** autour de lui : c'est la preuve de l'extensibilité visée par l'architecture.

---

## 3. Les documents de la phase, dans l'ordre de lecture

| N° | Document | Contenu | Temps |
|---|---|---|---|
| 01 | [01-guide-de-la-phase.md](01-guide-de-la-phase.md) | Le plan **prévu** (rédigé avant le code) | 10 min |
| 02 | [02-conception-architecture.md](02-conception-architecture.md) | L'architecture de la phase : paquets, hexagone, classes, séquences, états, projet généré (7 diagrammes) | 25 min |
| 03 | [03-transformation-modele-vers-code.md](03-transformation-modele-vers-code.md) | **La théorie** : PIM, PSM, M2M, M2T, arbre web commun, déterminisme, sûreté, pourquoi pas d'IA | 25 min |
| 04 | [04-decisions.md](04-decisions.md) | Les décisions D34 à D52, argumentées | 35 min |
| 05 | [05-structures-de-donnees-et-complexite.md](05-structures-de-donnees-et-complexite.md) | Nouvelles structures, complexité, mesures | 15 min |
| 06 | [06-patrons-de-conception.md](06-patrons-de-conception.md) | Patrons ajoutés ou déplacés | 15 min |
| 07 | [07-journal-de-bord.md](07-journal-de-bord.md) | Chronologie et **10 problèmes avec leur correction** | 20 min |
| 08 | [08-tests-et-recette.md](08-tests-et-recette.md) | 174 tests, recette de parité, test du test, captures | 15 min |
| 09 | [09-visite-guidee-du-code.md](09-visite-guidee-du-code.md) | Nouveaux fichiers, fichiers modifiés, un export suivi à travers le code | 20 min |

**Images de la phase (figées)** :
- [captures/](captures/) : éditeur en édition et en aperçu, applications React et Vue générées ;
- [diagrammes/](diagrammes/) : les 7 diagrammes, chacun en `.png`, `.svg` et `.mmd`.

---

## 4. Évolutions ultérieures

> Cette section liste ce qui, réalisé dans cette phase, a été **révisé dans une phase suivante**. Le contenu de la phase n'est pas réécrit : on ajoute seulement un lien vers la phase où la révision est documentée.

| Élément de la phase 2 | Révisé en | Lien |
|---|---|---|
| *(aucune révision pour l'instant)* | | |
