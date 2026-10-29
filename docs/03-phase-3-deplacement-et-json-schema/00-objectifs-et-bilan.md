# Phase 3 — Déplacer, glisser-déposer, et décrire le métamodèle en JSON Schema : objectifs et bilan

| | |
|---|---|
| **Période** | 29 octobre 2026 (close le 29/10/2026) |
| **Correspond à** | Tranche **T2** du [guide de démarrage](../00-analyse-et-conception/03-guide-de-demarrage.md), placée après les générateurs par la décision D34. Lots **P1** (commandes, tests par propriétés, métamodèle formel) et **P2** (glisser-déposer, arbre) de la [proposition de conception](../00-analyse-et-conception/02-proposition-de-conception-et-phases.md) |
| **Objectifs du projet servis** | **OG1**, **OQ2**, **OQ3**, OQ6 ; préparation de **OG4** et **OG5** (l'IA pourra produire du JSON contraint par le schéma) |
| **Plan suivi** | [01-guide-de-la-phase.md](01-guide-de-la-phase.md) |
| **Première décision de la phase** | D53 |

---

## 1. Objectifs de la phase (fixés au début)

### Objectif principal
> **Réorganiser une interface à la souris (glisser-déposer) en toute sécurité, et publier le métamodèle dans un format standard (JSON Schema).**

### Objectifs détaillés

| N° | Objectif | Critère de réussite |
|---|---|---|
| O1 | Une commande **`deplacer-noeud`** dans le noyau : changer un élément de place ou de parent | Le document produit est toujours valide ; l'original n'est jamais modifié ; annuler / rétablir fonctionne sans code supplémentaire |
| O2 | **Interdire les cycles** : on ne peut pas déplacer un conteneur dans lui-même ni dans un de ses descendants | Erreur explicite ; complexité **O(profondeur)** grâce à `parentId` |
| O3 | **Glisser-déposer** depuis la palette (créer) et depuis le canevas (déplacer) | Recette dans un vrai Chrome |
| O4 | **Glisser-déposer dans l'arbre** | Idem |
| O5 | **Retour visuel** pendant le glissement : où l'élément va tomber (avant, après, dedans), et rien si c'est interdit | Tests de l'interface ; captures |
| O6 | **Une alternative au clavier et sans souris** : boutons « Monter » et « Descendre » | Tests ; accessibilité |
| O7 | **JSON Schema du métamodèle, produit automatiquement à partir du catalogue** (standard *draft 2020-12*) | Fichier publié, toujours à jour (un test échoue sinon) |
| O8 | **Cohérence entre le schéma et le validateur du noyau** | Tests par propriétés : tout document valide pour le noyau est valide pour le schéma, et toute violation exprimable dans le schéma est refusée par les deux |
| O9 | **Expliquer les limites du schéma** : ce que JSON Schema ne peut pas exprimer (références, arbre sans cycle) | Document de théorie |
| O10 | **Tests par propriétés des commandes** : des suites aléatoires de commandes laissent toujours un document valide | Des centaines de suites aléatoires, sans échec |
| O11 | Aucune régression : recettes des phases 1 et 2 | 11/11 et 12/12 |

---

## 2. Bilan

| N° | Atteint ? | Preuve |
|---|---|---|
| O1 | ✅ | `deplacer-noeud` : 13 tests ; résultat toujours valide et original intact (tests par propriétés) ; Ctrl+Z annule sans code supplémentaire (test + recette P3-6) |
| O2 | ✅ | `DEPLACEMENT_CYCLIQUE` ; `estDansSousArbre` en O(profondeur) (D54) ; 149 tentatives de cycle refusées dans les tests aléatoires |
| O3 | ✅ | Recette P3-1 (palette vers conteneur) et P3-2, P3-3 (canevas), dans Chrome |
| O4 | ✅ | Recette P3-4 (arbre) ; test d'interface |
| O5 | ✅ | Indications avant / après / dedans ; aucune si interdit ; capture `14-p3-glisser-retour-visuel.png` |
| O6 | ✅ | « ↑ Monter » et « ↓ Descendre » : test d'interface et recette P3-7 |
| O7 | ✅ | `@plateforme/schema-json` ; `document-pivot.v1.schema.json` publié ; test « à jour » ; bouton de téléchargement |
| O8 | ✅ | 200 suites de commandes, toutes conformes au schéma ; 1 000 corruptions, **0 contradiction** (845 / 104 / 51) |
| O9 | ✅ | [03 §4](03-json-schema-et-ses-limites.md) : locale, référentielle ou globale ; 6 limites testées une par une |
| O10 | ✅ | 300 + 200 suites aléatoires ; répartition mesurée (574 déplacements acceptés) |
| O11 | ✅ | Recette 18/18 (dont les 11 des phases 1 et 2) ; recette d'export 12/12, parité intacte |

**Chiffres** : 236 tests (174 avant), en 6,9 s ; recette Chrome 18/18 ; recette d'export 12/12 ; 18 décisions (D53 à D70) ; 10 problèmes consignés (P3-01 à P3-10, dont 2 erreurs de ma part, corrigées, et 1 limite non vérifiée).

**Hors objectifs, mais fait** : la **mesure de la qualité des tests aléatoires** (combien de cas utiles), qui a révélé un test trop faible (P3-02) ; une recette qui **discrimine** mieux (P3-06).

**Reporté** : glisser-déposer au **toucher** ; déplacement **entre conteneurs au clavier** ; tests sous **Firefox** ; agrandir la zone « dedans » des conteneurs pleins.

### Ce qu'il faut retenir de la phase en 5 phrases

1. Une nouvelle **commande** (`deplacer-noeud`) a suffi : validation, enregistrement, notification et **annuler** ont fonctionné **sans aucun autre changement**. C'est la preuve du patron Commande.
2. Le **contrôle de cycle** remonte les `parentId` en **O(profondeur)** : la redondance `parentId` + `enfants` de la phase 1 trouve ici sa justification concrète.
3. Le **glisser-déposer** est un nouvel **adaptateur entrant** : des règles **pures** décident, un hook mince lit la souris, et le noyau reste le dernier rempart.
4. Le métamodèle est publié en **JSON Schema** standard, **produit automatiquement** à partir du catalogue, donc lisible par n'importe quel outil… et bientôt par l'IA.
5. JSON Schema ne sait exprimer que des contraintes **locales**. Les contraintes **référentielles** et **globales** (liens, racine, arbre) restent au **noyau** : la validation se fait en **deux couches**, et leur cohérence est **prouvée** par 1 000 cas aléatoires.

---

## 3. Les documents de la phase, dans l'ordre de lecture

| N° | Document | Contenu | Temps |
|---|---|---|---|
| 01 | [01-guide-de-la-phase.md](01-guide-de-la-phase.md) | Le plan **prévu** | 10 min |
| 02 | [02-conception-architecture.md](02-conception-architecture.md) | Paquets, commande de déplacement, glisser-déposer en deux couches, schéma (7 diagrammes) | 20 min |
| 03 | [03-json-schema-et-ses-limites.md](03-json-schema-et-ses-limites.md) | **La théorie** : JSON Schema, la traduction, **ce qu'il ne peut pas exprimer**, Postel, la preuve de cohérence | 25 min |
| 04 | [04-decisions.md](04-decisions.md) | D53 à D70, argumentées | 30 min |
| 05 | [05-structures-de-donnees-et-complexite.md](05-structures-de-donnees-et-complexite.md) | O(profondeur) pour les cycles, coût d'un `dragover`, volumes des tests | 10 min |
| 06 | [06-patrons-de-conception.md](06-patrons-de-conception.md) | Noyau fonctionnel et coquille impérative, projection, tests par propriétés… | 10 min |
| 07 | [07-journal-de-bord.md](07-journal-de-bord.md) | Chronologie et **10 problèmes** | 20 min |
| 08 | [08-tests-et-recette.md](08-tests-et-recette.md) | 236 tests, répartitions mesurées, 7 scénarios Chrome | 15 min |
| 09 | [09-visite-guidee-du-code.md](09-visite-guidee-du-code.md) | Fichiers ajoutés et modifiés ; un glisser-déposer suivi dans le code | 15 min |

**Images de la phase (figées)** : [captures/](captures/) (retour visuel, Monter / Descendre) ; [diagrammes/](diagrammes/) (8 diagrammes, en `.png`, `.svg` et `.mmd`).

---

## 4. Évolutions ultérieures

> Cette section liste ce qui, réalisé dans cette phase, a été **révisé dans une phase suivante**. Le contenu de la phase n'est pas réécrit : on ajoute seulement un lien vers la phase où la révision est documentée.

| Élément de la phase 3 | Révisé en | Lien |
|---|---|---|
| Les **limites** du JSON Schema : clé = id, racine, liens, arbre non exprimables ([03 §4](03-json-schema-et-ses-limites.md)) | Phase 4 (**D71 à D74**) : un **format d'échange imbriqué**, sans référence entre nœuds, dont le schéma vérifie tout sauf l'unicité des identifiants. Le format à plat et son schéma restent en vigueur | [phase 4 › 02 §5](../04-phase-4-format-d-echange-imbrique/02-conception-et-theorie.md) |
| `schemaComposant` dans `generer-schema.ts` | Phase 4 : la traduction des propriétés est extraite dans `schemaProprietes`, partagée avec le schéma imbriqué (aucun changement du schéma publié) | [phase 4 › 06 §2](../04-phase-4-format-d-echange-imbrique/06-visite-guidee-du-code.md) |
| `VueModelePivot.tsx` : un seul format affiché | Phase 4 (**D77**) : « À plat / Imbriqué », ⤓, import d'un document imbriqué collé | [phase 4 › 03 D77](../04-phase-4-format-d-echange-imbrique/03-decisions.md) |
