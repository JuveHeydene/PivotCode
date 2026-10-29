# 07 — Journal de bord de la phase 2

> Ordre chronologique, 29 octobre 2026. Les problèmes sont numérotés `P2-xx`.
> Environnement : Node.js 24.12, pnpm 12.14, TypeScript 7.0.2, Vite 8.3, React 19.3 ; projets générés avec Vue 3.5.44 et @vitejs/plugin-vue 6.0.10.

---

## 1. Chronologie

### Préparation
1. Discussion des choix : mise en page relative au parent, palette, transformation déterministe ou IA, PIM, PSM, M2M, M2T. Ces échanges sont résumés dans [03](03-transformation-modele-vers-code.md).
2. Constat : un premier commit existe désormais sur `main`. Le dépôt était propre au départ de la phase.
3. Rédaction de [00-objectifs-et-bilan.md](00-objectifs-et-bilan.md) (objectifs O1 à O12) et de [01-guide-de-la-phase.md](01-guide-de-la-phase.md), **avant** toute ligne de code.

### Étape 1 — Catalogue enrichi
4. `min` et `max` sur la variante `nombre` de `DefinitionPropriete` ; vérification dans `verifierValeur` (D38).
5. 14 nouvelles propriétés réparties sur les 3 composants, toutes facultatives (D35, D36, D37). Constante `COULEURS` exportée par le noyau.
6. Tests : **4 échecs** (P2-01), corrigés. Nouveaux tests : bornes, nouvelles propriétés. **87 tests du noyau** passent.

### Étape 2 — `@plateforme/rendu-web`
7. Création du paquet : `palette.ts`, `element-web.ts`, `regles.ts`, `arbre-web.ts`, `css.ts`.
8. Décision en cours de route : les règles lisent les valeurs par défaut **dans le catalogue** (D40).
9. Le document de démonstration, d'abord écrit dans les tests, est **déplacé** dans `src/` pour être partagé (D52).
10. 17 tests, dont celui de **complétude**.

### Étape 3 — Canevas et aperçu
11. `Canevas.tsx` réécrit : il affiche l'arbre web avec `createElement` et ne contient plus aucun nom de composant (D39, qui révise D29).
12. Mode « Aperçu » (D47). Règles CSS des boutons de l'éditeur restreintes (D48, problème P2-02).
13. Les 31 tests de l'éditeur passent sans modification.

### Étapes 4 et 5 — Générateurs
14. `generateur-react` : `jsx.ts` (imprimeur, échappement), `generer.ts` (projet complet). Le code produit est **relu** avant l'écriture des tests (problème P2-03 pour l'affichage). 18 tests.
15. `generateur-vue` : `template.ts`, `generer.ts`. Le texte est collé aux balises (D45). 14 tests. Couplage entre paquets retiré d'un test (P2-04).

### Étape 6 — Export dans l'éditeur
16. Ajout de `fflate`. Adaptateur `telechargement.ts` (D49). Boutons « Charger la démo », « Exporter React », « Exporter Vue ».
17. Messages d'erreur regroupés (P2-05). 7 nouveaux tests de l'éditeur : **38** au total.

### Étape 7 — Preuves
18. `recette/export.mjs` : premier lancement à **10/12**. Seules erreurs : un 404 dans la console des deux projets générés (P2-06). Après correction, **12/12**.
19. **Test du test** : sabotage volontaire du générateur Vue, puis 6 écarts détectés, puis restauration (D51).
20. La recette de la phase 1 a échoué **une fois** sur une capture (P2-07). Corrigée, puis lancée trois fois de suite : 11/11.
21. Captures faussées par l'essai de sabotage (P2-08), puis régénérées et vérifiées à l'œil.
22. Vérification de l'objectif O12 par `git diff` : seuls `composant.ts` (bornes), `composants-base.ts` (données) et `index.ts` (un export) ont changé dans le noyau.
23. Mesures : 73 µs pour générer un projet ; 6,6 s pour la recette d'export.

### Étape 8 — Documentation
24. Documents 02 à 09 de la phase, bilan, mise à jour de `reference/`, lignes « Évolutions ultérieures » de la phase 1, README général.

---

## 2. Problèmes rencontrés et corrections

### P2-01 — Quatre tests du noyau échouent après l'enrichissement du catalogue
- **Symptôme** :
  ```
  × contient seulement une racine Conteneur avec ses valeurs par défaut
  × ajoute un nœud à la fin, avec les valeurs par défaut
  × refuse : propriété inconnue
  × refuse une propriété inconnue
  ```
- **Cause** : deux tests vérifiaient les valeurs par défaut **exactes** des composants, qui ont changé. Les deux autres utilisaient `couleur` comme exemple de propriété **inconnue**… qui existe désormais.
- **Correction** : valeurs par défaut mises à jour ; l'exemple de propriété inconnue devient `clignotement`.
- **Leçon** : un test qui prend un exemple « qui n'existe pas » doit choisir un nom qui n'existera **jamais**. Les échecs étaient attendus, et ils montrent que les tests contrôlent bien le catalogue.

### P2-02 — Les styles de l'éditeur « fuyaient » dans le canevas (anticipé à la conception)
- **Risque** : la règle générale `button { border; background; border-radius; padding }` de l'éditeur s'appliquait aussi aux boutons **dessinés** dans le canevas. Le canevas n'aurait alors pas montré le même rendu que le code exporté.
- **Correction** : `button:not([data-noeud-id])` (D48). Les éléments du canevas reçoivent **tous** leurs styles des règles. La recette de parité le confirme.

