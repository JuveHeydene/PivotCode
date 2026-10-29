# Architecture actuelle du système

> 🟢 **Document de RÉFÉRENCE : il décrit l'état ACTUEL du système.**
> Dernière mise à jour : **21/10/2026, état à la fin de la phase 1**. Il est mis à jour à la fin de chaque phase.
> La version figée de la phase 1 se trouve dans [03-conception-architecture.md](../01-phase-1-modele-pivot-et-editeur/03-conception-architecture.md) ; comparer les deux montre l'évolution.

> Ce document décrit **comment le système est construit**, avec des diagrammes UML.
> Le métamodèle est détaillé dans [02-metamodele.md](02-metamodele.md), les décisions dans [phase 1 › 05-decisions.md](../01-phase-1-modele-pivot-et-editeur/05-decisions.md).
> Conventions : les noms de classes, types et fichiers sont **ceux du code**.

---

## 1. Objectif fonctionnel de la tranche 1

| Sens | Action de l'utilisateur | Résultat attendu | Réalisé |
|---|---|---|---|
| Éditeur → modèle | Clique sur « + Bouton », change son libellé dans le panneau | Le JSON du modèle pivot se met à jour **immédiatement** | ✅ |
| Modèle → éditeur | Modifie le JSON (libellé, nouveau nœud), clique « Appliquer » | Le canevas et l'arbre affichent le changement | ✅ |
| Garde-fou | Écrit un JSON incorrect (règle du métamodèle violée, ou virgule oubliée) | Message d'erreur clair, **rien ne change** | ✅ |
| Persistance | Recharge la page | Le travail est toujours là | ✅ |
| Bonus | Ctrl+Z / Ctrl+Y | Annuler / rétablir | ✅ |

### Diagramme de cas d'utilisation

```mermaid
flowchart LR
    U(("👤 Concepteur<br/>(utilisateur)"))
    subgraph Systeme["Éditeur low-code — tranche 1"]
        UC1([Ajouter un composant depuis la palette])
        UC2([Sélectionner un élément<br/>canevas ou arbre])
        UC3([Modifier une propriété<br/>formulaire généré])
        UC4([Supprimer un élément<br/>et ses descendants])
        UC5([Consulter le modèle pivot JSON])
        UC6([Éditer le modèle pivot JSON<br/>et l'appliquer])
        UC7([Annuler / rétablir])
        UC8([Charger l'exemple /<br/>nouveau document])
        UCV([Valider un document<br/>R1 à R8])
        UCP([Enregistrer le document])
    end
    U --- UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7 & UC8
    UC6 -. "«include»" .-> UCV
    UC8 -. "«include»" .-> UCV
    UC1 -. "«include»" .-> UCP
    UC3 -. "«include»" .-> UCP
    UC4 -. "«include»" .-> UCP
    UC6 -. "«include»" .-> UCP
```

---

## 2. Le style d'architecture : hexagonale (Ports & Adaptateurs)

### 2.1 L'idée

L'**architecture hexagonale** (Alistair Cockburn, 2005), aussi appelée *Ports and Adapters*, sépare :

- **le cœur** (*domaine* + *application*) : les règles du métier, sans aucune technologie ;
- **la périphérie** (*adaptateurs*) : les technologies (React, `localStorage`, `crypto.randomUUID`, plus tard HTTP ou une IA) ;
- **les ports** : des **interfaces définies par le cœur**. Les **ports entrants** décrivent ce que le cœur **offre**, les **ports sortants** ce dont il **a besoin**.

**Règle de dépendance** : les dépendances de code pointent **toujours vers le centre** (adaptateurs → application → domaine), jamais l'inverse.

### 2.2 Diagramme hexagonal (composants)

