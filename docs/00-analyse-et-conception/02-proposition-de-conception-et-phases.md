> 📁 **Note de classement (21/10/2026)** : ce document s'appelait `conception_plateforme/01_proposition_conception_et_phases.md` dans le dépôt du mémoire. Son contenu n'a pas été modifié. Dans le texte, « document `01` » = [02-proposition-de-conception-et-phases.md](../00-analyse-et-conception/02-proposition-de-conception-et-phases.md), « document `02` » = [03-guide-de-demarrage.md](../00-analyse-et-conception/03-guide-de-demarrage.md), « document `03` » = [01-guide-de-la-phase.md](../01-phase-1-modele-pivot-et-editeur/01-guide-de-la-phase.md). Voir [docs/README.md §4](../README.md).

# 01 — PROPOSITION DE CONCEPTION — Plateforme low-code / no-code fondée sur un modèle pivot

> **Documents de la série** : **`01` Proposition de conception (ce document : la destination)** · `02` Guide de démarrage (la méthode et la feuille de route) · `03` Tranche 1 : l'éditeur et le modèle pivot (le travail concret)

> Document de travail faisant suite à l'étude de l'existant (`etude_de_lexistant/etude_existant_et_positionnement.md`, sections 8 et 9).
> Il reste volontairement **indépendant des technologies** : on parle de « base de données vectorielle », de « file d'attente », de « framework frontend cible », etc., et non de produits précis.

---

## SOMMAIRE

1. Reformulation de la vision et réponses aux questions posées
2. Recensement complet des capacités (ce qui était listé + ce qui manquait)
3. Principes d'architecture pour une plateforme extensible
4. Exigences d'optimisation : structures de données, algorithmes et complexité
5. Phases de réalisation détaillées
6. Dépendances entre phases et périmètre du mémoire
7. Risques principaux
8. Options de stack technique (illustration)
9. Glossaire

---

# 1. REFORMULATION DE LA VISION ET RÉPONSES AUX QUESTIONS POSÉES

## 1.1 La vision en une phrase

> Une plateforme où l'on **conçoit une application complète** (interface, logique, données, connexions) **visuellement ou en langage naturel**, dont la seule source de vérité est un **modèle pivot indépendant des technologies**, à partir duquel on **génère du code propre** dans le framework frontend et le framework backend de son choix, et dans lequel on peut aussi **importer** une application existante pour l'éditer.

## 1.2 Deux publics, un seul modèle

La plateforme vise des utilisateurs **non techniques** et **techniques**. Plutôt que de construire deux produits, on applique le principe de **divulgation progressive** (*progressive disclosure*) : **un seul modèle pivot**, plusieurs **niveaux de surface** dans l'éditeur.

| Niveau | Public | Ce que l'utilisateur manipule | Ce qui est caché |
|---|---|---|---|
| **No-code** | Non technique | Composants, modèles de pages, assistant IA en langage naturel, liaisons par glisser-déposer | Expressions, code, contrats d'API |
| **Low-code** | Semi-technique | + expressions, variables, workflows visuels, règles de validation | Code généré |
| **Pro-code** | Développeur | + code d'extension, vue du code généré, export dans un dépôt, plugins | Rien |

Le niveau n'est **qu'un filtre d'affichage** sur le même modèle : un projet commencé par un non-technicien peut être repris par un développeur sans conversion.

## 1.3 Réponses aux questions posées

### Q1. Faut-il écrire des règles de transformation du modèle pivot vers chaque langage ?

**Oui, et c'est le cœur technique de la plateforme.** En ingénierie dirigée par les modèles (IDM / *Model-Driven Engineering*), ces règles s'appellent des **transformations** :

- **M2M** (*Model-to-Model*) : du modèle pivot (indépendant de la plateforme, dit **PIM**, *Platform-Independent Model*) vers un modèle propre à la cible (**PSM**, *Platform-Specific Model*). Exemple : la notion abstraite « variable de page » devient, dans le PSM d'un framework cible, « état local réactif » ou « signal ».
- **M2T** (*Model-to-Text*) : du PSM vers les fichiers de code, au moyen de **gabarits** (*templates*) paramétrés.

Ces règles doivent être **déterministes et écrites à la main** (et non produites par une IA) pour l'export : un même modèle doit toujours produire le même code, testable, explicable et sans hallucination. Le patron de conception adapté est le **Visiteur** (*Visitor*) : chaque générateur « visite » l'arbre du modèle et émet le code correspondant à chaque type de nœud.

### Q2. Le chemin inverse (code existant → modèle pivot) vaut-il la peine ?

**Oui, mais pas en premier.** C'est une capacité à forte valeur (adoption : « j'importe mon projet existant et je l'édite visuellement »), mais elle est **nettement plus difficile** que l'export, pour une raison de fond :

> Le modèle pivot est **moins expressif** que le code. Tout modèle peut être traduit en code, mais tout code ne peut pas être traduit en modèle.

