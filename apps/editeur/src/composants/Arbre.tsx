// Vue en arbre du document (composant récursif), synchronisée avec la sélection.
import { trouverNoeud } from '@plateforme/noyau';
import type { DocumentPivot, NoeudId } from '@plateforme/noyau';
import type { GestionGlisser } from '../glisser-deposer/use-glisser-deposer';
import type { IndexCatalogue } from '../outils-editeur';
import { resume } from '../outils-editeur';

type Props = {
  document: DocumentPivot;
  index: IndexCatalogue;
  selectionId: NoeudId | null;
  onSelectionner: (id: NoeudId) => void;
  glisser?: GestionGlisser;
};

export function Arbre(props: Props) {
  return (
    <ul className="arbre" aria-label="Arbre des composants">
      <BrancheArbre {...props} id={props.document.racineId} />
    </ul>
  );
}

function BrancheArbre({ document, index, selectionId, onSelectionner, glisser, id }: Props & { id: NoeudId }) {
  const noeud = trouverNoeud(document, id);
  if (noeud === undefined) return null;
  const texte = resume(noeud, index);
  return (
    <li>
      <button
        type="button"
        className={[id === selectionId ? 'selectionne' : '', glisser?.indication(id, 'arbre') ?? ''].join(' ').trim() || undefined}
        aria-current={id === selectionId ? 'true' : undefined}
        data-arbre-id={id}
        onClick={() => onSelectionner(id)}
        draggable={glisser !== undefined && id !== document.racineId}
        onDragStart={glisser && ((e) => glisser.debuter({ type: 'deplacer', id }, e))}
        onDragOver={glisser && ((e) => glisser.survoler(id, 'arbre', e))}
        onDragLeave={glisser && (() => glisser.quitter(id))}
        onDrop={glisser && ((e) => glisser.deposer(id, 'arbre', e))}
        onDragEnd={glisser?.terminer}
      >
        <span className="arbre-composant">{noeud.composant}</span>
        {texte !== '' && <span className="arbre-resume"> « {texte} »</span>}
      </button>
      {noeud.enfants.length > 0 && (
        <ul>
          {noeud.enfants.map((enfantId) => (
            <BrancheArbre key={enfantId} document={document} index={index} selectionId={selectionId} onSelectionner={onSelectionner} glisser={glisser} id={enfantId} />
          ))}
        </ul>
      )}
    </li>
  );
}
