// Adaptateurs de TEST pour les ports sortants (patron « doublure de test »).
import type { DepotDocument, DocumentPivot, GenerateurIdentifiants, NoeudId } from '../src/index';

/** Identifiants prévisibles : n1, n2, n3… */
export class GenerateurSequentiel implements GenerateurIdentifiants {
  #compteur = 0;
  nouveau(): NoeudId {
    this.#compteur += 1;
    return `n${this.#compteur}`;
  }
}

/** Stockage en mémoire qui compte les enregistrements. */
export class DepotMemoire implements DepotDocument {
  contenu: unknown;
  nombreEnregistrements = 0;

  constructor(contenu: unknown = null) {
    this.contenu = contenu;
  }

  charger(): unknown {
    return this.contenu;
  }

  enregistrer(document: DocumentPivot): void {
    this.contenu = document;
    this.nombreEnregistrements += 1;
  }
}

/** Version modifiable d'un type `readonly`, pour fabriquer des documents faux dans les tests. */
export type Modifiable<T> = { -readonly [K in keyof T]: Modifiable<T[K]> };

/**
 * Copie profonde. `structuredClone` n'existe pas ici : le noyau est compilé
 * sans les types du navigateur ni de Node (décision D5). Un document pivot
 * est du JSON pur, donc l'aller-retour JSON est une copie exacte.
 */
export function copieProfonde<T>(valeur: T): T {
  return JSON.parse(JSON.stringify(valeur)) as T;
}

export function copieModifiable(document: DocumentPivot): Modifiable<DocumentPivot> {
  return copieProfonde(document) as Modifiable<DocumentPivot>;
}