```mermaid
flowchart LR
    subgraph PERIPH_IN["Adaptateurs ENTRANTS"]
        direction TB
        UI["Interface React<br/>Editeur.tsx + composants/*"]
        HOOK["useDocument()<br/>use-document.ts"]
    end

    subgraph COEUR["CŒUR — packages/noyau (TypeScript pur, aucune dépendance)"]
        direction LR
        PIN{{"«port entrant»<br/>ServiceEditeur"}}
        EA["EditeurApplicatif<br/>Observateur + historique"]
        subgraph DOM["Domaine (fonctions pures)"]
            direction TB
            CMD["appliquerCommande()"]
            VAL["validerDocument() R1…R8"]
            CAT["Catalogue"]
            MM["Noeud, DocumentPivot"]
        end
        POUT1{{"«port sortant»<br/>GenerateurIdentifiants"}}
        POUT2{{"«port sortant»<br/>DepotDocument"}}
    end

    subgraph PERIPH_OUT["Adaptateurs SORTANTS"]
        direction TB
        UUID["GenerateurUuid<br/>crypto.randomUUID()"]
        LS["DepotLocalStorage<br/>localStorage"]
        SEQ["GenerateurSequentiel (tests)"]
        MEM["DepotMemoire (tests)"]
    end

    UI -- "executer(commande)" --> PIN
    HOOK -- "abonner, lireDocument" --> PIN
    PIN -. "implémenté par" .- EA
    EA --> CMD
    CMD --> VAL
    CMD --> MM
    VAL --> CAT
    EA -- "utilise" --> POUT1
    EA -- "utilise" --> POUT2
    POUT1 -. "implémenté par" .- UUID
    POUT1 -. "implémenté par" .- SEQ
    POUT2 -. "implémenté par" .- LS
    POUT2 -. "implémenté par" .- MEM
```

> Lis les flèches pleines comme « appelle / utilise » et les pointillés comme « est implémenté par ». **Attention au sens des dépendances de code** : les adaptateurs sortants (à droite) **importent** les interfaces du cœur pour les implémenter. Ils dépendent donc du cœur, et non l'inverse. **Toutes** les dépendances de code pointent **vers** le cœur. C'est l'**inversion de dépendance** (le « D » de SOLID) : à l'exécution, le cœur appelle le stockage ; à la compilation, c'est le stockage qui dépend du cœur.

### 2.3 Les quatre couches et leurs responsabilités

| Couche | Emplacement | Responsabilité | Peut importer | N'importe jamais |
|---|---|---|---|---|
| **Domaine** | `packages/noyau/src/domaine/` | Métamodèle, catalogue, validation, commandes. **Fonctions pures** (même entrée → même sortie, aucun effet de bord). | Rien d'autre que le domaine | Application, React, DOM, Node |
| **Application** | `packages/noyau/src/application/` | Garder le document courant, appliquer les commandes, enregistrer, notifier, historique | Domaine | React, DOM, Node |
| **Adaptateurs** | `apps/editeur/src/adaptateurs/`, `composants/`, `Editeur.tsx` | Traduire entre le cœur et une technologie | Noyau (API publique **uniquement**), React, DOM | Fichiers internes du noyau |
| **Racine de composition** | `apps/editeur/src/main.tsx` | Choisir les implémentations concrètes, faire les `new`, assembler | Tout | — |

### 2.4 Comment la frontière est **garantie** (et pas seulement promise)

| Protection | Mécanisme | Ce qui se passe si on la viole | Vérifié |
|---|---|---|---|
| 1. pnpm (D4) | Le noyau ne déclare pas React dans son `package.json`. pnpm ne crée donc pas `packages/noyau/node_modules/react` : le module est **introuvable** | `error TS2307: Cannot find module 'react'` | ✅ scénario S9 |
| 2. `"lib": ["ES2022"]` sans `"DOM"`, `"types": []` (D5) | Les types `document`, `window`, `localStorage`, `structuredClone` **n'existent pas** pour le noyau | `error TS2584: Cannot find name 'document'` | ✅ scénario S9 |
| 3. Champ `"exports"` du noyau | Seul `@plateforme/noyau` (→ `src/index.ts`) est importable. `@plateforme/noyau/src/domaine/commandes` est refusé | Erreur de résolution de module | par construction |
| 4. `index.ts` n'exporte pas `appliquerCommande` | L'éditeur **ne peut pas** contourner le service | `has no exported member` | par construction |

---

## 3. Vue des paquetages (monodépôt)

