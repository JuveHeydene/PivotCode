# 09 — Visite guidée du code (ajouts et changements de la phase 2)

> Les fichiers de la phase 1 qui n'ont pas changé sont décrits dans [phase 1 › 10](../01-phase-1-modele-pivot-et-editeur/10-visite-guidee-du-code.md).

## 1. Nouveaux paquets

### `packages/rendu-web/` : les règles « modèle → web »

| Fichier | Contenu |
|---|---|
| `src/palette.ts` | `PALETTE` (nom de couleur → valeur CSS), `POLICE`, `CSS_DE_BASE` (la feuille commune des projets générés) |
| `src/element-web.ts` | Les types `ElementWeb` (balise, style, texte, désactivé) et `NoeudWeb` (avec identifiant et enfants) |
| `src/regles.ts` | **Le cœur de la phase** : la classe `Lecteur` (valeur du nœud, sinon valeur par défaut du catalogue), les tables de correspondance (`TAILLES`, `ALIGNEMENT`…), la table `regles` (une fonction par composant), `aUneRegle`, `decrireNoeud` |
| `src/arbre-web.ts` | `arbreWeb(document, catalogue, { inconnu })` : traduit tout le document, récursivement ; `ErreurRendu` |
| `src/css.ts` | `versNomCss` (camelCase → kebab-case), `styleEnLigne`, `nomDePaquet`, `echapperHtml` |
| `src/document-demonstration.ts` | Le document de démonstration (D52) |
| `test/rendu-web.test.ts` | 17 tests |

### `packages/generateur-react/`

| Fichier | Contenu |
|---|---|
| `src/jsx.ts` | L'imprimeur JSX : `chaineJs` (chaîne entre apostrophes, échappée), `texteJsx` (texte tel quel, ou expression `{"…"}`), `lignesJsx` (récursif, une ligne si ≤ 100 caractères, sinon un attribut par ligne) |
| `src/generer.ts` | `genererApp` (App.jsx), `genererProjetReact` (les 7 fichiers), `VERSIONS_REACT` |
| `test/generateur-react.test.ts` | 18 tests |

### `packages/generateur-vue/`

| Fichier | Contenu |
|---|---|
| `src/template.ts` | `texteVue` (entités HTML et accolades), `lignesTemplate` (texte collé aux balises) |
| `src/generer.ts` | `genererApp` (App.vue), `genererProjetVue`, `VERSIONS_VUE` |
| `test/generateur-vue.test.ts` | 14 tests |

## 2. Fichiers modifiés

| Fichier | Changement |
|---|---|
| `packages/noyau/src/domaine/composant.ts` | `min` / `max` sur la variante `nombre` ; contrôle dans `verifierValeur` |
| `packages/noyau/src/domaine/composants-base.ts` | `COULEURS`, constante partagée `marge`, 14 nouvelles propriétés |
| `packages/noyau/src/index.ts` | Exporte `COULEURS` |
| `apps/editeur/src/composants/Canevas.tsx` | **Réécrit** : affiche l'arbre web (`createElement`) ; modes édition et aperçu ; plus aucun nom de composant |
| `apps/editeur/src/Editeur.tsx` | `Catalogue` construit depuis `lireCatalogue()` ; état `apercu` ; boutons « Charger la démo », « Exporter React », « Exporter Vue » ; fonction `exporter` ; prop `telecharger` ; messages regroupés |
| `apps/editeur/src/editeur.css` | Règles des boutons restreintes à `button:not([data-noeud-id])` ; repères d'édition `.apercu-div` ; en-tête du canevas ; séparateur |
| `apps/editeur/src/adaptateurs/telechargement.ts` | **Nouveau** : `creerZip`, `telechargerZip`, types `FichierAExporter`, `Telecharger` |
| `apps/editeur/recette/export.mjs` | **Nouveau** : recette d'export et de parité |
| `apps/editeur/recette/recette.mjs` | Capture robuste (P2-07) |
| `package.json` (racine), `apps/editeur/package.json` | Script `recette:export` ; nouvelles dépendances |

## 3. Une exportation suivie à travers le code

**Action** : le document de démonstration est chargé ; l'utilisateur clique sur « ⤓ Exporter Vue ».

1. **`Editeur.tsx` → `exporter('vue')`** appelle `genererProjetVue(document, catalogue, { nom: 'Application générée' })`. `document` vient de `useDocument` ; `catalogue` est construit depuis `service.lireCatalogue()`.
2. **`generateur-vue/src/generer.ts` → `genererApp`** appelle `arbreWeb(document, catalogue, { inconnu: 'erreur' })`.
3. **`rendu-web/src/arbre-web.ts` → `traduire`**, récursivement depuis la racine `page` : pour chaque nœud, `decrireNoeud(noeud, catalogue)`.
4. **`rendu-web/src/regles.ts`**. Prenons le nœud `titre` (Texte) :
   - `new Lecteur(noeud, catalogue)` est créé ;
   - `l.texte('taille')` donne `'grand'` (présent dans le nœud), traduit par `TAILLES['grand']` en `'1.6rem'` ;
   - `l.nombre('marge')` : absent du nœud, donc défaut du catalogue `0`, donc `'0px'` ;
   - le résultat est `{ balise: 'p', texte: 'Créer un compte', style: { margin: '0px', fontSize: '1.6rem', fontWeight: '700', color: '#2f6fde', textAlign: 'center' } }`.
5. **Retour dans `generer.ts`** : `lignesTemplate(arbre, 1)` (`template.ts`) :
   - pour `titre`, `styleEnLigne(style)` donne `"margin: 0px; font-size: 1.6rem; …"` ;
   - la ligne dépasse 100 caractères, donc les attributs sont écrits un par ligne ;
   - le texte est collé : `>Créer un compte</p>` ;
   - pour `piege`, `texteVue` transforme `{{ x }}` en `&#123;&#123; x &#125;&#125;`.
6. **`genererProjetVue`** assemble les 7 fichiers ; `index.css` = `CSS_DE_BASE`.
7. **`Editeur.tsx`** appelle `telecharger('application-generee-vue', fichiers)`.
8. **`adaptateurs/telechargement.ts`** : `creerZip` range chaque fichier sous `application-generee-vue/…` avec la date fixe. `Blob`, URL temporaire, lien `<a download>`, clic : le navigateur télécharge le fichier.

Pendant tout ce trajet, **le noyau n'est pas appelé**. Le document a déjà été lu ; l'export ne fait que le **lire** et ne le modifie jamais.

## 4. Ajouter un 4ᵉ composant après la phase 2 (exemple : « Image »)

| Étape | Fichier | Effet |
|---|---|---|
| 1 | `noyau/src/domaine/composants-base.ts` : définition (propriétés `source`, `largeur`…) | Palette, panneau, arbre et validation : **automatiques** |
| 2 | `rendu-web/src/regles.ts` : une règle `Image: (l) => ({ balise: 'img', … })` | Canevas, React et Vue : **automatiques** |
| 3 | `rendu-web/src/element-web.ts` : ajouter `'img'` au type `Balise` (et un attribut `src`) ; dans les imprimeurs, traiter `<img>` comme un **élément vide** (pas de balise fermante en Vue) | Le compilateur signale une partie de ce qu'il reste à adapter ; la recette de parité vérifie le reste |

Sans l'étape 2, le test de complétude échoue : on ne peut pas oublier la règle.
