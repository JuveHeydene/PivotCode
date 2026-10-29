// Règles du glisser-déposer : fonctions PURES (aucun DOM, aucun React), testables seules.
// Elles répondent à trois questions :
//   1. Où la souris se trouve-t-elle dans l'élément survolé ? (zone : avant, après, dedans)
//   2. Qu'est-ce que cela veut dire dans le modèle ? (parent + position)
//   3. Ce dépôt est-il permis ? (parent qui accepte des enfants, pas de cycle)
import { estDansSousArbre, trouverNoeud } from '@plateforme/noyau';
import type { DocumentPivot, NoeudId } from '@plateforme/noyau';
import type { IndexCatalogue } from '../outils-editeur';

/** Ce que l'utilisateur fait glisser. */
export type Glisse = { readonly type: 'nouveau'; readonly composant: string } | { readonly type: 'deplacer'; readonly id: NoeudId };

export type Zone = 'avant' | 'apres' | 'dedans';

/** Sens dans lequel les frères de l'élément survolé sont rangés. */
export type Axe = 'vertical' | 'horizontal';

export type Rectangle = { readonly left: number; readonly top: number; readonly width: number; readonly height: number };

/** Part de l'élément, à chaque bord, qui signifie « avant » ou « après » pour un conteneur. */
const BORD = 0.25;

/**
 * Zone visée selon la position de la souris dans l'élément.
 * - Conteneur : le quart du début = avant, le quart de la fin = après, le milieu = dedans.
 * - Autre élément : première moitié = avant, seconde moitié = après.
 * Un élément sans taille (cas des tests sans mise en page) est considéré « au milieu ».
 */
export function zoneDepot(rect: Rectangle, point: { x: number; y: number }, axe: Axe, accepteEnfants: boolean): Zone {
  const debut = axe === 'vertical' ? rect.top : rect.left;
  const taille = axe === 'vertical' ? rect.height : rect.width;
  const position = axe === 'vertical' ? point.y : point.x;
  const ratio = taille > 0 ? (position - debut) / taille : 0.5;
  if (accepteEnfants) {
    if (ratio < BORD) return 'avant';
    if (ratio > 1 - BORD) return 'apres';
    return 'dedans';
  }
  return ratio < 0.5 ? 'avant' : 'apres';
}

/** Sens de rangement des enfants d'un nœud (sa propriété `direction`). */
export function axeDesEnfants(document: DocumentPivot, parentId: NoeudId | null): Axe {
  const parent = parentId === null ? undefined : trouverNoeud(document, parentId);
  return parent?.proprietes['direction'] === 'ligne' ? 'horizontal' : 'vertical';
}

export type Cible = { readonly parentId: NoeudId; readonly position: number; readonly zone: Zone };

/**
 * Traduit « déposé dans la zone Z de l'élément C » en « parent + position ».
 * Les positions sont comptées SANS l'élément déplacé (même convention que la
 * commande deplacer-noeud). Avant ou après la racine n'a pas de sens : on dépose dedans.
 */
export function cibleDepot(document: DocumentPivot, cibleId: NoeudId, zone: Zone, idDeplace?: NoeudId): Cible | null {
  const cible = trouverNoeud(document, cibleId);
  if (cible === undefined) return null;
  const sans = (ids: readonly NoeudId[]) => ids.filter((id) => id !== idDeplace);
  if (zone === 'dedans' || cible.parentId === null) {
    return { parentId: cible.id, position: sans(cible.enfants).length, zone: 'dedans' };
  }
  const parent = trouverNoeud(document, cible.parentId);
  if (parent === undefined) return null;
  const freres = sans(parent.enfants);
  const index = freres.indexOf(cibleId);
  if (index === -1) return null; // on survole l'élément déplacé lui-même
  return { parentId: parent.id, position: zone === 'avant' ? index : index + 1, zone };
}

/** Le dépôt est-il permis ? Le parent doit accepter des enfants, et un déplacement ne doit pas créer de cycle. */
export function depotPermis(document: DocumentPivot, index: IndexCatalogue, glisse: Glisse, parentId: NoeudId): boolean {
  const parent = trouverNoeud(document, parentId);
  if (parent === undefined || !index.get(parent.composant)?.accepteEnfants) return false;
  if (glisse.type === 'deplacer') return !estDansSousArbre(document, glisse.id, parentId);
  return index.has(glisse.composant);
}