```mermaid
flowchart TB
    subgraph racine["platforme_no_and_low_code (racine, private)"]
        TS["typescript 7.0.2<br/>(outil partagé, devDependency)"]
        subgraph packages
            NOYAU["@plateforme/noyau<br/>exports: ./src/index.ts<br/>dépendances de production : AUCUNE<br/>dev : vitest"]
        end
        subgraph apps
            EDIT["@plateforme/editeur<br/>dépendances : react, react-dom,<br/>@plateforme/noyau (workspace:*)<br/>dev : vite, vitest, jsdom,<br/>testing-library, playwright-core, oxlint"]
        end
    end
    EDIT -- "dépend de (lien local workspace:*)" --> NOYAU
```

À l'intérieur du noyau :

```mermaid
flowchart LR
    subgraph noyau["@plateforme/noyau"]
        INDEX["index.ts<br/>(API publique — Façade)"]
        subgraph application
            ports["ports/<br/>service-editeur.ts<br/>generateur-identifiants.ts<br/>depot-document.ts"]
            ea["editeur-applicatif.ts"]
        end
        subgraph domaine
            noeud["noeud.ts"]
            composant["composant.ts"]
            base["composants-base.ts"]
            err["erreur.ts"]
            val["validation.ts"]
            init["document-initial.ts"]
            cmd["commandes.ts"]
        end
    end
    INDEX --> application & domaine
    ea --> ports
    ea --> cmd & val & init & err
    ports --> noeud & composant & err & cmd
    cmd --> val & composant & noeud & err
    val --> composant & noeud & err
    init --> composant & noeud
    base --> composant
    composant --> noeud
    err --> noeud
```

Aucune flèche ne va de `domaine` vers `application` : la règle de dépendance est respectée à l'intérieur du noyau aussi.

---

## 4. Diagrammes de classes

### 4.1 Domaine : le métamodèle et le catalogue

```mermaid
classDiagram
    direction LR
    class DocumentPivot {
        <<type>>
        +versionMetamodele : 1
        +racineId : NoeudId
        +noeuds : Record~NoeudId, Noeud~
    }
    class Noeud {
        <<type>>
        +id : NoeudId
        +composant : string
        +proprietes : Record~string, ValeurPropriete~
        +parentId : NoeudId | null
        +enfants : NoeudId[]
    }
    class ValeurPropriete {
        <<union>>
        string | number | boolean
    }
    class Catalogue {
        <<class>>
        -#definitions : DefinitionComposant[]
        -#parNom : Map~string, DefinitionComposant~
        -#proprietes : Map~string, ProprietesParNom~
        +constructor(definitions)
        +lister() DefinitionComposant[]
        +trouver(nom) DefinitionComposant | undefined
        +trouverPropriete(composant, nom) DefinitionPropriete | undefined
    }
    class DefinitionComposant {
        <<type>>
        +nom : string
        +libelle : string
        +accepteEnfants : boolean
        +proprietes : DefinitionPropriete[]
    }
    class DefinitionPropriete {
        <<union discriminée par type>>
        +nom : string
        +libelle : string
        +obligatoire : boolean
        +type : 'texte'|'nombre'|'booleen'|'choix'
        +defaut : string | number | boolean, selon type
        +choix : string[], seulement si type = choix
    }
    class ErreurModele {
        <<type>>
        +code : CodeErreur
        +message : string
        +noeudId? : NoeudId
    }

    DocumentPivot "1" *-- "1..*" Noeud : noeuds
    Noeud "1" o-- "0..*" Noeud : enfants (par identifiant)
    Noeud "0..*" --> "0..1" Noeud : parentId
    Noeud ..> ValeurPropriete
    Noeud "0..*" ..> "1" DefinitionComposant : composant (par nom)
    Catalogue "1" o-- "0..*" DefinitionComposant
    DefinitionComposant "1" *-- "0..*" DefinitionPropriete
```

> `ProprietesParNom` désigne `Map<string, DefinitionPropriete>` : le second index du catalogue est une `Map` de `Map` (composant → propriété → définition).
>
> **Subtilité importante** : la relation `Noeud → DefinitionComposant` est une **référence par nom** (`composant: 'Bouton'`), pas un pointeur d'objet. Le document reste du JSON pur et indépendant du catalogue ; c'est la validation (R4, R5, R6) qui vérifie la **conformité** du nœud à sa définition. C'est le patron *Type Object* (voir [phase 1 › 07](../01-phase-1-modele-pivot-et-editeur/07-patrons-de-conception.md)).

### 4.2 Domaine : commandes, événements, résultats

