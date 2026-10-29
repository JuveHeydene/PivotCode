> 📁 **Note de classement (21/10/2026)** : ce document a été déplacé depuis `Memoire_Juve_recherche/ref_files/etude_de_lexistant/etude_existant_et_positionnement.md`, sans modification de contenu. Voir [docs/README.md §4](../../README.md).

# ÉTUDE DE L'EXISTANT — Plateformes no-code, low-code et générateurs d'applications assistés par IA

**Objet.** Recenser et comparer les plateformes de création d'applications (no-code, low-code, générateurs de code et générateurs assistés par l'intelligence artificielle), identifier leurs points forts et leurs limites, puis dégager un positionnement et des pistes de travail.

**Méthodologie.** Chaque plateforme a été analysée selon une grille commune de critères (section 3), à partir de la documentation officielle des éditeurs, de leurs journaux de versions (*changelogs*), d'articles comparatifs et de retours d'utilisateurs. Les informations reflètent l'état des plateformes en **octobre 2026**. Les tarifs sont donnés à titre indicatif. Lorsqu'une fonctionnalité n'est décrite dans aucune source consultée, elle est indiquée « non documentée ».

**Notation utilisée dans les tableaux.**
- **Oui** : fonctionnalité présente et complète.
- **Partiel** : fonctionnalité présente avec des limites ou sous conditions (plan payant, configuration manuelle…).
- **Non** : fonctionnalité absente.
- **N/A** : critère non applicable au type d'outil.

---

## SOMMAIRE

