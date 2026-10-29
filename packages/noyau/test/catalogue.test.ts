import { describe, it, expect } from 'vitest';
import { Catalogue, composantsDeBase } from '../src/index';

describe('Catalogue', () => {
  const catalogue = new Catalogue(composantsDeBase);

  it('trouve un composant par son nom', () => {
    expect(catalogue.trouver('Bouton')?.accepteEnfants).toBe(false);
    expect(catalogue.trouver('Conteneur')?.accepteEnfants).toBe(true);
  });

  it('renvoie undefined pour un composant inconnu, y compris un nom hérité de Object', () => {
    expect(catalogue.trouver('Inconnu')).toBeUndefined();
    expect(catalogue.trouver('toString')).toBeUndefined();
  });

  it('liste les composants dans l’ordre de déclaration', () => {
    expect(catalogue.lister().map((d) => d.nom)).toEqual(['Texte', 'Bouton', 'Conteneur']);
  });

  it('trouve une propriété d’un composant', () => {
    expect(catalogue.trouverPropriete('Bouton', 'libelle')?.type).toBe('texte');
    expect(catalogue.trouverPropriete('Bouton', 'inexistante')).toBeUndefined();
  });

  it('refuse un composant défini deux fois', () => {
    expect(() => new Catalogue([composantsDeBase[0]!, composantsDeBase[0]!])).toThrow(/deux fois/);
  });

  it('refuse une valeur par défaut hors des choix', () => {
    expect(
      () =>
        new Catalogue([
          {
            nom: 'X',
            libelle: 'X',
            accepteEnfants: false,
            proprietes: [{ nom: 'p', libelle: 'p', type: 'choix', choix: ['a'], defaut: 'b', obligatoire: false }],
          },
        ]),
    ).toThrow(/valeur par défaut/);
  });
});
