import type { DocumentPivot } from '../../domaine/noeud';

/** Port sortant : conserver le document entre deux sessions. */
export interface DepotDocument {
  /**
   * Renvoie ce qui a été enregistré, ou `null` si rien ne l'a été.
   * Type `unknown` : le contenu a pu être modifié ou corrompu (décision D9).
   */
  charger(): unknown;
  enregistrer(document: DocumentPivot): void;
}
