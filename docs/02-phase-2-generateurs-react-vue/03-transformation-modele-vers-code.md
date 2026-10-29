# 03 — Transformer le modèle pivot en code : principes et choix

> Ce document explique **comment** le modèle pivot devient du code React ou Vue, et **pourquoi** on a choisi une transformation **déterministe, par règles, sans IA**.
> Il reprend les explications données pendant la préparation de la phase, et les complète avec ce qui a été réellement construit.

---

## 1. Le vocabulaire de l'ingénierie des modèles

| Terme | Signification | Chez nous |
|---|---|---|
| **PIM** (*Platform-Independent Model*) | Un modèle qui ne dépend d'aucune technologie | **Le document pivot** : `Noeud`, `DocumentPivot`, le catalogue |
| **PSM** (*Platform-Specific Model*) | Un modèle propre à **une** technologie | Pas encore de PSM React ou Vue (voir §4). Mais un modèle commun **aux cibles web** : l'**arbre web** (§3) |
| **M2M** (*Model-to-Model*) | Transformer un modèle en un autre modèle | `arbreWeb()` : document pivot → arbre d'éléments web |
| **M2T** (*Model-to-Text*) | Transformer un modèle en texte (du code source) | `lignesJsx()` (React) et `lignesTemplate()` (Vue) : arbre web → texte |

---

## 2. Pourquoi une transformation **exacte** est possible

Le modèle pivot est **fermé** : il n'accepte que des éléments connus à l'avance (3 composants, des propriétés typées, des choix listés, des bornes). Le validateur refuse tout le reste.

On peut donc écrire, pour **chaque** élément possible, **une règle de traduction exacte**. La traduction est **complète par construction**, et un test le vérifie : « chaque composant du catalogue a une règle » (objectif O9).

C'est la situation d'un **compilateur** (TypeScript → JavaScript), pas celle d'une traduction entre langues humaines, où le vocabulaire est infini et ambigu.

---

## 3. Ce qui a été construit : une chaîne en deux étapes, dont la première est **commune**

```
                     DOCUMENT PIVOT (PIM)            + CATALOGUE (métamodèle M2 : valeurs par défaut)
                              │
                              │  M2M : arbreWeb()  — règles de correspondance (paquet @plateforme/rendu-web)
                              ▼
                     ARBRE WEB  (balise, styles CSS, texte, désactivé)  ← commun à TOUTES les cibles web
                ┌─────────────┼──────────────────────────┐
                ▼             ▼                          ▼
          CANEVAS        M2T : lignesJsx()          M2T : lignesTemplate()
       (createElement)   generateur-react           generateur-vue
                │             │                          │
                ▼             ▼                          ▼
          affichage      App.jsx + projet Vite      App.vue + projet Vite
```

### 3.1 Étape commune : document pivot → arbre web

Pour chaque composant, une **règle** (dans `packages/rendu-web/src/regles.ts`) produit un **élément web** :

| Nœud du modèle | Élément web produit |
|---|---|
| `Texte { contenu: 'Créer un compte', taille: 'grand', gras: true, couleur: 'primaire', alignementTexte: 'centre' }` | `{ balise: 'p', texte: 'Créer un compte', style: { margin: '0px', fontSize: '1.6rem', fontWeight: '700', color: '#2f6fde', textAlign: 'center' } }` |
| `Bouton { libelle: 'Valider', couleur: 'succes' }` | `{ balise: 'button', texte: 'Valider', style: { …, color: '#ffffff', backgroundColor: '#1f9d55', border: '1px solid #1f9d55', … } }` |
| `Conteneur { direction: 'ligne', justification: 'fin' }` | `{ balise: 'div', style: { display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', … } }` |

Une propriété **absente** du nœud prend la valeur par défaut du **catalogue**. Le générateur a besoin du métamodèle (M2) pour interpréter le modèle (M1). C'est ce qui permet aux documents de la phase 1, sans les nouvelles propriétés, de rester valides **et** d'être générés correctement.

### 3.2 Étape propre à chaque cible : arbre web → texte

Chaque générateur parcourt l'arbre web **récursivement** et écrit le texte dans **la syntaxe de sa cible** :

| Élément web | React (`App.jsx`) | Vue (`App.vue`) |
|---|---|---|
| balise | `<p …>` | `<p …>` |
| styles | `style={{ fontSize: '1.6rem', … }}` (objet JavaScript, camelCase) | `style="font-size: 1.6rem; …"` (chaîne CSS, kebab-case) |
| bouton désactivé | `disabled` | `disabled` |
| texte « sûr » | `Créer un compte` | `Créer un compte` |
| texte avec `< { } &` | `{"Texte <b>…"}` (expression JavaScript) | `Texte &lt;b&gt;…` (entités HTML, accolades comprises) |

### 3.3 Pourquoi cette étape commune ? (changement par rapport au plan)

