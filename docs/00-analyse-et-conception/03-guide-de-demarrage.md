> 📁 **Note de classement (21/10/2026)** : ce document s'appelait `conception_plateforme/02_guide_de_demarrage.md` dans le dépôt du mémoire. Son contenu n'a pas été modifié. Dans le texte, « document `01` » = [02-proposition-de-conception-et-phases.md](../00-analyse-et-conception/02-proposition-de-conception-et-phases.md), « document `02` » = [03-guide-de-demarrage.md](../00-analyse-et-conception/03-guide-de-demarrage.md), « document `03` » = [01-guide-de-la-phase.md](../01-phase-1-modele-pivot-et-editeur/01-guide-de-la-phase.md). Voir [docs/README.md §4](../README.md).

# 02 — GUIDE DE DÉMARRAGE : la méthode et la feuille de route

> **Documents de la série**
>
> | N° | Document | Rôle | Quand le lire |
> |---|---|---|---|
> | `01` | Proposition de conception et phases | **La destination** : toute la plateforme, onze phases, choix d'architecture | Pour situer ce que tu fais, pas pour l'apprendre par cœur |
> | **`02`** | **Guide de démarrage (ce document)** | **La méthode** et la **feuille de route par tranches** | Maintenant, puis au début de chaque tranche |
> | `03` | Tranche 1 : l'éditeur et le modèle pivot | **Le travail concret** à faire maintenant, étape par étape | Tous les jours pendant la tranche 1 |
> | `04`, `05`… | Tranches suivantes | Un document par tranche, écrit au moment de la commencer | Plus tard |

---

## 1. Pourquoi tu te sens perdu, et comment on en sort

Le document `01` décrit **onze phases** sur des sujets très différents : compilation, interfaces, bases de données, IA. Personne ne maîtrise tout cela au départ, et personne ne le construit d'un coup.

On en sort avec **quatre règles** :

1. **On apprend juste à temps.** Chaque étape indique ce qu'il faut apprendre **juste avant**. Le reste (CRDT, hachage de Merkle, affinage d'IA…) attendra des mois. Ignore-le.
2. **On avance par tranches verticales.** Une tranche traverse **toutes les couches** (cœur → adaptateurs → interface) sur un périmètre minuscule, et se termine par **quelque chose qui marche et qu'on peut montrer**. On élargit ensuite.
3. **Tu écris le code toi-même.** Les documents de tranche te disent quoi faire et comment vérifier, avec des indices repliés. Tu ouvres un indice seulement si tu bloques.
4. **On écrit le mémoire en même temps.** Chaque étape se termine par quelques lignes de journal ; chaque tranche, par une page réutilisable dans le mémoire.

---

## 2. L'idée centrale à garder en tête

> Un **document JSON** (le modèle pivot) décrit l'application.
> Le **cœur** garde ce document, le valide et le modifie **uniquement par des commandes**.
> Tout le reste est **périphérie** : l'éditeur visuel **lit** le document et **envoie** des commandes ; plus tard, les générateurs **lisent** le document et **écrivent** du code React ou Vue ; l'IA **propose** des commandes.

C'est l'architecture **hexagonale** appliquée à notre plateforme. Le cœur ne connaît aucune technologie ; chaque technologie s'y branche par un **port** (une interface définie par le cœur). Le document `03`, sections 1 et 2, explique ce vocabulaire en détail, avec les décisions prises et leur justification.

```
                ┌─────────────── PÉRIPHÉRIE ───────────────┐
                │                                          │
  Éditeur visuel (tranche 1) ─┐                ┌─ Générateurs React, Vue (tranche 3)
  Assistant IA (plus tard) ───┤                ├─ Stockage (tranche 1)
  Import de code (plus tard) ─┤                ├─ Connecteurs d'API (plus tard)
                              ▼                ▼
                ╔═══════════════════ CŒUR ═══════════════════╗
                ║  modèle pivot · commandes · validation      ║
                ║  catalogue des composants (métamodèle)      ║
                ╚═════════════════════════════════════════════╝
```

---

## 3. Les choix techniques de départ (déjà faits pour toi)

