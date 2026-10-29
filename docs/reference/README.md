# Référence — l'état actuel du système

> 🟢 Ce dossier décrit **le système tel qu'il est aujourd'hui**, indépendamment des phases.
> **Dernière mise à jour : 21/10/2026, état à la fin de la phase 1.**
> Pour savoir **comment** on en est arrivé là, voir les dossiers de phase (`docs/0N-phase-…/`).

## Contenu

| N° | Document | Contenu |
|---|---|---|
| 01 | [01-architecture.md](01-architecture.md) | Architecture actuelle : hexagone, paquetages, classes, séquences, états, déploiement |
| 02 | [02-metamodele.md](02-metamodele.md) | Le métamodèle actuel : niveaux M0 à M3, structure et vocabulaire, règles R1 à R8 |
| 03 | [03-visite-guidee-du-code.md](03-visite-guidee-du-code.md) | Chaque fichier du code et son rôle |
| 04 | [04-fonctionnement-des-fonctionnalites.md](04-fonctionnement-des-fonctionnalites.md) | **Chaque fonctionnalité, de l'écran jusqu'au code** (F0 à F12) |
| 05 | [05-decisions-en-vigueur.md](05-decisions-en-vigueur.md) | Statut de chaque décision (en vigueur ou révisée) et lien vers son argumentation |
| 06 | [06-appels-react-vers-noyau.md](06-appels-react-vers-noyau.md) | **Tous les appels de React vers le noyau** : quand ils ont lieu, ce que fait le noyau, annuler / rétablir |
| — | [captures/](captures/) | Captures de la **dernière** recette (`pnpm recette` les régénère ici) |
| — | [diagrammes/](diagrammes/) | Diagrammes actuels (`.png`, `.svg`, `.mmd`) |

## Comment ce dossier est mis à jour

À la **fin de chaque phase** :
1. on reporte dans `01` à `04` les changements d'architecture, de métamodèle, de code et de fonctionnalités ;
2. on met à jour les statuts dans `05` ;
3. on change la date « Dernière mise à jour » en tête de chaque document ;
4. on relance `pnpm recette` (captures) et on régénère les diagrammes modifiés.

La phase, elle, garde sa propre copie **figée**. Comparer `reference/01-architecture.md` et `01-phase-1-…/03-conception-architecture.md` montre ainsi l'évolution.
