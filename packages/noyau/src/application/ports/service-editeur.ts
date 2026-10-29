import type { Commande, Evenement } from '../../domaine/commandes';
import type { DefinitionComposant } from '../../domaine/composant';
import type { ErreurModele } from '../../domaine/erreur';
import type { DocumentPivot } from '../../domaine/noeud';

export type ResultatExecution =
  | { readonly succes: true; readonly evenements: readonly Evenement[] }
  | { readonly succes: false; readonly erreurs: readonly ErreurModele[] };

export type Ecouteur = (evenements: readonly Evenement[]) => void;

/**
 * Port entrant : tout ce que le monde extérieur (l'éditeur React aujourd'hui,
 * une API HTTP demain) peut demander au cœur. Défini par le cœur (décision D6).
 */
export interface ServiceEditeur {
  /** Toujours le même objet tant qu'aucune commande n'a modifié le document. */
  lireDocument(): DocumentPivot;
  lireCatalogue(): readonly DefinitionComposant[];
  executer(commande: Commande): ResultatExecution;
  /** Renvoie la fonction de désabonnement. */
  abonner(ecouteur: Ecouteur): () => void;
  annuler(): ResultatExecution;
  retablir(): ResultatExecution;
  peutAnnuler(): boolean;
  peutRetablir(): boolean;
}