| Choix | Raison courte | Détail |
|---|---|---|
| **TypeScript** partout | Le même langage pour le cœur, l'éditeur et les générateurs | `01`, section 8 |
| **Monodépôt pnpm** : un paquet par module (`packages/noyau`, `apps/editeur`, puis `packages/generateur-react`…) | Chaque paquet déclare ses dépendances ; avec pnpm, le noyau **ne peut pas** importer React | `03`, décision D4 |
| **Noyau compilé sans les types du navigateur** | `document` et `window` y provoquent une erreur de compilation | `03`, décision D5 |
| **Commandes = données JSON** | Sérialisables, journalisables, produisibles par une IA | `03`, décision D3 |
| **Document immuable** | React détecte les changements ; annuler / rétablir devient simple | `03`, décision D7 |
| **Vitest** pour les tests, **Vite + React** pour l'éditeur | Rapides, standards | — |

Ces choix ont été **vérifiés sur un projet d'essai** : l'éditeur Vite importe directement le TypeScript du noyau, et l'ajout de `import React` ou de `document` dans le noyau fait bien échouer la compilation.

---

## 4. Échauffement facultatif (2 à 3 heures)

Si tu n'as jamais écrit de TypeScript, fais cet exercice **avant** le document `03`. Il montre en un seul fichier l'idée « un arbre → plusieurs sorties ».

1. Lis dans le *TypeScript Handbook* (typescriptlang.org) : *Everyday Types*, *Narrowing*, *Object Types*.
2. Dans un dossier d'essai, crée `jouet.ts` et tape (sans copier-coller) :

```ts
type TypeNoeud = 'Texte' | 'Bouton' | 'Conteneur';

interface Noeud {
  id: string;
  type: TypeNoeud;
  props: Record<string, string>;
  enfants: Noeud[];
}

const modele: Noeud = {
  id: 'racine', type: 'Conteneur', props: { direction: 'column' },
  enfants: [
    { id: 't1', type: 'Texte', props: { contenu: 'Bienvenue' }, enfants: [] },
    { id: 'b1', type: 'Bouton', props: { libelle: 'Valider' }, enfants: [] },
  ],
};

function versReact(n: Noeud, ind = '    '): string {
  switch (n.type) {
    case 'Texte': return `${ind}<p>${n.props.contenu}</p>`;
    case 'Bouton': return `${ind}<button>${n.props.libelle}</button>`;
    case 'Conteneur': return [
      `${ind}<div style={{ display: 'flex', flexDirection: '${n.props.direction}' }}>`,
      ...n.enfants.map((e) => versReact(e, ind + '  ')),
      `${ind}</div>`,
    ].join('\n');
  }
}

function versVue(n: Noeud, ind = '  '): string {
  switch (n.type) {
    case 'Texte': return `${ind}<p>${n.props.contenu}</p>`;
    case 'Bouton': return `${ind}<button>${n.props.libelle}</button>`;
    case 'Conteneur': return [
      `${ind}<div :style="{ display: 'flex', flexDirection: '${n.props.direction}' }">`,
      ...n.enfants.map((e) => versVue(e, ind + '  ')),
      `${ind}</div>`,
    ].join('\n');
  }
}

console.log(`export default function Page() {\n  return (\n${versReact(modele)}\n  );\n}`);
console.log(`<template>\n${versVue(modele)}\n</template>`);
```

3. Exécute-le avec `npx tsx jouet.ts`.

**Ce que tu dois en retenir :** le même arbre produit deux codes différents, et ajouter une troisième cible ne touche pas au modèle. Ce fichier mélange encore tout (modèle, générateurs, affichage) ; le document `03` range chaque chose à sa place. Dans `03`, l'arbre sera stocké **à plat** et les composants seront décrits par des **données**.

---

## 5. Feuille de route par tranches

Chaque tranche aura son propre document (`03`, `04`…), rédigé au moment de la commencer, avec ce qu'on aura appris de la précédente.

