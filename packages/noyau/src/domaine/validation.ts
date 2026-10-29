// Vérifie qu'une valeur quelconque (JSON collé, contenu du stockage…) est un
// document pivot conforme au métamodèle (décision D9 : ne jamais faire confiance
// à l'extérieur). Fonction pure : ne lève jamais d'exception.
//
// Complexité totale : O(n + p + e), n nœuds, p propriétés, e liens parent → enfant.

import type { Catalogue } from './composant';
import { verifierValeur } from './composant';
import type { ErreurModele } from './erreur';
import { erreur } from './erreur';
import type { DocumentPivot, Noeud, NoeudId } from './noeud';

// --- Gardes de type : permettent à TypeScript d'affiner `unknown`. ---

function estObjet(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function estTexte(x: unknown): x is string {
  return typeof x === 'string';
}

function estTableauDeTextes(x: unknown): x is string[] {
  return Array.isArray(x) && x.every(estTexte);
}

export function validerDocument(candidat: unknown, catalogue: Catalogue): ErreurModele[] {
  // R1 — forme générale. Sans elle, les autres règles n'ont pas de sens.
  if (
    !estObjet(candidat) ||
    candidat['versionMetamodele'] !== 1 ||
    !estTexte(candidat['racineId']) ||
    !estObjet(candidat['noeuds'])
  ) {
    return [
      erreur(
        'FORME_INVALIDE',
        'Le document doit être un objet { versionMetamodele: 1, racineId: texte, noeuds: objet }.',
      ),
    ];
  }
  const racineId = candidat['racineId'];
  const brut = candidat['noeuds'];

  // R2 — forme de chaque nœud. Si un seul nœud est mal formé, on s'arrête :
  // les règles suivantes suivent les liens entre nœuds et produiraient des
  // erreurs en cascade trompeuses.
  const erreursForme: ErreurModele[] = [];
  const noeuds = new Map<NoeudId, Noeud>();
  for (const [cle, n] of Object.entries(brut)) {
    if (
      !estObjet(n) ||
      !estTexte(n['id']) ||
      !estTexte(n['composant']) ||
      !estObjet(n['proprietes']) ||
      !(n['parentId'] === null || estTexte(n['parentId'])) ||
      !estTableauDeTextes(n['enfants'])
    ) {
      erreursForme.push(
        erreur(
          'NOEUD_MAL_FORME',
          `Le nœud « ${cle} » doit avoir id (texte), composant (texte), proprietes (objet), parentId (texte ou null) et enfants (tableau de textes).`,
          cle,
        ),
      );
    } else if (n['id'] !== cle) {
      erreursForme.push(
        erreur('NOEUD_MAL_FORME', `La clé « ${cle} » ne correspond pas à l'id « ${n['id']} » du nœud.`, cle),
      );
    } else {
      // Les propriétés seront vérifiées en R5 ; à ce stade la forme est sûre.
      noeuds.set(cle, n as unknown as Noeud);
    }
  }
  if (erreursForme.length > 0) return erreursForme;

  const erreurs: ErreurModele[] = [];

  // R3 — la racine existe et n'a pas de parent.
  const racine = noeuds.get(racineId);
  if (racine === undefined) {
    erreurs.push(erreur('RACINE_INVALIDE', `La racine « ${racineId} » n'existe pas dans noeuds.`));
  } else if (racine.parentId !== null) {
    erreurs.push(erreur('RACINE_INVALIDE', 'La racine doit avoir parentId: null.', racineId));
  }

  for (const noeud of noeuds.values()) {
    // R4 — le composant existe dans le catalogue.
    const definition = catalogue.trouver(noeud.composant);
    if (definition === undefined) {
      erreurs.push(
        erreur('COMPOSANT_INCONNU', `Le composant « ${noeud.composant} » n'existe pas dans le catalogue.`, noeud.id),
      );
    } else {
      // R5 — propriétés : obligatoires présentes, valeurs correctes, aucune inconnue.
      for (const definitionPropriete of definition.proprietes) {
        if (definitionPropriete.obligatoire && !Object.hasOwn(noeud.proprietes, definitionPropriete.nom)) {
          erreurs.push(
            erreur(
              'PROPRIETE_MANQUANTE',
              `${noeud.composant} : la propriété obligatoire « ${definitionPropriete.nom} » est absente.`,
              noeud.id,
            ),
          );
        }
      }
      for (const [nom, valeur] of Object.entries(noeud.proprietes)) {
        const definitionPropriete = catalogue.trouverPropriete(noeud.composant, nom);
        if (definitionPropriete === undefined) {
          erreurs.push(
            erreur('PROPRIETE_INCONNUE', `${noeud.composant} : la propriété « ${nom} » n'existe pas.`, noeud.id),
          );
          continue;
        }
        const probleme = verifierValeur(definitionPropriete, valeur);
        if (probleme !== null) {
          erreurs.push(
            erreur(
              definitionPropriete.type === 'choix' && typeof valeur === 'string'
                ? 'PROPRIETE_CHOIX_INVALIDE'
                : 'PROPRIETE_TYPE_INVALIDE',
              `${noeud.composant}.${nom} : ${probleme}.`,
              noeud.id,
            ),
          );
        }
      }

      // R6 — un composant sans enfants n'a pas d'enfants.
      if (!definition.accepteEnfants && noeud.enfants.length > 0) {
        erreurs.push(
          erreur('ENFANTS_INTERDITS', `Le composant ${noeud.composant} n'accepte pas d'enfants.`, noeud.id),
        );
      }
    }

    // R7 — chaque enfant cité existe et désigne ce nœud comme parent.
    for (const enfantId of noeud.enfants) {
      const enfant = noeuds.get(enfantId);
      if (enfant === undefined) {
        erreurs.push(
          erreur('LIEN_INCOHERENT', `L'enfant « ${enfantId} » de « ${noeud.id} » n'existe pas.`, noeud.id),
        );
      } else if (enfant.parentId !== noeud.id) {
        erreurs.push(
          erreur(
            'LIEN_INCOHERENT',
            `« ${enfantId} » est listé comme enfant de « ${noeud.id} » mais son parentId vaut « ${String(enfant.parentId)} ».`,
            enfantId,
          ),
        );
      }
    }
  }

  // R8 — chaque nœud est atteignable depuis la racine exactement une fois.
  // Parcours en profondeur itératif (pile explicite + ensemble des nœuds vus) :
  // chaque nœud et chaque lien sont traités une fois → O(n + e), et pas de
  // débordement de la pile d'appels sur un arbre très profond.
  if (racine !== undefined) {
    const vus = new Set<NoeudId>();
    const pile: NoeudId[] = [racineId];
    while (pile.length > 0) {
      const id = pile.pop() as NoeudId;
      if (vus.has(id)) {
        erreurs.push(
          erreur('CYCLE_OU_PARTAGE', `Le nœud « ${id} » est atteint plusieurs fois (cycle ou parent multiple).`, id),
        );
        continue; // ne pas redescendre : un cycle ferait boucler à l'infini
      }
      vus.add(id);
      const noeud = noeuds.get(id);
      if (noeud === undefined) continue; // enfant inexistant, déjà signalé en R7
      for (const enfantId of noeud.enfants) pile.push(enfantId);
    }
    for (const id of noeuds.keys()) {
      if (!vus.has(id)) {
        erreurs.push(erreur('NOEUD_ORPHELIN', `Le nœud « ${id} » n'est pas atteignable depuis la racine.`, id));
      }
    }
  }

  return erreurs;
}

/**
 * Recopie un document VALIDE en ne gardant que les champs du métamodèle.
 * Le résultat ne partage aucun objet avec l'entrée : celui qui a fourni le
 * candidat ne peut plus modifier le document par la suite.
 */
export function copierDocumentValide(candidat: unknown): DocumentPivot {
  const source = candidat as DocumentPivot;
  // Object.fromEntries crée de vraies propriétés : une clé « __proto__ » venue
  // d'un JSON reste une clé ordinaire (une affectation noeuds[id] = … changerait
  // le prototype de l'objet).
  const noeuds = Object.fromEntries(
    Object.entries(source.noeuds).map(([id, n]): [NoeudId, Noeud] => [
      id,
      {
        id: n.id,
        composant: n.composant,
        proprietes: { ...n.proprietes },
        parentId: n.parentId,
        enfants: [...n.enfants],
      },
    ]),
  );
  return { versionMetamodele: 1, racineId: source.racineId, noeuds };
}
