import { describe, it, expect } from 'vitest';
import { composantsDeBase } from '@plateforme/noyau';
import { documentExemple, indexerCatalogue } from '../outils-editeur';
import { axeDesEnfants, cibleDepot, depotPermis, zoneDepot } from './regles-depot';

const index = indexerCatalogue(composantsDeBase);
const rect = { left: 0, top: 0, width: 200, height: 100 };

describe('zoneDepot', () => {
  it.each([
    [10, true, 'avant'],
    [50, true, 'dedans'],
    [90, true, 'apres'],
    [40, false, 'avant'],
    [60, false, 'apres'],
  ] as const)('vertical, y = %d, conteneur = %s → %s', (y, conteneur, attendu) => {
    expect(zoneDepot(rect, { x: 100, y }, 'vertical', conteneur)).toBe(attendu);
  });

  it('horizontal : c’est x qui compte', () => {
    expect(zoneDepot(rect, { x: 20, y: 99 }, 'horizontal', false)).toBe('avant');
    expect(zoneDepot(rect, { x: 180, y: 1 }, 'horizontal', false)).toBe('apres');
  });

  it('élément sans taille : considéré au milieu', () => {
    const vide = { left: 0, top: 0, width: 0, height: 0 };
    expect(zoneDepot(vide, { x: 0, y: 0 }, 'vertical', true)).toBe('dedans');
  });
});

describe('axeDesEnfants', () => {
  it('conteneur en ligne → horizontal, en colonne → vertical', () => {
    expect(axeDesEnfants(documentExemple, 'c1')).toBe('horizontal');
    expect(axeDesEnfants(documentExemple, 'racine')).toBe('vertical');
  });
});

describe('cibleDepot', () => {
  // racine [t1, c1] ; c1 [b1, b2]
  it('dedans un conteneur : à la fin', () => {
    expect(cibleDepot(documentExemple, 'c1', 'dedans')).toEqual({ parentId: 'c1', position: 2, zone: 'dedans' });
  });

  it('avant / après un élément : dans son parent', () => {
    expect(cibleDepot(documentExemple, 'b2', 'avant')).toEqual({ parentId: 'c1', position: 1, zone: 'avant' });
    expect(cibleDepot(documentExemple, 't1', 'apres')).toEqual({ parentId: 'racine', position: 1, zone: 'apres' });
  });

  it('les positions sont comptées SANS l’élément déplacé', () => {
    // b1 glissé après b2 : sans b1, c1 = [b2], donc « après b2 » = position 1
    expect(cibleDepot(documentExemple, 'b2', 'apres', 'b1')).toEqual({ parentId: 'c1', position: 1, zone: 'apres' });
  });

  it('avant / après la racine n’a pas de sens : dedans', () => {
    expect(cibleDepot(documentExemple, 'racine', 'avant')?.zone).toBe('dedans');
  });

  it('survoler l’élément déplacé lui-même : aucune cible', () => {
    expect(cibleDepot(documentExemple, 'b1', 'avant', 'b1')).toBeNull();
  });
});

describe('depotPermis', () => {
  it('dans un conteneur : oui ; dans un bouton : non', () => {
    expect(depotPermis(documentExemple, index, { type: 'nouveau', composant: 'Texte' }, 'c1')).toBe(true);
    expect(depotPermis(documentExemple, index, { type: 'nouveau', composant: 'Texte' }, 'b1')).toBe(false);
  });

  it('un conteneur ne peut pas être déposé dans lui-même (cycle)', () => {
    expect(depotPermis(documentExemple, index, { type: 'deplacer', id: 'c1' }, 'c1')).toBe(false);
    expect(depotPermis(documentExemple, index, { type: 'deplacer', id: 'c1' }, 'racine')).toBe(true);
  });
});
