# 08 — Journal de bord : ce qui a été fait, problèmes rencontrés, corrections

> Ordre chronologique, nuit du 19 au 20 octobre 2026.
> Environnement : Linux, **Node.js 24.12.0**, **pnpm 12.14.0**, **TypeScript 7.0.2**, Chrome et Firefox installés.

---

## 1. Chronologie

### Étape 1 — Monodépôt (fait plus tôt dans la soirée, avec toi)

- `pnpm-workspace.yaml` avec `apps/*` et `packages/*` ; TypeScript à la racine.
- Création de `packages/noyau/package.json` et `tsconfig.json`, installation de Vitest **dans le noyau seulement** : `pnpm --filter @plateforme/noyau add -D vitest`.
- Fonction bidon `additionner` et premier test : `1 passed`.
- Scripts racine `test`, `typecheck`, `dev`.

### Étapes 2 à 6 — Le noyau (sans une ligne de React)

1. **Étape 2** : `domaine/noeud.ts` (types du métamodèle). Le document d'exemple est écrit à la main dans `test/exemple.ts` avec `satisfies DocumentPivot`, et sa forme est vérifiée par le compilateur.
2. **Étape 3** : `domaine/composant.ts` (`Catalogue`, `verifierValeur`, `valeursParDefaut`) et `composants-base.ts` (Texte, Bouton, Conteneur).
3. **Étape 4** : `domaine/erreur.ts` et `domaine/validation.ts` (R1 à R8). Test : 41 tests au premier lancement, **tous verts**.
4. **Étape 5** : `domaine/document-initial.ts` et `domaine/commandes.ts` (4 commandes).
5. **Étape 6** : les ports, `EditeurApplicatif`, l'API publique `index.ts`, les doublures et les tests. **82 tests verts.**
6. Le test bidon `essai.test.ts` est supprimé : les vrais tests le remplacent.

### Étapes 7 et 8 — L'éditeur et le branchement

7. `pnpm create vite@latest editeur --template react-ts --no-interactive` dans `apps/` (problème P6).
8. Ménage : suppression de `App.tsx`, `App.css`, `index.css`, `assets/`, `public/icons.svg` et du `README.md` du gabarit.
9. Retrait de `typescript ~6.0.2` de l'éditeur et renommage en `@plateforme/editeur` (problème P5, D31).
10. `pnpm --filter @plateforme/editeur add "@plateforme/noyau@workspace:*"`.
11. Outils de test : `pnpm --filter @plateforme/editeur add -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/dom playwright-core`.
12. Adaptateurs `GenerateurUuid`, `DepotLocalStorage`, `useDocument`, et racine de composition `main.tsx`.

### Étapes 9 à 12 — L'interface

13. `outils-editeur.ts` (fonctions pures : `cibleAjout`, `resume`, `documentVide`, `documentExemple`).
14. `Canevas.tsx`, `Arbre.tsx`, `Palette.tsx`, `PanneauProprietes.tsx`, `VueModelePivot.tsx`, `Editeur.tsx` et `editeur.css`.
15. Port étendu : `executer` renvoie aussi les événements (D22). Les tests du noyau ont été adaptés.

### Étape 13 — Recette

