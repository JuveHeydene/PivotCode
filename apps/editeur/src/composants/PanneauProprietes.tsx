// Formulaire PILOTÉ PAR LES MÉTADONNÉES : il ne connaît ni « Bouton » ni
// « libellé ». Il lit la DefinitionComposant du nœud et choisit un champ
// selon le `type` de chaque DefinitionPropriete.
import { useId, useState } from 'react';
import type { DefinitionComposant, DefinitionPropriete, Noeud, ValeurPropriete } from '@plateforme/noyau';

type Props = {
  noeud: Noeud;
  definition: DefinitionComposant | undefined;
  estRacine: boolean;
  onModifier: (nom: string, valeur: ValeurPropriete) => void;
  onSupprimer: () => void;
};

export function PanneauProprietes({ noeud, definition, estRacine, onModifier, onSupprimer }: Props) {
  return (
    <div className="proprietes">
      <div className="proprietes-entete">
        <strong>{noeud.composant}</strong>
        <code title={noeud.id}>{noeud.id.length > 10 ? `${noeud.id.slice(0, 8)}…` : noeud.id}</code>
      </div>
      {definition === undefined ? (
        <p>Composant absent du catalogue.</p>
      ) : (
        definition.proprietes.map((p) => (
          <Champ key={`${noeud.id}/${p.nom}`} definition={p} valeur={noeud.proprietes[p.nom]} onModifier={(v) => onModifier(p.nom, v)} />
        ))
      )}
      <button type="button" className="danger" onClick={onSupprimer} disabled={estRacine} title={estRacine ? 'La racine ne peut pas être supprimée' : undefined}>
        Supprimer
      </button>
    </div>
  );
}

type PropsChamp = {
  definition: DefinitionPropriete;
  valeur: ValeurPropriete | undefined;
  onModifier: (valeur: ValeurPropriete) => void;
};

function Champ({ definition, valeur, onModifier }: PropsChamp) {
  const id = useId();
  let champ;
  switch (definition.type) {
    case 'texte':
      champ = <input id={id} type="text" value={typeof valeur === 'string' ? valeur : ''} onChange={(e) => onModifier(e.target.value)} />;
      break;
    case 'nombre':
      champ = <ChampNombre id={id} valeur={typeof valeur === 'number' ? valeur : definition.defaut} onModifier={onModifier} />;
      break;
    case 'booleen':
      champ = <input id={id} type="checkbox" checked={valeur === true} onChange={(e) => onModifier(e.target.checked)} />;
      break;
    case 'choix':
      champ = (
        <select id={id} value={typeof valeur === 'string' ? valeur : definition.defaut} onChange={(e) => onModifier(e.target.value)}>
          {definition.choix.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      );
      break;
  }
  return (
    <div className={`champ champ-${definition.type}`}>
      <label htmlFor={id}>
        {definition.libelle}
        {definition.obligatoire && <span aria-hidden="true"> *</span>}
      </label>
      {champ}
    </div>
  );
}

/**
 * Champ nombre avec un brouillon local : pendant la saisie, le texte peut être
 * provisoirement vide ou incomplet (« - »). On n'envoie la commande que lorsque
 * le texte est un nombre fini ; le métamodèle refuserait NaN.
 */
function ChampNombre({ id, valeur, onModifier }: { id: string; valeur: number; onModifier: (v: number) => void }) {
  const [brouillon, setBrouillon] = useState(String(valeur));
  const [valeurConnue, setValeurConnue] = useState(valeur);
  // Le document a changé ailleurs (annuler, JSON…) : on resynchronise le brouillon.
  if (valeur !== valeurConnue) {
    setValeurConnue(valeur);
    setBrouillon(String(valeur));
  }
  return (
    <input
      id={id}
      type="number"
      value={brouillon}
      onChange={(e) => {
        setBrouillon(e.target.value);
        const nombre = e.target.value.trim() === '' ? Number.NaN : Number(e.target.value);
        if (Number.isFinite(nombre)) {
          setValeurConnue(nombre);
          onModifier(nombre);
        }
      }}
    />
  );
}
