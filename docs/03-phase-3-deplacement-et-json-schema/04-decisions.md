# 04 — Registre des décisions de la phase 3 (D53 à D70)

> Format ADR : contexte, décision, alternatives écartées, arguments, conséquences, où, preuve. La phase 2 s'arrête à D52.

## Récapitulatif

| N° | Décision |
|---|---|
| D53 | Commande `deplacer-noeud` : position comptée **sans** le nœud ; même place = même document |
| D54 | Détection de cycle en **remontant** les `parentId` : O(profondeur) ; requête `estDansSousArbre` exportée |
| D55 | Deux nouveaux codes d'erreur : `RACINE_IMMOBILE`, `DEPLACEMENT_CYCLIQUE` |
| D56 | Glisser-déposer avec l'API **native** HTML5, sans bibliothèque |
| D57 | Règles de dépôt en **fonctions pures**, séparées du hook React |
| D58 | Zones de dépôt : bords et milieu pour un conteneur, moitiés pour un élément simple ; axe selon le parent ; racine = dedans |
| D59 | L'objet glissé est gardé dans l'**état React**, pas lu dans `dataTransfer` |
| D60 | Dépôt interdit : aucun retour visuel, aucun dépôt ; le noyau refuse aussi (double protection) |
| D61 | Alternative sans souris : « Monter » et « Descendre » |
| D62 | Pas de glisser-déposer en mode aperçu |
| D63 | JSON Schema **produit automatiquement** à partir du catalogue, dans un paquet lecteur séparé |
| D64 | Schéma **strict** (forme canonique), noyau **tolérant** (principe de robustesse) |
| D65 | Un nœud = `oneOf` de définitions discriminées par `composant` (`const`) |
| D66 | Schéma publié dans un fichier versionné, vérifié par un test, régénéré par un script |
| D67 | Tests par propriétés (fast-check), avec **mesure de la répartition** des cas |
| D68 | Ajv seulement comme dépendance de **test** |
| D69 | Configuration de typage **séparée** pour les tests qui utilisent Node |
| D70 | Téléchargement du schéma par un adaptateur injecté |

---

### D53 — Commande `deplacer-noeud`
- **Contexte** : réorganiser une interface demandait jusqu'ici de supprimer puis de recréer, en perdant les propriétés et les identifiants.
- **Décision** : `{ type: 'deplacer-noeud', id, nouveauParentId, position? }`. La `position` est comptée **parmi les enfants du nouveau parent, sans le nœud déplacé**. Absente, elle vaut « à la fin » ; hors limites, elle est ramenée dans les limites. Si la place ne change pas, la commande renvoie **le même** document, sans événement (comme D18).
- **Alternatives** : (a) une position comptée **avec** le nœud, mais le sens d'un même nombre changerait selon que l'on reste ou non dans le même parent ; (b) supprimer puis ajouter, ce qui ferait perdre les propriétés, les identifiants et les descendants.
- **Arguments** : avec cette convention, « Monter » vaut `rang − 1` et « Descendre » vaut `rang + 1`, sans cas particulier. Le glisser-déposer calcule la position de la même manière (`cibleDepot`).
- **Preuve** : 13 tests dédiés, plus les tests par propriétés.

### D54 — Détection de cycle en remontant les `parentId`
- **Contexte** : déplacer un conteneur dans un de ses descendants créerait un cycle, et le document ne serait plus un arbre.
- **Décision** : `estDansSousArbre(document, ancetreId, id)` part du **nouveau parent** et **remonte** de parent en parent jusqu'à la racine. Si l'on rencontre le nœud déplacé, c'est un cycle. La boucle est bornée par le nombre de nœuds, par sécurité.
- **Alternative** : parcourir **tout le sous-arbre** du nœud déplacé pour y chercher le nouveau parent, ce qui coûte O(taille du sous-arbre).
- **Arguments** : **O(profondeur)**, en général bien plus petit. C'est le bénéfice direct de la **double liaison** `parentId` / `enfants` choisie en phase 1 (D8). La même fonction sert au noyau et à l'interface (D60).
- **Où** : `noyau/src/domaine/noeud.ts`, exportée par `index.ts`.

