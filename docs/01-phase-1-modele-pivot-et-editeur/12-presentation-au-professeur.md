# 12 — Préparer la présentation de demain

## 1. Avant d'entrer dans la salle (10 minutes)

```bash
cd ~/Lectures_\&_projects/Projets/platforme_no_and_low_code
pnpm test        # doit afficher 82 passed puis 31 passed
pnpm dev         # puis ouvrir http://localhost:5173
```

- Dans le navigateur, clique sur **« Charger l'exemple »** pour partir d'un état connu.
- Garde ouverts dans VS Code : `packages/noyau/src/domaine/noeud.ts`, `composants-base.ts`, `commandes.ts`, `application/editeur-applicatif.ts` et `apps/editeur/src/main.tsx`.
- Si quelque chose ne marche pas : les captures de [captures/](captures/) montrent tout. La démonstration a été déroulée automatiquement dans Chrome cette nuit.

---

## 2. Déroulé proposé (≈ 12 minutes)

| Temps | Ce que tu montres | Ce que tu dis |
|---|---|---|
| 1 min | L'éditeur ouvert : palette, arbre, canevas, propriétés, JSON | « Une plateforme low-code dont la **seule source de vérité** est un **modèle pivot** indépendant des technologies. Voici la tranche 1 : l'éditeur visuel et le modèle pivot se répondent **dans les deux sens**. » |
| 2 min | **Éditeur → modèle** : « Nouveau document », « + Texte », taper « Inscription », taille « grand » ; clic sur le fond, « + Conteneur », direction « ligne » ; « + Bouton » × 2, libellés, variante « secondaire » | « À chaque action, regardez le JSON à droite : il change **immédiatement**. L'interface ne modifie jamais le modèle elle-même : elle envoie des **commandes**. » |
| 2 min | **Modèle → éditeur** : « Modifier », changer un libellé, « Appliquer » ; puis ajouter un nœud à la main | « Le chemin inverse passe par **le même circuit** : une commande `remplacer-document`. Le canevas n'a **aucun code spécial** pour ce sens, il observe le document. » |
| 1 min | **Garde-fou** : mettre un enfant dans un Texte et une variante « fluo » → liste d'erreurs ; puis supprimer une virgule → erreur de syntaxe | « Tout ce qui vient de l'extérieur est **validé par 8 règles** avant d'être accepté. Le document affiché est **toujours** conforme au métamodèle. » |
| 30 s | Ctrl+Z, Ctrl+Y ; recharger la page (F5) | « Annuler et rétablir sont presque gratuits grâce à l'immuabilité. Le document est conservé dans le navigateur. » |
| 3 min | Diagramme hexagonal ([03 §2.2](03-conception-architecture.md)), puis `main.tsx` | « Architecture **hexagonale**. Le noyau ne connaît ni React ni le navigateur. Les identifiants et le stockage sont des **ports**. `main.tsx` est le **seul** endroit qui choisit les implémentations. » |
| 1 min | **Preuve de la frontière** : taper `import React from 'react'` dans un fichier du noyau → `pnpm typecheck` échoue | « La frontière n'est pas une convention : **le compilateur l'impose**, grâce à pnpm et à un noyau compilé sans les types du navigateur. » |
| 1,5 min | Les niveaux M0 à M3 ([04 §2](04-metamodele.md)) et le catalogue `composants-base.ts` | « Le métamodèle a deux parties : la **structure** (`Noeud`, en TypeScript) et le **vocabulaire** (le catalogue, des données). Ajouter un composant, c'est ajouter une donnée : la palette, le formulaire et la validation suivent automatiquement. » |
| 30 s | `pnpm test` | « 113 tests automatisés, plus une recette de bout en bout dans un vrai Chrome. » |

---

## 3. Questions probables et réponses

**« Pourquoi un modèle pivot plutôt que générer directement du code ? »**
→ Avec N technologies sources et M cibles, des traducteurs directs coûtent N × M. Avec un pivot, ils coûtent N + M. Le pivot est aussi ce que l'IA produira (du JSON validable), et non du code arbitraire.

**« Pourquoi stocker le modèle à plat plutôt qu'en arbre imbriqué ? »**
→ Accès à n'importe quel nœud en O(1) par son identifiant. Une modification ne recopie que le nœud touché et son parent. Les identifiants stables serviront aussi à la collaboration et aux références entre éléments. La contrepartie, la double liaison `parentId` / `enfants`, est vérifiée par la règle R7 ([04 §6](04-metamodele.md)).

