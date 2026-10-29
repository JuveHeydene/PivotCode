# 06 — Patrons de conception (ajouts de la phase 3)

| # | Patron | Où |
|---|---|---|
| 1 | **Commande** (une nouvelle, sans toucher à l'architecture) | `deplacer-noeud` dans `noyau/src/domaine/commandes.ts` |
| 2 | **Adaptateur entrant** supplémentaire | Le glisser-déposer : `apps/editeur/src/glisser-deposer/` |
| 3 | **Noyau fonctionnel, coquille impérative** (*Functional Core, Imperative Shell*) | `regles-depot.ts` (pur) et `use-glisser-deposer.ts` (événements) |
| 4 | **Projection** d'une source unique | `genererSchemaJson` : le catalogue projeté en JSON Schema |
| 5 | **Union discriminée** au niveau du schéma | `oneOf` + `composant: { const }` |
| 6 | **Garde en défense en profondeur** (*defense in depth*) | Contrôle de cycle dans l'interface **et** dans le noyau |
| 7 | **Tests par propriétés** (*property-based testing*) | `noyau/test/proprietes.test.ts`, `schema-json/test/coherence.test.ts` |
| 8 | **Test d'instantané d'un artefact publié** (*golden file*) | `schema-json/test/fichier-publie.test.ts` |

### 1. Une commande de plus, et rien d'autre à changer
`deplacer-noeud` s'ajoute à l'union `Commande` et au `switch` d'`appliquerCommande`. **Tout le reste est gratuit** : validation par les tests, enregistrement, notification, **annuler / rétablir** (vérifié par un test et par la recette, sans une ligne de code d'historique). C'est la démonstration du patron Commande décidé en phase 1 (D2, D3).

### 2. Le glisser-déposer est un nouvel adaptateur entrant
Il traduit des **gestes** (souris) en **commandes** existantes (`ajouter-noeud`, `deplacer-noeud`). Le port `ServiceEditeur` **n'a pas changé**. On pourrait supprimer tout le dossier `glisser-deposer/` sans casser autre chose.

### 3. Noyau fonctionnel, coquille impérative
- **Le noyau fonctionnel** (`regles-depot.ts`) : des fonctions pures qui **décident**. Où ça tombe ? Est-ce permis ?
- **La coquille impérative** (`use-glisser-deposer.ts`) : elle lit les événements, mesure l'élément (`getBoundingClientRect`), tient l'état et envoie la commande.
- **Pourquoi** : la partie difficile se teste en millisecondes, sans navigateur ; la partie liée au navigateur est réduite au minimum. C'est le même découpage que le projet entier (domaine pur, puis adaptateurs), appliqué **en petit** dans l'éditeur.

### 4. Projection d'une source unique
Le **catalogue** est projeté de plusieurs façons, sans jamais être recopié à la main :

| Projection | Produite par | Depuis |
|---|---|---|
| Formulaire de propriétés | `PanneauProprietes` | phase 1 |
| Validation R4 à R6 | `validerDocument` | phase 1 |
| Valeurs par défaut du rendu | `Lecteur` (`rendu-web`) | phase 2 |
| **JSON Schema** | `genererSchemaJson` | **phase 3** |

### 5. Union discriminée, version JSON Schema
L'idée des unions TypeScript `{ type: 'a' } | { type: 'b' }` (phase 1) se retrouve dans le schéma : `oneOf` liste les cas, et `const` sur le champ `composant` indique **lequel** s'applique.

### 6. Défense en profondeur
L'interface **anticipe** le refus (pas d'indication, pas de dépôt). Le noyau **garantit** le refus. Si l'interface avait une erreur, le modèle resterait protégé.

### 7. Tests par propriétés
On écrit une **propriété** (« après n'importe quelle suite de commandes, le document est valide »). L'outil cherche un **contre-exemple** parmi des centaines de cas aléatoires. S'il en trouve un, il le **réduit** au plus petit cas qui échoue (*shrinking*). C'est ce qui a permis de diagnostiquer en quelques secondes une erreur dans un test (P3-03).

### 8. Fichier de référence vérifié
Le schéma publié est comparé, **caractère par caractère**, à celui que produit le code. Toute modification du catalogue oblige à **régénérer consciemment** le fichier, et la différence est visible dans Git.
