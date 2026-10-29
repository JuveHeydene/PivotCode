import type { DepotDocument, DocumentPivot } from '@plateforme/noyau';

/** Adaptateur sortant : conserve le document dans le localStorage du navigateur. */
export class DepotLocalStorage implements DepotDocument {
  readonly #cle: string;
  readonly #stockage: Storage;

  constructor(cle: string, stockage: Storage = localStorage) {
    this.#cle = cle;
    this.#stockage = stockage;
  }

  charger(): unknown {
    try {
      const texte = this.#stockage.getItem(this.#cle);
      return texte === null ? null : (JSON.parse(texte) as unknown);
    } catch {
      // Stockage bloqué (navigation privée stricte) ou JSON corrompu :
      // on fait comme si rien n'était enregistré, le service repartira de zéro.
      return null;
    }
  }

  enregistrer(document: DocumentPivot): void {
    try {
      this.#stockage.setItem(this.#cle, JSON.stringify(document));
    } catch (e) {
      // Quota dépassé ou stockage bloqué : l'édition continue, seule la
      // persistance est perdue. On le signale dans la console.
      console.error('Impossible d’enregistrer le document :', e);
    }
  }
}