### P2-03 — Un `console.log` dans un test n'apparaissait pas
- **Symptôme** : pour **lire** le code généré avant d'écrire les tests, j'ai affiché `genererApp(...)` avec `console.log` dans un test temporaire. La sortie filtrée était vide.
- **Cause** : Vitest regroupe la sortie console de chaque test, et mon filtre de texte ne la retrouvait pas.
- **Correction** : le test temporaire écrit le résultat dans un **fichier**, que j'ai lu, puis il a été supprimé.

### P2-04 — Un test Vue importait le générateur React par un chemin relatif
- **Symptôme** : `await import('../../generateur-react/src/index')` dans un test de `generateur-vue`.
- **Problème** : ce chemin contourne la déclaration des dépendances (pnpm), et il lie deux paquets qui doivent rester indépendants.
- **Correction** : le test compare directement avec `CSS_DE_BASE`, la **source commune**. Le même test existe côté React.

### P2-05 — Deux messages d'erreur pouvaient se superposer
- **Cause** : le message d'export et les erreurs de validation occupaient **la même cellule** de la grille CSS (`grid-area: messages`).
- **Correction** : un seul conteneur `messages`, qui empile les deux.

### P2-06 — Erreur 404 dans la console des projets générés
- **Symptôme** :
  ```
  ❌ React : console — Failed to load resource: the server responded with a status of 404 (Not Found)
  ❌ Vue : console — Failed to load resource: the server responded with a status of 404 (Not Found)
  ```
- **Cause** : sans icône déclarée, le navigateur demande automatiquement `/favicon.ico`, qui n'existe pas.
- **Correction** : `<link rel="icon" href="data:," />` dans le `index.html` généré : une icône vide, sans fichier (D50).
- **Leçon** : vérifier « aucune erreur dans la console » attrape aussi les défauts de **configuration** du projet généré, pas seulement ceux du code.

### P2-07 — Capture d'écran intermittente dans la recette de la phase 1
- **Symptôme**, une fois sur quatre lancements :
  ```
  ❌ S0 Démarrage … — page.screenshot: Protocol error (Page.captureScreenshot): Unable to capture screenshot
  ```
- **Cause** : la capture était demandée juste après un rechargement de page, avant que Chrome ait fini de dessiner. C'est une **concurrence** entre le script et le navigateur.
- **Première correction, fausse** : attendre que le JSON en lecture seule soit visible. Mais certaines captures sont prises pendant l'**édition** du JSON, quand cet élément n'existe pas. La recette est tombée à **5/11** : attente expirée après 30 s, puis échecs en cascade.
- **Correction finale** : attendre le **canevas** (toujours présent), puis retenter la capture une fois en cas d'échec. Trois lancements de suite : **11/11**.
- **Leçon** : une attente doit porter sur un élément **toujours** présent dans **tous** les états concernés.

### P2-08 — Captures faussées par l'essai de sabotage
- **Symptôme** : la capture de l'application Vue montrait un titre non centré, sans arrondi, et un bouton désactivé non atténué.
- **Cause** : le dernier lancement de la recette d'export était **l'essai de sabotage volontaire** (D51). Ses captures avaient remplacé les bonnes.
- **Correction** : relance avec le générateur restauré (12/12), puis vérification **visuelle** des trois captures (canevas, React, Vue).
- **Leçon** : regarder les images produites, et ne jamais laisser un essai de sabotage écrire dans les dossiers de référence. Amélioration possible : une variable d'environnement qui désactive les captures pendant ce genre d'essai.

### P2-09 — Espaces autour du texte en Vue (anticipé à la conception)
- **Risque** : en écrivant `<p …>` sur une ligne, puis le texte, puis `</p>`, le compilateur Vue garde des espaces au début et à la fin du texte. Le contenu du DOM ne serait alors plus identique à celui de React.
- **Correction** : en Vue, le texte est toujours **collé** aux balises (D45). La recette compare le texte de chaque élément : identique dans les trois rendus.

### P2-10 — Un zip n'est pas déterministe par défaut
- **Cause** : un fichier zip enregistre la **date** de chaque fichier. `fflate` utilise par défaut la date courante.
- **Correction** : date fixe (`mtime: 1er janvier 2000`). Test « mêmes fichiers ⇒ mêmes octets ».

---

## 3. Commandes d'installation de la phase

```bash
pnpm --filter @plateforme/rendu-web add "@plateforme/noyau@workspace:*"
pnpm --filter @plateforme/rendu-web add -D vitest
pnpm --filter @plateforme/generateur-react add "@plateforme/noyau@workspace:*" "@plateforme/rendu-web@workspace:*"
pnpm --filter @plateforme/generateur-react add -D vitest
pnpm --filter @plateforme/generateur-vue add "@plateforme/noyau@workspace:*" "@plateforme/rendu-web@workspace:*"
pnpm --filter @plateforme/generateur-vue add -D vitest
pnpm --filter @plateforme/editeur add "@plateforme/rendu-web@workspace:*" "@plateforme/generateur-react@workspace:*" "@plateforme/generateur-vue@workspace:*" fflate
```

Dans la recette, chaque projet généré est installé avec `pnpm install --ignore-workspace --prefer-offline`, dans un dossier temporaire **hors** du monodépôt :
- `--ignore-workspace` : le projet généré est autonome, il ne doit pas être rattaché à notre monodépôt ;
- `--prefer-offline` : réutiliser le cache pnpm quand c'est possible.
