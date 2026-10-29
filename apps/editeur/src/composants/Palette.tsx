// La palette ne connaît AUCUN composant en dur : elle lit le catalogue.
// Un composant s'ajoute par un clic (à l'endroit de la sélection) ou par
// glisser-déposer (à l'endroit exact choisi dans le canevas ou l'arbre).
import type { DefinitionComposant } from '@plateforme/noyau';
import type { GestionGlisser } from '../glisser-deposer/use-glisser-deposer';

type Props = {
  definitions: readonly DefinitionComposant[];
  onAjouter: (composant: string) => void;
  glisser?: GestionGlisser;
};

export function Palette({ definitions, onAjouter, glisser }: Props) {
  return (
    <div className="palette">
      {definitions.map((d) => (
        <button
          key={d.nom}
          type="button"
          onClick={() => onAjouter(d.nom)}
          draggable={glisser !== undefined}
          onDragStart={glisser && ((e) => glisser.debuter({ type: 'nouveau', composant: d.nom }, e))}
          onDragEnd={glisser?.terminer}
          title="Cliquer pour ajouter, ou glisser vers le canevas ou l’arbre"
        >
          + {d.libelle}
        </button>
      ))}
    </div>
  );
}
