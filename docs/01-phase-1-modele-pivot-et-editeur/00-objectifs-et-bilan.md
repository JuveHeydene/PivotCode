# Phase 1 — Le modèle pivot et l'éditeur visuel : objectifs et bilan

| | |
|---|---|
| **Période** | 19 → 20 octobre 2026 (close le 20/10/2026, présentée au professeur le même jour) |
| **Correspond à** | Tranche **T1** du [guide de démarrage](../00-analyse-et-conception/03-guide-de-demarrage.md) ; lots **P1 (partie)** et **P2 (début)** de la [proposition de conception](../00-analyse-et-conception/02-proposition-de-conception-et-phases.md) |
| **Objectifs du projet servis** | OG1, OQ1, OQ2, OQ3, OQ5, OQ6 ([objectifs du projet](../00-analyse-et-conception/00-objectifs-du-projet.md)) |
| **Plan suivi** | [01-guide-de-la-phase.md](01-guide-de-la-phase.md) (étapes 1 à 13 + bonus) |

---

## 1. Objectifs de la phase (fixés au début)

### Objectif principal
> **Poser un composant dans l'éditeur et le voir dans le modèle pivot, et inversement.**

### Objectifs détaillés

| N° | Objectif | Critère de réussite |
|---|---|---|
| O1 | Un **monodépôt** dont le noyau ne peut pas dépendre de React ni du navigateur | `import React` ou `document` dans le noyau ⇒ erreur de compilation (S9) |
| O2 | Un **métamodèle v1** : document à plat, nœuds, catalogue de 3 composants (Texte, Bouton, Conteneur) | Le document d'exemple écrit à la main est déclaré valide |
| O3 | Une **validation complète** (R1 à R8) de tout document venu de l'extérieur | Un test par règle ; ne plante jamais, même sur `null` |
| O4 | Des **commandes** (ajouter, supprimer, modifier, remplacer) **pures et immuables** | Le document d'origine n'est jamais modifié ; le résultat est toujours valide |
| O5 | Un **service** (ports, Observateur, persistance) testable sans navigateur | Tests avec doublures `n1`, `n2`… |
| O6 | **Sens éditeur → modèle** : palette, arbre, canevas, panneau de propriétés **généré** | Le JSON change à chaque action (S1, S2, S7) |
| O7 | **Sens modèle → éditeur** : édition du JSON, avec garde-fou | Le canevas suit (S3, S4) ; un JSON invalide est refusé avec des erreurs claires (S5) |
| O8 | **Persistance** dans le navigateur | Le document survit à un rechargement (S6) |
| O9 (bonus) | **Annuler / rétablir** | Ctrl+Z / Ctrl+Y |

---

## 2. Bilan

| N° | Atteint ? | Preuve |
|---|---|---|
| O1 | ✅ | S9 : `TS2307 Cannot find module 'react'` et `TS2584 Cannot find name 'document'` |
| O2 | ✅ | `test/exemple.ts` (`satisfies DocumentPivot`) est valide |
| O3 | ✅ | 35 tests de validation, dont un arbre de 50 000 niveaux et des clés `__proto__` |
| O4 | ✅ | 27 tests de commandes, chacun vérifiant l'immuabilité et la validité du résultat |
| O5 | ✅ | 14 tests du service |
| O6 | ✅ | S1, S2, S7 dans jsdom **et** dans Chrome |
| O7 | ✅ | S3, S4, S5a, S5b dans jsdom **et** dans Chrome |
| O8 | ✅ | S6 |
| O9 | ✅ | Tests du service et de l'interface ; recette Chrome |

**Chiffres** : 113 tests automatisés (82 noyau + 31 éditeur) ; recette Chrome 11/11, sans erreur console ; 32 décisions documentées (D1 à D32) ; 13 problèmes rencontrés et corrigés (P1 à P13).

**Hors objectifs, mais fait** : la propriété booléenne `desactive` (D26), les boutons « Charger l'exemple » et « Nouveau document », et la recette automatisée avec captures.

**Non fait (reporté, hors périmètre)** : déplacement de nœuds et glisser-déposer, JSON Schema, regroupement des frappes dans l'historique. Commit Git : à faire par l'auteur (problème P1).

### Ce qu'il faut retenir de la phase en 5 phrases

1. Le **modèle pivot** est un document JSON **à plat** (`noeuds: { id → nœud }`). Il ne contient aucune technologie et c'est la **seule source de vérité**.
2. Le **noyau** (domaine + application) ne connaît ni React ni le navigateur, et **le compilateur le garantit** (pnpm + `"lib": ["ES2022"]`). L'éditeur est un **adaptateur** branché sur des **ports**.
3. L'interface ne modifie jamais le modèle : elle envoie des **commandes** (des données). Le noyau les applique avec des **fonctions pures** qui renvoient un **nouveau document immuable**.
4. Les deux sens passent par **le même circuit**. Éditeur → modèle : `ajouter-noeud`, `modifier-propriete`, `supprimer-noeud`. Modèle → éditeur : `remplacer-document`. Le canevas ne fait qu'**observer** le document.
5. Tout ce qui vient de l'extérieur (JSON collé, stockage) est **entièrement validé** par 8 règles (R1–R8) avant d'être accepté. Les commandes, elles, sont vérifiées par les tests : chaque document qu'elles produisent est revalidé.