```mermaid
classDiagram
    direction TB
    class Commande {
        <<union discriminée par type>>
    }
    class AjouterNoeud {
        type = 'ajouter-noeud'
        parentId : NoeudId
        composant : string
        position? : number
    }
    class SupprimerNoeud {
        type = 'supprimer-noeud'
        id : NoeudId
    }
    class ModifierPropriete {
        type = 'modifier-propriete'
        id : NoeudId
        nom : string
        valeur : ValeurPropriete
    }
    class RemplacerDocument {
        type = 'remplacer-document'
        document : unknown
    }
    Commande <|-- AjouterNoeud
    Commande <|-- SupprimerNoeud
    Commande <|-- ModifierPropriete
    Commande <|-- RemplacerDocument

    class Evenement {
        <<union discriminée par type>>
        noeud-ajoute(id, parentId)
        noeud-supprime(id)
        propriete-modifiee(id, nom)
        document-remplace
    }
    class ResultatCommande {
        <<union discriminée par succes>>
        succes=true : document, evenements
        succes=false : erreurs
    }
    class FonctionsDuDomaine {
        <<module commandes.ts / validation.ts>>
        +appliquerCommande(document, commande, catalogue, nouvelId) ResultatCommande
        +validerDocument(candidat: unknown, catalogue) ErreurModele[]
        +copierDocumentValide(candidat) DocumentPivot
        +creerDocumentInitial(catalogue, nouvelId) DocumentPivot
    }
    FonctionsDuDomaine ..> Commande : lit
    FonctionsDuDomaine ..> ResultatCommande : produit
    ResultatCommande ..> Evenement
```

(En TypeScript, ces « sous-classes » ne sont pas des classes. Ce sont les **membres d'un type union**, distingués par le champ `type`. L'héritage du diagramme représente la relation « est un cas de ».)

### 4.3 Application, ports et adaptateurs

```mermaid
classDiagram
    direction LR
    class ServiceEditeur {
        <<interface — port entrant>>
        +lireDocument() DocumentPivot
        +lireCatalogue() DefinitionComposant[]
        +executer(commande) ResultatExecution
        +abonner(ecouteur) () => void
        +annuler() ResultatExecution
        +retablir() ResultatExecution
        +peutAnnuler() boolean
        +peutRetablir() boolean
    }
    class GenerateurIdentifiants {
        <<interface — port sortant>>
        +nouveau() NoeudId
    }
    class DepotDocument {
        <<interface — port sortant>>
        +charger() unknown
        +enregistrer(document) void
    }
    class EditeurApplicatif {
        -#catalogue : Catalogue
        -#identifiants : GenerateurIdentifiants
        -#depot : DepotDocument
        -#ecouteurs : Set~Ecouteur~
        -#document : DocumentPivot
        -#passe : DocumentPivot[]
        -#futur : DocumentPivot[]
        +constructor(catalogue, identifiants, depot)
        -#changer(document, evenements)
        -#restaurer(document)
    }
    class GenerateurUuid {
        +nouveau() NoeudId
    }
    class DepotLocalStorage {
        -#cle : string
        -#stockage : Storage
        +charger() unknown
        +enregistrer(document) void
    }
    class GenerateurSequentiel {
        <<doublure de test>>
    }
    class DepotMemoire {
        <<doublure de test>>
        +contenu : unknown
        +nombreEnregistrements : number
    }

    ServiceEditeur <|.. EditeurApplicatif
    EditeurApplicatif --> GenerateurIdentifiants
    EditeurApplicatif --> DepotDocument
    EditeurApplicatif --> Catalogue
    GenerateurIdentifiants <|.. GenerateurUuid
    GenerateurIdentifiants <|.. GenerateurSequentiel
    DepotDocument <|.. DepotLocalStorage
    DepotDocument <|.. DepotMemoire
```

### 4.4 Arbre des composants React (adaptateur entrant)

```mermaid
flowchart TB
    main["main.tsx<br/>(racine de composition)"] --> Editeur
    Editeur["Editeur<br/>useDocument(service)<br/>état local : selectionId, erreurs"]
    Editeur --> Palette["Palette<br/>(un bouton par DefinitionComposant)"]
    Editeur --> Arbre["Arbre → BrancheArbre (récursif)"]
    Editeur --> Canevas["Canevas → RenduNoeud (récursif)<br/>table rendus : Texte, Bouton, Conteneur"]
    Editeur --> PP["PanneauProprietes → Champ × n<br/>(texte | ChampNombre | case | select)"]
    Editeur --> VMP["VueModelePivot<br/>état : lecture | édition(brouillon, erreurs)"]
```

