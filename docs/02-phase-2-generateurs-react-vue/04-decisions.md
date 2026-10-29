# 04 — Registre des décisions de la phase 2 (D34 à D52)

> Format ADR : **contexte**, **décision**, **alternatives écartées**, **arguments**, **conséquences**, **où**, **preuve**.
> La numérotation continue celle du projet : la phase 1 s'arrête à D32, D33 est la restructuration de la documentation.

## Récapitulatif

| N° | Décision | Révise |
|---|---|---|
| D34 | Les générateurs avant le glisser-déposer | Ordre du guide de démarrage |
| D35 | Mise en page relative au parent (flexbox), pas de coordonnées absolues | — |
| D36 | Palette fixe de couleurs nommées | — |
| D37 | Nouvelles propriétés facultatives : compatibilité ascendante, version 1 conservée | — |
| D38 | Bornes `min` / `max` sur les propriétés nombre | — |
| D39 | Une représentation web commune (`rendu-web`) pour le canevas et les générateurs | **D29** (phase 1) |
| D40 | Les règles lisent les valeurs par défaut dans le catalogue | — |
| D41 | Styles en ligne dans le code généré | — |
| D42 | Générateurs = fonctions pures `document → fichiers` | — |
| D43 | Transformation déterministe, sans IA | — |
| D44 | Écriture du code par un « imprimeur » maison | — |
| D45 | Échappement propre à chaque cible ; texte collé aux balises en Vue | — |
| D46 | Composant sans règle : erreur (générateurs) ou encadré (canevas) | — |
| D47 | Mode « Aperçu » dans l'éditeur | — |
| D48 | Les styles de l'éditeur ne touchent plus les éléments du canevas | — |
| D49 | Export : adaptateur de téléchargement injecté, zip `fflate` à date fixe | — |
| D50 | Projets générés : Vite + JavaScript, versions fixées | — |
| D51 | Recette de parité sur les styles calculés, et preuve qu'elle détecte les écarts | — |
| D52 | Un document de démonstration partagé | — |

---

### D34 — Les générateurs avant le glisser-déposer
- **Contexte** : le guide de démarrage prévoyait la tranche T2 (glisser-déposer, JSON Schema) avant T3 (générateurs).
- **Décision** : la phase 2 réalise T3, les générateurs. T2 devient la phase 3.
- **Alternatives** : suivre l'ordre prévu.
- **Arguments** :
  1. la proposition de conception (§5.0) demande une tranche verticale qui va jusqu'à **un générateur**, pour valider le métamodèle avant qu'il ne coûte cher à modifier ;
  2. c'est la **contribution principale 1** du mémoire (OG2) ;
  3. annuler / rétablir, prévu en T2, était déjà fait.
- **Conséquences** : la correspondance phase ↔ tranche est notée dans [docs/README.md](../README.md) §4.

### D35 — Mise en page relative au parent (flexbox)
- **Contexte** : le rendu de la phase 1 était trop pauvre. Il manquait la notion de position.
- **Décision** : la position d'un élément est définie **par rapport à son parent** : `alignement` et `justification` du conteneur, marges interne et externe. Pas de coordonnées x / y.
- **Alternatives** : position absolue, comme les éditeurs « à la Paint ».
- **Arguments** : la position absolue casse sur un autre écran et génère du code qu'aucun développeur n'écrirait. Le modèle flexbox est celui des outils actuels (Figma *Auto Layout*, Webflow, FlutterFlow) et produit **du code propre**, ce qui est l'objectif OG2.
- **Où** : `composants-base.ts` ; règle `Conteneur` dans `rendu-web/src/regles.ts`.

### D36 — Palette fixe de couleurs nommées
- **Contexte** : il fallait choisir entre couleurs libres (`#2f6fde`) et palette.
- **Décision** : 8 couleurs **nommées** (`primaire`, `secondaire`, `succes`, `danger`, `neutre`, `gris`, `clair`, `blanc`). Le modèle stocke le **nom** ; la valeur CSS est dans `rendu-web/src/palette.ts`.
- **Alternatives** : (a) une couleur libre (texte `#rrggbb`) ; (b) des jetons de design modifiables par l'utilisateur (thèmes).
- **Arguments** :
  - une couleur libre demande de valider un format, et pousse à des interfaces incohérentes ;
  - un nom garde le modèle **indépendant de la valeur** : changer le bleu `primaire` change **toutes** les applications, dans le canevas comme dans le code généré ;
  - c'est le **premier pas** vers les jetons de design (b), prévus plus tard, qui rendront la palette modifiable.
