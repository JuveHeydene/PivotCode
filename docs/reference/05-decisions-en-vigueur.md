# Décisions en vigueur

> 🟢 **Document de RÉFÉRENCE : il décrit l'état ACTUEL du système.** Dernière mise à jour : **29/10/2026, état à la fin de la phase 4**.
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
| D8 | Stockage à plat `noeuds: { id → nœud }` + `parentId` + `enfants` | ✅ En vigueur (format **interne** ; complété en phase 4 par un format d'échange, D71) | idem |
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
| D29 | Canevas : table de rendus ; `aria-disabled` | 🔁 **Révisée en phase 2 par D39** : la table de rendus est déplacée dans `rendu-web` et partagée. `aria-disabled` en mode édition : toujours en vigueur | [phase 1 › 05 §B](../01-phase-1-modele-pivot-et-editeur/05-decisions.md) → [phase 2 › 04 D39](../02-phase-2-generateurs-react-vue/04-decisions.md) |
| D30 | `ChampNombre` avec brouillon local | ✅ En vigueur | [phase 1 › 05 §B](../01-phase-1-modele-pivot-et-editeur/05-decisions.md) |
| D31 | Une seule version de TypeScript ; noms `@plateforme/*` | ✅ En vigueur | idem |
| D32 | Tests sur trois niveaux, recette Chrome sans téléchargement de navigateur | ✅ En vigueur | idem |
| D33 | Captures de la recette dans `docs/reference/captures/` ; les captures des phases restent figées | ✅ En vigueur | [docs/README.md §5](../README.md) (restructuration du 21/10/2026) |
| D34 | Les générateurs avant le glisser-déposer (phase 2 = T3, phase 3 = T2) | ✅ En vigueur | [phase 2 › 04](../02-phase-2-generateurs-react-vue/04-decisions.md) |
| D35 | Mise en page relative au parent (flexbox), pas de coordonnées absolues | ✅ En vigueur | idem |
| D36 | Palette fixe de couleurs nommées | ✅ En vigueur | idem |
| D37 | Nouvelles propriétés facultatives ; `versionMetamodele` reste 1 | ✅ En vigueur | idem |
| D38 | Bornes `min` / `max` sur les propriétés nombre | ✅ En vigueur | idem |
| D39 | Une représentation web commune (`rendu-web`) pour le canevas et les générateurs | ✅ En vigueur | idem |
| D40 | Les règles lisent les valeurs par défaut dans le catalogue | ✅ En vigueur | idem |
| D41 | Styles en ligne dans le code généré | ✅ En vigueur | idem |
| D42 | Générateurs = fonctions pures `document → fichiers` | ✅ En vigueur | idem |
| D43 | Transformation déterministe, sans IA | ✅ En vigueur | idem |
| D44 | Écriture du code par un imprimeur maison | ✅ En vigueur | idem |
| D45 | Échappement propre à chaque cible ; texte collé aux balises en Vue | ✅ En vigueur | idem |
| D46 | Composant sans règle : erreur (générateurs) ou encadré (canevas) | ✅ En vigueur | idem |
| D47 | Mode « Aperçu » | ✅ En vigueur | idem |
| D48 | Les styles de l'éditeur ne touchent pas les éléments du canevas | ✅ En vigueur | idem |
| D49 | Export : adaptateur de téléchargement injecté, zip `fflate` à date fixe | ✅ En vigueur | idem |
| D50 | Projets générés : Vite + JavaScript, versions fixées, icône vide | ✅ En vigueur | idem |
| D51 | Recette de parité sur les styles calculés | ✅ En vigueur | idem |
| D52 | Document de démonstration partagé | ✅ En vigueur | idem |
| D53 | Commande `deplacer-noeud` : position comptée sans le nœud ; même place = même document | ✅ En vigueur | [phase 3 › 04](../03-phase-3-deplacement-et-json-schema/04-decisions.md) |
| D54 | Cycle détecté en remontant les `parentId` (O(profondeur)) ; `estDansSousArbre` | ✅ En vigueur | idem |
| D55 | Codes `RACINE_IMMOBILE`, `DEPLACEMENT_CYCLIQUE` | ✅ En vigueur | idem |
| D56 | Glisser-déposer HTML5 natif, sans bibliothèque | ✅ En vigueur | idem |
| D57 | Règles de dépôt pures, séparées du hook | ✅ En vigueur | idem |
| D58 | Zones de dépôt : bords et milieu, moitiés ; axe du parent ; racine = dedans | ✅ En vigueur | idem |
| D59 | Objet glissé gardé dans l'état React (pas dans `dataTransfer`) | ✅ En vigueur | idem |
| D60 | Dépôt interdit : rien ; double protection interface et noyau | ✅ En vigueur | idem |
| D61 | Monter / Descendre (sans souris) | ✅ En vigueur | idem |
| D62 | Pas de glisser-déposer en aperçu | ✅ En vigueur | idem |
| D63 | JSON Schema produit automatiquement à partir du catalogue | ✅ En vigueur | idem |
| D64 | Schéma strict, noyau tolérant (principe de robustesse) | ✅ En vigueur | idem |
| D65 | Nœud = `oneOf` discriminé par `composant` | ✅ En vigueur | idem |
| D66 | Schéma publié, vérifié à jour, régénéré par script | ✅ En vigueur | idem |
| D67 | Tests par propriétés, avec mesure de la répartition des cas | ✅ En vigueur | idem |
| D68 | Ajv seulement pour les tests | ✅ En vigueur | idem |
| D69 | Typage séparé pour les tests utilisant Node | ✅ En vigueur | idem |
| D70 | Téléchargement du schéma par un adaptateur injecté | ✅ En vigueur | idem |
| D71 | Format d'échange **imbriqué** en plus du format interne à plat (D8 inchangée) | ✅ En vigueur | [phase 4 › 03](../04-phase-4-format-d-echange-imbrique/03-decisions.md) |
| D72 | Identifiants facultatifs dans l'imbriqué ; fabriqués `n1`, `n2`… (déterministe) | ✅ En vigueur | idem |
| D73 | Pas de champ `enfants` pour un composant sans enfants ; facultatif pour un conteneur | ✅ En vigueur | idem |
| D74 | Import = conversion puis validation complète du noyau ; erreurs avec chemin | ✅ En vigueur | idem |
| D75 | Conversions itératives ; garde contre les objets partagés | ✅ En vigueur | idem |
| D76 | Paquet `format-imbrique` séparé ; schéma imbriqué dans `schema-json` | ✅ En vigueur | idem |
| D77 | « À plat / Imbriqué » et ⤓ dans le panneau JSON | ✅ En vigueur | idem |
| D78 | Champ discriminant `format: "pivot-imbrique"` | ✅ En vigueur | idem |