L'état est réparti avec soin :

| Donnée | Où elle vit | Pourquoi |
|---|---|---|
| Le document pivot | **Dans le noyau** (`EditeurApplicatif.#document`), lu par `useDocument` | Source de vérité unique |
| La sélection (`selectionId`) | État React **local** d'`Editeur` | C'est un état **de l'éditeur**, pas de l'application conçue : elle ne doit pas apparaître dans le modèle pivot ni dans l'historique |
| Les messages d'erreur | État React local d'`Editeur` | Idem |
| Le brouillon JSON | État React local de `VueModelePivot` | Il **ne doit pas** suivre le document pendant l'édition |
| Le brouillon d'un champ nombre | État local de `ChampNombre` | Une saisie intermédiaire (`""`, `"-"`) n'est pas un nombre valide |

---

## 5. Diagrammes de séquence

### 5.1 Démarrage de l'application

```mermaid
sequenceDiagram
    autonumber
    participant M as main.tsx (racine de composition)
    participant EA as EditeurApplicatif
    participant D as DepotLocalStorage
    participant V as validerDocument
    participant I as creerDocumentInitial
    participant R as React (Editeur)

    M->>M: catalogue = new Catalogue(composantsDeBase)
    M->>EA: new EditeurApplicatif(catalogue, new GenerateurUuid(), new DepotLocalStorage(clé))
    EA->>D: charger()
    D-->>EA: unknown (JSON.parse du localStorage, ou null)
    alt contenu présent ET validerDocument(contenu) = []
        EA->>V: validerDocument(contenu, catalogue)
        V-->>EA: []
        EA->>EA: this.document = copierDocumentValide(contenu)
    else rien, ou contenu invalide / corrompu
        EA->>I: creerDocumentInitial(catalogue, () => uuid)
        I-->>EA: document { racine Conteneur }
        EA->>D: enregistrer(document)
    end
    M->>R: render(<Editeur service={service} />)
    R->>EA: abonner(prévenirReact) (via useSyncExternalStore)
    R->>EA: lireDocument()
```

### 5.2 Sens éditeur → modèle : « + Bouton »

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant P as Palette / Editeur (React)
    participant EA as EditeurApplicatif
    participant AC as appliquerCommande (domaine pur)
    participant G as GenerateurUuid
    participant D as DepotLocalStorage
    participant H as useDocument (useSyncExternalStore)

    U->>P: clic « + Bouton »
    P->>P: cibleAjout(document, selectionId, index) → { parentId, position? }
    P->>EA: executer({ type: 'ajouter-noeud', parentId, composant: 'Bouton' })
    EA->>AC: appliquerCommande(document, commande, catalogue, () => G.nouveau())
    AC->>AC: vérifie : parent existe ? accepte des enfants ? composant connu ?
    AC->>G: nouvelId()
    G-->>AC: "e3d7…"
    AC-->>EA: { succes: true, document: NOUVEAU, evenements: [noeud-ajoute] }
    EA->>EA: this.passe.push(ancien), this.futur = []
    EA->>EA: this.document = NOUVEAU
    EA->>D: enregistrer(NOUVEAU)
    EA->>H: écouteur(evenements) → prévenirReact()
    H->>EA: lireDocument()
    EA-->>H: NOUVEAU (référence différente ⇒ React réaffiche)
    EA-->>P: { succes: true, evenements }
    P->>P: setSelection(id du nœud ajouté)
    Note over P,H: Canevas, Arbre et JSON se réaffichent à partir du MÊME document
