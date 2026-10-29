# 07 — Les patrons de conception utilisés

> Pour chaque patron : **le problème qu'il résout**, **où il est dans le code** (fichier et ligne), **comment le reconnaître**, et **pourquoi on l'a choisi**.
> GoF = *Gang of Four* (Gamma, Helm, Johnson, Vlissides, *Design Patterns*, 1994), le livre de référence.

## Tableau récapitulatif

| # | Patron | Famille | Où (principal) |
|---|---|---|---|
| 1 | Architecture hexagonale (Ports & Adaptateurs) | Architecture | tout le projet |
| 2 | Commande (sous forme de données) | GoF, comportemental (variante) | `domaine/commandes.ts` |
| 3 | Observateur | GoF, comportemental | `application/editeur-applicatif.ts` |
| 4 | Adaptateur | GoF, structurel | `apps/editeur/src/adaptateurs/*` |
| 5 | Injection de dépendances + racine de composition | Architecture | `main.tsx`, constructeur d'`EditeurApplicatif` |
| 6 | Stratégie (table de rendus) | GoF, comportemental | `composants/Canevas.tsx` |
| 7 | Interprète (de modèle) | GoF, comportemental (au sens large) | `composants/Canevas.tsx` |
| 8 | Composite | GoF, structurel | le métamodèle + `RenduNoeud`, `BrancheArbre` |
| 9 | Type Object | Johnson & Woolf, 1997 | `domaine/composant.ts`, `composants-base.ts` |
| 10 | Façade | GoF, structurel | `noyau/src/index.ts`, `ServiceEditeur` |
| 11 | Mémento / captures d'état (historique) | GoF, comportemental | `EditeurApplicatif.#passe/#futur` |
| 12 | Objet immuable + copie à l'écriture (partage structurel) | Programmation fonctionnelle | `domaine/commandes.ts` |
| 13 | Type Résultat (union discriminée) | Programmation fonctionnelle | `ResultatCommande`, `ResultatExecution` |
| 14 | Doublures de test (*Fake*) | Test (Meszaros) | `test/doublures.ts`, `Editeur.test.tsx` |
| 15 | Interface pilotée par les métadonnées | Ingénierie des modèles | `Palette.tsx`, `PanneauProprietes.tsx`, `resume()` |

---

## 1. Architecture hexagonale (Ports & Adaptateurs) — Cockburn, 2005

- **Problème** : un métier mêlé aux technologies devient impossible à tester et à faire évoluer. Changer React ou passer du `localStorage` à un serveur obligerait à tout réécrire.
- **Où** : `packages/noyau` (cœur) ; `application/ports/*.ts` (ports) ; `apps/editeur/src/adaptateurs/*` et `composants/*` (adaptateurs).
- **Reconnaître** : le cœur n'importe **aucune** technologie, et les interfaces (`ServiceEditeur`, `GenerateurIdentifiants`, `DepotDocument`) sont **définies par le cœur**.
- **Pourquoi** : c'est la condition pour que le modèle pivot soit vraiment indépendant. Les futurs adaptateurs (API HTTP, IA, générateurs) se brancheront **sans toucher au cœur**. Détails et diagramme : [03 §2](03-conception-architecture.md).

## 2. Commande, sous forme de données

- **Problème** : on veut que toutes les modifications passent par un point unique, qu'elles puissent être **journalisées, rejouées, envoyées sur le réseau, produites par une IA** et annulées.
- **Où** : type `Commande` dans `packages/noyau/src/domaine/commandes.ts:17`, interprété par `appliquerCommande` (ligne 38) via un `switch` qui délègue à une fonction par commande (`ajouterNoeud` ligne 56, `supprimerNoeud` ligne 95, `modifierPropriete` ligne 133, `remplacerDocument` ligne 164).
- **Variante par rapport au GoF** : dans le GoF, une commande est un **objet avec une méthode `execute()`**. Ici, c'est une **donnée pure** (`{ type: 'ajouter-noeud', parentId, composant }`) et l'exécution est **séparée** (`appliquerCommande`). On retrouve la même idée dans Redux, sous le nom d'« actions » et de « réducteur ».
- **Pourquoi** (D3) : une donnée se sérialise en JSON, une méthode non. Une IA peut **produire** une commande (texte JSON), pas une instance de classe.

## 3. Observateur (*Observer*)

- **Problème** : plusieurs parties de l'interface (canevas, arbre, JSON, panneau) doivent réagir aux changements du document, sans que le noyau les connaisse.
- **Où** : `EditeurApplicatif.abonner` (`editeur-applicatif.ts:91`) ajoute un écouteur au `Set #ecouteurs` (ligne 27). `#changer` les prévient tous après chaque changement. `abonner` **renvoie la fonction de désabonnement**.
- **Sujet** : `EditeurApplicatif`. **Observateurs** : la fonction de rappel de React créée par `useDocument`, et les écouteurs des tests.
- **Pourquoi** : c'est le seul moyen pour le cœur de **prévenir** l'extérieur sans dépendre de lui. Le noyau ne connaît qu'un type de fonction (`Ecouteur`).