**« Pourquoi des commandes plutôt que modifier l'objet directement ? »**
→ Un point d'entrée unique, validé. Une commande est une donnée JSON : elle peut être journalisée, rejouée, envoyée à un serveur, **produite par une IA**. Cela ouvre l'annulation, la collaboration et le mode « proposition » de l'IA.

**« Pourquoi l'immuabilité ? Ce n'est pas coûteux ? »**
→ React détecte un changement en comparant **des références** (O(1)). L'historique coûte une référence par étape. La copie est **superficielle**, et les nœuds non modifiés sont **partagés** (c'est testé). Elle coûte O(n) en références, quelques dizaines de microsecondes pour 1 000 nœuds. Si cela devenait un problème, on passerait à une structure persistante en O(log n), sans changer l'API ([06](06-structures-de-donnees-et-complexite.md)).

**« Qu'est-ce qui garantit que le modèle est toujours valide ? »**
→ Deux mécanismes. (1) Ce qui vient de l'extérieur (JSON, stockage) est **validé** par `validerDocument` (R1–R8) et recopié. (2) Les commandes maintiennent les invariants **par construction**, et chaque test de commande **revalide** le résultat. Le service ne détient donc jamais un document invalide.

**« Comment détectez-vous les cycles ? Quelle complexité ? »**
→ Parcours en profondeur **itératif** (pile + ensemble `vus`). Un nœud rencontré deux fois signale un cycle ou un partage ; un nœud jamais rencontré est orphelin. Le coût est O(n + e). Le parcours est itératif plutôt que récursif pour ne pas déborder la pile d'appels : c'est testé sur 50 000 niveaux ([06 §3](06-structures-de-donnees-et-complexite.md)).

**« Où est le métamodèle exactement ? »**
→ Au niveau M2. La **structure** est dans `noeud.ts`, le **vocabulaire** dans `composant.ts` et `composants-base.ts`, et les **contraintes** (l'équivalent d'OCL) dans `validation.ts`. Le M1, c'est le JSON affiché. Le M0, c'est ce que montre le canevas. Le M3, c'est le système de types de TypeScript ([04](04-metamodele.md)).

**« Quels patrons de conception avez-vous utilisés ? »**
→ Hexagonal, Commande (en données), Observateur, Adaptateur, injection de dépendances avec racine de composition, Stratégie, Interprète, Composite, **Type Object** (le catalogue), Façade, Mémento (historique), objets immuables, type Résultat, doublures de test, interface pilotée par les métadonnées ([07](07-patrons-de-conception.md)).

**« Pourquoi pnpm et pas npm ? »**
→ pnpm ne laisse un paquet importer **que** ce qu'il déclare. Le noyau ne déclare pas React, donc il ne **peut** pas l'importer. Avec npm, tout est installé à plat et l'import « par accident » serait possible (D4).

**« Comment allez-vous générer du code React ou Vue ? »**
→ Le canevas est déjà un **interprète** du modèle : parcours récursif + table « composant → rendu ». Un générateur a la même forme, mais il **écrit du texte** au lieu d'afficher. Ce seront de nouveaux paquets du monodépôt (`generateur-react`…), **sans modifier le noyau** (tranche 3).

**« Et l'IA ? »**
→ Elle produira des **commandes** ou des **documents** en JSON, qui passeront **par la même validation** que le JSON tapé à la main. Rien de ce qu'elle produit ne peut corrompre le modèle.

**« Qu'est-ce qui n'est pas encore fait ? »** (sois honnête, c'est apprécié)
→ Une seule page ; pas encore de données, de logique ni d'événements ; pas de glisser-déposer ni de déplacement de nœuds (tranche 2) ; validation écrite à la main (JSON Schema prévu en tranche 2) ; pas de générateur de code (tranche 3) ; chaque frappe crée une entrée d'historique.

---

## 4. Les phrases à retenir

1. « Le modèle pivot est la **seule source de vérité** ; l'éditeur n'en est qu'**une vue** et **un client**. »
2. « Les deux sens passent par **le même circuit** : commande → noyau → nouveau document → notification. »
3. « La frontière de l'hexagone est **garantie par le compilateur**, pas seulement par la discipline. »
4. « **Rien** n'entre dans le modèle sans être validé. »
5. « Ajouter un composant, c'est **ajouter une donnée**, pas du code. »