- **Preuve** : test « chaque couleur du catalogue existe dans la palette ».

### D37 — Nouvelles propriétés facultatives : compatibilité ascendante
- **Contexte** : les documents enregistrés en phase 1 n'ont pas les nouvelles propriétés.
- **Décision** : toutes les propriétés ajoutées sont **facultatives**. `versionMetamodele` reste à **1**.
- **Arguments** : on a ajouté du **vocabulaire** (des données dans le catalogue), pas changé la **structure** (`Noeud`, `DocumentPivot`). C'est la séparation structure / vocabulaire de la phase 1 ([phase 1 › 04 §3](../01-phase-1-modele-pivot-et-editeur/04-metamodele.md)) qui le permet. Une propriété absente prend sa valeur par défaut (D40).
- **Preuve** : le document d'exemple de la phase 1 est toujours valide (tests) ; test « une propriété absente prend la valeur par défaut du catalogue ».

### D38 — Bornes `min` / `max` sur les propriétés nombre
- **Contexte** : une marge, un espacement ou un arrondi ne peuvent pas être négatifs.
- **Décision** : la variante `nombre` de `DefinitionPropriete` reçoit `min?` et `max?`, vérifiés par `verifierValeur`, donc à la fois par la validation et par la commande `modifier-propriete`.
- **Alternatives** : laisser passer les valeurs négatives (le CSS ignorerait un `padding` négatif, mais un `margin` négatif serait appliqué) ; vérifier dans l'interface seulement.
- **Arguments** : c'est une **règle du métamodèle**, elle doit donc vivre dans le noyau et s'appliquer à **toutes** les entrées (panneau, JSON, IA future).
- **Conséquences** : seule modification de **type** dans le noyau pendant cette phase. Le constructeur du `Catalogue` refuse une valeur par défaut hors bornes.
- **Preuve** : tests « refuse un nombre hors bornes », « nombre sous le minimum », « valeur par défaut hors des bornes ».

### D39 — Une représentation web commune : `@plateforme/rendu-web` *(révise D29)*
- **Contexte** : trois consommateurs (canevas, React, Vue) ont besoin de **la même** traduction « composant → HTML + CSS ». En phase 1, le canevas avait sa propre table `rendus` (D29).
- **Décision** : un paquet **partagé** contient l'**unique** table de règles. Elle produit un **élément web** neutre (balise, styles, texte, désactivé). Le canevas l'affiche ; les générateurs l'écrivent.
- **Alternatives** :
  - (a) une table par consommateur : trois copies qui divergeraient ;
  - (b) générer le code, puis l'exécuter dans le canevas : compliqué, lent et fragile ;
  - (c) aller directement du modèle au texte dans chaque générateur, comme annoncé lors de la préparation.
- **Arguments** : la **parité** entre ce qu'on voit et ce qu'on exporte devient vraie **par construction**, et non plus seulement par vérification. Le canevas ne connaît plus **aucun** nom de composant.
- **Écart avec le plan** : j'avais annoncé « pas d'intermédiaire ». Il y en a un, mais il est **commun aux cibles web**, et ce n'est pas le PSM React ou Vue (toujours reporté). Voir [03 §3.3](03-transformation-modele-vers-code.md).
- **Où** : `packages/rendu-web/` ; `apps/editeur/src/composants/Canevas.tsx`.
- **Preuve** : recette de parité (D51).

### D40 — Les règles lisent les valeurs par défaut dans le catalogue
- **Contexte** : un nœud peut ne pas avoir toutes ses propriétés (D37).
- **Décision** : la classe `Lecteur` renvoie la valeur du nœud, ou sinon la valeur par défaut **du catalogue**. Les fonctions de rendu et de génération reçoivent donc le catalogue en paramètre.
- **Alternatives** : recopier les valeurs par défaut dans les règles (deux sources qui divergeraient) ; « compléter » le document avant génération.
- **Arguments** : les valeurs par défaut n'existent qu'**à un seul endroit**. Conceptuellement, c'est juste : **interpréter un modèle (M1) demande son métamodèle (M2)**.
- **Conséquence** : l'éditeur construit un `Catalogue` à partir de `service.lireCatalogue()`.

