// Vue en arbre du document (composant récursif), synchronisée avec la sélection.
import { trouverNoeud } from '@plateforme/noyau';
import type { DocumentPivot, NoeudId } from '@plateforme/noyau';
import type { IndexCatalogue } from '../outils-editeur';
import { resume } from '../outils-editeur';

type Props = {
  document: DocumentPivot;
  index: IndexCatalogue;
  selectionId: NoeudId | null;
  onSelectionner: (id: NoeudId) => void;
};

export function Arbre(props: Props) {
  return (
    <ul className="arbre" aria-label="Arbre des composants">
      <BrancheArbre {...props} id={props.document.racineId} />
    </ul>
  );
}

function BrancheArbre({ document, index, selectionId, onSelectionner, id }: Props & { id: NoeudId }) {
  const noeud = trouverNoeud(document, id);
  if (noeud === undefined) return null;
  const texte = resume(noeud, index);
  return (
    <li>
      <button
        type="button"
        className={id === selectionId ? 'selectionne' : undefined}
        aria-current={id === selectionId ? 'true' : undefined}
        onClick={() => onSelectionner(id)}
      >
        <span className="arbre-composant">{noeud.composant}</span>
        {texte !== '' && <span className="arbre-resume"> « {texte} »</span>}
      </button>
      {noeud.enfants.length > 0 && (
        <ul>
          {noeud.enfants.map((enfantId) => (
            <BrancheArbre key={enfantId} document={document} index={index} selectionId={selectionId} onSelectionner={onSelectionner} id={enfantId} />
          ))}
        </ul>
      )}
    </li>
  );
}
