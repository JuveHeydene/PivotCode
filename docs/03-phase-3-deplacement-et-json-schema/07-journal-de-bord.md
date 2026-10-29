# 07 — Journal de bord de la phase 3

> 29 octobre 2026. Problèmes numérotés `P3-xx`. Nouvelles bibliothèques : **fast-check 4.10.2** (MIT) et **Ajv 8.20.0** (MIT), toutes deux en dépendances de **test** uniquement.

---

## 1. Chronologie

### Préparation
1. Explication de la différence entre **document pivot** (M1) et **JSON Schema** (M2), puis entre notre **catalogue maison** et le **standard** JSON Schema.
2. Rédaction de [00-objectifs-et-bilan.md](00-objectifs-et-bilan.md) (O1 à O11) et de [01-guide-de-la-phase.md](01-guide-de-la-phase.md), avant le code.

### Étape 1 — `deplacer-noeud` (noyau)
3. `estDansSousArbre` dans `noeud.ts` ; codes `RACINE_IMMOBILE` et `DEPLACEMENT_CYCLIQUE` ; commande, événement, fonction `deplacerNoeud`. Factorisation de `borner` (position ramenée dans les limites), partagée avec `ajouterNoeud`.
4. 13 tests dédiés. Les 87 tests précédents passent sans modification.

### Étape 2 — Tests par propriétés (noyau)
5. Premier jet : les propriétés passent… mais la **mesure** montre que le test ne déplace presque rien (P3-02).
6. Amélioration du générateur, puis erreur de ma part dans le test (P3-03), corrigée. Résultat : 574 déplacements acceptés et 149 cycles refusés sur 300 suites aléatoires. **102 tests** dans le noyau.

### Étapes 3 et 4 — Monter / Descendre, glisser-déposer
7. `glisser-deposer/regles-depot.ts` (pur) et `use-glisser-deposer.ts` (hook).
8. Branchement sur la palette, le canevas et l'arbre ; boutons « ↑ Monter » et « ↓ Descendre » ; styles d'indication.
9. 15 tests des règles pures et 7 tests d'interface (jsdom).

### Étapes 5 et 6 — JSON Schema
10. Paquet `@plateforme/schema-json` ; décision d'un schéma **strict** et d'un noyau **tolérant** (D64).
11. Tests : schéma valide (Ajv strict), traduction, 10 violations refusées par les deux, **6 limites** testées une par une, champ en trop. Problème de typage des tests (P3-04).
12. Fichier publié et test « à jour » ; script `ecrire`.
13. Tests de cohérence par propriétés ; répartition mesurée : **845 / 104 / 51 / 0 contradiction**.
14. Bouton « ⤓ JSON Schema » dans l'éditeur, avec un script appliqué en deux fois (P3-05).

### Étape 7 — Recette dans Chrome
15. Sept scénarios de glisser-déposer réel : P3-6 échoue (P3-06), ce qui révèle que P3-1 et P3-2 passaient par coïncidence. Ciblage corrigé, puis **18/18** à deux reprises.
16. Script de diagnostic (P3-07). Barre d'outils trop chargée (P3-08).
17. Vérification complète : 0 erreur de typage ; **236 tests** en 6,9 s ; lint ; construction ; recette 18/18 ; recette d'export 12/12 (parité intacte).

---

## 2. Problèmes rencontrés et corrections

### P3-01 — `fc.infer` n'existe pas dans fast-check 4
- **Symptôme** : `error TS2694: Namespace 'fc' has no exported member 'infer'.`
- **Cause** : j'ai supposé une fonction de typage qui n'existe pas dans cette version.
- **Correction** : un **type conditionnel** TypeScript : `type Intention = typeof intention extends fc.Arbitrary<infer T> ? T : never`.

### P3-02 — Un test par propriétés qui ne testait presque rien
- **Constat** : le test passait. Mais en **comptant** les commandes générées, seuls **5 déplacements** sur ~340 étaient acceptés : presque tous visaient la **racine**, qui ne peut pas bouger.
- **Correction** : choisir l'élément à déplacer **hors de la racine** ; **pondérer** les intentions (plus de déplacements et d'ajouts, moins de suppressions) ; partir d'un **document riche**, avec des conteneurs imbriqués construits par des commandes.
- **Résultat** : **574** déplacements acceptés, **149** tentatives de cycle refusées.
- **Leçon** : un test vert ne suffit pas, il faut vérifier **ce qu'il exerce**. Cette mesure fait désormais partie de la méthode (D67).

