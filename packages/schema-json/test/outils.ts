import Ajv2020 from 'ajv/dist/2020';
import { Catalogue, composantsDeBase, validerDocument } from '@plateforme/noyau';
import { depuisImbrique } from '@plateforme/format-imbrique';
import { genererSchemaImbrique, genererSchemaJson } from '../src/index';

export const catalogue = new Catalogue(composantsDeBase);
export const schema = genererSchemaJson(catalogue);

// strict : Ajv refuse un schéma qui contiendrait un mot-clé inconnu ou mal placé.
const ajv = new Ajv2020({ strict: true, allErrors: true });
export const validerParSchema = ajv.compile(schema);

export const schemaAccepte = (doc: unknown): boolean => validerParSchema(doc) === true;
// Le schéma du format d'échange imbriqué (phase 4).
export const schemaImbrique = genererSchemaImbrique(catalogue);
export const validerParSchemaImbrique = ajv.compile(schemaImbrique);
export const schemaImbriqueAccepte = (doc: unknown): boolean => validerParSchemaImbrique(doc) === true;
/** Codes d'erreur de l'import imbriqué (qui finit par la validation complète du noyau) ; [] si accepté. */
export const codesImport = (doc: unknown): string[] => {
  const r = depuisImbrique(doc, catalogue);
  return r.succes ? [] : r.erreurs.map((e) => e.code);
};
export const codesNoyau = (doc: unknown): string[] => validerDocument(doc, catalogue).map((e) => e.code);

export function copie<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}
