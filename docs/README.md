# Documentation du projet — Plateforme low-code / no-code fondée sur un modèle pivot

> **Tout ce qui concerne le projet est ici**, sauf le mémoire LaTeX et les livres de référence (dans `Latex/Memoire_Juve_recherche/`).

## 1. La carte

```
docs/
├── README.md                              ← CE FICHIER : carte, conventions, avancement
├── 00-analyse-et-conception/              ← POURQUOI et QUOI : besoins, existant, vision, plan
├── 01-phase-1-modele-pivot-et-editeur/    ← COMMENT on a réalisé la phase 1 (historique, figé)
├── 0N-phase-N-…/                          ← les phases suivantes, même ossature
└── reference/                             ← L'ÉTAT ACTUEL du système (toujours à jour)
```

| Dossier | Nature | Question à laquelle il répond | Évolue ? |
|---|---|---|---|
| [00-analyse-et-conception/](00-analyse-et-conception/) | Analyse | Quels besoins ? Que fait l'existant ? Que veut-on construire, dans quel ordre ? | Rarement (à chaque changement de cap) |
| [01-phase-1-modele-pivot-et-editeur/](01-phase-1-modele-pivot-et-editeur/) | **Historique** | Qu'a-t-on fait en phase 1, comment, avec quels problèmes, quelle architecture **à ce moment-là** ? | **Non**, une fois la phase close (on n'ajoute que des liens « Évolutions ultérieures ») |
| [reference/](reference/) | **Vivant** | Comment le système fonctionne-t-il **aujourd'hui** ? | **Oui**, à la fin de chaque phase |

## 2. État d'avancement

| Phase | Contenu | État | Bilan |
|---|---|---|---|
| 0 | Analyse des besoins, étude de l'existant, proposition de conception | ✅ Faite | [00-analyse-et-conception/00-objectifs-du-projet.md](00-analyse-et-conception/00-objectifs-du-projet.md) |
| **1** | **Modèle pivot + éditeur visuel, synchronisés dans les deux sens** | ✅ **Close le 20/10/2026** | [01-phase-1…/00-objectifs-et-bilan.md](01-phase-1-modele-pivot-et-editeur/00-objectifs-et-bilan.md) |
| 2 | Déplacement de nœuds, glisser-déposer, métamodèle en JSON Schema | À venir | — |
| 3 | Générateurs de code React et Vue | À venir | — |

## 3. Conventions

### 3.1 Numérotation
- Chaque dossier et chaque fichier commence par un **numéro à deux chiffres**. L'ordre alphabétique est donc l'ordre de lecture.
- Les noms sont en minuscules, avec des tirets et **sans accents**, pour éviter les soucis de chemins dans le terminal, dans Git et dans LaTeX.

### 3.2 L'ossature d'une phase (identique pour toutes)

| N° | Fichier | Contenu |
|---|---|---|
| `00` | `objectifs-et-bilan.md` | **Objectifs** listés au début, bilan ✅ / ❌ à la fin, ordre de lecture, section **« Évolutions ultérieures »** |
| `01` | `guide-de-la-phase.md` | Le plan de travail, étape par étape (rédigé **avant** la phase) |
| `02`… | fiches, conception, métamodèle, décisions, structures de données, patrons | La conception **telle qu'elle était dans cette phase** |
| puis | `journal-de-bord.md` | Ce qui a été fait, les **erreurs** rencontrées et **comment elles ont été corrigées** |
| puis | `tests-et-recette.md`, `visite-guidee-du-code.md`… | Les preuves, et le code de la phase |
| dossiers | `captures/`, `diagrammes/` | Les images **de cette phase** (figées) |

### 3.3 La règle des améliorations ultérieures

Quand on améliore en phase N quelque chose qui avait été fait en phase M (avec M < N) :

1. **L'amélioration est documentée dans la phase N**, celle où elle est réellement faite. C'est fidèle au déroulement : le mémoire raconte une démarche, et une démarche a une chronologie. La phase N indique « révise phase M, D19 », avec un lien vers la décision.
2. **La phase M n'est pas réécrite.** On ajoute seulement une ligne dans sa section « Évolutions ultérieures » de `00-objectifs-et-bilan.md` : « D19 révisée en phase N → lien ». Sinon, un lecteur de la phase M croirait que c'est encore l'état actuel.
3. **`reference/` est mis à jour** pour décrire le nouvel état.

> Ainsi, chaque phase montre l'architecture **de son époque**, et la comparaison de phases successives montre l'**évolution** du système, ce qui est utile pour le mémoire. `reference/` montre où l'on en est.

