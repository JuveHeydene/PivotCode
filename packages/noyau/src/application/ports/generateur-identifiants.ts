import type { NoeudId } from '../../domaine/noeud';

/** Port sortant : fabriquer des identifiants uniques (UUID, séquence de test…). */
export interface GenerateurIdentifiants {
  nouveau(): NoeudId;
}
