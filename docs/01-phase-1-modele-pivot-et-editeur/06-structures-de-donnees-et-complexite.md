# 06 — Structures de données et complexité

> Notation : **n** = nombre de nœuds du document, **e** = nombre de liens parent → enfant (dans un arbre, e = n − 1), **p** = nombre total de propriétés de tous les nœuds, **k** = nombre d'enfants d'un nœud, **s** = taille d'un sous-arbre, **c** = nombre de composants du catalogue.

---

## 1. Inventaire : quelle structure, où, pourquoi

| Structure | Où (fichier → élément) | Pourquoi celle-ci | Alternative écartée et raison |
|---|---|---|---|
| **Dictionnaire (objet JS `Record`)** `noeuds: { id → Noeud }` | `domaine/noeud.ts` → `DocumentPivot.noeuds` | Accès à un nœud en **O(1)**. Se sérialise **directement** en JSON, ce qui est indispensable pour afficher et stocker le modèle pivot (D8) | `Map` : `JSON.stringify(new Map())` donne `"{}"`, il faudrait convertir à chaque affichage. Arbre imbriqué : chercher un nœud coûterait O(n) |
| **Tableau ordonné d'identifiants** `enfants: NoeudId[]` | `Noeud.enfants` | L'**ordre** compte (ordre d'affichage). Insertion à une position donnée possible | `Set` : pas d'ordre explicite ni de position. Liste chaînée : inutilement complexe pour quelques enfants |
| **Référence vers le parent** `parentId` | `Noeud.parentId` | Remonter au parent en **O(1)** (suppression, palette « ajouter à côté ») | Sans elle : chercher le parent coûterait O(n) |
| **Table de hachage `Map`** (deux niveaux) | `Catalogue.#parNom`, `Catalogue.#proprietes` | Recherche d'une définition ou d'une propriété en **O(1)**, aucune clé héritée (D14) | `Array.find` : O(c) ou O(nombre de propriétés) à **chaque** vérification |
| **`Map` construite pendant la validation** | `validerDocument` → `noeuds` | Une fois la forme vérifiée, on ne relit plus l'objet brut (`unknown`). Recherche O(1) et sûre | Relire `brut[cle]` : il faudrait reconvertir le type à chaque fois |
| **Pile (tableau + `push`/`pop`)** | `validerDocument` (R8), `supprimerNoeud` | **Parcours en profondeur itératif** : pas de récursion, donc pas de débordement de la pile d'appels sur un arbre profond. Testé avec **50 000 niveaux** | Récursion : `RangeError: Maximum call stack size exceeded` vers 10 000 niveaux selon le moteur |
| **Ensemble `Set`** | `vus` (R8), `aSupprimer` (suppression), `#ecouteurs` (Observateur) | Test d'appartenance, ajout et retrait en **O(1)**, pas de doublon | Tableau + `includes` : O(n) par test, donc O(n²) au total pour R8 |
| **Deux piles de documents** | `EditeurApplicatif.#passe`, `#futur` | Annuler = `pop` de `#passe`, rétablir = `pop` de `#futur` : **O(1)** | Pile de commandes inverses : plus complexe et plus fragile (D23) |
| **Union discriminée** | `Commande`, `Evenement`, `ResultatCommande`, `DefinitionPropriete`, `ResultatExecution`, état de `VueModelePivot` | Le champ discriminant (`type`, `succes`, `mode`) dit **quels champs existent**. Le compilateur vérifie chaque cas | Classes avec héritage : moins sérialisables. Champs optionnels : autorisent des combinaisons absurdes |
| **Index `Map` du catalogue côté éditeur** | `outils-editeur.ts` → `indexerCatalogue`, mémorisé par `useMemo` | Construit **une seule fois**. Recherche O(1) dans le canevas, l'arbre et le panneau | Rechercher dans le tableau à chaque rendu |

---

## 2. Complexité des opérations du noyau

### 2.1 Validation : `validerDocument`

| Règle | Coût | Explication |
|---|---|---|
| R1 | O(1) | Quelques tests de type |
| R2 | O(n + e) | Une passe sur les nœuds, et `every` sur chaque tableau `enfants` |
| R3 | O(1) | Une recherche dans la `Map` |
| R4 | O(n) | Une recherche O(1) dans le catalogue par nœud |
| R5 | O(p + Σ propriétés déclarées) | Une recherche O(1) par propriété présente, plus une passe sur les propriétés déclarées de chaque composant |
| R6 | O(n) | Un test de longueur par nœud |
| R7 | O(e) | Une recherche O(1) par lien |
| R8 | **O(n + e)** | Chaque nœud est empilé une fois par lien entrant et chaque lien est parcouru une fois. Puis une passe sur les clés pour les orphelins |
| **Total** | **O(n + e + p)**, donc linéaire en la taille du document | Le JSON doit de toute façon être lu en entier : on ne peut pas faire mieux |

### 2.2 Commandes : `appliquerCommande`

| Commande | Coût | Détail |
|---|---|---|
| `ajouter-noeud` | **O(n + k)** | O(1) pour les recherches ; O(k) pour reconstruire `enfants` du parent ; **O(n)** pour la copie superficielle de la table `noeuds` (`{ ...document.noeuds }` recopie n **références**, pas n nœuds) |
| `supprimer-noeud` | **O(n)** | O(s) pour collecter le sous-arbre avec la pile ; O(n) pour reconstruire la table sans ces clés ; O(k) pour filtrer `enfants` du parent |
| `modifier-propriete` | **O(n)** | O(1) pour les recherches et la vérification ; O(nombre de propriétés du nœud) pour copier ses propriétés ; O(n) pour la copie de la table |
| `remplacer-document` | **O(n + e + p)** | Validation complète, puis `copierDocumentValide` (copie profonde, linéaire) |

**Le coût dominant est la copie superficielle O(n) de la table `noeuds`.** Elle est le prix de l'immuabilité (D7) :
- copier **des références** est très rapide : un document de 1 000 nœuds se recopie en quelques dizaines de microsecondes ;
- les **nœuds non touchés sont partagés** entre l'ancien et le nouveau document. C'est vérifié par un test (`document.noeuds['b1']` est **le même objet** avant et après l'ajout d'un autre nœud) ;
- si un jour des documents de plusieurs dizaines de milliers de nœuds apparaissent, on remplacera l'objet par une **structure persistante** (arbre de hachage à partage structurel, *HAMT*, comme dans Immutable.js). La copie passera alors à **O(log n)**, sans changer l'interface du domaine.

### 2.3 Application : `EditeurApplicatif`

| Opération | Coût |
|---|---|
| `lireDocument()` | O(1) (renvoie une référence) |
| `executer(commande)` | coût de la commande + O(1) pour l'historique + coût de l'enregistrement (`JSON.stringify`, O(n + p)) + O(nombre d'abonnés) |
| `annuler()` / `retablir()` | O(1) + enregistrement + notification |
| `abonner()` / désabonnement | O(1) (`Set.add` / `Set.delete`) |
| Mémoire de l'historique | Au pire 100 documents. Grâce au **partage structurel**, chaque entrée ne coûte que les objets réellement recréés (le nœud modifié, son parent, la table), pas une copie complète |

### 2.4 Interface (éditeur)

| Opération | Coût | Remarque |
|---|---|---|
| Rendu du canevas / de l'arbre | O(n) | Parcours récursif depuis la racine. Chaque nœud est rendu une fois |
| Affichage du JSON | O(n + p) | `JSON.stringify(document, null, 2)` à chaque rendu d'`Editeur` |
| `cibleAjout` | O(k) | `indexOf` dans les enfants du parent |
| Détection du changement par React | **O(1)** | `useSyncExternalStore` compare **les références** : c'est tout l'intérêt de l'immuabilité. Sans elle, il faudrait une comparaison profonde en O(n + p), ou React ne verrait rien (D7) |

> **Ordre de grandeur pour la soutenance** : un document de 100 nœuds se valide, se modifie et se réaffiche en bien moins d'une milliseconde de calcul côté noyau. Le facteur limitant est le rendu du navigateur, pas les algorithmes.

---

## 3. Le parcours en profondeur itératif (R8) expliqué pas à pas

```text
pile = [racine]          vus = {}
tant que pile non vide :
    id = pile.pop()
    si id ∈ vus : erreur CYCLE_OU_PARTAGE ; continuer   ← ne PAS redescendre (sinon boucle infinie)
    vus.ajouter(id)
    pour chaque enfant de id : pile.push(enfant)
pour chaque id de noeuds :
    si id ∉ vus : erreur NOEUD_ORPHELIN
```

Exemple sur un document où `c1` liste aussi `racine` comme enfant (un cycle) :

| Étape | pile | vus | Effet |
|---|---|---|---|
| 0 | [racine] | {} | |
| 1 | [t1, c1] | {racine} | racine dépilée, ses enfants empilés |
| 2 | [t1, b1, b2, racine] | {racine, c1} | c1 dépilé |
| 3 | [t1, b1, b2] | idem | **racine déjà vue → CYCLE_OU_PARTAGE**, on ne redescend pas |
| 4… | … | {racine, c1, b2, b1, t1} | fin, aucun orphelin |

**Pourquoi c'est correct** : dans un arbre, chaque nœud a **exactement un** chemin depuis la racine. Le rencontrer **deux fois** signifie qu'il y a deux chemins (partage ou cycle) ; ne **jamais** le rencontrer signifie qu'il n'y en a aucun (orphelin). La pile garantit qu'on ne parcourt chaque lien qu'une seule fois, d'où le **O(n + e)**.