---

## 3. Les documents de la phase, dans l'ordre de lecture

| N° | Document | Contenu | Temps |
|---|---|---|---|
| 01 | [01-guide-de-la-phase.md](01-guide-de-la-phase.md) | Le plan **prévu** : étapes 1 à 13, avec indices et vérifications | (référence) |
| 02 | [02-fiche-etape-02-types-modele-pivot.md](02-fiche-etape-02-types-modele-pivot.md) | Fiche d'étude de l'étape 2 (notions à lire, liens) | 10 min |
| 03 | [03-conception-architecture.md](03-conception-architecture.md) | **Le document de conception** : architecture hexagonale, 17 diagrammes UML, règle de dépendance, circuit d'une commande | 45 min |
| 04 | [04-metamodele.md](04-metamodele.md) | **Le métamodèle** : M0 à M3, typage linguistique / ontologique, R1 à R8, conformité, versionnement | 40 min |
| 05 | [05-decisions.md](05-decisions.md) | **Les décisions** D1 à D32, argumentées | 40 min |
| 06 | [06-structures-de-donnees-et-complexite.md](06-structures-de-donnees-et-complexite.md) | Structures de données et complexité de chaque opération | 25 min |
| 07 | [07-patrons-de-conception.md](07-patrons-de-conception.md) | Les 15 patrons de conception, avec fichier et ligne | 30 min |
| 08 | [08-journal-de-bord.md](08-journal-de-bord.md) | Ce qui a été fait, dans l'ordre ; **les 13 problèmes et leur correction** | 20 min |
| 09 | [09-tests-et-recette.md](09-tests-et-recette.md) | Stratégie de test, inventaire, scénarios S0 à S9, captures | 15 min |
| 10 | [10-visite-guidee-du-code.md](10-visite-guidee-du-code.md) | Le code fichier par fichier, et une action suivie à travers le code | 30 min |
| 11 | [11-reponses-journal-du-guide.md](11-reponses-journal-du-guide.md) | Réponses aux questions « 📓 Journal » du guide | 10 min |
| 12 | [12-presentation-au-professeur.md](12-presentation-au-professeur.md) | Déroulé de la démonstration, questions probables et réponses | 20 min |

**Images de la phase (figées)** :
- [captures/](captures/) : les captures de la recette du 20/10/2026 ;
- [diagrammes/](diagrammes/) : les 20 diagrammes, chacun en `.png`, `.svg` et `.mmd`. Exemple LaTeX : `\includegraphics[width=\linewidth]{diagrammes/02-architecture-hexagonale.png}`.

Les diagrammes des documents sont écrits en **Mermaid**. Dans VS Code, installe l'extension *Markdown Preview Mermaid Support* (`bierner.markdown-mermaid`), puis ouvre l'aperçu avec `Ctrl+Maj+V`.

### Arborescence du code à la fin de la phase

```
platforme_no_and_low_code/
├── package.json, pnpm-workspace.yaml, pnpm-lock.yaml, .gitignore
├── packages/noyau/        ← LE CŒUR (TypeScript pur, aucune dépendance de production)
│   ├── src/domaine/       ← métamodèle, catalogue, validation, commandes (fonctions pures)
│   ├── src/application/   ← ports + EditeurApplicatif (cas d'utilisation, Observateur, historique)
│   └── test/              ← 82 tests + doublures (GenerateurSequentiel, DepotMemoire)
├── apps/editeur/          ← LA PÉRIPHÉRIE (React 19 + Vite 8)
│   ├── src/adaptateurs/   ← GenerateurUuid, DepotLocalStorage, useDocument
│   ├── src/composants/    ← Palette, Arbre, Canevas, PanneauProprietes, VueModelePivot
│   ├── src/Editeur.tsx, outils-editeur.ts, editeur.css
│   ├── src/main.tsx       ← racine de composition
│   └── recette/recette.mjs← recette de bout en bout (Chrome + Playwright)
└── docs/
```

---

## 4. Évolutions ultérieures

> Cette section liste ce qui, réalisé dans cette phase, a été **révisé dans une phase suivante**. Le contenu de la phase n'est pas réécrit : on ajoute seulement un lien vers la phase où la révision est documentée.

| Élément de la phase 1 | Révisé en | Lien |
|---|---|---|
| *(aucune révision pour l'instant)* | | |
