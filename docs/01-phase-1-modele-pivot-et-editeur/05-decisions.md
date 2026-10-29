# 05 — Registre des décisions (ADR)

> Chaque décision suit le format d'un **ADR** (*Architecture Decision Record*) : **contexte**, **décision**, **alternatives écartées**, **arguments**, **conséquences**, **où dans le code**.
> - **D1 à D10** viennent du guide `03_tranche_1_editeur_et_modele_pivot.md`. Pour chacune, on indique **comment elle a été réalisée et vérifiée**.
> - **D11 à D32** ont été prises **pendant la réalisation**. Elles comblent ce que le guide ne précisait pas, ou corrigent un problème découvert en codant.

---

## Partie A — Décisions du guide (D1 à D10) : réalisation et preuve

| N° | Décision | Réalisation | Preuve |
|---|---|---|---|
| **D1** | Le modèle pivot est au centre de l'hexagone ; l'éditeur React est un adaptateur | Paquet `@plateforme/noyau` (cœur) séparé de `@plateforme/editeur` (périphérie) | Arborescence ; diagramme hexagonal ([03 §2](03-conception-architecture.md)) |
| **D2** | Le front ne modifie jamais le modèle : il envoie des commandes | L'éditeur n'a accès qu'à `service.executer(commande)`. `appliquerCommande` n'est **pas exportée** | `index.ts` ; recherche de `executer(` dans `apps/editeur/src` |
| **D3** | Les commandes sont des **données** | Type union `Commande` (`{ type: 'ajouter-noeud', … }`) | `commandes.ts`. Les tests construisent les commandes comme de simples objets |
| **D4** | Monodépôt pnpm, un paquet par module | `pnpm-workspace.yaml` : `apps/*`, `packages/*` | S9 : `Cannot find module 'react'` dans le noyau |
| **D5** | Noyau compilé sans les types du navigateur | `tsconfig.json` du noyau : `"lib": ["ES2022"]`, `"types": []` | S9 : `Cannot find name 'document'`. Effet de bord découvert : `structuredClone` est lui aussi indisponible (journal, problème P4) |
| **D6** | Un seul port entrant `ServiceEditeur`, défini par le noyau | `application/ports/service-editeur.ts` | L'éditeur ne dépend que de cette interface (`Editeur` reçoit `service: ServiceEditeur`) |
| **D7** | Document immuable : chaque commande produit un nouveau document | Copies superficielles `{ ...ancien, champ }` + `readonly` partout (D11) | Dans **chaque** test de commande : « le document d'origine n'a pas changé ». Test « même objet tant que rien ne change » |
| **D8** | Stockage à plat : `noeuds: { id → nœud }`, avec `parentId` et `enfants` | `DocumentPivot.noeuds: Record<NoeudId, Noeud>` | Accès O(1) ([06](06-structures-de-donnees-et-complexite.md)) |
| **D9** | Ne jamais faire confiance à l'extérieur | `validerDocument(candidat: unknown, …)` ; `DepotDocument.charger(): unknown` | Tests R1 (`null`, chaîne, tableau…), « dépôt invalide », S5 |
| **D10** | Identifiants et stockage = ports sortants | `GenerateurIdentifiants`, `DepotDocument` ; doublures `GenerateurSequentiel`, `DepotMemoire` | Tests déterministes : `n1`, `n2`… |

---

## Partie B — Décisions prises pendant la réalisation

### D11 — `readonly` partout dans le métamodèle

- **Contexte** : D7 exige l'immuabilité, mais le guide la laisse à la discipline du programmeur.
- **Décision** : tous les champs de `Noeud`, `DocumentPivot`, des définitions, commandes et événements sont `readonly`, et les tableaux sont `readonly NoeudId[]`.
- **Alternatives** : (a) aucune protection, par discipline seulement ; (b) `Object.freeze` récursif à l'exécution ; (c) une bibliothèque comme Immer ou Immutable.js.
- **Arguments** : la protection est **gratuite** (elle disparaît à la compilation) et **vérifiée par le compilateur** : écrire `doc.noeuds.t1.enfants.push(…)` dans le noyau est une **erreur de compilation**. `Object.freeze` a un coût à l'exécution et ne signale l'erreur qu'en cours d'exécution. Une bibliothèque ajouterait une dépendance au noyau, ce qui contredit son principe : il ne dépend de rien.
- **Conséquence** : les tests qui fabriquent des documents **faux** doivent les modifier. On y utilise un type utilitaire `Modifiable<T>` (`-readonly` récursif), **réservé aux tests** (`test/doublures.ts`).

