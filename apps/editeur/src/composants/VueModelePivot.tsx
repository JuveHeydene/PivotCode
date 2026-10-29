// Le modèle pivot en JSON, dans les deux sens :
// - mode lecture : suit le document en direct (sens éditeur → modèle) ;
// - mode édition : brouillon local, appliqué par la commande
//   `remplacer-document` (sens modèle → éditeur), validée par le noyau.
// Deux présentations (phase 4) : « à plat » (le format interne) ou « imbriquée »
// (le format d'échange). Le brouillon peut être collé dans l'un ou l'autre format.
import { useState } from 'react';
import { depuisImbrique, estFormatImbrique, versImbrique } from '@plateforme/format-imbrique';
import type { Catalogue, DocumentPivot, ErreurModele, NoeudId, ServiceEditeur } from '@plateforme/noyau';
import type { TelechargerFichier } from '../adaptateurs/telechargement';

type Props = {
  document: DocumentPivot;
  service: ServiceEditeur;
  catalogue: Catalogue;
  onSelectionner: (id: NoeudId) => void;
  telechargerUnFichier: TelechargerFichier;
};

type Format = 'plat' | 'imbrique';

type Etat =
  | { mode: 'lecture' }
  | { mode: 'edition'; brouillon: string; erreurSyntaxe: string | null; erreurs: readonly ErreurModele[] };

const FICHIERS: Record<Format, string> = { plat: 'interface.pivot.json', imbrique: 'interface.imbrique.json' };

export function VueModelePivot({ document, service, catalogue, onSelectionner, telechargerUnFichier }: Props) {
  const [etat, setEtat] = useState<Etat>({ mode: 'lecture' });
  const [format, setFormat] = useState<Format>('plat');
  const json = JSON.stringify(format === 'plat' ? document : versImbrique(document), null, 2);

  if (etat.mode === 'lecture') {
    return (
      <div className="modele-pivot">
        <div className="modele-pivot-actions">
          <button type="button" onClick={() => setEtat({ mode: 'edition', brouillon: json, erreurSyntaxe: null, erreurs: [] })}>
            Modifier
          </button>
          <div className="choix-format" role="group" aria-label="Présentation du JSON">
            {(['plat', 'imbrique'] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={format === f}
                title={f === 'plat' ? 'Format interne : un annuaire identifiant → nœud' : 'Format d’échange : chaque nœud contient ses enfants'}
                onClick={() => setFormat(f)}
              >
                {f === 'plat' ? 'À plat' : 'Imbriqué'}
              </button>
            ))}
          </div>
          <button
            type="button"
            title={`Télécharger ${FICHIERS[format]}`}
            aria-label={`Télécharger ${FICHIERS[format]}`}
            onClick={() => telechargerUnFichier(FICHIERS[format], `${json}\n`, 'application/json')}>
            ⤓
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
    // Un document imbriqué est d'abord converti (et entièrement validé) ; le noyau revalide ensuite.
    if (estFormatImbrique(valeur)) {
      const conversion = depuisImbrique(valeur, catalogue);
      if (!conversion.succes) {
        setEtat({ mode: 'edition', brouillon, erreurSyntaxe: null, erreurs: conversion.erreurs });
        return;
      }
      valeur = conversion.document;
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
