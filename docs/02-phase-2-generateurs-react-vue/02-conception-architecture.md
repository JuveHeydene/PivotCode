# 02 — Conception : l'architecture à la fin de la phase 2

> Ce document décrit l'architecture **telle qu'elle est à la fin de la phase 2**. Celle de la phase 1 reste visible dans [phase 1 › 03](../01-phase-1-modele-pivot-et-editeur/03-conception-architecture.md) ; comparer les deux montre l'évolution.
> Ce qui **n'a pas changé** (le noyau, les commandes, la validation, le service, le circuit d'une commande) n'est pas répété.

---

## 1. Ce qui change en une phrase

On ajoute **trois paquets** autour du noyau, **sans modifier sa structure** : un paquet de **règles de rendu web** partagées, et **deux générateurs**. L'éditeur s'en sert pour afficher le canevas et pour exporter.

---

## 2. Les paquets du monodépôt

```mermaid
flowchart TB
    subgraph packages
        NOYAU["@plateforme/noyau<br/>métamodèle, catalogue, validation,<br/>commandes, service<br/>(inchangé dans sa structure)"]
        RW["@plateforme/rendu-web  NOUVEAU<br/>règles composant → élément web,<br/>palette, CSS de base, arbreWeb()"]
        GR["@plateforme/generateur-react  NOUVEAU<br/>arbre web → JSX + projet Vite"]
        GV["@plateforme/generateur-vue  NOUVEAU<br/>arbre web → template + projet Vite"]
    end
    subgraph apps
        ED["@plateforme/editeur<br/>React + Vite<br/>(+ fflate pour le zip)"]
    end
    RW --> NOYAU
    GR --> RW
    GR --> NOYAU
    GV --> RW
    GV --> NOYAU
    ED --> NOYAU
    ED --> RW
    ED --> GR
    ED --> GV
```

| Paquet | Dépend de | Types du navigateur ? | Rôle |
|---|---|---|---|
| `noyau` | rien | non | Le cœur (phase 1) |
| `rendu-web` | `noyau` | **non** | Les règles « modèle → web », partagées |
| `generateur-react` | `noyau`, `rendu-web` | **non** | Modèle → projet React |
| `generateur-vue` | `noyau`, `rendu-web` | **non** | Modèle → projet Vue |
| `editeur` | tous | oui | L'interface, et les adaptateurs du navigateur |

Les trois nouveaux paquets sont compilés **comme le noyau** : sans les types du navigateur (`"lib": ["ES2022"]`). Ce sont des **fonctions pures** (document → données, ou document → texte). Ils pourront donc tourner **sur un serveur** (export côté serveur, intégration continue) sans aucune modification.

**Règle de dépendance respectée** : toutes les flèches vont vers le noyau. Le noyau ne connaît ni les règles web ni les générateurs.

---

## 3. Où se placent les nouveaux paquets dans l'hexagone

```mermaid
flowchart LR
    subgraph EXT_IN["Adaptateurs ENTRANTS"]
        UI["Interface React<br/>(Editeur, composants)"]
    end
    subgraph COEUR["CŒUR — noyau"]
        S{{"port ServiceEditeur"}}
        D["Domaine<br/>Noeud, Catalogue, validation"]
    end
    subgraph LECTEURS["Lecteurs du modèle (fonctions pures)"]
        RW["rendu-web<br/>arbreWeb()"]
        GR["generateur-react"]
        GV["generateur-vue"]
    end
    subgraph EXT_OUT["Adaptateurs SORTANTS"]
        ZIP["telechargement.ts<br/>(zip + navigateur)"]
        LS["DepotLocalStorage"]
    end
    UI -- "executer, lireDocument" --> S
    UI -- "document lu" --> RW
    UI -- "document lu" --> GR
    UI -- "document lu" --> GV
    RW -. "lit les types et le catalogue" .-> D
    GR --> RW
    GV --> RW
    UI -- "fichiers générés" --> ZIP
    S -. "implémenté par" .- LS
```

**Choix d'architecture** : les générateurs **ne passent pas par le service**. Ils reçoivent un document **déjà lu** (immuable) et ne le modifient jamais. Ce sont des **lecteurs** du modèle, comme le canevas. Les faire passer par le noyau aurait obligé à **modifier** le noyau (un nouveau port « exporter »), ce que l'objectif O12 voulait éviter. Plus tard, un export côté serveur appellera les mêmes fonctions depuis un autre adaptateur.

---

## 4. Diagramme de classes : la représentation web commune