### D12 — `noUncheckedIndexedAccess` activé (noyau et éditeur)

- **Contexte** : par défaut, `document.noeuds['x']` a le type `Noeud`, alors que la valeur peut être `undefined`.
- **Décision** : avec cette option, l'accès par clé renvoie `Noeud | undefined`. Le compilateur **oblige** donc à traiter le cas « absent ».
- **Arguments** : dans un modèle où les liens se font **par identifiant**, un identifiant qui ne pointe sur rien est **le** bug typique. Le compilateur le prévient partout.
- **Conséquence** : le code est un peu plus verbeux (`trouverNoeud(...)` renvoie `Noeud | undefined`, `?.` dans les tests).

### D13 — `DefinitionPropriete` est une **union discriminée** par `type`

- **Contexte** : le guide propose une forme unique, `{ type; defaut: ValeurPropriete; choix?: string[] }`. Elle permet des définitions incohérentes : `type: 'nombre', defaut: 'abc'`, ou `type: 'choix'` sans `choix`.
- **Décision** : quatre variantes, chacune avec son type de `defaut`. `choix` n'existe, **obligatoirement**, que pour `type: 'choix'`.
- **Arguments** : on rend **les états invalides impossibles à écrire**. Dans `verifierValeur`, le `switch (definition.type)` est **exhaustif** : chaque `case` renvoie une valeur. Si on ajoute un 5ᵉ type, le compilateur signale que la fonction peut se terminer sans `return`. Dans le formulaire `Champ` de l'éditeur, en revanche, l'oubli ne serait **pas** signalé (le `switch` n'a pas de `default`). C'est une amélioration possible, avec un `default` qui affecte la variable à un type `never`.
- **Fichier** : `domaine/composant.ts`.

### D14 — Le `Catalogue` range ses définitions dans des `Map` et se vérifie à la construction

- **Décision** : deux index, `Map<nom, DefinitionComposant>` et `Map<composant, Map<propriété, DefinitionPropriete>>`. Le constructeur **lève une exception** si un composant ou une propriété est en double, ou si une valeur par défaut est invalide (un défaut hors des choix, par exemple).
- **Alternatives** : un objet `Record` (ce que le guide suggère) ; une recherche linéaire avec `Array.find`.
- **Arguments** :
  - `trouver` et `trouverPropriete` sont en **O(1)**. La validation R5 interroge `trouverPropriete` pour **chaque** propriété de **chaque** nœud, d'où l'intérêt du second index ;
  - une `Map` n'a **pas de clés héritées**, donc `catalogue.trouver('toString')` renvoie bien `undefined` (testé) ;
  - le catalogue n'est **jamais sérialisé** en JSON, donc l'avantage de `Record` (sérialisation directe) ne joue pas ici, contrairement au document (D8).
- **Pourquoi lever une exception** alors que la validation n'en lève jamais : un catalogue faux est une **erreur du programmeur**, à corriger tout de suite au démarrage. Un document faux est une **donnée de l'utilisateur**, qu'il faut expliquer sans planter.

### D15 — Accès sûrs : `Object.hasOwn`, `trouverNoeud`, `Object.fromEntries`

- **Contexte** : un objet JavaScript hérite de `toString`, `constructor`, etc. Une affectation `obj['__proto__'] = x` **change le prototype** au lieu de créer une clé. Or les identifiants peuvent venir d'un JSON tapé par l'utilisateur.
- **Décision** :
  - toute recherche de nœud par identifiant passe par `trouverNoeud(document, id)`, qui teste `Object.hasOwn` ;
  - les tables sont reconstruites avec `Object.fromEntries` ou des littéraux `{ [id]: … }`, qui **créent** des propriétés, et jamais par affectation `noeuds[id] = …`.
- **Preuve** : tests « racine nommée `toString` », « clé `__proto__` reste une clé ordinaire ».

### D16 — Ordre et points d'arrêt de la validation

- **Décision** : arrêt après **R1** (forme générale) et après **R2** (forme des nœuds). Ensuite, R3 à R7 accumulent toutes leurs erreurs. R8 n'est exécutée que si la racine est valide.
- **Arguments** : après une erreur de forme, les règles suivantes liraient des champs absents. Elles planteraient (R1) ou produiraient des **erreurs en cascade** qui noieraient la vraie cause (R2). Au-delà, il est plus utile de montrer **toutes** les erreurs d'un coup : l'utilisateur corrige tout en une fois.
- **Preuve** : test « s'arrête après R2 : pas d'erreurs en cascade » ; test « renvoie TOUTES les erreurs ».

### D17 — `copierDocumentValide` : une copie défensive et nettoyée

- **Contexte** : avec `remplacer-document`, le noyau reçoit un objet dont l'appelant **garde une référence**. L'appelant pourrait le modifier **après** la validation et casser l'invariant « le document du service est toujours valide ».
- **Décision** : une fois validé, le document est **recopié** et ne conserve **que** les champs du métamodèle. Un champ en trop, comme `"commentaire"`, disparaît.
- **Arguments** : on obtient une **frontière de confiance** nette, et un document qui contient exactement ce que le métamodèle décrit.
- **Preuve** : tests « ne partage aucun objet avec le candidat », « ne garde que les champs du métamodèle ».

### D18 — Une commande sans effet renvoie **le même** document

- **Décision** : `modifier-propriete` avec la valeur déjà présente renvoie `{ succes: true, document: <le même objet>, evenements: [] }`. Le service, voyant la même référence, **n'enregistre pas, ne notifie pas, n'ajoute rien à l'historique**.
- **Arguments** : on évite des réaffichages React inutiles, des écritures dans le stockage et des entrées « vides » dans l'historique (un Ctrl+Z qui « ne fait rien »).
- **Preuve** : tests « renvoie LE MÊME document », « commande sans effet : ni enregistrement ni notification », « n'entre pas dans l'historique ».

### D19 — Un identifiant déjà utilisé est une **erreur**, pas une réécriture silencieuse

- **Contexte** : rien n'empêche un générateur de renvoyer un identifiant existant. C'est le cas d'un générateur séquentiel redémarré sur un document qui contient déjà `n1`. Sans contrôle, `{ ...noeuds, [id]: nouveau }` **écraserait** un nœud existant.
- **Décision** : l'erreur `IDENTIFIANT_DEJA_UTILISE` est renvoyée. On ne réessaie pas en boucle.
- **Arguments** : avec des UUID v4 (122 bits aléatoires), une collision est pratiquement impossible. Le cas n'arrive qu'avec des générateurs de test, où il vaut mieux **le voir** que le masquer.

### D20 — « Obligatoire » veut dire « présent » ; les nombres doivent être finis

- Voir [04 §4, subtilités 3 et 4](04-metamodele.md). Un texte vide est autorisé, sinon le champ « résisterait » à l'effacement. `NaN` et `Infinity` sont refusés, car le JSON les transforme en `null`.

### D21 — Des codes d'erreur **typés**

- **Décision** : `CodeErreur` est une union de 16 littéraux (`'FORME_INVALIDE' | … | 'HISTORIQUE_VIDE'`). Chaque erreur porte un `code` stable, un `message` en français et éventuellement le `noeudId` concerné.
- **Arguments** : les tests vérifient des **codes**, et non des phrases qui changeraient. L'interface peut réagir au code (le lien « voir » utilise `noeudId`). Une faute de frappe dans un code est une erreur de compilation.

### D22 — `executer` renvoie aussi les **événements** (extension du port)

- **Contexte** : après « + Bouton », l'interface doit **sélectionner le nouveau bouton**. Elle doit donc connaître son identifiant, qui est généré par le noyau.
- **Décision** : `ResultatExecution` en cas de succès vaut `{ succes: true, evenements }`, au lieu de `{ succes: true }` dans le guide. L'éditeur lit l'événement `noeud-ajoute`.
- **Alternatives** : (a) relire le document et chercher le nœud ajouté, ce qui est fragile ; (b) faire générer l'identifiant par l'éditeur, ce qui contredit D10.
- **Arguments** : l'extension est **rétrocompatible** (on ajoute un champ) et réutilise une information que le domaine produit déjà.

### D23 — Bonus annuler / rétablir : deux **piles** de documents

- **Décision** : `EditeurApplicatif` garde `#passe` et `#futur`, deux tableaux utilisés comme des piles et limités à 100 entrées. `annuler`, `retablir`, `peutAnnuler` et `peutRetablir` sont ajoutés au port. Une nouvelle commande vide `#futur`.
- **Alternatives** : (a) mémoriser les **commandes inverses** (patron Commande classique avec `undo()`) ; (b) mémoriser des **différences** (*patches*).
- **Arguments** : grâce à D7, garder un document entier **ne coûte presque rien**. Deux documents successifs **partagent** tous les nœuds non modifiés, et seules quelques références changent. Écrire l'inverse de chaque commande est plus complexe et source de bugs : l'inverse d'une suppression doit recréer tout un sous-arbre. Une **capture complète** (*snapshot*) est, elle, **toujours** correcte.
- **Limite connue** : chaque frappe dans un champ texte crée une entrée d'historique. Un regroupement des frappes (*coalescing*) est une amélioration future.

### D24 — Notification robuste des abonnés

- **Décision** : les écouteurs sont rangés dans un `Set` (ajout et retrait en O(1), pas de doublon). On itère sur une **copie** (`[...this.#ecouteurs]`).
- **Argument** : un écouteur peut se **désabonner pendant** la notification. Itérer sur l'ensemble pendant qu'on le modifie donnerait un comportement surprenant. **Testé** : « un écouteur peut se désabonner pendant une notification ».

### D25 — Démarrage et persistance tolérants aux pannes

- **Décision** :
  1. le document initial est **enregistré dès le démarrage**. Sinon, l'identifiant UUID de la racine changerait à chaque rechargement tant qu'aucune commande n'a été faite ;
  2. un contenu de stockage invalide est **ignoré** : on repart d'un document neuf ;
  3. `DepotLocalStorage` capture les exceptions **en lecture** (JSON corrompu, stockage bloqué) et **en écriture** (quota dépassé). L'édition continue et l'erreur est écrite dans la console ;
  4. le `Storage` est **injectable** dans le constructeur, ce qui permet de tester le cas « quota dépassé ».
- **Preuve** : tests `depot-local-storage.test.ts`, « document corrompu ignoré au démarrage », S6.

### D26 — Propriété `desactive` (booléen) ajoutée au Bouton

- **Contexte** : le tableau du guide (étape 3) ne contient **aucune** propriété booléenne. Le champ « case à cocher » du formulaire généré (étape 11) n'aurait donc jamais été utilisé ni testé.
- **Décision** : `Bouton.desactive` (booléen, défaut `false`, facultatif).
- **Argument** : on couvre les **4 types** du métamodèle (`texte`, `nombre`, `booleen`, `choix`) dans l'interface et dans les tests. C'est aussi la démonstration concrète de l'étape 11 : la case est apparue **sans écrire de code** dans le panneau.

### D27 — L'état **de l'éditeur** est séparé du **modèle**

- **Décision** : la sélection, les messages et les brouillons sont de l'état React **local**. Ils ne sont jamais placés dans le document pivot. La sélection est **dérivée** : si le nœud sélectionné n'existe plus (suppression, annuler, JSON appliqué), elle vaut `null` automatiquement, sans `useEffect`.
- **Arguments** : le modèle pivot décrit **l'application conçue**. La sélection décrit **ce que fait l'utilisateur de l'éditeur**. Les mélanger polluerait le modèle, et donc les futurs générateurs et l'historique (un Ctrl+Z « désélectionnerait »).

### D28 — Règle d'insertion de la palette

- **Décision** :
  - si la sélection accepte des enfants, on ajoute **dedans** (à la fin) ;
  - sinon, on ajoute **juste après** elle, dans son parent (et non à la fin du parent) ;
  - sans sélection, on ajoute à la fin de la racine ;
  - **le nouveau nœud devient la sélection**.
- **Arguments** : c'est le comportement des outils connus (Figma, Webflow). Enchaîner « + Conteneur », « + Bouton », « + Bouton » construit naturellement une rangée de deux boutons. La fonction `cibleAjout` est **pure** et testée à part.
- **Petit détail** : le composant racine (`COMPOSANT_RACINE = 'Conteneur'`) est une **constante exportée par le noyau**. L'éditeur la réutilise pour « Nouveau document » au lieu de l'écrire en dur.

### D29 — Le canevas : une table de rendus, et `aria-disabled` au lieu de `disabled`

- **Décision** :
  - `rendus: Record<nomComposant, fonctionDeRendu>`, c'est-à-dire le patron Stratégie ;
  - un nom inconnu affiche un encadré « Composant inconnu », au lieu de planter ;
  - un bouton « désactivé » est rendu avec `aria-disabled` et un style atténué, **pas** avec l'attribut HTML `disabled`.
- **Arguments** : un `<button disabled>` **ne reçoit plus les clics**. On ne pourrait donc plus le sélectionner dans le canevas pour le réactiver. Le canevas est un **aperçu éditable**, pas l'application finale.

### D30 — `ChampNombre` : un brouillon local

- **Contexte** : si le champ nombre est directement lié au document, effacer « 8 » pour taper « 24 » produit un texte vide, donc `NaN`. La commande est refusée et le champ **revient à 8** : on ne peut pas taper.
- **Décision** : un brouillon texte local. La commande n'est envoyée que lorsque le texte est un nombre fini. Si le document change ailleurs (annuler, JSON), le brouillon est resynchronisé (motif React « ajuster l'état quand une prop change »).
- **Preuve** : test « le formulaire est généré… » (effacer puis taper 24) et scénario de démonstration dans Chrome.

