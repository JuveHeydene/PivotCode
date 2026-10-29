# 02 — Conception : l'architecture à la fin de la phase 3

> Ce qui **change** par rapport à la phase 2 ([phase 2 › 02](../02-phase-2-generateurs-react-vue/02-conception-architecture.md)). Ce qui ne change pas n'est pas répété.

---

## 1. En une phrase

Le **noyau** gagne une commande (`deplacer-noeud`) et une requête (`estDansSousArbre`). L'**éditeur** gagne le glisser-déposer, construit sur des **règles pures**. Un nouveau paquet **lit le catalogue** et produit le **JSON Schema**.

## 2. Les paquets

```mermaid
flowchart TB
    subgraph packages
        NOYAU["@plateforme/noyau<br/>+ commande deplacer-noeud<br/>+ estDansSousArbre()"]
        RW["@plateforme/rendu-web"]
        GR["@plateforme/generateur-react"]
        GV["@plateforme/generateur-vue"]
        SJ["@plateforme/schema-json  NOUVEAU<br/>catalogue → JSON Schema 2020-12<br/>(tests : Ajv, fast-check)"]
    end
    subgraph apps
        ED["@plateforme/editeur<br/>+ glisser-deposer/ (règles pures + hook)<br/>+ Monter / Descendre<br/>+ bouton JSON Schema"]
    end
    RW --> NOYAU
    GR --> RW
    GV --> RW
    SJ --> NOYAU
    ED --> NOYAU
    ED --> RW
    ED --> GR
    ED --> GV
    ED --> SJ
```

`schema-json`, comme les générateurs, est un **lecteur** : il lit le **catalogue** (le métamodèle, M2), alors que les générateurs lisent le **document** (le modèle, M1). Le noyau ne dépend pas de lui. Il est compilé sans les types du navigateur ni de Node ; seuls ses **tests** ont les types de Node (D69).

## 3. La commande `deplacer-noeud`

```mermaid
classDiagram
    class Commande {
        <<union discriminée par type>>
    }
    class DeplacerNoeud {
        type = 'deplacer-noeud'
        id : NoeudId
        nouveauParentId : NoeudId
        position? : number (comptée sans le nœud)
    }
    class NoeudDeplace {
        <<Evenement>>
        type = 'noeud-deplace'
        id
        ancienParentId
        nouveauParentId
    }
    Commande <|-- DeplacerNoeud
    DeplacerNoeud ..> NoeudDeplace : produit
```

### Activité : vérifications, dans l'ordre

```mermaid
flowchart TB
    A([deplacer-noeud id, nouveauParentId, position]) --> B{le nœud existe ?}
    B -- non --> E1[NOEUD_INTROUVABLE]
    B -- oui --> C{est-ce la racine ?}
    C -- oui --> E2[RACINE_IMMOBILE]
    C -- non --> D{le nouveau parent existe ?}
    D -- non --> E1
    D -- oui --> F{accepte des enfants ?}
    F -- non --> E3[ENFANTS_INTERDITS]
    F -- oui --> G{"estDansSousArbre(id, nouveauParentId) ?<br/>on remonte les parentId : O(profondeur)"}
    G -- oui --> E4[DEPLACEMENT_CYCLIQUE]
    G -- non --> H["position bornée, comptée SANS le nœud"]
    H --> I{même parent et même position ?}
    I -- oui --> J[[même document, aucun événement]]
    I -- non --> K[["nouveau document :<br/>ancien parent sans le nœud,<br/>nouveau parent avec le nœud,<br/>parentId mis à jour"]]
```

## 4. Le glisser-déposer : deux couches

```mermaid
flowchart LR
    subgraph NAV["Navigateur (événements HTML5)"]
        DS[dragstart]
        DO[dragover]
        DR[drop]
    end
    subgraph HOOK["use-glisser-deposer.ts (React)"]
        ETAT["état : glisse, survol"]
        CALC["calculer(id, contexte, e)"]
    end
    subgraph PURES["regles-depot.ts (fonctions pures)"]
        Z["zoneDepot(rect, point, axe, accepteEnfants)"]
        C["cibleDepot(document, cible, zone, idDeplace)"]
        P["depotPermis(document, index, glisse, parentId)"]
        AX["axeDesEnfants(document, parentId)"]
    end
    subgraph NOY["Noyau"]
        EDS["estDansSousArbre()"]
        EX["service.executer(ajouter-noeud ou deplacer-noeud)"]
    end
    DS --> ETAT
    DO --> CALC
    DR --> CALC
    CALC --> AX & Z & C & P
    P --> EDS
    CALC -- "dépôt permis" --> EX
```

- **Les décisions** (où ça tombe, est-ce permis ?) sont des **fonctions pures**, testées sans navigateur : 15 tests.
- **Le hook** ne fait que lire la souris et appeler les fonctions pures, puis envoyer **la même commande** qu'un clic. Le noyau n'a donc **rien** de spécial à savoir : le glisser-déposer est un **nouvel adaptateur entrant**.
- **Double protection** : l'interface refuse un dépôt cyclique, et le noyau le refuserait de toute façon (D60).

### Séquence : glisser « + Texte » dans un conteneur

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant P as Palette
    participant H as useGlisserDeposer
    participant R as regles-depot (pures)
    participant S as service (noyau)
    U->>P: commence à glisser « + Texte »
    P->>H: debuter(nouveau Texte)
    H->>H: glisse = nouveau Texte
    U->>H: survole le conteneur c1 (dragover)
    H->>R: zoneDepot, puis cibleDepot, puis depotPermis
    R-->>H: dedans c1, position 2, permis
    H->>H: survol = c1 dedans, donc classe depot-dedans
    U->>H: relâche (drop)
    H->>S: executer(ajouter-noeud, parentId c1, composant Texte, position 2)
    S-->>H: succès, événement noeud-ajoute
    H->>H: sélectionne le nouveau nœud, efface glisse et survol
```

### États d'un glissement

```mermaid
stateDiagram-v2
    [*] --> Repos
    Repos --> Glissement: dragstart (palette, canevas ou arbre)
    Glissement --> Glissement: dragover sur une cible permise / indication
    Glissement --> Glissement: dragover sur une cible interdite / aucune indication
    Glissement --> Repos: drop permis / commande envoyée
    Glissement --> Repos: drop interdit ou dragend / rien
```

## 5. Le JSON Schema

```mermaid
flowchart LR
    CAT["Catalogue (M2, format maison)<br/>composants-base.ts"] --> GEN["genererSchemaJson()<br/>@plateforme/schema-json"]
    GEN --> SCH["document-pivot.v1.schema.json<br/>(standard draft 2020-12)"]
    SCH --> T1["Test : fichier publié à jour"]
    SCH --> T2["Ajv : documents valides / invalides"]
    SCH --> T3["fast-check : cohérence avec le noyau"]
    SCH --> BTN["Éditeur : bouton JSON Schema"]
    SCH -. "plus tard" .-> IA["IA : sorties structurées"]
```

Les principes, la table de traduction et **les limites** sont dans [03-json-schema-et-ses-limites.md](03-json-schema-et-ses-limites.md).