## 4. Adaptateur (*Adapter*)

- **Problème** : une technologie a sa propre interface (`localStorage.getItem`, `crypto.randomUUID`, le modèle de rendu de React). Le cœur en attend une autre.
- **Où** :
  - `DepotLocalStorage` (`adaptateurs/depot-local-storage.ts:4`) adapte l'API `Storage` du navigateur au port `DepotDocument` ;
  - `GenerateurUuid` (`adaptateurs/generateur-uuid.ts:4`) adapte `crypto.randomUUID()` au port `GenerateurIdentifiants` ;
  - `useDocument` (`adaptateurs/use-document.ts:10`) adapte **l'Observateur du noyau** au **modèle de données externes de React** (`useSyncExternalStore`). C'est le pont entre deux façons de propager les changements.
- **Pourquoi** : c'est le rôle exact des « adaptateurs » de l'architecture hexagonale.

## 5. Injection de dépendances + racine de composition

- **Problème** : si `EditeurApplicatif` faisait lui-même `new DepotLocalStorage()`, il dépendrait du navigateur et serait intestable.
- **Où** :
  - **injection par constructeur** : `new EditeurApplicatif(catalogue, identifiants, depot)` reçoit des **interfaces** ;
  - **racine de composition** : `apps/editeur/src/main.tsx` est **le seul fichier** qui choisit les classes concrètes et fait les `new` ;
  - **injection par paramètre** dans le domaine : `appliquerCommande(…, nouvelId: () => NoeudId)`. Le domaine reçoit une simple **fonction**, ce qui est encore plus léger que le port, dont il ne dépend même pas ;
  - **injection par propriété React** : `<Editeur service={service} />`.
- **Pourquoi** : dans les tests, on injecte `GenerateurSequentiel` et `DepotMemoire` (patron 14). Le même code tourne avec d'autres implémentations, sans aucune modification.

## 6. Stratégie (table de rendus)

- **Problème** : afficher chaque composant différemment sans une longue chaîne de `if (composant === 'Bouton') … else if …`.
- **Où** : `const rendus: Record<string, (p) => ReactNode>` dans `composants/Canevas.tsx:26`. `RenduNoeud` choisit la stratégie avec `rendus[noeud.composant]`.
- **Autre exemple de stratégie** : `GenerateurIdentifiants`, qui produit des UUID ou des séquences selon l'implémentation injectée.
- **Pourquoi** : ajouter un composant revient à ajouter une entrée dans la table, sans modifier l'algorithme de parcours (principe ouvert / fermé, le « O » de SOLID). Les futurs générateurs de code auront la même structure.

## 7. Interprète de modèle

- **Problème** : transformer le modèle (M1) en quelque chose de concret (M0).
- **Où** : `Canevas` / `RenduNoeud` (`Canevas.tsx:67` et `:75`) **parcourent l'arbre** depuis la racine et **exécutent** une traduction pour chaque nœud.
- **Nuance** : le patron *Interpreter* du GoF porte sur une **grammaire**. Ici, on parle de l'**interprétation d'un modèle** au sens de l'IDM : on exécute le modèle directement au lieu de **générer** du code (voir [04 §8](04-metamodele.md)).
- **Pourquoi** : c'est le moyen le plus direct de voir le modèle « vivre ». C'est aussi le prototype des futurs générateurs.

## 8. Composite

- **Problème** : traiter **uniformément** un élément simple (Texte, Bouton) et un élément qui en contient d'autres (Conteneur).
- **Où** : dans le **métamodèle**, chaque `Noeud` a une liste `enfants` (vide pour une feuille). Dans l'**interface**, les composants **récursifs** `RenduNoeud` (canevas) et `BrancheArbre` (arbre) s'appellent eux-mêmes pour chaque enfant.
- **Particularité** : les enfants sont référencés **par identifiant** dans une table à plat (D8), et non contenus physiquement. C'est un Composite **normalisé**.

## 9. Type Object

- **Problème** : il existe plusieurs « sortes » de nœuds (Texte, Bouton, Conteneur…), mais on veut pouvoir en ajouter **sans créer de nouvelle classe** ni recompiler.
- **Où** : `DefinitionComposant` (`domaine/composant.ts:29`) **décrit un type**. Le catalogue (`composants-base.ts:5`) en contient les **instances**. Chaque `Noeud` **référence** son type par son nom (`composant: 'Bouton'`).
- **Pourquoi** : c'est ce qui rend le catalogue **extensible par des données** (la graine des plugins). C'est aussi la clé du « typage ontologique » expliqué en [04 §3](04-metamodele.md).

## 10. Façade

- **Problème** : le noyau contient une dizaine de fichiers. L'extérieur ne doit pas dépendre de son organisation interne.
- **Où** :
  - `packages/noyau/src/index.ts` est **l'unique point d'entrée** du paquet, imposé par le champ `"exports"` du `package.json`. Il choisit ce qui est public : par exemple, `appliquerCommande` n'est **pas** exportée ;
  - `ServiceEditeur` offre une interface **simple** (`executer`, `lireDocument`, `abonner`…) devant la mécanique interne (validation, commandes, historique, enregistrement).