### D55 — Codes `RACINE_IMMOBILE` et `DEPLACEMENT_CYCLIQUE`
- Deux refus nouveaux, chacun avec un message en français. Ils complètent l'union `CodeErreur` (D21).

### D56 — Glisser-déposer avec l'API native HTML5
- **Alternatives** : `dnd-kit`, `react-dnd`, `@hello-pangea/dnd`.
- **Arguments** : aucune dépendance de plus ; l'API native suffit pour des dépôts dans des listes et des arbres ; le comportement est réel et testé dans Chrome (recette).
- **Limites assumées** : le glisser-déposer HTML5 ne fonctionne pas au **toucher** (tablette, téléphone) ; l'aperçu du glissement est celui du navigateur. Une bibliothèque deviendrait utile pour le tactile ou des animations, et ce serait une décision tracée.

### D57 — Règles de dépôt pures, séparées du hook
- **Décision** : `regles-depot.ts` (`zoneDepot`, `axeDesEnfants`, `cibleDepot`, `depotPermis`) ne connaît ni le DOM ni React. `use-glisser-deposer.ts` lit la souris et appelle ces fonctions.
- **Arguments** : la partie **intelligente** se teste sans navigateur (15 tests). Le hook reste mince. C'est le même découpage que le noyau et ses adaptateurs, appliqué **à l'intérieur** de l'éditeur.

### D58 — Les zones de dépôt
- **Conteneur** : premier quart = **avant**, dernier quart = **après**, milieu = **dedans**. **Élément simple** : première moitié = avant, seconde moitié = après.
- **Axe** : vertical si le parent est en colonne, horizontal s'il est en ligne. Dans l'arbre, toujours vertical.
- **Racine** : « avant » ou « après » la racine n'a pas de sens, donc on dépose dedans.
- **Constat de la recette** : un conteneur **ajusté à son contenu** a peu de surface libre ; pour déposer « dedans », il faut viser sa **marge intérieure**. C'est le comportement voulu : on dépose par rapport à ce qui est **sous** la souris. Une amélioration possible serait d'agrandir la zone « dedans » des conteneurs.

### D59 — L'objet glissé est gardé dans l'état React
- **Contexte** : pendant le survol (`dragover`), le navigateur **cache** le contenu de `dataTransfer` (« mode protégé », par sécurité). On ne peut donc pas savoir quoi déposer en le lisant à ce moment-là.
- **Décision** : `dragstart` mémorise l'objet glissé (`glisse`) dans l'état React. On écrit quand même un texte dans `dataTransfer`, car **Firefox exige** des données pour démarrer un glissement.
- **Conséquence** : on ne peut pas glisser depuis **une autre fenêtre** ou une autre application. Ce n'est pas un besoin aujourd'hui.

### D60 — Dépôt interdit : rien, et double protection
- **Décision** : si `depotPermis` répond non, le hook **n'appelle pas** `preventDefault()`. Le navigateur affiche alors le curseur « interdit », aucune indication n'apparaît, et un relâchement ne fait rien.
- **Double protection** : même si l'interface laissait passer un dépôt cyclique, la commande `deplacer-noeud` le **refuserait** (D54). La règle vit dans le noyau ; l'interface ne fait que l'**anticiper**, pour le confort.

### D61 — « Monter » et « Descendre »
- **Arguments** : le glisser-déposer n'est accessible ni au clavier ni aux lecteurs d'écran. Ces deux boutons offrent le même service et envoient **la même** commande `deplacer-noeud` (D53). Ils sont grisés quand c'est impossible : premier ou dernier élément, ou racine.

### D62 — Pas de glisser-déposer en aperçu
- L'aperçu montre le **rendu exact** (D47) : aucune poignée, aucun gestionnaire. Le canevas reçoit `glisser={apercu ? undefined : glisser}`.

