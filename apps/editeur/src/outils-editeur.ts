// Fonctions pures propres à l'ÉDITEUR (pas au modèle) : elles décident
// comment l'interface se comporte, à partir du document et du catalogue.
import { COMPOSANT_RACINE, trouverNoeud } from '@plateforme/noyau';
import type { DefinitionComposant, DocumentPivot, Noeud, NoeudId } from '@plateforme/noyau';

/** Index nom → définition, construit une fois : recherche en O(1). */
export type IndexCatalogue = ReadonlyMap<string, DefinitionComposant>;

export function indexerCatalogue(definitions: readonly DefinitionComposant[]): IndexCatalogue {
  return new Map(definitions.map((d) => [d.nom, d]));
}

/**
 * Où ajouter un nouveau composant ?
 * - la sélection accepte des enfants → dedans, à la fin ;
 * - sinon → à côté, juste après elle (dans son parent) ;
 * - sans sélection → à la fin de la racine.
 */
export function cibleAjout(
  document: DocumentPivot,
  selectionId: NoeudId | null,
  index: IndexCatalogue,
): { parentId: NoeudId; position?: number } {
  const selection = selectionId === null ? undefined : trouverNoeud(document, selectionId);
  if (selection === undefined) return { parentId: document.racineId };
  if (index.get(selection.composant)?.accepteEnfants) return { parentId: selection.id };
  if (selection.parentId === null) return { parentId: document.racineId };
  const parent = trouverNoeud(document, selection.parentId);
  const position = parent === undefined ? undefined : parent.enfants.indexOf(selection.id) + 1;
  return position === undefined ? { parentId: selection.parentId } : { parentId: selection.parentId, position };
}

/**
 * Court résumé d'un nœud pour l'arbre : la valeur de sa première propriété de
 * type texte (piloté par le catalogue, aucun nom de composant en dur).
 */
export function resume(noeud: Noeud, index: IndexCatalogue, longueur = 24): string {
  const definition = index.get(noeud.composant);
  const premiereTexte = definition?.proprietes.find((p) => p.type === 'texte');
  if (premiereTexte === undefined) return '';
  const valeur = noeud.proprietes[premiereTexte.nom];
  if (typeof valeur !== 'string') return '';
  return valeur.length > longueur ? `${valeur.slice(0, longueur - 1)}…` : valeur;
}

/** Un document qui ne contient qu'une racine, construit à partir du catalogue. */
export function documentVide(index: IndexCatalogue, id: NoeudId): DocumentPivot {
  const definition = index.get(COMPOSANT_RACINE);
  const proprietes = Object.fromEntries((definition?.proprietes ?? []).map((p) => [p.nom, p.defaut]));
  return {
    versionMetamodele: 1,
    racineId: id,
    noeuds: { [id]: { id, composant: COMPOSANT_RACINE, proprietes, parentId: null, enfants: [] } },
  };
}

/** Le document de l'étape 2 : sert de démonstration (bouton « Charger l'exemple »). */
export const documentExemple: DocumentPivot = {
  versionMetamodele: 1,
  racineId: 'racine',
  noeuds: {
    racine: { id: 'racine', composant: 'Conteneur', proprietes: { direction: 'colonne', espacement: 8 }, parentId: null, enfants: ['t1', 'c1'] },
    t1: { id: 't1', composant: 'Texte', proprietes: { contenu: 'Bienvenue', taille: 'moyen' }, parentId: 'racine', enfants: [] },
    c1: { id: 'c1', composant: 'Conteneur', proprietes: { direction: 'ligne', espacement: 8 }, parentId: 'racine', enfants: ['b1', 'b2'] },
    b1: { id: 'b1', composant: 'Bouton', proprietes: { libelle: 'Valider', variante: 'principal' }, parentId: 'c1', enfants: [] },
    b2: { id: 'b2', composant: 'Bouton', proprietes: { libelle: 'Annuler', variante: 'secondaire' }, parentId: 'c1', enfants: [] },
  },
};
