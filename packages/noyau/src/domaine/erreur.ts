import type { NoeudId } from './noeud';

export type CodeErreur =
  // Validation d'un document (règles R1 à R8)
  | 'FORME_INVALIDE'
  | 'NOEUD_MAL_FORME'
  | 'RACINE_INVALIDE'
  | 'COMPOSANT_INCONNU'
  | 'PROPRIETE_MANQUANTE'
  | 'PROPRIETE_INCONNUE'
  | 'PROPRIETE_TYPE_INVALIDE'
  | 'PROPRIETE_CHOIX_INVALIDE'
  | 'ENFANTS_INTERDITS'
  | 'LIEN_INCOHERENT'
  | 'NOEUD_ORPHELIN'
  | 'CYCLE_OU_PARTAGE'
  // Commandes
  | 'NOEUD_INTROUVABLE'
  | 'SUPPRESSION_RACINE'
  | 'IDENTIFIANT_DEJA_UTILISE'
  | 'HISTORIQUE_VIDE';

export type ErreurModele = {
  readonly code: CodeErreur;
  /** Message lisible, en français, affichable tel quel. */
  readonly message: string;
  readonly noeudId?: NoeudId;
};

export function erreur(code: CodeErreur, message: string, noeudId?: NoeudId): ErreurModele {
  return noeudId === undefined ? { code, message } : { code, message, noeudId };
}