```

### 5.3 Sens modèle → éditeur : « Appliquer » le JSON

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant VM as VueModelePivot
    participant EA as EditeurApplicatif
    participant AC as appliquerCommande
    participant V as validerDocument

    U->>VM: « Modifier » (brouillon = JSON actuel), édite, « Appliquer »
    VM->>VM: JSON.parse(brouillon)
    alt erreur de syntaxe
        VM-->>U: « JSON invalide (syntaxe) » + message, reste en édition
    else JSON lisible
        VM->>EA: executer({ type: 'remplacer-document', document: valeurLue })
        EA->>AC: appliquerCommande(...)
        AC->>V: validerDocument(valeurLue, catalogue)
        alt au moins une erreur (R1…R8)
            V-->>AC: [ErreurModele…]
            AC-->>EA: { succes: false, erreurs }
            EA-->>VM: { succes: false, erreurs }  (document, dépôt, abonnés : INCHANGÉS)
            VM-->>U: liste « code + message + voir », reste en édition
        else document conforme
            V-->>AC: []
            AC->>AC: copierDocumentValide(valeurLue)
            AC-->>EA: { succes: true, document, [document-remplace] }
            EA->>EA: historique, enregistrement, notification (comme 5.2)
            EA-->>VM: { succes: true }
            VM->>VM: retour en mode lecture
        end
    end
```

> **Le point clé pour la soutenance** : le canevas ne contient **aucun code spécial** pour le sens modèle → éditeur. Il observe le document. Que le document change à cause d'un clic ou d'un JSON collé, le chemin est **identique** à partir de `executer`.

### 5.4 Annuler (bonus)

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant E as Editeur
    participant EA as EditeurApplicatif
    U->>E: Ctrl+Z (hors champ de saisie) ou bouton « ↶ Annuler »
    E->>EA: annuler()
    alt this.passe vide
        EA-->>E: { succes: false, HISTORIQUE_VIDE }
    else
        EA->>EA: this.futur.push(this.document), precedent = this.passe.pop()
        EA->>EA: this.changer(precedent, [document-remplace]) → enregistrer + notifier
        EA-->>E: { succes: true }
    end
```

---

## 6. Diagrammes d'états

### 6.1 Le panneau « Modèle pivot (JSON) »

```mermaid
stateDiagram-v2
    [*] --> Lecture
    Lecture: Lecture<br/>(le JSON suit le document en direct)
    Edition: Édition<br/>(brouillon local, ne suit plus le document)
    Lecture --> Edition: « Modifier » / brouillon = JSON courant
    Edition --> Edition: frappe / brouillon modifié
    Edition --> Edition: « Appliquer » [syntaxe invalide] / afficher l'erreur de syntaxe
    Edition --> Edition: « Appliquer » [refusé par le métamodèle] / afficher les erreurs R1…R8
    Edition --> Lecture: « Appliquer » [accepté] / commande remplacer-document réussie
    Edition --> Lecture: « Abandonner » / brouillon jeté
```

### 6.2 L'historique (annuler / rétablir)

```mermaid
stateDiagram-v2
    [*] --> Vide: démarrage (passé = [], futur = [])
    Vide --> AvecPasse: commande réussie qui change le document
    AvecPasse --> AvecPasse: commande réussie (futur effacé)
    AvecPasse --> AvecPasseEtFutur: annuler [passé > 1]
    AvecPasse --> SeulementFutur: annuler [passé = 1]
    SeulementFutur --> AvecPasse: rétablir [futur = 1]
    AvecPasseEtFutur --> AvecPasse: rétablir [futur = 1]
    AvecPasseEtFutur --> AvecPasse: nouvelle commande (futur effacé)
    SeulementFutur --> AvecPasse: nouvelle commande (futur effacé)
```

---

## 7. Diagramme d'activité : `validerDocument`

```mermaid
flowchart TB
    A([candidat : unknown]) --> R1{"R1 — objet ?<br/>versionMetamodele = 1 ?<br/>racineId texte ? noeuds objet ?"}
    R1 -- non --> F1[["return [FORME_INVALIDE]"]]
    R1 -- oui --> R2["R2 — pour chaque entrée de noeuds :<br/>forme du nœud + clé = id"]
    R2 --> R2b{erreurs R2 ?}
    R2b -- oui --> F2[["return erreurs R2<br/>(arrêt : éviter les erreurs en cascade)"]]
    R2b -- non --> R3["R3 — racine existe et parentId = null"]
    R3 --> L["pour chaque nœud"]
    L --> R4{"R4 — composant<br/>dans le catalogue ?"}
    R4 -- non --> E4[COMPOSANT_INCONNU]
    R4 -- oui --> R5["R5 — propriétés : obligatoires présentes,<br/>types, choix, aucune inconnue"]
    R5 --> R6["R6 — pas d'enfants si accepteEnfants = false"]
    E4 --> R7
    R6 --> R7["R7 — chaque enfant existe<br/>et son parentId = ce nœud"]
    R7 --> L2{autre nœud ?}
    L2 -- oui --> L
    L2 -- non --> R8{racine valide ?}
    R8 -- non --> FIN
    R8 -- oui --> DFS["R8 — parcours en profondeur avec PILE + Set vus :<br/>déjà vu ⇒ CYCLE_OU_PARTAGE<br/>jamais vu à la fin ⇒ NOEUD_ORPHELIN"]
    DFS --> FIN[["return toutes les erreurs<br/>([] = document conforme)"]]
