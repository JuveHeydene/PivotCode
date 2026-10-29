// Le modèle pivot en JSON, dans les deux sens :
// - mode lecture : suit le document en direct (sens éditeur → modèle) ;
// - mode édition : brouillon local, appliqué par la commande
//   `remplacer-document` (sens modèle → éditeur), validée par le noyau.
import { useState } from 'react';
import type { DocumentPivot, ErreurModele, NoeudId, ServiceEditeur } from '@plateforme/noyau';

type Props = {
  document: DocumentPivot;
  service: ServiceEditeur;
  onSelectionner: (id: NoeudId) => void;
};

type Etat =
  | { mode: 'lecture' }
  | { mode: 'edition'; brouillon: string; erreurSyntaxe: string | null; erreurs: readonly ErreurModele[] };

export function VueModelePivot({ document, service, onSelectionner }: Props) {
  const [etat, setEtat] = useState<Etat>({ mode: 'lecture' });
  const json = JSON.stringify(document, null, 2);

  if (etat.mode === 'lecture') {
    return (
      <div className="modele-pivot">
        <div className="modele-pivot-actions">
          <button type="button" onClick={() => setEtat({ mode: 'edition', brouillon: json, erreurSyntaxe: null, erreurs: [] })}>
            Modifier
          </button>
          <span className="taille">{Object.keys(document.noeuds).length} nœud(s)</span>
        </div>
        <pre aria-label="Modèle pivot (JSON)">{json}</pre>
      </div>
    );
  }

  function appliquer(brouillon: string) {
    let valeur: unknown;
    try {
      valeur = JSON.parse(brouillon);
    } catch (e) {
      setEtat({ mode: 'edition', brouillon, erreurSyntaxe: e instanceof Error ? e.message : String(e), erreurs: [] });
      return;
    }
    const resultat = service.executer({ type: 'remplacer-document', document: valeur });
    if (resultat.succes) setEtat({ mode: 'lecture' });
    else setEtat({ mode: 'edition', brouillon, erreurSyntaxe: null, erreurs: resultat.erreurs });
  }

  return (
    <div className="modele-pivot edition">
      <div className="modele-pivot-actions">
        <button type="button" className="principal" onClick={() => appliquer(etat.brouillon)}>
          Appliquer
        </button>
        <button type="button" onClick={() => setEtat({ mode: 'lecture' })}>
          Abandonner
        </button>
      </div>
      <textarea
        aria-label="Modèle pivot (JSON) en édition"
        spellCheck={false}
        value={etat.brouillon}
        onChange={(e) => setEtat({ ...etat, brouillon: e.target.value })}
      />
      {etat.erreurSyntaxe !== null && (
        <div className="erreurs" role="alert">
          <strong>JSON invalide (syntaxe)</strong>
          <p>{etat.erreurSyntaxe}</p>
        </div>
      )}
      {etat.erreurs.length > 0 && (
        <div className="erreurs" role="alert">
          <strong>Document refusé par le métamodèle ({etat.erreurs.length} erreur(s))</strong>
          <ul>
            {etat.erreurs.map((e, i) => (
              <li key={i}>
                <code>{e.code}</code> {e.message}
                {e.noeudId !== undefined && Object.hasOwn(document.noeuds, e.noeudId) && (
                  <button type="button" className="lien" onClick={() => onSelectionner(e.noeudId as NoeudId)}>
                    voir
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