- **Pourquoi** : on peut réorganiser l'intérieur du noyau sans casser l'éditeur.

## 11. Mémento / captures d'état (historique)

- **Problème** : annuler et rétablir.
- **Où** : `EditeurApplicatif.#passe` et `#futur` (ligne 31), deux piles de **documents entiers**. `executer` empile l'ancien document (ligne 61), et `annuler` / `retablir` dépilent.
- **Différence avec le Mémento du GoF** : dans le GoF, l'objet produit un « mémento » opaque de son état interne. Ici, l'état **est déjà** une valeur immuable : le document lui-même sert de mémento, sans copie.
- **Pourquoi** (D23) : grâce à l'immuabilité, une capture d'état coûte une **référence**. Les captures sont **toujours** correctes, contrairement aux commandes inverses.

## 12. Objet immuable et copie à l'écriture (partage structurel)

- **Problème** : savoir **rapidement** si quelque chose a changé, et ne jamais corrompre un état partagé (historique, React).
- **Où** : toutes les fonctions de `commandes.ts` construisent un nouveau document avec `{ ...document, noeuds: { ...document.noeuds, [id]: nouveau } }`. Les types `readonly` (D11) l'imposent à la compilation.
- **Partage structurel** : seuls les objets **sur le chemin du changement** sont recréés. Les autres nœuds sont **partagés**, ce qui est vérifié par le test « partage les nœuds non touchés ».
- **Pourquoi** (D7) : la détection du changement se fait en O(1) (`ancien !== nouveau`). C'est ce dont React a besoin, et ce qui rend l'historique presque gratuit.

## 13. Type Résultat (union discriminée)

- **Problème** : une commande peut échouer pour des raisons **prévues** (règle violée). Lever des exceptions pour cela rendrait le flux difficile à suivre et à typer.
- **Où** : `ResultatCommande` (`commandes.ts:30`) : `{ succes: true, document, evenements } | { succes: false, erreurs }`. Même forme pour `ResultatExecution` dans le port.
- **Pourquoi** : le compilateur **oblige** l'appelant à tester `succes` avant de lire `document`. On ne peut pas oublier le cas d'erreur. Les exceptions restent réservées aux **erreurs de programmation** (catalogue mal écrit, `#root` absent).

## 14. Doublures de test (*Test Doubles*, variante *Fake*) — Meszaros, *xUnit Test Patterns*, 2007

- **Problème** : tester le service sans navigateur, avec des résultats **reproductibles**.
- **Où** : `packages/noyau/test/doublures.ts` contient `GenerateurSequentiel` (`n1`, `n2`…) et `DepotMemoire` (stockage en mémoire **qui compte** les enregistrements). On retrouve des copies équivalentes dans `apps/editeur/src/Editeur.test.tsx`.
- **Pourquoi** : c'est la **démonstration concrète** que l'hexagone fonctionne. On remplace des adaptateurs réels par des adaptateurs de test **sans changer une ligne** du cœur (D10).

## 15. Interface pilotée par les métadonnées (*metadata-driven UI*)

- **Problème** : écrire à la main un formulaire par composant ne passe pas à l'échelle.
- **Où** :
  - `Palette.tsx` crée un bouton par entrée du catalogue ;
  - `PanneauProprietes.tsx` → `Champ` (ligne 42) choisit le **type de champ** selon `DefinitionPropriete.type` (`texte` → `<input>`, `nombre` → `ChampNombre`, `booleen` → case à cocher, `choix` → `<select>`) ;
  - `resume()` (`outils-editeur.ts:37`) affiche dans l'arbre la **première propriété de type texte**, quelle qu'elle soit.
- **Pourquoi** : la palette, le formulaire et l'arbre ne connaissent **aucun composant en dur**. Ajouter un composant ou une propriété les fait apparaître **automatiquement**. La propriété `desactive` (D26) l'a prouvé : sa case à cocher est apparue sans écrire de code d'interface.

---

## Idiomes TypeScript utilisés (à ne pas confondre avec des patrons)

| Idiome | Où | Rôle |
|---|---|---|
| **Gardes de type** (`x is string`) | `validation.ts:15-25` | Affiner un `unknown` en type précis après un test |
| **`satisfies`** | `test/exemple.ts` | Vérifier la forme d'un littéral sans perdre son type précis |
| **Champs privés `#`** | `Catalogue`, `EditeurApplicatif`, `DepotLocalStorage` | Encapsulation **réelle** à l'exécution (pas seulement à la compilation comme `private`), et compatible avec `erasableSyntaxOnly` |
| **`Extract<Commande, { type: 'x' }>`** | `commandes.ts` | Typer le paramètre de chaque fonction de commande à partir de l'union |
| **Type mappé `-readonly`** | `Modifiable<T>` dans `test/doublures.ts` | Retirer `readonly` dans les tests uniquement |