### D41 — Styles en ligne dans le code généré
- **Décision** : les styles sont écrits **sur chaque élément** (`style={{…}}` en React, `style="…"` en Vue), et une petite feuille `index.css` contient la base commune (police, marges du `body`, `box-sizing`).
- **Alternatives** : (a) une classe CSS par élément dans une feuille séparée ; (b) des modules CSS ; (c) Tailwind.
- **Arguments** : pour cette première tranche, les styles en ligne donnent la **parité la plus simple à garantir** (aucune règle de cascade, aucune collision de noms de classes) et un code lisible élément par élément. (a), (b) et (c) demanderaient de **nommer** les styles, ce qui deviendra naturel avec les jetons de design.
- **Limite assumée** : un code plus verbeux que celui d'un développeur, avec des styles répétés.

### D42 — Générateurs = fonctions pures `document → fichiers`
- **Décision** : `genererProjetReact(document, catalogue, options)` renvoie une **liste** `{ chemin, contenu }`. Les générateurs n'écrivent sur aucun disque, ne zippent rien et ne connaissent pas le navigateur. Ils sont compilés **sans les types du navigateur**.
- **Arguments** : testables sans aucune mise en scène ; réutilisables tels quels côté serveur (intégration continue, API d'export) ; le zip et le téléchargement sont des **adaptateurs** (D49).

### D43 — Transformation déterministe, sans IA
- Voir [03 §6](03-transformation-modele-vers-code.md). Concrètement : aucune date ni aucun identifiant aléatoire dans la sortie, ordre stable, versions de dépendances **fixées** dans le générateur (D50), date fixe dans le zip (D49).
- **Preuve** : tests « est déterministe » (React, Vue, zip).

### D44 — Écriture du code par un « imprimeur » maison
- **Décision** : les fonctions `lignesJsx` et `lignesTemplate` écrivent le code ligne par ligne, indenté de 2 espaces. Une balise tient sur une ligne si elle fait au plus 100 caractères ; sinon, ses attributs sont écrits un par ligne, à la manière de Prettier.
- **Alternatives** : (a) un moteur de gabarits (Handlebars, EJS) ; (b) produire du code brut puis le passer à Prettier ; (c) construire un arbre syntaxique (AST) puis l'imprimer.
- **Arguments** : (a) gère mal l'indentation récursive ; (b) ajoute une dépendance lourde aux générateurs, qui ne pourraient plus être de petites fonctions pures ; (c) est surdimensionné tant qu'il n'y a pas de logique. L'imprimeur maison fait une soixantaine de lignes, il est déterministe et testé au caractère près.
- **Conséquence** : quand la logique arrivera, (c) redeviendra intéressant (avec le PSM).

### D45 — Échappement propre à chaque cible
- **React** : un texte qui contient `{ } < > &`, un retour à la ligne, ou des espaces au début ou à la fin, est écrit comme une **expression** `{"…"}` (chaîne JSON). Sinon, il est écrit tel quel, pour la lisibilité.
- **Vue** : entités HTML (`&amp; &lt; &gt; &quot;`) **et** accolades (`&#123; &#125;`). Ainsi, `{{ x }}` n'est jamais pris pour une interpolation.
- **Vue, en plus** : le texte est **collé** aux balises (`>texte</p>`). Avec des retours à la ligne autour, le compilateur Vue transformerait ces retours en espaces au début et à la fin du texte.
- **Preuve** : tests d'échappement ; dans Chrome, le texte « piège » `Texte <b>piège</b> {{ x }} {y} & "guillemets"` s'affiche **à l'identique** dans le canevas, React et Vue.

### D46 — Composant sans règle
- **Décision** : `arbreWeb(…, { inconnu })`. Avec `'erreur'` (générateurs), elle lève `ErreurRendu`, et l'éditeur affiche `EXPORT_IMPOSSIBLE`. Avec `'remplacer'` (canevas), elle affiche un encadré « Composant inconnu ».
- **Arguments** : mieux vaut **refuser** d'exporter que produire du code silencieusement incomplet. Le canevas, lui, doit rester utilisable pour corriger.
- **Preuve** : test de complétude (aucun composant du catalogue sans règle) ; tests « refuse un composant sans règle ».

### D47 — Mode « Aperçu » dans l'éditeur
- **Décision** : un bouton bascule le canevas entre **édition** (sélection, repères en pointillés, `aria-disabled`) et **aperçu** (rendu exact, aucune décoration, vrai `disabled`).
- **Arguments** : le concepteur voit **exactement** ce qu'il exportera. La recette de parité compare l'aperçu au code généré.
- **Où** : `Canevas.tsx` (prop `apercu`), `Editeur.tsx`.

### D48 — Les styles de l'éditeur ne touchent plus les éléments du canevas
- **Contexte** : la feuille de l'éditeur contenait une règle générale `button { … }` (bordure, fond, arrondi, survol). Elle s'appliquait **aussi** aux boutons dessinés dans le canevas.
- **Décision** : ces règles ciblent `button:not([data-noeud-id])`. Les éléments du canevas portent `data-noeud-id` et reçoivent **tous** leurs styles des règles de rendu.
- **Alternatives** : isoler le canevas dans un `<iframe>` ou un *Shadow DOM*. C'est plus étanche, mais nettement plus complexe (événements, sélection, mesures).

### D49 — Export : adaptateur de téléchargement injecté, zip `fflate` à date fixe
- **Décision** : `adaptateurs/telechargement.ts` fournit `creerZip` (fonction pure) et `telechargerZip` (navigateur). L'éditeur reçoit `telecharger` **en paramètre**, et les tests y injectent une fonction espion.
- **Alternatives** : (a) écrire un format zip à la main ; (b) JSZip, plus lourd ; (c) télécharger les fichiers un par un.
- **Arguments** : `fflate` est minuscule, sans dépendance et sous licence MIT. Une **date fixe** dans le zip donne les mêmes octets pour le même modèle, ce qui est vérifié par un test. L'injection suit la logique des ports de la phase 1.

### D50 — Projets générés : Vite + JavaScript, versions fixées
- **Décision** : un projet Vite minimal en **JavaScript** (pas en TypeScript), avec des versions de dépendances **écrites dans le générateur** (`VERSIONS_REACT`, `VERSIONS_VUE`) et une icône vide (`<link rel="icon" href="data:,">`).
- **Arguments** :
  - JavaScript : moins de fichiers de configuration, et le code reste compréhensible par plus de monde ;
  - versions fixées : le résultat ne dépend pas du jour de génération (déterminisme) ;
  - icône vide : sinon le navigateur réclame `/favicon.ico` et la console affiche une erreur 404 (problème P2-06).
- **Plus tard** : une option « TypeScript » ; une mise à jour des versions comme décision tracée.

### D51 — Recette de parité sur les styles calculés
- **Décision** : `apps/editeur/recette/export.mjs` compare, pour **chaque** élément, la balise, le texte (espaces normalisés), l'attribut `disabled` et **27 propriétés de style calculées par Chrome** (`getComputedStyle`), entre le canevas en aperçu et chaque application générée.
- **Alternatives** : comparer des captures pixel par pixel. C'est fragile : la largeur de la fenêtre et l'anticrénelage changent les pixels sans changer le rendu.
- **Exclusions justifiées** : largeurs et hauteurs, qui dépendent de la taille de la fenêtre, pas du modèle.
- **Preuve que le test est utile** : on a volontairement cassé le générateur Vue (dernier style de chaque élément supprimé). La recette a signalé **exactement** les 6 écarts attendus, puis le générateur a été restauré ([08 §3](08-tests-et-recette.md)).

### D52 — Un document de démonstration partagé
- **Décision** : `documentDemonstration`, exporté par `rendu-web`, utilise **toutes** les propriétés de style et contient un texte « piège ». Il sert aux tests des deux générateurs, au bouton « Charger la démo » et à la recette.
- **Argument** : une seule référence, qui exerce tout ce qui peut casser.