```mermaid
classDiagram
    direction LR
    class ElementWeb {
        <<type>>
        +balise : div | p | button
        +style : StyleWeb
        +texte? : string
        +desactive? : boolean
    }
    class NoeudWeb {
        <<type>>
        +id : NoeudId
        +composant : string
        +enfants : NoeudWeb[]
    }
    class StyleWeb {
        <<type>>
        Record camelCase vers valeur CSS
    }
    class Regles {
        <<module regles.ts>>
        -regles : Record composant vers Regle
        +aUneRegle(composant) boolean
        +decrireNoeud(noeud, catalogue) ElementWeb ou null
    }
    class Lecteur {
        -noeud : Noeud
        -catalogue : Catalogue
        +texte(nom) string
        +nombre(nom) number
        +booleen(nom) boolean
    }
    class ArbreWeb {
        <<module arbre-web.ts>>
        +arbreWeb(document, catalogue, options) NoeudWeb
    }
    class GenerateurReact {
        <<module>>
        +genererApp(document, catalogue) string
        +genererProjetReact(document, catalogue, options) FichierGenere[]
    }
    class GenerateurVue {
        <<module>>
        +genererApp(document, catalogue) string
        +genererProjetVue(document, catalogue, options) FichierGenere[]
    }
    ElementWeb <|-- NoeudWeb
    ElementWeb --> StyleWeb
    NoeudWeb --> NoeudWeb : enfants
    Regles ..> Lecteur : crée
    Regles ..> ElementWeb : produit
    ArbreWeb ..> Regles : utilise
    ArbreWeb ..> NoeudWeb : produit
    GenerateurReact ..> ArbreWeb
    GenerateurVue ..> ArbreWeb
```

---

## 5. Diagrammes de séquence

### 5.1 Afficher le canevas (après la phase 2)

```mermaid
sequenceDiagram
    participant E as Editeur
    participant C as Canevas
    participant A as arbreWeb (rendu-web)
    participant R as regles
    participant Cat as Catalogue
    E->>C: document, catalogue, apercu
    C->>A: arbreWeb(document, catalogue, inconnu remplacer)
    loop pour chaque noeud, depuis la racine
        A->>R: decrireNoeud(noeud, catalogue)
        R->>Cat: trouverPropriete(composant, nom) si la valeur est absente
        R-->>A: ElementWeb (balise, style, texte)
    end
    A-->>C: NoeudWeb (arbre complet)
    C->>C: createElement(balise, style, texte, enfants), récursivement
    Note over C: en édition, ajoute la sélection et les repères. En aperçu, rien.
```

### 5.2 Exporter en React

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant E as Editeur
    participant G as genererProjetReact
    participant A as arbreWeb
    participant J as lignesJsx
    participant T as telechargerZip (adaptateur)
    U->>E: clic Exporter React
    E->>G: genererProjetReact(document, catalogue, nom)
    G->>A: arbreWeb(document, catalogue, inconnu erreur)
    A-->>G: NoeudWeb
    G->>J: lignesJsx(arbre, niveau 2)
    J-->>G: lignes de App.jsx
    G-->>E: 7 fichiers (package.json, index.html, vite.config.js, main.jsx, App.jsx, index.css, README.md)
    E->>T: telecharger(application-generee-react, fichiers)
    T->>T: zipSync avec une date fixe, puis Blob et lien de téléchargement
    T-->>U: application-generee-react.zip
```

Si un composant n'a pas de règle, `arbreWeb` lève `ErreurRendu`. L'éditeur affiche `EXPORT_IMPOSSIBLE`, et **aucun** fichier n'est produit.

---

## 6. L'état du canevas : édition et aperçu

```mermaid
stateDiagram-v2
    [*] --> Edition
    Edition: Édition<br/>repères en pointillés, sélection au clic,<br/>bouton désactivé = aria-disabled
    Apercu: Aperçu<br/>rendu exact, aucune décoration,<br/>bouton désactivé = disabled
    Edition --> Apercu: clic « Aperçu »
    Apercu --> Edition: clic « Revenir à l’édition »
```

---

## 7. Le projet généré (déploiement)

```mermaid
flowchart LR
    subgraph ZIP["application-generee-react.zip (ou -vue)"]
        PKG["package.json<br/>react, react-dom, vite<br/>(ou vue, vite)"]
        HTML["index.html<br/>div root (ou app)"]
        MAIN["src/main.jsx<br/>(ou main.js)"]
        APP["src/App.jsx<br/>(ou App.vue)<br/>LA PAGE"]
        CSS["src/index.css<br/>CSS de base commun"]
    end
    DEV["npm install<br/>npm run dev"] --> NAV["Navigateur<br/>même rendu que le canevas"]
    ZIP --> DEV
```

Le projet généré est **indépendant de la plateforme** : il ne dépend d'aucun paquet `@plateforme/*`. Le concepteur en est **propriétaire** et peut le modifier, l'héberger ou le versionner comme il veut. C'est la réponse aux limites L1 (propriété du code) et L7 (dépendance au fournisseur) de l'étude de l'existant.