```

---

## 8. Diagramme de déploiement

```mermaid
flowchart LR
    subgraph Poste["Poste de l'utilisateur"]
        subgraph Nav["Navigateur (Chrome, Firefox…)"]
            JS["Bundle JS (dist/assets/index-*.js, ~75 ko gzip)<br/>= React + éditeur + noyau"]
            LSt[("localStorage<br/>clé « plateforme.document »")]
            JS <--> LSt
        end
    end
    subgraph Dev["Machine de développement"]
        Vite["Serveur Vite<br/>pnpm dev :5173 / pnpm preview :4173"]
    end
    Vite -- "HTTP (fichiers statiques)" --> Nav
```

Pour l'instant, il n'y a **aucun serveur applicatif** : tout s'exécute dans le navigateur. Grâce au port `ServiceEditeur`, le noyau pourra plus tard tourner **sur un serveur** sans changer l'interface. Il suffira d'écrire un adaptateur `ServiceEditeurHttp` qui implémente le même port (décision D6).

---

## 9. Diagramme d'objets : le document d'exemple (niveau M1)

Le document de l'étape 2, chargé par le bouton « Charger l'exemple » :

```mermaid
flowchart TB
    racine["racine : Noeud<br/>composant = Conteneur<br/>direction = colonne, espacement = 8<br/>parentId = null"]
    t1["t1 : Noeud<br/>composant = Texte<br/>contenu = « Bienvenue », taille = moyen<br/>parentId = racine"]
    c1["c1 : Noeud<br/>composant = Conteneur<br/>direction = ligne, espacement = 8<br/>parentId = racine"]
    b1["b1 : Noeud<br/>composant = Bouton<br/>libelle = « Valider », variante = principal<br/>parentId = c1"]
    b2["b2 : Noeud<br/>composant = Bouton<br/>libelle = « Annuler », variante = secondaire<br/>parentId = c1"]
    racine -- "enfants[0]" --> t1
    racine -- "enfants[1]" --> c1
    c1 -- "enfants[0]" --> b1
    c1 -- "enfants[1]" --> b2
```

Stockage réel (à plat) : `noeuds = { racine, t1, c1, b1, b2 }`. L'arbre ci-dessus n'est qu'une **lecture** de ces liens `enfants` / `parentId`.

---

## 10. Qualités visées et comment elles sont obtenues

| Qualité | Moyen | Où le vérifier |
|---|---|---|
| **Indépendance technologique du modèle** | Noyau sans React ni DOM, garanti par le compilateur | Scénario S9 |
| **Sûreté** (aucune donnée invalide n'entre) | `validerDocument` sur toute entrée externe (`unknown`), `copierDocumentValide` | `validation.test.ts`, S5 |
| **Prévisibilité** | Fonctions pures, documents immuables, `readonly` partout | « le document d'origine n'a pas changé » dans **chaque** test de commande |
| **Testabilité** | Ports sortants remplacés par des doublures (`n1`, `n2`… ; stockage en mémoire) | `editeur-applicatif.test.ts` |
| **Extensibilité** | Catalogue = données ; palette, formulaire et validation pilotés par le catalogue | Ajouter une entrée dans `composants-base.ts` |
| **Réactivité de l'interface** | Comparaison par référence (immuabilité) + `useSyncExternalStore` | Test « même objet tant que rien ne change » |
| **Robustesse** | `try/catch` sur le stockage, document corrompu ignoré, parcours itératif (pas de débordement de pile) | Tests « dépôt invalide », « 50 000 niveaux » |
