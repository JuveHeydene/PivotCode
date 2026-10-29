> 📁 **Note de classement (21/10/2026)** : ce document a été déplacé depuis `Memoire_Juve_recherche/ref_files/etude_de_lexistant/etat_de_lart_complet.md`, sans modification de contenu. Voir [docs/README.md §4](../../README.md).

# ÉTAT DE L'ART — Plateformes no-code, low-code et générateurs d'applications par IA

> **Contexte** : ce document sert de base au chapitre « Étude de l'existant » du mémoire
> *« Contribution à la génération automatique des IHM à partir des maquettes par des approches basées sur l'IA »*.
>
> **Date de vérification des informations : octobre 2026.** Ces plateformes évoluent tous les mois.
> Les informations marquées **(à vérifier)** n'ont pas pu être confirmées par une source officielle
> et doivent être revérifiées dans la documentation de l'outil avant d'être citées dans le mémoire.
> Les prix sont donnés à titre indicatif.

---

## SOMMAIRE

1. [Glossaire : les concepts à maîtriser](#1-glossaire--les-concepts-à-maîtriser)
2. [Les outils étudiés et les outils ajoutés](#2-les-outils-étudiés-et-les-outils-ajoutés)
3. [Grille de critères : critères initiaux et critères ajoutés](#3-grille-de-critères)
4. [Fiches détaillées par outil (10 outils)](#4-fiches-détaillées-par-outil)
5. [Outils complémentaires pertinents pour le mémoire](#5-outils-complémentaires-pertinents-pour-le-mémoire)
6. [Analyses transversales et tableaux de synthèse par catégorie](#6-analyses-transversales-et-tableaux-de-synthèse-par-catégorie)
7. [Comment construit-on un outil no-code / low-code ?](#7-comment-construit-on-un-outil-no-code--low-code-)
8. [Open source : quoi récupérer pour notre propre outil ?](#8-open-source--quoi-récupérer-pour-notre-propre-outil-)
9. [GRAND TABLEAU GÉNÉRAL](#9-grand-tableau-général)
10. [Limites communes et positionnement du mémoire](#10-limites-communes-et-positionnement-du-mémoire)
11. [Sources](#11-sources)

---

# 1. GLOSSAIRE : LES CONCEPTS À MAÎTRISER

Les concepts sont regroupés par thème. Chaque définition est suivie d'un exemple concret.

## 1.1 Familles d'outils

| Concept | Définition | Exemple |
|---|---|---|
| **No-code** | Outil qui permet de créer une application **sans écrire de code**, uniquement par manipulation visuelle (glisser-déposer, formulaires de configuration). Le public visé est non technique. | Glide, Bubble |
| **Low-code** | Outil visuel qui **réduit** la quantité de code sans la supprimer. On assemble visuellement, puis on écrit du code (JavaScript, SQL) pour les cas complexes. Le public visé est développeur ou semi-technique. | Retool, Appsmith, ToolJet |
| **AI App Builder / « vibe coding »** | Outil où l'on **décrit l'application en langage naturel** (prompt), et une IA (LLM) **écrit du vrai code source** (React, etc.). On itère par conversation. Le terme « vibe coding » (A. Karpathy, 2025) désigne le fait de programmer en guidant l'IA sans lire le code en détail. | Lovable, Bolt, v0 |
| **Design-to-code** | Outil qui convertit une **maquette** (fichier Figma, capture d'écran, croquis) en code. C'est **exactement le domaine du mémoire**. | Locofy, Anima, Builder.io Visual Copilot, Uizard |
| **Internal tools builder** | Low-code spécialisé dans les **outils internes d'entreprise** : back-office, tableaux de bord, interfaces d'administration branchées sur des bases existantes. | Retool, Appsmith, Budibase, ToolJet |
| **Full-stack** | Un outil full-stack gère **à la fois** le frontend (interface), le backend (logique serveur), la base de données, l'authentification et l'hébergement. | Bubble |
| **Frontend builder** | Un outil qui ne gère **que l'interface** et se branche sur un backend externe. | WeWeb (historiquement), Plasmic |

## 1.2 Interface et construction visuelle

| Concept | Définition | Exemple |
|---|---|---|
| **UI Builder** | Éditeur visuel où l'on construit l'interface en plaçant des composants sur une zone de dessin (*canvas*). | L'éditeur de Bubble, de WeWeb |
| **Arbre des composants** (*component tree*, *layers panel*, *element tree*, *navigator*) | Représentation **hiérarchique** de la page : la page contient des sections, qui contiennent des conteneurs, qui contiennent des boutons… C'est le même principe que le **DOM** HTML. Il permet de sélectionner, réordonner et imbriquer des éléments. | `Page > Header > Logo + Menu` ; `Page > Formulaire > Champ email + Bouton` |
| **Glisser-déposer** (*drag and drop*, DnD) | Mode d'interaction où l'on prend un composant dans une bibliothèque et on le dépose sur la page. | Glisser un « Bouton » dans un « Conteneur » |
| **Composant / widget / élément** | Brique d'interface réutilisable et configurable : bouton, champ texte, tableau, graphique, image… | Le widget « Table » de Retool |
| **Panneau de propriétés** | Panneau latéral qui permet de configurer le composant sélectionné : texte, couleur, taille, données affichées, événements. | « Texte du bouton : Envoyer » |
| **Data binding** (liaison de données) | Relier une propriété d'un composant à une donnée dynamique. Quand la donnée change, l'affichage change. | `{{ utilisateur.nom }}` dans un texte |
| **Conteneur / Groupe** | Composant qui **contient** d'autres composants. Il sert à grouper, aligner, masquer/afficher en bloc, ou répéter des éléments. | Bubble : *Group*, *Repeating Group*, *Popup* ; Retool : *Container*, *Tabbed container* |
| **Repeater / Liste répétée** | Conteneur qui **duplique** un modèle d'affichage pour chaque élément d'une liste de données. | Afficher 50 produits sous forme de cartes |
| **Composant réutilisable** (*reusable element*, *module*, *component*) | Un ensemble de composants que l'on définit **une fois** et que l'on réutilise sur plusieurs pages. Une modification se propage partout. | Un en-tête (header) utilisé sur toutes les pages |
| **Système de pages** | Possibilité de créer **plusieurs pages ou écrans** distincts avec leurs propres URL ou routes, et de naviguer entre elles. | `/accueil`, `/produits`, `/profil` |
| **Responsive design** | Capacité de l'interface à **s'adapter à la taille de l'écran** (téléphone, tablette, ordinateur). | Un menu horizontal sur PC qui devient un menu « burger » sur mobile |
| **Breakpoint** (point de rupture) | Largeur d'écran à partir de laquelle la mise en page change. | Mobile < 768 px < Tablette < 1024 px < Desktop |
| **Flexbox / CSS Grid** | Les deux systèmes de mise en page modernes du CSS. Flexbox aligne en ligne ou en colonne. Grid organise en grille 2D. Les bons builders s'appuient dessus pour le responsive. | Bubble et WeWeb utilisent Flexbox/Grid |
| **Design system / thème** | Ensemble centralisé de couleurs, typographies, espacements et composants de base, appliqué à toute l'application. | « Couleur primaire = #1E40AF » |

## 1.3 Rendu des pages, performance et référencement

| Concept | Définition | Conséquence |
|---|---|---|
| **SPA** (*Single Page Application*) | Application web qui charge **une seule page HTML** au départ, puis **JavaScript** redessine le contenu à chaque navigation, sans recharger la page. Le changement d'URL est simulé par un *router* côté client. | Navigation très fluide comme une application. Le premier chargement est plus lourd. Le référencement est difficile (voir SEO). |
| **MPA** (*Multi Page Application*) | Chaque page est un document HTML distinct, renvoyé par le serveur à chaque navigation. | Bon référencement, navigation moins fluide. |
| **CSR** (*Client-Side Rendering*) | Le **navigateur** construit la page à partir de JavaScript. Le serveur envoie un HTML presque vide (`<div id="app"></div>`). | C'est le mode de rendu typique d'une SPA. |
| **SSR** (*Server-Side Rendering*) | Le **serveur** génère le HTML complet de la page à chaque requête, puis JavaScript « prend le relais » dans le navigateur (*hydratation*). | Excellent pour le SEO et le premier affichage. Frameworks typiques : Next.js, Nuxt, TanStack Start. |
| **SSG** (*Static Site Generation*) | Les pages HTML sont générées **une fois, au moment de la compilation**, puis servies comme fichiers statiques. | Le meilleur choix pour le SEO et la vitesse, mais seulement pour du contenu qui change peu. Exemples : Webflow, Astro. |
| **Pré-rendu** (*prerendering*) | Rustine pour les SPA : un service génère une version HTML des pages **uniquement pour les robots** des moteurs de recherche. | Améliore le SEO d'une SPA sans la réécrire. |
| **SEO** (*Search Engine Optimization*) | Ensemble des techniques pour qu'un site soit **bien classé dans Google** : contenu HTML lisible par les robots, balises `<title>` et `<meta description>`, URL propres, *sitemap.xml*, vitesse de chargement, balisage sémantique. | Indispensable pour un site public (vitrine, blog, e-commerce). **Inutile** pour un outil interne protégé par mot de passe. |
| **Meta tags / Open Graph** | Balises dans l'en-tête HTML qui décrivent la page aux moteurs de recherche et aux réseaux sociaux (titre, image d'aperçu). | L'aperçu d'un lien partagé sur WhatsApp ou LinkedIn |
| **Sitemap** | Fichier XML qui liste toutes les pages d'un site pour aider Google à les découvrir. | `/sitemap.xml` |
| **PWA** (*Progressive Web App*) | Application web qui peut être **« installée »** sur le téléphone (icône sur l'écran d'accueil), fonctionner partiellement hors ligne et recevoir des notifications, sans passer par les stores. | Glide, WeWeb, Budibase produisent des PWA |
| **Application native** | Application compilée pour iOS ou Android, publiée sur l'App Store ou Google Play, avec accès complet au matériel (caméra, GPS, biométrie). | FlutterFlow (Flutter), Bubble mobile (React Native), Bolt (Expo) |
| **Lighthouse** | Outil de Google qui note une page sur la performance, l'accessibilité, les bonnes pratiques et le SEO (score sur 100). | Sert à comparer objectivement les builders |

> **Pourquoi une SPA est mauvaise pour le SEO.** Quand le robot de Google arrive sur une SPA, il
> reçoit `<html><body><div id="app"></div><script src="app.js"></script></body></html>`.
> Le contenu n'existe qu'**après** l'exécution du JavaScript. Google sait exécuter du JavaScript,
> mais avec du retard et de façon incomplète. Les autres moteurs et les robots des IA (ChatGPT,
> Claude, Perplexity) ne le font souvent pas du tout. Résultat : la page paraît vide.

## 1.4 Logique applicative : workflows

| Concept | Définition | Exemple |
|---|---|---|
| **Workflow** | Suite d'actions déclenchée par un **événement** : *Quand [événement], alors [action 1], puis [action 2]…*. C'est la manière no-code d'écrire de la logique. | *Quand on clique sur « Valider » → vérifier le formulaire → créer la commande → envoyer un e-mail → aller à la page « Merci »* |
| **Déclencheur** (*trigger*) | L'événement qui démarre le workflow. | Clic, chargement de page, changement de valeur, horaire planifié, appel d'API (webhook) |
| **Workflow frontend** (côté client) | Workflow exécuté **dans le navigateur** de l'utilisateur. Il gère tout ce qui concerne l'interface. | Ouvrir une popup, afficher ou masquer un groupe, changer de page, modifier une variable locale, valider un champ, animer |
| **Workflow backend** (côté serveur) | Workflow exécuté **sur le serveur**, même si l'utilisateur a fermé son navigateur. Il gère tout ce qui est sensible, lourd ou planifié. | Facturer via Stripe avec une clé secrète, envoyer 1 000 e-mails, traiter un webhook entrant, tâche planifiée chaque nuit à 2 h, recalculer des statistiques |
| **Webhook** | URL exposée par une application, qu'un service externe appelle pour la **notifier** d'un événement. | Stripe appelle `/webhook/paiement` quand un paiement réussit |
| **Tâche planifiée** (*cron*, *scheduled job*) | Workflow backend qui s'exécute à intervalle régulier. | Envoyer un rapport chaque lundi |
| **Automatisation** | Synonyme de workflow backend chez certains outils (Budibase : *Automations*). | |
| **Variable d'état** (*state*) | Donnée mémorisée temporairement dans l'interface. | L'onglet actuellement ouvert, le panier en cours |

**Pourquoi distinguer frontend et backend ?**
- **Sécurité.** Tout ce qui s'exécute dans le navigateur est visible et modifiable par l'utilisateur. Une clé d'API secrète ou un calcul de prix doit donc tourner côté serveur.
- **Fiabilité.** Si l'utilisateur ferme l'onglet, un workflow frontend s'arrête. Un workflow backend continue.
- **Performance.** Les traitements lourds ou en masse se font côté serveur.

## 1.5 Modèle économique

| Concept | Définition |
|---|---|
| **Workload Units (WU)** — spécifique à **Bubble** | Unité de mesure de la **charge serveur** consommée par une application Bubble. **Chaque opération côté serveur** en consomme une fraction : chargement de page, recherche dans la base, exécution d'un workflow, appel d'API, écriture de données, téléversement de fichier. Chaque forfait inclut un quota mensuel (environ 50 000 WU en gratuit, 175 000 WU sur le plan Starter en 2026). Au-delà, on paie un supplément. **Problème** : le coût dépend du nombre d'utilisateurs et de la façon dont l'app est construite. Une app mal optimisée (recherches répétées, listes non paginées) peut consommer des centaines de WU par utilisateur et par jour. La facture devient **imprévisible**. |
| **Facturation par siège** (*per seat*) | On paie par éditeur ou par utilisateur final (Retool, Appsmith, Budibase, ToolJet). Coût prévisible, mais élevé si l'on a beaucoup d'utilisateurs. |
| **Facturation par crédits / tokens** | Chaque message envoyé à l'IA consomme des crédits (Lovable) ou des tokens (Bolt, v0). Coût lié à l'intensité du développement, pas à l'usage en production. |
| **Facturation par « updates »** — Glide | Chaque synchronisation de données ou exécution de workflow compte comme une *update*, avec un quota mensuel. |

## 1.6 Données et backend

| Concept | Définition | Exemple |
|---|---|---|
| **Backend** | Partie serveur d'une application : logique métier, base de données, authentification, API. | |
| **BaaS** (*Backend as a Service*) | Backend « clé en main » hébergé, qui fournit une base de données, l'authentification, le stockage de fichiers et des fonctions serveur via des API générées automatiquement. | **Supabase** (PostgreSQL), **Firebase** (Google, NoSQL), **Xano** |
| **Source de données** (*data source*, *resource*, *datasource*) | Toute origine de données à laquelle l'application se connecte : base SQL, API, tableur. | PostgreSQL, Google Sheets, API Stripe |
| **Connecteur** | Module prêt à l'emploi qui sait parler à une source précise sans que l'on écrive le code de connexion. | Connecteur « MySQL » de Retool |
| **API REST** | Interface d'échange de données par HTTP, avec des URL et des verbes (`GET`, `POST`, `PUT`, `DELETE`). | `GET https://api.exemple.com/produits` |
| **GraphQL** | Langage de requête d'API où le client demande exactement les champs voulus. | |
| **CRUD** | *Create, Read, Update, Delete* : les 4 opérations de base sur les données. Beaucoup d'outils génèrent automatiquement des écrans CRUD. | |
| **Base SQL / relationnelle** | Données en tables avec relations et schéma strict. | PostgreSQL, MySQL |
| **Base NoSQL** | Données en documents JSON, clés-valeurs ou graphes, avec un schéma souple. | MongoDB, CouchDB, Firestore |
| **ORM** | Bibliothèque qui manipule une base SQL avec des objets du langage plutôt qu'en SQL brut. | Prisma, Drizzle |
| **RLS** (*Row Level Security*) | Règles de sécurité **au niveau de chaque ligne** d'une table, appliquées par la base elle-même. | « Un utilisateur ne voit que ses propres commandes » (Supabase) |
| **Authentification / Autorisation** | Authentification : **qui** est l'utilisateur (connexion). Autorisation : **ce qu'il a le droit** de faire. | |
| **RBAC** (*Role-Based Access Control*) | Gestion des droits par **rôles** et **groupes d'utilisateurs** (admin, éditeur, lecteur…). | |
| **SSO / SAML / OIDC** | Connexion unique avec le compte de l'entreprise (Google Workspace, Microsoft Entra, Okta). | |

## 1.7 Cycle de vie, déploiement et collaboration

| Concept | Définition | Exemple |
|---|---|---|
| **Environnements de développement et de production** | Mécanisme où l'on dispose d'au moins **deux copies** de l'application. **Développement / Test / Staging** : on modifie et on teste sans risque, souvent avec des **données de test séparées**. **Production / Live** : la version utilisée par les vrais utilisateurs avec les vraies données. On **publie** (*deploy*) la version de test vers la production quand elle est validée. | Bubble : `monapp.bubbleapps.io/version-test` (dev, base de données de test) et `monapp.com` (live, base réelle) |
| **Staging** | Environnement intermédiaire, copie fidèle de la production, pour les derniers tests. | |
| **Hébergement** (*hosting*) | Lieu où l'application tourne et est accessible sur Internet. **Cloud géré** : l'éditeur héberge. **Auto-hébergement** (*self-hosting*) : on installe l'outil sur ses propres serveurs, via Docker ou Kubernetes. **On-premise** : dans les locaux de l'entreprise. | |
| **Docker / Kubernetes** | Docker emballe une application et ses dépendances dans un **conteneur** portable. Kubernetes orchestre de nombreux conteneurs en production. | `docker run appsmith/appsmith-ce` |
| **Versioning / contrôle de version** | Garder l'**historique** des modifications pour revenir en arrière (*rollback*) et savoir qui a modifié quoi. | |
| **Git** | Le système de contrôle de version standard. Notions clés : **commit** (instantané), **branche** (ligne de développement parallèle), **merge** (fusion de branches), **pull request** (demande de fusion relue par un pair). | GitHub, GitLab |
| **CI/CD** | Intégration et déploiement continus : tests et mise en production automatisés à chaque modification. | |
| **Collaboration temps réel** (*multiplayer*) | Plusieurs personnes éditent la même application en même temps, comme dans Google Docs ou Figma. | |

## 1.8 Ouverture, propriété et architecture

| Concept | Définition |
|---|---|
| **Vendor lock-in** (enfermement propriétaire) | Situation où l'on **ne peut pas quitter** une plateforme sans **tout reconstruire**, parce que l'application n'existe que dans le format et le moteur propriétaires de l'éditeur. Risques : hausse de prix, fermeture du service, limites techniques impossibles à dépasser. |
| **Export de code** | Possibilité de **télécharger le code source** de l'application dans un langage ou framework standard (React, Vue, Flutter…) pour le faire tourner et le modifier **hors de la plateforme**. Il faut distinguer trois niveaux. **(1) Code source lisible et maintenable** (Lovable, Bolt, FlutterFlow, Plasmic). **(2) Code compilé / build** : déployable mais pas réellement modifiable (WeWeb). **(3) Export JSON/YAML** : réimportable uniquement dans la même plateforme. Ce n'est **pas** un vrai export de code (Appsmith, Budibase, ToolJet, Retool). |
| **Interprétation à l'exécution vs génération de code** | Deux philosophies techniques. **Interprétation (*runtime*)** : l'application est stockée sous forme de **description JSON**, et un **moteur propriétaire** la lit et l'affiche à chaque exécution (Bubble, Retool, Appsmith…). Rien n'est exportable car sans le moteur, le JSON ne sert à rien. **Génération de code (*codegen*)** : l'outil **produit des fichiers source** (Dart, React…) qui vivent indépendamment de l'outil (FlutterFlow, Lovable, Bolt). |
| **Open source** | Code source de la plateforme **publiquement accessible**, modifiable et redistribuable selon une **licence**. |
| **Licences permissives** (MIT, Apache 2.0, BSD) | On peut réutiliser le code, même dans un produit commercial fermé. Il suffit de garder la mention de copyright. Apache 2.0 ajoute une protection sur les brevets. |
| **Licences copyleft** (GPL v3, AGPL v3) | Si l'on **distribue** un logiciel dérivé, il doit rester sous la même licence (GPL). L'**AGPL** étend cette obligation aux logiciels **utilisés via le réseau** : un SaaS modifié doit publier ses sources. C'est très contraignant pour un produit commercial fermé. |
| **Open core** | Modèle où une **édition communautaire** est open source et où les fonctions avancées (SSO, audit, Git…) sont dans une **édition entreprise** payante et fermée. Appsmith, Budibase et ToolJet suivent ce modèle. |
| **Architecture monolithique** | Toute l'application (interface, logique, accès aux données) est **un seul programme déployé d'un bloc**. Simple à développer et déployer, plus difficile à faire évoluer à grande échelle. |
| **Architecture en couches** (*n-tiers*) | Séparation logique en couches : **présentation** (UI) → **logique métier** → **accès aux données** → **base**. Le classique est l'architecture 3-tiers (client / serveur d'application / base de données). Elle peut être monolithique ou distribuée. |
| **Microservices** | L'application est découpée en **petits services indépendants**, chacun avec sa responsabilité, déployés séparément et communiquant par API ou messages. Bonne scalabilité, complexité opérationnelle élevée. |
| **Serverless / JAMstack** | Le frontend est statique ou SPA, hébergé sur un CDN. La logique serveur est dans des **fonctions à la demande** (*Edge Functions*, *Cloud Functions*) et la base est un BaaS. Lovable + Supabase et FlutterFlow + Firebase suivent ce modèle. |
| **Multi-tenant** | Une seule infrastructure sert de nombreux clients, dont les données sont isolées logiquement (Bubble Cloud, Retool Cloud…). |

## 1.9 Intelligence artificielle

| Concept | Définition |
|---|---|
| **LLM** (*Large Language Model*) | Modèle de langage (GPT, Claude, Gemini…) capable de générer du texte et du code à partir d'instructions. |
| **Modèle multimodal / VLM** (*Vision-Language Model*) | LLM qui accepte aussi des **images** en entrée. C'est ce qui permet le « capture d'écran → interface » des outils actuels. |
| **Prompt-to-app** | Génération d'une application complète à partir d'une description textuelle. |
| **Image-to-UI / Screenshot-to-code / Sketch-to-UI** | Génération d'une interface à partir d'une **image** : capture d'écran, maquette exportée ou croquis à la main. **C'est le cœur du sujet du mémoire.** |
| **Agent IA** | IA qui **planifie et exécute plusieurs actions** (créer des fichiers, lancer des commandes, corriger des erreurs) de façon autonome. |
| **Édition visuelle post-génération** | Après la génération par l'IA, possibilité de **cliquer** sur un élément pour le modifier, au lieu de tout redécrire par prompt. |
| **MCP** (*Model Context Protocol*) | Protocole standard pour connecter une IA à des outils et des données externes. |
| **RAG** | *Retrieval-Augmented Generation* : l'IA consulte une base de documents avant de répondre. |

---

# 2. LES OUTILS ÉTUDIÉS ET LES OUTILS AJOUTÉS

## 2.1 Les 10 outils de départ, classés par famille

| Famille | Outils | Idée générale |
|---|---|---|
| **A. Full-stack no-code (web + mobile)** | **Bubble** | Tout-en-un : interface, base de données, workflows, hébergement |
| **B. Frontend builder (devenu full-stack en 2026)** | **WeWeb** | Éditeur visuel professionnel de frontend Vue.js, avec un backend natif ajouté en avril 2026 |
| **C. Internal tools low-code** | **Retool**, **Appsmith**, **Budibase**, **ToolJet** | Interfaces d'administration et tableaux de bord branchés sur des données existantes |
| **D. No-code « à partir des données »** | **Glide** | Application générée à partir d'un tableur ou d'une table, orientée mobile |
| **E. Mobile natif low-code avec génération de code** | **FlutterFlow** | Éditeur visuel qui génère du vrai code Flutter/Dart |
| **F. AI App Builders (prompt → code)** | **Lovable**, **Bolt.new** | L'IA écrit une application React complète à partir d'un prompt |

## 2.2 Outils supplémentaires recommandés

Ils sont détaillés plus brièvement en [section 5](#5-outils-complémentaires-pertinents-pour-le-mémoire). Les outils marqués ⭐ sont **directement liés au sujet du mémoire** (maquette ou image → interface).

| Famille | Outil | Pourquoi l'ajouter |
|---|---|---|
| **Design-to-code ⭐** | **Locofy**, **Anima**, **Builder.io Visual Copilot** | Convertissent des maquettes Figma en code (React, Vue, Angular, Flutter…). C'est la catégorie la plus proche du sujet. |
| **Image/sketch-to-UI ⭐** | **Uizard** (Wireframe Scanner, Screenshot Scanner) | Transforme un **croquis dessiné à la main** ou une capture en maquette éditable. C'est l'outil le plus proche de la problématique du mémoire. |
| **Image/text-to-UI ⭐** | **Google Stitch** (ex-Galileo AI) | Google Labs : prompt, croquis ou image → design d'interface + code |
| **AI App Builders** | **v0 (Vercel)**, **Replit Agent** | Concurrents directs de Lovable et Bolt. v0 génère du React/Next.js + shadcn/ui. |
| **Open source / recherche ⭐** | **screenshot-to-code** (abi), **bolt.diy**, **Onlook** | Projets open source réutilisables pour le prototype du mémoire |
| **Travaux académiques ⭐** | **pix2code** (2017), **Sketch2Code** (Microsoft, 2018), **Design2Code** (benchmark, 2024) | Indispensables dans un état de l'art scientifique : ce sont les références fondatrices du domaine. |
| **Sites web / SEO** | **Webflow**, **Framer** | Références du no-code orienté site vitrine, avec HTML statique et un très bon SEO. Utiles comme point de comparaison sur le SEO. |
| **Builder visuel open source + export React** | **Plasmic** | Exemple de builder qui génère du **vrai code React** et supporte le SSR (Next.js) |
| **Mobile no-code** | **Adalo**, **Draftbit** | Alternatives mobiles à FlutterFlow |
| **Low-code entreprise** | **OutSystems**, **Mendix**, **Microsoft Power Apps** | Les leaders du marché low-code « grand compte » (Gartner). À citer pour la complétude. |
| **Bibliothèques pour construire un builder** | **GrapesJS**, **Craft.js**, **Puck** | Briques open source pour **construire notre propre éditeur** glisser-déposer (voir [section 8](#8-open-source--quoi-récupérer-pour-notre-propre-outil-)) |

---

# 3. GRILLE DE CRITÈRES

## 3.1 Tes critères, reformulés et regroupés

Tes 30 questions ont été regroupées en **9 catégories** pour structurer l'analyse :

| # | Catégorie | Critères (tes questions) |
|---|---|---|
| **C1** | **Construction de l'interface** | Arbre des composants / UI builder ; glisser-déposer ; système de pages ; notion de groupe ; responsive ; éléments réutilisables |
| **C2** | **Rendu & référencement** | SPA ? ; SEO ? |
| **C3** | **Logique & extensibilité** | Workflows (front / back) ; workflow units ; JavaScript personnalisé quand le visuel ne suffit pas |
| **C4** | **Données & backend** | Connexion au backend ; comment se connecter à une source de données ; base de données intégrée (type) ; création de la base dans l'app ; export du backend |
| **C5** | **Intelligence artificielle** | IA pour dessiner les composants ; modification après génération IA ; upload d'image pour extraire la structure |
| **C6** | **Cycle de vie & équipe** | 2 environnements test/production ; hébergement ; collaboration ; versioning |
| **C7** | **Ouverture** | Export du code (React/Angular/Vue…) ; vendor lock-in ; open source + recommandation de réutilisation |
| **C8** | **Technologie & architecture** | Technologie de développement de l'outil ; architecture (monolithe, microservices, couches) ; comment on développe un outil no-code |
| **C9** | **Cible** | Web, mobile ou les deux |

## 3.2 Critères manquants, ajoutés à la grille

Ta liste est déjà riche. Pour un état de l'art **complet et défendable devant un jury**, il manque les critères suivants :

| Critère ajouté | Catégorie | Pourquoi il est important |
|---|---|---|
| **Public cible & courbe d'apprentissage** | C9 | Un outil pour développeurs (Appsmith) n'est pas comparable à un outil pour non-techniciens (Glide). |
| **Cas d'usage principal** | C9 | Site public, SaaS, outil interne, app mobile : cela détermine les critères qui comptent. |
| **Modèle de tarification** | C9 | WU, sièges, crédits IA : le coût influence le choix autant que les fonctions. |
| **Authentification & gestion des rôles (RBAC)** | C4 | Presque toute application réelle en a besoin. |
| **Sécurité & conformité** (RGPD, SOC 2, résidence des données) | C6 | Critère décisif en entreprise et pour les données sensibles. |
| **Extensibilité : plugins / composants personnalisés / marketplace** | C3 | Que faire quand un composant n'existe pas ? |
| **Import de maquettes (Figma)** | C5 | **Directement lié au mémoire** : quels outils acceptent une maquette en entrée ? |
| **Qualité / fidélité de la conversion maquette → UI** | C5 | **Cœur du mémoire** : la structure extraite est-elle fidèle (positions, tailles, couleurs, hiérarchie) ? Est-elle éditable ? |
| **Nature de l'output IA : code ou objets visuels éditables** | C5 | L'IA génère-t-elle du code (Lovable) ou des composants dans l'éditeur visuel (Bubble AI) ? Cela conditionne la modification après génération. |
| **Accès aux fonctions natives du téléphone** (caméra, GPS, notifications, hors-ligne) | C9 | Pour comparer les capacités mobiles. |
| **Performance & scalabilité** | C8 | Les apps no-code sont souvent critiquées sur leur lenteur. |
| **Accessibilité (a11y) & internationalisation (i18n)** | C1 | Contraintes de qualité des IHM, un thème central d'un mémoire sur les IHM. |
| **Gestion d'état / variables** | C3 | Comment l'app mémorise ce qui se passe à l'écran. |
| **Débogage & tests** | C6 | Peut-on tester et déboguer facilement ? |
| **Communauté, documentation, maturité** | C9 | Facteurs de pérennité. |

---

# 4. FICHES DÉTAILLÉES PAR OUTIL

Chaque fiche suit **la même grille** pour faciliter la comparaison.
Légende : ✅ oui / complet — 🟡 partiel / sous conditions — ❌ non — ❓ à vérifier.

---

## 4.1 BUBBLE

**Identité.** Bubble Group Inc., New York, fondé en 2012. Plateforme **no-code full-stack** propriétaire. C'est l'outil no-code le plus connu, avec plusieurs millions d'utilisateurs.
**Public** : fondateurs non techniques, startups, agences no-code. **Cas d'usage** : SaaS, marketplaces, MVP, portails clients.

| Critère | Analyse |
|---|---|
| **UI Builder / arbre des composants** | ✅ Éditeur visuel complet avec un **Element Tree** (arbre hiérarchique de la page) qui permet de sélectionner, renommer, masquer et réordonner les éléments. |
| **Glisser-déposer** | ✅ Oui, depuis le panneau d'éléments (Text, Button, Input, Image, Group, Repeating Group, Popup…). |
| **Système de pages** | ✅ Chaque page Bubble a sa propre URL (`/index`, `/profil`…). Bubble permet aussi le schéma **« single-page »** : une page unique où l'on affiche ou masque des groupes selon un paramètre d'URL. C'est très utilisé pour la fluidité. |
| **Notion de groupe** | ✅ Très riche : **Group** (conteneur), **Repeating Group** (liste répétée liée à des données), **Popup** (fenêtre modale), **Floating Group** (barre fixe), **Group Focus** (menu déroulant). Un groupe peut avoir un *type de contenu* : il « porte » une donnée (ex. un Produit) que ses enfants affichent. |
| **Responsive** | ✅ Moteur responsive basé sur **Flexbox** (lignes, colonnes, alignements, largeurs min/max) et des **conditions** sur la largeur de page pour adapter l'affichage. Puissant, mais c'est l'une des notions les plus difficiles à maîtriser pour les débutants. |
| **Éléments réutilisables** | ✅ **Reusable Elements** : en-têtes, pieds de page, popups partagés entre pages, avec leurs propres workflows et propriétés. |
| **SPA ?** | 🟡 **Hybride.** Chaque page est chargée séparément (comportement MPA), mais à l'intérieur d'une page le rendu est fait en JavaScript par le moteur Bubble (CSR). Avec le schéma single-page, l'app se comporte comme une SPA. |
| **SEO** | 🟡 **Correct, mais pas excellent.** Bubble propose des réglages SEO par page (titre, description, image Open Graph), des URL personnalisées, un **sitemap** automatique et un fichier robots.txt. Mais le rendu dépend du JavaScript, les pages sont lourdes et le score Lighthouse est souvent moyen. Bubble est meilleur que les SPA pures (WeWeb) mais nettement moins bon que Webflow. |
| **Workflows** | ✅ **Cœur de Bubble.** **Workflows frontend** (page) : *When Button is clicked → Create a new Thing → Show Popup → Navigate*. **Backend Workflows** (*API Workflows*) : exécutés côté serveur, déclenchables par API externe (webhook), **planifiables** (*Schedule API workflow*), récursifs sur des listes, avec des **Database triggers** (*quand une donnée change…*). |
| **Workload Units** | ⚠️ **Oui, Bubble est le seul de la liste à facturer ainsi** (voir le glossaire). Toute opération serveur (recherche, workflow, chargement de page, appel API) consomme des WU. Bubble fournit un tableau de bord de suivi de la consommation par page et par workflow. C'est la critique la plus fréquente de l'outil. |
| **JS personnalisé** | 🟡 Pas d'éditeur JS natif dans l'éditeur. On passe par des **plugins** (*Toolbox* : action « Run JavaScript », élément « Expression ») ou par le **Plugin Editor**, qui permet de créer ses propres éléments et actions en JavaScript (côté client et côté serveur Node.js). On peut aussi injecter du HTML/JS dans un élément **HTML**. |
| **Connexion backend** | ✅ Backend intégré (on n'a pas besoin d'un backend externe). Pour les services externes : **API Connector** (REST/JSON, authentification OAuth, clés API) et des connecteurs SQL via plugin (**SQL Database Connector** : PostgreSQL, MySQL, MS SQL). |
| **Comment se connecter aux données** | Les données internes sont accessibles par **« Do a search for… »** (requêtes visuelles avec contraintes et tris). Les données externes passent par l'**API Connector** : on décrit l'appel (URL, méthode, en-têtes), Bubble l'initialise et en déduit la structure, puis l'appel s'utilise comme source de données ou comme action. |
| **Base de données intégrée** | ✅ **Oui, propriétaire.** Modèle par **Data Types** (« Things ») avec champs et relations (champ de type « liste de Produits »). Elle repose sur PostgreSQL en interne, mais **on n'a pas d'accès SQL direct**. Les **Privacy Rules** (règles de confidentialité) jouent le rôle de RLS. |
| **Création de la BDD dans l'app** | ✅ Onglet **Data** : création des types, des champs, des *Option Sets* (énumérations), et vue tableur des enregistrements. Import et export CSV. |
| **IA pour générer l'UI** | ✅ **Bubble AI** : génération d'une application complète (pages, base de données, workflows) à partir d'un prompt. **Bubble AI Agent** (bêta) : chat dans l'éditeur pour créer ou modifier des éléments, des workflows et des expressions. |
| **Modification après génération IA** | ✅ **Excellent point.** L'IA produit des **éléments Bubble natifs** (pas du code), entièrement modifiables ensuite dans l'éditeur visuel, sans repasser par l'IA. |
| **Upload d'image → structure UI** | ✅ **Oui (2025-2026)** : on peut téléverser une **capture d'écran, un export Figma ou une inspiration UI**, et l'agent construit l'interface correspondante dans l'éditeur. Il existe aussi un **import Figma** officiel (conversion d'un fichier Figma en éléments Bubble). |
| **2 environnements** | ✅ **Development** (`/version-test`, avec **sa propre base de données de test**) et **Live** (production). On déploie de dev vers live en un clic. Les plans supérieurs offrent des **branches** de développement supplémentaires. |
| **Hébergement** | Cloud Bubble uniquement (sur AWS). **Pas d'auto-hébergement**, sauf une offre Enterprise *dedicated* (serveur dédié géré par Bubble). Les noms de domaine personnalisés sont supportés. |
| **Collaboration** | ✅ Édition **simultanée** à plusieurs, avec des droits par collaborateur. Le nombre d'éditeurs dépend du plan. |
| **Versioning** | 🟡 **Savepoints** (points de restauration automatiques), restauration à une date donnée, **branches** et **merge** (nouveau système de version control). Pas de Git. |
| **Export de code** | ❌ **Aucun.** Bubble le dit explicitement : on est propriétaire de ses **données** (export CSV) et de son **design**, mais **pas d'un code source** exportable. |
| **Export backend** | ❌ Non. Seulement les données en CSV et l'API de données de Bubble. |
| **Vendor lock-in** | 🔴 **Très fort.** Quitter Bubble revient à réécrire toute l'application. |
| **Open source** | ❌ Propriétaire. |
| **Technologie de l'outil** | Éditeur et moteur d'exécution en **JavaScript** (front) et **Node.js** (serveur), base **PostgreSQL** en interne, infrastructure **AWS**. Les applications mobiles natives reposent sur **React Native**. (Les détails internes ne sont pas publics.) |
| **Architecture** | La plateforme est un **monolithe multi-tenant** propriétaire, hébergé sur AWS. L'application produite suit une architecture **3-tiers classique** : client (moteur JS Bubble), serveur Bubble (workflows) et base PostgreSQL interne, le tout sur l'infrastructure Bubble. |
| **Web / mobile** | ✅ **Les deux** : web responsive + **applications natives iOS/Android** (bêta en 2026 ; publication sur les stores à partir du plan Growth). Elles accèdent à la caméra, à la biométrie et aux notifications push. |
| **Tarification** | Gratuit → Starter (environ 59 $/mois) → Growth (environ 209 $/mois, mobile) → Team → Enterprise, **+ WU**. |
| **Forces / faiblesses** | **Forces** : tout-en-un, énorme écosystème (plus de 1 000 plugins), IA qui produit des éléments éditables, image → UI. **Faiblesses** : WU imprévisibles, aucun export, performance, courbe d'apprentissage plus longue qu'annoncé. |

---

## 4.2 WEWEB

**Identité.** Startup française (Paris), fondée en 2018. À l'origine **frontend builder** Vue.js, la plateforme est devenue **full-stack en avril 2026** avec le lancement de **WeWeb Backend** (WeWeb Tables + Backend Workflows).
**Public** : profils techniques et semi-techniques, agences. **Cas d'usage** : portails clients, SaaS, dashboards, back-offices.

| Critère | Analyse |
|---|---|
| **UI Builder / arbre** | ✅ Éditeur très professionnel, « à la Figma », avec un **Layout panel** (arbre des éléments). C'est l'un des contrôles de mise en page les plus fins du marché. |
| **Glisser-déposer** | ✅ Oui. |
| **Système de pages** | ✅ Pages avec routes, **paramètres d'URL dynamiques** (`/produit/:id`), dossiers de pages et pages protégées par authentification. |
| **Notion de groupe** | ✅ **Containers**, **Sections** (blocs de page), Columns, Div, **Modals/Popups**, **Collection list** (liste répétée). |
| **Responsive** | ✅ **Très bon** : Flexbox et **CSS Grid** natifs, **breakpoints** configurables (desktop, tablette, mobile et personnalisés). Chaque propriété de style peut varier selon le breakpoint. |
| **Éléments réutilisables** | ✅ **Components** réutilisables avec propriétés, plus des **bibliothèques partagées** entre projets. On peut aussi coder des **composants Vue.js personnalisés** et les importer. |
| **SPA ?** | ✅ **Oui, SPA Vue.js en rendu client (CSR).** |
| **SEO** | 🟡 **Limité.** Des réglages de meta tags par page et un sitemap sont disponibles, et un **pré-rendu** des pages statiques est proposé. Mais le rendu reste client, et le **CEO a confirmé que le SSR n'est pas au programme de 2026**. Les scores Lighthouse mobile observés sur des pages publiques sont souvent bas (20–50). Ce n'est pas l'outil adapté à un site qui vit du trafic Google. |
| **Workflows** | ✅ **Workflows frontend** (sur événements : clic, chargement de page, changement de variable) avec actions : appels API, navigation, variables, boucles, conditions (*true/false split*), JavaScript. **Workflows globaux** réutilisables. **Backend Workflows** (depuis avril 2026) : création d'**endpoints d'API** et de fonctions serveur réutilisables. Auparavant, la logique serveur était déléguée à Xano ou Supabase. |
| **Workflow units** | ❌ Pas de WU. Facturation par sièges d'éditeur et par plan d'hébergement (sessions, bande passante). |
| **JS personnalisé** | ✅ **Partout** : formules en JavaScript dans n'importe quelle propriété liée, action « **Custom JavaScript** » dans les workflows, composants **Vue.js** codés à la main, import de bibliothèques npm via les composants. |
| **Connexion backend** | ✅ **Agnostique** : connecteurs natifs **Supabase**, **Xano**, **Airtable**, **Firebase**, Google Sheets, **REST**, **GraphQL**, et désormais le **backend WeWeb natif**. |
| **Comment se connecter** | On ajoute un **plugin de source de données** (ex. Supabase : URL + clé publique), puis on crée des **Collections** (requêtes sauvegardées) que l'on **lie** aux éléments. Les écritures se font via des actions de workflow. |
| **Base de données intégrée** | ✅ **Depuis avril 2026 : WeWeb Tables**, une base **PostgreSQL** avec une interface de type tableur, des **API CRUD générées automatiquement**, l'authentification et le stockage. Avant 2026 : ❌, il fallait un backend externe. |
| **Création BDD dans l'app** | ✅ Depuis 2026 (définition de schéma, tables, vues filtrées). |
| **IA pour générer l'UI** | ✅ **WeWeb AI** (bêta depuis février 2025) : génération de pages, de composants, de workflows et de formules par prompt dans l'éditeur. |
| **Modification après IA** | ✅ L'IA produit des éléments natifs de l'éditeur, entièrement modifiables visuellement. |
| **Upload d'image → UI** | ❓ À vérifier dans la documentation WeWeb AI (pas de fonction « screenshot-to-page » documentée trouvée). |
| **2 environnements** | ✅ **Editor** (brouillon) → **Staging** (préproduction) → **Production**, avec des URL distinctes. Des variables d'environnement permettent de pointer vers un backend de test ou de production. |
| **Hébergement** | Cloud WeWeb (CDN), **ou auto-hébergement** du frontend exporté (Vercel, Netlify, Cloudflare, AWS, serveur personnel). |
| **Collaboration** | 🟡 Multi-éditeurs, mais la **collaboration avancée** (branches, déploiements séparés) est jugée insuffisante par plusieurs utilisateurs. |
| **Versioning** | 🟡 Historique des publications avec **rollback** vers une version précédente et sauvegardes. Pas de Git natif. |
| **Export de code** | 🟡 **Oui, mais compilé** : export de l'application sous forme d'une **SPA Vue.js buildée** (zip prêt à déployer). La documentation WeWeb elle-même indique que **maintenir ce code hors de l'éditeur n'est pas réaliste**. C'est un export de **déploiement**, pas un code source de travail. |
| **Export backend** | ❓ Le backend natif (2026) est basé sur PostgreSQL : les données sont exportables. L'export de la logique serveur sous forme de code n'est pas documenté. |
| **Vendor lock-in** | 🟢 **Faible côté frontend** (export + auto-hébergement possible, backend externe au choix). 🟡 Il augmente si l'on adopte le backend natif WeWeb. |
| **Open source** | ❌ La plateforme est propriétaire. Le SDK des composants personnalisés est public. |
| **Technologie de l'outil** | **Vue.js** (éditeur et applications générées). |
| **Architecture produite** | **SPA (couche présentation) + backend découplé** (BaaS / API) : architecture **découplée de type « headless » / 3-tiers**, où le frontend ne fait qu'appeler des API. |
| **Web / mobile** | Web (responsive) + **PWA**. **Pas d'application native.** |
| **Forces / faiblesses** | **Forces** : précision du design, liberté du backend, export, JavaScript partout. **Faiblesses** : SEO (pas de SSR), collaboration, documentation parfois en retard, tarification à deux lignes (sièges + hébergement). |

---

## 4.3 RETOOL

**Identité.** Retool Inc., San Francisco, fondé en 2017. **Leader des outils internes low-code** pour développeurs.
**Public** : développeurs et équipes techniques en entreprise. **Cas d'usage** : back-offices, dashboards, outils d'administration, support client, outils d'approbation.

| Critère | Analyse |
|---|---|
| **UI Builder / arbre** | ✅ IDE visuel avec un **Component tree** (panneau « Explorer ») listant composants, requêtes et variables. |
| **Glisser-déposer** | ✅ Plus de 100 composants (Table, Form, Chart, Modal, Tabs, Container, Key-Value, JSON editor…) sur une **grille**. |
| **Système de pages** | ✅ **Applications multipages** (pages avec URL et paramètres) et navigation entre applications. |
| **Notion de groupe** | ✅ **Container**, **Tabbed Container**, **Form**, **Modal**, **Drawer/Side panel**, **List View** (liste répétée), **Stepped container** (assistant en étapes). |
| **Responsive** | 🟡 Grille **pensée pour le desktop**, avec un **layout mobile** séparé à configurer. Les applications mobiles natives passent par un produit distinct, **Retool Mobile**. |
| **Éléments réutilisables** | ✅ **Modules** : groupes de composants et de requêtes réutilisables entre applications, avec entrées et sorties. Il existe aussi des **Custom Components** codés en React. |
| **SPA ?** | ✅ Le runtime Retool est une application **React** monopage. |
| **SEO** | ❌ **Sans objet** : les apps sont des outils internes derrière une authentification. Le SEO n'est ni prévu ni nécessaire. |
| **Workflows** | ✅ **Front** : *event handlers* sur les composants (onClick → run query → show notification), avec des requêtes JS et SQL chaînées. **Back** : **Retool Workflows**, un produit dédié d'automatisation serveur avec un éditeur en blocs (*cron*, webhooks, boucles, conditions, code Python ou JS, appels LLM). |
| **Workflow units** | ❌ Pas de WU. Facturation par **utilisateurs** (standard et finaux) et, pour Workflows, par **nombre d'exécutions**. |
| **JS personnalisé** | ✅ **Partout** : `{{ }}` dans toutes les propriétés, **JS queries**, *transformers* (transformation de données), bibliothèques JS importables, **Python** dans Workflows, **Custom Components React**. |
| **Connexion backend** | ✅ **Le point fort de Retool** : connecteurs natifs vers PostgreSQL, MySQL, MongoDB, Snowflake, BigQuery, Redis, Elasticsearch, Google Sheets, Stripe, Salesforce, Slack, Twilio…, plus **REST, GraphQL et gRPC**. |
| **Comment se connecter** | On crée une **Resource** (connexion configurée une seule fois par un administrateur, avec les identifiants stockés côté serveur). Dans chaque app, on écrit des **Queries** (SQL ou appels API) sur cette ressource, puis on lie les résultats aux composants (`{{ query1.data }}`). Les requêtes passent par le **serveur Retool**, ce qui garantit que les identifiants ne sont jamais exposés au navigateur. |
| **Base de données intégrée** | ✅ **Retool Database** : PostgreSQL géré, avec une interface tableur. Elle convient aux petits volumes, pas au traitement de grosses données. |
| **Création BDD dans l'app** | ✅ Via Retool Database (création de tables, colonnes, import CSV). |
| **IA pour générer l'UI** | ✅ **Retool AI / AppGen** et **Assist** (2025-2026) : génération et modification d'applications par prompt dans l'IDE, sur **vos données réelles**. Il y a aussi des **Retool Agents** (agents IA connectés à vos outils) et des blocs LLM dans Workflows. |
| **Modification après IA** | ✅ L'IA produit des composants et des requêtes Retool natifs, modifiables visuellement. Chaque requête est montrée avant exécution, et des **checkpoints** sont sauvegardés automatiquement. |
| **Upload d'image → UI** | ❓ Non documenté. |
| **2 environnements** | ✅ **Environnements multiples** (ex. *staging* et *production*) : chaque ressource peut pointer vers une base différente selon l'environnement. Les **Releases** versionnées permettent de publier une version précise. |
| **Hébergement** | **Cloud Retool** ou **auto-hébergé** (Docker, Kubernetes, sur AWS, GCP, Azure ou on-premise), ce qui est très demandé en entreprise. |
| **Collaboration** | ✅ Édition **multijoueur**, permissions par groupe, commentaires. |
| **Versioning** | ✅ Historique, *Releases*, et **Source Control** (synchronisation Git avec branches et pull requests) sur le plan **Enterprise**. |
| **Export de code** | ❌ Pas d'export vers React. Les apps sont stockées en **JSON/YAML** (via Source Control) et ne tournent que dans le runtime Retool. |
| **Export backend** | ❌ (la logique reste dans Retool). |
| **Vendor lock-in** | 🔴 **Fort** sur la couche applicative. Les **données**, elles, restent dans vos bases. |
| **Open source** | ❌ Propriétaire. |
| **Technologie de l'outil** | Frontend **React / TypeScript**, backend **Node.js**, base de stockage interne **PostgreSQL**. En auto-hébergé, Workflows s'appuie sur **Temporal** (moteur d'orchestration). |
| **Architecture** | En auto-hébergement, Retool se déploie en **plusieurs services conteneurisés** (API, exécuteur de code, workers Workflows, base interne), ce qui en fait une architecture **orientée services**. L'app produite suit le schéma **client → serveur Retool (proxy des requêtes) → vos sources de données**. |
| **Web / mobile** | Web + **Retool Mobile** (applications natives iOS/Android pour les équipes terrain). |
| **Forces / faiblesses** | **Forces** : connecteurs, puissance pour développeurs, sécurité entreprise, IA sur données réelles. **Faiblesses** : prix élevé par utilisateur, lock-in, maintenabilité des grosses apps, inadapté aux apps publiques. |

---

## 4.4 APPSMITH

**Identité.** Appsmith Inc., fondé en 2019 (Inde / États-Unis). **Alternative open source à Retool.**
**Public** : développeurs. **Cas d'usage** : outils internes, back-offices, dashboards.

| Critère | Analyse |
|---|---|
| **UI Builder / arbre** | ✅ **Entity Explorer** : arbre des pages, widgets, requêtes et objets JS. |
| **Glisser-déposer** | ✅ Plus de 45 widgets sur une grille. |
| **Système de pages** | ✅ Applications **multipages** avec navigation, menus et paramètres d'URL. |
| **Notion de groupe** | ✅ **Container**, **Form**, **Tabs**, **Modal**, **List** (répétition), **JSON Form** (formulaire généré depuis un objet). |
| **Responsive** | 🟡 Interface **« desktop first »**. L'adaptation mobile demande souvent un ajustement manuel (masquer ou redimensionner des widgets). |
| **Éléments réutilisables** | ✅ **Custom Widgets** (HTML/CSS/JS, éventuellement générés par prompt), bibliothèques JS importées, **Modules / Packages** réutilisables (éditions payantes). |
| **SPA ?** | ✅ Runtime **React**. |
| **SEO** | ❌ Sans objet (outils internes). |
| **Workflows** | ✅ **Front** : événements des widgets (onClick, onTextChanged…) qui déclenchent des requêtes et des fonctions JS (`storeValue`, `navigateTo`, `showModal`). **Back** : **Workflows** (éditions Business/Enterprise) pour l'automatisation côté serveur et les validations humaines (*human-in-the-loop*). |
| **Workflow units** | ❌ Facturation par utilisateur. Self-hosting communautaire gratuit. |
| **JS personnalisé** | ✅ **Central** : `{{ }}` partout, **JS Objects** (modules JavaScript complets avec fonctions et variables), import de bibliothèques externes. |
| **Connexion backend** | ✅ Plus de 25 connecteurs natifs (PostgreSQL, MySQL, MongoDB, MS SQL, Redis, Snowflake, Firestore, S3, Google Sheets…), plus **REST** et **GraphQL**. |
| **Comment se connecter** | Création d'une **Datasource** (identifiants stockés côté serveur), puis de **Queries** liées aux widgets (`{{ Query1.data }}`). Les requêtes transitent par le serveur Appsmith. |
| **Base de données intégrée** | ❌ Pas de BDD applicative intégrée à usage métier. Il faut connecter sa propre base. MongoDB est utilisée en interne pour stocker les applications elles-mêmes. |
| **Création BDD dans l'app** | ❌ |
| **IA pour générer l'UI** | 🟡 **Appsmith AI** (assistant : suggestion de widgets, écriture de JS, génération de requêtes) et **Appsmith Agents** (agents IA métier). C'est moins orienté « générer une app complète par prompt » que Retool ou Bubble. |
| **Modification après IA** | ✅ (l'output est fait de widgets et de code natifs). |
| **Upload d'image → UI** | ❌ Non documenté. |
| **2 environnements** | 🟡 **Git branches** (dev, feature, main) et, dans les éditions payantes, des **environnements multiples** de datasources (staging / production). En Community Edition, on gère cela par branches et instances séparées. |
| **Hébergement** | **Cloud Appsmith** ou **auto-hébergement** (Docker, Kubernetes, AWS AMI, gratuit en Community Edition). |
| **Collaboration** | ✅ Plusieurs éditeurs et workspaces, avec rôles. |
| **Versioning** | ✅ **Git natif, même en version gratuite** : branches, commits, pull requests, CI/CD. C'est un argument fort face à Retool. |
| **Export de code** | ❌ **Pas d'export en code exécutable** : l'app est sérialisée en **JSON/YAML** (lisible dans Git), mais ne tourne que dans le runtime Appsmith. |
| **Export backend** | ❌ |
| **Vendor lock-in** | 🟡 **Lock-in applicatif** (format Appsmith), mais **pas de lock-in d'infrastructure** : la plateforme est open source et auto-hébergeable, donc elle ne peut pas « disparaître ». |
| **Open source** | ✅ **Apache 2.0** (Community Edition). Licence **permissive**, donc réutilisable. Les éditions Business et Enterprise sont propriétaires (*open core*). |
| **Technologie de l'outil** | Frontend **React + TypeScript** (Redux), backend **Java (Spring Boot / WebFlux)**, base interne **MongoDB**, cache **Redis**, serveur Node.js annexe (*RTS*) pour le temps réel et l'évaluation de code. |
| **Architecture** | Plusieurs services (Nginx, serveur Java, serveur Node RTS, MongoDB, Redis) **empaquetés dans une seule image Docker** : un **monolithe modulaire conteneurisé**, éclatable en services sur Kubernetes. |
| **Web / mobile** | Web (responsive limité). Pas d'app native. |
| **Forces / faiblesses** | **Forces** : open source Apache 2.0, Git gratuit, auto-hébergement, coût prévisible. **Faiblesses** : exige du JavaScript, peu adapté au mobile, IA moins avancée. |

---

## 4.5 BUDIBASE

**Identité.** Budibase Ltd, Belfast (Irlande du Nord), fondé en 2019. **Plateforme open source d'outils internes**, orientée **formulaires, workflows et processus métier**.
**Public** : équipes IT et opérations, semi-techniques. **Cas d'usage** : portails de demandes, approbations, gestion d'inventaire, CRUD.

| Critère | Analyse |
|---|---|
| **UI Builder / arbre** | ✅ Éditeur de **Screens** avec un **arbre de composants** à gauche. |
| **Glisser-déposer** | ✅ Oui. |
| **Système de pages** | ✅ **Screens** avec routes (`/clients`, `/clients/:id`) et **niveau d'accès par écran** (rôle minimal requis). |
| **Notion de groupe** | ✅ **Container**, **Form**, **Repeater**, **Modal**, **Side panel**, ainsi que des **Blocks** : groupes préassemblés (ex. « Table + formulaire de détail » en un bloc). |
| **Responsive** | ✅ Mise en page responsive par défaut (empilement automatique sur mobile). C'est moins fin que WeWeb. |
| **Éléments réutilisables** | 🟡 **Blocks** et **Custom Component Plugins** (composants Svelte personnalisés installables). |
| **SPA ?** | ✅ Runtime **Svelte** monopage. |
| **SEO** | ❌ Sans objet. Il existe une option d'apps publiques (formulaires), mais elle n'est pas pensée pour le référencement. |
| **Workflows** | ✅ **Front** : *actions* sur les boutons (enregistrer une ligne, naviguer, ouvrir une modale, déclencher une automation). **Back** : **Automations** (déclencheurs : création ou modification de ligne, webhook, *cron*, appel depuis l'app ; étapes : requêtes, e-mails, JavaScript, Bash, boucles, conditions, appels LLM). |
| **Workflow units** | ❌ Facturation par utilisateur ou par créateur. Le cloud a des quotas d'exécutions d'automations. |
| **JS personnalisé** | ✅ **Bindings JavaScript** dans les propriétés (`return $("State.x") * 2`), étapes JS dans les automations, composants personnalisés. |
| **Connexion backend** | ✅ PostgreSQL, MySQL, MS SQL, Oracle, MongoDB, CouchDB, DynamoDB, Redis, S3, Google Sheets, Airtable, **REST**, GraphQL. |
| **Comment se connecter** | On ajoute une **Data source**. Budibase lit le **schéma des tables SQL** et génère automatiquement des **écrans CRUD**. On peut aussi écrire des **Queries** (SQL ou REST) réutilisables. |
| **Base de données intégrée** | ✅ **Budibase DB**, basée sur **CouchDB** (NoSQL documentaire), avec une interface tableur, des relations, des formules et des pièces jointes. |
| **Création BDD dans l'app** | ✅ Oui : création de tables, colonnes et relations, import CSV. |
| **IA pour générer l'UI** | 🟡 **Budibase AI** : génération de tables, de JavaScript et de formules, et surtout un **AI Agent builder** (agents branchés sur OpenAI, Anthropic, Mistral via LiteLLM, avec RAG via pgvector). La génération d'interface complète par prompt est moins mise en avant. |
| **Modification après IA** | ✅ (objets natifs). |
| **Upload d'image → UI** | ❌ Non documenté. |
| **2 environnements** | ✅ **Mode développement** (on édite) et **application publiée** (production). Les données de la base interne sont **séparées entre dev et prod**. On publie explicitement les changements. |
| **Hébergement** | **Budibase Cloud** ou **auto-hébergement** (Docker Compose, Kubernetes/Helm, DigitalOcean, gratuit). |
| **Collaboration** | ✅ Plusieurs créateurs, rôles (Basic, Power, Admin, rôles personnalisés), groupes d'utilisateurs. |
| **Versioning** | 🟡 **Révisions** et **sauvegardes d'application** (*backups*) restaurables (plans payants). Pas d'intégration Git native comparable à Appsmith. ❓ |
| **Export de code** | ❌ Export de l'application en **archive** (réimportable dans Budibase uniquement). |
| **Export backend** | ❌ (les données sont exportables en CSV ou JSON). |
| **Vendor lock-in** | 🟡 Applicatif, atténué par l'open source et l'auto-hébergement. |
| **Open source** | ✅ **GPL v3** (copyleft) pour le cœur de la plateforme. Les éditions payantes ajoutent des fonctions propriétaires (open core). |
| **Technologie de l'outil** | Frontend (builder + client) en **Svelte**, backend **Node.js (Koa)** en **TypeScript**, base **CouchDB**, stockage d'objets **MinIO** (compatible S3), **Redis**, proxy **Nginx**. |
| **Architecture** | **Plusieurs services conteneurisés** : *apps service* (applications et API), *worker service* (comptes, utilisateurs), CouchDB, MinIO, Redis et proxy. C'est une architecture **orientée services / microservices légers**. |
| **Web / mobile** | Web responsive + PWA. |
| **Forces / faiblesses** | **Forces** : open source, base intégrée, génération CRUD automatique, automations, agents IA. **Faiblesses** : design moins flexible, versioning moins mature, la GPL limite la réutilisation commerciale du code. |

---

## 4.6 TOOLJET

**Identité.** ToolJet Solutions, fondé en 2021 (Inde / États-Unis). **Plateforme open source** d'outils internes, repositionnée en **« ToolJet AI »** (plateforme IA pour apps internes, workflows et agents).
**Public** : développeurs et équipes métier. **Cas d'usage** : outils internes, workflows d'approbation, agents IA.

| Critère | Analyse |
|---|---|
| **UI Builder / arbre** | ✅ Éditeur visuel avec arborescence des composants (*Components / Pages / Queries*). |
| **Glisser-déposer** | ✅ Plus de 60 composants. |
| **Système de pages** | ✅ Applications **multipages**. |
| **Notion de groupe** | ✅ **Container**, **Form**, **Tabs**, **Modal**, **Listview**, **Kanban**. |
| **Responsive** | 🟡 **Deux layouts** (desktop et mobile) à configurer. |
| **Éléments réutilisables** | ✅ **Modules** réutilisables et **Custom Components** (React). |
| **SPA ?** | ✅ Runtime **React**. |
| **SEO** | ❌ Sans objet. |
| **Workflows** | ✅ **Front** : *event handlers* (onClick → run query → show alert). **Back** : **ToolJet Workflows**, éditeur visuel d'automatisation côté serveur (déclencheurs webhook ou planifiés, nœuds de requêtes, JS, conditions, boucles). |
| **Workflow units** | ❌ Facturation par utilisateur (constructeurs et utilisateurs finaux). |
| **JS personnalisé** | ✅ **JavaScript** et **Python** (exécuté dans le navigateur via Pyodide), transformations des résultats de requêtes. |
| **Connexion backend** | ✅ Plus de 80 sources : PostgreSQL, MySQL, MongoDB, MS SQL, Snowflake, BigQuery, REST, GraphQL, Google Sheets, Stripe, Airtable, S3… |
| **Comment se connecter** | Ajout d'une **Data source** (globale au workspace), puis de **Queries** dans l'app, liées aux composants via `{{queries.q1.data}}`. |
| **Base de données intégrée** | ✅ **ToolJet Database** : **PostgreSQL** exposé via **PostgREST**, avec une interface tableur. |
| **Création BDD dans l'app** | ✅ Oui. |
| **IA pour générer l'UI** | ✅ **ToolJet AI** : génération d'applications à partir d'un prompt (avec étape de spécification), aide aux requêtes et au débogage, agents IA. |
| **Modification après IA** | ✅ L'app générée est un ensemble de composants ToolJet, modifiables visuellement. |
| **Upload d'image → UI** | ❓ Non documenté. |
| **2 environnements** | ✅ **Development → Staging → Production**, avec des **valeurs de datasources par environnement** (les environnements multiples sont réservés aux plans payants) et des **versions** d'application promues d'un environnement à l'autre. |
| **Hébergement** | Cloud ToolJet ou **auto-hébergement** (Docker, Kubernetes, AWS, GCP, Azure). |
| **Collaboration** | ✅ Édition **multijoueur**, commentaires et mentions (plans payants). |
| **Versioning** | ✅ **Versions d'application** + **Git sync** (GitHub/GitLab, plans payants). |
| **Export de code** | ❌ Export **JSON** de l'application (réimport ToolJet uniquement). |
| **Export backend** | ❌ |
| **Vendor lock-in** | 🟡 Applicatif, atténué par l'open source. |
| **Open source** | ✅ **AGPL v3** (copyleft fort, réseau compris). Plus de 38 000 étoiles GitHub. Modèle open core. |
| **Technologie de l'outil** | Frontend **React**, backend **Node.js (NestJS, TypeScript)**, base **PostgreSQL**, **PostgREST** pour ToolJet DB, **Redis**. |
| **Architecture** | **Client + serveur NestJS + PostgreSQL + PostgREST** : architecture en couches conteneurisée, avec des workers séparés pour les workflows. |
| **Web / mobile** | Web (layout mobile disponible). |
| **Forces / faiblesses** | **Forces** : open source, très nombreux connecteurs, base intégrée, environnements, IA. **Faiblesses** : AGPL contraignante pour la réutilisation, fonctions clés (multi-env, Git) payantes. |

---

## 4.7 GLIDE

**Identité.** Glide (Glideapps Inc.), San Francisco, fondé en 2018. **No-code « data-first »** : l'application est générée à partir d'une table de données. En 2026, Glide a lancé **GlideOS**, une plateforme IA séparée, avec son propre abonnement et **sans migration** depuis « Glide Classic ».
**Public** : non-techniciens, PME, équipes opérationnelles. **Cas d'usage** : applications d'équipe, inventaires, CRM légers, apps terrain.

| Critère | Analyse |
|---|---|
| **UI Builder / arbre** | 🟡 Éditeur **par écrans et composants empilés verticalement** (liste de composants par écran). Il n'y a pas de canvas libre ni d'arbre profond. |
| **Glisser-déposer** | 🟡 On réordonne les composants dans une liste. Pas de positionnement libre. |
| **Système de pages** | ✅ **Screens** et **Tabs** (onglets de navigation), écrans de détail générés automatiquement pour chaque ligne. |
| **Notion de groupe** | 🟡 **Containers** (colonnes, arrière-plans), **Collections** (listes, cartes, tableaux, calendriers, kanban). |
| **Responsive** | ✅ **Automatique**, sans réglage : mobile-first, s'adapte au desktop. En contrepartie, la liberté de design est faible. |
| **Éléments réutilisables** | 🟡 Limité (duplication d'écrans, composants préfabriqués). |
| **SPA ?** | ✅ **PWA** monopage. |
| **SEO** | ❌ Non adapté (apps d'équipe, souvent privées). |
| **Workflows** | ✅ **Actions** côté client (sur clic : ajouter une ligne, ouvrir un lien, afficher une notification) + **Workflows** côté serveur (déclencheurs planifiés, webhooks, e-mails entrants, avec boucles et conditions). |
| **Workflow units** | 🟡 Pas de WU, mais des **« updates »** comptabilisées (synchronisations de données, exécutions de workflows) avec un quota mensuel par plan. Le principe se rapproche des WU. |
| **JS personnalisé** | 🟡 Colonne calculée **« JavaScript »** et **« Construct URL »**, des **Experimental code columns**, et l'appel d'API via *Call API*. Très limité pour l'interface. |
| **Connexion backend** | ✅ **Google Sheets**, **Excel**, **Airtable**, **Glide Tables**, **Big Tables** (gros volumes), **SQL** (PostgreSQL, MySQL, BigQuery… sur les plans élevés), **Salesforce**, API REST via *Call API*. |
| **Comment se connecter** | On choisit une source au moment de créer l'app (ex. un Google Sheet). **Chaque feuille devient une table**, et Glide **génère l'app automatiquement** à partir de ces tables. |
| **Base de données intégrée** | ✅ **Glide Tables** (rapide, intégrée) et **Big Tables** (jusqu'à des centaines de milliers de lignes). Type : tabulaire propriétaire, avec des **colonnes calculées** (relations, lookups, rollups, if-then-else, colonnes IA). |
| **Création BDD dans l'app** | ✅ Oui (éditeur de données intégré). |
| **IA pour générer l'UI** | 🟡 **Glide AI** : génération d'app à partir de données ou de descriptions, colonnes IA (texte vers texte, image vers texte, extraction), mode agent sur les plans payants. **GlideOS** (2026) est la nouvelle plateforme IA séparée. |
| **Modification après IA** | ✅ (composants Glide natifs). |
| **Upload d'image → UI** | ❌ Non documenté. Glide AI sait extraire du **texte** depuis une image (colonne IA), mais pas une **structure d'interface**. |
| **2 environnements** | 🟡 **Brouillon / Publié**. Il n'y a pas de véritable environnement de test avec des données séparées. On peut dupliquer l'app. |
| **Hébergement** | Cloud Glide uniquement. |
| **Collaboration** | 🟡 Plusieurs éditeurs selon le plan. |
| **Versioning** | 🟡 Historique de versions limité. ❓ |
| **Export de code** | ❌ Aucun. |
| **Export backend** | ❌ (les données restent dans Sheets, Airtable ou SQL si on les a choisis). |
| **Vendor lock-in** | 🔴 Fort sur l'app, 🟢 faible sur les données si elles sont dans une source externe. |
| **Open source** | ❌ |
| **Technologie de l'outil** | **React + TypeScript** (propriétaire). |
| **Architecture** | SaaS multi-tenant. App PWA + moteur de données Glide synchronisé avec la source. |
| **Web / mobile** | **Web + PWA mobile-first**. **Pas d'application native publiée sur les stores.** |
| **Forces / faiblesses** | **Forces** : de loin le plus simple, beau par défaut, rapide. **Faiblesses** : design rigide, pas d'export, pas d'app native, limites de lignes et d'updates. |

---

## 4.8 FLUTTERFLOW

**Identité.** FlutterFlow Inc., fondé en 2020 par d'anciens ingénieurs de Google. **Low-code visuel qui génère du vrai code Flutter (Dart).** En juillet 2025, l'éditeur a lancé **DreamFlow**, un générateur d'applications Flutter par IA.
**Public** : développeurs mobiles, startups, agences. **Cas d'usage** : **applications mobiles natives** (iOS/Android), aussi web et desktop.

| Critère | Analyse |
|---|---|
| **UI Builder / arbre** | ✅ **Widget Tree** : arbre des **widgets Flutter** (Column, Row, Stack, Container, ListView…). C'est exactement la hiérarchie du code Flutter généré. |
| **Glisser-déposer** | ✅ Oui, depuis la bibliothèque de widgets vers le canvas ou l'arbre. |
| **Système de pages** | ✅ **Pages** avec routes et **paramètres de page**, navigation (push, pop, bottom nav bar, drawer), deep links. |
| **Notion de groupe** | ✅ Widgets de **layout Flutter** : Column, Row, Stack, Container, Card, Wrap, ListView/GridView (répétition), TabBar, PageView, BottomSheet, Dialog. |
| **Responsive** | ✅ **Visibilité par breakpoint** (mobile, tablette, desktop), valeurs responsive, widgets *Expanded* et *Flexible*. |
| **Éléments réutilisables** | ✅ **Components** (avec paramètres et états), **Libraries** (bibliothèques partagées entre projets), **Design system / Theme**. |
| **SPA ?** | ✅ Pour le web, **Flutter Web** est une SPA (rendu dans un canvas ou via un moteur WebAssembly). |
| **SEO** | ❌ **Mauvais.** Flutter Web dessine l'interface dans un **canvas** : il n'y a quasiment pas de HTML sémantique lisible par les robots. À éviter pour un site public. |
| **Workflows** | ✅ **Action Flow Editor** (front) : actions sur événements (onTap, onPageLoad) avec conditions, boucles, appels API, navigation, gestion d'état, requêtes Firestore ou Supabase. **Backend** : **Cloud Functions** personnalisées (Firebase, en Node.js) et déclencheurs Firestore, plus les fonctions Edge de Supabase. FlutterFlow n'exécute pas de backend lui-même. |
| **Workflow units** | ❌ Pas de WU (abonnement par éditeur). Les coûts Firebase ou Supabase sont facturés séparément par ces fournisseurs. |
| **JS personnalisé** | ✅ Mais en **Dart** (pas en JavaScript) : **Custom Widgets**, **Custom Actions**, **Custom Functions** écrits en Dart dans l'éditeur, avec import de **paquets pub.dev**. |
| **Connexion backend** | ✅ **Firebase** (Auth, Firestore, Storage) en intégration profonde, **Supabase**, **API REST** (*API Calls*), GraphQL, et d'autres via du code personnalisé. |
| **Comment se connecter** | On connecte un **projet Firebase ou Supabase** (clés). FlutterFlow lit les **collections et tables**, que l'on interroge via des **Backend Queries** attachées aux widgets. Les API externes se définissent dans le panneau **API Calls** (avec test de la réponse et génération de types). |
| **Base de données intégrée** | ❌ **Pas de base propre** : FlutterFlow s'appuie sur **Firestore** (NoSQL) ou **Supabase** (PostgreSQL), qui appartiennent à l'utilisateur. Il existe aussi une base **SQLite** locale pour le hors-ligne. |
| **Création BDD dans l'app** | 🟡 Oui pour **Firestore** : on définit collections et champs dans FlutterFlow, et l'outil peut générer les règles de sécurité. Pour Supabase, le schéma se crée dans Supabase. |
| **IA pour générer l'UI** | ✅ **AI Page/Component Gen** (prompt → page ou composant), **DreamFlow** (prompt → application Flutter complète, depuis juillet 2025), assistant de code IA pour le code personnalisé. |
| **Modification après IA** | ✅ Les pages générées sont des **widgets FlutterFlow natifs**, modifiables dans l'éditeur. DreamFlow permet aussi l'édition visuelle et l'export. |
| **Upload d'image → UI** | 🟡 ❓ Import de **thème Figma** et outils tiers « Figma → FlutterFlow ». La génération d'une page à partir d'une capture n'est pas confirmée par une source officielle. |
| **2 environnements** | ✅ **Dev Environments** : variables et **projets Firebase ou Supabase distincts** pour le dev et la prod. **Test Mode** et **Run Mode** dans l'éditeur, **Local Run**. |
| **Hébergement** | Web hébergé par FlutterFlow (domaine personnalisé) ou exporté. Le mobile est **publié sur l'App Store et Google Play** (déploiement direct depuis l'outil). Le backend est chez Firebase ou Supabase. |
| **Collaboration** | ✅ **Édition en temps réel** à plusieurs (plans Teams). |
| **Versioning** | ✅ **Branching & merging** dans FlutterFlow, **push vers GitHub**, *snapshots* de projet. |
| **Export de code** | ✅ **Oui, du vrai code source Flutter/Dart lisible**, téléchargeable ou poussé sur GitHub, et compilable sans FlutterFlow. C'est **le seul outil visuel de la liste à générer du code natif maintenable**. |
| **Export backend** | 🟡 Les **Cloud Functions** et les **règles Firebase** générées font partie du projet. Le backend lui-même (Firebase ou Supabase) appartient déjà à l'utilisateur. |
| **Vendor lock-in** | 🟢 **Faible** grâce à l'export (on peut quitter FlutterFlow et continuer dans VS Code ou Android Studio). Revenir dans FlutterFlow après des modifications manuelles est en revanche difficile. |
| **Open source** | ❌ La plateforme est propriétaire. Flutter, lui, est open source (BSD). |
| **Technologie de l'outil** | L'éditeur est **lui-même écrit en Flutter (Flutter Web)**. Il génère du **Dart / Flutter**. |
| **Architecture produite** | **Client natif Flutter + BaaS** (Firebase ou Supabase) : architecture **serverless / client-BaaS**. Le code généré suit une organisation en dossiers par pages, composants, backend et custom code. |
| **Web / mobile** | ✅ **Les deux, et même desktop** (iOS, Android, Web, macOS, Windows) à partir d'un seul code. |
| **Forces / faiblesses** | **Forces** : vrai code natif exportable, mobile de qualité, IA. **Faiblesses** : SEO web nul, courbe d'apprentissage (logique Flutter), dépendance à Firebase ou Supabase, code exporté parfois verbeux. |

---

## 4.9 LOVABLE

**Identité.** Lovable (ex-*GPT Engineer*), Stockholm (Suède), fondé en 2023. **AI App Builder** : on décrit l'application dans un chat et l'IA écrit le code. C'est l'une des croissances les plus rapides de l'histoire du SaaS.
**Public** : fondateurs non techniques, designers, product managers, développeurs pressés. **Cas d'usage** : MVP, SaaS, landing pages, outils internes.

| Critère | Analyse |
|---|---|
| **UI Builder / arbre** | 🟡 **Pas de UI builder classique.** L'interface est du **code React**. Il existe un mode **Visual Edits** : on clique sur un élément dans l'aperçu pour modifier son texte, sa couleur, ses marges ou sa taille, sans prompt. Il n'y a pas d'arbre de composants visuel comparable à Bubble. |
| **Glisser-déposer** | ❌ Pas de glisser-déposer de composants. La construction se fait **par prompt**. |
| **Système de pages** | ✅ Pages = **routes** du code (React Router, ou TanStack Start pour les nouveaux projets). On les crée en le demandant à l'IA. |
| **Notion de groupe** | 🟡 Il n'y a pas de « groupe » visuel. Les regroupements sont des **composants React** et des `<div>` dans le code (Cards, Dialogs, Tabs de **shadcn/ui**). |
| **Responsive** | ✅ Responsive par défaut grâce à **Tailwind CSS** (classes `sm:`, `md:`, `lg:`). L'IA génère du responsive automatiquement. |
| **Éléments réutilisables** | ✅ Naturellement : ce sont des **composants React** réutilisables et la bibliothèque **shadcn/ui**. |
| **SPA ?** | 🟡 **Historiquement oui** (React + Vite, rendu client). **Depuis le 13 mai 2026, les nouveaux projets utilisent TanStack Start avec SSR.** Les anciens projets peuvent migrer (chemin proposé depuis juillet 2026). |
| **SEO** | 🟡→✅ **Nettement amélioré en 2026** : SSR pour les nouveaux projets, **pré-rendu à la demande** pour les robots (Google, Bing, robots d'IA) sur les anciens projets, et **outil d'audit SEO** intégré (sitemap, metadata, canonical, Lighthouse, Google Search Console) depuis mai 2026. |
| **Workflows** | 🟡 **Pas de workflows visuels.** La logique est **écrite en code** par l'IA : **front** en handlers React, **back** en **Edge Functions Supabase** (Deno/TypeScript), tâches planifiées via `pg_cron` et webhooks. |
| **Workflow units** | ❌ Pas de WU. Facturation par **crédits de messages IA**. L'usage du backend Lovable Cloud est facturé selon la consommation. |
| **JS personnalisé** | ✅ **Tout est du code** (TypeScript). On peut modifier le code directement dans Lovable (mode code) ou dans son IDE via GitHub. |
| **Connexion backend** | ✅ **Lovable Cloud** (Supabase provisionné automatiquement : base, authentification, stockage, fonctions) ou **son propre projet Supabase**. Autres API via des Edge Functions, avec des **secrets** stockés côté serveur. Connecteurs (Stripe, etc.). |
| **Comment se connecter** | On demande à l'IA (« ajoute une table commandes et un formulaire »). Elle **écrit la migration SQL**, les **politiques RLS** et le **code client** (`supabase.from('commandes').select()`). Les clés secrètes vont dans les secrets des Edge Functions. |
| **Base de données intégrée** | ✅ Via **Lovable Cloud / Supabase** : **PostgreSQL** (relationnel). |
| **Création BDD dans l'app** | ✅ **Par l'IA** (migrations SQL générées), avec visualisation des tables dans Lovable Cloud. |
| **IA pour générer l'UI** | ✅ **C'est le principe même de l'outil** : prompt → application complète (front + back). Agent qui planifie, écrit et corrige. |
| **Modification après IA** | ✅ **Trois façons** : (1) nouveau prompt, (2) **Visual Edits** (clic sur un élément puis modification directe des styles et textes, sans consommer de crédits pour les changements simples), (3) **modification du code** dans l'éditeur ou via GitHub. |
| **Upload d'image → UI** | ✅ **Oui** : on peut joindre des **captures d'écran ou des maquettes** au prompt, et l'IA (modèle multimodal) reproduit l'interface. Il existe aussi un **import Figma** (via l'intégration Builder.io). **La fidélité est variable** : c'est une **reproduction approximative** par un LLM, pas une extraction structurée et mesurée (positions et tailles exactes). |
| **2 environnements** | 🟡 **Aperçu** (*preview*, version de travail) et **version publiée**, plus les **branches GitHub**. Le mécanisme dev/prod avec bases séparées n'est pas aussi formalisé que chez Bubble. ❓ |
| **Hébergement** | Hébergement Lovable (sous-domaine `lovable.app` ou domaine personnalisé), ou **n'importe où** grâce au code (Vercel, Netlify, serveur personnel). |
| **Collaboration** | ✅ Workspaces partagés, collaboration sur le projet, et **GitHub bidirectionnel** (un développeur peut coder en local pendant qu'un non-développeur prompte). |
| **Versioning** | ✅ **Historique de versions** (retour à n'importe quel état du chat) + **Git/GitHub** complet. |
| **Export de code** | ✅ **Code source complet** : **React + TypeScript + Tailwind + shadcn/ui** (Vite ou TanStack Start). **Pas d'Angular ni de Vue** : la pile est imposée. |
| **Export backend** | ✅ Les **migrations SQL** et les **Edge Functions** sont dans le dépôt (`supabase/`). Le backend est un projet Supabase standard, donc portable. |
| **Vendor lock-in** | 🟢 **Faible** (code standard sur GitHub, Supabase open source). |
| **Open source** | ❌ La plateforme est propriétaire. Le code généré appartient à l'utilisateur. |
| **Technologie de l'outil** | Plateforme web propriétaire qui orchestre des **LLM** (Anthropic Claude, OpenAI GPT…), avec un environnement de build et d'aperçu côté serveur. |
| **Architecture produite** | **Frontend React (SPA ou SSR) + BaaS Supabase** (PostgreSQL + RLS + Edge Functions serverless) : architecture **serverless / JAMstack**. |
| **Web / mobile** | **Web** (responsive, PWA possible). **Pas d'app native** directement (on peut empaqueter avec Capacitor en dehors de l'outil). |
| **Forces / faiblesses** | **Forces** : vitesse incroyable, vrai code, GitHub, Supabase, édition visuelle post-génération, SEO amélioré en 2026. **Faiblesses** : qualité et architecture du code variables quand le projet grossit, boucles d'erreurs qui consomment des crédits, sécurité à vérifier (RLS mal configurées), pile technologique imposée. |

---

## 4.10 BOLT.NEW

**Identité.** **StackBlitz**, San Francisco. Lancé en octobre 2024. AI App Builder qui exécute **tout l'environnement de développement dans le navigateur** grâce aux **WebContainers** (Node.js compilé en WebAssembly).
**Public** : développeurs et non-développeurs. **Cas d'usage** : prototypes, apps web full-stack, apps mobiles via Expo.

| Critère | Analyse |
|---|---|
| **UI Builder / arbre** | ❌ / 🟡 Pas de UI builder visuel classique. **Arborescence de fichiers** et éditeur de code (style VS Code) à côté de l'aperçu. Quelques fonctions d'**inspection et sélection** d'éléments dans l'aperçu pour cibler un prompt. |
| **Glisser-déposer** | ❌ Construction **par prompt**. |
| **Système de pages** | ✅ Selon le framework choisi (routes Next.js, React Router, Astro…). |
| **Notion de groupe** | 🟡 Il n'y a pas de groupes visuels. Ce sont des composants dans le code. |
| **Responsive** | ✅ Généralement via Tailwind, généré par l'IA. |
| **Éléments réutilisables** | ✅ Composants du framework. |
| **SPA ?** | 🟡 **Dépend du framework demandé** : React + Vite (SPA), **Next.js**, **Astro**, **SvelteKit**, **Nuxt** (SSR/SSG possibles). |
| **SEO** | 🟡 **Dépend du choix technique.** Si l'on demande Next.js ou Astro, le SEO peut être excellent. Si l'on reste en React + Vite (choix par défaut fréquent), on a les limites d'une SPA. |
| **Workflows** | 🟡 Pas de workflows visuels. La logique est **codée** (routes API, fonctions serveur, Supabase Edge Functions). |
| **Workflow units** | ❌ Facturation par **tokens IA**. Bolt Cloud est facturé selon l'usage. |
| **JS personnalisé** | ✅ Tout est du code, modifiable directement dans l'éditeur intégré. |
| **Connexion backend** | ✅ **Bolt Cloud** (base de données, hébergement, domaines, analytics), **Supabase** (intégration avec édition du schéma), **Netlify** (déploiement), **Stripe**, toute API par code. |
| **Comment se connecter** | Par prompt (« connecte Supabase »), puis l'IA écrit le client, le schéma (ex. **PostgreSQL + Prisma**) et les appels. |
| **Base de données intégrée** | ✅ Via **Bolt Cloud** (PostgreSQL) ou **Supabase**. |
| **Création BDD dans l'app** | ✅ Par l'IA (schémas et migrations). |
| **IA pour générer l'UI** | ✅ **C'est le principe** : prompt → application complète, avec un agent qui installe les paquets npm, lance le serveur, lit les erreurs et les corrige. |
| **Modification après IA** | ✅ Par prompt, ou **directement dans le code** (éditeur intégré), ou via GitHub. Les fonctions d'édition visuelle sont plus limitées que chez Lovable. |
| **Upload d'image → UI** | ✅ **Oui** : on peut joindre des **images ou captures** au prompt, et **importer depuis Figma**. Même remarque que Lovable : c'est une reproduction par LLM, sans garantie de fidélité géométrique. |
| **2 environnements** | 🟡 **Aperçu dans le WebContainer** (dev local dans le navigateur) et **déploiement** (Bolt Cloud ou Netlify). Les environnements formels avec données séparées doivent être construits soi-même (ex. deux projets Supabase). |
| **Hébergement** | **Bolt Cloud** ou **Netlify**, ou n'importe où après téléchargement du code. |
| **Collaboration** | 🟡 Plans Teams, GitHub. |
| **Versioning** | ✅ Historique et **restauration** de versions, intégration **GitHub**. |
| **Export de code** | ✅ **Code source complet** téléchargeable (zip) ou poussé sur GitHub. **Le framework est au choix** : **React, Vue/Nuxt, Svelte, Angular, Astro, Next.js, Remix**… C'est **le plus flexible de la liste** sur ce point. |
| **Export backend** | ✅ Le code serveur (routes API, Node.js) fait partie du projet. |
| **Vendor lock-in** | 🟢 **Très faible.** |
| **Open source** | 🟡 **Le cœur historique « bolt.new » est open source (MIT)** sur GitHub, et la **communauté maintient bolt.diy** (fork MIT compatible avec n'importe quel LLM : OpenAI, Anthropic, Ollama en local…). Le service commercial bolt.new et Bolt Cloud sont propriétaires. |
| **Technologie de l'outil** | **WebContainers** (Node.js en **WebAssembly** dans le navigateur), interface **React / Remix**, orchestration LLM (Anthropic Claude principalement). |
| **Architecture produite** | **Dépend du framework** : SPA + BaaS (JAMstack), ou application **full-stack monolithique** Next.js / Remix (front + API dans le même projet). |
| **Web / mobile** | ✅ **Les deux** : web, et **mobile natif via Expo (React Native)** si l'on précise « mobile app » dès le premier prompt. |
| **Forces / faiblesses** | **Forces** : liberté de framework, vrai code, open source (bolt.diy), environnement complet dans le navigateur. **Faiblesses** : consommation de tokens importante sur les gros projets (boucles de correction), qualité du code variable, pas d'édition visuelle riche. |

---

# 5. OUTILS COMPLÉMENTAIRES PERTINENTS POUR LE MÉMOIRE

## 5.1 Outils « maquette → code » ⭐ (les plus proches du sujet)

| Outil | Entrée | Sortie | Technique | Intérêt pour le mémoire |
|---|---|---|---|---|
| **Uizard** | **Croquis à la main** (photo), **captures d'écran**, prompt | Maquette **éditable** dans Uizard + export de composants React/CSS | **Vision par ordinateur** (Wireframe Scanner) + IA générative (Autodesigner 2.0) | ⭐⭐⭐ **Le plus proche du sujet** : détection d'éléments dessinés à la main. Limite rapportée : le *Screenshot Scanner* échoue sur les mises en page complexes (carrousels, superpositions, éléments interactifs). |
| **Google Stitch** (ex-Galileo AI) | Prompt, **croquis**, **images** | Designs d'interface multi-écrans + **code** (HTML/CSS, export Figma) | LLM multimodal (Gemini) | ⭐⭐⭐ Gratuit (avec limites). Mise à jour de mars 2026 : multi-écrans, canvas infini, entrée vocale. |
| **Locofy** | Fichier **Figma**, Adobe XD | Projet complet **React, Next.js, React Native, HTML/CSS, Vue, Angular, Flutter** | Modèles IA propriétaires (*Large Design Models*), détection automatique des composants | ⭐⭐ Convertit un **projet entier** (mode « Lightning » en un clic). |
| **Anima** | Figma | **React, Vue, HTML, Tailwind** | Règles + IA | ⭐⭐ Code orienté composants (pas des éléments en position absolue). |
| **Builder.io Visual Copilot** | Figma | **React, Vue, Angular, Svelte, Qwik, Solid**, mobile | Modèle entraîné sur plus de 2 millions d'exemples + LLM pour le nettoyage | ⭐⭐ Le plus grand choix de frameworks cibles. |
| **v0 (Vercel)** | Prompt, **captures d'écran**, Figma (plans payants) | **React / Next.js + Tailwind + shadcn/ui** | LLM multimodal | ⭐⭐ Référence du « screenshot to React ». |
| **screenshot-to-code** (abi, GitHub) | **Capture d'écran**, vidéo | HTML/Tailwind, React, Vue, Bootstrap | GPT-4o / Claude / Gemini | ⭐⭐⭐ **Open source (MIT)**, **réutilisable comme base de prototype ou comme baseline de comparaison**. |

## 5.2 Travaux académiques fondateurs ⭐ (à citer dans le chapitre)

| Travail | Année | Apport |
|---|---|---|
| **pix2code** (T. Beltramelli) | 2017 | Premier travail de référence : **CNN + LSTM** qui génère un DSL de description d'interface à partir d'une capture d'écran (web, iOS, Android). |
| **Sketch2Code** (Microsoft AI Lab) | 2018 | **Croquis à la main → HTML**, par détection d'objets (Custom Vision) et reconnaissance d'écriture. |
| **Rico** (dataset, Deka et al.) | 2017 | Base de plus de 66 000 écrans Android annotés (hiérarchies de vues), très utilisée pour entraîner les modèles de compréhension d'UI. |
| **Design2Code** (Si et al.) | 2024 | **Benchmark** de 484 pages web réelles pour évaluer les LLM multimodaux (GPT-4V, Gemini…) sur le « capture → code », avec des **métriques de fidélité** (blocs, texte, position, couleur, similarité CLIP). **Très utile pour évaluer notre propre approche.** |
| **WebSight** (HuggingFace) | 2024 | Dataset synthétique de 2 millions de paires capture/HTML. |

> ❓ Les références exactes (auteurs, conférence) sont à compléter dans la bibliographie BibTeX du mémoire.

## 5.3 Autres plateformes à mentionner pour la complétude

| Outil | Catégorie | En une phrase |
|---|---|---|
| **Webflow** | Sites web no-code | **HTML/CSS statique**, **SEO excellent**, CMS. Composants de code générés par IA (avril 2026) et **DevLink** (export et import de composants React). |
| **Framer** | Sites web no-code + IA | Sites marketing, génération par IA, très bon SEO. |
| **Plasmic** | Builder visuel open source | **Génère du vrai code React** (codegen) et s'intègre à Next.js avec **SSR/ISR**. |
| **Softr** | No-code sur données | Portails clients sur Airtable, Google Sheets ou base interne. |
| **Adalo**, **Draftbit** | Mobile no-code | Apps natives. Draftbit exporte du **React Native**. |
| **Replit Agent** | AI App Builder | Concurrent de Lovable et Bolt, avec base de données et hébergement intégrés. |
| **OutSystems**, **Mendix**, **Power Apps** | Low-code entreprise | Leaders du *Magic Quadrant* Gartner. Modélisation visuelle des données, de la logique et de l'UI à grande échelle. |
| **Lowcoder** | Open source internal tools | Fork d'Openblocks (AGPL). |
| **NocoBase** | Open source no-code | Plateforme extensible par plugins (architecture micro-noyau). |

---

# 6. ANALYSES TRANSVERSALES ET TABLEAUX DE SYNTHÈSE PAR CATÉGORIE

Abréviations : **BUB** Bubble · **WEW** WeWeb · **RET** Retool · **APS** Appsmith · **BUD** Budibase · **TJ** ToolJet · **GLI** Glide · **FF** FlutterFlow · **LOV** Lovable · **BOLT** Bolt.new

## 6.1 Construction de l'interface (C1)

| Outil | Arbre des composants | Glisser-déposer | Pages | Groupes / conteneurs | Responsive | Réutilisables |
|---|---|---|---|---|---|---|
| **Bubble** | ✅ Element Tree | ✅ Canvas libre | ✅ Pages + mode single-page | ✅ Group, Repeating Group, Popup, Floating | ✅ Flexbox + conditions (difficile) | ✅ Reusable Elements |
| **WeWeb** | ✅ Layout panel | ✅ | ✅ + routes dynamiques | ✅ Container, Section, Modal, Collection list | ✅✅ Breakpoints, Grid, Flex : le plus fin | ✅ Components + librairies + Vue custom |
| **Retool** | ✅ Explorer | ✅ Grille | ✅ Multipages | ✅ Container, Tabs, Modal, Drawer, List view | 🟡 Desktop + layout mobile | ✅ Modules |
| **Appsmith** | ✅ Entity Explorer | ✅ Grille | ✅ | ✅ Container, Tabs, Form, Modal, List | 🟡 Desktop first | ✅ Custom widgets, packages |
| **Budibase** | ✅ | ✅ | ✅ Screens + accès par rôle | ✅ Container, Repeater, Blocks | ✅ Auto | 🟡 Blocks, plugins |
| **ToolJet** | ✅ | ✅ | ✅ | ✅ Container, Tabs, Modal, Listview, Kanban | 🟡 2 layouts | ✅ Modules |
| **Glide** | 🟡 Liste verticale | 🟡 Réordonner seulement | ✅ Screens, Tabs | 🟡 Containers, Collections | ✅ Automatique (peu de contrôle) | 🟡 |
| **FlutterFlow** | ✅ Widget Tree (= code Flutter) | ✅ | ✅ + paramètres | ✅ Column, Row, Stack, ListView… | ✅ Breakpoints | ✅ Components, Libraries |
| **Lovable** | 🟡 Code + Visual Edits | ❌ Prompt | ✅ Routes (code) | 🟡 Composants React | ✅ Tailwind | ✅ Composants React |
| **Bolt** | ❌ Arborescence de fichiers | ❌ Prompt | ✅ Routes (code) | 🟡 Composants | ✅ Tailwind | ✅ Composants |

**Analyse.** Deux paradigmes s'opposent.
1. **Les builders visuels** (Bubble, WeWeb, Retool, Appsmith, Budibase, ToolJet, Glide, FlutterFlow) manipulent un **arbre de composants** directement, avec un retour visuel immédiat.
2. **Les AI builders** (Lovable, Bolt) **n'ont pas d'arbre visuel** : l'interface n'existe qu'en code. On la modifie par la parole (prompt), avec une édition visuelle limitée chez Lovable.

**Le chaînon manquant** est un outil qui **génère par IA un arbre de composants visuel, structuré et éditable** à partir d'une image. Bubble AI s'en approche depuis 2026, mais dans un écosystème fermé et sans export. C'est un **positionnement possible pour le mémoire**.

## 6.2 Rendu et référencement (C2)

| Outil | Type de rendu | SEO | Explication |
|---|---|---|---|
| **Bubble** | Hybride (pages séparées + CSR) | 🟡 Moyen | Réglages SEO, sitemap et URL propres, mais rendu JavaScript lourd |
| **WeWeb** | **SPA Vue (CSR)** | 🟡 Faible à moyen | Meta tags et pré-rendu, **pas de SSR en 2026** |
| **Retool / Appsmith / Budibase / ToolJet** | SPA (React ou Svelte) | ⚪ Sans objet | Outils internes derrière une authentification |
| **Glide** | PWA SPA | ⚪ Sans objet | Apps d'équipe |
| **FlutterFlow** | SPA Flutter Web (**canvas**) | ❌ Mauvais | Pas de HTML sémantique |
| **Lovable** | **SSR (TanStack Start) depuis mai 2026**, SPA avant | ✅ Bon (nouveaux projets) | SSR + audit SEO intégré + pré-rendu pour les anciens projets |
| **Bolt** | Selon le framework | 🟡 à ✅ | Excellent si Next.js ou Astro, faible en React + Vite |
| *Webflow (référence)* | *HTML statique* | ✅✅ | *La référence SEO du no-code* |

**Règle à retenir pour le mémoire** : **SEO important = site public** (vitrine, blog, e-commerce, marketplace). **SEO inutile = application derrière une connexion** (dashboard, back-office). Un générateur d'IHM devrait idéalement **produire du HTML sémantique** (balises `<header>`, `<nav>`, `<main>`, `<button>`…) et non des `<div>` génériques, pour l'**accessibilité** comme pour le SEO.

## 6.3 Logique applicative et extensibilité (C3)

| Outil | Workflows front | Workflows back | Facturation de la logique | Code personnalisé |
|---|---|---|---|---|
| **Bubble** | ✅ Éditeur visuel | ✅ API workflows, planifiés, database triggers | ⚠️ **Workload Units** | 🟡 Plugins JS, éléments HTML |
| **WeWeb** | ✅ | ✅ (depuis 2026) | Sièges + hébergement | ✅ JS partout + composants Vue |
| **Retool** | ✅ Event handlers | ✅ Retool Workflows (cron, webhooks, Python, LLM) | Par utilisateur + par exécution | ✅ JS, SQL, Python, React |
| **Appsmith** | ✅ | 🟡 Workflows (payant) | Par utilisateur | ✅ JS Objects, librairies |
| **Budibase** | ✅ Actions | ✅ Automations | Par utilisateur | ✅ JS bindings, plugins Svelte |
| **ToolJet** | ✅ | ✅ ToolJet Workflows | Par utilisateur | ✅ JS + Python |
| **Glide** | ✅ Actions | ✅ Workflows | ⚠️ **« Updates »** (quota) | 🟡 Colonnes JS |
| **FlutterFlow** | ✅ Action Flow Editor | 🟡 Cloud Functions (Firebase) | Abonnement | ✅ **Dart** (custom widgets, actions) |
| **Lovable** | Code | Code (Edge Functions) | Crédits IA | ✅ 100 % code |
| **Bolt** | Code | Code | Tokens IA | ✅ 100 % code |

### Exemple concret : quand le visuel ne suffit plus et qu'il faut du JavaScript

**Cas 1 : calcul métier complexe.** Une page « Devis » doit calculer le prix total en temps réel avec :
- des **remises par paliers** (−5 % au-delà de 10 articles, −10 % au-delà de 50) ;
- une TVA différente par catégorie de produit ;
- un arrondi au multiple de 5 et un **formatage monétaire** local (`12 345,00 FCFA` ou `12 345,00 €`).

Avec des seuls blocs visuels, il faudrait empiler des dizaines de conditions illisibles. En JavaScript, c'est quelques lignes (exemple dans une formule WeWeb, Retool ou Appsmith) :

```javascript
// Formule liée au texte "Total" : {{ ... }}
const lignes = panier.value; // [{prix: 2500, qte: 12, tva: 0.1925}, ...]
const qteTotale = lignes.reduce((s, l) => s + l.qte, 0);
const remise = qteTotale > 50 ? 0.10 : qteTotale > 10 ? 0.05 : 0;

const totalTTC = lignes.reduce((s, l) => {
  const ht = l.prix * l.qte * (1 - remise);
  return s + ht * (1 + l.tva);
}, 0);

const arrondi = Math.round(totalTTC / 5) * 5;
return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(arrondi);
```

**Cas 2 : fonctionnalité du navigateur ou bibliothèque absente de l'outil.** On veut qu'un livreur **signe à l'écran**, que l'app **récupère sa position GPS** et **copie un code de suivi** dans le presse-papier. Aucun composant natif ne le fait (ou pas comme on veut). Il faut alors :
- un **composant personnalisé** (Retool Custom Component en React, WeWeb composant Vue, Appsmith Custom Widget, Bubble plugin) qui intègre la bibliothèque `signature_pad` ;
- une **action JavaScript** qui utilise les API du navigateur :

```javascript
// Action "Custom JavaScript" dans un workflow (WeWeb, Retool JS query, Appsmith JS Object)
const position = await new Promise((ok, ko) =>
  navigator.geolocation.getCurrentPosition(ok, ko, { enableHighAccuracy: true })
);
await navigator.clipboard.writeText(codeSuivi);
return { lat: position.coords.latitude, lng: position.coords.longitude };
```

**Cas 3 : validation spécifique.** On veut vérifier qu'un numéro de téléphone respecte un format national précis, ou un IBAN avec sa clé de contrôle (calcul modulo 97). Une expression régulière ou un algorithme de contrôle demandent du code.

**Leçon pour le mémoire** : même les meilleurs outils visuels prévoient une **« porte de sortie vers le code »** (*escape hatch*). Un générateur d'IHM doit produire une sortie **extensible** par le développeur.

## 6.4 Données et backend (C4)

| Outil | Backend intégré | BDD intégrée (type) | Création BDD dans l'outil | Connexion externe | Export backend |
|---|---|---|---|---|---|
| **Bubble** | ✅ | ✅ Propriétaire (PostgreSQL en interne, sans accès SQL) | ✅ | API Connector, SQL via plugin | ❌ (CSV seulement) |
| **WeWeb** | ✅ depuis 2026 | ✅ **WeWeb Tables (PostgreSQL)** depuis 2026 | ✅ (2026) | ✅✅ Supabase, Xano, Airtable, Firebase, REST, GraphQL | ❓ |
| **Retool** | 🟡 (proxy de requêtes + Workflows) | ✅ Retool DB (PostgreSQL) | ✅ | ✅✅ Plus de 50 connecteurs | ❌ |
| **Appsmith** | 🟡 (proxy) | ❌ | ❌ | ✅ Plus de 25 connecteurs | ❌ |
| **Budibase** | ✅ | ✅ **CouchDB** (NoSQL) | ✅ | ✅ SQL, NoSQL, REST | ❌ |
| **ToolJet** | 🟡 (proxy + Workflows) | ✅ **PostgreSQL** (PostgREST) | ✅ | ✅✅ Plus de 80 sources | ❌ |
| **Glide** | ✅ | ✅ Glide Tables / Big Tables (propriétaire) | ✅ | Sheets, Excel, Airtable, SQL | ❌ |
| **FlutterFlow** | ❌ (délégué à un BaaS) | ❌ (Firestore ou Supabase de l'utilisateur, SQLite local) | 🟡 Firestore | Firebase, Supabase, REST | 🟡 Cloud Functions exportées |
| **Lovable** | ✅ Lovable Cloud (Supabase) | ✅ **PostgreSQL** | ✅ Par l'IA (migrations) | Supabase, API par code | ✅ Migrations + fonctions dans le dépôt |
| **Bolt** | ✅ Bolt Cloud | ✅ **PostgreSQL** (Bolt Cloud ou Supabase) | ✅ Par l'IA | Tout, par code | ✅ |

**Les 3 modèles de connexion aux données observés :**
1. **Base intégrée propriétaire** (Bubble, Glide) : simple, mais enfermante.
2. **Proxy de requêtes vers vos bases** (Retool, Appsmith, ToolJet, Budibase) : on écrit des **requêtes** (SQL ou REST) exécutées **par le serveur de la plateforme** (les identifiants ne sont jamais envoyés au navigateur), puis on **lie** les résultats aux composants avec `{{ requete.data }}`.
3. **Frontend + BaaS** (WeWeb, FlutterFlow, Lovable, Bolt) : le client appelle **directement** les API d'un BaaS (Supabase ou Firebase), dont la sécurité repose sur des règles côté base (**RLS**, *Security Rules*).

## 6.5 Intelligence artificielle (C5) — ⭐ catégorie centrale du mémoire

| Outil | IA génère l'UI | Nature de la sortie IA | Modification après génération | Image / capture → UI | Import Figma |
|---|---|---|---|---|---|
| **Bubble** | ✅ App complète + agent | **Éléments visuels natifs** | ✅✅ Éditeur visuel complet | ✅ **Oui** (capture, export Figma, inspiration) | ✅ Officiel |
| **WeWeb** | ✅ WeWeb AI | Éléments natifs | ✅✅ | ❓ | ❓ |
| **Retool** | ✅ AppGen / Assist | Composants + requêtes natifs | ✅✅ | ❓ | ❌ |
| **Appsmith** | 🟡 Assistant | Widgets / JS | ✅ | ❌ | ❌ |
| **Budibase** | 🟡 (tables, JS, agents) | Objets natifs | ✅ | ❌ | ❌ |
| **ToolJet** | ✅ ToolJet AI | Composants natifs | ✅ | ❓ | ❌ |
| **Glide** | 🟡 Glide AI / GlideOS | Composants natifs | ✅ | ❌ | ❌ |
| **FlutterFlow** | ✅ AI Page Gen + DreamFlow | **Widgets visuels + code Dart** | ✅✅ Visuel **et** code | 🟡 ❓ | 🟡 Thème Figma |
| **Lovable** | ✅✅ App complète | **Code React** | ✅ Prompt + **Visual Edits** + code | ✅ **Oui** (approximatif) | ✅ (via Builder.io) |
| **Bolt** | ✅✅ App complète | **Code (au choix)** | ✅ Prompt + code | ✅ **Oui** (approximatif) | ✅ |
| *Uizard* | ✅ | Maquette éditable | ✅ | ✅✅ **Croquis + captures** | ✅ |
| *Locofy / Anima / Builder.io* | ✅ | Code multi-frameworks | Code | 🟡 (surtout Figma) | ✅✅ |

**Constat critique (à exploiter dans le mémoire) :**
1. **Deux familles de sortie IA.** Soit l'IA produit des **objets visuels éditables** (Bubble, WeWeb, Retool, FlutterFlow), mais dans un format **propriétaire non exportable** (sauf FlutterFlow). Soit elle produit du **code** (Lovable, Bolt, v0), qui est **exportable** mais **peu éditable visuellement**.
2. **Image → UI : une reproduction approximative, pas une extraction.** Les outils actuels envoient l'image à un **LLM multimodal généraliste** qui « réinterprète » l'interface. Il n'y a **pas d'extraction explicite et mesurable** des éléments (type, position, taille, couleur, hiérarchie) et **pas de garantie de fidélité**. Les erreurs typiques sont des espacements faux, des éléments oubliés, des couleurs approchées et une structure réinventée. Uizard est l'un des rares à utiliser une **vision par ordinateur dédiée** (Wireframe Scanner), et il est jugé fragile sur les mises en page complexes.
3. **Les croquis à la main** sont très peu supportés (Uizard, Stitch, Sketch2Code), alors que c'est la forme la plus naturelle du maquettage précoce.

## 6.6 Cycle de vie, équipe et hébergement (C6)

| Outil | Dev / Prod | Données séparées dev/prod | Hébergement | Auto-hébergement | Collaboration | Versioning |
|---|---|---|---|---|---|---|
| **Bubble** | ✅ version-test / live | ✅ Oui | Cloud Bubble (AWS) | ❌ (dédié Enterprise) | ✅ Temps réel | 🟡 Savepoints, branches |
| **WeWeb** | ✅ Editor / Staging / Prod | 🟡 Via variables | Cloud WeWeb ou export | ✅ (frontend) | 🟡 | 🟡 Rollback |
| **Retool** | ✅ Multi-env + Releases | ✅ Ressources par env | Cloud ou self-host | ✅ | ✅ Multijoueur | ✅ Git (Enterprise) |
| **Appsmith** | 🟡 Branches Git (+ multi-env payant) | 🟡 | Cloud ou self-host | ✅ Gratuit | ✅ | ✅✅ **Git gratuit** |
| **Budibase** | ✅ Dev / Publié | ✅ Oui (BDD interne) | Cloud ou self-host | ✅ Gratuit | ✅ | 🟡 Backups |
| **ToolJet** | ✅ Dev / Staging / Prod (payant) | ✅ Datasources par env | Cloud ou self-host | ✅ | ✅ Multijoueur | ✅ Versions + Git (payant) |
| **Glide** | 🟡 Brouillon / Publié | ❌ | Cloud Glide | ❌ | 🟡 | 🟡 |
| **FlutterFlow** | ✅ Dev Environments | ✅ Projets Firebase/Supabase distincts | FF (web) + stores | Via export | ✅ Temps réel | ✅ Branches + GitHub |
| **Lovable** | 🟡 Preview / Publié | 🟡 ❓ | Lovable ou n'importe où | Via code | ✅ | ✅ Historique + GitHub |
| **Bolt** | 🟡 Preview / Déployé | ❌ (à construire) | Bolt Cloud, Netlify, n'importe où | Via code | 🟡 | ✅ Historique + GitHub |

**Pourquoi 2 environnements ?** Pour ne **jamais tester sur les vraies données des clients**. Le schéma idéal est le suivant :

```
 [Développement]  --tests-->  [Staging / Test]  --validation-->  [Production]
  base de test                 copie de la prod                  vraies données
  modifs libres                tests finaux                      vrais utilisateurs
```

## 6.7 Ouverture : export, lock-in, open source (C7)

| Outil | Export de code | Langage / framework exporté | Qualité de l'export | Lock-in | Open source (licence) |
|---|---|---|---|---|---|
| **Bubble** | ❌ | — | — | 🔴 Très fort | ❌ |
| **WeWeb** | 🟡 Build compilé | **Vue.js** (SPA buildée) | Déployable, **non maintenable** | 🟢/🟡 | ❌ |
| **Retool** | ❌ (JSON/YAML) | — | — | 🔴 | ❌ |
| **Appsmith** | ❌ (JSON) | — | — | 🟡 | ✅ **Apache 2.0** |
| **Budibase** | ❌ (archive) | — | — | 🟡 | ✅ **GPL v3** |
| **ToolJet** | ❌ (JSON) | — | — | 🟡 | ✅ **AGPL v3** |
| **Glide** | ❌ | — | — | 🔴 | ❌ |
| **FlutterFlow** | ✅ | **Flutter / Dart** | **Bonne**, maintenable | 🟢 | ❌ |
| **Lovable** | ✅ | **React + TS + Tailwind** (pile imposée) | Bonne à moyenne | 🟢 | ❌ (code généré = à vous) |
| **Bolt** | ✅ | **Au choix** : React, Vue, Svelte, Angular, Next, Nuxt, Astro… | Bonne à moyenne | 🟢 | 🟡 **bolt.new / bolt.diy : MIT** |

> **Réponse directe à « qui exporte en React / Angular / Vue ? »**
> - **React** : Lovable, Bolt, (v0, Locofy, Anima, Builder.io, Plasmic)
> - **Vue** : WeWeb (compilé), Bolt, (Locofy, Anima, Builder.io)
> - **Angular** : Bolt (sur demande), (Locofy, Builder.io)
> - **Flutter/Dart** : FlutterFlow, (Locofy)
> - **Aucun export** : Bubble, Retool, Appsmith, Budibase, ToolJet, Glide

## 6.8 Technologie et architecture (C8)

| Outil | Frontend de la plateforme | Backend de la plateforme | Stockage interne | Architecture de la plateforme | Architecture de l'app produite |
|---|---|---|---|---|---|
| **Bubble** | JavaScript (propriétaire) | Node.js | PostgreSQL | Monolithe multi-tenant (AWS) | 3-tiers sur infra Bubble |
| **WeWeb** | **Vue.js** | Propriétaire | PostgreSQL (2026) | SaaS | SPA découplée + API/BaaS |
| **Retool** | React / TypeScript | Node.js | PostgreSQL | Services conteneurisés (+ Temporal) | Client → proxy Retool → vos BDD |
| **Appsmith** | React / TypeScript | **Java Spring** + Node (RTS) | MongoDB + Redis | **Monolithe modulaire** dans une image Docker | Client → serveur Appsmith → vos BDD |
| **Budibase** | **Svelte** | Node.js (Koa) / TypeScript | CouchDB + MinIO + Redis | **Services séparés** (apps, worker, proxy) | Client → serveur Budibase → BDD |
| **ToolJet** | React | Node.js (**NestJS**) | PostgreSQL + PostgREST + Redis | Couches conteneurisées | Client → serveur ToolJet → BDD |
| **Glide** | React / TS | Propriétaire | Propriétaire | SaaS multi-tenant | PWA + moteur de données |
| **FlutterFlow** | **Flutter Web** | Propriétaire | — | SaaS | **Client natif + BaaS (serverless)** |
| **Lovable** | Web (propriétaire) + LLM | Orchestration LLM | — | SaaS + agents IA | **React + Supabase (serverless/JAMstack)** |
| **Bolt** | React / Remix + **WebContainers (WASM)** | Orchestration LLM | — | Exécution **dans le navigateur** | Selon framework : JAMstack ou monolithe full-stack |

## 6.9 Cible et positionnement (C9)

| Outil | Web | Mobile | Type mobile | Public | Courbe d'apprentissage | Tarification |
|---|---|---|---|---|---|---|
| **Bubble** | ✅ | ✅ | Natif (React Native, bêta) | Non-tech | Moyenne à longue | Plan + **WU** |
| **WeWeb** | ✅ | 🟡 | PWA | Semi-tech | Moyenne | Sièges + hébergement |
| **Retool** | ✅ | ✅ | Natif (Retool Mobile) | Développeurs | Moyenne (JS/SQL) | Par utilisateur |
| **Appsmith** | ✅ | 🟡 | Web responsive | Développeurs | Élevée (JS) | Gratuit self-host / par utilisateur |
| **Budibase** | ✅ | 🟡 | PWA | IT / ops | Faible à moyenne | Gratuit self-host / par utilisateur |
| **ToolJet** | ✅ | 🟡 | Web (layout mobile) | Dév + métier | Moyenne | Gratuit self-host / par utilisateur |
| **Glide** | ✅ | ✅ | **PWA** (pas de store) | Non-tech | **Très faible** | Par app + updates |
| **FlutterFlow** | ✅ | ✅✅ | **Natif** iOS/Android (+ desktop) | Dév mobile | Moyenne à élevée | Par éditeur |
| **Lovable** | ✅ | 🟡 | Web responsive | Tous | **Très faible** | Crédits IA |
| **Bolt** | ✅ | ✅ | **Natif via Expo** | Tous | Faible | Tokens IA |

---

# 7. COMMENT CONSTRUIT-ON UN OUTIL NO-CODE / LOW-CODE ?

Cette section répond à tes questions : *« comment on développe ces outils ? avec quel langage ? comment crée-t-on ces éléments visuels pour pouvoir les ajouter sur une page ? »*

## 7.1 Langages et technologies utilisés

Ces outils sont des **applications web** : le **frontend** de l'éditeur est presque toujours écrit en **TypeScript/JavaScript** avec un framework moderne (**React** pour Retool, Appsmith, ToolJet et Glide ; **Vue** pour WeWeb ; **Svelte** pour Budibase ; **Flutter Web** pour FlutterFlow). Le **backend** est en **Node.js** (Budibase, ToolJet, Retool), en **Java** (Appsmith) ou en un autre langage serveur, avec une base pour stocker les applications créées (PostgreSQL, MongoDB, CouchDB).

## 7.2 Le principe fondamental : l'application est une DONNÉE (JSON)

**Une application no-code n'est pas du code, c'est un document JSON** qui décrit l'arbre des composants. L'éditeur **modifie ce JSON**, et le moteur de rendu le **lit** pour afficher l'interface.

```json
{
  "page": "Accueil",
  "route": "/",
  "root": {
    "id": "c1", "type": "Container",
    "props": { "direction": "column", "padding": 16 },
    "children": [
      { "id": "t1", "type": "Text",
        "props": { "content": "Bonjour {{ user.nom }}", "fontSize": 24 } },
      { "id": "b1", "type": "Button",
        "props": { "label": "Commander", "color": "#1E40AF" },
        "events": { "onClick": [ { "action": "runQuery", "query": "creerCommande" },
                                 { "action": "navigate", "to": "/merci" } ] } }
    ]
  },
  "queries": [
    { "id": "creerCommande", "datasource": "pg_main",
      "sql": "INSERT INTO commandes(user_id) VALUES ({{ user.id }})" }
  ]
}
```

Ce JSON contient tout : **l'arbre des composants** (`children`), les **propriétés** (`props`), le **data binding** (`{{ user.nom }}`), les **workflows** (`events`) et les **requêtes** (`queries`).

## 7.3 Les 7 briques d'un éditeur no-code

```
┌──────────────────────────────────────────────────────────────────────┐
│  ÉDITEUR (Builder)                                                   │
│ ┌────────────┐ ┌───────────────────────────┐ ┌──────────────────────┐│
│ │ 1.Biblio-  │ │ 3. CANVAS                 │ │ 5. PANNEAU DE        ││
│ │ thèque de  │ │ (rendu de l'arbre en      │ │    PROPRIÉTÉS        ││
│ │ composants │→│  mode édition + sélection │ │ (formulaire généré   ││
│ │ (registre) │ │  + drag & drop)           │ │  depuis le schéma)   ││
│ ├────────────┤ │                           │ │                      ││
│ │ 2. ARBRE   │ │                           │ │ 6. ÉDITEUR DE        ││
│ │ (layers)   │ │                           │ │    WORKFLOWS / CODE  ││
│ └────────────┘ └───────────────────────────┘ └──────────────────────┘│
│                 ↕  4. STORE (état = document JSON de l'app)          │
│                    + historique undo/redo                            │
└──────────────────────────────────────────────────────────────────────┘
                     ↓ sauvegarde                 ↓ publication
           [ Backend : stockage JSON,       [ 7. RUNTIME : moteur qui lit
             proxy de requêtes,               le JSON et affiche l'app
             workflows serveur ]              OU générateur de code (codegen) ]
```

1. **Registre de composants.** Chaque composant visuel est un **composant de framework** (React, Vue…) **accompagné d'un schéma** de ses propriétés éditables.
2. **Arbre (layers)** : l'affichage du JSON sous forme hiérarchique.
3. **Canvas** : rend l'arbre et gère la sélection et le glisser-déposer (bibliothèques : `dnd-kit`, `react-dnd`, ou l'API HTML5 Drag and Drop).
4. **Store** : l'état central (Redux, Zustand, Pinia…). Chaque action (ajouter, déplacer, modifier) est une **mutation du JSON**, ce qui rend l'**undo/redo** facile.
5. **Panneau de propriétés** : formulaire **généré automatiquement** à partir du schéma du composant sélectionné.
6. **Moteur d'expressions et de workflows** : évalue `{{ ... }}` (dans un *sandbox* JavaScript sécurisé) et exécute les chaînes d'actions.
7. **Runtime ou codegen** : soit un **interpréteur** affiche le JSON en production (Bubble, Retool, Appsmith → pas d'export possible), soit un **générateur** transforme le JSON en fichiers source (FlutterFlow, Plasmic → export possible).

## 7.4 Comment crée-t-on un composant ajoutable à une page ?

On écrit le composant dans le framework, puis on **l'enregistre** avec la description de ses propriétés. Exemple en React (principe proche de Puck, Craft.js ou des Custom Components de Retool et ToolJet) :

```tsx
// 1. Le composant lui-même (code React classique)
export function Bouton({ label, color, onClick }: BoutonProps) {
  return <button style={{ background: color }} onClick={onClick}>{label}</button>;
}

// 2. Son enregistrement dans le registre de l'éditeur
registry.register({
  type: "Button",
  displayName: "Bouton",
  icon: "cursor-click",
  component: Bouton,
  // Schéma → génère automatiquement le panneau de propriétés
  props: {
    label: { type: "text",  label: "Texte",   default: "Cliquer" },
    color: { type: "color", label: "Couleur", default: "#1E40AF" },
  },
  events: ["onClick"],          // → apparaît dans l'éditeur de workflows
  canHaveChildren: false,       // un Container aurait true
});
```

Le **renderer** parcourt ensuite l'arbre JSON de façon récursive :

```tsx
function Render({ node }: { node: Node }) {
  const def = registry.get(node.type);              // retrouve le composant
  const props = evaluateBindings(node.props);       // résout les {{ ... }}
  const events = bindWorkflows(node.events);        // branche les workflows
  return (
    <def.component {...props} {...events}>
      {node.children?.map(child => <Render key={child.id} node={child} />)}
    </def.component>
  );
}
```

## 7.5 Lien avec le mémoire

Dans notre approche, le **modèle d'IA (vision par ordinateur) produirait exactement ce JSON** (types de composants, positions, tailles, couleurs, hiérarchie) **à partir de l'image de la maquette**. Ce **format intermédiaire structuré** a deux avantages :
- il peut être **affiché et modifié dans un éditeur visuel** (ce que Lovable et Bolt n'offrent pas vraiment) ;
- il peut être **transformé en code** React, Vue, Flutter… par un générateur (ce que Bubble et Retool n'offrent pas).

Il réunit donc les forces des deux familles d'outils.

```
Image de maquette → [Détection IA : CNN / YOLO / VLM] → JSON (arbre de composants)
        → [Éditeur visuel : correction humaine] → [Codegen] → React / Vue / Flutter / HTML
```

---

# 8. OPEN SOURCE : QUOI RÉCUPÉRER POUR NOTRE PROPRE OUTIL ?

| Projet | Licence | Ce qu'on peut récupérer | Contrainte | Recommandation |
|---|---|---|---|---|
| **Appsmith** | **Apache 2.0** ✅ | Architecture complète d'un low-code : registre de widgets, évaluation des bindings, Git | Base de code **énorme** (Java + React), difficile à prendre en main pour un mémoire | 🟡 **À étudier comme référence d'architecture**, pas à forker |
| **Budibase** | **GPL v3** ⚠️ | Builder Svelte, automations | Le code dérivé distribué doit rester en GPL | 🟡 Étude, pas d'intégration dans un produit fermé |
| **ToolJet** | **AGPL v3** ⚠️⚠️ | Builder React, workflows | Même un **SaaS** modifié doit publier ses sources | 🔴 À éviter comme base pour un produit commercial |
| **bolt.new / bolt.diy** | **MIT** ✅ | Chat → code, aperçu en WebContainer, multi-LLM | WebContainers (StackBlitz) soumis à leurs conditions d'usage commercial | ✅ **Intéressant** pour la partie « IA → code + aperçu live » |
| **screenshot-to-code** | **MIT** ✅ | Pipeline image → LLM → HTML/React | Repose sur des LLM externes | ✅✅ **Baseline de comparaison idéale** pour évaluer notre modèle |
| **GrapesJS** | **BSD-3** ✅ | **Éditeur glisser-déposer complet** (canvas, arbre, styles, export HTML/CSS) | Orienté HTML/CSS (pages web) | ✅✅ **Recommandé comme éditeur visuel** du prototype |
| **Craft.js** | **MIT** ✅ | Framework React pour construire un **page builder** (arbre, DnD, sérialisation JSON) | À compléter soi-même | ✅✅ **Recommandé** si le prototype est en React |
| **Puck** | **MIT** ✅ | Éditeur visuel React **à base de JSON**, simple et moderne | — | ✅✅ **Recommandé** : le plus simple pour démarrer |
| **Plasmic** | MIT (majeure partie) ✅ | Codegen React | Complexe | 🟡 Référence pour la génération de code |
| **Onlook** | Apache 2.0 ✅ | Éditeur visuel sur du code React/Next.js + IA | Jeune projet | 🟡 À surveiller |
| **Penpot** | MPL 2.0 ✅ | Outil de design open source (alternative à Figma), format de fichier ouvert | — | 🟡 Source de maquettes et format ouvert |

### Recommandation

**Ne pas forker** Appsmith, Budibase ou ToolJet : ils sont trop volumineux, et la licence est contraignante pour les deux derniers. Ils ne correspondent pas non plus au cœur du sujet (l'IA image → UI).

**Architecture recommandée pour le prototype du mémoire :**
1. **Module IA** (contribution principale) : détection des composants dans l'image (YOLO / DETR / VLM fine-tuné) → **JSON d'arbre de composants** ;
2. **Éditeur visuel** basé sur **Puck**, **Craft.js** ou **GrapesJS** (MIT/BSD) pour **afficher et corriger** le résultat ;
3. **Générateur de code** (JSON → React/HTML, voire Vue/Flutter) ;
4. **Évaluation** comparée à **screenshot-to-code** (baseline LLM) avec les métriques du benchmark **Design2Code**.

---

# 9. GRAND TABLEAU GÉNÉRAL

> Lecture : chaque cellule donne le **verdict** (✅ / 🟡 / ❌) **et une explication courte**.
> Le tableau est large : dans VS Code, utilise l'aperçu Markdown (Ctrl+Shift+V) et fais défiler horizontalement.

| Critère | Bubble | WeWeb | Retool | Appsmith | Budibase | ToolJet | Glide | FlutterFlow | Lovable | Bolt.new |
|---|---|---|---|---|---|---|---|---|---|---|
| **Catégorie** | No-code full-stack | Frontend builder → full-stack (2026) | Low-code outils internes | Low-code outils internes (OSS) | Low-code outils internes (OSS) | Low-code outils internes + IA (OSS) | No-code « data-first » | Low-code mobile + codegen | AI App Builder | AI App Builder (navigateur) |
| **Public cible** | Non-techniciens, startups | Semi-tech, agences | Développeurs en entreprise | Développeurs (JS) | IT / opérations | Dév + métier | Non-techniciens | Dév mobile | Tous, surtout non-tech | Tous |
| **UI Builder / arbre** | ✅ Element Tree complet | ✅ Layout panel « à la Figma » | ✅ Explorer | ✅ Entity Explorer | ✅ Arbre des screens | ✅ Arbre | 🟡 Liste verticale de composants | ✅ Widget Tree = code Flutter | 🟡 Code + Visual Edits | ❌ Fichiers + code |
| **Glisser-déposer** | ✅ Canvas libre | ✅ | ✅ Grille | ✅ Grille | ✅ | ✅ | 🟡 Réordonner seulement | ✅ | ❌ Prompt | ❌ Prompt |
| **Pages** | ✅ Pages + mode single-page | ✅ Routes dynamiques | ✅ Multipages | ✅ Multipages | ✅ Screens avec rôles | ✅ Multipages | ✅ Screens / Tabs | ✅ Pages + paramètres | ✅ Routes (code) | ✅ Routes (code) |
| **Groupes / conteneurs** | ✅ Group, Repeating Group, Popup, Floating | ✅ Container, Section, Modal, Collection | ✅ Container, Tabs, Modal, Drawer | ✅ Container, Tabs, Form, Modal | ✅ Container, Repeater, Blocks | ✅ Container, Tabs, Modal, Kanban | 🟡 Containers, Collections | ✅ Column, Row, Stack, ListView | 🟡 Composants React | 🟡 Composants |
| **Responsive** | ✅ Flexbox + conditions, complexe | ✅✅ Breakpoints, Grid/Flex : le plus fin | 🟡 Desktop + layout mobile | 🟡 Desktop first | ✅ Automatique | 🟡 Deux layouts | ✅ Automatique, peu de contrôle | ✅ Breakpoints | ✅ Tailwind | ✅ Tailwind |
| **Réutilisables** | ✅ Reusable Elements | ✅ Components + Vue custom | ✅ Modules + React custom | ✅ Custom widgets, packages | 🟡 Blocks, plugins Svelte | ✅ Modules | 🟡 Limité | ✅ Components, Libraries | ✅ Composants React | ✅ Composants |
| **SPA ?** | 🟡 Hybride | ✅ SPA Vue | ✅ SPA React | ✅ SPA React | ✅ SPA Svelte | ✅ SPA React | ✅ PWA | ✅ Flutter Web (canvas) | 🟡 SSR depuis mai 2026 (SPA avant) | 🟡 Selon framework |
| **SEO** | 🟡 Réglages + sitemap, rendu lourd | 🟡 Pas de SSR en 2026 | ⚪ Sans objet (interne) | ⚪ Sans objet | ⚪ Sans objet | ⚪ Sans objet | ❌ | ❌ Canvas sans HTML | ✅ SSR + audit SEO (2026) | 🟡→✅ Excellent si Next/Astro |
| **Workflows front** | ✅ Éditeur visuel riche | ✅ | ✅ Event handlers | ✅ | ✅ Actions | ✅ | ✅ Actions | ✅ Action Flow Editor | 🟡 En code | 🟡 En code |
| **Workflows back** | ✅ API workflows, planifiés, triggers | ✅ Depuis 2026 | ✅ Retool Workflows | 🟡 Payant | ✅ Automations | ✅ ToolJet Workflows | ✅ Workflows | 🟡 Cloud Functions | 🟡 Edge Functions (code) | 🟡 Code serveur |
| **Workload Units / mesure d'usage** | ⚠️ **WU** : coût variable et imprévisible | ❌ Sièges + hébergement | Utilisateurs + exécutions | Utilisateurs | Utilisateurs | Utilisateurs | ⚠️ « Updates » | Éditeurs | Crédits IA | Tokens IA |
| **Code personnalisé (JS)** | 🟡 Plugins, HTML | ✅ JS partout + Vue | ✅ JS, SQL, Python, React | ✅ JS Objects | ✅ JS bindings | ✅ JS + Python | 🟡 Colonnes JS | ✅ en **Dart** | ✅ 100 % code TS | ✅ 100 % code |
| **Connexion backend** | API Connector, SQL plugin | ✅✅ Supabase, Xano, Airtable, REST, GraphQL | ✅✅ Plus de 50 connecteurs (proxy) | ✅ Plus de 25 connecteurs | ✅ SQL, NoSQL, REST | ✅✅ Plus de 80 sources | Sheets, Airtable, SQL | Firebase, Supabase, REST | Supabase / Lovable Cloud | Bolt Cloud, Supabase, tout |
| **BDD intégrée (type)** | ✅ Propriétaire (Postgres interne) | ✅ PostgreSQL (2026) | ✅ PostgreSQL | ❌ | ✅ CouchDB (NoSQL) | ✅ PostgreSQL | ✅ Glide Tables | ❌ BaaS externe | ✅ PostgreSQL | ✅ PostgreSQL |
| **Création BDD dans l'outil** | ✅ Onglet Data | ✅ (2026) | ✅ | ❌ | ✅ | ✅ | ✅ | 🟡 Firestore | ✅ Par l'IA | ✅ Par l'IA |
| **IA génère l'UI** | ✅ App complète + agent | ✅ WeWeb AI | ✅ AppGen / Assist | 🟡 Assistant | 🟡 Tables, JS, agents | ✅ ToolJet AI | 🟡 Glide AI | ✅ AI Gen + DreamFlow | ✅✅ Cœur de l'outil | ✅✅ Cœur de l'outil |
| **Modification après IA** | ✅✅ Éléments natifs éditables | ✅✅ | ✅✅ | ✅ | ✅ | ✅ | ✅ | ✅✅ Visuel + code | ✅ Prompt + Visual Edits + code | ✅ Prompt + code |
| **Image → UI** | ✅ Capture, Figma, inspiration | ❓ | ❓ | ❌ | ❌ | ❓ | ❌ | 🟡 Thème Figma | ✅ Approximatif (LLM) | ✅ Approximatif (LLM) + Figma |
| **Dev / Prod** | ✅ version-test / live (BDD séparées) | ✅ Editor / Staging / Prod | ✅ Multi-env + Releases | 🟡 Branches (+ multi-env payant) | ✅ Dev / Publié (données séparées) | ✅ Dev / Staging / Prod (payant) | 🟡 Brouillon / Publié | ✅ Dev Environments | 🟡 Preview / Publié | 🟡 Preview / Déployé |
| **Hébergement** | Cloud Bubble uniquement | Cloud WeWeb ou export | Cloud ou self-host | Cloud ou self-host (gratuit) | Cloud ou self-host (gratuit) | Cloud ou self-host | Cloud Glide uniquement | FF + stores, ou export | Lovable ou n'importe où | Bolt Cloud, Netlify, n'importe où |
| **Collaboration** | ✅ Temps réel | 🟡 Jugée insuffisante | ✅ Multijoueur | ✅ | ✅ | ✅ Multijoueur | 🟡 | ✅ Temps réel | ✅ + GitHub bidirectionnel | 🟡 |
| **Versioning** | 🟡 Savepoints, branches (pas Git) | 🟡 Rollback | ✅ Releases + Git (Enterprise) | ✅✅ Git gratuit | 🟡 Backups | ✅ Versions + Git (payant) | 🟡 | ✅ Branches + GitHub | ✅ Historique + GitHub | ✅ Historique + GitHub |
| **Export du code** | ❌ Aucun | 🟡 Vue compilé (non maintenable) | ❌ JSON | ❌ JSON | ❌ Archive | ❌ JSON | ❌ | ✅✅ Flutter/Dart lisible | ✅ React/TS/Tailwind | ✅✅ Framework au choix |
| **Export backend** | ❌ (CSV) | ❓ | ❌ | ❌ | ❌ | ❌ | ❌ | 🟡 Cloud Functions | ✅ Migrations + fonctions | ✅ |
| **Vendor lock-in** | 🔴 Très fort | 🟢/🟡 Faible (front) | 🔴 Fort (app) | 🟡 Moyen (OSS) | 🟡 Moyen (OSS) | 🟡 Moyen (OSS) | 🔴 Fort | 🟢 Faible | 🟢 Faible | 🟢 Très faible |
| **Open source** | ❌ | ❌ | ❌ | ✅ Apache 2.0 | ✅ GPL v3 | ✅ AGPL v3 | ❌ | ❌ | ❌ | 🟡 bolt.diy (MIT) |
| **Technologie de l'outil** | JS / Node / Postgres (AWS) | Vue.js | React / Node | React + Java Spring + MongoDB | Svelte + Node (Koa) + CouchDB | React + NestJS + Postgres | React / TS | Flutter Web → Dart | LLM + React/Vite/TanStack | WebContainers (WASM) + LLM |
| **Architecture** | Monolithe multi-tenant ; app 3-tiers | SPA découplée + BaaS / API | Services conteneurisés ; proxy vers BDD | Monolithe modulaire (1 image Docker) | Services séparés (apps, worker…) | Couches conteneurisées | SaaS multi-tenant | Client natif + BaaS (serverless) | SPA/SSR + Supabase (JAMstack) | Selon framework |
| **Web / mobile** | Web + **natif** (bêta) | Web + PWA | Web + **natif** (Retool Mobile) | Web | Web + PWA | Web | Web + PWA | ✅✅ **Natif** iOS/Android + web + desktop | Web | Web + **natif** (Expo) |
| **Tarification** | Plan + WU | Sièges + hébergement | Par utilisateur (cher) | Gratuit self-host / par utilisateur | Gratuit self-host / par utilisateur | Gratuit self-host / par utilisateur | Par app + updates | Par éditeur | Crédits | Tokens |
| **Force n°1** | Tout-en-un + IA éditable | Précision du design + liberté backend | Connecteurs + entreprise | Open source + Git gratuit | Open source + BDD + CRUD auto | Open source + 80 sources | Simplicité extrême | Vrai code natif exportable | Vitesse + vrai code + SEO 2026 | Liberté de framework |
| **Faiblesse n°1** | WU + aucun export | SEO (pas de SSR) | Prix + lock-in | Exige du JS, mobile faible | Design rigide, GPL | AGPL, fonctions clés payantes | Rigidité, pas de store | SEO web nul | Qualité du code sur gros projets | Tokens, peu d'édition visuelle |

---

# 10. LIMITES COMMUNES ET POSITIONNEMENT DU MÉMOIRE

## 10.1 Limites communes identifiées dans l'existant

| # | Limite | Outils concernés | Lien avec le mémoire |
|---|---|---|---|
| L1 | **Compromis entre éditabilité visuelle et portabilité du code.** Les outils visuels ne sont pas exportables (sauf FlutterFlow) ; les outils qui génèrent du code ne sont pas éditables visuellement. | Tous | Une représentation intermédiaire JSON permet d'avoir les deux. |
| L2 | **L'image → UI est une reproduction approximative par LLM**, sans extraction explicite ni mesurée des formes (type, position, taille, couleur, hiérarchie). | Bubble, Lovable, Bolt, v0 | **Cœur du mémoire** : extraction structurée par vision par ordinateur. |
| L3 | **Les croquis à la main sont très peu supportés.** | Tous sauf Uizard, Stitch | Supporter les maquettes **dessinées à la main** et **numériques** (objectif 3 de l'énoncé). |
| L4 | **Pas de métrique de fidélité** affichée à l'utilisateur. | Tous | Proposer des métriques (IoU des boîtes, similarité visuelle, Design2Code). |
| L5 | **Dépendance aux formats spécifiques** (Figma surtout). | Locofy, Anima, Builder.io | Partir d'une **simple image** (énoncé : « même à partir d'une simple image de maquette »). |
| L6 | **Lock-in et coûts imprévisibles** (WU, crédits). | Bubble, Glide, Lovable, Bolt | Approche ouverte, code exportable. |
| L7 | **HTML peu sémantique et accessibilité négligée.** | Plusieurs | Générer des balises sémantiques et des attributs ARIA. |

## 10.2 Positionnement proposé

> Un système qui prend en entrée **une image de maquette** (numérique ou dessinée à la main),
> **détecte et caractérise** chaque élément d'interface (type, géométrie, style, hiérarchie) par un
> **modèle de vision dédié**, produit une **représentation intermédiaire structurée (arbre JSON)**
> **éditable visuellement**, puis **génère du code** dans un ou plusieurs frameworks (HTML/CSS, React…),
> avec une **évaluation quantitative de la fidélité**.

---

# 11. SOURCES

*Consultées en octobre 2026. À compléter par la documentation officielle de chaque outil lors de la rédaction finale.*

**WeWeb**
- [WeWeb changelog — Meet the WeWeb backend (8 avril 2026)](https://www.weweb.io/changelog/2026-04-08-weweb-backend)
- [WeWeb community — WeWeb is full-stack](https://community.weweb.io/t/weweb-is-full-stack/21002)
- [WeWeb product — Backend](https://www.weweb.io/product/backend)
- [Migrating WeWeb to Code: The Complete Playbook (2026)](https://www.rapidevelopers.com/md/no-code-to-code/how-to-migrate-weweb-project-to-code)
- [WeWeb Export Code](https://www.rapidevelopers.com/md/weweb-tutorial/weweb-export-code)
- [WeWeb community — Migration export vers Nuxt SSR](https://community.weweb.io/t/migrating-weweb-code-export-to-nuxt-js-with-ssr-for-seo-improvement-experiences-and-ci-cd-ideas/17069)

**Bubble**
- [Bubble Docs — Importing from Figma](https://manual.bubble.io/help-guides/design/importing-from-figma)
- [Bubble Docs — Application and data ownership](https://manual.bubble.io/account-and-marketplace/application-and-data-ownership)
- [Bubble Docs — SEO](https://manual.bubble.io/help-guides/maintaining-an-application/seo/seo-app)
- [Bubble AI Agent builds interfaces from Figma exports and design references](https://createwith.com/tool/bubble/updates/bubble-ai-agent-now-builds-interfaces-from-figma-exports-and-design-references)
- [Bubble blog — Low cost mobile app development tools 2026](https://bubble.io/blog/low-cost-mobile-app-development/)
- [Adalo — Best Bubble alternatives 2026](https://adalo.com/posts/best-bubble-alternatives-2026/)

**Retool**
- [Retool — How we built AI-assisted development into Retool](https://retool.com/blog/how-we-built-ai-assisted-development)
- [Retool Docs — Assist changelog](https://docs.retool.com/changelog/assist)
- [Retool Docs — How apps work](https://docs.retool.com/build/apps/concepts/how-it-works)
- [BusinessWire — Retool AI AppGen platform](https://www.businesswire.com/news/home/20251007982081/en)

**Appsmith**
- [Superblocks — Appsmith Review 2026](https://www.superblocks.com/blog/appsmith-review)
- [EveryDev — Appsmith](https://www.everydev.ai/tools/appsmith)

**Budibase**
- [EveryDev — Budibase](https://www.everydev.ai/tools/budibase)
- [Jetadmin — Budibase pricing (juillet 2026)](https://www.jetadmin.io/blog/untitled-39/)

**ToolJet**
- [ToolJet Docs — Platform overview](https://docs.tooljet.com/docs/getting-started/platform-overview/)
- [OpenApps — ToolJet](https://openapps.pro/apps/tooljet)

**Glide**
- [Glide Help — Pricing plans](https://help.glideapps.com/en/articles/11780756-pricing-plans-as-of-november-1-2025)
- [Jetadmin — Glide Review 2026](https://www.jetadmin.io/blog/glide-review/)

**FlutterFlow**
- [RapidDevelopers — FlutterFlow review](https://www.rapidevelopers.com/md/review/flutterflow)
- [What is DreamFlow?](https://www.rapidevelopers.com/blog/what-is-dreamflow-the-ai-tool-that-codes-flutter-apps-for-you)
- [LowCode Agency — FlutterFlow vs Flutter](https://www.lowcode.agency/blog/flutterflow-vs-flutter)

**Lovable**
- [LowCode Agency — Lovable features](https://www.lowcode.agency/blog/lovable-features)
- [Superblog — Lovable SEO 2026](https://superblog.ai/blog/lovable-seo/)
- [Lovable FAQ — Architecture / server rendering](https://lovable.dev/faq/deployment/architecture)
- [ReviewAITool — Lovable review 2026](https://blog.reviewaitool.com/lovable-review-2026/)

**Bolt.new**
- [Banani — Bolt.new 2026 review](https://www.banani.co/blog/bolt-new-review)
- [Bolt support — FAQ](https://support.bolt.new/concepts/faq)
- [AutomationAtlas — Bolt.new review 2026](https://automationatlas.io/answers/bolt-new-review-2026/)

**Design-to-code / image-to-UI**
- [Uizard — Wireframe Scanner](https://uizard.io/blog/hand-drawn-wireframe-to-sketch/)
- [UXMagic — Uizard review 2026](https://uxmagic.ai/blog/uizard-review-2026)
- [DigitalCitizen — What is Google Stitch](https://www.digitalcitizen.life/what-is-google-stitch-and-how-it-turns-text-into-app-designs/)
- [SSOJet — 7 Design-to-Code AI tools](https://ssojet.com/blog/design-to-code-ai-tools)

**Autres**
- [Webflow — AI code components](https://webflow.com/updates/ai-code-components)
- [Webflow — DevLink export](https://webflow.com/updates/updates-to-devlink-export)
- [Plasmic — Migrating to code (2026)](https://www.rapidevelopers.com/md/no-code-to-code/how-to-migrate-plasmic-project-to-code)

**Références académiques (à compléter en BibTeX)**
- Beltramelli T., *pix2code: Generating Code from a Graphical User Interface Screenshot*, 2017 (arXiv:1705.07962).
- Deka B. et al., *Rico: A Mobile App Dataset for Building Data-Driven Design Applications*, UIST 2017.
- Si C. et al., *Design2Code: How Far Are We From Automating Front-End Engineering?*, 2024 (arXiv:2403.03163).
- Microsoft AI Lab, *Sketch2Code*, 2018.
- Laurençon H. et al., *WebSight*, HuggingFace, 2024.
