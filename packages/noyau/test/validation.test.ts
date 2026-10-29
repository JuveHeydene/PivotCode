import { describe, it, expect } from 'vitest';
import { Catalogue, composantsDeBase, validerDocument } from '../src/index';
import type { DocumentPivot } from '../src/index';
import { copieModifiable } from './doublures';
import { documentExemple } from './exemple';

const catalogue = new Catalogue(composantsDeBase);

function documentValide(): DocumentPivot {
  return {
    versionMetamodele: 1,
    racineId: 'racine',
    noeuds: {
      racine: { id: 'racine', composant: 'Conteneur', proprietes: { direction: 'colonne', espacement: 8 }, parentId: null, enfants: ['t1'] },
      t1: { id: 't1', composant: 'Texte', proprietes: { contenu: 'Bienvenue', taille: 'moyen' }, parentId: 'racine', enfants: [] },
    },
  };
}

function codes(candidat: unknown): string[] {
  return validerDocument(candidat, catalogue).map((e) => e.code);
}

describe('validerDocument', () => {
  it('accepte un document valide', () => {
    expect(validerDocument(documentValide(), catalogue)).toEqual([]);
  });

  it('accepte le document écrit à la main à l’étape 2', () => {
    expect(validerDocument(documentExemple, catalogue)).toEqual([]);
  });

  it('accepte un document qui a fait un aller-retour en JSON', () => {
    expect(codes(JSON.parse(JSON.stringify(documentExemple)))).toEqual([]);
  });

  describe('R1 — forme générale', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
      ['une chaîne', 'bonjour'],
      ['un nombre', 42],
      ['un tableau', []],
      ['un objet vide', {}],
    ])('refuse %s sans planter', (_nom, candidat) => {
      expect(codes(candidat)).toEqual(['FORME_INVALIDE']);
    });

    it('refuse une autre version du métamodèle', () => {
      expect(codes({ ...documentValide(), versionMetamodele: 2 })).toEqual(['FORME_INVALIDE']);
    });

    it('refuse noeuds sous forme de tableau', () => {
      expect(codes({ ...documentValide(), noeuds:  [] })).toEqual(['FORME_INVALIDE']);
    });
  });

  describe('R2 — forme des nœuds', () => {
    it('refuse un nœud qui n’est pas un objet', () => {
      const doc = { ...documentValide(), noeuds: { ...documentValide().noeuds, x: 5 } };
      expect(codes(doc)).toEqual(['NOEUD_MAL_FORME']);
    });

    it('refuse des enfants qui ne sont pas des textes', () => {
      const doc = copieModifiable(documentValide()) as unknown as { noeuds: { racine: { enfants: unknown } } };
      doc.noeuds.racine.enfants = [1];
      expect(codes(doc)).toEqual(['NOEUD_MAL_FORME']);
    });

    it('refuse une clé différente de l’id', () => {
      const doc = copieModifiable(documentValide());
      doc.noeuds.t1!.id = 'autre';
      expect(codes(doc)).toEqual(['NOEUD_MAL_FORME']);
    });

    it('s’arrête après R2 : pas d’erreurs en cascade', () => {
      const doc = copieModifiable(documentValide()) as unknown as { noeuds: Record<string, unknown> };
      doc.noeuds['t1'] = 'cassé';
      expect(codes(doc)).toEqual(['NOEUD_MAL_FORME']);
    });
  });

  describe('R3 — racine', () => {
    it('refuse une racine absente', () => {
      expect(codes({ ...documentValide(), racineId: 'absente' })).toContain('RACINE_INVALIDE');
    });

    it('refuse une racine qui a un parent', () => {
      const doc = copieModifiable(documentValide());
      doc.noeuds.racine!.parentId = 't1';
      expect(codes(doc)).toContain('RACINE_INVALIDE');
    });

    it('refuse une racine nommée comme une clé héritée (toString)', () => {
      expect(codes({ ...documentValide(), racineId: 'toString' })).toContain('RACINE_INVALIDE');
    });
  });

  describe('R4 — composant connu', () => {
    it('refuse un composant absent du catalogue', () => {
      const doc = copieModifiable(documentValide());
      doc.noeuds.t1!.composant = 'Carrousel';
      expect(codes(doc)).toEqual(['COMPOSANT_INCONNU']);
    });
  });

  describe('R5 — propriétés', () => {
    it('refuse une propriété obligatoire absente', () => {
      const doc = copieModifiable(documentValide());
      delete doc.noeuds.t1!.proprietes['contenu'];
      expect(codes(doc)).toEqual(['PROPRIETE_MANQUANTE']);
    });

    it('accepte une propriété facultative absente', () => {
      const doc = copieModifiable(documentValide());
      delete doc.noeuds.t1!.proprietes['taille'];
      expect(codes(doc)).toEqual([]);
    });

    it('refuse une valeur du mauvais type', () => {
      const doc = copieModifiable(documentValide());
      doc.noeuds.racine!.proprietes['espacement'] = 'huit';
      expect(codes(doc)).toEqual(['PROPRIETE_TYPE_INVALIDE']);
    });

    it('refuse un choix non permis', () => {
      const doc = copieModifiable(documentValide());
      doc.noeuds.t1!.proprietes['taille'] = 'énorme';
      expect(codes(doc)).toEqual(['PROPRIETE_CHOIX_INVALIDE']);
    });

    it('refuse une propriété inconnue', () => {
      const doc = copieModifiable(documentValide());
      doc.noeuds.t1!.proprietes['couleur'] = 'rouge';
      expect(codes(doc)).toEqual(['PROPRIETE_INCONNUE']);
    });

    it('refuse une valeur qui n’est pas un scalaire', () => {
      const doc = copieModifiable(documentValide()) as unknown as { noeuds: { t1: { proprietes: Record<string, unknown> } } };
      doc.noeuds.t1.proprietes['contenu'] = { texte: 'x' };
      expect(codes(doc)).toEqual(['PROPRIETE_TYPE_INVALIDE']);
    });
  });

  describe('R6 — enfants interdits', () => {
    it('refuse un Texte qui a des enfants', () => {
      const doc = copieModifiable(documentValide());
      doc.noeuds.t1!.enfants = ['racine'];
      expect(codes(doc)).toContain('ENFANTS_INTERDITS');
    });
  });

  describe('R7 — liens parent ↔ enfant', () => {
    it('refuse un enfant inexistant', () => {
      const doc = copieModifiable(documentValide());
      doc.noeuds.racine!.enfants.push('fantome');
      expect(codes(doc)).toEqual(['LIEN_INCOHERENT']);
    });

    it('refuse un enfant dont le parentId désigne un autre nœud', () => {
      const doc = copieModifiable(documentExemple);
      doc.noeuds.b1!.parentId = 'racine';
      expect(codes(doc)).toContain('LIEN_INCOHERENT');
    });
  });

  describe('R8 — chaque nœud atteint exactement une fois', () => {
    it('signale un nœud orphelin', () => {
      const doc = copieModifiable(documentValide());
      doc.noeuds.racine!.enfants = [];
      expect(codes(doc)).toEqual(['NOEUD_ORPHELIN']);
    });

    it('signale un nœud listé deux fois par le même parent', () => {
      const doc = copieModifiable(documentValide());
      doc.noeuds.racine!.enfants = ['t1', 't1'];
      expect(codes(doc)).toEqual(['CYCLE_OU_PARTAGE']);
    });

    it('signale un nœud partagé entre deux parents', () => {
      const doc = copieModifiable(documentExemple);
      doc.noeuds.racine!.enfants.push('b1');
      expect(codes(doc)).toEqual(expect.arrayContaining(['LIEN_INCOHERENT', 'CYCLE_OU_PARTAGE']));
    });

    it('détecte un cycle sans boucler à l’infini', () => {
      const doc = copieModifiable(documentExemple);
      doc.noeuds.c1!.enfants.push('racine');
      const resultat = codes(doc);
      expect(resultat).toContain('CYCLE_OU_PARTAGE');
      expect(resultat).toContain('LIEN_INCOHERENT');
    });

    it('valide un arbre très profond sans débordement de pile', () => {
      const noeuds: Record<string, unknown> = {};
      const profondeur = 50_000;
      for (let i = 0; i < profondeur; i++) {
        noeuds[`c${i}`] = {
          id: `c${i}`,
          composant: 'Conteneur',
          proprietes: {},
          parentId: i === 0 ? null : `c${i - 1}`,
          enfants: i === profondeur - 1 ? [] : [`c${i + 1}`],
        };
      }
      expect(codes({ versionMetamodele: 1, racineId: 'c0', noeuds })).toEqual([]);
    });
  });

  it('renvoie TOUTES les erreurs, pas seulement la première', () => {
    const doc = copieModifiable(documentExemple);
    doc.noeuds.t1!.proprietes['taille'] = 'énorme';
    doc.noeuds.b1!.composant = 'Inconnu';
    doc.noeuds.b2!.enfants = ['t1'];
    const resultat = codes(doc);
    expect(resultat).toContain('PROPRIETE_CHOIX_INVALIDE');
    expect(resultat).toContain('COMPOSANT_INCONNU');
    expect(resultat).toContain('ENFANTS_INTERDITS');
  });

  it('garde une clé "__proto__" comme une clé ordinaire (JSON.parse)', () => {
    const json = '{"versionMetamodele":1,"racineId":"r","noeuds":{"r":{"id":"r","composant":"Conteneur","proprietes":{"__proto__":1},"parentId":null,"enfants":[]}}}';
    expect(codes(JSON.parse(json))).toEqual(['PROPRIETE_INCONNUE']);
  });
});