1. [Concepts et définitions](#1-concepts-et-définitions)
2. [Panorama et typologie des plateformes](#2-panorama-et-typologie-des-plateformes)
3. [Grille d'analyse](#3-grille-danalyse)
4. [Fiches détaillées par plateforme](#4-fiches-détaillées-par-plateforme)
5. [Analyses transversales et tableaux de synthèse par catégorie](#5-analyses-transversales-et-tableaux-de-synthèse-par-catégorie)
6. [Technologies et architectures des plateformes](#6-technologies-et-architectures-des-plateformes)
7. [Tableaux généraux de comparaison](#7-tableaux-généraux-de-comparaison)
8. [Synthèse : limites communes et opportunités](#8-synthèse--limites-communes-et-opportunités)
9. [Orientations et propositions de travail](#9-orientations-et-propositions-de-travail)
10. [Sources](#10-sources)

---

# 1. CONCEPTS ET DÉFINITIONS

## 1.1 Familles d'outils

| Concept | Définition | Exemples |
|---|---|---|
| **No-code** | Plateforme permettant de créer une application **sans écrire de code**, uniquement par manipulation visuelle (glisser-déposer, configuration par formulaires). Le public visé est non technique. | Bubble, Glide, Softr, Adalo |
| **Low-code** | Plateforme visuelle qui **réduit** la quantité de code à écrire sans la supprimer. L'assemblage est visuel, et du code (JavaScript, SQL, Java…) est écrit pour les cas complexes. Le public visé est développeur ou semi-technique. | Retool, Appsmith, ToolJet, OutSystems, Mendix |
| **Générateur d'applications par IA** (*AI App Builder*, « *vibe coding* ») | Plateforme où l'application est **décrite en langage naturel** (*prompt*). Un modèle de langage (LLM) **écrit le code source** (React, etc.), et l'application évolue par dialogue. Le terme « vibe coding » (A. Karpathy, 2025) désigne une programmation guidée par l'IA sans lecture détaillée du code. | Lovable, Bolt.new, v0, Replit Agent |
| **Générateur de code dirigé par les modèles** (*model-driven*) | Outil qui produit du code source à partir d'un **modèle** (entités, relations, configuration) décrit dans un langage dédié ou une interface visuelle. | JHipster, Amplication |
| **Backend visuel / BaaS** | Plateforme qui fournit une base de données, des API et une logique serveur configurables visuellement ou générées automatiquement. | Xano, Supabase, Directus, Strapi |
| **Design-to-code** | Outil qui convertit une maquette graphique (fichier Figma, capture d'écran) en code. | Builder.io Visual Copilot, Locofy, Anima |
| **Outils internes** (*internal tools*) | Applications d'entreprise à usage interne : back-offices, tableaux de bord, interfaces d'administration branchées sur des bases de données existantes. | Retool, Appsmith, Budibase, ToolJet |
| **Full-stack** | Une plateforme full-stack gère à la fois l'interface (frontend), la logique serveur (backend), la base de données, l'authentification et l'hébergement. | Bubble |

## 1.2 Construction de l'interface

| Concept | Définition |
|---|---|
| **UI Builder** | Éditeur visuel où l'interface est construite en plaçant des composants sur une zone de dessin (*canvas*). |
| **Arbre des composants** (*component tree*, *element tree*, *navigator*, *layers*) | Représentation **hiérarchique** de la page : une page contient des sections, qui contiennent des conteneurs, qui contiennent des boutons, etc. Le principe est identique à celui du **DOM** HTML. L'arbre permet de sélectionner, d'imbriquer et de réordonner les éléments. |
| **Glisser-déposer** (*drag and drop*) | Interaction consistant à prendre un composant dans une bibliothèque et à le déposer sur la page ou dans un conteneur. |
| **Composant / widget / élément** | Brique d'interface configurable : bouton, champ de saisie, tableau, graphique, image, etc. |
| **Panneau de propriétés** | Panneau qui permet de configurer le composant sélectionné : contenu, style, données affichées, événements. |
| **Liaison de données** (*data binding*) | Lien entre une propriété d'un composant et une donnée dynamique. L'affichage se met à jour quand la donnée change. Exemple : `{{ utilisateur.nom }}`. |
| **Conteneur / groupe** | Composant qui en **contient** d'autres. Il permet de grouper, d'aligner, d'afficher ou masquer un ensemble, ou de répéter un modèle d'affichage. |
| **Liste répétée** (*repeater*, *repeating group*, *list view*) | Conteneur qui **duplique** un modèle d'affichage pour chaque élément d'une liste de données. |
| **Composant réutilisable** (*reusable element*, *module*, *component*) | Ensemble de composants défini une seule fois et réutilisé sur plusieurs pages. Toute modification se propage à toutes les occurrences. |
| **Système de pages** | Possibilité de créer plusieurs pages ou écrans distincts, chacun avec sa propre adresse (*route*), et de naviguer entre eux. |
| **Responsive design** | Capacité de l'interface à **s'adapter à la taille de l'écran** (téléphone, tablette, ordinateur). |
| **Point de rupture** (*breakpoint*) | Largeur d'écran à partir de laquelle la mise en page change (par exemple, mobile < 768 px < tablette < 1024 px < ordinateur). |
| **Flexbox / CSS Grid** | Les deux systèmes de mise en page modernes du CSS. Flexbox aligne les éléments en ligne ou en colonne. Grid les organise en grille à deux dimensions. |
| **Design system / thème** | Ensemble centralisé de couleurs, typographies, espacements et composants de base, appliqué à toute l'application. |

## 1.3 Rendu des pages et référencement

| Concept | Définition |
|---|---|
| **SPA** (*Single Page Application*) | Application web qui charge **une seule page HTML** au départ. JavaScript redessine ensuite le contenu à chaque navigation, sans recharger la page. Les changements d'adresse sont gérés par un routeur côté client. La navigation est fluide, mais le premier chargement est plus lourd et le référencement plus difficile. |
| **MPA** (*Multi Page Application*) | Chaque page est un document HTML distinct, renvoyé par le serveur à chaque navigation. |
| **CSR** (*Client-Side Rendering*) | Le **navigateur** construit la page à partir de JavaScript. Le serveur n'envoie qu'un document HTML presque vide. C'est le mode de rendu typique d'une SPA. |
| **SSR** (*Server-Side Rendering*) | Le **serveur** génère le HTML complet de chaque page à la demande, puis JavaScript prend le relais dans le navigateur (*hydratation*). Frameworks typiques : Next.js, Nuxt, TanStack Start. |
| **SSG** (*Static Site Generation*) | Les pages HTML sont générées **une fois, à la compilation**, puis servies comme fichiers statiques. C'est la solution optimale pour le référencement et la vitesse lorsque le contenu change peu. |
| **Pré-rendu** (*prerendering*) | Génération d'une version HTML des pages d'une SPA destinée **aux robots des moteurs de recherche**. |
| **SEO** (*Search Engine Optimization*) | Ensemble des techniques visant un bon classement dans les moteurs de recherche : HTML lisible par les robots, balises `<title>` et `<meta description>`, adresses lisibles, plan du site (*sitemap.xml*), vitesse de chargement, balisage sémantique. Le SEO est indispensable pour un site public. Il est sans objet pour une application protégée par authentification. |
| **Balises meta / Open Graph** | Balises de l'en-tête HTML qui décrivent la page aux moteurs de recherche et aux réseaux sociaux (titre, description, image d'aperçu). |
| **PWA** (*Progressive Web App*) | Application web **installable** sur l'écran d'accueil d'un téléphone, capable de fonctionner partiellement hors ligne et de recevoir des notifications, sans passer par les magasins d'applications. |
| **Application native** | Application compilée pour iOS ou Android, distribuée par l'App Store ou Google Play, avec accès complet au matériel (caméra, GPS, biométrie). |
| **Lighthouse** | Outil de Google qui note une page (sur 100) en performance, accessibilité, bonnes pratiques et SEO. |

**Limite d'une SPA pour le référencement.** Lorsqu'un robot d'indexation visite une SPA, il reçoit un document de la forme `<body><div id="app"></div><script src="app.js"></script></body>`. Le contenu n'existe qu'après l'exécution du JavaScript. Google exécute le JavaScript avec un délai et de manière incomplète. D'autres moteurs et les robots des assistants IA ne l'exécutent souvent pas : pour eux, la page est vide.

## 1.4 Logique applicative et workflows

| Concept | Définition |
|---|---|
| **Workflow** | Suite d'actions déclenchée par un **événement** : « quand [événement], alors [action 1], puis [action 2]… ». C'est la manière visuelle d'exprimer la logique d'une application. |
| **Déclencheur** (*trigger*) | Événement qui démarre un workflow : clic, chargement de page, modification d'une donnée, horaire planifié, appel entrant d'une API. |
| **Workflow frontend** (côté client) | Workflow exécuté **dans le navigateur** de l'utilisateur. Il concerne l'interface : ouvrir une fenêtre modale, afficher ou masquer un groupe, changer de page, modifier une variable locale, valider un champ. |
| **Workflow backend** (côté serveur) | Workflow exécuté **sur le serveur**, même si l'utilisateur a fermé son navigateur. Il concerne les traitements sensibles, lourds ou planifiés : paiement avec une clé secrète, envoi d'e-mails en masse, traitement d'un webhook, tâche nocturne, recalcul de statistiques. |
| **Webhook** | Adresse exposée par une application, qu'un service externe appelle pour la **notifier** d'un événement (par exemple, un paiement réussi). |
| **Tâche planifiée** (*cron*, *scheduled job*) | Workflow backend exécuté à intervalle régulier. |
| **Variable d'état** (*state*) | Donnée conservée temporairement par l'interface (onglet ouvert, panier en cours…). |

**Justification de la distinction frontend / backend.**
- **Sécurité.** Tout ce qui s'exécute dans le navigateur est visible et modifiable par l'utilisateur. Les clés secrètes et les calculs sensibles doivent donc être exécutés côté serveur.
- **Fiabilité.** Un workflow frontend s'interrompt si l'onglet est fermé. Un workflow backend poursuit son exécution.
- **Performance.** Les traitements lourds ou en masse relèvent du serveur.

Mendix illustre bien cette distinction par deux notions distinctes : les **nanoflows** (logique exécutée côté client) et les **microflows** (logique exécutée côté serveur).

## 1.5 Modèles économiques

| Concept | Définition |
|---|---|
| **Workload Units (WU)** — Bubble | Unité de mesure de la **charge serveur** consommée par une application Bubble. **Chaque opération côté serveur** en consomme une fraction : chargement de page, recherche dans la base, exécution d'un workflow, appel d'API, écriture de données. Chaque forfait inclut un quota mensuel (environ 50 000 WU en offre gratuite et 175 000 WU sur le plan Starter en 2026), au-delà duquel la consommation est facturée. Le coût dépend du trafic et de la manière dont l'application est construite. Une application peu optimisée (recherches répétées, listes non paginées) peut consommer plusieurs centaines de WU par utilisateur et par jour. La facture est donc **difficile à prévoir**. |
| **Facturation par siège** | Paiement par éditeur et/ou par utilisateur final (Retool, Appsmith, Budibase, ToolJet, Power Apps). Le coût est prévisible, mais il devient élevé lorsque les utilisateurs sont nombreux. |
| **Facturation par crédits / tokens** | Chaque requête adressée à l'IA consomme des crédits (Lovable) ou des tokens (Bolt.new, v0). Le coût dépend de l'intensité du développement. |
| **Facturation par « updates »** — Glide | Chaque synchronisation de données ou exécution de workflow est décomptée d'un quota mensuel. Le principe est proche des Workload Units. |

## 1.6 Données et backend

| Concept | Définition |
|---|---|
| **Backend** | Partie serveur d'une application : logique métier, base de données, authentification, API. |
| **BaaS** (*Backend as a Service*) | Backend hébergé « clé en main » qui fournit une base de données, l'authentification, le stockage de fichiers et des fonctions serveur accessibles par des API générées automatiquement (Supabase, Firebase, Xano). |
| **Source de données** (*data source*, *resource*) | Toute origine de données à laquelle l'application se connecte : base SQL, API, tableur. |
| **Connecteur** | Module prêt à l'emploi qui gère la communication avec une source de données précise. |
| **API REST** | Interface d'échange de données par HTTP, fondée sur des adresses (ressources) et des verbes (`GET`, `POST`, `PUT`, `DELETE`). |
| **GraphQL** | Langage de requête d'API où le client demande exactement les champs dont il a besoin. |
| **OpenAPI** (ex-Swagger) | Format standard de **description d'une API REST** (adresses, paramètres, schémas des réponses). Il permet de générer automatiquement de la documentation, du code client et du code serveur. |
| **CRUD** | *Create, Read, Update, Delete* : les quatre opérations élémentaires sur les données. |
| **Base relationnelle (SQL)** | Données organisées en tables reliées entre elles, avec un schéma strict (PostgreSQL, MySQL). |
| **Base NoSQL** | Données organisées en documents JSON, en paires clé-valeur ou en graphes, avec un schéma souple (MongoDB, CouchDB, Firestore). |
| **ORM** | Bibliothèque qui manipule une base SQL par des objets du langage de programmation (Hibernate/JPA, Prisma). |
| **RLS** (*Row Level Security*) | Règles de sécurité appliquées **ligne par ligne** par la base elle-même (par exemple, « un utilisateur ne voit que ses propres commandes »). |
| **Authentification / autorisation** | L'authentification établit **qui** est l'utilisateur. L'autorisation détermine **ce qu'il a le droit** de faire. |
| **RBAC** (*Role-Based Access Control*) | Gestion des droits par **rôles** et **groupes d'utilisateurs** (administrateur, éditeur, lecteur…). |
| **SSO / SAML / OIDC** | Connexion unique avec le compte de l'organisation (Google Workspace, Microsoft Entra ID, Okta). |

## 1.7 Cycle de vie, déploiement et collaboration

| Concept | Définition |
|---|---|
| **Environnements de développement et de production** | Mécanisme fondé sur au moins **deux copies** de l'application. L'environnement de **développement / test** permet de modifier et de tester sans risque, idéalement avec des **données de test séparées**. L'environnement de **production** est la version utilisée par les utilisateurs réels avec les données réelles. Une version validée est **déployée** du premier vers le second. |
| **Staging** (préproduction) | Environnement intermédiaire, copie fidèle de la production, réservé aux derniers tests. |
| **Hébergement géré / auto-hébergement** | En hébergement géré (*cloud*), l'éditeur héberge l'application. En auto-hébergement (*self-hosting*), l'organisation installe la plateforme sur ses propres serveurs, généralement via Docker ou Kubernetes. |
| **Docker / Kubernetes** | Docker emballe une application et ses dépendances dans un **conteneur** portable. Kubernetes orchestre un ensemble de conteneurs en production. |
| **Versioning (gestion de versions)** | Conservation de l'**historique** des modifications pour revenir à un état antérieur (*rollback*) et tracer les changements. |
| **Git** | Système de gestion de versions de référence. Notions clés : *commit* (instantané), *branche* (ligne de développement parallèle), *merge* (fusion), *pull request* (demande de fusion soumise à relecture). |
| **CI/CD** | Intégration et déploiement continus : tests et mise en production automatisés à chaque modification. |
| **Collaboration en temps réel** | Plusieurs personnes modifient la même application simultanément. |
| **ALM** (*Application Lifecycle Management*) | Gestion du cycle de vie complet d'une application : environnements, versions, déploiements, gouvernance. |

## 1.8 Ouverture, propriété et architecture

| Concept | Définition |
|---|---|
| **Vendor lock-in** (dépendance au fournisseur) | Situation dans laquelle il est **impossible de quitter** une plateforme sans **reconstruire** l'application, parce que celle-ci n'existe que dans le format et le moteur d'exécution propriétaires de l'éditeur. Les risques sont la hausse des prix, l'arrêt du service et des limites techniques indépassables. |
| **Export de code** | Possibilité de **récupérer le code source** de l'application dans un langage ou un framework standard pour l'exécuter et le modifier **hors de la plateforme**. Trois niveaux sont à distinguer : **(1) code source lisible et maintenable** ; **(2) code compilé** (*build*) déployable mais non maintenable ; **(3) export JSON/YAML** réimportable uniquement dans la même plateforme, qui ne constitue **pas** un export de code. |
| **Interprétation à l'exécution / génération de code** | Deux approches techniques. Dans l'**interprétation** (*runtime*), l'application est stockée sous forme d'une **description JSON** qu'un **moteur propriétaire** lit et affiche à chaque exécution (Bubble, Retool, Appsmith) : sans ce moteur, la description est inutilisable, d'où l'absence d'export. Dans la **génération de code** (*codegen*), l'outil **produit des fichiers source** qui vivent indépendamment de lui (FlutterFlow, JHipster, Lovable). |
| **Open source** | Code source de la plateforme publiquement accessible, modifiable et redistribuable selon une **licence**. |
| **Licences permissives** (MIT, Apache 2.0, BSD) | Réutilisation autorisée, y compris dans un produit commercial fermé, sous réserve de conserver la mention de copyright. Apache 2.0 ajoute une clause relative aux brevets. |
| **Licences copyleft** (GPL v3, AGPL v3) | Tout logiciel dérivé **distribué** doit être publié sous la même licence. L'**AGPL** étend cette obligation aux logiciels **utilisés à travers un réseau** (un service en ligne modifié doit publier ses sources). |
| **Licence *source-available*** (BSL) | Code consultable, mais avec des restrictions d'usage commercial (Directus). Ce n'est pas une licence open source au sens de l'OSI. |
| **Open core** | Modèle dans lequel une **édition communautaire** est open source, tandis que les fonctions avancées (SSO, audit, Git, environnements multiples…) relèvent d'une **édition commerciale** fermée. |
| **Architecture monolithique** | L'application (interface, logique, accès aux données) forme **un seul programme déployé d'un bloc**. Elle est simple à développer et à déployer, mais plus difficile à faire évoluer à grande échelle. |
| **Architecture en couches** (*n-tiers*) | Séparation logique en couches : **présentation** → **logique métier** → **accès aux données** → **base de données**. L'architecture 3-tiers (client / serveur d'application / base) en est la forme classique. Elle peut être monolithique ou distribuée. |
| **Microservices** | Découpage de l'application en **petits services indépendants**, chacun responsable d'une fonction, déployés séparément et communiquant par API ou par messages. Cette architecture offre une bonne scalabilité au prix d'une complexité opérationnelle élevée. |
| **Serverless / JAMstack** | Le frontend est statique ou de type SPA, servi par un réseau de distribution (CDN). La logique serveur est confiée à des **fonctions exécutées à la demande** (*Edge Functions*, *Cloud Functions*) et la base de données à un BaaS. |
| **Micro-noyau** (*microkernel*) | Architecture où le cœur est minimal et où toutes les fonctionnalités sont fournies par des **plugins** (NocoBase). |
| **Multi-tenant** | Une infrastructure unique sert de nombreux clients, dont les données sont isolées logiquement. |

## 1.9 Intelligence artificielle

| Concept | Définition |
|---|---|
| **LLM** (*Large Language Model*) | Modèle de langage (GPT, Claude, Gemini…) capable de générer du texte et du code à partir d'instructions. |
| **Modèle multimodal** | LLM acceptant aussi des **images** en entrée. Cette capacité permet les fonctions « capture d'écran → interface ». |
| **Agent IA** | Système fondé sur un LLM qui **planifie et exécute plusieurs actions** (créer des fichiers, appeler des outils, lire des erreurs, corriger) de façon autonome. |
| **Sortie structurée** (*structured output*) | Génération par un LLM d'une réponse **conforme à un schéma JSON** imposé, plutôt que de texte libre. |
| **Appel d'outils** (*tool calling / function calling*) | Capacité d'un LLM à décider d'appeler une fonction externe (recherche, API, base) et à en exploiter le résultat. |
| **MCP** (*Model Context Protocol*) | Protocole standard de connexion d'un modèle d'IA à des outils et à des sources de données externes. |
| **RAG** (*Retrieval-Augmented Generation*) | Technique où le modèle consulte une base documentaire avant de répondre. |
| **Édition visuelle après génération** | Possibilité de **sélectionner** un élément généré par l'IA pour le modifier directement, sans nouvelle requête textuelle. |

---

# 2. PANORAMA ET TYPOLOGIE DES PLATEFORMES

Trente-trois plateformes ont été recensées et regroupées en neuf familles.

| Famille | Plateformes | Caractéristique commune |
|---|---|---|
| **F1. No-code full-stack** | Bubble, Adalo, Softr | Interface, base de données, logique et hébergement réunis dans une plateforme unique. |
| **F2. Builders de frontend et de sites web** | WeWeb, Webflow, Framer, Plasmic | Priorité au contrôle visuel de l'interface et, pour certains, au référencement. |
| **F3. Plateformes d'outils internes** | Retool, Appsmith, Budibase, ToolJet, Lowcoder, NocoBase | Interfaces d'administration et tableaux de bord branchés sur des données existantes. |
| **F4. No-code orienté données** | Glide | Application générée à partir d'un tableur ou d'une table. |
| **F5. Mobile natif** | FlutterFlow, Draftbit | Applications iOS/Android, avec génération de code source. |
| **F6. Générateurs d'applications par IA** | Lovable, Bolt.new, v0, Replit Agent | Une IA écrit le code d'une application complète à partir d'un prompt. |
| **F7. Low-code d'entreprise** | OutSystems, Mendix, Microsoft Power Apps | Modélisation visuelle à grande échelle, gouvernance et cycle de vie d'entreprise. |
| **F8. Backends visuels et générateurs de backend** | Xano, Supabase, Directus, Strapi, Amplication, JHipster | Modélisation des données et génération ou exposition automatique d'API, parfois génération de code serveur. |
| **F9. Design-to-code** | Builder.io (Visual Copilot, Mitosis), Locofy, Anima, Uizard, Google Stitch | Conversion de maquettes ou de descriptions en interfaces et en code. |

Les dix plateformes **Bubble, WeWeb, Retool, Appsmith, Budibase, ToolJet, Glide, FlutterFlow, Lovable et Bolt.new** font l'objet d'une fiche complète. Les vingt-trois autres sont décrites par une fiche condensée selon la même grille.

---

# 3. GRILLE D'ANALYSE

La grille regroupe 40 critères en dix catégories.

| Code | Catégorie | Critères |
|---|---|---|
| **C1** | Construction de l'interface | Éditeur visuel et arbre des composants ; glisser-déposer ; système de pages ; groupes et conteneurs ; responsive ; composants réutilisables ; thème / design system ; accessibilité |
| **C2** | Rendu et référencement | Type de rendu (SPA, SSR, SSG) ; SEO |
| **C3** | Logique et extensibilité | Workflows frontend ; workflows backend ; unités de consommation (Workload Units…) ; code personnalisé ; plugins et composants sur mesure ; gestion d'état |
| **C4** | Données et backend | Connexion à un backend ou à des API ; mécanisme de connexion ; base de données intégrée et type ; création de la base dans l'outil ; authentification et rôles ; export du backend |
| **C5** | Intelligence artificielle | Génération d'interface par IA ; nature de la sortie (objets visuels ou code) ; modification après génération ; génération à partir d'images ou de maquettes |
| **C6** | Cycle de vie et équipe | Environnements de test et de production ; hébergement ; collaboration ; versioning ; débogage |
| **C7** | Ouverture | Export du code et langages cibles ; dépendance au fournisseur ; licence open source et réutilisabilité |
| **C8** | Technologie et architecture | Technologies de la plateforme ; architecture de la plateforme ; architecture de l'application produite ; performance et scalabilité |
| **C9** | Cible | Web, mobile ou les deux ; accès aux fonctions natives |
| **C10** | Positionnement | Public cible ; cas d'usage ; courbe d'apprentissage ; tarification ; maturité et communauté ; sécurité et conformité |

---

# 4. FICHES DÉTAILLÉES PAR PLATEFORME

## FAMILLE F1 — NO-CODE FULL-STACK

### 4.1 Bubble

**Éditeur** : Bubble Group Inc. (New York, 2012). **Type** : no-code full-stack propriétaire.
**Public** : fondateurs non techniques, startups, agences. **Cas d'usage** : SaaS, places de marché, MVP, portails clients.

| Critère | Analyse |
|---|---|
| **Éditeur visuel / arbre** | **Oui.** Éditeur complet doté d'un **Element Tree** (arbre hiérarchique de la page) permettant de sélectionner, renommer, masquer et réordonner les éléments. |
| **Glisser-déposer** | **Oui**, depuis le panneau des éléments (Text, Button, Input, Image, Group, Repeating Group, Popup…). |
| **Système de pages** | **Oui.** Chaque page possède sa propre adresse. Le schéma « page unique » est aussi répandu : une seule page dont les groupes sont affichés ou masqués selon un paramètre d'adresse, ce qui donne une navigation plus fluide. |
| **Groupes et conteneurs** | **Oui, très complets** : *Group*, *Repeating Group* (liste liée à des données), *Popup* (fenêtre modale), *Floating Group* (barre fixe), *Group Focus* (menu déroulant). Un groupe peut porter une donnée (par exemple un Produit) que ses éléments enfants affichent. |
| **Responsive** | **Oui.** Moteur fondé sur **Flexbox** (lignes, colonnes, alignements, largeurs minimales et maximales), complété par des **conditions** sur la largeur de la page. Il est puissant mais réputé difficile à maîtriser. |
| **Composants réutilisables** | **Oui** : *Reusable Elements* (en-têtes, pieds de page, fenêtres modales partagées), avec leurs propres workflows et propriétés. |
| **Type de rendu** | **Hybride.** Les pages sont chargées séparément (comportement MPA), mais leur contenu est rendu en JavaScript par le moteur de Bubble (CSR). |
| **SEO** | **Partiel.** Réglages par page (titre, description, image Open Graph), adresses personnalisées, *sitemap* et *robots.txt* automatiques. Le rendu dépendant du JavaScript et des pages lourdes donnent des scores Lighthouse souvent moyens. |
| **Workflows frontend** | **Oui** : éditeur visuel « *When Button is clicked → Create a new Thing → Show Popup → Navigate* », avec conditions et états personnalisés. |
| **Workflows backend** | **Oui** : *Backend Workflows* (*API Workflows*) exécutés côté serveur, déclenchables par une API externe (webhook), **planifiables**, applicables en série à des listes, et *Database triggers* (déclenchement à la modification d'une donnée). |
| **Unités de consommation** | **Oui, Workload Units.** Toute opération serveur en consomme. Un tableau de bord permet de suivre la consommation par page et par workflow. C'est la critique la plus fréquente adressée à la plateforme. |
| **Code personnalisé** | **Partiel.** L'éditeur ne contient pas d'éditeur JavaScript natif. Le code passe par des **plugins** (*Toolbox* : action « Run JavaScript »), par un élément **HTML** ou par le **Plugin Editor**, qui permet de créer ses propres éléments et actions (JavaScript côté client, Node.js côté serveur). |
| **Connexion backend** | Backend intégré. Pour les services externes : **API Connector** (REST/JSON, OAuth, clés d'API) et connecteur SQL par plugin (PostgreSQL, MySQL, SQL Server). |
| **Mécanisme de connexion** | Données internes : « *Do a search for…* » (requêtes visuelles avec contraintes et tris). Données externes : description de l'appel dans l'API Connector (adresse, méthode, en-têtes). Bubble initialise l'appel, en déduit la structure de la réponse, puis l'appel s'utilise comme source de données ou comme action. |
| **Base de données intégrée** | **Oui, propriétaire.** Modèle par *Data Types* (« *Things* ») avec champs et relations. Elle s'appuie sur PostgreSQL en interne, **sans accès SQL direct**. Les *Privacy Rules* jouent le rôle de règles d'accès par ligne. |
| **Création de la base dans l'outil** | **Oui** : onglet *Data* (types, champs, *Option Sets*, vue tableur, import et export CSV). |
| **Authentification et rôles** | **Oui** : authentification intégrée, connexion OAuth (Google, Facebook…), rôles gérés par des champs et des Privacy Rules. |
| **Génération par IA** | **Oui.** *Bubble AI* génère une application complète (pages, base de données, workflows) à partir d'une description. *Bubble AI Agent* (bêta) crée et modifie des éléments, des workflows et des expressions par dialogue dans l'éditeur. |
| **Modification après IA** | **Oui.** L'IA produit des **éléments Bubble natifs**, entièrement modifiables dans l'éditeur visuel. |
| **Génération à partir d'images** | **Oui** (2025-2026) : capture d'écran, export Figma ou image d'inspiration transformés en interface dans l'éditeur. Un **import Figma** officiel existe également. |
| **Environnements** | **Oui** : *Development* (`/version-test`, avec **une base de données distincte**) et *Live* (production), déploiement en un clic. Les plans supérieurs offrent des **branches** supplémentaires. |
| **Hébergement** | Infrastructure Bubble (AWS) uniquement. Pas d'auto-hébergement, hors offre Enterprise sur serveur dédié géré par Bubble. Domaine personnalisé possible. |
| **Collaboration** | **Oui** : édition simultanée, droits par collaborateur. Le nombre d'éditeurs dépend du plan. |
| **Versioning** | **Partiel** : points de sauvegarde, restauration à une date donnée, branches et fusion. Pas de Git. |
| **Export du code** | **Non.** Bubble garantit la propriété des données (export CSV) et du design, mais ne fournit aucun code source exportable. |
| **Export du backend** | **Non** (données en CSV et API de données uniquement). |
| **Dépendance au fournisseur** | **Très forte.** Quitter Bubble impose de réécrire l'application. |
| **Open source** | Non. |
| **Technologies** | Moteur JavaScript (client) et Node.js (serveur), base PostgreSQL interne, infrastructure AWS. Applications mobiles fondées sur React Native. |
| **Architecture** | Plateforme monolithique multi-tenant. Les applications produites suivent un modèle 3-tiers (moteur client, serveur Bubble, base interne) hébergé par Bubble. |
| **Web / mobile** | **Les deux** : web responsive et **applications natives iOS/Android** (bêta en 2026, publication à partir du plan Growth), avec caméra, biométrie et notifications. |
| **Tarification** | Gratuit, Starter (~59 $/mois), Growth (~209 $/mois), Team, Enterprise, **plus les Workload Units**. |
| **Bilan** | **Points forts** : plateforme tout-en-un, écosystème de plus de 1 000 plugins, IA produisant des éléments éditables, génération à partir d'images. **Limites** : coût imprévisible des WU, absence d'export, performance, apprentissage plus long qu'annoncé. |

### 4.2 Adalo (fiche condensée)

**Éditeur** : Adalo (2018). **Type** : no-code orienté **applications mobiles natives**.

| Critère | Analyse |
|---|---|
| Interface | Canvas d'**écrans** avec glisser-déposer, composants de liste, formulaires, navigation entre écrans. Marketplace de composants. |
| Responsive / cible | Applications **natives iOS (IPA) et Android (APK)** et web, à partir d'un même projet. |
| Logique | Actions sur les composants (créer, modifier, naviguer, notifier), *Custom Actions* vers des API externes. Pas de véritable moteur de workflows backend. |
| Données | **Base relationnelle intégrée** (enregistrements illimités sur les plans payants), *External Collections* (API REST), intégration Xano. |
| IA | Assistant **Ada** (*Magic Start* : génération d'application ; *Magic Add* : ajout de fonctionnalités). |
| Export | **Non** sur les plans standards. Export du code réservé à l'offre entreprise *Adalo Blue*. |
| Hébergement | Cloud Adalo, publication sur les magasins d'applications. |
| Tarification | À partir de ~36 $/mois, sans plafond d'usage. |
| Bilan | Simple et adapté au MVP mobile. Dépendance au fournisseur forte et performances limitées sur de gros volumes. |

### 4.3 Softr (fiche condensée)

**Éditeur** : Softr (Berlin, 2019). **Type** : no-code orienté **portails et applications métier** sur données.

| Critère | Analyse |
|---|---|
| Interface | Construction par **blocs préfabriqués** (listes, tableaux, formulaires, graphiques, tableaux kanban) plutôt que par placement libre. |
| Groupes et rôles | Gestion avancée des **groupes d'utilisateurs** et des permissions par page et par bloc, point fort pour les portails clients. |
| Données | Airtable, Google Sheets, Notion, HubSpot, bases SQL, et **Softr Databases** (base relationnelle native depuis 2025). |
| Logique | **Workflows** multi-étapes intégrés (depuis 2025), actions sur les blocs. |
| IA | **AI Co-Builder** (mars 2026) : génération de la base, de l'application et de la logique à partir d'une description. Agents IA (depuis novembre 2025). |
| Code personnalisé | Blocs de code HTML/JavaScript. |
| SEO | Réglages par page (titre, description). |
| Export | **Non.** |
| Cible | Web et PWA. |
| Bilan | Très rapide pour les portails et les outils internes simples. Liberté de design limitée. |

---

## FAMILLE F2 — BUILDERS DE FRONTEND ET DE SITES WEB

### 4.4 WeWeb

**Éditeur** : WeWeb (Paris, 2018). **Type** : builder visuel de frontend Vue.js, devenu **full-stack en avril 2026** avec le lancement de *WeWeb Backend*.
**Public** : profils techniques et semi-techniques, agences. **Cas d'usage** : portails clients, SaaS, tableaux de bord, back-offices.

| Critère | Analyse |
|---|---|
| **Éditeur visuel / arbre** | **Oui.** Éditeur de niveau professionnel, proche de Figma, avec un panneau *Layout* (arbre des éléments). C'est l'un des contrôles de mise en page les plus fins du marché. |
| **Glisser-déposer** | **Oui.** |
| **Système de pages** | **Oui** : pages avec routes, **paramètres dynamiques** (`/produit/:id`), dossiers de pages, pages protégées par authentification. |
| **Groupes et conteneurs** | **Oui** : *Container*, *Section*, *Columns*, *Modal*, *Collection list* (liste répétée). |
| **Responsive** | **Oui, très complet** : Flexbox et **CSS Grid** natifs, points de rupture configurables. Chaque propriété de style peut varier selon le point de rupture. |
| **Composants réutilisables** | **Oui** : composants avec propriétés, **bibliothèques partagées** entre projets, et **composants Vue.js personnalisés** importables. |
| **Type de rendu** | **SPA Vue.js** en rendu client. |
| **SEO** | **Partiel.** Balises meta par page, *sitemap*, pré-rendu des pages statiques. Le rendu reste côté client, et la direction de WeWeb a confirmé que le **SSR n'est pas prévu en 2026**. Les scores Lighthouse mobiles observés sur des pages publiques sont souvent bas (20 à 50). |
| **Workflows frontend** | **Oui** : workflows sur événements (clic, chargement, changement de variable) avec appels d'API, navigation, variables, boucles, branchements conditionnels et JavaScript. Workflows globaux réutilisables. |
| **Workflows backend** | **Oui depuis avril 2026** : *Backend Workflows* (création d'**endpoints d'API** et de fonctions serveur réutilisables). Auparavant, la logique serveur était déléguée à Xano ou à Supabase. |
| **Unités de consommation** | Non. Facturation par sièges d'éditeurs et par plan d'hébergement (sessions, bande passante). |
| **Code personnalisé** | **Oui, partout** : formules JavaScript dans toute propriété liée, action « *Custom JavaScript* », composants Vue.js codés à la main. |
| **Connexion backend** | **Oui, agnostique** : connecteurs Supabase, Xano, Airtable, Firebase, Google Sheets, REST, GraphQL, et backend WeWeb natif. |
| **Mécanisme de connexion** | Ajout d'un **plugin de source de données** (par exemple Supabase : adresse et clé publique), création de **collections** (requêtes enregistrées) **liées** aux éléments, écritures par des actions de workflow. |
| **Base de données intégrée** | **Oui depuis avril 2026** : *WeWeb Tables*, base **PostgreSQL** avec interface de type tableur, **API CRUD générées automatiquement**, authentification et stockage. |
| **Création de la base dans l'outil** | **Oui** depuis 2026 (schéma, tables, vues filtrées). |
| **Authentification et rôles** | **Oui** : via le backend natif ou des fournisseurs externes (Supabase Auth, Auth0, Xano), avec pages protégées par rôle. |
| **Génération par IA** | **Oui** : *WeWeb AI* (bêta depuis février 2025) génère des pages, des composants, des workflows et des formules. |
| **Modification après IA** | **Oui** (éléments natifs de l'éditeur). |
| **Génération à partir d'images** | Non documentée. |
| **Environnements** | **Oui** : éditeur (brouillon), *Staging* et *Production*, avec des adresses distinctes et des variables d'environnement pour pointer vers un backend de test ou de production. |
| **Hébergement** | Cloud WeWeb (CDN) ou **auto-hébergement** du frontend exporté (Vercel, Netlify, Cloudflare, AWS, serveur propre). |
| **Collaboration** | **Partielle** : plusieurs éditeurs, mais une collaboration avancée (branches, déploiements séparés) jugée insuffisante par plusieurs utilisateurs. |
| **Versioning** | **Partiel** : historique des publications, retour à une version antérieure, sauvegardes. Pas de Git natif. |
| **Export du code** | **Partiel** : export d'une **SPA Vue.js compilée** prête à déployer. La documentation de WeWeb indique que la maintenance de ce code hors de l'éditeur n'est pas réaliste : il s'agit d'un artefact de déploiement, pas d'un code source de travail. |
| **Export du backend** | Non documenté pour la logique serveur. Les données PostgreSQL sont exportables. |
| **Dépendance au fournisseur** | **Faible côté frontend** (export, auto-hébergement, backend au choix). **Moyenne** en cas d'adoption du backend natif. |
| **Open source** | Non (le SDK des composants personnalisés est public). |
| **Technologies** | **Vue.js** (éditeur et applications produites). |
| **Architecture produite** | **SPA découplée + backend par API ou BaaS** (modèle 3-tiers *headless*). |
| **Web / mobile** | Web responsive et PWA. Pas d'application native. |
| **Bilan** | **Points forts** : précision du design, liberté du backend, export, JavaScript disponible partout, backend natif depuis 2026. **Limites** : SEO (pas de SSR), collaboration, documentation parfois en retard, tarification en deux volets (sièges et hébergement). |

### 4.5 Webflow (fiche condensée)

**Éditeur** : Webflow Inc. (San Francisco, 2013). **Type** : builder de **sites web** professionnels.

| Critère | Analyse |
|---|---|
| Interface | Canvas avec *Navigator* (arbre des éléments), glisser-déposer, contrôle complet des propriétés CSS (Flexbox, Grid), points de rupture, **composants** réutilisables avec propriétés. |
| Rendu / SEO | **HTML/CSS statique** servi par CDN. C'est **la référence du SEO** dans le no-code : balises sémantiques, meta, sitemap, redirections, données structurées. |
| Données | **CMS** intégré (collections, pages modèles dynamiques), e-commerce. |
| Logique | Interactions et animations côté client. Formulaires. Automatisations via des intégrations externes (Zapier, Make). |
| Code personnalisé | Code HTML/CSS/JS intégrable, **AI code components** (avril 2026), import de composants **React** via DevLink. |
| IA | Assistant IA de conception, génération de composants de code par IA (avril 2026), *AI Code Generation* (accès anticipé 2026) produisant des applications **React** déployables sur *Webflow Cloud*. |
| Export | **Partiel** : export HTML/CSS/JS statique. Les parties dynamiques (CMS, formulaires, recherche, protection par mot de passe, localisation) **ne fonctionnent plus** après export. **DevLink** exporte les composants Webflow en composants **React** typés (refonte en mai 2026). |
| Hébergement | Webflow (CDN), *Webflow Cloud* pour les applications Next.js/Astro. |
| Bilan | Excellente qualité HTML et SEO, design très fin. Peu adapté aux applications métier avec logique complexe. |

### 4.6 Framer (fiche condensée)

**Éditeur** : Framer B.V. (Amsterdam). **Type** : builder de **sites marketing** fondé sur React.

| Critère | Analyse |
|---|---|
| Interface | Canvas proche d'un outil de design (calques, *stacks*, grilles), points de rupture, composants avec **variantes**, animations avancées. |
| Rendu / SEO | Pages pré-rendues et rapides (scores PageSpeed supérieurs à 90 par défaut). **Très bon SEO.** |
| Données | CMS intégré. |
| Code personnalisé | **Code Components** (composants React avec contrôles visuels) et **Code Overrides** (composants d'ordre supérieur modifiant des calques). |
| IA | *Wireframer* (génération de mises en page), *Workshop* (génération de composants), plugin MCP. |
| Export | **Non** : dépendance totale au fournisseur. |
| Cible | Web uniquement. |
| Bilan | Rapidité et qualité visuelle pour les sites vitrines. Ne convient pas aux applications métier. |

### 4.7 Plasmic (fiche condensée)

**Éditeur** : Plasmic (San Francisco). **Type** : builder visuel **open source** pour React.

| Critère | Analyse |
|---|---|
| Interface | Éditeur visuel complet (arbre, glisser-déposer, responsive, variantes). **Enregistrement de composants React existants** (*code components*) utilisables dans l'éditeur. |
| Rendu / SEO | Intégration profonde à **Next.js**, Gatsby, Remix : **SSR, SSG et ISR**, donc un **bon SEO**. |
| Données | Intégrations Supabase, REST, GraphQL, HTTP, CMS Plasmic. |
| Export | **Oui, deux modes** : (1) **génération de code React** synchronisée dans le dépôt par une interface en ligne de commande ; (2) chargement « *headless* » des composants à l'exécution, qui dépend du CDN Plasmic. |
| Open source | **Oui** (licence MIT pour l'essentiel du code). |
| Bilan | L'un des meilleurs compromis entre édition visuelle et propriété du code React. Exemple d'architecture « éditeur visuel + générateur de code ». |

---

## FAMILLE F3 — PLATEFORMES D'OUTILS INTERNES

### 4.8 Retool

**Éditeur** : Retool Inc. (San Francisco, 2017). **Type** : low-code d'outils internes, **référence du marché**.
**Public** : développeurs et équipes techniques. **Cas d'usage** : back-offices, tableaux de bord, outils d'administration, support client, circuits d'approbation.

| Critère | Analyse |
|---|---|
| **Éditeur visuel / arbre** | **Oui** : environnement de développement visuel avec panneau *Explorer* (composants, requêtes, variables). |
| **Glisser-déposer** | **Oui** : plus de 100 composants (Table, Form, Chart, Modal, Tabs, Container, JSON Editor…) sur une grille. |
| **Système de pages** | **Oui** : applications multipages avec paramètres d'adresse. |
| **Groupes et conteneurs** | **Oui** : *Container*, *Tabbed Container*, *Form*, *Modal*, *Drawer*, *List View*, *Stepped Container* (assistant en étapes). |
| **Responsive** | **Partiel** : grille conçue pour l'ordinateur, avec une disposition mobile distincte à configurer. Les applications mobiles natives relèvent d'un produit séparé, *Retool Mobile*. |
| **Composants réutilisables** | **Oui** : **Modules** (groupes de composants et de requêtes réutilisables entre applications) et **Custom Components** codés en React. |
| **Type de rendu** | SPA React. |
| **SEO** | N/A (outils internes protégés par authentification). |
| **Workflows frontend** | **Oui** : gestionnaires d'événements (clic → exécution d'une requête → notification), chaînage de requêtes JavaScript et SQL. |
| **Workflows backend** | **Oui** : **Retool Workflows**, produit d'automatisation côté serveur en blocs (planification, webhooks, boucles, conditions, code Python ou JavaScript, appels à des LLM). |
| **Unités de consommation** | Non. Facturation par utilisateur et, pour Workflows, par nombre d'exécutions. |
| **Code personnalisé** | **Oui, partout** : `{{ }}` dans toutes les propriétés, requêtes JavaScript, *transformers*, bibliothèques importables, Python dans Workflows, composants React. |
| **Connexion backend** | **Oui, point fort** : PostgreSQL, MySQL, MongoDB, Snowflake, BigQuery, Redis, Elasticsearch, Google Sheets, Stripe, Salesforce, Slack, Twilio, ainsi que **REST, GraphQL et gRPC**. |
| **Mécanisme de connexion** | Création d'une **Resource** (connexion configurée une fois, identifiants conservés côté serveur), puis écriture de **Queries** (SQL ou appels d'API) dans chaque application, et liaison des résultats aux composants (`{{ query1.data }}`). Les requêtes transitent par le **serveur Retool**, si bien que les identifiants ne sont jamais exposés au navigateur. |
| **Base de données intégrée** | **Oui** : *Retool Database* (PostgreSQL géré, interface tableur). Elle convient aux volumes modestes. |
| **Création de la base dans l'outil** | **Oui** (tables, colonnes, import CSV). |
| **Authentification et rôles** | **Oui, niveau entreprise** : groupes de permissions, SSO (SAML, OIDC), journaux d'audit. |
| **Génération par IA** | **Oui** : *Retool AI / AppGen* et *Assist* (2025-2026) génèrent et modifient des applications par prompt **sur les données réelles de l'organisation**. *Retool Agents* (agents connectés aux outils internes) et blocs LLM dans Workflows. |
| **Modification après IA** | **Oui** : composants et requêtes natifs, modifiables visuellement. Chaque requête est présentée avant exécution, et des points de sauvegarde sont créés automatiquement. |
| **Génération à partir d'images** | Non documentée. |
| **Environnements** | **Oui** : environnements multiples (*staging*, *production*), chaque ressource pouvant pointer vers une base différente selon l'environnement. Les **Releases** publient une version précise. |
| **Hébergement** | Cloud Retool ou **auto-hébergement** (Docker, Kubernetes sur AWS, GCP, Azure ou serveurs internes). |
| **Collaboration** | **Oui** : édition simultanée, permissions par groupe, commentaires. |
| **Versioning** | **Oui** : historique, *Releases*, et **Source Control** (synchronisation Git avec branches et pull requests) sur le plan Enterprise. |
| **Export du code** | **Non.** Les applications sont stockées en JSON/YAML et ne s'exécutent que dans le moteur Retool. |
| **Export du backend** | Non. |
| **Dépendance au fournisseur** | **Forte** pour la couche applicative. Les données restent dans les bases de l'organisation. |
| **Open source** | Non. |
| **Technologies** | Frontend React / TypeScript, backend Node.js, stockage interne PostgreSQL. En auto-hébergement, Workflows s'appuie sur le moteur d'orchestration **Temporal**. |
| **Architecture** | En auto-hébergement, plusieurs **services conteneurisés** (API, exécuteur de code, workers Workflows, base interne). Applications produites : client → serveur Retool (intermédiaire des requêtes) → sources de données. |
| **Web / mobile** | Web et **Retool Mobile** (applications natives pour les équipes de terrain). |
| **Bilan** | **Points forts** : connecteurs, puissance pour les développeurs, sécurité d'entreprise, IA appliquée aux données réelles. **Limites** : coût par utilisateur élevé, dépendance au fournisseur, maintenabilité des grandes applications, inadapté aux applications publiques. |

### 4.9 Appsmith

**Éditeur** : Appsmith Inc. (2019). **Type** : low-code d'outils internes **open source** (alternative à Retool).
**Public** : développeurs. **Cas d'usage** : outils internes, back-offices, tableaux de bord.

| Critère | Analyse |
|---|---|
| **Éditeur visuel / arbre** | **Oui** : *Entity Explorer* (pages, widgets, requêtes, objets JavaScript). |
| **Glisser-déposer** | **Oui** : plus de 45 widgets sur une grille. |
| **Système de pages** | **Oui** : applications multipages, menus de navigation, paramètres d'adresse. |
| **Groupes et conteneurs** | **Oui** : *Container*, *Form*, *Tabs*, *Modal*, *List*, *JSON Form* (formulaire généré à partir d'un objet). |
| **Responsive** | **Partiel** : interface pensée d'abord pour l'ordinateur. L'adaptation mobile demande souvent un ajustement manuel. |
| **Composants réutilisables** | **Oui** : *Custom Widgets* (HTML/CSS/JavaScript, éventuellement générés par prompt), bibliothèques JavaScript importées, *Modules / Packages* (éditions payantes). |
| **Type de rendu** | SPA React. |
| **SEO** | N/A. |
| **Workflows frontend** | **Oui** : événements des widgets déclenchant des requêtes et des fonctions (`storeValue`, `navigateTo`, `showModal`). |
| **Workflows backend** | **Partiel** : *Workflows* (éditions Business et Enterprise), avec validations humaines intégrées. |
| **Unités de consommation** | Non. Facturation par utilisateur, auto-hébergement communautaire gratuit. |
| **Code personnalisé** | **Oui, central** : `{{ }}` partout, **JS Objects** (modules JavaScript avec fonctions et variables), bibliothèques externes. |
| **Connexion backend** | **Oui** : plus de 25 connecteurs (PostgreSQL, MySQL, MongoDB, SQL Server, Redis, Snowflake, Firestore, S3, Google Sheets…), REST et GraphQL. |
| **Mécanisme de connexion** | Création d'une **Datasource** (identifiants conservés côté serveur), puis de **Queries** liées aux widgets (`{{ Query1.data }}`). Les requêtes transitent par le serveur Appsmith. |
| **Base de données intégrée** | **Non** pour les données métier (MongoDB est utilisée en interne pour stocker les applications). |
| **Création de la base dans l'outil** | Non. |
| **Authentification et rôles** | **Oui** : rôles et contrôle d'accès granulaire. SSO dans les éditions payantes. |
| **Génération par IA** | **Partiel** : *Appsmith AI* (suggestion de widgets, écriture de JavaScript, génération de requêtes) et *Appsmith Agents* (agents IA métier). La génération d'une application complète par prompt est moins aboutie que chez Retool ou Bubble. |
| **Modification après IA** | **Oui** (widgets et code natifs). |
| **Génération à partir d'images** | Non documentée. |
| **Environnements** | **Partiel** : branches Git (développement, fonctionnalités, principale) et, dans les éditions payantes, environnements multiples de sources de données. |
| **Hébergement** | Cloud Appsmith ou **auto-hébergement gratuit** (Docker, Kubernetes, image AWS). |
| **Collaboration** | **Oui** : espaces de travail, rôles, plusieurs éditeurs. |
| **Versioning** | **Oui, Git natif dès l'édition gratuite** : branches, commits, pull requests, CI/CD. Argument différenciant face à Retool. |
| **Export du code** | **Non.** L'application est sérialisée en JSON/YAML (lisible dans Git), mais ne s'exécute que dans le moteur Appsmith. |
| **Export du backend** | Non. |
| **Dépendance au fournisseur** | **Moyenne** : format applicatif propriétaire, mais plateforme open source et auto-hébergeable. |
| **Open source** | **Oui, Apache 2.0** (édition communautaire), licence permissive. Modèle *open core*. |
| **Technologies** | Frontend React / TypeScript (Redux), backend **Java (Spring Boot / WebFlux)**, base interne **MongoDB**, cache **Redis**, service Node.js annexe pour le temps réel et l'évaluation du code. |
| **Architecture** | Plusieurs services (Nginx, serveur Java, service Node.js, MongoDB, Redis) **regroupés dans une image Docker unique** : **monolithe modulaire conteneurisé**, éclatable en services sur Kubernetes. |
| **Web / mobile** | Web (responsive limité). |
| **Bilan** | **Points forts** : licence Apache 2.0, Git gratuit, auto-hébergement, coût prévisible. **Limites** : maîtrise de JavaScript nécessaire, faible adaptation au mobile, IA moins avancée. |

### 4.10 Budibase

**Éditeur** : Budibase Ltd (Belfast, 2019). **Type** : plateforme **open source** d'outils internes orientée **formulaires et processus métier**.
**Public** : équipes informatiques et opérationnelles. **Cas d'usage** : portails de demandes, circuits d'approbation, gestion d'inventaire, applications CRUD.

| Critère | Analyse |
|---|---|
| **Éditeur visuel / arbre** | **Oui** : éditeur d'écrans (*Screens*) avec arbre des composants. |
| **Glisser-déposer** | **Oui.** |
| **Système de pages** | **Oui** : écrans avec routes (`/clients/:id`) et **niveau d'accès minimal par écran**. |
| **Groupes et conteneurs** | **Oui** : *Container*, *Form*, *Repeater*, *Modal*, *Side Panel*, et **Blocks** (ensembles préassemblés, par exemple un tableau associé à un formulaire de détail). |
| **Responsive** | **Oui** : disposition responsive par défaut (empilement automatique sur mobile), moins fine que WeWeb. |
| **Composants réutilisables** | **Partiel** : Blocks et plugins de composants personnalisés (Svelte). |
| **Type de rendu** | SPA Svelte. |
| **SEO** | N/A. |
| **Workflows frontend** | **Oui** : actions sur les boutons (enregistrer, naviguer, ouvrir une fenêtre, déclencher une automatisation). |
| **Workflows backend** | **Oui** : **Automations** (déclencheurs : création ou modification de ligne, webhook, planification, appel depuis l'application ; étapes : requêtes, e-mails, JavaScript, Bash, boucles, conditions, appels à des LLM). |
| **Unités de consommation** | Non. Facturation par utilisateur ou par créateur, avec des quotas d'exécutions en cloud. |
| **Code personnalisé** | **Oui** : liaisons JavaScript dans les propriétés, étapes JavaScript dans les automatisations, composants personnalisés. |
| **Connexion backend** | **Oui** : PostgreSQL, MySQL, SQL Server, Oracle, MongoDB, CouchDB, DynamoDB, Redis, S3, Google Sheets, Airtable, REST, GraphQL. |
| **Mécanisme de connexion** | Ajout d'une **source de données**. Budibase lit le **schéma des tables SQL** et **génère automatiquement des écrans CRUD**. Des requêtes SQL ou REST réutilisables peuvent aussi être définies. |
| **Base de données intégrée** | **Oui** : *Budibase DB*, fondée sur **CouchDB** (NoSQL documentaire), avec interface tableur, relations, formules et pièces jointes. |
| **Création de la base dans l'outil** | **Oui** (tables, colonnes, relations, import CSV). |
| **Authentification et rôles** | **Oui** : rôles prédéfinis (Basic, Power, Admin) et personnalisés, groupes d'utilisateurs, SSO. |
| **Génération par IA** | **Partiel** : *Budibase AI* (génération de tables, de JavaScript et de formules) et **constructeur d'agents IA** (OpenAI, Anthropic, Mistral via LiteLLM, RAG via pgvector). La génération d'interfaces complètes par prompt est peu mise en avant. |
| **Modification après IA** | **Oui** (objets natifs). |
| **Génération à partir d'images** | Non documentée. |
| **Environnements** | **Oui** : mode développement et application publiée. Les données de la base interne sont **séparées entre développement et production**. |
| **Hébergement** | Budibase Cloud ou **auto-hébergement gratuit** (Docker Compose, Kubernetes/Helm, DigitalOcean). |
| **Collaboration** | **Oui** : plusieurs créateurs, rôles et groupes. |
| **Versioning** | **Partiel** : révisions et sauvegardes d'application restaurables (plans payants). Pas d'intégration Git comparable à celle d'Appsmith. |
| **Export du code** | **Non** : export d'une archive réimportable dans Budibase uniquement. |
| **Export du backend** | Non (données exportables en CSV ou JSON). |
| **Dépendance au fournisseur** | **Moyenne**, atténuée par l'open source et l'auto-hébergement. |
| **Open source** | **Oui, GPL v3** (licence copyleft). Modèle *open core*. |
| **Technologies** | Builder et client en **Svelte**, backend **Node.js (Koa) / TypeScript**, base **CouchDB**, stockage d'objets **MinIO**, **Redis**, proxy **Nginx**. |
| **Architecture** | **Services séparés conteneurisés** : service des applications, service *worker* (comptes, utilisateurs), CouchDB, MinIO, Redis, proxy. Architecture orientée services. |
| **Web / mobile** | Web responsive et PWA. |
| **Bilan** | **Points forts** : open source, base intégrée, génération CRUD automatique, automatisations, agents IA. **Limites** : liberté de design réduite, versioning moins mature, licence GPL contraignante pour la réutilisation commerciale. |

### 4.11 ToolJet

**Éditeur** : ToolJet Solutions (2021). **Type** : plateforme **open source** d'outils internes, repositionnée en *ToolJet AI* (applications internes, workflows et agents IA).
**Public** : développeurs et équipes métier. **Cas d'usage** : outils internes, circuits d'approbation, agents IA.

| Critère | Analyse |
|---|---|
| **Éditeur visuel / arbre** | **Oui** : arborescence des composants, des pages et des requêtes. |
| **Glisser-déposer** | **Oui** : plus de 60 composants. |
| **Système de pages** | **Oui** : applications multipages. |
| **Groupes et conteneurs** | **Oui** : *Container*, *Form*, *Tabs*, *Modal*, *Listview*, *Kanban*. |
| **Responsive** | **Partiel** : deux dispositions (ordinateur et mobile) à configurer. |
| **Composants réutilisables** | **Oui** : **Modules** et composants personnalisés (React). |
| **Type de rendu** | SPA React. |
| **SEO** | N/A. |
| **Workflows frontend** | **Oui** : gestionnaires d'événements (clic → requête → alerte). |
| **Workflows backend** | **Oui** : *ToolJet Workflows*, éditeur visuel d'automatisation côté serveur (webhooks, planification, requêtes, JavaScript, conditions, boucles). |
| **Unités de consommation** | Non. Facturation par constructeur et par utilisateur final. |
| **Code personnalisé** | **Oui** : JavaScript et **Python** (exécuté dans le navigateur via Pyodide), transformations des résultats de requêtes. |
| **Connexion backend** | **Oui** : plus de 80 sources (PostgreSQL, MySQL, MongoDB, SQL Server, Snowflake, BigQuery, REST, GraphQL, Google Sheets, Stripe, Airtable, S3…). |
| **Mécanisme de connexion** | Source de données déclarée au niveau de l'espace de travail, puis **requêtes** liées aux composants (`{{queries.q1.data}}`). |
| **Base de données intégrée** | **Oui** : *ToolJet Database*, PostgreSQL exposé via **PostgREST**, interface tableur. |
| **Création de la base dans l'outil** | **Oui.** |
| **Authentification et rôles** | **Oui** : groupes, permissions par application, SSO (plans payants). |
| **Génération par IA** | **Oui** : *ToolJet AI* génère des applications à partir d'un prompt (avec une étape de spécification), assiste l'écriture de requêtes et le débogage, et propose des agents IA. |
| **Modification après IA** | **Oui** (composants natifs). |
| **Génération à partir d'images** | Non documentée. |
| **Environnements** | **Oui** : *Development*, *Staging*, *Production*, avec des **valeurs de sources de données propres à chaque environnement** (plans payants) et promotion des versions d'un environnement à l'autre. |
| **Hébergement** | Cloud ToolJet ou **auto-hébergement** (Docker, Kubernetes, AWS, GCP, Azure). |
| **Collaboration** | **Oui** : édition simultanée, commentaires et mentions (plans payants). |
| **Versioning** | **Oui** : versions d'application et **synchronisation Git** (GitHub/GitLab, plans payants). |
| **Export du code** | **Non** : export JSON réimportable dans ToolJet uniquement. |
| **Export du backend** | Non. |
| **Dépendance au fournisseur** | **Moyenne**, atténuée par l'open source. |
| **Open source** | **Oui, AGPL v3** (copyleft fort, usage réseau inclus). Plus de 38 000 étoiles sur GitHub. Modèle *open core*. |
| **Technologies** | Frontend **React**, backend **Node.js (NestJS, TypeScript)**, **PostgreSQL**, **PostgREST**, **Redis**. |
| **Architecture** | Client, serveur NestJS, PostgreSQL et PostgREST : architecture en couches conteneurisée, avec des workers séparés pour les workflows. |
| **Web / mobile** | Web (disposition mobile disponible). |
| **Bilan** | **Points forts** : open source, nombre de connecteurs, base intégrée, environnements, IA. **Limites** : licence AGPL contraignante, fonctions clés (environnements multiples, Git) payantes. |

### 4.12 Lowcoder (fiche condensée)

**Type** : plateforme **open source** d'outils internes, reprise du projet abandonné *Openblocks*.

| Critère | Analyse |
|---|---|
| Interface | Éditeur glisser-déposer, plus de 100 composants (dont des composants de visioconférence et de collaboration), modules réutilisables, thèmes. |
| Particularité | Applications **intégrables** (*embeddable*) dans d'autres sites, et applications destinées au public externe. |
| Logique / données | Requêtes vers bases SQL et NoSQL et vers des API, JavaScript, automatisations. |
| Hébergement | Cloud (*lowcoder.cloud*) ou auto-hébergement. |
| Collaboration | Édition simultanée, permissions granulaires. |
| Open source | **AGPL v3.** Une édition entreprise propriétaire existe. |
| Technologies | Héritées d'Openblocks : frontend React, backend Java (Spring), MongoDB, Redis, service Node.js. |
| Bilan | Alternative communautaire à Appsmith et Retool. La licence AGPL limite la réutilisation. |

### 4.13 NocoBase (fiche condensée)

**Type** : plateforme no-code / low-code **open source** orientée **modèle de données** et **extensibilité par plugins**.

| Critère | Analyse |
|---|---|
| Principe | **Le modèle de données est défini en premier** (collections, champs, relations), puis les interfaces sont configurées en **blocs** sur des pages (tableaux, formulaires, détails, kanban, calendrier). |
| Architecture | **Micro-noyau** : le cœur est minimal et **toutes les fonctionnalités sont des plugins**, y compris les fonctions standards. De nouveaux plugins peuvent être développés selon des règles communes. |
| Données | PostgreSQL, MySQL, MariaDB, SQLite, et sources externes. |
| Logique | Plugin de **workflows** (déclencheurs, approbations, conditions). |
| IA | « **AI Employees** » (version 2.0, fin 2025) : agents IA intégrés aux processus. |
| Open source | **Apache 2.0 depuis février 2026** (version 2.0). Auparavant AGPL v3. Des plugins commerciaux ont été ouverts au même moment. |
| Technologies | Backend Node.js (Koa), frontend React (Ant Design). |
| Bilan | **Référence d'architecture extensible** sous licence permissive, particulièrement pertinente pour une plateforme destinée à être étendue. |

---

## FAMILLE F4 — NO-CODE ORIENTÉ DONNÉES

### 4.14 Glide

**Éditeur** : Glide (San Francisco, 2018). **Type** : no-code « *data-first* » : l'application est générée à partir d'une table de données. En 2026, l'éditeur a lancé **GlideOS**, une plateforme IA distincte, avec son propre abonnement et sans migration possible depuis la version classique.
**Public** : non-techniciens, PME, équipes opérationnelles. **Cas d'usage** : applications d'équipe, inventaires, CRM légers, applications de terrain.

| Critère | Analyse |
|---|---|
| **Éditeur visuel / arbre** | **Partiel** : chaque écran est une **liste verticale de composants**. Il n'y a ni canvas libre ni arbre profond. |
| **Glisser-déposer** | **Partiel** : réorganisation des composants dans la liste, sans positionnement libre. |
| **Système de pages** | **Oui** : écrans et onglets de navigation, écrans de détail générés automatiquement pour chaque ligne. |
| **Groupes et conteneurs** | **Partiel** : *Containers* (colonnes, arrière-plans) et **Collections** (listes, cartes, tableaux, calendriers, kanban). |
| **Responsive** | **Oui, automatique** (mobile d'abord, adaptation à l'ordinateur), au prix d'une liberté de design réduite. |
| **Composants réutilisables** | **Partiel** : duplication d'écrans, composants préfabriqués. |
| **Type de rendu** | PWA monopage. |
| **SEO** | Non adapté (applications d'équipe, souvent privées). |
| **Workflows frontend** | **Oui** : actions sur clic (ajouter une ligne, ouvrir un lien, afficher une notification). |
| **Workflows backend** | **Oui** : workflows planifiés, déclenchés par webhook ou par e-mail entrant, avec boucles et conditions. |
| **Unités de consommation** | **Oui, sous forme d'« updates »** (synchronisations et exécutions de workflows), avec un quota mensuel par plan. |
| **Code personnalisé** | **Partiel** : colonnes calculées en JavaScript, appels d'API (*Call API*). Très limité pour l'interface. |
| **Connexion backend** | **Oui** : Google Sheets, Excel, Airtable, *Glide Tables*, *Big Tables*, bases SQL (plans supérieurs), Salesforce, API REST. |
| **Mécanisme de connexion** | Choix d'une source à la création. **Chaque feuille devient une table**, et l'application est **générée automatiquement** à partir de ces tables. |
| **Base de données intégrée** | **Oui** : *Glide Tables* et *Big Tables* (jusqu'à plusieurs centaines de milliers de lignes), tabulaires et propriétaires, avec **colonnes calculées** (relations, recherches, agrégations, conditions, colonnes IA). |
| **Création de la base dans l'outil** | **Oui.** |
| **Authentification et rôles** | **Oui** : connexion par e-mail, rôles définis par colonne, filtrage des lignes par utilisateur. |
| **Génération par IA** | **Partiel** : *Glide AI* (génération à partir de données ou de descriptions, colonnes IA de transformation de texte et d'extraction depuis des images, mode agent sur les plans payants). *GlideOS* constitue la nouvelle offre IA. |
| **Modification après IA** | **Oui** (composants natifs). |
| **Génération à partir d'images** | **Non** pour la structure d'interface. Les colonnes IA extraient seulement du texte à partir d'images. |
| **Environnements** | **Partiel** : brouillon et version publiée, sans environnement de test aux données séparées. |
| **Hébergement** | Cloud Glide uniquement. |
| **Collaboration** | **Partielle** (nombre d'éditeurs selon le plan). |
| **Versioning** | **Partiel** (historique limité). |
| **Export du code** | **Non.** |
| **Export du backend** | Non (les données restent toutefois dans la source externe si elle a été choisie). |
| **Dépendance au fournisseur** | **Forte** pour l'application, **faible** pour les données hébergées dans une source externe. |
| **Open source** | Non. |
| **Technologies** | React / TypeScript (propriétaire). |
| **Architecture** | SaaS multi-tenant : PWA et moteur de données synchronisé avec la source. |
| **Web / mobile** | Web et **PWA mobile d'abord**. Pas de publication sur les magasins d'applications. |
| **Tarification** | Gratuit (25 000 lignes), Explorer (~19 $/mois), Maker (~49 $/mois), Business (~199 $/mois), Enterprise. |
| **Bilan** | **Points forts** : très grande simplicité, rendu soigné par défaut, rapidité. **Limites** : rigidité du design, pas d'export, pas d'application native, quotas de lignes et d'updates. |

---

## FAMILLE F5 — MOBILE NATIF

### 4.15 FlutterFlow

**Éditeur** : FlutterFlow Inc. (2020, fondé par d'anciens ingénieurs de Google). **Type** : low-code visuel **générant du code Flutter (Dart)**. En juillet 2025, l'éditeur a lancé **DreamFlow**, générateur d'applications Flutter par IA.
**Public** : développeurs mobiles, startups, agences. **Cas d'usage** : applications mobiles natives, également web et ordinateur.

| Critère | Analyse |
|---|---|
| **Éditeur visuel / arbre** | **Oui** : *Widget Tree*, arbre des widgets Flutter (Column, Row, Stack, Container, ListView…) qui reflète exactement la hiérarchie du code généré. |
| **Glisser-déposer** | **Oui.** |
| **Système de pages** | **Oui** : pages avec routes et **paramètres**, navigation (empilement, barre de navigation inférieure, tiroir), liens profonds. |
| **Groupes et conteneurs** | **Oui** : widgets de disposition Flutter (Column, Row, Stack, Container, Card, Wrap, ListView/GridView, TabBar, PageView, BottomSheet, Dialog). |
| **Responsive** | **Oui** : visibilité par point de rupture, valeurs responsives, widgets *Expanded* et *Flexible*. |
| **Composants réutilisables** | **Oui** : *Components* (avec paramètres et état), *Libraries* partagées entre projets, thème. |
| **Type de rendu** | Sur le web, **Flutter Web** produit une SPA rendue dans un canvas (ou via un moteur WebAssembly). |
| **SEO** | **Non** : l'interface est dessinée dans un canvas, sans HTML sémantique exploitable par les robots. |
| **Workflows frontend** | **Oui** : *Action Flow Editor* (actions sur événements avec conditions, boucles, appels d'API, navigation, gestion d'état, requêtes Firestore ou Supabase). |
| **Workflows backend** | **Partiel** : *Cloud Functions* personnalisées (Firebase, Node.js) et déclencheurs Firestore, fonctions Edge de Supabase. FlutterFlow n'exécute pas de backend propre. |
| **Unités de consommation** | Non (abonnement par éditeur). Les coûts Firebase ou Supabase sont facturés séparément. |
| **Code personnalisé** | **Oui, en Dart** : *Custom Widgets*, *Custom Actions*, *Custom Functions*, import de paquets *pub.dev*. |
| **Connexion backend** | **Oui** : Firebase (Auth, Firestore, Storage) en intégration profonde, Supabase, API REST, GraphQL. |
| **Mécanisme de connexion** | Connexion d'un **projet Firebase ou Supabase**. FlutterFlow lit les collections et les tables, interrogées par des *Backend Queries* attachées aux widgets. Les API externes sont décrites dans le panneau *API Calls* (test de la réponse et génération de types). |
| **Base de données intégrée** | **Non** : FlutterFlow s'appuie sur **Firestore** (NoSQL) ou **Supabase** (PostgreSQL), qui appartiennent à l'utilisateur. Une base **SQLite** locale est disponible pour le hors-ligne. |
| **Création de la base dans l'outil** | **Partiel** : oui pour Firestore (collections, champs, règles de sécurité générées). Pour Supabase, le schéma se crée dans Supabase. |
| **Authentification et rôles** | **Oui** via Firebase Auth ou Supabase Auth. |
| **Génération par IA** | **Oui** : génération de pages et de composants par prompt, **DreamFlow** (application Flutter complète), assistant de code. |
| **Modification après IA** | **Oui** : pages générées sous forme de widgets natifs, modifiables visuellement **et** en code. |
| **Génération à partir d'images** | **Partiel** : import de thèmes Figma et outils tiers de conversion Figma vers FlutterFlow. |
| **Environnements** | **Oui** : *Dev Environments* (variables et **projets Firebase ou Supabase distincts** pour le développement et la production), modes test et exécution, exécution locale. |
| **Hébergement** | Web hébergé par FlutterFlow ou exporté. Mobile : **publication sur l'App Store et Google Play** depuis l'outil. Backend chez Firebase ou Supabase. |
| **Collaboration** | **Oui** : édition en temps réel (plans Teams). |
| **Versioning** | **Oui** : branches et fusion, envoi vers GitHub, instantanés de projet. |
| **Export du code** | **Oui** : **code source Flutter/Dart lisible**, téléchargeable ou envoyé sur GitHub, compilable sans FlutterFlow. |
| **Export du backend** | **Partiel** : les Cloud Functions et règles Firebase générées font partie du projet. Le backend appartient déjà à l'utilisateur. |
| **Dépendance au fournisseur** | **Faible** grâce à l'export. Le retour dans FlutterFlow après modification manuelle du code est en revanche difficile. |
| **Open source** | Non (Flutter est open source, licence BSD). |
| **Technologies** | Éditeur **écrit en Flutter (Flutter Web)**, génération de **Dart / Flutter**. |
| **Architecture produite** | **Client natif Flutter + BaaS** (Firebase ou Supabase) : architecture serverless. |
| **Web / mobile** | **Les deux, et l'ordinateur** (iOS, Android, Web, macOS, Windows) à partir d'un seul code source. |
| **Bilan** | **Points forts** : code natif exportable, qualité mobile, IA. **Limites** : SEO web inexistant, apprentissage de la logique Flutter, dépendance à Firebase ou Supabase, code exporté parfois verbeux. |

### 4.16 Draftbit (fiche condensée)

**Type** : plateforme de création d'applications **React Native / Expo**.

| Critère | Analyse |
|---|---|
| Évolution | Historiquement un **builder visuel** générant du React Native. Entre 2025 et 2026, la plateforme s'est réorientée vers un **environnement de développement piloté par des agents IA** (Claude Code, OpenAI Codex). |
| Export | **Oui** : code **React Native + Expo + TypeScript** téléchargeable (plan Standard et supérieurs), synchronisation GitHub (plan Pro et supérieurs). |
| Cible | Applications natives iOS / Android. |
| Bilan | Illustre la convergence des builders visuels vers les agents IA. La structure du code généré par agents est moins prévisible que celle de l'ancien builder visuel déterministe. |

---

## FAMILLE F6 — GÉNÉRATEURS D'APPLICATIONS PAR IA

### 4.17 Lovable

**Éditeur** : Lovable (Stockholm, 2023, anciennement *GPT Engineer*). **Type** : générateur d'applications par IA : l'application est décrite par dialogue et l'IA écrit le code.
**Public** : fondateurs non techniques, designers, chefs de produit, développeurs. **Cas d'usage** : MVP, SaaS, pages d'atterrissage, outils internes.

| Critère | Analyse |
|---|---|
| **Éditeur visuel / arbre** | **Partiel.** L'interface est du **code React**, sans éditeur visuel classique. Le mode **Visual Edits** permet de sélectionner un élément dans l'aperçu pour modifier son texte, sa couleur, ses marges ou sa taille. Il n'existe pas d'arbre de composants comparable à celui de Bubble. |
| **Glisser-déposer** | **Non** : construction par prompt. |
| **Système de pages** | **Oui** : pages définies comme **routes** du code (React Router, ou TanStack Start pour les nouveaux projets), créées par prompt. |
| **Groupes et conteneurs** | **Partiel** : pas de groupe visuel. Les regroupements sont des composants React (*Card*, *Dialog*, *Tabs* de la bibliothèque **shadcn/ui**). |
| **Responsive** | **Oui** : classes **Tailwind CSS** (`sm:`, `md:`, `lg:`) générées automatiquement. |
| **Composants réutilisables** | **Oui** : composants React et bibliothèque shadcn/ui. |
| **Type de rendu** | **SPA React + Vite jusqu'en mai 2026.** Depuis le 13 mai 2026, les nouveaux projets utilisent **TanStack Start avec SSR**. Une migration des anciens projets est proposée depuis juillet 2026. |
| **SEO** | **Bon depuis 2026** : SSR pour les nouveaux projets, **pré-rendu à la demande** pour les robots (moteurs de recherche et assistants IA) sur les anciens projets, **audit SEO intégré** depuis mai 2026 (sitemap, métadonnées, balises canoniques, Lighthouse, Google Search Console). |
| **Workflows frontend** | **Partiel** : pas d'éditeur de workflows. La logique est écrite en code par l'IA (gestionnaires d'événements React). |
| **Workflows backend** | **Partiel** : **Edge Functions Supabase** (Deno / TypeScript), tâches planifiées (`pg_cron`), webhooks, générés en code. |
| **Unités de consommation** | Facturation par **crédits de messages IA**. L'usage de Lovable Cloud est facturé à la consommation. |
| **Code personnalisé** | **Oui, intégralement** : tout est du code TypeScript, modifiable dans Lovable ou dans un environnement de développement local via GitHub. |
| **Connexion backend** | **Oui** : **Lovable Cloud** (projet Supabase provisionné automatiquement : base, authentification, stockage, fonctions) ou projet Supabase existant. Autres API via des Edge Functions, avec des **secrets** conservés côté serveur. |
| **Mécanisme de connexion** | Par prompt (« ajouter une table commandes et un formulaire »). L'IA **écrit la migration SQL**, les **politiques RLS** et le **code client** (`supabase.from('commandes').select()`). |
| **Base de données intégrée** | **Oui** : **PostgreSQL** (Lovable Cloud / Supabase). |
| **Création de la base dans l'outil** | **Oui, par l'IA** (migrations SQL), avec visualisation des tables. |
| **Authentification et rôles** | **Oui** : Supabase Auth, rôles et politiques RLS générés. |
| **Génération par IA** | **Oui, principe de l'outil** : génération d'une application complète (frontend et backend) par un agent qui planifie, écrit et corrige. |
| **Modification après IA** | **Oui, de trois manières** : nouveau prompt, **Visual Edits**, ou modification du code dans l'éditeur ou via GitHub. |
| **Génération à partir d'images** | **Oui** : captures d'écran ou maquettes jointes au prompt, reproduites par un modèle multimodal. Import Figma via l'intégration Builder.io. La fidélité est variable : il s'agit d'une **reproduction approximative**, sans extraction mesurée des positions et dimensions. |
| **Environnements** | **Partiel** : aperçu (version de travail) et version publiée, branches GitHub. Pas de mécanisme formalisé de bases séparées entre développement et production. |
| **Hébergement** | Hébergement Lovable (sous-domaine ou domaine personnalisé), ou tout hébergeur grâce au code (Vercel, Netlify, serveur propre). |
| **Collaboration** | **Oui** : espaces de travail partagés et **synchronisation GitHub bidirectionnelle**. |
| **Versioning** | **Oui** : historique complet des versions et Git. |
| **Export du code** | **Oui** : code source **React + TypeScript + Tailwind + shadcn/ui** (Vite ou TanStack Start). La pile technologique est **imposée** : ni Angular ni Vue. |
| **Export du backend** | **Oui** : les migrations SQL et les Edge Functions sont versionnées dans le dépôt (`supabase/`). |
| **Dépendance au fournisseur** | **Faible** (code standard, Supabase open source). |
| **Open source** | Non (le code généré appartient à l'utilisateur). |
| **Technologies** | Plateforme propriétaire orchestrant des **LLM** (Claude, GPT…), avec un environnement de compilation et d'aperçu côté serveur. |
| **Architecture produite** | **Frontend React (SPA ou SSR) + Supabase** (PostgreSQL, RLS, Edge Functions) : architecture serverless / JAMstack. |
| **Web / mobile** | Web responsive. Pas d'application native directe. |
| **Bilan** | **Points forts** : rapidité, code réel, GitHub, Supabase, édition visuelle après génération, SEO amélioré en 2026. **Limites** : qualité et architecture du code variables quand le projet grandit, boucles de correction consommatrices de crédits, configuration de sécurité à contrôler (RLS), pile imposée. |

### 4.18 Bolt.new

**Éditeur** : StackBlitz (San Francisco), lancé en octobre 2024. **Type** : générateur d'applications par IA exécutant **tout l'environnement de développement dans le navigateur** grâce aux **WebContainers** (Node.js compilé en WebAssembly).
**Public** : développeurs et non-développeurs. **Cas d'usage** : prototypes, applications web full-stack, applications mobiles (Expo).

| Critère | Analyse |
|---|---|
| **Éditeur visuel / arbre** | **Non** : arborescence de fichiers et éditeur de code à côté de l'aperçu. La sélection d'éléments dans l'aperçu permet de cibler un prompt. |
| **Glisser-déposer** | **Non** : construction par prompt. |
| **Système de pages** | **Oui**, selon le framework (routes Next.js, React Router, Astro…). |
| **Groupes et conteneurs** | **Partiel** : composants du framework. |
| **Responsive** | **Oui** (Tailwind généralement). |
| **Composants réutilisables** | **Oui** (composants du framework). |
| **Type de rendu** | **Selon le framework** : React + Vite (SPA), Next.js, Nuxt, SvelteKit, Astro (SSR / SSG). |
| **SEO** | **Variable** : excellent avec Next.js ou Astro, limité avec une SPA React + Vite. |
| **Workflows frontend / backend** | **Partiel** : pas de workflows visuels. La logique est codée (routes d'API, fonctions serveur, Edge Functions). |
| **Unités de consommation** | Facturation par **tokens IA**. Bolt Cloud est facturé à l'usage. |
| **Code personnalisé** | **Oui, intégralement.** |
| **Connexion backend** | **Oui** : **Bolt Cloud** (base de données, hébergement, domaines, statistiques), **Supabase** (avec édition du schéma), Netlify, Stripe, toute API par code. |
| **Mécanisme de connexion** | Par prompt. L'IA écrit le client, le schéma (par exemple PostgreSQL et l'ORM Prisma) et les appels. |
| **Base de données intégrée** | **Oui** : PostgreSQL (Bolt Cloud ou Supabase). |
| **Création de la base dans l'outil** | **Oui, par l'IA** (schémas et migrations). |
| **Authentification et rôles** | **Oui**, générés en code (Supabase Auth ou bibliothèques d'authentification). |
| **Génération par IA** | **Oui, principe de l'outil** : un agent installe les paquets npm, lance le serveur, lit les erreurs et les corrige. |
| **Modification après IA** | **Oui** : par prompt, directement dans le code, ou via GitHub. L'édition visuelle est limitée. |
| **Génération à partir d'images** | **Oui** : images jointes au prompt et **import Figma**. Il s'agit d'une reproduction approximative par LLM. |
| **Environnements** | **Partiel** : aperçu dans le WebContainer et déploiement (Bolt Cloud ou Netlify). Les environnements aux données séparées sont à construire (par exemple deux projets Supabase). |
| **Hébergement** | Bolt Cloud, Netlify, ou tout hébergeur après téléchargement. |
| **Collaboration** | **Partielle** (plans Teams, GitHub). |
| **Versioning** | **Oui** : historique et restauration, intégration GitHub. |
| **Export du code** | **Oui** : code source complet. **Framework au choix** : React, Vue/Nuxt, Svelte, Angular, Astro, Next.js, Remix. C'est la plateforme la plus flexible sur ce point. |
| **Export du backend** | **Oui** (code serveur inclus dans le projet). |
| **Dépendance au fournisseur** | **Très faible.** |
| **Open source** | **Partiel** : le cœur historique *bolt.new* est publié sous **licence MIT**, et la communauté maintient **bolt.diy**, compatible avec tout fournisseur de LLM (OpenAI, Anthropic, modèles locaux via Ollama). Le service commercial et Bolt Cloud sont propriétaires. |
| **Technologies** | **WebContainers** (Node.js en WebAssembly), interface React / Remix, orchestration de LLM. |
| **Architecture produite** | Selon le framework : SPA + BaaS (JAMstack) ou application full-stack monolithique (Next.js, Remix). |
| **Web / mobile** | **Les deux** : web et **mobile natif via Expo (React Native)**. |
| **Bilan** | **Points forts** : liberté de framework, code réel, base open source, environnement complet dans le navigateur. **Limites** : consommation de tokens sur les grands projets, qualité de code variable, édition visuelle réduite. |

### 4.19 v0 (fiche condensée)

**Éditeur** : Vercel. **Type** : générateur d'applications par IA orienté **Next.js / React**.

| Critère | Analyse |
|---|---|
| Sortie | **React / Next.js + Tailwind + shadcn/ui**. |
| Rendu / SEO | Next.js : **SSR / SSG**, bon SEO. |
| Édition | Agent IA (planification, recherche web, inspection du site, autocorrection), **Design Mode** (réglages visuels avec aperçu en direct), éditeur de code intégré. |
| Images / maquettes | Captures d'écran acceptées. Import Figma sur les plans payants. |
| Données | Neon (PostgreSQL), Supabase, Upstash Redis provisionnés en un clic. Connecteurs Snowflake et AWS (février 2026). |
| Versioning | **Workflows Git complets** (branches, pull requests, déploiement à la fusion) depuis février 2026. |
| Hébergement | Vercel, ou tout hébergeur. |
| Export | **Oui** (code source complet). |
| Tarification | Par tokens (depuis février 2026). |
| Bilan | Qualité des interfaces React générées, intégration profonde à l'écosystème Vercel. Pile technologique imposée. |

### 4.20 Replit Agent (fiche condensée)

**Éditeur** : Replit. **Type** : environnement de développement en ligne doté d'un agent IA full-stack.

| Critère | Analyse |
|---|---|
| Sortie | **Langages et frameworks multiples** : React, Next.js, Flask, Django et des dizaines d'autres. |
| Données | Base de données intégrée (par défaut pour les nouvelles applications), stockage clé-valeur, stockage d'objets compatible S3. |
| Mobile | Applications **React Native / Expo** avec backend complet (début 2026). |
| Déploiement | Hébergement et déploiement intégrés. |
| Sécurité | Analyse automatique des fichiers modifiés (Semgrep), régénération des identifiants des bases de production. |
| Export | **Oui** (code source, Git). |
| Bilan | L'un des rares générateurs par IA à ne pas imposer de pile technologique, backends Python compris. |

---

## FAMILLE F7 — LOW-CODE D'ENTREPRISE

### 4.21 OutSystems (fiche condensée)

**Éditeur** : OutSystems (Portugal, 2001). **Type** : low-code d'entreprise, leader des classements Gartner.

| Critère | Analyse |
|---|---|
| Principe | **Modélisation visuelle complète** dans *Service Studio* : interfaces, logique (*Actions*, organigrammes visuels), données (*Entities*), intégrations. |
| Générations | **OutSystems 11** (plateforme historique, génération de code **.NET / C#** et d'interfaces web React) et **ODC** (*OutSystems Developer Cloud*, plateforme cloud-native conteneurisée). |
| Code personnalisé | Extensions en **C#**, JavaScript côté client. |
| IA | **Mentor** : agents de développement qui génèrent des applications à partir d'exigences. Nouvelle génération d'agents en juin 2026, extension aux applications agentiques et aux bibliothèques. |
| Cycle de vie | Gestion complète des environnements (développement, test, production), déploiement et gouvernance d'entreprise. |
| Export | OutSystems 11 propose une procédure de **détachement** permettant de récupérer le code .NET généré. Ce code est volumineux et peu destiné à une maintenance manuelle. |
| Cible | Web et mobile (applications natives empaquetées). |
| Bilan | Puissance et gouvernance pour les grandes organisations. Coût élevé et dépendance forte. |

### 4.22 Mendix (fiche condensée)

**Éditeur** : Mendix (Siemens). **Type** : low-code d'entreprise **dirigé par les modèles**.

| Critère | Analyse |
|---|---|
| Principe | *Studio Pro* : **modèle de domaine** (entités, associations), **pages**, **microflows** (logique côté serveur) et **nanoflows** (logique côté client). Cette séparation illustre clairement la distinction entre workflows backend et frontend. |
| Technologies | Moteur d'exécution **Java** (Java 25 par défaut dans les versions récentes), client web en transition de Dojo vers **React**. |
| Code personnalisé | *Java actions*, *JavaScript actions*, *pluggable widgets* (React). |
| IA | **Maia** : génération et modification de pages, d'expressions, de contraintes XPath, de documents de sécurité. |
| Hébergement | Mendix Cloud, Kubernetes, serveurs internes. |
| Mobile | Applications natives (React Native). |
| Export | **Non** : le modèle est interprété par le moteur Mendix. |
| Bilan | Architecture dirigée par les modèles de référence. Dépendance forte et coût d'entreprise. |

### 4.23 Microsoft Power Apps (fiche condensée)

**Éditeur** : Microsoft. **Type** : low-code intégré à la *Power Platform*.

| Critère | Analyse |
|---|---|
| Types d'applications | **Canvas apps** (placement libre, formules **Power Fx** proches d'Excel), **model-driven apps** (générées à partir du modèle de données **Dataverse**), **Code Apps** (applications en code React hébergées dans la plateforme), **Power Pages** (sites publics). |
| IA | **Power Apps Vibe** (préversion publique en avril 2026) : génération par langage naturel d'un plan, d'un **modèle de données Dataverse** et d'une **application React / TypeScript** fonctionnelle. Copilot dans les éditeurs. |
| Logique | **Power Automate** (workflows côté serveur), formules Power Fx côté client. |
| Données | **Dataverse** (base relationnelle gérée), plus de 1 000 connecteurs. |
| Cycle de vie | **Environnements** (développement, test, production) et **solutions** pour l'ALM, parmi les plus aboutis du marché. |
| Mobile | Lecteur Power Apps sur iOS et Android. |
| Export | Non pour les canvas apps et les model-driven apps. Les Code Apps reposent sur du code React. |
| Bilan | Intégration à l'écosystème Microsoft 365 et gouvernance. Licences par utilisateur et dépendance à Microsoft. |

---

## FAMILLE F8 — BACKENDS VISUELS ET GÉNÉRATEURS DE BACKEND

### 4.24 Xano (fiche condensée)

| Critère | Analyse |
|---|---|
| Type | **Backend visuel** (BaaS no-code) : base PostgreSQL, constructeur d'API par **piles de fonctions** visuelles, authentification, tâches planifiées. |
| Trois modes de construction | Visuel, code (**XanoScript**), IA (génération de logique d'API en langage naturel, agents, serveurs MCP en 2026). |
| Usage | Backend de référence pour WeWeb, FlutterFlow, Adalo et des frontends codés. |
| Export | **Non** : XanoScript et les piles de fonctions ne se traduisent pas en Node.js, Python ou autre framework. Versionnement de la logique via Git et XanoScript. |
| Hébergement | Cloud Xano. Auto-hébergement et cloud privé réservés aux offres Custom / Enterprise. |
| Bilan | Démontre la demande d'un **backend visuel**, mais reproduit la dépendance au fournisseur côté serveur. |

### 4.25 Supabase (fiche condensée)

| Critère | Analyse |
|---|---|
| Type | **BaaS open source** (licence Apache 2.0) fondé sur **PostgreSQL**. |
| Fonctions | Base PostgreSQL complète, **API REST générées automatiquement** (PostgREST), GraphQL, authentification, stockage, **Edge Functions** (Deno), temps réel, politiques **RLS**. Éditeur visuel de tables et assistant SQL par IA (*Supabase Studio*). |
| Rôle dans l'écosystème | Backend par défaut de Lovable et Bolt, intégration native dans WeWeb, FlutterFlow et v0. |
| Hébergement | Cloud Supabase ou auto-hébergement (Docker). |
| Bilan | **Standard de fait** du backend des applications générées. Pas de dépendance au fournisseur grâce à PostgreSQL et à l'open source. |

### 4.26 Directus et Strapi (fiche condensée)

| Critère | Directus | Strapi |
|---|---|---|
| Type | Plateforme de données / CMS *headless* | CMS *headless* |
| Principe | **Base de données d'abord** : introspection d'une base SQL existante, enveloppée par une interface d'administration et des API, sans modification du schéma. | **Modèle d'abord** : types de contenu définis dans l'interface (*Content-Type Builder*) ou en code. Strapi gère le schéma. |
| API | **REST et GraphQL générées automatiquement** pour chaque collection, avec permissions par champ. | REST et GraphQL générées et personnalisables. |
| Logique | *Flows* (automatisations). | Contrôleurs et services personnalisables (code Node.js). |
| Technologies | Node.js, interface Vue.js. | Node.js, interface React. |
| Licence | **Source-available** (BSL), gratuite en dessous d'un seuil de chiffre d'affaires. | **MIT** (édition communautaire). |
| Intérêt | Générer instantanément un backend d'API à partir d'un modèle de données. | Idem, avec un code serveur Node.js modifiable. |

### 4.27 Amplication (fiche condensée)

| Critère | Analyse |
|---|---|
| Type | **Générateur de backend open source** : modélisation visuelle des entités, puis génération de services complets. |
| Sortie | Code **Node.js (NestJS + Prisma)** et **.NET (C# / ASP.NET)** : API REST et GraphQL, modèles de données typés, authentification, migrations. Code envoyé dans un dépôt GitHub. |
| Particularité | *Blueprints* : modèles de génération encodant les standards d'architecture d'une organisation. |
| Statut 2026 | **Projet en maintenance** : l'équipe s'est réorientée vers *Overcut* (agents IA pour le cycle de développement). Le code reste disponible et auto-hébergeable. |
| Intérêt | **Preuve de faisabilité** de la génération visuelle d'un backend exportable. Son arrêt montre aussi la **difficulté économique** d'un générateur de backend seul. |

### 4.28 JHipster (fiche condensée)

| Critère | Analyse |
|---|---|
| Type | **Générateur open source** (Apache 2.0) d'applications complètes **dirigé par un modèle**. |
| Modèle | **JDL** (*JHipster Domain Language*) : description textuelle des entités, relations, pagination, DTO, options de déploiement. **JDL-Studio** en propose une édition et une visualisation graphiques. |
| Sortie backend | **Spring Boot** (version 4 depuis JHipster 9.0, mars 2026, Java 21 minimum), JPA/Hibernate, sécurité (JWT, OAuth2), tests, API documentée en OpenAPI. |
| Sortie frontend | **Angular 21, React 19 ou Vue** (au choix), avec écrans CRUD générés pour chaque entité. |
| Architecture | **Monolithe** ou **microservices** (passerelle, découverte de services), déploiement Docker et Kubernetes, compilation native GraalVM. |
| Extensibilité | **Blueprints** : extensions qui remplacent ou complètent les générateurs (autres langages et frameworks backend). |
| Limite | Pas d'éditeur visuel d'interface : seuls les écrans CRUD standards sont générés, à personnaliser ensuite en code. |
| Intérêt | **Référence directe** pour la question de l'export **Spring Boot + Angular / React / Vue** à partir d'un modèle unique. |

---

## FAMILLE F9 — DESIGN-TO-CODE

### 4.29 Builder.io : Visual Copilot et Mitosis (fiche condensée)

| Critère | Analyse |
|---|---|
| Visual Copilot | Conversion de maquettes Figma en code **React, Vue, Angular, Svelte, Qwik, Solid** et mobile, par un modèle entraîné sur plus de 2 millions d'exemples, complété par un LLM. |
| Mitosis | **Compilateur open source (MIT)** : un composant écrit une fois dans une syntaxe proche de JSX est **compilé vers React, Vue, Angular, Svelte, Qwik, Solid**, etc. Il repose sur une **représentation intermédiaire JSON** des composants. |
| Éditeur | CMS visuel *headless* permettant d'éditer visuellement des pages d'un site codé. |
| Intérêt | Mitosis démontre la **faisabilité technique d'un export multi-frameworks** à partir d'une représentation intermédiaire unique. |

### 4.30 Locofy, Anima, Uizard, Google Stitch (fiche condensée)

| Outil | Entrée | Sortie | Remarques |
|---|---|---|---|
| **Locofy** | Figma, Adobe XD | Projet complet React, Next.js, React Native, HTML/CSS, Vue, Angular, Flutter | Modèles IA propriétaires. Conversion d'un projet entier en un clic (mode *Lightning*). |
| **Anima** | Figma | React, Vue, HTML, Tailwind | Code orienté composants, sans positionnement absolu. |
| **Uizard** | Croquis à la main (photo), capture d'écran, prompt | Maquette éditable, export de composants React/CSS | *Wireframe Scanner* fondé sur la vision par ordinateur. La conversion de captures complexes reste fragile. |
| **Google Stitch** (ex-Galileo AI) | Prompt, croquis, image | Designs multi-écrans et code, export Figma | Google Labs, gratuit avec limites. Mise à jour de mars 2026 : multi-écrans, canvas infini, entrée vocale. |

---

# 5. ANALYSES TRANSVERSALES ET TABLEAUX DE SYNTHÈSE PAR CATÉGORIE

## 5.1 Construction de l'interface (C1)

### Tableau 5.1-a — Plateformes principales

| Plateforme | Arbre des composants | Glisser-déposer | Pages | Groupes / conteneurs | Responsive | Réutilisables |
|---|---|---|---|---|---|---|
| **Bubble** | Oui (Element Tree) | Oui (canvas libre) | Oui, plus le mode page unique | Group, Repeating Group, Popup, Floating Group | Oui : Flexbox et conditions, réputé difficile | Reusable Elements |
| **WeWeb** | Oui (Layout) | Oui | Oui, routes dynamiques | Container, Section, Modal, Collection list | Oui : points de rupture, Grid et Flex, le plus fin | Composants, bibliothèques, Vue |
| **Retool** | Oui (Explorer) | Oui (grille) | Oui | Container, Tabs, Modal, Drawer, List View | Partiel : disposition mobile distincte | Modules, composants React |
| **Appsmith** | Oui (Entity Explorer) | Oui (grille) | Oui | Container, Tabs, Form, Modal, List | Partiel : ordinateur d'abord | Custom Widgets, packages |
| **Budibase** | Oui | Oui | Oui, accès par rôle | Container, Repeater, Blocks | Oui, automatique | Partiel : Blocks, plugins |
| **ToolJet** | Oui | Oui | Oui | Container, Tabs, Modal, Listview, Kanban | Partiel : deux dispositions | Modules |
| **Glide** | Partiel (liste verticale) | Partiel (réordonnancement) | Oui (écrans, onglets) | Partiel : Containers, Collections | Oui, automatique et peu paramétrable | Partiel |
| **FlutterFlow** | Oui (Widget Tree = code) | Oui | Oui, avec paramètres | Column, Row, Stack, ListView… | Oui, points de rupture | Components, Libraries |
| **Lovable** | Partiel (code + Visual Edits) | Non (prompt) | Oui (routes en code) | Partiel : composants React | Oui (Tailwind) | Composants React |
| **Bolt.new** | Non (fichiers) | Non (prompt) | Oui (routes en code) | Partiel : composants | Oui (Tailwind) | Composants |

### Tableau 5.1-b — Plateformes complémentaires

| Plateforme | Mode de construction de l'interface | Responsive | Réutilisables |
|---|---|---|---|
| Adalo | Canvas d'écrans, glisser-déposer | Mobile natif et web | Composants de la marketplace |
| Softr | Blocs préfabriqués | Automatique | Blocs |
| Webflow | Canvas, Navigator, contrôle CSS complet | Points de rupture, Flex et Grid | Composants avec propriétés |
| Framer | Canvas de design, variantes | Points de rupture | Composants, variantes |
| Plasmic | Canvas, arbre, composants React enregistrés | Oui | Composants visuels et composants de code |
| Lowcoder | Glisser-déposer sur grille | Partiel | Modules |
| NocoBase | Blocs configurés sur des pages, guidés par le modèle de données | Oui | Blocs, plugins |
| v0 / Replit | Prompt (v0 : Design Mode) | Oui (Tailwind) | Composants |
| OutSystems / Mendix | Éditeur visuel de pages et de widgets | Oui | Blocs / snippets, widgets |
| Power Apps | Canvas (placement libre) ou génération à partir du modèle | Partiel | Composants canvas |
| JHipster | Aucun (écrans CRUD générés) | Bootstrap | Composants du framework cible |

**Analyse.** Deux paradigmes coexistent :
1. **Les builders visuels** manipulent directement un **arbre de composants** avec un retour visuel immédiat. C'est le cas de la majorité des plateformes no-code, low-code et d'entreprise.
2. **Les générateurs par IA** (Lovable, Bolt.new, v0, Replit) n'ont **pas d'arbre visuel**. L'interface n'existe qu'en code et se modifie par prompt, avec quelques outils d'édition visuelle ponctuelle (Visual Edits, Design Mode).

Aucune plateforme étudiée ne combine un **arbre de composants visuel complet** et une **sortie de code multi-frameworks maintenable** pour une application complète.

## 5.2 Rendu et référencement (C2)

| Plateforme | Type de rendu | SEO | Commentaire |
|---|---|---|---|
| **Bubble** | Hybride (pages séparées, rendu JS) | Partiel | Réglages et sitemap, pages lourdes |
| **WeWeb** | SPA Vue (CSR) | Partiel | Pré-rendu, pas de SSR en 2026 |
| **Retool, Appsmith, Budibase, ToolJet, Lowcoder, NocoBase** | SPA | N/A | Applications internes |
| **Glide, Softr** | PWA / pages générées | Faible (Glide), partiel (Softr) | Applications d'équipe et portails |
| **FlutterFlow** | Flutter Web (canvas) | Non | Absence de HTML sémantique |
| **Lovable** | SSR depuis mai 2026 (SPA auparavant) | Bon | Audit SEO intégré |
| **Bolt.new / Replit** | Selon le framework | Variable | Bon avec Next.js ou Astro |
| **v0** | Next.js (SSR/SSG) | Bon | — |
| **Webflow** | HTML statique | **Excellent** | Référence du marché |
| **Framer** | Pré-rendu statique | **Très bon** | PageSpeed > 90 par défaut |
| **Plasmic** | Next.js (SSR / SSG / ISR) | Bon | — |
| **Mendix, OutSystems, Power Apps** | SPA | N/A (Power Pages pour les sites publics) | Applications d'entreprise |

**Analyse.** Le besoin de référencement dépend du type d'application : il est **déterminant pour les sites publics** (vitrines, blogs, e-commerce, places de marché) et **sans objet pour les applications protégées par authentification**. La production de **HTML sémantique** (`<header>`, `<nav>`, `<main>`, `<button>`) bénéficie à la fois au référencement et à l'accessibilité. Les plateformes générant du code vers un framework à rendu serveur (Next.js, Nuxt, TanStack Start) offrent le meilleur compromis.

## 5.3 Logique applicative et extensibilité (C3)

| Plateforme | Workflows frontend | Workflows backend | Mode de facturation de la logique | Code personnalisé |
|---|---|---|---|---|
| **Bubble** | Oui (éditeur visuel) | Oui (API workflows, planifiés, déclencheurs base) | **Workload Units** | Partiel (plugins, HTML) |
| **WeWeb** | Oui | Oui (depuis 2026) | Sièges + hébergement | Oui (JS, composants Vue) |
| **Retool** | Oui (événements) | Oui (Retool Workflows) | Utilisateurs + exécutions | Oui (JS, SQL, Python, React) |
| **Appsmith** | Oui | Partiel (payant) | Utilisateurs | Oui (JS Objects) |
| **Budibase** | Oui (actions) | Oui (Automations) | Utilisateurs | Oui (JS, plugins Svelte) |
| **ToolJet** | Oui | Oui (ToolJet Workflows) | Utilisateurs | Oui (JS, Python) |
| **Glide** | Oui (actions) | Oui (Workflows) | **Updates** | Partiel (colonnes JS) |
| **FlutterFlow** | Oui (Action Flow Editor) | Partiel (Cloud Functions) | Abonnement | Oui (Dart) |
| **Lovable** | Code | Code (Edge Functions) | Crédits IA | Oui (TypeScript) |
| **Bolt.new** | Code | Code | Tokens IA | Oui |
| **Mendix** | **Nanoflows** | **Microflows** | Licence | Java, JavaScript |
| **OutSystems** | Client Actions | Server Actions, *timers* | Licence | C#, JavaScript |
| **Power Apps** | Power Fx | **Power Automate** | Licence par utilisateur | Code Apps (React) |
| **Xano** | N/A | Oui (piles de fonctions) | Abonnement | XanoScript |
| **Softr** | Actions | Workflows | Abonnement | HTML / JS |

### Situations où l'éditeur visuel ne suffit pas

Trois situations récurrentes imposent l'écriture de code, même sur les plateformes visuelles les plus complètes.

**Situation 1 : calcul métier complexe.** Une page de devis doit calculer en temps réel un total intégrant des remises par paliers (−5 % au-delà de 10 articles, −10 % au-delà de 50), une TVA propre à chaque catégorie de produit, un arrondi et un formatage monétaire local. En blocs visuels, cela demande des dizaines de conditions imbriquées et difficiles à maintenir. En JavaScript (formule WeWeb, Retool ou Appsmith), quelques lignes suffisent :

```javascript
const lignes = panier.value; // [{prix: 2500, qte: 12, tva: 0.1925}, ...]
const qteTotale = lignes.reduce((s, l) => s + l.qte, 0);
const remise = qteTotale > 50 ? 0.10 : qteTotale > 10 ? 0.05 : 0;

const totalTTC = lignes.reduce((s, l) => s + l.prix * l.qte * (1 - remise) * (1 + l.tva), 0);

return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' })
  .format(Math.round(totalTTC / 5) * 5);
```

**Situation 2 : fonctionnalité du navigateur ou bibliothèque absente.** Une application de livraison doit recueillir la signature du destinataire à l'écran, enregistrer sa position GPS et copier un code de suivi dans le presse-papier. Aucun composant natif ne couvre ce besoin. Il faut donc un **composant personnalisé** intégrant une bibliothèque de signature (Custom Component React chez Retool, composant Vue chez WeWeb, Custom Widget chez Appsmith, plugin chez Bubble) et une **action JavaScript** qui utilise les API du navigateur :

```javascript
const position = await new Promise((ok, ko) =>
  navigator.geolocation.getCurrentPosition(ok, ko, { enableHighAccuracy: true })
);
await navigator.clipboard.writeText(codeSuivi);
return { lat: position.coords.latitude, lng: position.coords.longitude };
```

**Situation 3 : validation spécifique.** Vérifier un numéro de téléphone selon un format national, ou un IBAN avec sa clé de contrôle (calcul modulo 97), suppose une expression régulière ou un algorithme.

**Analyse.** Toutes les plateformes matures prévoient une **issue vers le code** (*escape hatch*) : formules JavaScript, composants personnalisés, plugins, actions serveur. La qualité de cette issue (langage standard, accès aux bibliothèques, débogage) distingue les outils destinés aux prototypes de ceux destinés à la production.

## 5.4 Données et backend (C4)

| Plateforme | Backend intégré | Base intégrée (type) | Création de la base dans l'outil | Connexion externe | Export du backend |
|---|---|---|---|---|---|
| **Bubble** | Oui | Propriétaire (PostgreSQL interne, sans accès SQL) | Oui | API Connector, SQL par plugin | Non (CSV) |
| **WeWeb** | Oui (2026) | PostgreSQL (WeWeb Tables, 2026) | Oui | Supabase, Xano, Airtable, Firebase, REST, GraphQL | Non documenté |
| **Retool** | Partiel (intermédiaire + Workflows) | PostgreSQL (Retool DB) | Oui | Plus de 50 connecteurs | Non |
| **Appsmith** | Partiel (intermédiaire) | Non | Non | Plus de 25 connecteurs | Non |
| **Budibase** | Oui | **CouchDB** (NoSQL) | Oui | SQL, NoSQL, REST | Non |
| **ToolJet** | Partiel (intermédiaire + Workflows) | PostgreSQL (PostgREST) | Oui | Plus de 80 sources | Non |
| **Glide** | Oui | Glide Tables / Big Tables | Oui | Sheets, Excel, Airtable, SQL | Non |
| **FlutterFlow** | Non (BaaS) | Non (Firestore / Supabase, SQLite local) | Partiel (Firestore) | Firebase, Supabase, REST | Partiel (Cloud Functions) |
| **Lovable** | Oui (Lovable Cloud) | PostgreSQL | Oui (par l'IA) | Supabase, API en code | Oui (migrations, fonctions) |
| **Bolt.new** | Oui (Bolt Cloud) | PostgreSQL | Oui (par l'IA) | Toutes, en code | Oui |
| **Adalo** | Oui | Relationnelle propriétaire | Oui | REST, Xano | Non |
| **Softr** | Oui | Softr Databases (relationnelle) | Oui | Airtable, Sheets, Notion, HubSpot, SQL | Non |
| **Mendix** | Oui | Relationnelle (modèle de domaine, PostgreSQL / autres SGBD) | Oui | REST, OData, SOAP | Non |
| **OutSystems** | Oui | Relationnelle (SQL Server / autres) | Oui | REST, SOAP, SAP | Partiel (détachement O11) |
| **Power Apps** | Oui | **Dataverse** | Oui | Plus de 1 000 connecteurs | Non |
| **Xano** | **Oui (spécialité)** | PostgreSQL | Oui | — | **Non** |
| **Supabase** | **Oui (spécialité)** | PostgreSQL | Oui | — | **Oui** (PostgreSQL standard, open source) |
| **Directus / Strapi** | **Oui** | SQL | Oui | — | Partiel (Strapi : code Node.js modifiable) |
| **Amplication** | **Généré** | PostgreSQL, MySQL, MongoDB (Prisma) | Oui (modèle) | — | **Oui** (NestJS, .NET) |
| **JHipster** | **Généré** | SQL (JPA) ou NoSQL | Oui (JDL) | — | **Oui** (Spring Boot) |

**Trois modèles de connexion aux données ont été observés :**
1. **Base intégrée propriétaire** (Bubble, Glide, Adalo, Softr) : simplicité maximale, dépendance maximale.
2. **Serveur intermédiaire de requêtes** (Retool, Appsmith, ToolJet, Budibase, Lowcoder) : les requêtes SQL ou REST sont exécutées **par le serveur de la plateforme**, qui conserve les identifiants, et les résultats sont **liés** aux composants par des expressions `{{ requete.data }}`.
3. **Frontend et BaaS** (WeWeb, FlutterFlow, Lovable, Bolt.new, v0) : le client appelle directement les API d'un BaaS (Supabase, Firebase), dont la sécurité repose sur des règles appliquées par la base (RLS, *Security Rules*).

**Analyse de l'export du backend.** Seuls les **générateurs dirigés par les modèles** (JHipster, Amplication) et les **générateurs par IA** (Lovable, Bolt.new, Replit) produisent un backend sous forme de **code exportable**. Les backends visuels (Bubble, Xano, Mendix) restent des **moteurs propriétaires**. Aucune plateforme visuelle grand public n'exporte de backend dans un framework d'entreprise tel que Spring Boot.

## 5.5 Intelligence artificielle (C5)

| Plateforme | Génération d'interface par IA | Nature de la sortie | Modification après génération | Image / maquette en entrée |
|---|---|---|---|---|
| **Bubble** | Oui (application complète, agent) | Éléments visuels natifs | Oui, éditeur visuel complet | Oui (capture, export Figma) |
| **WeWeb** | Oui | Éléments natifs | Oui | Non documentée |
| **Retool** | Oui (AppGen, Assist) | Composants et requêtes natifs | Oui | Non documentée |
| **Appsmith** | Partiel (assistant) | Widgets, code | Oui | Non |
| **Budibase** | Partiel (tables, JS, agents) | Objets natifs | Oui | Non |
| **ToolJet** | Oui | Composants natifs | Oui | Non documentée |
| **Glide** | Partiel | Composants natifs | Oui | Non |
| **FlutterFlow** | Oui (pages, DreamFlow) | Widgets visuels **et** code Dart | Oui (visuel et code) | Partiel (thème Figma) |
| **Lovable** | Oui (application complète) | Code React | Prompt, Visual Edits, code | Oui (approximatif) |
| **Bolt.new** | Oui (application complète) | Code (framework au choix) | Prompt, code | Oui (approximatif), Figma |
| **v0** | Oui | Code Next.js | Prompt, Design Mode, code | Oui, Figma (payant) |
| **Replit Agent** | Oui | Code (multi-langages) | Prompt, code | Oui |
| **Softr** | Oui (AI Co-Builder) | Blocs natifs | Oui | Non documentée |
| **Adalo** | Oui (Ada) | Écrans natifs | Oui | Non documentée |
| **Webflow** | Oui (composants et applications de code) | Éléments natifs / code React | Oui | Non documentée |
| **Framer** | Oui (Wireframer, Workshop) | Calques natifs | Oui | Non documentée |
| **OutSystems** | Oui (Mentor) | Modèle visuel OutSystems | Oui | Non documentée |
| **Mendix** | Oui (Maia) | Modèle visuel Mendix | Oui | Non documentée |
| **Power Apps** | Oui (Vibe) | Code React + modèle Dataverse | Prompt, code | Non documentée |
| **Builder.io / Locofy / Anima** | Oui | Code multi-frameworks | Code | Figma (principalement) |
| **Uizard / Stitch** | Oui | Maquette éditable / code | Oui | Oui (croquis, captures) |

**Analyse.**
1. **Deux natures de sortie s'opposent.** Dans le premier groupe, l'IA produit des **objets visuels éditables** dans un format propriétaire non exportable (Bubble, WeWeb, Retool, Mendix, OutSystems). Dans le second, elle produit du **code** exportable mais **peu éditable visuellement** (Lovable, Bolt.new, v0, Replit). FlutterFlow est le seul à combiner les deux, pour une seule cible (Flutter).
2. **La génération porte presque toujours sur l'application entière** ou sur une page. L'assistance **ciblée sur un composant** (par exemple « connecter ce tableau à une API adaptée ») est rare. Elle existe dans les outils d'entreprise sous forme d'assistants de requêtes (Retool Assist, Appsmith AI), mais elle est limitée aux sources déjà configurées.
3. **L'IA s'impose comme critère de base** du marché en 2026 : toutes les plateformes étudiées, y compris celles d'entreprise, en ont intégré une forme.

## 5.6 Cycle de vie, équipe et hébergement (C6)

| Plateforme | Développement / production | Données séparées | Hébergement | Auto-hébergement | Collaboration | Versioning |
|---|---|---|---|---|---|---|
| **Bubble** | Oui (version-test / live) | Oui | Cloud Bubble | Non (dédié Enterprise) | Temps réel | Partiel (sauvegardes, branches) |
| **WeWeb** | Oui (éditeur / staging / production) | Partiel (variables) | Cloud ou export | Oui (frontend) | Partielle | Partiel (rollback) |
| **Retool** | Oui (multi-environnements, Releases) | Oui | Cloud ou auto | Oui | Temps réel | Oui (Git, Enterprise) |
| **Appsmith** | Partiel (branches, multi-env payant) | Partiel | Cloud ou auto | Oui, gratuit | Oui | **Oui, Git gratuit** |
| **Budibase** | Oui (développement / publié) | Oui | Cloud ou auto | Oui, gratuit | Oui | Partiel (sauvegardes) |
| **ToolJet** | Oui (dev / staging / prod, payant) | Oui | Cloud ou auto | Oui | Temps réel | Oui (Git, payant) |
| **Glide** | Partiel (brouillon / publié) | Non | Cloud Glide | Non | Partielle | Partiel |
| **FlutterFlow** | Oui (Dev Environments) | Oui (projets distincts) | FlutterFlow, magasins d'applications | Via export | Temps réel | Oui (branches, GitHub) |
| **Lovable** | Partiel (aperçu / publié) | Partiel | Lovable ou tout hébergeur | Via le code | Oui | Oui (GitHub) |
| **Bolt.new** | Partiel (aperçu / déployé) | Non | Bolt Cloud, Netlify, tout hébergeur | Via le code | Partielle | Oui (GitHub) |
| **v0** | Oui (branches, déploiements de prévisualisation Vercel) | Partiel | Vercel | Via le code | Oui | Oui (Git complet) |
| **Mendix / OutSystems** | **Oui (gestion complète)** | Oui | Cloud éditeur, Kubernetes, sur site | Oui | Oui | Oui |
| **Power Apps** | **Oui (environnements + solutions)** | Oui | Microsoft Cloud | Non | Oui | Oui (solutions, intégration Git) |

**Schéma de référence d'un cycle de vie à plusieurs environnements :**

```
[Développement] ──tests──▶ [Préproduction / test] ──validation──▶ [Production]
 base de test               copie de la production                données réelles
 modifications libres       tests finaux                          utilisateurs réels
```

**Analyse.** La gestion des environnements et du versioning est **mature dans le low-code d'entreprise** (Mendix, OutSystems, Power Apps) et dans les plateformes d'outils internes. Elle est **faible dans le no-code grand public** (Glide) et **reportée sur Git** dans les générateurs par IA, ce qui suppose une compétence de développeur.

## 5.7 Ouverture : export, dépendance et open source (C7)

| Plateforme | Export du code | Langage / framework exporté | Qualité de l'export | Dépendance | Licence |
|---|---|---|---|---|---|
| **Bubble** | Non | — | — | Très forte | Propriétaire |
| **WeWeb** | Partiel (compilé) | Vue.js (SPA compilée) | Déployable, non maintenable | Faible à moyenne | Propriétaire |
| **Retool** | Non (JSON/YAML) | — | — | Forte | Propriétaire |
| **Appsmith** | Non (JSON) | — | — | Moyenne | **Apache 2.0** |
| **Budibase** | Non (archive) | — | — | Moyenne | **GPL v3** |
| **ToolJet** | Non (JSON) | — | — | Moyenne | **AGPL v3** |
| **Lowcoder** | Non | — | — | Moyenne | **AGPL v3** |
| **NocoBase** | Non | — | — | Moyenne | **Apache 2.0** (depuis 2026) |
| **Glide** | Non | — | — | Forte | Propriétaire |
| **Adalo** | Partiel (Enterprise) | — | — | Forte | Propriétaire |
| **Softr** | Non | — | — | Forte | Propriétaire |
| **Webflow** | Partiel | HTML/CSS/JS statique, composants React (DevLink) | Bonne pour le statique, sans le dynamique | Moyenne | Propriétaire |
| **Framer** | Non | — | — | Forte | Propriétaire |
| **Plasmic** | **Oui** | React | Bonne | Faible | **MIT** |
| **FlutterFlow** | **Oui** | Flutter / Dart | Bonne | Faible | Propriétaire |
| **Draftbit** | **Oui** | React Native / Expo | Variable (agents IA) | Faible | Propriétaire |
| **Lovable** | **Oui** | React + TypeScript (pile imposée) | Bonne à moyenne | Faible | Propriétaire |
| **Bolt.new** | **Oui** | **Au choix** : React, Vue, Svelte, Angular, Next, Nuxt, Astro | Bonne à moyenne | Très faible | MIT (bolt.new / bolt.diy) |
| **v0** | **Oui** | Next.js / React | Bonne | Faible | Propriétaire |
| **Replit Agent** | **Oui** | Multi-langages | Variable | Faible | Propriétaire |
| **Mendix** | Non | — | — | Forte | Propriétaire |
| **OutSystems** | Partiel (détachement) | .NET / C# | Volumineux | Forte | Propriétaire |
| **Power Apps** | Partiel (Code Apps) | React | — | Forte | Propriétaire |
| **Xano** | Non | — | — | Forte | Propriétaire |
| **Supabase** | N/A (PostgreSQL standard) | SQL | — | Très faible | **Apache 2.0** |
| **Strapi** | Oui (projet Node.js) | Node.js | Bonne | Faible | **MIT** |
| **Amplication** | **Oui** | NestJS, .NET | Bonne | Très faible | Open source |
| **JHipster** | **Oui** | **Spring Boot + Angular / React / Vue** | Très bonne | Aucune | **Apache 2.0** |
| **Builder.io Mitosis** | **Oui** | React, Vue, Angular, Svelte, Qwik, Solid… | Bonne (composants) | Aucune | **MIT** |

**Réponse synthétique à la question des frameworks cibles :**
- **React** : Lovable, Bolt.new, v0, Plasmic, JHipster, Mitosis, Locofy, Anima, Builder.io, Webflow (DevLink).
- **Vue** : WeWeb (compilé), Bolt.new, JHipster, Mitosis, Locofy, Anima, Builder.io.
- **Angular** : Bolt.new (sur demande), **JHipster**, Mitosis, Locofy, Builder.io.
- **Flutter / Dart** : FlutterFlow, Locofy.
- **Spring Boot (backend)** : **JHipster** uniquement.
- **Aucun export** : Bubble, Retool, Appsmith, Budibase, ToolJet, Glide, Framer, Mendix, Xano, Softr.

**Analyse.** L'export **multi-frameworks** est assuré par deux catégories d'outils seulement : les **générateurs dirigés par les modèles** (JHipster) et les **outils de conversion de composants** (Mitosis, Builder.io, Locofy). **Aucun builder visuel d'application complète** ne propose de choisir le framework cible de l'export. Côté IA, seul Bolt.new laisse ce choix, sans éditeur visuel.

## 5.8 Cible et positionnement (C9, C10)

| Plateforme | Web | Mobile | Type de mobile | Public | Apprentissage | Tarification |
|---|---|---|---|---|---|---|
| **Bubble** | Oui | Oui | Natif (bêta) | Non-techniciens | Moyen à long | Plan + WU |
| **WeWeb** | Oui | Partiel | PWA | Semi-techniques | Moyen | Sièges + hébergement |
| **Retool** | Oui | Oui | Natif (Retool Mobile) | Développeurs | Moyen | Par utilisateur |
| **Appsmith** | Oui | Partiel | Web responsive | Développeurs | Élevé | Gratuit / par utilisateur |
| **Budibase** | Oui | Partiel | PWA | IT / opérations | Faible à moyen | Gratuit / par utilisateur |
| **ToolJet** | Oui | Partiel | Web | Développeurs et métier | Moyen | Gratuit / par utilisateur |
| **Glide** | Oui | Oui | PWA | Non-techniciens | Très faible | Par application + updates |
| **FlutterFlow** | Oui | Oui | **Natif** (+ ordinateur) | Développeurs mobiles | Moyen à élevé | Par éditeur |
| **Lovable** | Oui | Partiel | Web | Tous publics | Très faible | Crédits |
| **Bolt.new** | Oui | Oui | **Natif (Expo)** | Tous publics | Faible | Tokens |
| **Adalo** | Oui | Oui | **Natif** | Non-techniciens | Faible | Forfait |
| **Mendix / OutSystems** | Oui | Oui | Natif | Développeurs d'entreprise | Élevé | Licence d'entreprise |
| **Power Apps** | Oui | Oui | Application Power Apps | Métier et IT | Moyen | Par utilisateur |
| **JHipster** | Oui | Non | — | Développeurs Java | Élevé | Gratuit |

---

# 6. TECHNOLOGIES ET ARCHITECTURES DES PLATEFORMES

| Plateforme | Frontend de la plateforme | Backend de la plateforme | Stockage interne | Architecture de la plateforme | Architecture de l'application produite |
|---|---|---|---|---|---|
| **Bubble** | JavaScript (propriétaire) | Node.js | PostgreSQL | Monolithe multi-tenant (AWS) | 3-tiers sur l'infrastructure Bubble |
| **WeWeb** | **Vue.js** | Propriétaire | PostgreSQL (2026) | SaaS | SPA découplée + API / BaaS |
| **Retool** | React / TypeScript | Node.js | PostgreSQL | Services conteneurisés (Temporal pour Workflows) | Client → serveur Retool → sources de données |
| **Appsmith** | React / TypeScript | **Java Spring** + Node.js | MongoDB, Redis | Monolithe modulaire (une image Docker) | Client → serveur Appsmith → sources |
| **Budibase** | **Svelte** | Node.js (Koa) / TypeScript | CouchDB, MinIO, Redis | Services séparés (apps, worker, proxy) | Client → serveur Budibase → sources |
| **ToolJet** | React | Node.js (**NestJS**) | PostgreSQL, PostgREST, Redis | Couches conteneurisées | Client → serveur ToolJet → sources |
| **Lowcoder** | React | Java (Spring) + Node.js | MongoDB, Redis | Héritée d'Openblocks | Client → serveur → sources |
| **NocoBase** | React (Ant Design) | Node.js (Koa) | SQL (PostgreSQL, MySQL…) | **Micro-noyau à plugins** | Application pilotée par le modèle de données |
| **Glide** | React / TypeScript | Propriétaire | Propriétaire | SaaS multi-tenant | PWA + moteur de données |
| **FlutterFlow** | **Flutter Web** | Propriétaire | — | SaaS | Client natif + BaaS (serverless) |
| **Lovable** | Web propriétaire + LLM | Orchestration de LLM | — | SaaS + agents | React + Supabase (JAMstack) |
| **Bolt.new** | React / Remix + **WebContainers (WebAssembly)** | Orchestration de LLM | — | Exécution dans le navigateur | Selon le framework |
| **v0** | Next.js | Orchestration de LLM, bacs à sable | — | SaaS (Vercel) | Next.js (SSR) + BaaS |
| **Plasmic** | React / TypeScript | Node.js | PostgreSQL | SaaS + générateur de code | Composants React intégrés à Next.js |
| **Webflow** | Propriétaire | Propriétaire | Propriétaire | SaaS + CDN | Site statique + CMS hébergé |
| **Mendix** | React (transition depuis Dojo) | **Java** | SGBD relationnel | Moteur d'exécution de modèles | 3-tiers (client, moteur Java, base) |
| **OutSystems** | React | **.NET / C#** | SQL Server / autres | Génération de code + plateforme cloud-native (ODC) | 3-tiers conteneurisé |
| **Power Apps** | Propriétaire | Azure | Dataverse | Plateforme cloud Microsoft | Client + Dataverse + Power Automate |
| **Supabase** | Next.js (Studio) | PostgreSQL, PostgREST, GoTrue, Deno | PostgreSQL | **Ensemble de services open source** | Base de données exposée par API |
| **Directus** | Vue.js | Node.js | SQL | Monolithe | API REST / GraphQL sur base existante |
| **Strapi** | React | Node.js | SQL | Monolithe | API REST / GraphQL |
| **Amplication** | React | Node.js (NestJS) | PostgreSQL | Plateforme + générateurs (*blueprints*) | **Microservices** NestJS / .NET générés |
| **JHipster** | N/A (outil en ligne de commande, Node.js / Yeoman) | — | — | Générateur + *blueprints* | **Monolithe ou microservices** Spring Boot + SPA Angular / React / Vue |
| **Mitosis** | N/A (compilateur TypeScript) | — | — | Compilateur à représentation intermédiaire JSON | Composants multi-frameworks |

**Observations.**
- **TypeScript / JavaScript domine** les plateformes : React est majoritaire, Vue (WeWeb, Directus) et Svelte (Budibase) sont minoritaires.
- **Java** est présent dans les plateformes orientées entreprise (Appsmith, Lowcoder, Mendix) et dans JHipster.
- **Deux grandes approches d'exécution** se distinguent : l'**interprétation d'un modèle** (Bubble, Retool, Appsmith, Mendix) et la **génération de code** (FlutterFlow, Plasmic, JHipster, OutSystems, générateurs par IA). Seule la seconde rend l'export possible.
- **Les architectures extensibles par plugins** (NocoBase, *blueprints* JHipster et Amplication, compilateurs Mitosis) sont celles qui supportent le mieux l'ajout de nouvelles cibles ou de nouvelles fonctionnalités.

---

# 7. TABLEAUX GÉNÉRAUX DE COMPARAISON

## 7.1 Tableau général — plateformes principales

| Critère | Bubble | WeWeb | Retool | Appsmith | Budibase | ToolJet | Glide | FlutterFlow | Lovable | Bolt.new |
|---|---|---|---|---|---|---|---|---|---|---|
| **Catégorie** | No-code full-stack | Frontend → full-stack (2026) | Outils internes | Outils internes (open source) | Outils internes (open source) | Outils internes + IA (open source) | No-code orienté données | Mobile + génération de code | Générateur IA | Générateur IA (navigateur) |
| **Public** | Non-techniciens | Semi-techniques | Développeurs | Développeurs (JS) | IT / opérations | Développeurs et métier | Non-techniciens | Développeurs mobiles | Tous publics | Tous publics |
| **Arbre des composants** | Oui, Element Tree complet | Oui, Layout proche de Figma | Oui, Explorer | Oui, Entity Explorer | Oui | Oui | Partiel, liste verticale | Oui, Widget Tree = code | Partiel, code + Visual Edits | Non, fichiers |
| **Glisser-déposer** | Oui, canvas libre | Oui | Oui, grille | Oui, grille | Oui | Oui | Partiel | Oui | Non, prompt | Non, prompt |
| **Pages** | Oui + mode page unique | Oui, routes dynamiques | Oui, multipages | Oui | Oui, accès par rôle | Oui | Oui, écrans et onglets | Oui, paramètres | Oui, routes en code | Oui, routes en code |
| **Groupes** | Group, Repeating Group, Popup | Container, Section, Modal | Container, Tabs, Modal, Drawer | Container, Tabs, Form, Modal | Container, Repeater, Blocks | Container, Tabs, Kanban | Containers, Collections | Column, Row, Stack | Composants React | Composants |
| **Responsive** | Oui, Flexbox (difficile) | Oui, le plus fin | Partiel | Partiel | Oui, automatique | Partiel, deux dispositions | Oui, automatique | Oui | Oui, Tailwind | Oui, Tailwind |
| **Réutilisables** | Reusable Elements | Composants + Vue | Modules + React | Custom Widgets | Blocks, plugins | Modules | Limité | Components, Libraries | Composants React | Composants |
| **Type de rendu** | Hybride | SPA Vue | SPA React | SPA React | SPA Svelte | SPA React | PWA | Flutter Web (canvas) | SSR depuis mai 2026 | Selon le framework |
| **SEO** | Partiel | Partiel, pas de SSR | N/A | N/A | N/A | N/A | Non | Non | Bon (2026) | Variable |
| **Workflows frontend** | Oui, visuels | Oui | Oui | Oui | Oui | Oui | Oui | Oui | En code | En code |
| **Workflows backend** | Oui (API, planifiés, déclencheurs) | Oui (2026) | Oui (Retool Workflows) | Partiel (payant) | Oui (Automations) | Oui | Oui | Partiel (Cloud Functions) | En code (Edge Functions) | En code |
| **Unités de consommation** | **Workload Units** | Non | Exécutions de workflows | Non | Quotas cloud | Non | **Updates** | Non | Crédits IA | Tokens IA |
| **Code personnalisé** | Partiel (plugins) | Oui (JS, Vue) | Oui (JS, SQL, Python, React) | Oui (JS Objects) | Oui (JS) | Oui (JS, Python) | Partiel | Oui (Dart) | Oui (TypeScript) | Oui |
| **Connexion backend** | API Connector, SQL | Supabase, Xano, REST, GraphQL | Plus de 50 connecteurs | Plus de 25 connecteurs | SQL, NoSQL, REST | Plus de 80 sources | Sheets, Airtable, SQL | Firebase, Supabase, REST | Supabase / Lovable Cloud | Bolt Cloud, Supabase, tout |
| **Base intégrée** | Propriétaire | PostgreSQL (2026) | PostgreSQL | Non | CouchDB | PostgreSQL | Glide Tables | Non (BaaS) | PostgreSQL | PostgreSQL |
| **Création de la base** | Oui | Oui (2026) | Oui | Non | Oui | Oui | Oui | Partiel (Firestore) | Oui, par l'IA | Oui, par l'IA |
| **Génération par IA** | Oui (application + agent) | Oui | Oui (AppGen, Assist) | Partiel | Partiel | Oui | Partiel | Oui (DreamFlow) | Oui, principe | Oui, principe |
| **Modification après IA** | Oui, éditeur visuel | Oui | Oui | Oui | Oui | Oui | Oui | Oui, visuel et code | Prompt, Visual Edits, code | Prompt, code |
| **Image → interface** | Oui | Non documentée | Non documentée | Non | Non | Non documentée | Non | Partiel (Figma) | Oui (approximatif) | Oui (approximatif) |
| **Environnements** | Oui, bases séparées | Oui (staging, production) | Oui, multi-environnements | Partiel | Oui, données séparées | Oui (payant) | Partiel | Oui | Partiel | Partiel |
| **Hébergement** | Bubble uniquement | WeWeb ou export | Cloud ou auto | Cloud ou auto (gratuit) | Cloud ou auto (gratuit) | Cloud ou auto | Glide uniquement | FlutterFlow, magasins, export | Lovable ou tout hébergeur | Bolt Cloud, Netlify, tout hébergeur |
| **Collaboration** | Temps réel | Partielle | Temps réel | Oui | Oui | Temps réel | Partielle | Temps réel | Oui + GitHub | Partielle |
| **Versioning** | Partiel (pas de Git) | Partiel (rollback) | Oui (Git, Enterprise) | **Git gratuit** | Partiel | Oui (Git payant) | Partiel | Oui (GitHub) | Oui (GitHub) | Oui (GitHub) |
| **Export du code** | Non | Partiel (Vue compilé) | Non | Non | Non | Non | Non | **Oui (Dart)** | **Oui (React)** | **Oui (au choix)** |
| **Export du backend** | Non | Non documenté | Non | Non | Non | Non | Non | Partiel | Oui | Oui |
| **Dépendance** | Très forte | Faible à moyenne | Forte | Moyenne | Moyenne | Moyenne | Forte | Faible | Faible | Très faible |
| **Licence** | Propriétaire | Propriétaire | Propriétaire | Apache 2.0 | GPL v3 | AGPL v3 | Propriétaire | Propriétaire | Propriétaire | MIT (bolt.diy) |
| **Technologies** | JS, Node.js, PostgreSQL | Vue.js | React, Node.js | React, Java Spring, MongoDB | Svelte, Node.js, CouchDB | React, NestJS, PostgreSQL | React | Flutter Web, Dart | LLM, React, TanStack | WebContainers, LLM |
| **Architecture** | Monolithe multi-tenant | SPA + API / BaaS | Services conteneurisés | Monolithe modulaire | Services séparés | Couches conteneurisées | SaaS | Client natif + BaaS | JAMstack | Selon le framework |
| **Web / mobile** | Web + natif (bêta) | Web + PWA | Web + natif | Web | Web + PWA | Web | Web + PWA | Natif + web + ordinateur | Web | Web + natif (Expo) |
| **Point fort principal** | Tout-en-un, IA éditable | Précision du design, liberté du backend | Connecteurs, entreprise | Open source, Git gratuit | Base intégrée, CRUD automatique | 80 sources, environnements | Simplicité | Code natif exportable | Rapidité, code réel | Liberté de framework |
| **Limite principale** | WU, aucun export | SEO (pas de SSR) | Coût, dépendance | JavaScript requis, mobile | Design rigide, GPL | AGPL, fonctions payantes | Rigidité, pas de magasin | SEO web | Qualité sur gros projets | Tokens, peu de visuel |

## 7.2 Tableau général — plateformes complémentaires

| Plateforme | Famille | Construction | Données / backend | IA | Export | Licence | Intérêt pour l'étude |
|---|---|---|---|---|---|---|---|
| **Adalo** | No-code mobile | Canvas d'écrans | Base relationnelle intégrée | Ada (Magic Start / Add) | Enterprise uniquement | Propriétaire | Mobile natif no-code |
| **Softr** | No-code portails | Blocs | Softr Databases, Airtable, SQL | AI Co-Builder (2026) | Non | Propriétaire | Gestion des groupes d'utilisateurs |
| **Webflow** | Sites web | Canvas, contrôle CSS | CMS | Composants et applications IA (2026) | HTML statique, React (DevLink) | Propriétaire | Référence SEO |
| **Framer** | Sites web | Canvas de design | CMS | Wireframer, Workshop | Non | Propriétaire | Performance, design |
| **Plasmic** | Builder React | Canvas + composants de code | REST, GraphQL, Supabase | — | **React** | MIT | Éditeur visuel + génération de code |
| **Lowcoder** | Outils internes | Glisser-déposer | SQL, NoSQL, API | — | Non | AGPL v3 | Alternative communautaire |
| **NocoBase** | No-code par modèle | Blocs sur modèle de données | SQL | AI Employees | Non | **Apache 2.0** | Architecture à plugins |
| **Draftbit** | Mobile | Agents IA (auparavant visuel) | API | Agents | **React Native** | Propriétaire | Évolution vers les agents |
| **v0** | Générateur IA | Prompt + Design Mode | Neon, Supabase | Agent | **Next.js** | Propriétaire | Qualité des interfaces React |
| **Replit Agent** | Générateur IA | Prompt | Base intégrée | Agent | **Multi-langages** | Propriétaire | Absence de pile imposée |
| **OutSystems** | Low-code entreprise | Modélisation visuelle | Relationnelle | Mentor | Partiel (.NET) | Propriétaire | Génération de code d'entreprise |
| **Mendix** | Low-code entreprise | Modélisation visuelle | Modèle de domaine | Maia | Non | Propriétaire | Microflows / nanoflows |
| **Power Apps** | Low-code entreprise | Canvas / modèle / code | Dataverse | Vibe, Copilot | Partiel (Code Apps) | Propriétaire | ALM, connecteurs |
| **Xano** | Backend visuel | Piles de fonctions | PostgreSQL | Agents, MCP | Non | Propriétaire | Backend visuel |
| **Supabase** | BaaS | Studio (tables) | PostgreSQL | Assistant SQL | Standard PostgreSQL | Apache 2.0 | Standard de fait |
| **Directus / Strapi** | Backend d'API | Modèle de données | SQL | — | Strapi : Node.js | BSL / MIT | API générées automatiquement |
| **Amplication** | Générateur de backend | Modèle visuel d'entités | Prisma | — | **NestJS, .NET** | Open source | Backend généré (en maintenance) |
| **JHipster** | Générateur full-stack | JDL (texte + visualisation) | JPA | — | **Spring Boot + Angular / React / Vue** | Apache 2.0 | Référence multi-cibles |
| **Builder.io / Mitosis** | Design-to-code / compilateur | Figma / JSX | — | Visual Copilot | **Multi-frameworks** | MIT (Mitosis) | Export multi-frameworks |
| **Locofy / Anima** | Design-to-code | Figma | — | Oui | Multi-frameworks | Propriétaire | Conversion de maquettes |
| **Uizard / Stitch** | Maquettage IA | Croquis, captures, prompt | — | Oui | Composants / code | Propriétaire | Génération d'interfaces par IA |

---

# 8. SYNTHÈSE : LIMITES COMMUNES ET OPPORTUNITÉS

## 8.1 Limites communes observées

| N° | Limite | Plateformes concernées |
|---|---|---|
| **L1** | **Compromis entre édition visuelle et propriété du code.** Les builders visuels n'exportent pas de code (sauf FlutterFlow et Plasmic, chacun pour une seule cible), tandis que les générateurs de code par IA ne disposent pas d'éditeur visuel complet. | Toutes |
| **L2** | **Absence d'export multi-frameworks** pour une application complète construite visuellement. Seuls JHipster (sans éditeur visuel d'interface) et les convertisseurs de composants (Mitosis, Locofy) proposent plusieurs cibles. | Toutes les plateformes visuelles |
| **L3** | **Backend non exportable** ou limité à des piles imposées. Aucune plateforme visuelle n'exporte un backend dans un framework d'entreprise (Spring Boot, .NET), alors que ces frameworks dominent le développement en entreprise. | Bubble, Xano, Mendix, WeWeb, Retool… |
| **L4** | **IA orientée « application entière »** : la génération porte sur l'application ou la page. L'assistance **ciblée sur un composant** (connexion à une source de données, adaptation d'un affichage) est rare et limitée aux sources déjà configurées. | Toutes |
| **L5** | **Sortie de l'IA en code brut** pour les générateurs IA : l'application générée échappe au contrôle visuel et sa qualité structurelle se dégrade quand le projet grandit. | Lovable, Bolt.new, v0, Replit |
| **L6** | **Coûts difficiles à prévoir** (Workload Units, updates, crédits, tokens). | Bubble, Glide, Lovable, Bolt.new, v0 |
| **L7** | **Dépendance au fournisseur** pour l'hébergement et le moteur d'exécution. | Bubble, Glide, Framer, Retool, Mendix, Xano… |
| **L8** | **Licences restrictives** pour la plupart des plateformes open source (GPL, AGPL), qui limitent leur réutilisation. | Budibase, ToolJet, Lowcoder |

## 8.2 Opportunités identifiées

| N° | Opportunité | Limite adressée |
|---|---|---|
| **O1** | Un **builder visuel** fondé sur une **représentation intermédiaire indépendante des frameworks**, exportable vers plusieurs cibles frontend (React, Vue, Angular). | L1, L2, L7 |
| **O2** | Une **génération de backend** à partir du modèle de données défini dans la plateforme, exportable vers un framework d'entreprise (Spring Boot en premier lieu). | L3 |
| **O3** | Un **agent IA contextuel au niveau du composant**, capable de connecter un composant sélectionné à l'API la plus adaptée à partir d'une instruction en langage naturel. | L4 |
| **O4** | Une **IA qui génère le modèle de l'application** (et non du code brut), afin que le résultat reste éditable visuellement et exportable vers toutes les cibles. | L1, L5 |
| **O5** | Une **architecture à plugins** (générateurs, connecteurs, composants) sous licence permissive. | L2, L8 |

---

# 9. ORIENTATIONS ET PROPOSITIONS DE TRAVAIL

## 9.1 Faisabilité d'une plateforme propre

L'étude montre que la construction d'une plateforme visuelle avec export multi-frameworks est **techniquement fondée** sur des précédents existants :
- **JHipster** prouve qu'un **modèle unique** peut produire un backend Spring Boot et, au choix, un frontend Angular, React ou Vue, maintenus en production par une large communauté.
- **Mitosis** prouve qu'une **représentation intermédiaire JSON** des composants peut être compilée vers React, Vue, Angular, Svelte et d'autres frameworks.
- **Plasmic** et **FlutterFlow** prouvent qu'un **éditeur visuel** peut produire un code source lisible et maintenable.
- **Puck**, **Craft.js** (MIT) et **GrapesJS** (BSD) fournissent des **briques d'éditeur glisser-déposer** réutilisables. **NocoBase** (Apache 2.0) offre une référence d'architecture à plugins.

La **combinaison** de ces capacités dans une plateforme unique (éditeur visuel + export frontend multi-frameworks + export backend + assistance IA ciblée) **n'existe pas** dans l'existant étudié. C'est le positionnement proposé.

Le **principal risque** est l'ampleur du périmètre. Les propositions ci-dessous sont donc découpées en modules indépendants et hiérarchisés.

## 9.2 Principe architectural : un modèle pivot et des générateurs enfichables

L'ensemble des propositions repose sur un **modèle pivot** (représentation intermédiaire), seule source de vérité de l'application, indépendante de tout framework :

```
                 ┌──────────────────────────────────────────┐
  Éditeur visuel │              MODÈLE PIVOT (JSON)          │   Assistant IA
  (glisser-  ───▶│  • Arbre des composants (pages, groupes)  │◀─── (génère et modifie
   déposer)      │  • Modèle de données (entités, relations) │      le modèle,
                 │  • Contrat d'API (OpenAPI)                │      jamais le code)
                 │  • Logique (workflows front et back)      │
                 │  • Thème, rôles, environnements           │
                 └───────────────┬──────────────────────────┘
                                 │  validation par schéma
          ┌──────────────────────┼─────────────────────────────┐
          ▼                      ▼                             ▼
  Moteur d'aperçu         GÉNÉRATEURS FRONTEND           GÉNÉRATEURS BACKEND
  (interprétation         (plugins)                      (plugins)
   en direct)             ├─ React                       ├─ Spring Boot
                          ├─ Vue                         ├─ NestJS (ultérieur)
                          ├─ Angular                     └─ …
                          └─ … (Flutter, HTML)
```

**Justification.**
- **L'éditeur** et **l'IA** ne manipulent que le modèle pivot. Ce que l'IA produit reste donc **toujours éditable visuellement**, ce qui répond à la limite L5.
- **Chaque framework cible est un plugin** qui implémente une interface commune (`generer(modele) → fichiers`). Ajouter une cible ne modifie ni l'éditeur ni les autres générateurs, ce qui répond aux limites L2 et L8.
- **L'aperçu** dans l'éditeur est assuré par un moteur d'interprétation (rapide), tandis que l'**export** passe par les générateurs (code propre). Les deux approches techniques identifiées en section 6 sont ainsi combinées.
- **Le contrat OpenAPI** sert de jonction entre frontend et backend : le frontend généré consomme le contrat, le backend généré l'implémente, et toute API externe décrite en OpenAPI est connectable de la même manière.

**Points de difficulté de l'export multi-frameworks.**

| Aspect | Difficulté | Approche |
|---|---|---|
| Structure des composants | Faible | Correspondance directe de l'arbre vers JSX (React), les templates Vue et les templates Angular. |
| Styles | Faible | Génération de CSS ou de classes Tailwind identiques pour toutes les cibles. |
| Gestion d'état | **Moyenne** | Abstraction dans le modèle (variables de page, variables globales), traduite en `useState` / Zustand (React), `ref` / Pinia (Vue), *signals* / services (Angular). |
| Routage | Moyenne | Table de routes du modèle traduite en React Router, Vue Router ou Angular Router. |
| Workflows frontend | **Moyenne à élevée** | Ensemble **fermé** d'actions élémentaires (appeler une API, naviguer, afficher, affecter une variable, condition, boucle), chacune avec un modèle de génération par framework. |
| Code personnalisé | **Élevée** | Points d'extension explicites (fonctions utilisateur en TypeScript) recopiés tels quels, ou générés par l'IA pour chaque cible. |

## 9.3 Question du backend

### Options envisagées

| Option | Principe | Avantages | Inconvénients | Précédents |
|---|---|---|---|---|
| **A. Connexion à des backends externes** | La plateforme ne gère que le frontend et se connecte à des API ou à des BaaS existants. | Périmètre réduit, aucune infrastructure à gérer. | Pas de réponse au besoin d'un backend propriétaire. | WeWeb (avant 2026), FlutterFlow |
| **B. Backend visuel exécuté par la plateforme** | La logique serveur est modélisée et **exécutée par un moteur propre**. | Expérience intégrée. | **Reproduit la dépendance au fournisseur** que l'étude critique. Infrastructure lourde. | Bubble, Xano, Mendix |
| **C. Backend généré à partir du modèle** | Le modèle de données (entités, relations, validations, rôles) est **traduit en code serveur** exportable. | **Propriété du code**, déploiement libre, cohérence avec l'export frontend. | Génération de la logique métier arbitraire difficile. Coût de maintenance des générateurs. | **JHipster**, Amplication |

### Pertinence d'un export Spring Boot

L'export d'un backend **Spring Boot** est **pertinent**, sous conditions de périmètre.

**Arguments favorables.**
- **Spring Boot est un standard du développement d'entreprise** et un framework largement enseigné. Un backend exporté dans ce framework est **reprenable par des équipes Java** sans dépendance à la plateforme.
- **Une part importante d'un backend est générable de manière déterministe** à partir du modèle de données : entités JPA, dépôts (*repositories*), services CRUD, contrôleurs REST, validation (*Bean Validation*), sécurité par rôles (Spring Security), documentation OpenAPI, migrations de base (Liquibase / Flyway), tests de base. **JHipster en apporte la preuve depuis plus de dix ans.**
- **Aucune plateforme visuelle étudiée** ne propose cet export (limite L3) : c'est un élément de différenciation net.

**Limites à anticiper.**
- **La logique métier arbitraire** (workflows backend complexes) est difficile à traduire fidèlement en Java. Il est préférable de la limiter, dans un premier temps, à un **ensemble fermé d'opérations déclaratives** (règles de validation, champs calculés, déclencheurs simples, envoi d'e-mails) et de prévoir des **points d'extension** pour le code écrit à la main.
- **La régénération après modification manuelle** (*round-trip*) est un problème classique de l'ingénierie dirigée par les modèles. La solution éprouvée est le **patron « génération séparée »** (*generation gap*) : le code généré et le code écrit à la main résident dans des fichiers distincts (classes générées et classes d'extension qui en héritent), ce qui permet de régénérer sans écraser les personnalisations.
- **Chaque framework backend supplémentaire** représente un générateur complet à maintenir. Il est recommandé de commencer par **une seule cible** (Spring Boot), en concevant l'interface des générateurs pour en accueillir d'autres (NestJS, Django, .NET).

**Recommandation retenue : combinaison des options A et C.**
1. Le frontend peut **se connecter à toute API existante** décrite par un contrat OpenAPI (option A), y compris des services publics.
2. La plateforme permet de **modéliser des entités** et de **générer un backend Spring Boot** exportable (option C), limité aux opérations CRUD, à la sécurité par rôles, à la validation et aux règles déclaratives.
3. Le backend généré **publie lui-même un contrat OpenAPI**, consommé par le frontend généré : les deux moitiés de l'application restent cohérentes par construction.
4. Des briques existantes peuvent être réutilisées : **OpenAPI Generator** (Apache 2.0) produit des squelettes serveur Spring et des clients TypeScript pour Angular et Axios / Fetch. Les **modèles de génération de JHipster** (Apache 2.0) servent de référence de qualité.

## 9.4 Intégration de l'intelligence artificielle

### Proposition IA-1 : agent de connexion d'un composant à une API

**Principe.** Dans l'éditeur, l'utilisateur sélectionne un composant (tableau, liste, carte, graphique, formulaire), ouvre un panneau d'assistance et formule son besoin en langage naturel, par exemple : « afficher les prévisions météo des cinq prochains jours pour la ville saisie dans le champ Ville », ou « enregistrer ce formulaire comme nouveau client ». L'agent :

1. **analyse le contexte** du composant : type, propriétés attendues (colonnes d'un tableau, champs d'un formulaire), variables de la page ;
2. **recherche l'API la plus adaptée** dans un **catalogue d'API décrites en OpenAPI** : API du backend généré par la plateforme, API déclarées par l'utilisateur, répertoire d'API publiques (par exemple APIs.guru, qui recense plusieurs milliers de spécifications OpenAPI). Le choix est expliqué et, si plusieurs candidates existent, présenté sous forme de liste ;
3. **génère la liaison dans le modèle pivot** (et non du code) : requête (endpoint, méthode, paramètres liés aux variables de la page), **correspondance** entre les champs de la réponse et les propriétés du composant, gestion du chargement et des erreurs ;
4. **effectue un appel de test**, affiche un aperçu avec les données réelles et demande une **validation explicite** ;
5. **sécurise les identifiants** : les clés d'API sont demandées à l'utilisateur et stockées côté serveur, les appels authentifiés transitant par un serveur intermédiaire, sur le modèle de Retool.

**Architecture technique.**

```
 [Composant sélectionné + instruction]
              │
              ▼
 ┌───────────────────────────┐   recherche sémantique   ┌──────────────────────────┐
 │ Agent (LLM + appel        │ ───────────────────────▶ │ Catalogue d'API OpenAPI  │
 │ d'outils, sortie          │ ◀─────────────────────── │ (indexé par embeddings)  │
 │ structurée JSON Schema)   │   endpoints candidats    └──────────────────────────┘
 └─────────────┬─────────────┘
               │ outils : tester_appel(), lire_schema(), proposer_liaison()
               ▼
 [Proposition de liaison] ──▶ aperçu avec données réelles ──▶ validation ──▶ modèle pivot
```

**Intérêt.** Cette assistance **ciblée sur un composant** est rare dans l'existant (limite L4). Elle est **compatible avec l'export multi-frameworks**, puisque l'agent produit une liaison dans le modèle et non du code propre à un framework. Elle est aussi **évaluable** : taux de sélection correcte de l'endpoint, exactitude de la correspondance des champs, nombre d'interventions manuelles.

**Risques et réponses.**
- *Invention d'endpoints inexistants* : la recherche est **restreinte au catalogue** et chaque proposition est vérifiée par un appel de test.
- *Fuite de clés* : stockage des secrets côté serveur uniquement.
- *API publiques instables* : contrôle de disponibilité et mise en cache des spécifications.

### Proposition IA-2 : génération de l'application dans le modèle pivot

**Principe.** À partir d'une description en langage naturel, un LLM génère **directement le modèle pivot** (pages, arbre des composants, modèle de données, workflows) au moyen de **sorties structurées contraintes par un schéma JSON**, plutôt que du code. Le résultat est immédiatement **éditable dans l'éditeur visuel** et **exportable vers toutes les cibles**.

**Intérêt.** Cette approche réunit les avantages des deux familles d'outils (limites L1 et L5) : la rapidité des générateurs par IA et la maîtrise des builders visuels. Bubble et Retool appliquent ce principe à leur format propriétaire, mais **sans export de code**.

### Proposition IA-3 : génération du modèle de données

**Principe.** À partir d'une description du domaine (« gestion d'une clinique : patients, médecins, rendez-vous, ordonnances »), l'IA propose les **entités, attributs, types, relations et rôles**, présentés sous forme de diagramme éditable. Ce modèle alimente directement le générateur de backend (section 9.3).

### Proposition IA-4 : assistance à l'écriture du code d'extension

**Principe.** Dans les points d'extension (fonctions personnalisées, logique métier spécifique), l'IA rédige le code TypeScript ou Java à partir d'une description, avec le contexte du modèle (types des entités, signatures attendues).

## 9.5 Propositions de travail

| N° | Proposition | Description | Apport | Complexité | Briques réutilisables |
|---|---|---|---|---|---|
| **P1** | **Modèle pivot + éditeur visuel** | Définition du schéma JSON de l'application (composants, pages, données, liaisons, workflows) et éditeur glisser-déposer avec arbre des composants, panneau de propriétés et aperçu. | Socle de toutes les autres propositions. | Moyenne | Puck, Craft.js ou GrapesJS ; JSON Schema |
| **P2** | **Export frontend multi-frameworks** | Générateurs enfichables : React en premier, puis Vue, puis Angular. | Réponse aux limites L1 et L2 : élément différenciant principal. | Moyenne à élevée | Mitosis (référence ou base), moteurs de modèles |
| **P3** | **Génération de backend Spring Boot** | Modèle de données → entités JPA, services, contrôleurs REST, sécurité, OpenAPI, migrations, avec le patron de génération séparée. | Réponse à la limite L3 : différenciation forte. | Élevée | OpenAPI Generator, modèles JHipster |
| **P4** | **Agent de connexion composant ↔ API** | Proposition IA-1. | Réponse à la limite L4 : contribution IA originale et mesurable. | Moyenne à élevée | LLM avec appel d'outils, catalogue OpenAPI (APIs.guru), embeddings |
| **P5** | **Génération de l'application dans le modèle** | Proposition IA-2 (et IA-3 pour le modèle de données). | Réponse aux limites L1 et L5. | Moyenne | LLM à sorties structurées |
| **P6** | **Cycle de vie** | Environnements développement / production, versioning du modèle avec Git, export dans un dépôt. | Maturité professionnelle. | Faible à moyenne | Git, Docker |

## 9.6 Combinaison recommandée et périmètre

Dans le cadre d'un travail de recherche à durée limitée, la combinaison recommandée est la suivante :

| Priorité | Contenu | Justification |
|---|---|---|
| **Socle (obligatoire)** | **P1** : modèle pivot et éditeur visuel | Sans ce socle, aucune autre proposition n'est démontrable. |
| **Contribution principale 1** | **P2** limité à **deux cibles** : React et Vue (ou React et Angular) | Deux cibles suffisent à **démontrer** l'indépendance du modèle vis-à-vis des frameworks. La troisième devient une extension. |
| **Contribution principale 2 (IA)** | **P4** : agent de connexion composant ↔ API | Contribution IA **originale**, **ciblée** et **évaluable quantitativement**, cohérente avec le modèle pivot. |
| **Contribution complémentaire** | **P3** limité au **CRUD** : entités, API REST, sécurité par rôles, OpenAPI | Démontre l'export backend Spring Boot sans s'engager dans la génération de logique métier arbitraire. |
| **Extensions** | P5, P6, troisième framework, deuxième backend (NestJS) | Perspectives du travail. |

### Feuille de route indicative

| Phase | Contenu | Livrable |
|---|---|---|
| **1** | Spécification du modèle pivot (JSON Schema), choix de la bibliothèque d'éditeur, prototype de l'éditeur avec 10 à 15 composants de base | Éditeur fonctionnel avec sauvegarde du modèle |
| **2** | Générateur React, puis générateur Vue, avec tests de **parité visuelle** entre les deux exports (comparaison de captures) | Export de la même application vers deux frameworks |
| **3** | Modèle de données et générateur Spring Boot CRUD avec contrat OpenAPI, liaison automatique du frontend au contrat | Application full-stack exportée et exécutable |
| **4** | Agent de connexion composant ↔ API : catalogue, recherche, génération de liaison, appel de test, validation | Agent intégré à l'éditeur |
| **5** | Évaluation : précision de l'agent, qualité du code exporté (compilation, lisibilité, tests), comparaison avec les plateformes existantes | Résultats expérimentaux |

## 9.7 Positionnement de la proposition

| Capacité | Bubble | WeWeb | Retool | FlutterFlow | Lovable | Bolt.new | JHipster | Builder.io / Mitosis | **Proposition** |
|---|---|---|---|---|---|---|---|---|---|
| Éditeur visuel complet | Oui | Oui | Oui | Oui | Partiel | Non | Non | Partiel | **Oui** |
| Export frontend maintenable | Non | Partiel | Non | Oui (1 cible) | Oui (1 cible) | Oui (au choix) | Oui (3 cibles) | Oui (composants) | **Oui (multi-cibles)** |
| Choix du framework frontend | Non | Non | Non | Non | Non | Oui | Oui | Oui | **Oui** |
| Export backend | Non | Non | Non | Partiel | Oui (Supabase) | Oui | **Oui (Spring Boot)** | Non | **Oui (Spring Boot)** |
| IA générant un résultat éditable visuellement | Oui | Oui | Oui | Oui | Partiel | Non | Non | Non | **Oui** |
| IA ciblée sur un composant (connexion d'API) | Non | Non | Partiel | Non | Non | Non | Non | Non | **Oui** |
| Contrat d'API standard (OpenAPI) | Non | Non | Partiel | Non | Non | Non | Oui | Non | **Oui** |
| Dépendance au fournisseur | Très forte | Faible | Forte | Faible | Faible | Très faible | Aucune | Aucune | **Aucune** |

**Formulation du positionnement.**

> Plateforme de conception visuelle d'applications web fondée sur un **modèle pivot indépendant des frameworks**, offrant un **export du frontend vers plusieurs frameworks** (React, Vue, Angular) et la **génération d'un backend Spring Boot** à partir du modèle de données, et intégrant un **agent d'intelligence artificielle contextuel** capable de connecter chaque composant de l'interface à l'API la plus adaptée à partir d'une instruction en langage naturel.

---

# 10. SOURCES

*Sources consultées en octobre 2026.*

**WeWeb**
- [WeWeb changelog — Meet the WeWeb backend (8 avril 2026)](https://www.weweb.io/changelog/2026-04-08-weweb-backend)
- [WeWeb community — WeWeb is full-stack](https://community.weweb.io/t/weweb-is-full-stack/21002)
- [WeWeb — Backend](https://www.weweb.io/product/backend)
- [Migrating WeWeb to Code (2026)](https://www.rapidevelopers.com/md/no-code-to-code/how-to-migrate-weweb-project-to-code)
- [WeWeb Export Code](https://www.rapidevelopers.com/md/weweb-tutorial/weweb-export-code)

**Bubble**
- [Bubble Docs — Importing from Figma](https://manual.bubble.io/help-guides/design/importing-from-figma)
- [Bubble Docs — Application and data ownership](https://manual.bubble.io/account-and-marketplace/application-and-data-ownership)
- [Bubble Docs — SEO](https://manual.bubble.io/help-guides/maintaining-an-application/seo/seo-app)
- [Bubble AI Agent — interfaces from Figma exports and design references](https://createwith.com/tool/bubble/updates/bubble-ai-agent-now-builds-interfaces-from-figma-exports-and-design-references)
- [Bubble blog — Low cost mobile app development tools 2026](https://bubble.io/blog/low-cost-mobile-app-development/)

**Retool**
- [Retool — How we built AI-assisted development into Retool](https://retool.com/blog/how-we-built-ai-assisted-development)
- [Retool Docs — Assist changelog](https://docs.retool.com/changelog/assist)
- [Retool Docs — How apps work](https://docs.retool.com/build/apps/concepts/how-it-works)
- [BusinessWire — Retool AI AppGen platform](https://www.businesswire.com/news/home/20251007982081/en)

**Appsmith, Budibase, ToolJet, Lowcoder, NocoBase**
- [Superblocks — Appsmith Review 2026](https://www.superblocks.com/blog/appsmith-review)
- [EveryDev — Appsmith](https://www.everydev.ai/tools/appsmith)
- [EveryDev — Budibase](https://www.everydev.ai/tools/budibase)
- [Jetadmin — Budibase pricing (juillet 2026)](https://www.jetadmin.io/blog/untitled-39/)
- [ToolJet Docs — Platform overview](https://docs.tooljet.com/docs/getting-started/platform-overview/)
- [Lowcoder — GitHub](https://github.com/lowcoder-org/lowcoder)
- [NocoBase — Mise à jour de licence AGPL-3.0 vers Apache-2.0 (février 2026)](https://www.nocobase.com/en/blog/weekly-updates-20260226)

**Glide, Softr, Adalo**
- [Glide Help — Pricing plans](https://help.glideapps.com/en/articles/11780756-pricing-plans-as-of-november-1-2025)
- [Jetadmin — Glide Review 2026](https://www.jetadmin.io/blog/glide-review/)
- [Softr — AI internal tool builders 2026](https://v2.softr.io/blog/ai-internal-tool-builders)
- [Adalo — Best AI App Builders 2026](https://www.adalo.com/posts/best-ai-app-builders-adalo-fits/)
- [RapidDevelopers — Adalo review](https://www.rapidevelopers.com/md/review/adalo)

**FlutterFlow, Draftbit**
- [RapidDevelopers — FlutterFlow review](https://www.rapidevelopers.com/md/review/flutterflow)
- [What is DreamFlow?](https://www.rapidevelopers.com/blog/what-is-dreamflow-the-ai-tool-that-codes-flutter-apps-for-you)
- [Draftbit FAQ — Export and continue outside Draftbit](https://draftbit.com/faq/can-i-export-and-continue-outside-draftbit)
- [Migrating Draftbit to Code (2026)](https://www.rapidevelopers.com/md/no-code-to-code/how-to-migrate-draftbit-project-to-code)

**Lovable, Bolt.new, v0, Replit**
- [LowCode Agency — Lovable features](https://www.lowcode.agency/blog/lovable-features)
- [Superblog — Lovable SEO 2026](https://superblog.ai/blog/lovable-seo/)
- [Lovable FAQ — Architecture](https://lovable.dev/faq/deployment/architecture)
- [Banani — Bolt.new 2026 review](https://www.banani.co/blog/bolt-new-review)
- [Bolt support — FAQ](https://support.bolt.new/concepts/faq)
- [NxCode — v0 by Vercel complete guide 2026](https://www.nxcode.io/da/resources/news/v0-by-vercel-complete-guide-2026)
- [Replit Docs — Changelog](https://docs.replit.com/updates/2025/12/05/changelog)
- [MindStudio — What is Replit Agent](https://www.mindstudio.ai/blog/what-is-replit-agent)

**Webflow, Framer, Plasmic**
- [Webflow — AI code components](https://webflow.com/updates/ai-code-components)
- [Webflow — DevLink export](https://webflow.com/updates/updates-to-devlink-export)
- [BRIX — Webflow code export limitations](https://brixtemplates.com/blog/can-you-export-a-webflow-website-understanding-code-export-limitations)
- [RapidDevelopers — Framer review](https://www.rapidevelopers.com/md/review/framer)
- [Migrating Plasmic to Code (2026)](https://www.rapidevelopers.com/md/no-code-to-code/how-to-migrate-plasmic-project-to-code)

**OutSystems, Mendix, Power Apps**
- [OutSystems — ODC Mentor updates](https://www.outsystems.com/product-updates/odc-mentor-now-smarter-faster)
- [OutSystems — Mentor expands to agentic apps and libraries](https://www.outsystems.com/product-updates/odc-mentor-expands-to-agentic-apps-and-libraries-ga)
- [Mendix — Studio Pro 11.9 release notes](https://docs.mendix.com/releasenotes/studio-pro/11.9)
- [Mendix 11.0 — The next era of enterprise development](https://www.mendix.com/blog/mendix-release-11-0-start-with-ai-build-anything-the-next-era-of-enterprise-development-is-here/)
- [Rishabh Software — Power Apps Vibe](https://www.rishabhsoft.com/blog/power-apps-vibe)

**Backends et générateurs**
- [JHipster — Release 9.0.0 (mars 2026)](https://jhipster.tech/2026/03/10/jhipster-release-9.0.0.html)
- [Amplication — GitHub](https://github.com/amplication/amplication)
- [RapidDevelopers — Xano review](https://www.rapidevelopers.com/md/review/xano)
- [Migrating Xano to Code (2026)](https://www.rapidevelopers.com/md/no-code-to-code/how-to-migrate-xano-project-to-code)
- [Elest.io — Directus vs Strapi 2026](https://blog.elest.io/directus-vs-strapi-which-headless-cms-should-you-self-host-in-2026/)

**Design-to-code**
- [SSOJet — 7 Design-to-Code AI tools](https://ssojet.com/blog/design-to-code-ai-tools)
- [Uizard — Wireframe Scanner](https://uizard.io/blog/hand-drawn-wireframe-to-sketch/)
- [UXMagic — Uizard review 2026](https://uxmagic.ai/blog/uizard-review-2026)
- [DigitalCitizen — What is Google Stitch](https://www.digitalcitizen.life/what-is-google-stitch-and-how-it-turns-text-into-app-designs/)