Pendant la préparation, j'avais annoncé qu'on irait **directement** du modèle au texte, sans intermédiaire. En réalisant la phase, un fait est apparu : **trois** consommateurs ont besoin de **la même** traduction (le canevas, React et Vue). Écrire trois fois « direction ligne → flex-direction: row » produirait tôt ou tard trois résultats différents, et ce que l'on voit ne serait plus ce que l'on exporte.

On a donc extrait **une seule** table de règles, qui produit un modèle **web** commun. Ce n'est **pas** encore le PSM React ou Vue dont on avait parlé (celui qui collecte les imports et les variables avant d'écrire). C'est un niveau intermédiaire **partagé par toutes les cibles web**, et il garantit la **parité par construction** (décision D39).

---

## 4. Le PSM propre à chaque cible : toujours reporté, et pourquoi

Aujourd'hui, chaque élément se traduit **seul**, sans rien savoir des autres. On peut donc écrire le texte au fil du parcours.

Quand la **logique** arrivera (« ce bouton augmente un compteur »), il faudra écrire **en haut** du fichier des choses découvertes **plus bas** dans l'arbre : `import { useState }`, `const [compteur, setCompteur] = …` en React, un bloc `<script setup>` en Vue. Il faudra alors :
1. parcourir tout l'arbre et **remplir un brouillon** propre à la cible (le PSM : imports, variables, balises) ;
2. **puis** écrire le fichier dans le bon ordre.

Ce brouillon sera ajouté **dans la phase** qui introduira la logique.

---

## 5. Les propriétés de la transformation, et comment elles sont garanties

| Propriété | Moyen | Preuve |
|---|---|---|
| **Complète** : tout modèle valide peut être généré | Une règle par composant ; un composant sans règle provoque une erreur, jamais du code faux | Test de complétude ; tests « refuse un composant sans règle » |
| **Déterministe** : même modèle ⇒ même code, au caractère près | Aucune date, aucun hasard ; ordre des enfants respecté ; ordre des styles fixé par la règle ; versions des dépendances fixées ; date fixe dans le zip | Tests « est déterministe » (React, Vue, zip) |
| **Sûre** : un texte de l'utilisateur n'est jamais exécuté ou interprété | Échappement propre à chaque cible (§3.2) | Tests d'échappement ; le texte « piège » du document de démonstration s'affiche à l'identique dans les trois rendus |
| **Fidèle** : le code généré affiche ce que montre le canevas | Règles communes (§3.3) | Recette de parité : 7 éléments × 30 critères, dans un vrai Chrome |
| **Le code compile et démarre** | Projets Vite complets | Recette : installation, `vite build`, `vite preview`, aucune erreur console |

---

## 6. Pourquoi pas d'IA pour cette transformation

| Critère | Règles déterministes (notre choix) | IA (LLM) |
|---|---|---|
| Même entrée ⇒ même sortie | ✅ Toujours | ❌ Non garanti |
| Le code compile | ✅ Prouvé par les tests | ❌ Risque d'erreur ou d'hallucination |
| Coût et délai | ✅ Gratuit, quelques millisecondes | ❌ Payant, plusieurs secondes |
| Explicable dans un mémoire | ✅ Chaque règle est lisible | ❌ Boîte noire |

**Entraîner une IA à apprendre ces règles** remplacerait un algorithme **exact** par une **approximation** de cet algorithme. On perdrait en qualité, sans rien gagner. C'est d'ailleurs la limite L5 relevée dans l'étude de l'existant (« sortie de l'IA en code brut »).

**Où l'IA a sa place** : là où l'entrée est **ambiguë** et où les règles ne peuvent pas être écrites :
1. langage naturel → **modèle** (OG5), toujours validé par le noyau ;
2. l'agent de connexion composant ↔ API (OG4) ;
3. le sens inverse, du code écrit par un humain → modèle (l'import). Les générateurs déterministes pourront alors produire automatiquement des milliers de paires *(modèle, code)* : une fois inversées, elles formeront un **corpus d'entraînement parfaitement aligné**.

> **Modèle → code : règles, déterministe.**
> **Langage naturel ou code humain → modèle : IA, toujours vérifiée par le noyau.**

---

## 7. Lectures (citables dans le mémoire)

- Czarnecki K., Helsen S. (2006), *Feature-based survey of model transformation approaches*, IBM Systems Journal 45(3) : classification M2M / M2T.
- Brambilla M., Cabot J., Wimmer M., *Model-Driven Software Engineering in Practice* (2ᵉ éd., 2017) : chapitres sur les transformations modèle-vers-texte.
- Kleppe A., Warmer J., Bast W. (2003), *MDA Explained* : PIM, PSM, transformations.
- Builder.io, projet **Mitosis** : une représentation JSON des composants compilée vers plusieurs frameworks. C'est l'équivalent industriel de notre arbre web commun.