### D31 — Outillage : une seule version de TypeScript, des noms cohérents

- **Contexte** : le gabarit Vite installait `typescript ~6.0.2` dans l'éditeur, alors que la racine a `typescript 7.0.2` (journal, problème P5).
- **Décision** :
  - TypeScript n'est déclaré **qu'à la racine** (outil partagé, comme le demande le guide à l'étape 1) et la dépendance de l'éditeur est retirée ;
  - le paquet est renommé `@plateforme/editeur`, par cohérence avec `@plateforme/noyau` ;
  - les scripts racine utilisent `pnpm -r` (tous les paquets).
- **Arguments** : deux compilateurs pourraient **accepter et refuser des codes différents**. Une seule version donne un seul comportement. On a vérifié que l'éditeur utilise bien la 7.0.2 (`pnpm exec tsc --version` dans `apps/editeur`) et qu'une erreur de type y est bien détectée.

### D32 — Stratégie de test : trois niveaux, sans télécharger de navigateur

- **Décision** :
  1. **Tests unitaires du domaine et de l'application** : Vitest, environnement Node, dans le noyau ;
  2. **Tests d'intégration de l'interface** : Vitest + **jsdom** (un DOM simulé) + **Testing Library**. La **vraie** interface React est branchée sur le **vrai** noyau, avec des doublures pour les ports ;
  3. **Recette de bout en bout** : **playwright-core** pilote le **Chrome déjà installé** (`/usr/bin/google-chrome`) sur la version de production (`vite preview`).
- **Alternatives** : `@playwright/test` complet, qui télécharge ses propres navigateurs (~150 Mo) et peut demander des paquets système (`sudo`) ; Cypress ; tests manuels uniquement.
- **Arguments** :
  - les tests jsdom sont **rapides** (≈ 2 s) et tournent avec `pnpm test` ;
  - la recette Chrome prouve que **le vrai navigateur** se comporte comme prévu. Par exemple, `JSON.parse` y donne d'autres messages d'erreur que Node ;
  - `playwright-core` ne télécharge rien et **aucun `sudo` n'a été nécessaire**.

---

## Partie C — Décisions **non** prises (volontairement reportées)

| Sujet | Pourquoi pas maintenant | Quand |
|---|---|---|
| Glisser-déposer, déplacer un nœud | Hors périmètre de la tranche 1 (le guide le place en tranche 2) | Tranche 2 |
| JSON Schema pour la validation | La validation manuelle suffit pour 8 règles. Le schéma servira à l'interopérabilité | Tranche 2 |
| Structures persistantes (partage structurel en O(log n)) | La copie superficielle en O(n) est négligeable pour des documents de quelques centaines de nœuds | Si des documents de plusieurs milliers de nœuds apparaissent |
| Regrouper les frappes dans l'historique | Amélioration d'ergonomie, pas d'architecture | Plus tard |
| Commit Git | L'identité Git (`user.name`, `user.email`) n'est pas configurée sur la machine. Je n'ai pas voulu commiter sous une identité inventée | À faire par toi (journal, problème P1) |
