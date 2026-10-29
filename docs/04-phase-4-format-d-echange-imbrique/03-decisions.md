# 03 — Registre des décisions de la phase 4 (D71 à D78)

> Format ADR : contexte, décision, alternatives écartées, arguments, conséquences, où, preuve. La phase 3 s'arrête à D70.

## Récapitulatif

| N° | Décision |
|---|---|
| D71 | **Ajouter** un format d'échange imbriqué ; le format à plat **reste** le format interne (D8 inchangée) |
| D72 | Identifiants **facultatifs** ; ceux qui manquent sont fabriqués `n1`, `n2`… dans l'ordre de lecture, sans port injecté |
| D73 | Pas de champ `enfants` pour un composant sans enfants ; champ facultatif pour un conteneur |
| D74 | Import = conversion **puis** validation complète par le noyau ; erreurs complétées par le **chemin** |
| D75 | Conversions **itératives** ; détection des objets partagés à l'import |
| D76 | Un paquet **séparé** `@plateforme/format-imbrique` ; le schéma imbriqué dans `schema-json` |
| D77 | Dans l'éditeur : choix « À plat / Imbriqué » et ⤓ **dans le panneau JSON**, pas dans la barre d'outils |
| D78 | Un champ **discriminant** `format: "pivot-imbrique"` |

---

### D71 — Ajouter un format d'échange imbriqué, sans toucher au format interne
- **Contexte** : JSON Schema ne peut pas vérifier les règles qui relient deux nœuds du format à plat (phase 3, D63 à D66). Un outil extérieur, ou une IA, qui produit un document à plat peut donc écrire un document conforme au schéma mais invalide : lien cassé, cycle, orphelin.
- **Décision** : **ajouter** une seconde forme, imbriquée, pour l'**échange**. Le format à plat reste la seule forme utilisée dans l'éditeur, le noyau, l'historique, le stockage et les générateurs.
- **Alternatives** :
  - (a) **Tout passer en imbriqué** : on perdrait l'accès en O(1), les modifications locales, les identifiants stables et le `parentId` qui sert à la détection de cycle (D54). Tout le noyau serait à réécrire.
  - (b) **Ne rien faire** : le noyau refuse déjà tout document invalide (D9). Mais l'auteur extérieur ne peut pas se vérifier lui-même avec un outil standard.
  - (c) **Compléter JSON Schema** avec une extension, comme le `$data` d'Ajv, ou un autre langage, comme SHACL pour RDF : ce n'est pas standard, chaque outil devrait connaître l'extension, et `$data` ne sait de toute façon pas exprimer « est un arbre ».
- **Arguments** : chaque forme sert là où elle est forte (02 §2). C'est le schéma classique « stockage normalisé, échange en documents ».
- **Conséquences** : deux conversions à maintenir et à tester. L'aller-retour exact est prouvé par des tests par propriétés.
- **Preuve** : 300 allers-retours aléatoires identiques ; les 6 limites de la phase 3 testées une par une.

