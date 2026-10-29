# 01 — Guide de la phase 4

> Phase courte, décidée en cours de conversation (« ajoutons l'export imbriqué »). Le plan ci-dessous est celui qui a été suivi. Il est consigné ici **après coup**, pour garder l'ossature commune des phases.

## Point de départ

- Le format **à plat** (D8) est le format interne : `noeuds: { id → nœud }`, avec `parentId` et `enfants`.
- La phase 3 a montré que JSON Schema **ne peut pas** vérifier les règles qui relient deux nœuds : clé = id, racine présente, liens parent ↔ enfant, absence de cycle ([phase 3 › 03 §4](../03-phase-3-deplacement-et-json-schema/03-json-schema-et-ses-limites.md)).
- Idée : ces règles n'existent que **parce que** le format est à plat. Dans un format **imbriqué**, elles sont garanties par la structure du JSON lui-même.

## Les étapes

| N° | Étape | Vérification |
|---|---|---|
| 1 | Paquet `@plateforme/format-imbrique` : types `DocumentImbrique`, `NoeudImbrique` ; `versImbrique` (à plat → imbriqué) | Tests sur la démonstration ; original intact |
| 2 | `depuisImbrique` (imbriqué → à plat) : forme, identifiants, construction, **validation par le noyau** | Tests de refus, un par cas ; arbre de 50 000 niveaux |
| 3 | Tests par propriétés : aller-retour ; robustesse sur des entrées quelconques ; **mesure** de ce qu'ils exercent (D67) | Répartitions consignées |
| 4 | `genererSchemaImbrique` dans `schema-json` ; fichier publié ; tests des **limites** et de la **cohérence** | 0 contradiction sur 1 000 corruptions |
| 5 | Éditeur : présentation « À plat / Imbriqué », téléchargement, import d'un document imbriqué collé | Tests d'interface ; recette Chrome P4-1 à P4-3 |
| 6 | Documentation : cette phase, « Évolutions ultérieures » des phases 1 et 3, `reference/` | Liens vérifiés ; diagrammes rendus |

## Ce qu'on ne fait pas

- **Remplacer** le format à plat : il reste le meilleur pour éditer (D8, D71).
- Changer le **noyau** : il n'en a pas besoin. Le nouveau format est un adaptateur autour de lui.
