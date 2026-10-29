import { trouverNoeud } from '@plateforme/noyau';
import type { Catalogue, DocumentPivot, NoeudId } from '@plateforme/noyau';
import type { NoeudWeb } from './element-web';
import { PALETTE } from './palette';
import { decrireNoeud } from './regles';

export class ErreurRendu extends Error {}

export type OptionsArbre = {
  /**
   * Que faire d'un composant sans règle ?
   * - 'erreur' (générateurs) : refuser, plutôt que produire du code faux ;
   * - 'remplacer' (canevas) : afficher un encadré « Composant inconnu ».
   */
  readonly inconnu: 'erreur' | 'remplacer';
};

/** Traduit tout le document en arbre d'éléments web, depuis la racine. O(n). */
export function arbreWeb(document: DocumentPivot, catalogue: Catalogue, options: OptionsArbre): NoeudWeb {
  return traduire(document, document.racineId, catalogue, options);
}

function traduire(document: DocumentPivot, id: NoeudId, catalogue: Catalogue, options: OptionsArbre): NoeudWeb {
  const noeud = trouverNoeud(document, id);
  if (noeud === undefined) throw new ErreurRendu(`Le nœud « ${id} » n'existe pas.`);
  const enfants = noeud.enfants.map((enfantId) => traduire(document, enfantId, catalogue, options));
  const element = decrireNoeud(noeud, catalogue);
  if (element !== null) return { ...element, id, composant: noeud.composant, enfants };
  if (options.inconnu === 'erreur') {
    throw new ErreurRendu(`Aucune règle de rendu web pour le composant « ${noeud.composant} ».`);
  }
  return {
    balise: 'div',
    texte: `Composant inconnu : ${noeud.composant}`,
    style: { color: PALETTE['danger'] ?? 'red' },
    id,
    composant: noeud.composant,
    enfants,
  };
}