16. Tests d'intégration de l'interface (jsdom) : 31 tests. **2 échecs au premier lancement** (problème P7), corrigés.
17. Recette dans un vrai Chrome (`recette/recette.mjs`) : **11/11 au premier lancement**, captures dans `docs/captures/`.
18. S9 (frontière de l'hexagone) vérifiée : `import React` et `document.title` dans le noyau font échouer `pnpm typecheck` avec les deux erreurs attendues.
19. Bonus annuler / rétablir : fait (D23).
20. Lint `oxlint` sans remarque, `pnpm build` OK, serveur `pnpm dev` vérifié.

---

## 2. Problèmes rencontrés et corrections

### P1 — Git n'a pas d'identité configurée
- **Symptôme** : `git config user.name` et `git config user.email` ne renvoient rien.
- **Conséquence** : `git commit` échouerait (« Please tell me who you are »).
- **Décision** : **je n'ai fait aucun commit**. Commiter sous un nom inventé aurait faussé l'historique de **ton** projet.
- **À faire par toi** (2 minutes) :
  ```bash
  cd ~/Lectures_\&_projects/Projets/platforme_no_and_low_code
  git config user.name "Ton Nom"
  git config user.email "adriel.salong@gmail.com"
  git branch -m master main          # facultatif : la branche principale attendue s'appelle « main »
  git add .
  git commit -m "Tranche 1 : noyau (métamodèle, validation, commandes), éditeur React, recette"
  git tag tranche-1
  ```
  Le `.gitignore` (`node_modules`, `dist`, `*.tsbuildinfo`, `.vite`) est déjà en place.

### P2 — `npx tsc` refuse de s'exécuter
- **Symptôme** :
  ```
  npm error code EBADDEVENGINES
  npm error EBADDEVENGINES Invalid name "pnpm" does not match "npm" for "packageManager"
  ```
- **Cause** : le `package.json` racine déclare `devEngines.packageManager = pnpm`. `npx` fait partie de **npm**, qui refuse donc de travailler dans ce projet.
- **Correction** : utiliser `pnpm exec tsc` ou les scripts `pnpm typecheck`. Le comportement est **voulu** : il empêche d'utiliser npm par erreur, ce qui casserait la garantie D4 (npm installe tout à plat, et le noyau pourrait alors importer React).

### P3 — `pnpm --filter @plateforme/noyau add -D vitest` ne trouvait aucun paquet (début de soirée)
- **Cause** : les points 5 et 6 de l'étape 1 (création de `packages/noyau/package.json`) n'avaient pas encore été faits.
- **Correction** : création des fichiers, puis relance de la commande.
- **Leçon** : `--filter` cherche par le champ `"name"` des `package.json` situés dans les dossiers déclarés par `pnpm-workspace.yaml`.

### P4 — `structuredClone` introuvable dans les tests du noyau
- **Symptôme** :
  ```
  test/doublures.ts(36,10): error TS2304: Cannot find name 'structuredClone'.
  ```
- **Cause** : le guide (étape 5) propose `structuredClone` pour copier un document. Mais `structuredClone` est une API **du navigateur et de Node**, pas du langage JavaScript (ECMAScript). Or le noyau est compilé avec `"lib": ["ES2022"]` et `"types": []` (D5), et ses tests sont dans le même `tsconfig`.
- **Correction** : la fonction `copieProfonde` fait un aller-retour JSON, `JSON.parse(JSON.stringify(x))`. Pour un document pivot, qui est **du JSON pur** par définition, la copie est **exacte**.
- **Leçon (bonne pour la soutenance)** : la protection D5 est **réelle**. Elle a même attrapé une API que le guide lui-même suggérait.

### P5 — Deux versions de TypeScript dans le monodépôt
- **Symptôme** : le gabarit Vite ajoute `"typescript": "~6.0.2"` dans l'éditeur, alors que la racine utilise `typescript 7.0.2`.
- **Risque** : deux compilateurs pourraient donner des résultats différents (options, messages, règles).
- **Correction** : la dépendance de l'éditeur est retirée. pnpm trouve `tsc` dans le `node_modules/.bin` de la racine. Vérifié : `pnpm exec tsc --version` → `Version 7.0.2` dans `apps/editeur`, et une erreur volontaire (`const x: number = "a"`) y est bien détectée (D31).

### P6 — `pnpm create vite` est interactif
- **Risque** : l'assistant de création pose des questions (installer maintenant ? lancer le serveur ?). Une commande automatisée resterait bloquée.
- **Correction** : option `--no-interactive` et entrée standard fermée (`</dev/null`). Le projet a été créé en 67 ms.

### P7 — Tests de l'interface : « plusieurs boutons nommés Annuler »
- **Symptôme** :
  ```
  TestingLibraryElementError: Found multiple elements with the role "button" and name "Annuler"
  ```
- **Cause** : **trois** boutons portaient le nom « Annuler » : (1) « ↶ Annuler » de la barre d'outils, (2) l'abandon du brouillon JSON, (3) le bouton « Annuler » **du document d'exemple**, rendu dans le canevas !
- **Correction** : le bouton du brouillon JSON s'appelle désormais **« Abandonner »**, et les tests ciblent « ↶ Annuler » exactement.
- **Leçon** : le test a révélé une **vraie ambiguïté d'ergonomie** (et d'accessibilité : un lecteur d'écran aurait annoncé trois « Annuler »). Ce n'était pas seulement un problème de test.

### P8 — Clés héritées et `__proto__` (trouvé en relisant, avant tout bug)
- **Risque** : un identifiant `"toString"` ou `"__proto__"` venu d'un JSON édité à la main pouvait :
  - faire croire qu'un nœud existe (`noeuds["toString"]` renvoie une fonction héritée) ;
  - ou, à l'affectation, **changer le prototype** de la table au lieu d'ajouter un nœud.
- **Correction** : `Object.hasOwn` partout via `trouverNoeud`, `Map` dans la validation et le catalogue, tables reconstruites avec `Object.fromEntries` ou des littéraux (D15). Deux tests le prouvent.

### P9 — Un bouton « désactivé » ne pouvait plus être sélectionné (trouvé en concevant)
- **Cause** : un `<button disabled>` HTML **ne déclenche pas** l'événement `click`.
- **Correction** : `aria-disabled` + style atténué (D29).

### P10 — Le champ nombre « résistait » à la saisie (trouvé en concevant)
- **Cause** : effacer le champ donne `""`, donc `NaN`. La commande est refusée et le champ revient à l'ancienne valeur.
- **Correction** : brouillon local `ChampNombre` (D30). Testé : effacer puis taper « 24 ».

### P11 — Un identifiant généré pouvait écraser un nœud existant (trouvé en relisant)
- **Cause** : `{ ...noeuds, [id]: nouveau }` remplace sans prévenir si `id` existe déjà.
- **Correction** : vérification et erreur `IDENTIFIANT_DEJA_UTILISE` (D19), testée.

### P12 — Messages « Tarball download average speed … is below 50 KiB/s »
- **Nature** : simple **avertissement** de pnpm (connexion lente pendant certains téléchargements). Sans conséquence : toutes les installations se sont terminées (`Done in …`).

### P13 — Vérifier le serveur de développement sans attendre « à l'aveugle »
- **Problème** : juste après `pnpm dev`, le serveur n'écoute pas encore, et un premier `curl` échoue.
- **Correction** : `curl --retry 15 --retry-connrefused --retry-delay 1`. Résultat : la page répond et Vite sert le noyau **directement depuis ses sources TypeScript** (`/@fs/.../packages/noyau/src/index.ts`), comme le prévoit le guide grâce au champ `exports`.

### Ce qui n'a **pas** posé de problème (à savoir quand même)
- **Aucun `sudo` n'a été nécessaire.** Tout s'installe dans le projet. La recette utilise le Chrome déjà installé (`/usr/bin/google-chrome`) via `playwright-core`, qui ne télécharge aucun navigateur.
- React 19.3, Vite 8.3, Vitest 5.0 et TypeScript 7.0 fonctionnent ensemble sans configuration particulière. Seul ajout dans `vite.config.ts` : la section `test` (environnement `jsdom`).

---

## 3. Commandes d'installation exécutées (récapitulatif)

```bash
# Étape 1 (début de soirée)
pnpm --filter @plateforme/noyau add -D vitest

# Étape 7
cd apps && pnpm create vite@latest editeur --template react-ts --no-interactive && cd ..
pnpm --filter @plateforme/editeur add "@plateforme/noyau@workspace:*"
pnpm --filter @plateforme/editeur add -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/dom playwright-core
```

## 4. Versions installées

| Paquet | Version | Rôle |
|---|---|---|
| typescript (racine) | 7.0.2 | Compilateur, partagé par tous les paquets |
| vitest (noyau, éditeur) | 5.0.5 | Tests |
| react, react-dom | 19.3.1 | Interface |
| vite | 8.3.4 | Serveur de développement et construction |
| @vitejs/plugin-react | 6.1.2 | JSX, rechargement à chaud |
| jsdom | 30.1.3 | DOM simulé pour les tests d'interface |
| @testing-library/react / user-event / dom | 16.3.3 / 14.6.8 / 10.4.2 | Piloter l'interface comme un utilisateur dans les tests |
| playwright-core | 1.64.1 | Piloter le vrai Chrome (recette) |
| oxlint | 1.88.0 | Lint (fourni par le gabarit Vite) |
| @types/react, @types/react-dom, @types/node | 19.3.0, 19.3.0, 24.19.2 | Types |
