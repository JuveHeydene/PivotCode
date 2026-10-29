# 08 — Tests et recette de la phase 3

## 1. Vue d'ensemble

| Niveau | Fin de phase 2 | **Fin de phase 3** |
|---|---|---|
| Tests automatisés (`pnpm test`, 6 paquets) | 174 | **236** (6,9 s) |
| Recette dans Chrome (`pnpm recette`) | 11 / 11 | **18 / 18** (7 scénarios de phase 3) |
| Recette d'export et de parité (`pnpm recette:export`) | 12 / 12 | **12 / 12** (non-régression) |

## 2. Inventaire (236)

| Paquet | Fichier | Nombre | Nouveautés de la phase 3 |
|---|---|---|---|
| `noyau` | `commandes.test.ts` | 43 | **13 tests `deplacer-noeud`** : réordonner, changer de parent (deux listes et `parentId`), à la fin, conteneur avec son contenu, même place = même document, positions hors limites, 5 refus, cycle vers un descendant |
| | `proprietes.test.ts` | **2** | **Tests par propriétés** : document toujours valide et original jamais modifié (300 suites) ; refus sans trace (200 suites) |
| | `validation`, `catalogue`, `editeur-applicatif` | 36 + 7 + 14 | — |
| `schema-json` | `schema.test.ts` | **21** | Schéma compilé par Ajv (strict) ; une définition par composant ; traduction des types ; démo acceptée ; **10 violations** refusées par les deux ; **6 limites** (schéma accepte, noyau refuse) ; champ en trop |
| | `coherence.test.ts` | **2** | Commandes aléatoires, donc toujours conformes au schéma (200 suites) ; 1 000 corruptions aléatoires, donc cohérence |
| | `fichier-publie.test.ts` | **1** | Le fichier publié est à jour |
| `editeur` | `glisser-deposer/regles-depot.test.ts` | **15** | Zones (vertical, horizontal, élément sans taille), axe, cible (dedans, avant / après, positions sans l'élément déplacé, racine, survol de soi), permis (conteneur, bouton, cycle) |
| | `Editeur.test.tsx` | 31 | **Monter / Descendre** ; glisser de la palette dans un conteneur ; glisser du canevas vers un autre conteneur ; glisser dans l'**arbre** ; dépôt **interdit** ; Ctrl+Z annule un déplacement ; racine non glissable, pas de glissement en aperçu ; **bouton JSON Schema** |
| | autres | 15 | — |
| `rendu-web`, `generateur-react`, `generateur-vue` | | 17 + 18 + 14 | — |

## 3. Les tests par propriétés, et le « test du test »

Un test par propriétés est aussi bon que **les cas qu'il génère**. On a donc **compté** ce que chacun exerce.

**Noyau** : 300 suites aléatoires, après amélioration du générateur (P3-02).

| Commande | Acceptée | Sans effet | Refusée (code) |
|---|---|---|---|
| `ajouter-noeud` | 513 | — | 369 (`ENFANTS_INTERDITS`) |
| `deplacer-noeud` | **574** | 100 | **149 (`DEPLACEMENT_CYCLIQUE`)**, 675 (`ENFANTS_INTERDITS`), 5 (`RACINE_IMMOBILE`) |
| `modifier-propriete` | 517 | 142 | 183 (type), 52 (choix) |
| `supprimer-noeud` | 316 | — | 1 (`SUPPRESSION_RACINE`) |

Pour comparaison, la **première** version du générateur n'acceptait que **5** déplacements.

**Schéma ↔ noyau** : 1 000 corruptions aléatoires. 845 refusées par les deux ; 104 acceptées par les deux ; 51 acceptées par le schéma mais refusées par le noyau, **uniquement** pour des défauts non exprimables en JSON Schema ; **0 contradiction**. Détails : [03 §6](03-json-schema-et-ses-limites.md).

## 4. Recette dans Chrome : les scénarios de la phase 3

| N° | Scénario | Résultat |
|---|---|---|
| P3-1 | Glisser « + Bouton » de la palette **dans** un conteneur (sur sa marge intérieure) | ✅ |
| P3-2 | Glisser un élément du canevas vers un autre conteneur | ✅ |
| P3-3 | Dans un conteneur **en ligne**, déposer à **gauche** d'un bouton le place **avant** lui | ✅ |
| P3-4 | Dans l'**arbre**, déposer en **bas** d'une ligne place **après** | ✅ |
| P3-5 | Dépôt **interdit** (un conteneur dans lui-même) : rien ne change | ✅ |
| P3-6 | **Retour visuel** pendant le glissement (capture), puis **Ctrl+Z** annule | ✅ |
| P3-7 | « ↓ Descendre » puis « ↑ Monter » | ✅ |

Toute la recette (S0 à S7, bonus, démo, P3-1 à P3-7) : **18 / 18**, lancée deux fois de suite, sans erreur dans la console.

La recette d'export (phase 2) passe toujours : **parité de 7 éléments × 30 critères** pour React et pour Vue.

## 5. Captures (dans [captures/](captures/))

| Fichier | Contenu |
|---|---|
| `14-p3-glisser-retour-visuel.png` | **Pendant** un glissement de « + Texte » : contour bleu en pointillés sur le conteneur qui recevra l'élément |
| `15-p3-monter-descendre.png` | Le panneau avec « ↑ Monter » (grisé : déjà premier), « ↓ Descendre » et « Supprimer » ; la barre d'outils avec « ⤓ JSON Schema » |

## 6. Ce qui n'est pas couvert

- **Firefox, Safari**, et le **tactile** (le glisser-déposer HTML5 ne fonctionne pas au doigt) : non testés (P3-10, D56).
- **Accessibilité** au lecteur d'écran du glisser-déposer : non fournie. L'alternative est « Monter / Descendre » (D61).
- **Déplacer d'un conteneur à un autre au clavier** : pas encore possible. « Monter / Descendre » ne change pas de parent.
