import { describe, it, expect } from 'vitest';
import { Catalogue, composantsDeBase, validerDocument } from '@plateforme/noyau';
import { cibleAjout, documentExemple, documentVide, indexerCatalogue, resume } from './outils-editeur';

const index = indexerCatalogue(composantsDeBase);

describe('cibleAjout', () => {
  it('sans sélection : à la fin de la racine', () => {
    expect(cibleAjout(documentExemple, null, index)).toEqual({ parentId: 'racine' });
  });
  it('sélection qui accepte des enfants : dedans', () => {
    expect(cibleAjout(documentExemple, 'c1', index)).toEqual({ parentId: 'c1' });
  });
  it('sélection qui n’accepte pas d’enfants : juste après elle, dans son parent', () => {
    expect(cibleAjout(documentExemple, 'b1', index)).toEqual({ parentId: 'c1', position: 1 });
  });
  it('sélection disparue : racine', () => {
    expect(cibleAjout(documentExemple, 'disparu', index)).toEqual({ parentId: 'racine' });
  });
});

describe('resume', () => {
  it('affiche la première propriété texte', () => {
    expect(resume(documentExemple.noeuds['b1']!, index)).toBe('Valider');
  });
  it('rien pour un composant sans propriété texte', () => {
    expect(resume(documentExemple.noeuds['c1']!, index)).toBe('');
  });
  it('tronque les textes longs', () => {
    const noeud = { ...documentExemple.noeuds['t1']!, proprietes: { contenu: 'x'.repeat(50) } };
    expect(resume(noeud, index, 10)).toBe('xxxxxxxxx…');
  });
});

describe('documents fournis par l’éditeur', () => {
  const catalogue = new Catalogue(composantsDeBase);
  it('le document exemple est valide', () => {
    expect(validerDocument(documentExemple, catalogue)).toEqual([]);
  });
  it('le document vide est valide', () => {
    expect(validerDocument(documentVide(index, 'r'), catalogue)).toEqual([]);
  });
});
