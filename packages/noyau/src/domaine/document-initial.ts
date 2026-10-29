import type { Catalogue } from './composant';
import { valeursParDefaut } from './composant';
import type { DocumentPivot, NoeudId } from './noeud';

/** Composant utilisé pour la racine de tout nouveau document. */
export const COMPOSANT_RACINE = 'Conteneur';

/** Un document qui ne contient qu'une racine Conteneur avec ses valeurs par défaut. */
export function creerDocumentInitial(catalogue: Catalogue, nouvelId: () => NoeudId): DocumentPivot {
  const definition = catalogue.trouver(COMPOSANT_RACINE);
  if (definition === undefined || !definition.accepteEnfants) {
    throw new Error(`Le catalogue doit contenir un composant « ${COMPOSANT_RACINE} » qui accepte des enfants.`);
  }
  const id = nouvelId();
  return {
    versionMetamodele: 1,
    racineId: id,
    noeuds: {
      [id]: { id, composant: COMPOSANT_RACINE, proprietes: valeursParDefaut(definition), parentId: null, enfants: [] },
    },
  };
}
