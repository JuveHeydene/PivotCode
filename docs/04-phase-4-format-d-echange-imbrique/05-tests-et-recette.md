# 05 — Tests et recette de la phase 4

## 1. Vue d'ensemble

| Niveau | Fin de phase 3 | **Fin de phase 4** |
|---|---|---|
| Tests automatisés (`pnpm test`, 7 paquets) | 236 | **279** (environ 7 s) |
| Recette dans Chrome (`pnpm recette`) | 18 / 18 | **21 / 21** (3 scénarios de phase 4) |
| Recette d'export et de parité (`pnpm recette:export`) | 12 / 12 | **12 / 12** (non-régression) |

## 2. Inventaire (279)

| Paquet | Fichier | Nombre | Contenu |
|---|---|---|---|
| `format-imbrique` (**nouveau**) | `conversion.test.ts` | **21** | À plat → imbriqué : imbrication et ordre, pas de `parentId` ni d'`enfants` vides, `{ ids: false }`, original intact. Imbriqué → à plat : aller-retour, identifiants fabriqués sans collision, tolérance, clé `__proto__`. **Refus** : 6 formes générales, nœud mal formé avec chemin, identifiant en double, erreurs du catalogue avec chemin, identifiant fourni gardé et fabriqué retiré, objet partagé et objet circulaire. **50 000 niveaux.** `estFormatImbrique` |
| | `proprietes.test.ts` | **3** | Aller-retour exact avec identifiants (300) ; même arbre sans identifiants (300) ; jamais d'exception (1 000) |
| `schema-json` | `imbrique.test.ts` | **14** | Schéma récursif ; démonstration acceptée ; **5 familles de limites** de la phase 3 ; la **seule limite restante** (et sa disparition sans identifiants) ; 3 tolérances ; exports conformes (200 suites) ; **cohérence** (1 000 corruptions) |
| | `fichier-publie.test.ts` | 2 | Les **deux** schémas publiés sont à jour |
| | `schema.test.ts`, `coherence.test.ts` | 21 + 2 | Inchangés |
| `editeur` | `Editeur.test.tsx` | 35 | **4 nouveaux** : présentation imbriquée et retour ; ⤓ dans les deux formats ; import d'un document imbriqué **sans identifiants**, puis Ctrl+Z ; document imbriqué invalide, erreur avec chemin |
| | autres | 30 | — |
| `noyau`, `rendu-web`, `generateur-react`, `generateur-vue` | | 102 + 17 + 18 + 14 | Inchangés : **le noyau n'a pas été modifié** |

## 3. Le « test du test » : ce que les tests aléatoires exercent

Comme en phase 3 (D67), on a **compté** ce que génèrent les tests par propriétés. Ce comptage a révélé deux générateurs trop faibles (P4-02, P4-03).

| Test | Avant correction | **Après** |
|---|---|---|
| Aller-retour : taille des documents | 6,8 nœuds en moyenne (max 11), profondeur max 4 | **9,8 nœuds en moyenne (max 25), profondeur max 7** |
| Robustesse : imports qui vont jusqu'au bout | 9 sur 1 000 | **285 sur 1 000** |

Répartition des 1 000 entrées du test de robustesse, après correction (premier code d'erreur) :

| Résultat | Nombre |
|---|---|
| Succès | 285 |
| `FORME_INVALIDE` | 263 |
| `NOEUD_MAL_FORME` | 218 |
| `COMPOSANT_INCONNU` | 95 |
| `PROPRIETE_INCONNUE` | 56 |
| `ENFANTS_INTERDITS` | 32 |
| `IDENTIFIANT_DEJA_UTILISE` | 24 |
| `PROPRIETE_MANQUANTE` | 14 |
| `PROPRIETE_TYPE_INVALIDE` | 13 |

**Cohérence schéma imbriqué ↔ import**, sur 1 000 corruptions aléatoires de la démonstration (lors d'une exécution ; les graines changent à chaque lancement) :

| Catégorie | Nombre | Commentaire |
|---|---|---|
| Refusé par les deux | 771 | |
| Accepté par les deux | 135 | |
| Accepté par le schéma, refusé par l'import | 94 | **Uniquement** pour un identifiant en double : la seule règle non exprimable |
| **Contradiction** | **0** | |

À comparer à la phase 3, où l'écart « accepté par le schéma, refusé par le noyau » couvrait **quatre** familles de règles. Ici, il n'en couvre plus **qu'une**.

## 4. Recette dans Chrome : les scénarios de la phase 4

| N° | Scénario | Résultat |
|---|---|---|
| P4-1 | « Imbriqué » : les boutons apparaissent **dans** leur conteneur, aucun `parentId` ; ⤓ télécharge un **vrai fichier** `interface.imbrique.json`, identique à l'affichage | ✅ |
| P4-2 | Coller un document imbriqué **sans identifiants** : canevas et arbre mis à jour ; identifiants `n1` à `n5` fabriqués | ✅ |
| P4-3 | Document imbriqué invalide (`libelle: 42`) : `PROPRIETE_TYPE_INVALIDE` avec le chemin `racine.enfants[1].enfants[1]` ; document inchangé ; retour à « À plat » | ✅ |

Toute la recette (S0 à S7, bonus, démo, P3-1 à P3-7, P4-1 à P4-3) : **21 / 21**, sans erreur dans la console.

## 5. Captures (dans [captures/](captures/))

| Fichier | Contenu |
|---|---|
| `16-p4-vue-imbriquee.png` | Le document d'exemple présenté « Imbriqué » : `racine` contient `t1` et `c1`, qui contient `b1` et `b2` |
| `17-p4-import-imbrique.png` | L'interface obtenue en collant un document imbriqué sans identifiants |
| `18-p4-erreur-avec-chemin.png` | Un document imbriqué refusé : le code, le message et **le chemin** du nœud fautif |

## 6. Ce qui n'est pas couvert

- Les fonctions `JSON.parse` et `JSON.stringify` du navigateur, à très grande profondeur (D75).
- Le téléchargement du **schéma** imbriqué depuis l'éditeur : il n'existe pas encore (reporté).
