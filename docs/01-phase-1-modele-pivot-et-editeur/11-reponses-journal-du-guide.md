# 11 — Réponses aux questions « 📓 Journal » du guide

> Le guide te demande de répondre **avec tes mots**. Voici des réponses complètes pour vérifier ta compréhension. Reformule-les avant de les recopier dans ton journal.

---

## Étape 1 — Pourquoi le noyau ne peut-il pas importer React ? Quelles **deux** protections l'en empêchent ?

Le noyau est le cœur de l'hexagone : il ne doit dépendre d'aucune technologie, pour pouvoir tourner ailleurs (serveur, tests, IA) et rester stable quand l'interface change.

1. **D4 — pnpm** : chaque paquet ne voit que les dépendances **qu'il déclare**. Le `package.json` du noyau ne déclare pas React, donc `packages/noyau/node_modules/react` n'existe pas : `Cannot find module 'react'`. (Avec npm, React serait installé à plat à la racine et l'import « marcherait par accident ».)
2. **D5 — `"lib": ["ES2022"]` sans `"DOM"` et `"types": []`** : les types du navigateur (`document`, `window`, `localStorage`…) n'existent pas pour le compilateur du noyau : `Cannot find name 'document'`.

Vérifié (scénario S9) : les deux erreurs apparaissent bien. En bonus, cette protection a aussi attrapé `structuredClone` (journal, P4).

---

## Étape 2 — Pourquoi stocker `parentId` **et** `enfants`, alors que l'un se déduit de l'autre ?

- **Ce qu'on y gagne** : la **vitesse dans les deux directions**. `enfants` permet de descendre (et donne l'**ordre** d'affichage) ; `parentId` permet de **remonter** en O(1). Sans `parentId`, trouver le parent d'un nœud demanderait de parcourir tous les nœuds, en O(n). On en a besoin pour supprimer un nœud (le retirer de son parent) et pour la palette (« ajouter à côté »).
- **Le risque** : une **redondance** peut devenir **incohérente**. Par exemple, `b1` est listé dans `c1.enfants` mais son `parentId` vaut `racine`.
- **Qui garantit la cohérence ?**
  - **les commandes** mettent toujours à jour les deux côtés, ce qui est prouvé par les tests (chaque résultat est revalidé) ;
  - **la validation** (règle **R7**, plus R8 pour la forme d'arbre) vérifie tout ce qui vient de l'extérieur.
  - C'est donc le **noyau**, et lui seul.

---

## Étape 5 — Pourquoi le domaine reçoit-il `nouvelId` en paramètre au lieu d'appeler directement une fonction aléatoire ?

- **Pureté** : une fonction du domaine doit donner **le même résultat pour les mêmes entrées**. Un appel à `crypto.randomUUID()` à l'intérieur la rendrait non déterministe (et dépendante du navigateur, ce que D5 interdit d'ailleurs).
- **Tests** : sans ce paramètre, les tests ne pourraient pas prévoir l'identifiant du nœud créé. On ne pourrait pas écrire `expect(document.noeuds['n1']).toEqual(...)`, ni comparer des documents exacts. On en serait réduit à chercher « le nœud qui n'existait pas avant ».
- **Règle de dépendance** : le domaine ne dépend même pas du **port** `GenerateurIdentifiants` (qui appartient à la couche application). Il reçoit une simple fonction `() => NoeudId`, et c'est l'application qui la fabrique à partir du port : `() => this.#identifiants.nouveau()`.
- **Que se passerait-il sinon ?** Des tests **non reproductibles**, et un domaine lié à une technologie.

---

## Étape 6 — Le schéma de la section 2 avec **tes** fichiers

```
 apps/editeur (périphérie)                              packages/noyau (cœur)
 ─────────────────────────                              ───────────────────────────────────────────────
                                                         application/
 composants/Palette.tsx, Arbre.tsx,     executer()       ports/service-editeur.ts      «port entrant»
 Canevas.tsx, PanneauProprietes.tsx, ─────────────────▶     ▲ implémente
 VueModelePivot.tsx, Editeur.tsx                         editeur-applicatif.ts ──appelle──┐
 adaptateurs/use-document.ts  ◀──── abonner/notifier ───    │ utilise                    │
                                                            ▼                            │
 adaptateurs/generateur-uuid.ts ──── implémente ───────▶ ports/generateur-identifiants.ts │ «port sortant»
 adaptateurs/depot-local-storage.ts ─ implémente ──────▶ ports/depot-document.ts         │ «port sortant»
                                                                                         ▼
 main.tsx (racine de composition)                        domaine/
   new EditeurApplicatif(new Catalogue(composantsDeBase),  noeud.ts, composant.ts, composants-base.ts,
     new GenerateurUuid(), new DepotLocalStorage(clé))     erreur.ts, validation.ts, document-initial.ts,
                                                           commandes.ts
 test/doublures.ts : GenerateurSequentiel, DepotMemoire ── implémentent les mêmes ports sortants (tests)
```

Version UML complète : [03-conception-architecture.md §2.2](03-conception-architecture.md).