On traite donc l'import comme une **transformation partielle** (rétro-ingénierie, *Text-to-Model*, T2M) :
1. ce qui correspond à un motif connu (composant standard, liste, formulaire, route, appel d'API) est **converti en éléments du modèle** ;
2. ce qui ne correspond à rien est conservé comme **îlot de code opaque** (un composant « code personnalisé » qui encapsule le code d'origine), affiché dans l'éditeur mais non éditable visuellement ;
3. l'import produit un **taux de couverture** (part du code effectivement modélisée), indicateur mesurable pour le mémoire.

La plateforme a ainsi bien un double rôle **import / export**. Variante intéressante liée à ta bibliographie (REMAUI, génération de sites depuis des maquettes dessinées) : l'import peut aussi partir d'une **image** (capture d'écran, maquette dessinée) au lieu du code. C'est le même métamodèle cible, avec un autre « importeur ».

### Q3. Règles manuelles d'abord, puis affinage (*fine-tuning*) d'une IA ?

**C'est la bonne intuition, à condition de distinguer les deux sens :**

| Sens | Approche recommandée | Justification |
|---|---|---|
| **Export** (modèle → code) | **Règles uniquement**, définitivement | Déterminisme, testabilité, qualité garantie. L'IA n'apporte rien ici, sauf pour le code d'extension écrit librement. |
| **Import** (code → modèle) | **Règles d'abord, puis approche hybride règles + IA, puis IA affinée** | Les règles couvrent les motifs fréquents ; l'IA traite la « longue traîne » des cas non prévus. |

**Point clé, qui rend l'affinage réaliste :** les générateurs d'export fournissent **gratuitement un corpus d'entraînement parfaitement aligné**. Chaque modèle pivot passé au générateur donne une paire *(code, modèle)*. En inversant ces paires, on obtient des exemples « code → modèle » pour entraîner l'importeur. Avec de l'**augmentation de données** (renommage des variables, reformatage, variantes de style d'écriture, composants équivalents), on rapproche ce code synthétique du code écrit par des humains.

L'affinage repose sur l'apprentissage supervisé classique : minimisation d'une **fonction de perte d'entropie croisée** sur les séquences cibles, par **descente de gradient** (variante adaptative avec moment), les gradients étant calculés par **rétropropagation**. Pour limiter le coût, on utilise un **affinage économe en paramètres** (adaptateurs de **faible rang** : on gèle le modèle de base et on n'entraîne que deux petites matrices par couche, soit une fraction de pour cent des paramètres).

### Q4. Modes de communication entre frontend et backend

Ta liste est un bon point de départ, mais elle mélange **styles d'architecture** et **protocoles**. Correction et compléments :

| Élément | Nature | Commentaire |
|---|---|---|
| **REST** | Style d'architecture sur HTTP (requête / réponse, ressources) | Le plus répandu. À traiter en premier. |
| **GraphQL** | Langage de requête sur HTTP | Le client choisit les champs : évite la sur-récupération. Schéma typé exploitable par l'IA. |
| **SOA** | ⚠️ **Style d'architecture**, pas un mode de communication | Organisation d'un système en services. Le protocole historiquement associé est **SOAP** (messages XML décrits par WSDL). |
| **WebSocket** | Protocole bidirectionnel persistant | Temps réel (chat, tableaux de bord en direct, collaboration). |
| **RPC binaire** (type gRPC) | Appel de procédure distante, contrat typé, binaire | Très performant ; surtout entre services, accessible au navigateur via une passerelle. |
| **SSE** (*Server-Sent Events*) | Flux unidirectionnel serveur → client sur HTTP | Notifications, progression, réponses d'IA en flux. Plus simple que WebSocket. |
| **Webhooks** | Appel HTTP sortant déclenché par un événement | Communication serveur → serveur (paiement, intégrations). |
| **Long polling / polling** | Requêtes répétées | Repli quand le temps réel n'est pas disponible. |
| **RPC JSON** | Appel de procédure en JSON sur HTTP | Simple, typable de bout en bout. |
| **Courtiers de messages** (file d'attente, publication / abonnement, flux d'événements) | Communication **asynchrone** | Surtout backend ↔ backend ; parfois exposé au client (objets connectés). |
| **Pair à pair** (canal de données temps réel) | Communication directe entre navigateurs | Visioconférence, partage de fichiers ; cas de niche. |

**Recommandation de modélisation.** Le métamodèle ne doit **pas** connaître ces protocoles. Il connaît trois **modes d'interaction abstraits** :
- **Requête / réponse** (REST, GraphQL requête, RPC, SOAP) ;
- **Abonnement à un flux** (WebSocket, SSE, abonnement GraphQL, polling) ;
- **Commande asynchrone** (file d'attente, webhook : « envoyer et ne pas attendre »).

Chaque protocole concret est un **plugin connecteur** qui implémente un de ces modes. On ajoute un protocole sans toucher au noyau (principe ouvert / fermé).

### Q5. Le « mode proposition / mode validation » : comment le nommer et le structurer

Ce que tu décris est un principe connu sous le nom d'**humain dans la boucle** (*human-in-the-loop*). Une formulation claire pour le mémoire :

> **Cycle Proposer → Prévisualiser → Affiner → Valider.** Toute modification produite par l'IA n'est jamais appliquée directement : elle est présentée comme une **proposition** (un ensemble de modifications, ou *changeset*), visualisée dans un **aperçu**, affinée par de nouvelles instructions, puis **acceptée** (totalement ou partiellement) ou **rejetée** par l'utilisateur.

Structure technique proposée :

```
                       instruction en langage naturel
                                   │
                                   ▼
   ┌──────────┐  génère   ┌────────────────┐  affiche  ┌─────────────┐
   │   IA     │ ────────▶ │  PROPOSITION   │ ────────▶ │   APERÇU    │
   └──────────┘           │ (changeset sur │           │ (calque sur │
        ▲                 │  un calque)    │           │  le modèle) │
        │                 └────────────────┘           └──────┬──────┘
        │   nouvelle instruction (« plus compact »,           │
        └──────────── « trie par date », etc.) ◀── AFFINER ───┤
                                                              │
                         ACCEPTER (tout / en partie) ◀────────┤──────▶ REJETER
                                   │
                                   ▼
                   fusion dans le modèle pivot (commit) + historique
```

- **Proposition = ensemble de commandes** (patron **Commande**) appliquées à un **calque** (copie à la demande du modèle, *copy-on-write*), sans modifier le modèle principal.
- **Machine à états** de la proposition : `Brouillon → Proposée → En aperçu → (Affinée)* → Acceptée | Partiellement acceptée | Rejetée`.
- **Acceptation partielle** : chaque commande du *changeset* est sélectionnable individuellement (comme accepter certaines modifications d'un document en mode suivi des modifications).
- **Bénéfice caché pour l'IA** : chaque acceptation ou rejet est un **signal de préférence humaine** enregistré. Ce journal devient plus tard un jeu de données pour améliorer l'IA par **optimisation des préférences** (cf. phase 10).

Ce mécanisme ne sert pas qu'à l'IA : un **import**, une **migration de version** ou une **modification par un collaborateur** peuvent passer par le même circuit de proposition.

### Q6. Les plugins

Oui, et ils sont la **condition de l'extensibilité** recherchée. La plateforme est conçue comme un **micro-noyau** (*microkernel*) : le noyau ne contient que le métamodèle, le gestionnaire de commandes, la validation et le chargeur de plugins. **Tout le reste est un plugin**, y compris les composants et les générateurs fournis par défaut. Détail en section 3.3.

---

# 2. RECENSEMENT COMPLET DES CAPACITÉS

Légende : ✅ = déjà identifié dans ta liste · ➕ = ajouté (manquait, mais nécessaire à une plateforme complète).

## 2.1 Frontend

| Capacité | Statut | Commentaire |
|---|---|---|
| Éditeur visuel par composants (canevas glisser-déposer) | ✅ | |
| Arbre des composants (arborescence) | ✅ | Vue synchronisée avec le canevas. |
| Modèle pivot comme source de vérité | ✅ | |
| Génération vers plusieurs frameworks cibles | ✅ | |
| Génération de l'interface par IA en langage naturel | ✅ | Sortie = modèle pivot, jamais du code. |
| Import d'une interface existante (rétro-ingénierie) | ✅ | Phase tardive. |
| Panneau de propriétés typé (formulaires générés depuis le schéma du composant) | ➕ | |
| **Système de design** : jetons (couleurs, typographie, espacements), thèmes, mode sombre | ➕ | Les styles ne référencent que des jetons ⇒ export cohérent sur toutes les cibles. |
| **Adaptatif** (*responsive*) : points de rupture, styles par taille d'écran | ➕ | |
| **Gestion d'état** : variables de composant, de page, globales | ➕ | Abstraite dans le modèle, traduite par chaque générateur. |
| **Langage d'expressions** (liaisons, conditions d'affichage, calculs) | ➕ | Petit langage typé, portable vers toutes les cibles. |
| **Événements et workflows frontend** (clic → actions) | ➕ | Ensemble fermé d'actions élémentaires + extension. |
| **Navigation / routage** (pages, paramètres d'URL, gardes d'accès) | ➕ | |
| **Formulaires et validation** | ➕ | |
| **Composants personnalisés** (issue vers le code) | ➕ | Indispensable : cf. « situations où l'éditeur ne suffit pas » de l'étude. |
| Composants composés réutilisables (« mes composants ») | ➕ | Un sous-arbre transformé en définition paramétrable. |
| **Accessibilité** (rôles, libellés, contraste, navigation clavier) | ➕ | Vérifiable automatiquement sur le modèle. |
| **Internationalisation** (textes traduisibles, formats locaux) | ➕ | |
| Modes de rendu (application monopage, rendu serveur, statique) | ➕ | Option du générateur, pas du modèle. |
| Annuler / rétablir, copier / coller, multi-sélection | ➕ | Conséquence directe du patron Commande. |
| Bibliothèque de modèles (gabarits de pages et d'applications) | ➕ | |

## 2.2 Données et backend

| Capacité | Statut | Commentaire |
|---|---|---|
| Export du backend dans plusieurs frameworks | ✅ | Une cible d'abord, interface prévue pour d'autres. |
| **Modèle de données** visuel (entités, attributs, types, relations, contraintes, index) | ➕ | Base de toute génération backend. |
| Génération de l'API à partir du modèle (opérations de lecture / écriture, filtres, pagination, tri) | ➕ | |
| **Contrat d'API** standard publié par le backend généré | ➕ | Jonction formelle front ↔ back. |
| **Authentification et autorisation** (utilisateurs, rôles, permissions par entité et par champ) | ➕ | Souvent oublié, toujours nécessaire. |
| Règles métier déclaratives (validation, champs calculés, déclencheurs) | ➕ | Ensemble fermé + points d'extension en code. |
| Workflows backend (traitements, tâches planifiées, tâches longues via file d'attente) | ➕ | |
| **Migrations de schéma** entre versions du modèle de données | ➕ | Calcul automatique de la différence entre deux versions. |
| Stockage de fichiers (téléversement, images) | ➕ | |
| Données de test / jeux de démonstration | ➕ | Pour l'aperçu et les tests. |
| **Serveur simulé** (*mock*) à partir du contrat | ➕ | Permet l'aperçu de l'interface avant que le backend existe. |
| Patron « génération séparée » (*generation gap*) | ➕ | Régénérer sans écraser le code écrit à la main. |

## 2.3 Connexion frontend ↔ backend

| Capacité | Statut | Commentaire |
|---|---|---|
| Connexion visuelle d'un composant à une source de données | ✅ | |
| Sélection d'un composant + instruction en langage naturel pour le connecter | ✅ | |
| Import d'un backend, d'une API ou d'un client d'API existant | ✅ | Via son contrat (description d'API, schéma GraphQL, etc.). |
| Proposition de connexion par l'IA + aperçu + validation / modification par prompt | ✅ | Cycle Proposer → Prévisualiser → Affiner → Valider. |
| Plusieurs modes de communication | ✅ | Abstraits en trois modes (cf. Q4). |
| **Éditeur de correspondance** (champs de la réponse ↔ propriétés du composant) | ➕ | Vue visuelle de ce que l'IA propose. |
| **Gestion des secrets** (clés d'API) et **serveur intermédiaire** (*proxy*) | ➕ | Les clés ne doivent jamais être dans le code client. |
| États de chargement, d'erreur, de vide ; nouvelle tentative ; cache | ➕ | Générés automatiquement pour toute liaison. |
| Environnements (développement, test, production) avec URL et secrets distincts | ➕ | |

## 2.4 Intelligence artificielle

| Capacité | Statut | Commentaire |
|---|---|---|
| Génération d'interface (modèle pivot) depuis le langage naturel | ✅ | |
| Agent de connexion composant ↔ API | ✅ | |
| Mode proposition / validation | ✅ | Formalisé en Q5. |
| Règles puis affinage d'une IA pour l'import | ✅ | Formalisé en Q3. |
| **Modification ciblée** (« rends ce tableau triable ») et non régénération complète | ➕ | L'IA émet des **commandes** (patch), pas un modèle entier : moins de jetons, moins de risques. |
| Génération du **modèle de données** depuis une description du domaine | ➕ | |
| Assistance à l'écriture du **code d'extension** | ➕ | |
| **Recherche sémantique** dans les catalogues (composants, API, modèles) | ➕ | Base de données vectorielle. |
| **Boucle de validation et d'auto-réparation** des sorties de l'IA | ➕ | Le validateur du modèle renvoie les erreurs à l'IA. |
| Explication / documentation automatique de l'application | ➕ | |
| **Évaluation** de l'IA (jeux de tests, métriques) | ➕ | Indispensable pour un mémoire de recherche. |
| Maîtrise des coûts (cache des réponses, choix du modèle selon la tâche) | ➕ | L'étude relève l'imprévisibilité des coûts (L6). |
| Protection contre l'**injection de prompt** (descriptions d'API externes malveillantes) | ➕ | |

## 2.5 Plateforme, cycle de vie, écosystème

| Capacité | Statut | Commentaire |
|---|---|---|
| Architecture extensible sans refonte | ✅ | Micro-noyau + plugins + métamodèle versionné. |
| Plugins | ✅ | |
| **Versionnement du modèle** (historique, branches, comparaison) | ➕ | |
| **Collaboration** multi-utilisateur (simultanée ou non) | ➕ | Préparée dès le noyau (tout est commande). |
| **Versionnement du métamodèle** et migration des projets | ➕ | Sinon chaque évolution casse les projets existants. |
| Export vers un dépôt de code, intégration continue | ➕ | |
| Déploiement (conteneurs, hébergement au choix) | ➕ | |
| **Tests** : du modèle, du code généré, de parité entre cibles | ➕ | |
| Sécurité de la plateforme (comptes, droits sur les projets, journal d'audit, isolation du code tiers) | ➕ | |
| Observabilité (journaux, métriques, traces) | ➕ | |
| Place de marché de plugins, documentation, API publique de la plateforme | ➕ | Phase tardive. |

---

# 3. PRINCIPES D'ARCHITECTURE POUR UNE PLATEFORME EXTENSIBLE

L'objectif exprimé est que **chaque ajout se greffe sur l'existant** sans refondre la base. Cela repose sur six principes.

## 3.1 Principe 1 — Ingénierie dirigée par les modèles : quatre niveaux

| Niveau | Nom | Contenu dans notre plateforme | Qui le modifie |
|---|---|---|---|
| **M3** | Méta-métamodèle | Le langage qui sert à **décrire des métamodèles** : notions de *classe*, *attribut*, *référence*, *type*, *contrainte*. Concrètement : un langage de schéma. | Personne (stable) |
| **M2** | **Métamodèle** | Le « langage » de la plateforme : `Application`, `Page`, `Nœud`, `DéfinitionDeComposant`, `Liaison`, `Entité`, `Relation`, `Action`, `Rôle`… | L'équipe et **les plugins** (qui y ajoutent des types) |
| **M1** | **Modèle** (le modèle pivot) | L'application d'un utilisateur : « page Clients avec un tableau lié à l'API /clients ». | L'utilisateur, l'IA, l'importeur |
| **M0** | Système réel | L'application générée en exécution. | Les générateurs |

**Pourquoi c'est la clé de l'extensibilité.** Le noyau est écrit contre **M3** (il sait manipuler *n'importe quel* type décrit par un schéma) et non contre M2. Ajouter un nouveau type de composant, une nouvelle action ou un nouveau type de source de données revient à **ajouter une description au métamodèle**, pas à modifier le code du noyau. L'éditeur (panneau de propriétés), le validateur et la sérialisation fonctionnent automatiquement pour le nouveau type, parce qu'ils sont **pilotés par les métadonnées**.

## 3.2 Principe 2 — Le métamodèle (M2) : contenu proposé

```
Application
 ├── métadonnées (version du métamodèle, plugins requis, cibles choisies)
 ├── SystèmeDeDesign ── Jeton*, Thème*, PointDeRupture*
 ├── Route* ── Page ── Nœud (arbre)
 │                      ├── type → DéfinitionDeComposant
 │                      ├── propriétés : { nom → Valeur }
 │                      │     Valeur = Littéral | Expression | Liaison | RéférenceDeJeton
 │                      ├── styles (par point de rupture et par état : survol, désactivé…)
 │                      ├── événements : { nom → Workflow }
 │                      ├── emplacements (slots) → Nœud*
 │                      └── provenance (humain | IA | import), verrou
 ├── Variable* (portée : composant | page | globale, type, valeur initiale)
 ├── Workflow* ── Action* (graphe : séquence, condition, boucle, parallèle, gestion d'erreur)
 ├── SourceDeDonnées* ── Opération* (mode : requête-réponse | abonnement | commande asynchrone)
 │                         └── entrées / sorties typées (schémas)
 ├── ModèleDeDonnées ── Entité* ── Attribut*, Relation*, Contrainte*, Index*
 ├── Sécurité ── Rôle*, Permission* (sur page, opération, entité, champ)
 ├── RègleMétier* (déclarative) / PointD'Extension* (code)
 ├── Traductions* (clé → texte par langue)
 └── Environnement* (variables, URL, références de secrets)

DéfinitionDeComposant (fournie par un plugin)
 ├── schéma des propriétés (types, valeurs par défaut, contraintes)
 ├── événements émis, emplacements acceptés, capacités (« affiche une collection », « saisit une valeur »…)
 ├── rendu d'aperçu (pour l'éditeur)
 └── règles de génération par cible (fournies par les plugins générateurs)
```

Décisions de conception importantes :

1. **Aucune chaîne de code brut dans le modèle** (sauf dans les points d'extension explicitement marqués). Les conditions et calculs passent par un **langage d'expressions** propre, analysé en **arbre syntaxique abstrait** (AST) et stocké sous cette forme. Il est ainsi **interprétable** par l'aperçu, **traduisible** vers chaque cible et **vérifiable** (types, références).
2. **Typage partout** : chaque propriété, variable, entrée et sortie d'opération a un type. C'est ce qui rend possible la **vérification des liaisons** (on ne lie pas une liste à un champ texte) et ce qui guide l'IA.
3. **Capacités sémantiques** des composants (« affiche une collection », « affiche une série temporelle ») : c'est ce que l'agent IA exploite pour comprendre ce qu'un composant attend.
4. **Identifiants stables** (uniques, non réutilisés) pour chaque élément : indispensable pour les commandes, la collaboration, les différences entre versions et l'incrémentalité.

## 3.3 Principe 3 — Micro-noyau et points d'extension

```
┌───────────────────────────────────────────────────────────────────────────┐
│                               NOYAU (stable)                              │
│  Métamodèle (M3+M2 de base) · Dépôt du modèle · Bus de commandes          │
│  Validation · Bus d'événements · Registre des extensions · Migrations     │
└───────────────┬───────────────────────────────────────────────────────────┘
                │ interfaces génériques (contrats versionnés)
   ┌────────────┼─────────────┬──────────────┬──────────────┬─────────────┐
   ▼            ▼             ▼              ▼              ▼             ▼
Composants  Générateurs   Connecteurs    Importeurs     Outils IA     Actions
(UI)        front / back  (protocoles)   (code, image,  (pour les     (workflow)
                                          maquette)      agents)
   ▼            ▼             ▼              ▼              ▼             ▼
Thèmes   Fournisseurs   Cibles de        Règles de      Panneaux      Fournisseurs
         d'auth.        déploiement      validation     d'éditeur     de stockage
```

**Points d'extension** typés avec des **génériques** (exprimés ici en pseudo-code) :

```
interface Extension { id, version, compatibiliteNoyau, dependances }

interface DefinitionComposant extends Extension { schemaProprietes, evenements, capacites, rendreApercu(noeud, contexte) }
interface Generateur<TCible>   extends Extension { cible: TCible ; generer(modele: ModeleValide) → EnsembleDeFichiers }
interface Connecteur<TConfig>  extends Extension { decrire(config: TConfig) → Contrat ; executer(operation, entrees) → Resultat }
interface Importeur<TSource>   extends Extension { importer(source: TSource) → Proposition<Modele> & RapportDeCouverture }
interface RegleValidation      extends Extension { portee: TypeDeNoeud ; verifier(element, contexte) → Diagnostic* }
interface OutilIA              extends Extension { nom, schemaEntree, schemaSortie, executer(entree) }

class Registre<T extends Extension> { enregistrer(T) ; trouver(id) → T ; lister(filtre) → T* }
```

**Cycle de vie d'un plugin** : découverte → lecture du **manifeste** (identité, version, intervalle de versions du noyau compatibles, dépendances, permissions demandées) → résolution des dépendances (**tri topologique**, détection de cycles) → chargement **paresseux** (à la première utilisation) → activation → désactivation.

**Isolation** : un plugin tiers ne touche jamais aux structures internes du noyau ; il reçoit une **façade** limitée et des **permissions par capacité** (lire le modèle, émettre des commandes, faire des appels réseau…). Le code tiers s'exécute dans un **contexte isolé** (bac à sable).

**Règle d'or : les fonctionnalités de base sont elles-mêmes des plugins.** Si les composants et le premier générateur fournis passent par les mêmes interfaces que les plugins tiers, ces interfaces sont **éprouvées dès le premier jour**, et ajouter une cible plus tard ne demandera aucune modification du noyau.

## 3.4 Principe 4 — Toute modification est une commande

Chaque changement du modèle (par l'utilisateur, l'IA, l'importeur, un collaborateur) passe par le **bus de commandes** sous forme d'**opération atomique et inversible** : `insérerNœud`, `déplacerNœud`, `supprimerNœud`, `modifierPropriété`, `lier`, etc.

Ce principe unique apporte gratuitement :
- **annuler / rétablir** (chaque commande connaît son inverse) ;
- le **mode proposition** (un *changeset* = une liste de commandes non encore appliquées au modèle principal) ;
- l'**historique** et l'**audit** (qui a modifié quoi, humain ou IA) ;
- la **collaboration temps réel** plus tard (diffuser des commandes plutôt que des modèles entiers) ;
- l'**incrémentalité** (les générateurs et l'aperçu savent exactement ce qui a changé).

## 3.5 Principe 5 — Tout est versionné

| Ce qui est versionné | Mécanisme |
|---|---|
| Le **modèle** d'un projet | Historique de commandes + instantanés périodiques ; branches ; comparaison. |
| Le **métamodèle** | Numéro de version sémantique + **chaîne de migrations** (v1→v2→v3…) appliquées automatiquement au chargement d'un ancien projet. |
| Les **contrats des points d'extension** | Version sémantique ; un plugin déclare l'intervalle compatible. |
| Les **générateurs** | La version du générateur fait partie de la clé de cache (cf. section 4). |

## 3.6 Principe 6 — Séparation édition / aperçu / export

| Fonction | Approche | Raison |
|---|---|---|
| **Aperçu dans l'éditeur** | **Interprétation** du modèle (patron *Interpréteur*) | Immédiat, sans compilation. |
| **Export** | **Génération de code** (transformations M2M + M2T) | Code propre, possédé par l'utilisateur. |

Les deux approches identifiées dans l'étude (section 6) sont ainsi combinées. Un **test de parité** vérifie que l'aperçu et le code exporté se comportent de la même façon.

## 3.7 Patrons de conception mobilisés

| Patron | Où | Rôle |
|---|---|---|
| **Composite** | Arbre des nœuds | Traiter uniformément un composant simple et un conteneur. |
| **Visiteur** | Générateurs, validateurs, analyses | Ajouter un traitement sur l'arbre sans modifier les classes de nœuds. |
| **Interpréteur** | Moteur d'aperçu, langage d'expressions | Exécuter le modèle directement. |
| **Commande** | Toutes les modifications | Annuler / rétablir, propositions, historique, collaboration. |
| **Mémento** | Instantanés du modèle | Restauration rapide sans rejouer tout l'historique. |
| **Stratégie** | Choix de la cible (framework, protocole, base) | Interchanger les algorithmes de génération. |
| **Fabrique abstraite** | Chaque générateur fournit une famille cohérente de produits (composant, routeur, gestion d'état) | Cohérence intra-cible. |
| **Méthode patron** (*Template Method*) | Pipeline de génération commun (valider → normaliser → transformer → écrire → formater) | Étapes fixes, détails propres à la cible. |
| **Observateur / Publication-abonnement** | Bus d'événements, mise à jour de l'aperçu | Découplage des modules. |
| **Médiateur** | Coordination éditeur ↔ canevas ↔ arbre ↔ panneaux | Éviter les dépendances croisées. |
| **Adaptateur** | Connecteurs vers des API hétérogènes | Uniformiser l'accès aux sources. |
| **Façade** | API exposée aux plugins | Masquer le noyau. |
| **Mandataire** (*Proxy*) | Serveur intermédiaire pour les appels d'API avec secrets | Sécurité, cache, journalisation. |
| **Chaîne de responsabilité** | Pipeline de validation, intergiciels (*middlewares*) | Règles empilables. |
| **Registre / Micro-noyau** | Gestion des plugins | Extensibilité. |
| **Dépôt** (*Repository*) | Persistance du modèle et du code généré côté backend | Isoler le stockage. |
| **Génération séparée** (*Generation Gap*) | Code généré | Régénération sans perte du code manuel. |
| **Machine à états** | Propositions, cycle de vie des plugins, des déploiements | États explicites et transitions contrôlées. |
| **Architecture hexagonale** (ports et adaptateurs) | Organisation du serveur de la plateforme | Le cœur métier ne dépend d'aucune technologie concrète (stockage, IA, file d'attente). |

---

# 4. EXIGENCES D'OPTIMISATION : STRUCTURES DE DONNÉES, ALGORITHMES ET COMPLEXITÉ

Notations : *n* = nombre de nœuds du modèle, *k* = nombre d'éléments modifiés, *h* = profondeur de l'arbre, *V*, *E* = sommets et arêtes d'un graphe.

| Problème | Approche naïve (à éviter) | Approche retenue | Complexité |
|---|---|---|---|
| **Stockage de l'arbre** | Arbre imbriqué : retrouver un nœud = parcours complet, *O(n)* | **Représentation normalisée** : table de hachage `id → nœud`, chaque nœud porte `idParent` et la liste ordonnée de ses enfants | Accès *O(1)*, déplacement *O(1)* (hors réordonnancement) |
| **Ordre des enfants** (insertion au milieu, collaboration) | Indices entiers : réindexation *O(m)* à chaque insertion | **Indexation fractionnaire** : clé d'ordre entre deux clés existantes | Insertion *O(1)*, pas de conflit entre utilisateurs simultanés |
| **Annuler / rétablir** | Copier tout le modèle à chaque modification, *O(n)* mémoire | **Commandes inversibles** + **structures persistantes à partage structurel** (seul le chemin modifié est recopié) | *O(1)* à *O(h)* par opération |
| **Mise à jour de l'aperçu** | Re-rendre tout le canevas | **Rendu incrémental** : seuls les nœuds touchés par les commandes, + **virtualisation** (ne rendre que la partie visible) | *O(k)* au lieu de *O(n)* |
| **Sélection au clic / survol sur le canevas, alignement magnétique** | Tester tous les rectangles, *O(n)* | **Index spatial** (arbre de partition de l'espace : quadtree ou R-tree) | *O(log n)* en moyenne |
| **Différence entre deux versions du modèle** | Distance d'édition d'arbres exacte, au moins *O(n³)* | **Différence par identifiants stables** (appariement direct des nœuds de même identifiant, comme le fait la réconciliation des frameworks d'interface) | *O(n)* |
| **Génération incrémentale** | Régénérer tout le projet à chaque export | **Hachage de Merkle** des sous-arbres + **cache** indexé par *(hachage, version du générateur)* : on ne régénère que les fichiers dont le hachage a changé | *O(k · h)* |
| **Ordre de génération, dépendances entre éléments** (entités, composants réutilisables, plugins) | Ordre arbitraire, erreurs de références | **Tri topologique** (algorithme de Kahn) | *O(V + E)* |
| **Détection de cycles** (composant qui s'inclut lui-même, dépendances circulaires d'entités ou de plugins, expressions mutuellement dépendantes) | Découverte à l'exécution | **Composantes fortement connexes** (algorithme de Tarjan) | *O(V + E)* |
| **Réévaluation des expressions** quand une variable change | Tout réévaluer | **Graphe de dépendances réactif** : seules les expressions dépendant de la variable modifiée sont recalculées (propagation dans l'ordre topologique) | Proportionnel au nombre d'expressions dépendantes |
| **Analyse du langage d'expressions** | Expressions régulières fragiles | **Analyseur descendant à précédence d'opérateurs** (type Pratt) produisant un AST | *O(longueur)* |
| **Vérification des types des liaisons** | À l'exécution | **Vérification statique** sur l'AST (inférence de types simple, unification pour les génériques de type « liste de T ») | Quasi linéaire |
| **Validation du modèle** | Revalider tout le modèle à chaque frappe | **Validation incrémentale** : seules les règles concernées par les nœuds modifiés et leurs dépendants | *O(k)* en pratique |
| **Recherche d'API / de composants par sens** (agent IA) | Comparer l'intention à chaque description, *O(N)* | **Plongements vectoriels** (*embeddings*) + **recherche approximative des plus proches voisins** dans une base de données vectorielle (graphe de proximité hiérarchique) + **reclassement** des meilleurs candidats | *O(log N)* environ |
| **Correspondance des champs** (réponse d'API ↔ propriétés du composant) | Essais manuels | **Problème d'affectation** : matrice de similarité (noms, types, valeurs d'exemple, plongements), résolue par l'**algorithme hongrois** sous contrainte de compatibilité de types ; l'IA n'intervient que si la confiance est faible | *O(m³)* avec *m* petit (dizaines de champs) |
| **Calcul des migrations de base** entre deux versions du modèle de données | Recréer la base | **Différence de schémas** appariée par identifiants (ajout, suppression, renommage, changement de type) | *O(entités + attributs)* |
| **Reconnaissance de motifs à l'import** | Comparaisons ad hoc | **Filtrage de motifs sur arbres** (*tree pattern matching*) sur l'AST du code source, règles ordonnées par spécificité | Linéaire en la taille de l'AST pour un ensemble de motifs fixé |
| **Tâches longues** (export, construction, génération IA, import) | Traitement synchrone qui bloque l'interface | **File d'attente** de tâches + travailleurs + notification de progression en flux | Interface jamais bloquée |
| **Coût de l'IA** | Envoyer tout le modèle à chaque requête | Envoi du **sous-arbre pertinent + résumé** ; l'IA produit des **commandes** (taille *O(k)*) et non un modèle complet (taille *O(n)*) ; **cache** des réponses ; choix d'un modèle d'IA léger pour les tâches simples | Jetons proportionnels à la modification, pas à l'application |
| **Collaboration simultanée** (plus tard) | Verrou global | **Types de données répliqués sans conflit** (CRDT) adaptés aux arbres (avec opération de déplacement sûre), ou verrouillage par sous-arbre dans un premier temps | Convergence garantie sans serveur arbitre |

---

# 5. PHASES DE RÉALISATION DÉTAILLÉES

## 5.0 Méthode générale

- **Couches successives, mais tranche verticale d'abord.** Avant d'élargir chaque phase, on réalise une **tranche verticale minimale** qui traverse toutes les couches (métamodèle → éditeur → aperçu → un générateur) avec **trois composants** seulement (texte, bouton, conteneur). Elle valide le métamodèle avant qu'il ne soit coûteux à modifier.
- **Chaque phase se termine par un livrable exécutable** et des **critères de sortie** vérifiables.
- **Décisions d'architecture tracées** : chaque choix structurant est consigné dans une courte fiche (contexte, options, décision, conséquences). Ces fiches alimentent directement le mémoire.
- **Ordre guidé par les dépendances** : une phase ne dépend que des précédentes (cf. section 6).

---

## PHASE 0 — Cadrage et spécification du métamodèle

**Objectif.** Fixer ce qui sera le plus coûteux à changer plus tard : le métamodèle et les contrats.

**Sous-étapes.**

1. **Rédiger les scénarios de référence** (5 à 10 applications types : liste de clients avec formulaire, tableau de bord, application de rendez-vous, mini-boutique, page vitrine). Ils servent de **jeu de tests** pour toutes les phases et pour l'évaluation finale.
2. **Inventaire des concepts** à partir des scénarios : quels éléments du métamodèle (section 3.2) sont réellement nécessaires.
3. **Choisir le langage de description du métamodèle (M3)** : un langage de schéma standard permettant types, références, contraintes et extensions.
4. **Spécifier le métamodèle M2 de base** : classes, attributs, références, contraintes d'intégrité (ex. : « un nœud a exactement un parent sauf la racine », « une liaison relie des types compatibles »). Exprimer les contraintes de façon déclarative (à la manière d'un langage de contraintes sur objets).
5. **Spécifier le langage d'expressions** : grammaire, types, ensemble fermé de fonctions (texte, nombre, date, collections), règles de portée des variables. Le garder **sans effet de bord** (pur), ce qui le rend traduisible et sûr.
6. **Spécifier le catalogue des commandes** (insérer, déplacer, supprimer, modifier, lier…) avec, pour chacune, sa **commande inverse** et ses préconditions.
7. **Spécifier les contrats des points d'extension** (section 3.3) en version 0.
8. **Définir la politique de versionnement** du métamodèle et le format des migrations.
9. **Définir les métriques** qui seront mesurées tout au long du projet (temps de réponse de l'éditeur, temps d'export, taux de compilation du code généré, précision de l'IA…).

**Concepts mobilisés.** IDM (M3/M2/M1/M0), PIM / PSM, contraintes déclaratives, grammaires formelles, versionnement sémantique.

**Livrables.** Spécification du métamodèle et du langage d'expressions ; catalogue des commandes ; contrats d'extension ; scénarios de référence ; fiches de décision.

**Critères de sortie.** Chaque scénario de référence peut être **écrit à la main** comme une instance valide du métamodèle.

---

## PHASE 1 — Noyau de la plateforme

**Objectif.** Construire le socle stable sur lequel tout le reste se greffe.

**Sous-étapes.**

1. **Dépôt du modèle** : représentation normalisée (table `id → élément`), indexation fractionnaire pour l'ordre, structure persistante à partage structurel.
2. **Sérialisation / désérialisation** du modèle, avec vérification de la version du métamodèle et application des **migrations** si nécessaire.
3. **Bus de commandes** : exécution, inversion, regroupement de commandes en **transactions** (une action utilisateur = une transaction annulable), journal des commandes.
4. **Annuler / rétablir** sur le journal.
5. **Bus d'événements** : publication de « ce qui a changé » (identifiants modifiés) pour les abonnés (aperçu, validation, générateurs).
6. **Moteur de validation** piloté par le métamodèle (structure, types, références, contraintes) avec **validation incrémentale** et diagnostics localisés (élément, gravité, message, correction suggérée).
7. **Langage d'expressions** : analyseur → AST, vérificateur de types, **interpréteur**, détection des dépendances (pour le graphe réactif).
8. **Registre des extensions et chargeur de plugins** : manifestes, résolution des dépendances (tri topologique), contrôle de compatibilité, chargement paresseux, façade et permissions.
9. **Mécanisme de propositions** (*changesets* sur calque, machine à états) dès maintenant, même sans IA : il servira à l'import, à l'IA et à la collaboration.
10. **Persistance de la plateforme** (projets, utilisateurs, historique) derrière un port abstrait (architecture hexagonale).
11. **Tests** : tests unitaires de chaque commande (propriété « appliquer puis inverser = identité »), **tests par propriétés** (génération aléatoire de suites de commandes valides, vérification que le modèle reste valide).

**Concepts mobilisés.** Commande, Mémento, Observateur, Registre, Micro-noyau, Façade, Interpréteur ; tri topologique ; structures persistantes ; tables de hachage ; tests par propriétés.

**Livrables.** Noyau utilisable en bibliothèque, sans interface graphique, avec ses tests.

**Critères de sortie.** Les scénarios de référence peuvent être **construits par une suite de commandes**, annulés entièrement, validés, sérialisés et rechargés à l'identique.

---

## PHASE 2 — Éditeur visuel et moteur d'aperçu

**Objectif.** Permettre de construire une interface visuellement, sur le noyau.

**Sous-étapes.**

1. **Plugin « composants de base »** (10 à 20 composants : texte, image, bouton, champ de saisie, liste, tableau, carte, formulaire, conteneurs de mise en page en ligne / colonne / grille, onglets, fenêtre modale), chacun décrit par une `DéfinitionDeComposant`.
2. **Moteur d'aperçu** (interpréteur du modèle) : rendu des nœuds, évaluation des expressions, styles résolus depuis les jetons, rendu incrémental à partir des événements du noyau.
3. **Canevas** : sélection, glisser-déposer (depuis la palette et entre conteneurs), guides d'alignement, redimensionnement, **index spatial** pour les interactions, **virtualisation** pour les grandes pages.
4. **Arbre des composants** synchronisé avec le canevas (sélection croisée, déplacement dans l'arbre).
5. **Panneau de propriétés généré** à partir du schéma de chaque composant (un champ de formulaire par propriété typée), avec bascule « valeur fixe / expression / liaison ».
6. **Système de design** : éditeur de jetons, thèmes, points de rupture ; les styles des nœuds ne référencent que des jetons ou des valeurs par point de rupture.
7. **Gestion des pages et des routes** (création, paramètres, page d'accueil).
8. **Niveaux de surface** (no-code / low-code / pro-code) comme filtres d'affichage.
9. **Composants composés réutilisables** : transformer une sélection en définition paramétrable.
10. **Affichage des diagnostics** de validation directement sur le canevas.
11. **Mesures de performance** : temps de réponse à une modification sur une page de plusieurs centaines de nœuds.

**Concepts mobilisés.** Composite, Interpréteur, Médiateur, Observateur ; index spatial ; rendu incrémental ; formulaires pilotés par les métadonnées.

**Livrables.** Éditeur fonctionnel : construire, prévisualiser, sauvegarder une interface statique et adaptative.

**Critères de sortie.** Les parties « interface » des scénarios de référence sont réalisables uniquement à la souris ; temps de réponse perçu inférieur à environ 100 ms sur une page de référence.

---

## PHASE 3 — Logique applicative (état, événements, workflows, navigation)

**Objectif.** Passer d'une maquette à une application qui **réagit**.

**Sous-étapes.**

1. **Variables** de composant, de page, globales ; éditeur de variables typées.
2. **Graphe réactif** : quand une variable change, réévaluer uniquement les expressions qui en dépendent (ordre topologique ; détection de cycles avec Tarjan, signalée comme erreur de validation).
3. **Ensemble fermé d'actions élémentaires** : affecter une variable, naviguer, afficher un message, ouvrir / fermer une fenêtre, appeler une opération (branchée en phase 6), condition, boucle sur une collection, attendre, gérer une erreur. Chaque action est un plugin du point d'extension « Action ».
4. **Éditeur visuel de workflows** (graphe d'actions) déclenchés par des événements de composants ou de page (chargement).
5. **Formulaires** : liaison champ ↔ variable, règles de validation déclaratives, messages d'erreur.
6. **Navigation** avec paramètres, gardes (page accessible si condition), préparation du lien avec les rôles.
7. **Point d'extension « code personnalisé »** : fonction à signature typée déclarée dans le modèle, corps écrit dans un langage cible (issue vers le code) ; exécution isolée dans l'aperçu.
8. **Internationalisation** : textes par clé, langue courante comme variable globale.

**Concepts mobilisés.** Interpréteur, Machine à états, Chaîne de responsabilité (gestion d'erreurs) ; tri topologique, composantes fortement connexes ; vérification de types.

**Livrables.** Applications interactives fonctionnelles dans l'aperçu (sans backend réel, avec données locales).

**Critères de sortie.** Le comportement des scénarios de référence (sans données distantes) fonctionne dans l'aperçu.

---

## PHASE 4 — Génération frontend multi-cibles

**Objectif.** Exporter le modèle en **code source propre** vers au moins deux frameworks frontend.

**Sous-étapes.**

1. **Pipeline de génération commun** (Méthode patron) : valider → normaliser / enrichir (résolution des références, inférence des types, calcul des dépendances) → **M2M** vers le PSM de la cible → **M2T** par gabarits → formatage → écriture → manifeste de fichiers.
2. **Correspondances par cible** pour chaque aspect : structure (arbre → gabarits de composants), styles (jetons → feuilles de style ou classes utilitaires), état (variables → mécanisme réactif de la cible), routage, workflows (une règle de génération par action élémentaire), expressions (**traduction de l'AST** vers le langage de la cible), internationalisation.
3. **Générateur cible n° 1**, livré comme plugin.
4. **Structure de projet générée** : arborescence conventionnelle de la cible, fichiers de configuration, scripts de construction, fichier d'explication, tests minimaux.
5. **Patron génération séparée** : fichiers générés (régénérables) et fichiers d'extension (jamais écrasés) clairement séparés ; le code personnalisé est placé dans ces derniers.
6. **Génération incrémentale** : hachage de Merkle des sous-arbres, cache par *(hachage, version du générateur)*.
7. **Générateur cible n° 2** : il doit **réutiliser le pipeline et ne rien modifier au noyau**. C'est la preuve de l'extensibilité.
8. **Tests** :
   - **compilation** du code généré pour chaque scénario et chaque cible ;
   - **tests par propriétés** : modèles valides générés aléatoirement → le code doit compiler ;
   - **parité visuelle** entre l'aperçu, la cible 1 et la cible 2 : captures d'écran comparées par une **mesure de similarité structurelle d'images** ;
   - **parité comportementale** : mêmes scénarios d'interaction joués automatiquement sur chaque export ;
   - **qualité du code** : métriques de complexité, duplication, lisibilité.
9. **Export** sous forme d'archive puis vers un dépôt de code.

**Concepts mobilisés.** M2M, M2T, Visiteur, Stratégie, Fabrique abstraite, Méthode patron, Génération séparée ; hachage de Merkle, mémoïsation ; tests par propriétés.

**Livrables.** Deux générateurs frontend ; rapport de parité et de qualité.

**Critères de sortie.** Chaque scénario de référence s'exporte vers les deux cibles, compile et passe les tests de parité ; l'ajout de la cible 2 n'a demandé **aucune modification du noyau**.

---

## PHASE 5 — Modèle de données et génération backend

**Objectif.** Modéliser les données et générer un backend exportable.

**Sous-étapes.**

1. **Éditeur visuel du modèle de données** (diagramme entités-relations) : entités, attributs typés, relations (1-1, 1-n, n-n), contraintes (obligatoire, unique, bornes, format), index, valeurs par défaut.
2. **Sécurité** : rôles, permissions par entité, par opération et par champ ; authentification abstraite (fournisseurs en plugins).
3. **Règles métier déclaratives** : validations, champs calculés, déclencheurs simples (« à la création de… envoyer un message »), ensemble fermé + points d'extension en code.
4. **Dérivation automatique du contrat d'API** à partir du modèle de données : opérations de lecture (avec filtres, tri, pagination), création, modification, suppression, schémas d'entrée / sortie, codes d'erreur.
5. **Serveur simulé** à partir du contrat (réponses générées depuis les schémas et les données de test) : l'interface peut être connectée et prévisualisée **avant** que le backend existe.
6. **Générateur backend cible n° 1** (plugin), en couches : entités / persistance, dépôts, services, contrôleurs, objets de transfert, correspondances, sécurité, validation, documentation du contrat, migrations, tests.
7. **Génération séparée** côté backend : classes générées et classes d'extension qui en héritent.
8. **Calcul des migrations** : différence entre deux versions du modèle de données (appariement par identifiants stables) → scripts de migration ordonnés.
9. **Tâches longues et planifiées** : modélisation d'un traitement asynchrone via une file d'attente.
10. **Tests** : compilation, démarrage, tests automatiques du contrat (le backend généré respecte-t-il exactement le contrat dérivé ?).
11. (Extension) **Générateur backend cible n° 2**, même critère qu'en phase 4 : aucune modification du noyau.

**Concepts mobilisés.** IDM, Dépôt, Génération séparée, architecture en couches et hexagonale, Stratégie ; différence de schémas ; tri topologique (ordre des entités et des migrations).

**Livrables.** Backend généré exécutable ; contrat d'API publié ; migrations.

**Critères de sortie.** Les scénarios de référence disposent d'un backend généré qui démarre, respecte son contrat et passe ses tests.

---

## PHASE 6 — Connexion frontend ↔ backend

**Objectif.** Relier visuellement les composants aux données, qu'elles viennent du backend généré ou d'une API externe.

**Sous-étapes.**

1. **Point d'extension « Connecteur »** et trois modes d'interaction abstraits (requête-réponse, abonnement, commande asynchrone).
2. **Connecteur requête-réponse sur HTTP** décrit par un contrat standard (premier connecteur), puis **connecteur GraphQL**, puis **connecteurs temps réel** (WebSocket, flux serveur).
3. **Import d'une source** : à partir d'un contrat (fichier ou URL), d'un client d'API, ou d'un backend généré par la plateforme (connexion automatique). Normalisation dans le modèle sous forme de `SourceDeDonnées` + `Opération*` typées.
4. **Panneau « Données »** : catalogue des sources et opérations, avec exploration des schémas et appel d'essai.
5. **Liaison visuelle** : glisser une opération sur un composant ; **éditeur de correspondance** (champs de la réponse ↔ propriétés du composant) avec vérification de types ; paramètres liés aux variables de la page.
6. **Correspondance automatique déterministe** des champs (algorithme hongrois sur matrice de similarité), utilisée seule ou comme point de départ de l'IA.
7. **États générés** pour chaque liaison : chargement, erreur, vide, nouvelle tentative ; cache et invalidation (après une écriture, rafraîchir les lectures concernées).
8. **Secrets et serveur intermédiaire** : clés stockées côté serveur, appels authentifiés relayés ; secrets par environnement.
9. **Génération** des liaisons dans chaque générateur frontend (client d'API typé généré depuis le contrat).
10. **Environnements** : URL et secrets distincts pour développement / test / production.

**Concepts mobilisés.** Adaptateur, Mandataire, Stratégie, Observateur ; problème d'affectation ; typage des schémas.

**Livrables.** Application complète (interface + backend généré ou API externe) fonctionnelle dans l'aperçu et à l'export.

**Critères de sortie.** Les scénarios de référence fonctionnent de bout en bout, avec le backend généré **et** avec au moins une API publique externe.

---

## PHASE 7 — Intelligence artificielle : génération et assistance

**Objectif.** Ajouter l'IA **par-dessus** les phases précédentes, en ne produisant que des **propositions de commandes** sur le modèle.

**Principe transversal.** L'IA ne produit **jamais** de code exporté ni de modèle appliqué directement : elle produit une **proposition** qui passe par le cycle Proposer → Prévisualiser → Affiner → Valider. Le validateur du noyau sert de garde-fou.

**Sous-étapes.**

1. **Infrastructure IA commune**
   1. Abstraction du fournisseur de modèle de langage (port + adaptateurs) : changer de fournisseur sans toucher au reste.
   2. **Sorties structurées contraintes par schéma** (décodage contraint par la grammaire du métamodèle) : la sortie est syntaxiquement valide par construction.
   3. **Boucle d'auto-réparation** : sortie → validateur → erreurs renvoyées à l'IA → nouvelle tentative, avec un **nombre maximal d'itérations** (borne de coût).
   4. **Contexte compact** : sous-arbre sélectionné + résumé de l'application + extraits pertinents des catalogues, plutôt que le modèle entier.
   5. **Base de données vectorielle** indexant le catalogue de composants, les modèles de pages, les contrats d'API (une entrée par opération), avec recherche approximative des plus proches voisins puis reclassement.
   6. **Outils exposés aux agents** (point d'extension « Outil IA ») : `lireNœud`, `chercherComposant`, `chercherOpération`, `lireSchéma`, `appelDEssai`, `proposerCommandes`.
   7. **Journalisation** de chaque proposition et de son issue (acceptée, affinée, rejetée) : futur jeu de données de préférences.
   8. **Garde-fous** : traitement des descriptions d'API externes comme **données non fiables** (protection contre l'injection de prompt), quotas, cache des réponses.
2. **IA-1 — Génération d'application ou de page** à partir du langage naturel, de façon **hiérarchique** : plan (pages, entités) → structure de chaque page → sections → composants → liaisons. Chaque niveau est une proposition validable.
3. **IA-2 — Modification ciblée** d'un composant ou d'une sélection (« ajoute une colonne date et trie par date décroissante ») : sortie = quelques commandes.
4. **IA-3 — Agent de connexion composant ↔ API** (contribution principale) : analyse des capacités du composant → recherche sémantique des opérations candidates → correspondance des champs (déterministe d'abord, IA si confiance faible) → appel d'essai → aperçu avec données réelles → proposition.
5. **IA-4 — Génération du modèle de données** depuis une description du domaine, présentée sous forme de diagramme proposé.
6. **IA-5 — Assistance au code d'extension**, avec les types du modèle en contexte.
7. **Interface du mode proposition** : différence visuelle (éléments ajoutés / modifiés / supprimés surlignés), acceptation partielle commande par commande, champ d'affinage.
8. **Évaluation** sur les scénarios de référence et un jeu d'instructions annoté :
   - taux de propositions **valides** du premier coup / après réparation ;
   - pour l'agent de connexion : **précision du choix de l'opération** (parmi les *k* premières), **exactitude de la correspondance des champs**, nombre d'interventions manuelles ;
   - **distance d'édition** entre le modèle proposé et le modèle attendu ;
   - coût (jetons) et latence par tâche.

**Concepts mobilisés.** Modèles de langage, plongements vectoriels, recherche des plus proches voisins, génération augmentée par récupération, appel d'outils, décodage contraint, humain dans la boucle ; Commande, Machine à états, Adaptateur.

**Livrables.** Assistants intégrés à l'éditeur ; protocole et résultats d'évaluation.

**Critères de sortie.** Les métriques de l'agent de connexion sont mesurées sur un jeu de test fixé à l'avance, et chaque sortie de l'IA passe par le validateur.

---

## PHASE 8 — Import inverse (rétro-ingénierie)

**Objectif.** Importer une interface (puis une application) existante dans le modèle pivot.

**Sous-étapes.**

1. **Point d'extension « Importeur »** : un plugin par framework source (et un pour les images).
2. **Analyse syntaxique** du code source en AST (par un analyseur du langage concerné), puis **normalisation** (suppression des variations de style sans effet sur le sens).
3. **Règles de reconnaissance** (filtrage de motifs sur arbres) : éléments d'interface standard → composants du catalogue ; état local → variables ; routes → pages ; appels HTTP → opérations ; styles → jetons (par **regroupement** des valeurs proches, par exemple des couleurs voisines fusionnées en un jeton).
4. **Îlots de code opaques** pour tout ce qui n'est pas reconnu, avec signalement dans l'éditeur.
5. **Rapport de couverture** (pourcentage de nœuds modélisés, liste des îlots).
6. **Le résultat est une proposition** (cycle de validation habituel).
7. **Approche hybride** : pour les îlots, l'IA propose une modélisation, validée par le validateur et vérifiée par **aller-retour** (modèle → code régénéré → comparaison visuelle avec l'original).
8. **Constitution du corpus synthétique** (pour la phase 10) : paires *(code généré, modèle)* produites par les générateurs de la phase 4, avec augmentation de données.
9. **Variante image → modèle** : détection des éléments d'interface dans une capture ou une maquette, construction de la hiérarchie par imbrication spatiale, puis même pipeline de proposition.
10. **Évaluation** : couverture, fidélité visuelle de l'aller-retour, distance d'édition d'arbres sur des projets dont le modèle est connu.

**Concepts mobilisés.** Transformation T2M, AST, filtrage de motifs sur arbres, regroupement (*clustering*), transformation bidirectionnelle ; Importeur en Stratégie.

**Livrables.** Importeur pour au moins un framework source ; rapport de couverture.

**Critères de sortie.** Un projet généré par la plateforme, puis modifié à la main, peut être réimporté avec une couverture mesurée.

---

## PHASE 9 — Cycle de vie, collaboration et déploiement

**Objectif.** Rendre la plateforme utilisable en équipe et en production.

**Sous-étapes.**

1. **Versionnement du modèle** : historique, branches, comparaison visuelle de deux versions (différence par identifiants), fusion.
2. **Synchronisation avec un dépôt de code** : export, puis réimport des fichiers d'extension modifiés par les développeurs (grâce à la génération séparée).
3. **Collaboration** : d'abord **verrouillage par sous-arbre** (simple), puis **édition simultanée** fondée sur des types de données répliqués sans conflit adaptés aux arbres ; présence des collaborateurs, commentaires sur les éléments.
4. **Gestion des comptes et des droits** sur les projets (propriétaire, éditeur, lecteur), journal d'audit.
5. **Construction et déploiement** : génération de fichiers de conteneurisation et de pipelines d'intégration continue ; cibles de déploiement en plugins.
6. **Observabilité** de la plateforme : journaux, métriques, traces ; suivi des tâches dans la file d'attente.
7. **Sécurité** : isolation de l'exécution du code tiers, analyse des dépendances du code généré, en-têtes de sécurité générés par défaut.

**Concepts mobilisés.** CRDT, différence et fusion de modèles, Machine à états (déploiements), file d'attente.

**Livrables.** Plateforme multi-utilisateur avec historique et déploiement.

**Critères de sortie.** Deux utilisateurs modifient le même projet sans perte ; une application est déployée depuis la plateforme.

---

## PHASE 10 — Écosystème et apprentissage continu

**Objectif.** Ouvrir la plateforme et améliorer l'IA à partir des données accumulées.

**Sous-étapes.**

1. **Kit de développement de plugins** : documentation des points d'extension, gabarit de plugin, outils de test de conformité aux contrats.
2. **Place de marché** de plugins et de modèles d'applications, avec vérification et signature.
3. **API publique** de la plateforme (piloter un projet par programme).
4. **Affinage supervisé** de modèles de langage pour :
   - l'importeur (corpus synthétique de la phase 8) ;
   - la génération dans le métamodèle (paires instruction → commandes acceptées) ;
   avec **adaptateurs de faible rang**, perte d'entropie croisée, descente de gradient par rétropropagation, séparation stricte apprentissage / validation / test, arrêt précoce sur la perte de validation.
5. **Optimisation par préférences** à partir du journal du mode proposition (paires « proposition acceptée » / « proposition rejetée » pour une même instruction).
6. **Comparaison** modèle affiné vs modèle généraliste avec contexte (phase 7) sur les mêmes métriques, en tenant compte du coût et de la latence.

**Concepts mobilisés.** Apprentissage supervisé, rétropropagation, descente de gradient, affinage économe en paramètres, optimisation par préférences, protocoles d'évaluation.

**Livrables.** SDK, place de marché, modèles affinés et rapport comparatif.

---

# 6. DÉPENDANCES ENTRE PHASES ET PÉRIMÈTRE DU MÉMOIRE

## 6.1 Graphe des dépendances

```
  P0 Cadrage / métamodèle
        │
        ▼
  P1 Noyau ─────────────────────────────────────────────┐
        │                                               │
        ▼                                               │
  P2 Éditeur + aperçu                                   │
        │                                               │
        ▼                                               │
  P3 Logique applicative                                │
        │                                               │
        ├──────────────┬────────────────┐               │
        ▼              ▼                │               │
  P4 Génération   P5 Données + backend  │               │
     frontend          │                │               │
        │              ▼                │               │
        └───────▶ P6 Connexion front ↔ back             │
                       │                                │
                       ▼                                │
                  P7 IA (génération, agent de connexion)│
                       │                                │
        ┌──────────────┼───────────────┐                │
        ▼              ▼               ▼                │
  P8 Import inverse  P9 Cycle de vie  P10 Écosystème ◀──┘
  (dépend de P4)                      + apprentissage (dépend de P7, P8)
```

P4 et P5 peuvent avancer **en parallèle** après P3. P7 peut démarrer partiellement (IA-1, IA-2) dès P3, mais l'agent de connexion exige P6.

## 6.2 Périmètre proposé pour le mémoire

Cohérent avec la section 9.6 de l'étude de l'existant :

| Priorité | Phases | Justification |
|---|---|---|
| **Socle obligatoire** | P0, P1, P2, P3 (partielle : variables, actions de base, navigation) | Sans socle, rien n'est démontrable. |
| **Contribution principale 1** | P4 avec **deux cibles frontend** | Démontre l'indépendance du modèle et l'extensibilité (cible 2 sans modifier le noyau). |
| **Contribution principale 2 (IA)** | P6 (connecteur HTTP) + P7 limitée à **l'agent de connexion composant ↔ API** et au mode proposition | Contribution originale, ciblée et **mesurable**. |
| **Contribution complémentaire** | P5 limitée aux opérations de base, rôles et contrat, **une cible backend** | Démontre l'export backend. |
| **Perspectives** | P8, P9, P10, cibles supplémentaires, temps réel, IA-1 complète | Montrent que l'architecture les accueille sans refonte. |

---

# 7. RISQUES PRINCIPAUX

| Risque | Conséquence | Réponse |
|---|---|---|
| Métamodèle mal conçu au départ | Refonte en cascade | Phase 0 dédiée, tranche verticale précoce, migrations versionnées. |
| Périmètre trop large | Rien n'est terminé | Phases à livrable exécutable ; périmètre du mémoire explicite (6.2). |
| Divergence entre aperçu et export | Ce que l'on voit n'est pas ce que l'on obtient | Tests de parité visuelle et comportementale automatisés. |
| Coût de maintenance des générateurs | Chaque cible est un projet en soi | Pipeline et M2M communs ; une cible ne fournit que ses gabarits et correspondances. |
| Hallucinations de l'IA | Modèle invalide, API inexistantes | Décodage contraint, recherche limitée au catalogue, validateur, appel d'essai, validation humaine. |
| Coût et latence de l'IA | Expérience lente, budget imprévisible | Commandes plutôt que modèles complets, contexte compact, cache, choix du modèle selon la tâche. |
| Code tiers (plugins, code personnalisé) malveillant | Fuite de données | Bac à sable, permissions par capacité, secrets côté serveur. |
| Import inverse trop ambitieux | Résultats faibles | Import partiel assumé (îlots), mesure de couverture, placé en perspective. |

---

# 8. OPTIONS DE STACK TECHNIQUE (ILLUSTRATION)

> Les sections précédentes restent indépendantes des technologies. Cette section montre **à titre indicatif** ce que la conception pourrait donner concrètement. Les choix sont **réversibles** grâce à l'architecture hexagonale : chaque technologie se trouve derrière un port et peut être remplacée par un autre adaptateur.
> Critères de choix : **licence permissive** (MIT, Apache 2.0, BSD), en cohérence avec la limite L8 de l'étude ; maturité ; taille de la communauté ; possibilité de **partager le même langage** entre l'éditeur, le noyau et les générateurs.

## 8.1 Options par couche

### Langage et organisation du code

| Besoin | Option recommandée | Alternatives | Commentaire |
|---|---|---|---|
| Langage du noyau, de l'éditeur et des générateurs | **TypeScript** | Kotlin Multiplatform ; Rust compilé en WebAssembly pour les parties critiques | TypeScript permet d'exécuter **le même noyau** dans le navigateur (éditeur, aperçu) et sur le serveur (export, validation, IA). |
| Organisation du dépôt | **Monodépôt** : espaces de travail pnpm + Turborepo ou Nx | Dépôts séparés | Un paquet par module : `noyau`, `editeur`, `apercu`, `generateur-*`, `connecteur-*`, `plugin-composants-base`… |
| Langage des travaux d'apprentissage automatique (phase 10) | **Python** | — | Écosystème d'apprentissage incontournable ; utilisé seulement pour l'entraînement et l'évaluation hors ligne. |

### Métamodèle, modèle et noyau

| Besoin | Option recommandée | Alternatives | Commentaire |
|---|---|---|---|
| Méta-métamodèle (M3) / description des schémas | **JSON Schema** (norme 2020-12) | Ecore (EMF, écosystème Java) ; TypeBox ou Zod (schémas TypeScript exportables en JSON Schema) | JSON Schema est lisible par les validateurs, par l'éditeur (formulaires générés) **et par les modèles de langage** (sorties structurées). TypeBox permet d'écrire les schémas en TypeScript et d'obtenir à la fois les types statiques et le JSON Schema. |
| Validation des schémas | **Ajv** | Validateur intégré à TypeBox | Validation très rapide (schémas compilés). |
| État immuable avec partage structurel | **Immer** | Structures persistantes écrites à la main | Annuler / rétablir et propositions sur calque à faible coût mémoire. |
| Gestion d'état de l'éditeur | **Zustand** | Pinia (si éditeur en Vue), signaux | Magasin léger branché sur le bus d'événements du noyau. |
| Ordre des enfants | Bibliothèque d'**indexation fractionnaire** | Implémentation propre (quelques dizaines de lignes) | |
| Langage d'expressions | **CEL** (*Common Expression Language*, Apache 2.0) | Analyseur propre de type Pratt ou généré avec Chevrotain ; JSONata | CEL est typé, sans effet de bord, avec des implémentations dans plusieurs langages (utile pour la traduction vers les cibles). Un analyseur propre donne plus de contrôle sur la traduction. |
| Index spatial du canevas | **RBush** (R-tree) | Quadtree maison | |
| Collaboration (phase 9) | **Loro** (CRDT avec arbre déplaçable) | Yjs, Automerge | Loro gère nativement le déplacement de nœuds dans un arbre sans créer de cycle. Yjs est plus répandu, mais le déplacement d'arbre y est à construire. |

### Éditeur visuel

| Besoin | Option recommandée | Alternatives | Commentaire |
|---|---|---|---|
| Framework de l'éditeur | **React** | Vue, Svelte, SolidJS | Écosystème le plus riche en briques d'éditeur. À ne pas confondre avec les **cibles** : l'éditeur peut être en React et exporter vers Vue ou Angular. |
| Base de l'éditeur glisser-déposer | **Canevas propre** branché sur notre noyau | Craft.js (MIT), Puck (MIT), GrapesJS (BSD) | Ces bibliothèques imposent leur propre modèle de données : les utiliser pour un prototype, puis migrer vers un canevas propre piloté par notre métamodèle. |
| Glisser-déposer | **dnd-kit** | Pragmatic drag and drop | |
| Arbre des composants | **react-arborist** | Composant propre | Virtualisé, adapté aux grands arbres. |
| Éditeur de workflows et diagramme entités-relations | **React Flow** (xyflow, MIT) | Rete.js, JointJS | Graphes de nœuds personnalisables. |
| Éditeur de code d'extension | **Monaco** | CodeMirror 6 | Monaco apporte l'autocomplétion TypeScript avec les types générés à partir du modèle. |
| Isolation de l'aperçu | **iframe** isolée + messages | Shadow DOM | Les styles et scripts de l'application prévisualisée ne contaminent pas l'éditeur. |

### Génération de code

| Besoin | Option recommandée | Alternatives | Commentaire |
|---|---|---|---|
| Génération vers les cibles JavaScript / TypeScript | **Construction d'AST** (ts-morph, générateur Babel) | Gabarits (Handlebars, EJS, Eta) | Construire un AST garantit un code syntaxiquement correct ; les gabarits sont plus simples pour les fichiers de configuration. |
| Génération Java (backend) | **JavaPoet** ou gabarits | OpenAPI Generator | JavaPoet construit le code Java par programme. |
| Formatage | **Prettier** (TS, HTML, CSS), google-java-format | Biome | Un formatage uniforme rend le code généré lisible et ses différences entre versions minimales. |
| Clients d'API et squelettes serveur depuis le contrat | **OpenAPI Generator** (Apache 2.0) | orval, openapi-typescript | Réutilisation plutôt que réécriture. |
| Références de qualité | Modèles de **JHipster**, compilateur **Mitosis** | — | À étudier comme références, voire réutiliser en partie. |

**Cibles envisageables** (chacune = un plugin) :
- **frontend** : React, Vue, Angular, puis Svelte, Flutter ;
- **backend** : Spring Boot, puis NestJS, Django ou FastAPI, ASP.NET Core.

### Import inverse

| Besoin | Option recommandée | Alternatives | Commentaire |
|---|---|---|---|
| Analyse syntaxique multi-langages | **tree-sitter** | Analyseurs propres à chaque framework : compilateur TypeScript ou Babel (React), @vue/compiler-sfc (Vue), compilateur Angular | tree-sitter offre une interface commune et une analyse **incrémentale** ; les analyseurs propres à chaque framework donnent plus de détails sur les gabarits. |
| Image → modèle | Modèle de langage multimodal + détection d'éléments d'interface | Modèles de détection d'objets entraînés sur des jeux de captures d'interfaces | Lien avec les travaux REMAUI et maquettes dessinées de la bibliographie. |

### Serveur de la plateforme et infrastructure

| Besoin | Option recommandée | Alternatives | Commentaire |
|---|---|---|---|
| Serveur d'application | **NestJS** (TypeScript) | Fastify seul ; Spring Boot (Java) | NestJS est modulaire, avec injection de dépendances, et partage le noyau TypeScript. Spring Boot reste possible, mais il faudrait alors dupliquer la validation du modèle en Java. |
| Service IA | Dans le serveur TypeScript au départ | Service séparé en **Python (FastAPI)** | On le sépare quand on héberge ses propres modèles (phase 10). |
| Base de données principale | **PostgreSQL** (relationnel + JSONB pour les modèles) | MongoDB | Utilisateurs, projets et droits en tables ; modèles et historique de commandes en JSONB. |
| Base de données vectorielle | **pgvector** dans PostgreSQL au départ | Qdrant, Weaviate, Milvus | Un service de moins à exploiter ; on passe à une base dédiée si le volume l'exige (catalogue de milliers d'API). |
| File d'attente de tâches | **BullMQ** sur Redis / Valkey | RabbitMQ ; pg-boss (file dans PostgreSQL) | Export, construction, import et génération IA en tâches de fond. |
| Cache | **Redis / Valkey** | Cache en mémoire | Cache de génération (hachages de Merkle), cache des réponses d'IA. |
| Stockage de fichiers | Stockage objet compatible **S3** (MinIO en local) | Système de fichiers | Images, projets exportés, artefacts de construction. |
| Temps réel | **WebSocket** (ws, Socket.IO) + **SSE** pour les flux IA | — | Collaboration, progression des tâches, réponses d'IA en flux. |
| Secrets | **Vault** (OpenBao) | Chiffrement applicatif en base avec une clé de l'environnement | Clés d'API des utilisateurs. |
| Authentification de la plateforme | **Keycloak** | Better Auth, Auth.js | |
| Exécution isolée du code tiers | Navigateur : **iframe isolée + Web Worker** ; serveur : **isolated-vm** ou QuickJS en WebAssembly ; constructions dans des **conteneurs** | gVisor, Firecracker | |
| Chargement des plugins | **Modules ES dynamiques** | Module Federation | |
| Conteneurs et déploiement | **Docker**, Docker Compose ; Kubernetes plus tard | — | |
| Intégration continue | GitHub Actions ou GitLab CI | — | |
| Observabilité | **OpenTelemetry** + Prometheus + Grafana | — | |

### Intelligence artificielle

| Besoin | Option recommandée | Alternatives | Commentaire |
|---|---|---|---|
| Modèles de langage | **API de fournisseurs** (Claude, GPT, Gemini…) derrière un adaptateur commun | Modèles ouverts auto-hébergés (Qwen, Llama, Mistral) servis par vLLM ou Ollama | Commencer par les API pour la qualité ; les modèles ouverts deviennent nécessaires pour l'affinage (phase 10) et la maîtrise des coûts. |
| Couche d'abstraction | **Vercel AI SDK** (TypeScript) | LangChain.js ; adaptateur propre | Sorties structurées, appels d'outils et flux pour plusieurs fournisseurs. |
| Sorties structurées / décodage contraint | **Mode JSON Schema** des fournisseurs | XGrammar, Outlines (modèles auto-hébergés) | Le même JSON Schema que le métamodèle sert de contrainte. |
| Orchestration des agents | **Boucle d'agent propre**, simple et testable | LangGraph | Les outils de l'agent sont nos points d'extension « Outil IA ». |
| Exposition des outils de la plateforme | **MCP** (*Model Context Protocol*) | — | Permet aussi à des assistants externes de piloter la plateforme. |
| Plongements vectoriels | Modèles de plongements des fournisseurs ou modèles ouverts | — | Choisis en mesurant la précision de recherche sur notre catalogue. |
| Catalogue d'API publiques | **APIs.guru** | — | Plusieurs milliers de contrats OpenAPI. |
| Affinage (phase 10) | **PyTorch + Hugging Face Transformers + PEFT** (adaptateurs de faible rang) ; **TRL** (optimisation par préférences) | Unsloth (affinage plus économe) | |
| Évaluation | **Banc d'évaluation propre** sur les scénarios de référence | promptfoo | |

### Tests et qualité

| Besoin | Option recommandée | Commentaire |
|---|---|---|
| Tests unitaires | **Vitest** ; JUnit pour le Java généré | |
| Tests par propriétés | **fast-check** | Suites de commandes et modèles aléatoires (phases 1 et 4). |
| Tests de bout en bout et parité visuelle | **Playwright** (captures) + **pixelmatch** ou SSIM | Comparaison aperçu / cible 1 / cible 2. |
| Tests du backend généré | **Testcontainers** | Démarre une vraie base pendant les tests. |
| Respect du contrat d'API | **Schemathesis** | Génère automatiquement des requêtes depuis le contrat OpenAPI et vérifie les réponses du backend généré. |
| Qualité du code généré | ESLint, SonarQube | Mesures de complexité et de duplication pour l'évaluation. |

## 8.2 Trois combinaisons possibles

| | **Stack A — « TypeScript partout »** (recommandée) | **Stack B — « Entreprise Java »** | **Stack C — « Noyau performant »** |
|---|---|---|---|
| Noyau | TypeScript (navigateur + serveur) | Java (EMF / Ecore) côté serveur, TypeScript côté éditeur | Rust compilé en WebAssembly (navigateur) et natif (serveur) |
| Éditeur | React | React ou Angular | React ou SolidJS |
| Serveur de la plateforme | NestJS | Spring Boot | Rust (Axum) ou NestJS |
| IA | TypeScript (AI SDK), Python pour l'affinage | Spring AI ou service Python | Service Python |
| Données | PostgreSQL + pgvector, Redis / BullMQ, stockage S3 | PostgreSQL, RabbitMQ, base vectorielle dédiée | PostgreSQL + pgvector, file d'attente au choix |
| **Points forts** | Un seul langage, noyau partagé entre éditeur et serveur, rapidité de développement, écosystème d'éditeurs visuels | Outillage IDM mature (Ecore, transformations, contraintes OCL), proche de la cible Spring Boot | Performances maximales du noyau, garanties mémoire |
| **Points faibles** | Moins d'outillage IDM « académique » | Validation du modèle à écrire deux fois (Java et TypeScript), plus lourd | Courbe d'apprentissage élevée, écosystème d'éditeurs plus pauvre, plus lent à développer |
| **Adaptée si** | Équipe réduite, durée limitée (cas du mémoire) | Positionnement entreprise fort, équipe Java | Très grands modèles, contraintes de performance critiques |

## 8.3 Ce que donnerait la stack A par phase

| Phase | Briques principales |
|---|---|
| P0 Métamodèle | TypeBox → JSON Schema, CEL ou analyseur propre, fiches de décision en Markdown |
| P1 Noyau | TypeScript, Immer, Ajv, indexation fractionnaire, Vitest + fast-check |
| P2 Éditeur | React, Zustand, dnd-kit, react-arborist, RBush, aperçu en iframe |
| P3 Logique | Interpréteur d'expressions, React Flow (workflows), Monaco (code personnalisé) |
| P4 Génération frontend | ts-morph / générateur Babel, Prettier, Playwright + pixelmatch ; cibles React puis Vue |
| P5 Backend | React Flow (diagramme entités-relations), JavaPoet / gabarits, OpenAPI Generator, Testcontainers, Schemathesis ; cible Spring Boot |
| P6 Connexion | Connecteurs HTTP / GraphQL / WebSocket, proxy NestJS, Vault |
| P7 IA | Vercel AI SDK, API de fournisseurs, pgvector, APIs.guru, MCP, BullMQ |
| P8 Import | tree-sitter, analyseurs propres à chaque framework, modèle multimodal |
| P9 Cycle de vie | Loro, Keycloak, Docker, CI, OpenTelemetry |
| P10 Apprentissage | Python, PyTorch, Transformers, PEFT, TRL, vLLM |

> **Remarque.** Les versions précises sont à fixer au démarrage du développement. On retient des versions stables publiées depuis plusieurs semaines, et on consigne chaque choix dans une fiche de décision.

---

# 9. GLOSSAIRE

| Terme | Définition |
|---|---|
| **Modèle pivot** | Représentation de l'application indépendante de toute technologie ; seule source de vérité. |
| **Métamodèle** | Description des concepts autorisés dans un modèle (le « langage » de la plateforme). |
| **PIM / PSM** | Modèle indépendant / spécifique de la plateforme cible (vocabulaire de l'architecture dirigée par les modèles). |
| **M2M / M2T / T2M** | Transformations modèle → modèle, modèle → texte, texte → modèle. |
| **Changeset / proposition** | Ensemble de commandes proposées, non encore appliquées au modèle principal. |
| **Génération séparée** | Séparation entre fichiers générés et fichiers d'extension écrits à la main. |
| **Micro-noyau** | Architecture où un noyau minimal charge des plugins qui apportent les fonctionnalités. |
| **Point d'extension** | Interface du noyau qu'un plugin implémente pour ajouter une capacité. |
| **Indexation fractionnaire** | Clés d'ordre permettant d'insérer entre deux éléments sans renuméroter. |
| **Hachage de Merkle** | Hachage d'un nœud calculé à partir de ceux de ses enfants : un changement se propage jusqu'à la racine et localise ce qui doit être régénéré. |
| **CRDT** | Type de données répliqué qui converge sans conflit entre plusieurs utilisateurs. |
| **Plongement vectoriel** | Représentation numérique du sens d'un texte, comparable par distance. |
| **Décodage contraint** | Génération par un modèle de langage forcée à respecter une grammaire ou un schéma. |
| **Humain dans la boucle** | Toute action de l'IA est soumise à la validation d'un utilisateur. |
| **Adaptateur de faible rang** | Technique d'affinage qui n'entraîne que de petites matrices ajoutées au modèle gelé. |
