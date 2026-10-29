# Décisions en vigueur

> 🟢 **Document de RÉFÉRENCE : il décrit l'état ACTUEL du système.** Dernière mise à jour : **21/10/2026, état à la fin de la phase 1**.
>
> Ce tableau ne réécrit pas les décisions. Il dit seulement **si chacune est toujours en vigueur** et **où elle est argumentée**. Une décision révisée plus tard garde son numéro. Son statut passe alors à « révisée en phase N », avec un lien vers la phase concernée.

| N° | Décision (résumé) | Statut | Argumentée dans |
|---|---|---|---|
| D1 | Le modèle pivot est au centre de l'hexagone ; l'éditeur est un adaptateur | ✅ En vigueur | [phase 1 › 05 §A](../01-phase-1-modele-pivot-et-editeur/05-decisions.md) |
| D2 | L'interface n'écrit que par des commandes | ✅ En vigueur | idem |
| D3 | Les commandes sont des données | ✅ En vigueur | idem |
| D4 | Monodépôt pnpm, un paquet par module | ✅ En vigueur | idem |
| D5 | Noyau compilé sans les types du navigateur | ✅ En vigueur | idem |
| D6 | Un seul port entrant `ServiceEditeur`, défini par le noyau | ✅ En vigueur | idem |
| D7 | Document immuable | ✅ En vigueur | idem |
| D8 | Stockage à plat `noeuds: { id → nœud }` + `parentId` + `enfants` | ✅ En vigueur | idem |
| D9 | Ne jamais faire confiance à l'extérieur (validation complète) | ✅ En vigueur | idem |
| D10 | Identifiants et stockage = ports sortants | ✅ En vigueur | idem |
| D11 | `readonly` partout dans le métamodèle | ✅ En vigueur | [phase 1 › 05 §B](../01-phase-1-modele-pivot-et-editeur/05-decisions.md) |
| D12 | `noUncheckedIndexedAccess` activé | ✅ En vigueur | idem |
| D13 | `DefinitionPropriete` en union discriminée | ✅ En vigueur | idem |
| D14 | Catalogue indexé par des `Map`, vérifié à la construction | ✅ En vigueur | idem |
| D15 | Accès sûrs (`Object.hasOwn`, `trouverNoeud`, `Object.fromEntries`) | ✅ En vigueur | idem |
| D16 | Validation : arrêt après R1 et R2, puis toutes les erreurs | ✅ En vigueur | idem |
| D17 | `copierDocumentValide` : copie défensive et nettoyée | ✅ En vigueur | idem |
| D18 | Commande sans effet ⇒ même document, aucun événement | ✅ En vigueur | idem |
| D19 | Identifiant déjà utilisé ⇒ erreur | ✅ En vigueur | idem |
| D20 | « Obligatoire » = présent ; nombres finis | ✅ En vigueur | idem |
| D21 | Codes d'erreur typés | ✅ En vigueur | idem |
| D22 | `executer` renvoie aussi les événements | ✅ En vigueur | idem |
| D23 | Historique : deux piles de documents (100 max.) | ✅ En vigueur | idem |
| D24 | Notification sur une copie du `Set` d'écouteurs | ✅ En vigueur | idem |
| D25 | Démarrage et persistance tolérants aux pannes | ✅ En vigueur | idem |
| D26 | Propriété `desactive` (booléen) sur le Bouton | ✅ En vigueur | idem |
| D27 | Sélection et messages hors du modèle ; sélection dérivée | ✅ En vigueur | idem |
| D28 | Règle d'insertion de la palette | ✅ En vigueur | idem |
| D29 | Canevas : table de rendus ; `aria-disabled` | ✅ En vigueur | idem |
| D30 | `ChampNombre` avec brouillon local | ✅ En vigueur | idem |
| D31 | Une seule version de TypeScript ; noms `@plateforme/*` | ✅ En vigueur | idem |
| D32 | Tests sur trois niveaux, recette Chrome sans téléchargement de navigateur | ✅ En vigueur | idem |
| D33 | Captures de la recette dans `docs/reference/captures/` ; les captures des phases restent figées | ✅ En vigueur | [docs/README.md §5](../README.md) (restructuration du 21/10/2026) |
