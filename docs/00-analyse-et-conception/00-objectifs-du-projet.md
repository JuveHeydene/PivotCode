# 00 — Objectifs du projet

> Synthèse de l'analyse. Les détails sont dans les documents de ce dossier :
> - [01-etude-de-l-existant/](01-etude-de-l-existant/) : **ce qui existe**, avec ses limites ;
> - [02-proposition-de-conception-et-phases.md](02-proposition-de-conception-et-phases.md) : **la destination**, c'est-à-dire la plateforme complète et ses lots P0 à P10 ;
> - [03-guide-de-demarrage.md](03-guide-de-demarrage.md) : **la méthode**, c'est-à-dire la feuille de route par tranches.

---

## 1. La vision en une phrase

> Une plateforme où l'on **conçoit une application complète** (interface, logique, données, connexions) **visuellement ou en langage naturel**, dont la **seule source de vérité** est un **modèle pivot indépendant des technologies**. À partir de ce modèle, on **génère du code propre** dans le framework frontend et le framework backend de son choix.

---

## 2. Le problème : les limites de l'existant

L'étude de dizaines de plateformes (Bubble, WeWeb, Retool, Appsmith, FlutterFlow, Lovable, Bolt.new, JHipster, Mitosis…) fait ressortir des **limites communes** (détails dans [03-etude-existant-et-positionnement.md §8](01-etude-de-l-existant/03-etude-existant-et-positionnement.md)) :

| N° | Limite |
|---|---|
| L1 | Il faut choisir entre **édition visuelle** et **propriété du code** |
| L2 | **Pas d'export multi-frameworks** pour une application construite visuellement |
| L3 | **Backend non exportable**, ou limité à des piles imposées |
| L4 | **IA orientée « application entière »** : l'assistance ciblée sur **un composant** est rare |
| L5 | L'IA produit du **code brut**, qui échappe au contrôle visuel |
| L6 | **Coûts** difficiles à prévoir |
| L7 | **Dépendance au fournisseur** (hébergement, moteur d'exécution) |
| L8 | **Licences restrictives** pour la plupart des solutions open source |

---

## 3. Les objectifs

### 3.1 Objectifs généraux (ce que la plateforme doit permettre)

| N° | Objectif | Limites adressées |
|---|---|---|
| **OG1** | Concevoir une interface **visuellement**, sur un **modèle pivot indépendant des frameworks** | L1, L7 |
| **OG2** | **Exporter le frontend** vers **plusieurs** frameworks (au moins React et Vue) à partir du **même** modèle | L1, L2 |
| **OG3** | **Générer un backend** (Spring Boot en premier) à partir du modèle de données | L3 |
| **OG4** | Un **agent IA contextuel** qui connecte **un composant** à l'API la plus adaptée, à partir d'une instruction en langage naturel | L4 |
| **OG5** | Une IA qui produit **le modèle** (et non du code brut), pour que le résultat reste éditable et exportable | L1, L5 |
| **OG6** | Une **architecture extensible par plugins** (composants, générateurs, connecteurs), sous licence permissive | L2, L8 |

### 3.2 Objectifs de qualité (comment elle doit être construite)

| N° | Objectif | Moyen prévu |
|---|---|---|
| **OQ1** | Le modèle pivot ne dépend d'**aucune** technologie | Architecture hexagonale ; noyau sans dépendance ; frontière vérifiée par le compilateur |
| **OQ2** | Le modèle est **toujours valide** | Validation complète de toute entrée externe ; modifications uniquement par commandes |
| **OQ3** | Chaque modification est **traçable, annulable et rejouable** | Commandes sous forme de données ; documents immuables |
| **OQ4** | On peut **ajouter** un composant, un générateur ou une cible **sans modifier le noyau** | Catalogue de données (Type Object), ports, plugins |
| **OQ5** | Les algorithmes sont **efficaces** et leur complexité est connue | Structures adaptées (tables de hachage, stockage à plat, parcours linéaires) |
| **OQ6** | Le travail est **vérifiable** | Tests automatisés à chaque couche ; recette de bout en bout reproductible |

### 3.3 Objectifs du mémoire (périmètre retenu)

D'après [02-proposition…, §6.2](02-proposition-de-conception-et-phases.md) et [03-guide-de-demarrage.md §5](03-guide-de-demarrage.md) :

| Priorité | Contenu |
|---|---|
| **Socle obligatoire** | Modèle pivot + éditeur visuel (OG1), noyau robuste (OQ1 à OQ3), une logique applicative minimale |
| **Contribution principale 1** | Export frontend vers **deux** cibles, React et Vue (OG2) |
| **Contribution principale 2 (IA)** | Agent de connexion composant ↔ API (OG4) |
| **Contribution complémentaire** | Backend CRUD généré (OG3, réduit) |
| **Perspectives** | OG5, plugins complets, import de code existant, collaboration |

---

## 4. Le plan de réalisation (les phases)

Une **phase** correspond à une **tranche verticale** : elle traverse toutes les couches, sur un petit périmètre, et se termine par **quelque chose qui marche et qu'on peut montrer**.

> Mise à jour du 29/10/2026 : les générateurs ont été avancés en phase 2 et le glisser-déposer repoussé en phase 3 (décision [D34](../02-phase-2-generateurs-react-vue/04-decisions.md)).
>
> Mise à jour du 29/10/2026 (bis) : une phase 4 courte, **non prévue**, a été insérée : le format d'échange imbriqué (décision [D71](../04-phase-4-format-d-echange-imbrique/03-decisions.md)). Les phases suivantes sont décalées d'un numéro.

| Phase | Résultat démontrable | Objectifs servis | Lots du doc de proposition | Dossier |
|---|---|---|---|---|
| **1** | **Poser un composant dans l'éditeur et le voir dans le modèle pivot, et inversement** | OG1, OQ1–OQ3, OQ5, OQ6 | P1 (partie), P2 (début) | [01-phase-1-modele-pivot-et-editeur/](../01-phase-1-modele-pivot-et-editeur/) ✅ |
| **2** | **Mise en page et style ; exporter le même modèle en projet React et en projet Vue** (parité mesurée) | **OG1, OG2**, OQ1, OQ4, OQ6 | P2, P4 (début) | [02-phase-2-generateurs-react-vue/](../02-phase-2-generateurs-react-vue/) ✅ |
| **3** | **Déplacer des nœuds, glisser-déposer, métamodèle en JSON Schema** | OG1, OQ2, OQ3 ; prépare OG4, OG5 | P1, P2 | [03-phase-3-deplacement-et-json-schema/](../03-phase-3-deplacement-et-json-schema/) ✅ |
| **4** | **Échanger une interface dans un format imbriqué que JSON Schema vérifie presque entièrement** | OQ2, OQ3 ; prépare OG4, OG5 | P1 | [04-phase-4-format-d-echange-imbrique/](../04-phase-4-format-d-echange-imbrique/) ✅ |
| 5 | Ajouter un composant **par un plugin**, sans modifier le noyau | OG6, OQ4 | P1, P2 | à venir |
| 6 | Jetons de design modifiables, plusieurs pages et navigation | OG1 | P2 | à venir |
| 7 | Variables, expressions, événements : une application qui réagit | OG1 | P3 | à venir |
| 8+ | Backend généré, connexion aux API, agent IA | OG3, **OG4**, OG5 | P5, P6, P7 | à venir |