### D63 — JSON Schema produit automatiquement, dans un paquet lecteur
- **Décision** : `@plateforme/schema-json` contient `genererSchemaJson(catalogue)`, une fonction **pure** et déterministe.
- **Alternatives** : (a) écrire le schéma à la main, ce qui créerait une **deuxième** source de vérité, qui dériverait ; (b) remplacer le catalogue par le schéma, mais notre format maison est plus pratique pour l'interface (libellés, valeurs par défaut typées) ; (c) mettre la fonction dans le noyau, qui grossirait sans nécessité.
- **Arguments** : une **seule** source (le catalogue), plusieurs **projections** (formulaire, validation, schéma). C'est le même principe que `rendu-web` pour l'affichage.

### D64 — Schéma strict, noyau tolérant
- **Décision** : le schéma interdit tout champ en trop (`additionalProperties: false`), y compris dans la structure. Le noyau continue de **tolérer puis retirer** les champs structurels en trop (D17).
- **Argument** : le principe de robustesse (Postel). Le schéma décrit ce que l'on veut que les producteurs (IA, outils) **produisent** : la forme canonique. Le noyau reste indulgent avec ce qu'il **reçoit**.
- **Preuve** : test « un champ structurel en trop : refusé par le schéma, toléré par le noyau ».

### D65 — `oneOf` discriminé par `composant`
- **Décision** : `Noeud = oneOf [Texte, Bouton, Conteneur]`. Dans chaque définition, `"composant": { "const": "Bouton" }`.
- **Alternatives** : `anyOf`, équivalent ici, mais qui dit moins bien l'intention « exactement un » ; le mot-clé `discriminator`, qui n'est **pas** du JSON Schema standard (il vient d'OpenAPI).

### D66 — Schéma publié, vérifié, régénéré
- **Décision** : le fichier `packages/schema-json/schema/document-pivot.v1.schema.json` est versionné. Le test `fichier-publie.test.ts` **échoue** s'il n'est plus à jour. La commande `pnpm --filter @plateforme/schema-json ecrire` le régénère.
- **Argument** : un fichier **stable**, que l'on peut lier, citer ou donner à une IA, et qui ne peut pas mentir sur le catalogue.

### D67 — Tests par propriétés, avec mesure de la répartition
- **Décision** : fast-check génère des suites aléatoires de commandes (noyau) et des corruptions aléatoires de documents (schéma). Pour chaque test, on a **mesuré** combien de cas étaient acceptés ou refusés, et pour quelle raison.
- **Arguments** : un test aléatoire qui ne produit que des refus ne prouve rien. La première version n'acceptait que **5** déplacements sur ~340. Après amélioration du générateur (élément hors racine, pondération, document de départ riche) : **574** déplacements acceptés et **149** tentatives de cycle (problème P3-02).
- **Référence** : Claessen et Hughes, *QuickCheck* (2000).

### D68 — Ajv seulement pour les tests
- Le **générateur** de schéma n'a besoin d'aucune bibliothèque. **Ajv** (le validateur JSON Schema le plus utilisé, licence MIT) ne sert qu'à **vérifier** le schéma dans les tests, en mode `strict` : un mot-clé inconnu ou mal placé serait refusé.

### D69 — Configuration de typage séparée pour les tests
- **Contexte** : le test du fichier publié lit un fichier, donc il a besoin des types de Node. Le paquet est compilé, comme le noyau, sans Node ni navigateur (D5).
- **Décision** : `tsconfig.json` couvre seulement `src/`, sans Node ; `tsconfig.test.json` ajoute les types de Node pour `test/`. Le script `typecheck` vérifie les deux.
- **Preuve** : un `import 'node:fs'` placé dans `src/` donne toujours l'erreur `TS2591`.

### D70 — Téléchargement du schéma par un adaptateur injecté
- `TelechargerFichier` (dans `adaptateurs/telechargement.ts`) est injecté dans l'éditeur comme `Telecharger` (D49). Le test vérifie le nom, le type `application/schema+json` et le contenu.