| Tranche | Document | Résultat démontrable | Nouvelles notions | Phase du doc `01` |
|---|---|---|---|---|
| **T1** | **`03`** | **Poser un composant dans l'éditeur et le voir dans le modèle pivot, et inversement** | Architecture hexagonale, ports et adaptateurs, commandes, immuabilité, validation, patron Observateur | P1 (partie), P2 (début) |
| T2 | `04` | Déplacer des nœuds, glisser-déposer, annuler / rétablir, métamodèle décrit en **JSON Schema** | Glisser-déposer, détection de cycles, JSON Schema | P1, P2 |
| T3 | `05` | **Exporter le même modèle en projet React et en projet Vue** qui démarrent | Patrons Visiteur et Stratégie, génération de code, paquets générateurs | P4 (début) |
| T4 | `06` | Ajouter un composant **par un plugin** (paquet séparé), sans modifier le noyau | Registre, points d'extension, micro-noyau | P1, P2 |
| T5 | `07` | Styles, jetons de design, pages et navigation | Système de design, routage | P2 |
| T6 | `08` | Variables, expressions, événements : une application qui réagit | Analyseur d'expressions, interpréteur, graphe de dépendances | P3 |
| T7 et suivantes | — | Modèle de données et backend généré, connexion aux API, agent IA | Voir le document `01` | P5, P6, P7 |

**Périmètre du mémoire** (rappel du document `01`, section 6.2) : T1 à T6, puis une version réduite du backend (P5), de la connexion aux API (P6) et de l'agent IA de connexion (P7).

---

## 6. Ressources, au moment où tu en as besoin

| Moment | Ressource | Pour quoi |
|---|---|---|
| Échauffement, T1 | *TypeScript Handbook* : *Everyday Types*, *Narrowing*, *Object Types*, *Generics* | Le langage |
| T1, étape 1 | Documentation de pnpm : *Workspaces* | Le monodépôt |
| T1, étape 4 | Documentation de Vitest : *Getting Started* | Les tests |
| T1, étape 6 | *refactoring.guru* (en français) : patrons **Observateur** et **Commande** | Le service applicatif |
| T1, avant l'étape 7 | *react.dev → Learn* : *Describing the UI*, *Adding Interactivity*, *Managing State* | L'éditeur |
| T1, pour le mémoire | Alistair Cockburn, article *Hexagonal Architecture* (2005), disponible sur son site | La référence de l'architecture hexagonale |
| T2 | *Understanding JSON Schema* (json-schema.org) | Le métamodèle formel |
| T3 | *refactoring.guru* : **Visiteur**, **Stratégie** | Les générateurs |
| Après T3 | Brambilla, Cabot, Wimmer, *Model-Driven Software Engineering in Practice* | Le vocabulaire IDM (M2, M1, M2M, M2T) |
| T6 | Robert Nystrom, *Crafting Interpreters* (gratuit en ligne) | Langage d'expressions, interpréteur |

---

## 7. Ta routine de travail

- **Au début de chaque séance** : relis l'étape en cours du document de tranche, et **seulement** elle.
- **Pendant** : avance par petits pas qui compilent et dont les tests passent. Lance `pnpm test` souvent.
- **À la fin de chaque séance** : un commit Git, et quelques lignes dans `journal.md` (ce que tu as fait, une décision, une difficulté).
- **À la fin de chaque étape** : la vérification ✅ du document, et la question 📓 du journal.

### Quand tu es bloqué
1. **Réduis le problème** jusqu'à une tâche faisable en une heure.
2. **Fais marcher d'abord, améliore ensuite.**
3. **Ouvre l'indice** de l'étape.
4. **Demande avec un contexte précis** (à moi ou à ton encadreur) : « voici l'étape, voici mon fichier, voici ce que j'attends, voici ce qui se passe ». Je peux relire ton code et t'expliquer une notion au moment où tu en as besoin.

---

## 8. Ta liste pour cette semaine

- [ ] (Facultatif) Faire l'échauffement de la section 4
- [ ] Lire les sections 0, 1 et 2 du document `03` et savoir **réciter le circuit d'une commande**
- [ ] Étape 1 du document `03` : monodépôt créé, premier test qui passe, expérience « import React interdit » faite
- [ ] Étape 2 : types du modèle pivot + document écrit à la main dans le journal
- [ ] Étape 3 : catalogue des trois composants
- [ ] Commit à chaque étape
