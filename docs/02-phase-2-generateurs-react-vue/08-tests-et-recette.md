# 08 — Tests et recette de la phase 2

## 1. Vue d'ensemble

| Niveau | Fin de phase 1 | **Fin de phase 2** |
|---|---|---|
| Tests automatisés (`pnpm test`) | 113 | **174** |
| Recette de la phase 1 dans Chrome (`pnpm recette`) | 11 / 11 | **11 / 11** (non-régression) |
| Recette d'export et de parité (`pnpm recette:export`) | — | **12 / 12** |

```bash
pnpm test              # 174 tests, dans les 5 paquets
pnpm typecheck         # 0 erreur
pnpm recette           # phase 1 : 11 scénarios dans Chrome
pnpm recette:export    # phase 2 : export, installation, construction, parité (≈ 7 s)
```

## 2. Inventaire des tests (174)

| Paquet | Fichier | Nombre | Nouveautés de la phase 2 |
|---|---|---|---|
| `noyau` | `catalogue.test.ts` | 7 | Valeur par défaut hors bornes refusée |
| | `validation.test.ts` | 36 | Nombre hors bornes refusé ; « propriété inconnue » corrigée (P2-01) |
| | `commandes.test.ts` | 30 | Nouvelles propriétés acceptées ; minimum et couleur hors palette refusés ; valeurs par défaut à jour |
| | `editeur-applicatif.test.ts` | 14 | — |
| `rendu-web` | `rendu-web.test.ts` | **17** | **Complétude des règles** ; palette ; traduction de chaque composant ; valeurs par défaut lues dans le catalogue ; arbre et ordre ; composant inconnu (erreur ou encadré) ; outils CSS ; noms de paquet |
| `generateur-react` | `generateur-react.test.ts` | **18** | **Code exact** pour un petit document ; **déterminisme** ; ordre ; `disabled` ; refus d'un composant sans règle ; **7 cas d'échappement** ; projet complet ; `package.json` ; titre échappé ; CSS commun |
| `generateur-vue` | `generateur-vue.test.ts` | **14** | Mêmes catégories, adaptées à Vue ; « aucune interpolation `{{` ne subsiste » ; texte collé aux balises |
| `editeur` | `Editeur.test.tsx` | 23 | **Aperçu** (repères retirés, vrai `disabled`, pas de sélection) ; nouvelles propriétés dans le canevas et dans le panneau ; **Exporter React / Vue** (adaptateur espion) |
| | `adaptateurs/telechargement.test.ts` | **2** | Contenu du zip intact (UTF-8 compris) ; zip **déterministe** |
| | `outils-editeur.test.ts` | 9 | — |
| | `adaptateurs/depot-local-storage.test.ts` | 4 | — |

## 3. Recette d'export et de parité (`apps/editeur/recette/export.mjs`)

### Ce qu'elle fait
1. Construit l'éditeur et le sert (`vite preview`).
2. Dans Chrome : vide le stockage, clique « Charger la démo », puis « 👁 Aperçu ».
3. Relève la **signature** du canevas : pour chaque élément, la balise, le texte, `disabled` et **27 styles calculés** par le navigateur.
4. Clique « ⤓ Exporter React », récupère le **vrai** `.zip`, le décompresse dans un dossier temporaire, puis lance `pnpm install`, `vite build` et `vite preview`. Elle ouvre ensuite l'application et relève sa signature.
5. Fait de même pour Vue.
6. Compare les signatures et vérifie l'absence d'erreur dans les consoles.

### Résultat (29/10/2026)

```
✅ Canevas en aperçu : 7 éléments relevés
✅ React : application-generee-react.zip téléchargé (7 fichiers)
✅ React : dépendances installées
✅ React : le projet généré se construit (vite build)
✅ React : PARITÉ avec le canevas sur 7 éléments × 30 critères
✅ React : aucune erreur dans la console
✅ Vue : application-generee-vue.zip téléchargé (7 fichiers)
✅ Vue : dépendances installées
✅ Vue : le projet généré se construit (vite build)
✅ Vue : PARITÉ avec le canevas sur 7 éléments × 30 critères
✅ Vue : aucune erreur dans la console
✅ Éditeur : aucune erreur dans la console
```

### Le test du test : la recette détecte-t-elle vraiment un écart ?

Un test qui ne peut pas échouer ne prouve rien. On a donc **saboté volontairement** le générateur Vue : le dernier style de chaque élément était supprimé. Résultat :

```
❌ Vue : parité — 6 écart(s) :
   racine.borderTopLeftRadius : 12px ≠ 0px
   racine>p[0].textAlign : center ≠ start
   racine>p[1].textAlign : left ≠ start
   racine>div[2]>button[0].cursor : pointer ≠ default
   racine>div[2]>button[1].cursor : pointer ≠ default
   racine>div[2]>button[2].opacity : 0.45 ≠ 1
```

Ce sont **exactement** les 6 propriétés supprimées. Le générateur a ensuite été restauré, et la recette est revenue à 12/12.

## 4. Correspondance objectifs ↔ preuves

| Objectif | Preuve |
|---|---|
| O1, O2 (mise en page, style) | Tests du canevas et du panneau ; capture `11-editeur-demo-apercu.png` |
| O3 (compatibilité) | Document d'exemple de la phase 1 toujours valide ; valeurs par défaut lues dans le catalogue |
| O4 (une seule source de règles) | Le canevas n'importe que `arbreWeb` ; parité par construction |
| O5, O6 (projets qui démarrent) | Recette : installation, construction, aperçu |
| O7 (déterminisme) | 3 tests (React, Vue, zip) |
| O8 (sûreté) | 15 tests d’échappement (9 React, 6 Vue) ; texte piège identique dans les 3 rendus |
| O9 (complétude) | Test de complétude |
| O10 (export depuis l'éditeur) | Tests de l'éditeur (espion) ; recette (vrais téléchargements) |
| O11 (parité mesurée) | Recette : 7 éléments × 30 critères, pour React et pour Vue |
| O12 (noyau non modifié dans sa structure) | `git diff` (journal, étape 22) ; tous les tests de la phase 1 passent |

## 5. Captures (dans [captures/](captures/))

| Fichier | Contenu |
|---|---|
| `09-demo-construction-souris.png` | L'éditeur en **édition** : les nouvelles propriétés (Couleur, Pleine largeur, Marge externe…) apparaissent dans le panneau |
| `10-apercu-canevas.png` | Le canevas en **aperçu**, document de démonstration |
| `11-editeur-demo-apercu.png` | L'éditeur entier en aperçu, avec les boutons d'export |
| `12-application-react-generee.png` | **L'application React générée**, construite et lancée |
| `13-application-vue-generee.png` | **L'application Vue générée**, construite et lancée |

## 6. Ce qui n'est pas couvert

- **La parité au pixel près** n'est pas mesurée : on compare les styles calculés, pas les pixels (D51).
- **Les autres navigateurs** (Firefox, Safari) n'ont pas été testés.
- **Le code généré n'est pas relu par un linter** (ESLint). Seule sa construction par Vite est vérifiée.
- **Le cas `{{ x }}` en Vue** est vérifié dans le code produit (tests) et à l'écran (recette), mais pas sur toutes les combinaisons de caractères spéciaux.