### 3.4 Les numéros de décisions et de problèmes
- Les décisions sont numérotées **en continu** sur tout le projet : D1 à D32 en phase 1, D33 lors de la restructuration du 21/10/2026 ; la phase 2 commencera à D34. Une décision garde son numéro pour toujours, même si elle est révisée plus tard.
- Les problèmes du journal sont préfixés par la phase : `P1-07` désigne le problème 7 de la phase 1 (noté simplement P7 dans le journal de la phase 1).
- [reference/05-decisions-en-vigueur.md](reference/05-decisions-en-vigueur.md) indique, pour chaque décision, si elle est **en vigueur** ou **révisée**, et où.

## 4. Correspondance des vocabulaires (important)

Trois découpages coexistent dans les documents. Ne pas les confondre :

| Terme | Où | Signification |
|---|---|---|
| **Phase 1, 2, 3…** (nos dossiers) | `docs/0N-phase-…` | Une **étape de réalisation** = une **tranche** du guide de démarrage |
| **Tranche T1, T2…** | [03-guide-de-demarrage.md §5](00-analyse-et-conception/03-guide-de-demarrage.md) | Identique à nos phases : **phase N = tranche TN** |
| **Phase P0 à P10** | [02-proposition-de-conception-et-phases.md §5](00-analyse-et-conception/02-proposition-de-conception-et-phases.md) | Les **lots fonctionnels** de la plateforme complète (noyau, éditeur, générateurs, IA…). Une tranche en touche souvent plusieurs : la phase 1 couvre une partie de P1 et le début de P2 |

### Anciens noms des documents de conception

Les documents de conception se citent entre eux par leurs anciens numéros (« le document `01` », « le document `03` »). Voici la correspondance :

| Ancien nom (dans `Memoire_Juve_recherche/ref_files/`) | Nouvel emplacement |
|---|---|
| `etude_de_lexistant/critere_de_comparaison.md` | [00-analyse-et-conception/01-etude-de-l-existant/01-criteres-de-comparaison.md](00-analyse-et-conception/01-etude-de-l-existant/01-criteres-de-comparaison.md) |
| `etude_de_lexistant/etat_de_lart_complet.md` | […/02-etat-de-l-art-complet.md](00-analyse-et-conception/01-etude-de-l-existant/02-etat-de-l-art-complet.md) |
| `etude_de_lexistant/etude_existant_et_positionnement.md` | […/03-etude-existant-et-positionnement.md](00-analyse-et-conception/01-etude-de-l-existant/03-etude-existant-et-positionnement.md) (le `.pdf` est resté dans le dépôt du mémoire) |
| `conception_plateforme/01_proposition_conception_et_phases.md` (« doc `01` ») | [00-analyse-et-conception/02-proposition-de-conception-et-phases.md](00-analyse-et-conception/02-proposition-de-conception-et-phases.md) |
| `conception_plateforme/02_guide_de_demarrage.md` (« doc `02` ») | [00-analyse-et-conception/03-guide-de-demarrage.md](00-analyse-et-conception/03-guide-de-demarrage.md) |
| `conception_plateforme/03_tranche_1_editeur_et_modele_pivot.md` (« doc `03` ») | [01-phase-1-modele-pivot-et-editeur/01-guide-de-la-phase.md](01-phase-1-modele-pivot-et-editeur/01-guide-de-la-phase.md) |
| `guides/etape_02_types_modele_pivot.md` (racine du projet) | [01-phase-1-modele-pivot-et-editeur/02-fiche-etape-02-types-modele-pivot.md](01-phase-1-modele-pivot-et-editeur/02-fiche-etape-02-types-modele-pivot.md) |

## 5. Historique de l'organisation de la documentation

| Date | Changement |
|---|---|
| 19–20/10/2026 | Documentation de la phase 1 écrite à plat dans `docs/` (01 à 10) |
| 21/10/2026 | **Restructuration** : un seul dossier `docs/` ; l'analyse, la conception et les guides sont rapatriés depuis le dépôt du mémoire (fichiers `.md` uniquement) ; dossiers par phase avec ossature commune ; création de `reference/`. Seuls des chemins et des liens ont été corrigés dans les documents de la phase 1, sans changement de contenu. Une archive de l'organisation précédente a été faite avant le déplacement |

## 6. Lancer le projet

```bash
pnpm install     # une fois
pnpm dev         # éditeur sur http://localhost:5173
pnpm test        # tous les tests
pnpm recette     # recette dans Chrome ; captures → docs/reference/captures/
```
