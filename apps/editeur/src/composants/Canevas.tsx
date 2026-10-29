// Le canevas est un INTERPRÈTE du modèle pivot : il parcourt l'arbre depuis la
// racine et, pour chaque nœud, choisit quoi afficher selon son composant.
// Les rendus sont rangés dans une table composant → fonction (patron Stratégie) :
// ajouter un composant = ajouter une entrée dans `rendus`.
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { trouverNoeud } from '@plateforme/noyau';
import type { DocumentPivot, Noeud, NoeudId } from '@plateforme/noyau';

type ProprietesRendu = {
  noeud: Noeud;
  enfants: ReactNode;
  attributs: {
    'data-noeud-id': NoeudId;
    className: string;
    onClick: (e: MouseEvent) => void;
  };
};

function texte(noeud: Noeud, nom: string, defaut: string): string {
  const v = noeud.proprietes[nom];
  return typeof v === 'string' ? v : defaut;
}

const taillesPolice: Record<string, string> = { petit: '0.85rem', moyen: '1rem', grand: '1.6rem' };

const rendus: Record<string, (p: ProprietesRendu) => ReactNode> = {
  Texte: ({ noeud, attributs }) => (
    <p {...attributs} style={{ fontSize: taillesPolice[texte(noeud, 'taille', 'moyen')] ?? '1rem' }}>
      {texte(noeud, 'contenu', '')}
    </p>
  ),
  Bouton: ({ noeud, attributs }) => {
    const desactive = noeud.proprietes['desactive'] === true;
    // Pas d'attribut HTML `disabled` : un bouton désactivé ne reçoit plus les
    // clics, on ne pourrait donc plus le sélectionner dans le canevas.
    return (
      <button
        type="button"
        {...attributs}
        className={`${attributs.className} apercu-bouton ${texte(noeud, 'variante', 'principal')}${desactive ? ' desactive' : ''}`}
        aria-disabled={desactive}
      >
        {texte(noeud, 'libelle', '')}
      </button>
    );
  },
  Conteneur: ({ noeud, enfants, attributs }) => {
    const espacement = noeud.proprietes['espacement'];
    const style: CSSProperties = {
      flexDirection: noeud.proprietes['direction'] === 'ligne' ? 'row' : 'column',
      gap: typeof espacement === 'number' ? `${espacement}px` : undefined,
    };
    return (
      <div {...attributs} className={`${attributs.className} apercu-conteneur`} style={style}>
        {enfants}
      </div>
    );
  },
};

type Props = {
  document: DocumentPivot;
  selectionId: NoeudId | null;
  onSelectionner: (id: NoeudId | null) => void;
};

export function Canevas({ document, selectionId, onSelectionner }: Props) {
  return (
    <div className="canevas" onClick={() => onSelectionner(null)}>
      <RenduNoeud document={document} id={document.racineId} selectionId={selectionId} onSelectionner={onSelectionner} />
    </div>
  );
}

function RenduNoeud({ document, id, selectionId, onSelectionner }: Props & { id: NoeudId }) {
  const noeud = trouverNoeud(document, id);
  if (noeud === undefined) return null;
  const attributs = {
    'data-noeud-id': id,
    className: `apercu${id === selectionId ? ' selectionne' : ''}`,
    onClick: (e: MouseEvent) => {
      e.stopPropagation(); // sinon le clic remonterait et sélectionnerait le parent
      onSelectionner(id);
    },
  };
  const enfants = noeud.enfants.map((enfantId) => (
    <RenduNoeud key={enfantId} document={document} id={enfantId} selectionId={selectionId} onSelectionner={onSelectionner} />
  ));
  const rendu = rendus[noeud.composant];
  if (rendu === undefined) {
    return (
      <div {...attributs} className={`${attributs.className} apercu-inconnu`}>
        Composant inconnu : {noeud.composant}
      </div>
    );
  }
  return rendu({ noeud, enfants, attributs });
}
