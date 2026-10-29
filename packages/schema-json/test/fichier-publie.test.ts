// Les schémas sont PUBLIÉS dans des fichiers versionnés (schema/*.v1.schema.json).
// Ce test échoue si un fichier n'est plus à jour avec le catalogue.
// Pour le régénérer : pnpm --filter @plateforme/schema-json ecrire
import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { schema, schemaImbrique } from './outils';

describe('fichiers publiés', () => {
  it.each([
    ['document-pivot.v1.schema.json', schema],
    ['document-imbrique.v1.schema.json', schemaImbrique],
  ])('%s est à jour avec le catalogue', (nom, contenu) => {
    const fichier = new URL(`../schema/${nom}`, import.meta.url);
    const texte = `${JSON.stringify(contenu, null, 2)}\n`;
    if (process.env['ECRIRE_SCHEMA'] === '1') writeFileSync(fichier, texte);
    expect(readFileSync(fichier, 'utf8')).toBe(texte);
  });
});
