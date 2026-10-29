// La palette ne connaît AUCUN composant en dur : elle lit le catalogue.
import type { DefinitionComposant } from '@plateforme/noyau';

type Props = {
  definitions: readonly DefinitionComposant[];
  onAjouter: (composant: string) => void;
};

export function Palette({ definitions, onAjouter }: Props) {
  return (
    <div className="palette">
      {definitions.map((d) => (
        <button key={d.nom} type="button" onClick={() => onAjouter(d.nom)}>
          + {d.libelle}
        </button>
      ))}
    </div>
  );
}
