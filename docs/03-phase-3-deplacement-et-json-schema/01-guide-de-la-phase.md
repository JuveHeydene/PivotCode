# 01 — Guide de la phase 3 : le plan prévu

> Rédigé **avant** l'implémentation, le 29/10/2026. Ce qui s'est réellement passé est dans le journal de bord.

---

## Étape 1 — La commande `deplacer-noeud` (noyau)

```ts
{ type: 'deplacer-noeud', id, nouveauParentId, position? }
```

**Règles à vérifier** :
1. le nœud existe et n'est pas la racine ;
2. le nouveau parent existe et accepte des enfants ;
3. le nouveau parent n'est **ni le nœud lui-même, ni un de ses descendants**, sinon on créerait un cycle ;
4. la position est comptée **après** le retrait du nœud, et ramenée dans les limites ;
5. si rien ne change (même parent, même position), on renvoie **le même** document.

**Contrôle du cycle en O(profondeur)** : on remonte du nouveau parent vers la racine en suivant les `parentId`. Si l'on rencontre le nœud déplacé, c'est un cycle. On n'a pas besoin de parcourir tout le sous-arbre : c'est l'intérêt de la double liaison décidée en phase 1 (D8).

**Événement** : `noeud-deplace` (`id`, `ancienParentId`, `nouveauParentId`).

**Tests** : cas nominaux (réordonner, changer de parent), chaque refus, immuabilité, validité du résultat.

---

## Étape 2 — Tests par propriétés des commandes

Avec **fast-check** : générer **au hasard** des centaines de suites de commandes (ajouter, supprimer, modifier, déplacer), les appliquer, et vérifier après **chaque** commande :
- que le document reste **valide** (`validerDocument` = `[]`) ;
- que le document d'avant n'a **pas été modifié**.

C'est le critère de sortie que la proposition de conception fixait pour le noyau (P1, sous-étape 11).

---

## Étape 3 — « Monter » et « Descendre » dans le panneau de propriétés

Deux boutons qui envoient `deplacer-noeud` avec la position −1 ou +1. C'est le chemin **sans souris** : plus accessible, plus simple à tester, et indépendant du glisser-déposer.

---

## Étape 4 — Glisser-déposer

- **API native du navigateur** (HTML5 *Drag and Drop* : `draggable`, `dragstart`, `dragover`, `drop`), sans bibliothèque.
- **Sources** : les boutons de la palette (créer) ; les éléments du canevas et les lignes de l'arbre (déplacer).
- **Cibles** : les éléments du canevas et les lignes de l'arbre. La position de la souris dans l'élément survolé détermine la **zone** :
  - **dedans**, au milieu d'un conteneur ;
  - **avant** ou **après**, près des bords, selon le sens du parent (colonne : haut / bas ; ligne : gauche / droite).
- **Fonctions pures** (testables sans navigateur) : `zoneDepot(rectangle, point, axe, accepteEnfants)` et `cibleDepot(document, cible, zone)`, qui donne `{ parentId, position }`.
- **Retour visuel** : une ligne avant ou après, ou un fond coloré dedans. **Aucun** retour si le dépôt est interdit (cycle, élément dans lui-même).
- **Commande envoyée** : `ajouter-noeud` (depuis la palette) ou `deplacer-noeud` (depuis le canevas ou l'arbre).

---

## Étape 5 — JSON Schema du métamodèle

- Nouveau paquet **`@plateforme/schema-json`**, qui **lit le catalogue** et produit le schéma, comme les générateurs lisent le modèle. Le noyau n'en dépend pas.
- Standard **draft 2020-12**. Chaque composant devient une définition (`$defs`). Chaque propriété est traduite : `texte` → `"type": "string"`, `nombre` → `"type": "number"` (+ `minimum` et `maximum`), `booleen` → `"type": "boolean"`, `choix` → `"enum"`. On ajoute `required`, `default` et le libellé (`title`).
- Le schéma est **publié** dans un fichier versionné. Un test vérifie qu'il est **toujours à jour** avec le catalogue.
- Un bouton dans l'éditeur pour le **télécharger**.

---

## Étape 6 — Cohérence schéma ↔ validateur

Avec **Ajv** (validateur JSON Schema) et **fast-check** :
- tout document **valide pour le noyau** est **valide pour le schéma** ;
- toute violation de forme, de composant, de propriété ou d'enfants interdits est **refusée par les deux** ;
- les violations que le schéma **ne peut pas** voir (identifiant de clé, racine absente, liens incohérents, cycles) sont documentées : c'est le rôle du noyau.

---

## Étape 7 — Recette dans Chrome

Ajouter à la recette des scénarios de glisser-déposer réel : de la palette vers un conteneur, un déplacement dans le canevas, un déplacement dans l'arbre, un dépôt interdit sans effet. Les recettes des phases 1 et 2 doivent toujours passer.

---

## Étape 8 — Documentation

Théorie du JSON Schema et de ses limites, décisions (à partir de D53), structures et complexité, patrons, journal, tests, visite du code, bilan ; mise à jour de `reference/` ; « Évolutions ultérieures » des phases précédentes si nécessaire.
