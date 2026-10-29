import { Catalogue, EditeurApplicatif, composantsDeBase } from '@plateforme/noyau';
import type { DepotDocument, DocumentPivot } from '@plateforme/noyau';

export const catalogue = new Catalogue(composantsDeBase);

export function copie<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

/** Un service neuf, sur une copie du document donné, avec des identifiants n1, n2… */
export function serviceSur(depart: DocumentPivot): EditeurApplicatif {
  let n = 0;
  let contenu: unknown = copie(depart);
  const depot: DepotDocument = { charger: () => contenu, enregistrer: (d) => { contenu = d; } };
  return new EditeurApplicatif(catalogue, { nouveau: () => `x${++n}` }, depot);
}
