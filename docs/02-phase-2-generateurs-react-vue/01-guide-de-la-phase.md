# 01 — Guide de la phase 2 : le plan prévu

> Ce document a été rédigé **avant** l'implémentation, le 29/10/2026. Il décrit le plan, pas ce qui s'est réellement passé : pour ça, voir le journal de bord.
> Les principes de la transformation (PIM, PSM, règles, pourquoi pas d'IA) sont expliqués dans [03-transformation-modele-vers-code.md](03-transformation-modele-vers-code.md).

---

## 0. Le but en une image

```
                 ┌──────────── même document pivot ────────────┐
                 ▼                       ▼                      ▼
             CANEVAS              GÉNÉRATEUR REACT        GÉNÉRATEUR VUE
          (affiche, éditeur)     (écrit App.jsx…)        (écrit App.vue…)
                 │                       │                      │
                 ▼                       ▼                      ▼
          ce que voit le         projet React qui         projet Vue qui
          concepteur             démarre                  démarre
                 └────────── doivent donner le MÊME résultat ───┘
```

---

## Étape 1 — Enrichir le catalogue : mise en page et style

**Objectif** : donner de quoi construire une interface qui ne soit pas « vide ».

- Ajouter des **bornes** aux propriétés de type `nombre` (`min`, `max` facultatifs) : une marge ne peut pas être négative.
- Ajouter les propriétés suivantes, toutes **facultatives** (pour que les documents de la phase 1 restent valides) :

| Composant | Propriétés ajoutées |
|---|---|
| Tous | `marge` (externe, px, ≥ 0) |
| Texte | `couleur` (palette), `gras`, `alignementTexte` (gauche / centre / droite) |
| Bouton | `couleur` (palette), `pleineLargeur` |
| Conteneur | `alignement` (début / centre / fin / étirer), `justification` (début / centre / fin / espacé), `margeInterne` (px), `fond` (aucun ou palette), `bordure`, `arrondi` (px) |

- **Palette fixe** de couleurs nommées (`primaire`, `secondaire`, `succes`, `danger`, `neutre`, `gris`, `clair`, `blanc`).

**Vérification** : les tests de la phase 1 passent toujours, après mise à jour de ceux qui vérifient les valeurs par défaut. Le document d'exemple de la phase 1 reste valide.

---

## Étape 2 — Un paquet de règles de rendu web partagé : `@plateforme/rendu-web`

**Objectif** : écrire **une seule fois** la correspondance « nœud du modèle → élément HTML + styles CSS ».

- `palette.ts` : les couleurs.
- `regles.ts` : pour chaque composant, une règle qui produit un **élément web** : balise, attributs, styles, texte.
- `arbreWeb(document)` : l'arbre complet des éléments web.
- Utilisé par **trois** consommateurs : le canevas, le générateur React et le générateur Vue. La parité devient vraie **par construction**.
- Test de **complétude** : chaque composant du catalogue a une règle.

---

## Étape 3 — Brancher le canevas sur ces règles, et ajouter un mode « Aperçu »

- Le canevas n'interprète plus le modèle lui-même : il affiche l'arbre web. Il **ne connaît plus aucun nom de composant**.
- Un bouton **« Aperçu »** masque les décorations d'édition (pointillés, contours, sélection) pour voir le rendu réel. Il servira aussi à la comparaison de parité.
- Les styles de l'éditeur ne doivent plus « fuir » dans le canevas (les règles CSS générales des boutons de l'éditeur, par exemple).

---

## Étape 4 — Générateur React : `@plateforme/generateur-react`

- Parcours de l'arbre web, écriture de JSX **indenté**, échappement des textes.
- Production d'un **projet complet** : `package.json`, `index.html`, `vite.config.js`, `src/main.jsx`, `src/App.jsx`, `src/index.css`, `README.md`.
- Tests : sortie exacte attendue sur un petit document ; **déterminisme** ; **échappement**.

---

## Étape 5 — Générateur Vue : `@plateforme/generateur-vue`

- Même structure, avec une autre table d'écriture : `<template>`, attribut `style="…"` en CSS, `src/App.vue`, `src/main.js`.
- Mêmes tests.

---

## Étape 6 — Export depuis l'éditeur

- Boutons « Exporter React » et « Exporter Vue » : le générateur produit les fichiers, et un **adaptateur de téléchargement** les emballe dans un `.zip`.

---

## Étape 7 — Preuves : construction et parité

Une recette automatisée :
1. charge un **document de démonstration** qui utilise toutes les propriétés, y compris des textes « pièges » (`<b>`, `{{ x }}`, `&`, guillemets) ;
2. exporte les deux projets **par les vrais boutons** de l'éditeur ;
3. les installe, les construit (`vite build`) et les lance ;
4. compare, élément par élément, **balise, texte et styles calculés** entre le canevas (en aperçu), l'application React et l'application Vue ;
5. enregistre des captures.

---

## Étape 8 — Documentation

Journal, décisions (à partir de D34), structures de données, patrons, tests, visite du code, bilan ; mise à jour de `reference/` ; lignes « Évolutions ultérieures » dans la phase 1.

---

## Hors périmètre (volontairement)

- **Plusieurs pages** et navigation : plus tard. Le générateur est écrit page par page pour l'accueillir.
- **La logique** (variables, événements) et donc le **PSM** intermédiaire propre à chaque cible : plus tard (voir [03](03-transformation-modele-vers-code.md) §4).
- **Les jetons de design modifiables** (thèmes) : la palette fixe en est le premier pas.
- Le glisser-déposer et le JSON Schema : phase 3.
