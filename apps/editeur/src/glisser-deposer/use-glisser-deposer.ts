// Le glisser-déposer branché sur les événements HTML5 du navigateur (dragstart,
// dragover, drop…). Les décisions sont prises par les fonctions pures de
// regles-depot.ts ; ce hook ne fait que lire la souris et envoyer la commande.
import { useState } from 'react';
import type { DragEvent } from 'react';
import type { Commande, DocumentPivot, NoeudId, ResultatExecution } from '@plateforme/noyau';
import type { IndexCatalogue } from '../outils-editeur';
import { axeDesEnfants, cibleDepot, depotPermis, zoneDepot } from './regles-depot';
import type { Axe, Glisse, Zone } from './regles-depot';
import { trouverNoeud } from '@plateforme/noyau';

/** Où l'on se trouve dans l'interface : l'arbre est toujours vertical. */
export type Contexte = 'canevas' | 'arbre';

/** Ce qu'un composant (canevas, arbre, palette) reçoit pour participer au glisser-déposer. */
export type GestionGlisser = {
  debuter: (glisse: Glisse, e: DragEvent) => void;
  survoler: (id: NoeudId, contexte: Contexte, e: DragEvent) => void;
  quitter: (id: NoeudId) => void;
  deposer: (id: NoeudId, contexte: Contexte, e: DragEvent) => void;
  terminer: () => void;
  /** Classe CSS d'indication pour cet élément (ligne avant / après, fond dedans), ou undefined. */
  indication: (id: NoeudId, contexte: Contexte) => string | undefined;
  enCours: boolean;
};

type Survol = { id: NoeudId; contexte: Contexte; zone: Zone; axe: Axe };

export function useGlisserDeposer(
  document: DocumentPivot,
  index: IndexCatalogue,
  executer: (commande: Commande) => ResultatExecution,
  selectionner: (id: NoeudId) => void,
): GestionGlisser {
  const [glisse, setGlisse] = useState<Glisse | null>(null);
  const [survol, setSurvol] = useState<Survol | null>(null);

  function calculer(id: NoeudId, contexte: Contexte, e: DragEvent) {
    if (glisse === null) return null;
    const noeud = trouverNoeud(document, id);
    if (noeud === undefined) return null;
    const axe: Axe = contexte === 'arbre' ? 'vertical' : axeDesEnfants(document, noeud.parentId);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const zone = zoneDepot(rect, { x: e.clientX, y: e.clientY }, axe, index.get(noeud.composant)?.accepteEnfants ?? false);
    const cible = cibleDepot(document, id, zone, glisse.type === 'deplacer' ? glisse.id : undefined);
    if (cible === null || !depotPermis(document, index, glisse, cible.parentId)) return null;
    return { ...cible, axe };
  }

  function terminer() {
    setGlisse(null);
    setSurvol(null);
  }

  return {
    enCours: glisse !== null,
    debuter(nouveau, e) {
      e.stopPropagation(); // dans le canevas, seul l'élément le plus profond démarre le glissement
      // Firefox exige des données pour démarrer un glissement. On ne les relit pas :
      // pendant le survol, le navigateur les cache (mode protégé), d'où l'état React `glisse`.
      e.dataTransfer?.setData('text/plain', nouveau.type === 'nouveau' ? nouveau.composant : nouveau.id);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = nouveau.type === 'nouveau' ? 'copy' : 'move';
      setGlisse(nouveau);
    },
    survoler(id, contexte, e) {
      e.stopPropagation();
      const resultat = calculer(id, contexte, e);
      if (resultat === null) {
        if (survol?.id === id) setSurvol(null);
        return; // pas de preventDefault : le navigateur affiche « dépôt interdit »
      }
      e.preventDefault(); // autorise le dépôt
      if (e.dataTransfer) e.dataTransfer.dropEffect = glisse?.type === 'nouveau' ? 'copy' : 'move';
      if (survol?.id !== id || survol.zone !== resultat.zone || survol.contexte !== contexte) {
        setSurvol({ id, contexte, zone: resultat.zone, axe: resultat.axe });
      }
    },
    quitter(id) {
      if (survol?.id === id) setSurvol(null);
    },
    deposer(id, contexte, e) {
      e.preventDefault();
      e.stopPropagation();
      const resultat = calculer(id, contexte, e);
      const g = glisse;
      terminer();
      if (resultat === null || g === null) return;
      if (g.type === 'nouveau') {
        const r = executer({ type: 'ajouter-noeud', parentId: resultat.parentId, composant: g.composant, position: resultat.position });
        const ajout = r.succes ? r.evenements.find((ev) => ev.type === 'noeud-ajoute') : undefined;
        if (ajout !== undefined) selectionner(ajout.id);
      } else {
        const r = executer({ type: 'deplacer-noeud', id: g.id, nouveauParentId: resultat.parentId, position: resultat.position });
        if (r.succes) selectionner(g.id);
      }
    },
    terminer,
    indication(id, contexte) {
      if (survol === null || survol.id !== id || survol.contexte !== contexte) return undefined;
      return survol.zone === 'dedans' ? 'depot-dedans' : `depot-${survol.zone}-${survol.axe === 'vertical' ? 'v' : 'h'}`;
    },
  };
}
