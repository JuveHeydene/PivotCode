// Le canevas AFFICHE l'arbre web produit par @plateforme/rendu-web : les mêmes
// règles que celles des générateurs React et Vue. Il ne connaît aucun nom de
// composant : il crée simplement l'élément HTML décrit (balise, style, texte).
//
// Deux modes :
// - édition : chaque élément est cliquable (sélection), avec des repères visuels ;
// - aperçu  : le rendu exact, sans aucune décoration, comme dans l'application exportée.
import { createElement } from 'react';
import type { CSSProperties, DragEvent, MouseEvent } from 'react';
import type { Catalogue, DocumentPivot, NoeudId } from '@plateforme/noyau';
import { arbreWeb } from '@plateforme/rendu-web';
import type { NoeudWeb } from '@plateforme/rendu-web';
import type { GestionGlisser } from '../glisser-deposer/use-glisser-deposer';

type Props = {
  document: DocumentPivot;
  catalogue: Catalogue;
  selectionId: NoeudId | null;
  onSelectionner: (id: NoeudId | null) => void;
  apercu: boolean;
  glisser?: GestionGlisser;
};

export function Canevas({ document, catalogue, selectionId, onSelectionner, apercu, glisser }: Props) {
  const arbre = arbreWeb(document, catalogue, { inconnu: 'remplacer' });
  return (
    <div
      className={`canevas${apercu ? ' mode-apercu' : ''}`}
      data-testid="canevas"
      onClick={apercu ? undefined : () => onSelectionner(null)}
    >
      <RenduWeb noeud={arbre} selectionId={selectionId} onSelectionner={onSelectionner} apercu={apercu} glisser={glisser} estRacine />
    </div>
  );
}

type PropsRendu = {
  noeud: NoeudWeb;
  selectionId: NoeudId | null;
  onSelectionner: (id: NoeudId | null) => void;
  apercu: boolean;
  glisser?: GestionGlisser | undefined;
  estRacine?: boolean;
};

function RenduWeb({ noeud, selectionId, onSelectionner, apercu, glisser, estRacine = false }: PropsRendu) {
  const attributs: Record<string, unknown> = {
    'data-noeud-id': noeud.id,
    style: noeud.style as CSSProperties,
  };
  if (noeud.balise === 'button') attributs['type'] = 'button';
  if (apercu) {
    // Rendu exact : un bouton désactivé l'est vraiment, comme dans le code généré.
    if (noeud.desactive) attributs['disabled'] = true;
  } else {
    // Édition : pas d'attribut `disabled`, sinon le bouton ne recevrait plus le
    // clic et ne pourrait plus être sélectionné (décision D29).
    if (noeud.desactive) attributs['aria-disabled'] = true;
    const indication = glisser?.indication(noeud.id, 'canevas');
    attributs['className'] = `apercu apercu-${noeud.balise}${noeud.id === selectionId ? ' selectionne' : ''}${indication ? ` ${indication}` : ''}`;
    attributs['onClick'] = (e: MouseEvent) => {
      e.stopPropagation(); // sinon le clic remonterait et sélectionnerait le parent
      onSelectionner(noeud.id);
    };
    if (glisser !== undefined) {
      // Glisser-déposer (édition seulement). La racine peut recevoir, pas partir.
      attributs['draggable'] = !estRacine;
      attributs['onDragStart'] = (e: DragEvent) => glisser.debuter({ type: 'deplacer', id: noeud.id }, e);
      attributs['onDragOver'] = (e: DragEvent) => glisser.survoler(noeud.id, 'canevas', e);
      attributs['onDragLeave'] = () => glisser.quitter(noeud.id);
      attributs['onDrop'] = (e: DragEvent) => glisser.deposer(noeud.id, 'canevas', e);
      attributs['onDragEnd'] = glisser.terminer;
    }
  }
  const enfants = noeud.enfants.map((enfant) => (
    <RenduWeb key={enfant.id} noeud={enfant} selectionId={selectionId} onSelectionner={onSelectionner} apercu={apercu} glisser={glisser} />
  ));
  return createElement(noeud.balise, attributs, noeud.texte, ...enfants);
}