### D72 — Identifiants facultatifs, fabriqués de façon déterministe
- **Contexte** : exiger des identifiants, c'est réintroduire une règle globale (l'unicité) que JSON Schema ne sait pas vérifier. C'est aussi un fardeau pour un humain ou une IA qui écrit un arbre.
- **Décision** : `id` est **facultatif**. Ceux qui manquent sont fabriqués `n1`, `n2`… **dans l'ordre de lecture**, en sautant ceux déjà fournis. La fonction reste **pure** : aucun générateur n'est injecté.
- **Alternatives** :
  - (a) Identifiants **obligatoires** : l'aller-retour serait plus simple, mais on garderait la règle d'unicité.
  - (b) Injecter le port **`GenerateurIdentifiants`** (UUID dans l'éditeur) : l'import ne serait plus déterministe, et les tests deviendraient plus difficiles.
  - (c) Des identifiants **dérivés du chemin** (`racine-1-0`) : ils sont longs, et changent si l'on insère un frère.
- **Arguments** : la même entrée donne toujours le même document. Les identifiants `nK` ne peuvent pas entrer en collision avec les UUID qu'ajoutera ensuite l'éditeur.
- **Conséquences** : un document **avec** identifiants fait un aller-retour **exact** ; **sans** identifiants, on retrouve le même arbre, renommé. Les deux propriétés sont testées.
- **Où** : `depuisImbrique`, étape 2.

### D73 — Le champ `enfants` seulement là où il a un sens
- **Décision** : à l'export, `enfants` est **omis** quand la liste est vide. Dans le schéma, la définition d'un Texte ou d'un Bouton **n'a pas** de champ `enfants` (refusé par `additionalProperties: false`) ; pour un Conteneur, il est **facultatif**.
- **Alternative** : `enfants: []` partout, comme à plat, avec `maxItems: 0` pour les feuilles. Le JSON serait plus bruyant et moins naturel à écrire.
- **Conséquence** : l'import **tolère** `"enfants": []` sur un Bouton (Postel, D64), mais le schéma le refuse.

### D74 — L'import se termine par la validation du noyau ; les erreurs disent où
- **Décision** : `depuisImbrique` ne vérifie lui-même que ce qui est **propre** au format (forme des nœuds, identifiants en double, objets partagés). Tout le reste est confié à `validerDocument`, avec les **mêmes** règles R1 à R8 et les **mêmes** codes d'erreur. Chaque erreur liée à un nœud reçoit son **chemin** (`racine.enfants[1].enfants[0]`). L'identifiant est retiré d'une erreur quand il a été fabriqué.
- **Alternative** : réécrire les règles du catalogue pour le format imbriqué. Les deux versions finiraient par diverger.
- **Arguments** : une seule définition de la validité (D9). Le chemin est indispensable quand l'auteur n'a pas mis d'identifiants.
- **Preuve** : tests « le noyau vérifie le catalogue, et le message dit OÙ » et « l'erreur garde un identifiant FOURNI, jamais un identifiant fabriqué » ; recette P4-3.

### D75 — Conversions itératives ; garde contre les objets partagés
- **Décision** : les deux conversions utilisent une **pile explicite**, comme la règle R8 depuis la phase 1. À l'import, un ensemble des objets déjà vus refuse un objet rencontré deux fois (`CYCLE_OU_PARTAGE`). Le chemin d'un nœud n'est calculé que pour les erreurs.
- **Alternative** : des fonctions récursives, plus courtes, mais qui débordent la pile d'appels vers 10 000 niveaux. Sans la garde, un objet circulaire ferait boucler l'import à l'infini.
- **Preuve** : 50 000 niveaux dans les deux sens ; tests de l'objet partagé et de l'objet circulaire.
- **Limite connue** : `JSON.stringify` et `JSON.parse`, eux, ne sont pas garantis à de telles profondeurs. Le test travaille donc sur des objets en mémoire.

### D76 — Un paquet séparé, et le schéma rangé avec les autres schémas
- **Décision** : les conversions vont dans **`@plateforme/format-imbrique`**, qui ne dépend que du noyau et n'a besoin ni de Node ni du navigateur. Le **schéma** imbriqué va dans `@plateforme/schema-json`, qui partage la traduction des propriétés (`schemaProprietes`) avec le schéma à plat.
- **Alternatives** :
  - (a) Les conversions **dans le noyau** : le noyau grossirait, alors qu'il n'en a pas besoin.
  - (b) **Tout** dans `schema-json` : ce paquet ne ferait plus seulement des schémas.
- **Arguments** : une responsabilité par paquet ; le noyau reste minimal ; un autre programme (un serveur, un script de l'IA) peut importer `format-imbrique` seul.

### D77 — L'interface : dans le panneau JSON, pas dans la barre d'outils
- **Décision** : deux boutons accolés, « À plat » et « Imbriqué », changent la **présentation** du JSON. ⤓ télécharge le JSON **affiché** (`interface.pivot.json` ou `interface.imbrique.json`). « Modifier » ouvre le brouillon dans le format affiché. « Appliquer » reconnaît un document imbriqué à son champ `format` et le convertit.
- **Alternative** : un bouton « ⤓ JSON imbriqué » de plus dans la barre d'outils. Elle débordait déjà en phase 3 (P3-08).
- **Arguments** : le format est une manière de **voir le modèle**, il a sa place à côté du JSON. On peut aussi comparer les deux formes d'un clic, ce qui est utile pour une démonstration.

### D78 — Un champ discriminant `format`
- **Décision** : tout document imbriqué porte `"format": "pivot-imbrique"`. L'éditeur choisit l'import selon ce champ (`estFormatImbrique`).
- **Alternative** : deviner le format à la forme (`racine` contre `noeuds`). C'est fragile, et ça ne laisse pas de place à un troisième format.
- **Arguments** : explicite, vérifié par le schéma (`const`), et versionnable avec `versionMetamodele`.