### P3-03 — Mon erreur : une fonction de test qui s'appelait elle-même
- **Symptôme** : `RangeError: Maximum call stack size exceeded`, dans `documentDeDepart`.
- **Cause** : j'ai remplacé **toutes** les occurrences de `creerDocumentInitial(…)` par `documentDeDepart(…)`, y compris la première ligne **de `documentDeDepart` elle-même**.
- **Diagnostic** : fast-check a réduit le contre-exemple à **une seule** commande, et la pile d'appels pointait directement la ligne fautive.
- **Correction** : rétablir cette ligne. **Ce n'était pas un bug du noyau.**

### P3-04 — Les tests du schéma ont besoin de Node, le paquet ne l'a pas
- **Symptôme** : `error TS2591: Cannot find name 'node:fs'` (et `process`, `URL`).
- **Cause** : comme le noyau, le paquet est compilé sans types Node ni navigateur (D5). Le test qui lit le fichier publié a besoin de `node:fs`.
- **Correction** : `tsconfig.test.json` (avec les types Node) pour `test/`, tandis que `tsconfig.json` reste limité à `src/` (D69). On a vérifié qu'un `import 'node:fs'` dans `src/` est toujours refusé.

### P3-05 — Un script de modification appliqué à moitié
- **Symptôme** : le script de modification s'est arrêté avec une erreur d'assertion, après avoir déjà modifié `telechargement.ts`, mais pas `Editeur.tsx`.
- **Cause** : il cherchait les lignes d'import d'origine de `Editeur.tsx`, alors que j'avais inséré entre elles l'import du glisser-déposer.
- **Correction** : j'ai **vérifié l'état réel** des deux fichiers avant de reprendre, puis appliqué **seulement** la partie manquante, sans rien refaire en double.

### P3-06 — Recette : l'indication « dedans » n'apparaissait pas
- **Symptôme** : `❌ P3-6 … — indication « dedans » affichée`.
- **Diagnostic** (script temporaire) : le dépôt **réussissait** (3 enfants), mais aucune classe sur le conteneur visé.
- **Cause** : un conteneur **ajusté à son contenu** a un bouton **en son centre**. C'est le bouton qui recevait le survol, avec une indication « après ».
- **Conséquence importante** : P3-1 et P3-2 passaient **par coïncidence**, car déposer « après le dernier bouton » donne le même résultat que « à la fin du conteneur ».
- **Correction** : viser la **marge intérieure** du conteneur, la seule zone qui n'appartient qu'à lui. Les trois scénarios testent désormais vraiment le dépôt « dedans ».
- **Leçon** : une recette doit **discriminer**. Il faut choisir un cas où une mauvaise interprétation donnerait un **autre** résultat.

### P3-07 — Le script de diagnostic ne trouvait pas ses modules
- **Symptôme** : `ERR_MODULE_NOT_FOUND`.
- **Cause** : Node cherche `vite` et `playwright-core` à côté du script, qui était dans mon dossier temporaire.
- **Correction** : le lancer depuis `apps/editeur/recette/`, puis le **supprimer**.

### P3-08 — Barre d'outils sur deux lignes
- **Constat**, sur une capture : avec le bouton « ⤓ JSON Schema », le titre passait sur deux lignes et un bouton tombait à la ligne.
- **Correction** : titre sans retour à la ligne, boutons de la barre plus compacts.

### P3-09 — `dataTransfer` illisible pendant le survol (anticipé à la conception)
- Les navigateurs **cachent** les données glissées pendant `dragover` (mode protégé). L'objet glissé est donc gardé dans l'état React (D59). On écrit quand même un texte dans `dataTransfer`, pour Firefox.

### P3-10 — Limite non vérifiée : glisser un `<button>` dans Firefox
- Firefox a longtemps refusé de faire glisser des éléments `<button>`. La recette ne tourne que sous **Chrome**. C'est **non vérifié** pour Firefox, à tester avant d'affirmer la compatibilité.
