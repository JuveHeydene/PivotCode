import { describe, it, expect } from 'vitest';
import { Catalogue, composantsDeBase, validerDocument } from '@plateforme/noyau';
import type { DocumentPivot } from '@plateforme/noyau';
import { aUneRegle, arbreWeb, decrireNoeud, documentDemonstration as documentDemo, ErreurRendu, nomDePaquet, PALETTE, styleEnLigne, versNomCss } from '../src/index';

const catalogue = new Catalogue(composantsDeBase);

describe('complétude des règles', () => {
  it('chaque composant du catalogue a une règle de rendu web', () => {
    const sansRegle = catalogue.lister().filter((d) => !aUneRegle(d.nom)).map((d) => d.nom);
    expect(sansRegle).toEqual([]);
  });

  it('chaque couleur du catalogue existe dans la palette', () => {
    for (const definition of catalogue.lister()) {
      for (const p of definition.proprietes) {
        if (p.type === 'choix' && (p.nom === 'couleur' || p.nom === 'fond')) {
          for (const c of p.choix) if (c !== 'aucun') expect(PALETTE).toHaveProperty(c);
        }
      }
    }
  });
});

describe('decrireNoeud', () => {
  it('le document de démonstration est valide', () => {
    expect(validerDocument(documentDemo, catalogue)).toEqual([]);
  });

  it('Texte → <p> avec taille, gras, couleur et alignement', () => {
    expect(decrireNoeud(documentDemo.noeuds['titre']!, catalogue)).toEqual({
      balise: 'p',
      texte: 'Créer un compte',
      style: { margin: '0px', fontSize: '1.6rem', fontWeight: '700', color: '#2f6fde', textAlign: 'center' },
    });
  });

  it('Bouton secondaire → fond blanc, texte et bordure de la couleur', () => {
    const e = decrireNoeud(documentDemo.noeuds['annuler']!, catalogue)!;
    expect(e.balise).toBe('button');
    expect(e.style).toMatchObject({ color: '#1d2129', backgroundColor: '#ffffff', border: '1px solid #1d2129' });
  });

  it('Bouton désactivé → indiqué, atténué, curseur interdit', () => {
    const e = decrireNoeud(documentDemo.noeuds['bloque']!, catalogue)!;
    expect(e.desactive).toBe(true);
    expect(e.style).toMatchObject({ opacity: '0.45', cursor: 'not-allowed' });
  });

  it('Conteneur → flex, alignement, justification, fond, bordure, arrondi', () => {
    expect(decrireNoeud(documentDemo.noeuds['page']!, catalogue)!.style).toEqual({
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      padding: '24px',
      margin: '0px',
      backgroundColor: '#f4f5f7',
      border: '1px solid #d8dce3',
      borderRadius: '12px',
    });
  });

  it('une propriété absente prend la valeur par défaut du CATALOGUE (documents de la phase 1)', () => {
    const ancien = { id: 'b', composant: 'Bouton', proprietes: { libelle: 'OK' }, parentId: 'r', enfants: [] };
    expect(decrireNoeud(ancien, catalogue)!.style).toMatchObject({ backgroundColor: '#2f6fde', margin: '0px' });
  });

  it('composant sans règle → null', () => {
    expect(decrireNoeud({ id: 'x', composant: 'Carrousel', proprietes: {}, parentId: null, enfants: [] }, catalogue)).toBeNull();
  });
});

describe('arbreWeb', () => {
  it('respecte la structure et l’ordre des enfants', () => {
    const arbre = arbreWeb(documentDemo, catalogue, { inconnu: 'erreur' });
    expect(arbre.id).toBe('page');
    expect(arbre.enfants.map((e) => e.id)).toEqual(['titre', 'piege', 'actions']);
    expect(arbre.enfants[2]!.enfants.map((e) => e.texte)).toEqual(['Plus tard', 'Créer mon compte', 'Indisponible']);
  });

  const avecInconnu: DocumentPivot = {
    versionMetamodele: 1,
    racineId: 'r',
    noeuds: {
      r: { id: 'r', composant: 'Conteneur', proprietes: {}, parentId: null, enfants: ['x'] },
      x: { id: 'x', composant: 'Carrousel', proprietes: {}, parentId: 'r', enfants: [] },
    },
  };

  it('mode « erreur » : refuse un composant sans règle (générateurs)', () => {
    expect(() => arbreWeb(avecInconnu, catalogue, { inconnu: 'erreur' })).toThrow(ErreurRendu);
  });

  it('mode « remplacer » : affiche un encadré (canevas)', () => {
    expect(arbreWeb(avecInconnu, catalogue, { inconnu: 'remplacer' }).enfants[0]!.texte).toBe('Composant inconnu : Carrousel');
  });
});

describe('outils CSS', () => {
  it('camelCase → kebab-case', () => {
    expect(versNomCss('backgroundColor')).toBe('background-color');
    expect(versNomCss('gap')).toBe('gap');
  });

  it('style en ligne', () => {
    expect(styleEnLigne({ fontSize: '1rem', color: 'red' })).toBe('font-size: 1rem; color: red');
  });
});

describe('nomDePaquet', () => {
  it.each([
    ['Application générée', 'application-generee'],
    ['  Mon Appli !! ', 'mon-appli'],
    ['***', 'application-generee'],
  ])('%s → %s', (nom, attendu) => {
    expect(nomDePaquet(nom)).toBe(attendu);
  });
});
