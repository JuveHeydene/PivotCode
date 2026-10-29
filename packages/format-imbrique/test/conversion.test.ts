import { describe, it, expect } from 'vitest';
import { documentDemonstration } from '@plateforme/rendu-web';
import type { DocumentPivot } from '@plateforme/noyau';
import { depuisImbrique, estFormatImbrique, versImbrique, FORMAT_IMBRIQUE } from '../src/index';
import { catalogue, copie } from './outils';

/** Raccourci : importe et renvoie les codes d'erreur (ou [] si succès). */
const codes = (x: unknown): string[] => {
  const r = depuisImbrique(x, catalogue);
  return r.succes ? [] : r.erreurs.map((e) => e.code);
};
const doc = (racine: unknown) => ({ format: FORMAT_IMBRIQUE, versionMetamodele: 1, racine });

describe('à plat → imbriqué', () => {
  it('chaque conteneur contient ses enfants, dans l’ordre', () => {
    const imbrique = versImbrique(documentDemonstration);
    expect(imbrique.format).toBe('pivot-imbrique');
    expect(imbrique.racine.id).toBe(documentDemonstration.racineId);
    const racine = documentDemonstration.noeuds[documentDemonstration.racineId]!;
    expect(imbrique.racine.enfants?.map((e) => e.id)).toEqual(racine.enfants);
  });

  it('les feuilles n’ont pas de champ enfants, ni de parentId', () => {
    const texte = JSON.stringify(versImbrique(documentDemonstration));
    expect(texte).not.toContain('parentId');
    expect(texte).not.toContain('"enfants":[]');
  });

  it('{ ids: false } produit un arbre pur, sans aucun identifiant', () => {
    expect(JSON.stringify(versImbrique(documentDemonstration, { ids: false }))).not.toContain('"id"');
  });

  it('ne modifie pas le document d’origine', () => {
    const avant = copie(documentDemonstration);
    versImbrique(documentDemonstration);
    expect(documentDemonstration).toEqual(avant);
  });
});

describe('imbriqué → à plat', () => {
  it('aller-retour exact avec les identifiants', () => {
    const r = depuisImbrique(copie(versImbrique(documentDemonstration)), catalogue);
    expect(r).toEqual({ succes: true, document: documentDemonstration });
  });

  it('sans identifiants : n1, n2… dans l’ordre de lecture, sans collision avec ceux fournis', () => {
    const r = depuisImbrique(
      doc({ composant: 'Conteneur', proprietes: {}, enfants: [
        { composant: 'Texte', proprietes: { contenu: 'a' } },
        { id: 'n2', composant: 'Texte', proprietes: { contenu: 'b' } },
        { composant: 'Bouton', proprietes: { libelle: 'OK' } },
      ] }),
      catalogue,
    );
    expect(r.succes).toBe(true);
    const d = (r as { document: DocumentPivot }).document;
    expect(d.racineId).toBe('n1');
    expect(d.noeuds['n1']!.enfants).toEqual(['n3', 'n2', 'n4']);
    expect(d.noeuds['n4']).toMatchObject({ composant: 'Bouton', parentId: 'n1', enfants: [] });
  });

  it('tolérant : proprietes et enfants absents, champs inconnus ignorés', () => {
    const r = depuisImbrique(doc({ composant: 'Conteneur', commentaire: 'ignoré', enfants: [{ composant: 'Texte', proprietes: { contenu: 'a' }, enfants: [] }] }), catalogue);
    expect(r.succes).toBe(true);
    expect(JSON.stringify(r)).not.toContain('commentaire');
  });

  it('une clé « __proto__ » devient un vrai nœud, sans toucher aux prototypes', () => {
    const r = depuisImbrique(JSON.parse('{"format":"pivot-imbrique","versionMetamodele":1,"racine":{"id":"__proto__","composant":"Conteneur","proprietes":{}}}'), catalogue);
    expect(r.succes).toBe(true);
    expect(Object.hasOwn((r as { document: DocumentPivot }).document.noeuds, '__proto__')).toBe(true);
  });
});

describe('imbriqué → à plat : refus', () => {
  it.each([null, 42, [], {}, documentDemonstration, { ...doc({ composant: 'Conteneur' }), versionMetamodele: 2 }])('forme générale invalide : %j', (x) => {
    expect(codes(x)).toEqual(['FORME_INVALIDE']);
  });

  it('nœud mal formé, avec son chemin dans le message', () => {
    const r = depuisImbrique(doc({ composant: 'Conteneur', enfants: [{ composant: 'Texte' }, { composant: 7 }] }), catalogue);
    expect(r).toMatchObject({ succes: false, erreurs: [{ code: 'NOEUD_MAL_FORME' }] });
    expect(!r.succes && r.erreurs[0]!.message).toContain('racine.enfants[1]');
  });

  it('identifiant utilisé deux fois : la seule règle globale qui reste', () => {
    const r = depuisImbrique(doc({ id: 'a', composant: 'Conteneur', enfants: [{ id: 'a', composant: 'Texte', proprietes: { contenu: 'x' } }] }), catalogue);
    expect(r).toMatchObject({ succes: false, erreurs: [{ code: 'IDENTIFIANT_DEJA_UTILISE', noeudId: 'a' }] });
  });

  it('le noyau vérifie le catalogue, et le message dit OÙ', () => {
    const r = depuisImbrique(doc({ composant: 'Conteneur', enfants: [{ composant: 'Bouton', proprietes: { libelle: 'OK' }, enfants: [{ composant: 'Texte', proprietes: { contenu: 'x' } }] }] }), catalogue);
    expect(r).toMatchObject({ succes: false, erreurs: [{ code: 'ENFANTS_INTERDITS' }] });
    expect(!r.succes && r.erreurs[0]!.message).toContain('(racine.enfants[0])');
    expect(codes(doc({ composant: 'Carrousel' }))).toEqual(['COMPOSANT_INCONNU']);
  });

  it('l’erreur garde un identifiant FOURNI, mais jamais un identifiant fabriqué', () => {
    const r = depuisImbrique(doc({ composant: 'Conteneur', enfants: [{ id: 'b', composant: 'Bouton', proprietes: {} }, { composant: 'Bouton', proprietes: {} }] }), catalogue);
    expect(!r.succes && r.erreurs.map((e) => [e.code, e.noeudId])).toEqual([
      ['PROPRIETE_MANQUANTE', 'b'],
      ['PROPRIETE_MANQUANTE', undefined],
    ]);
  });

  it('un objet JavaScript partagé (impossible en JSON) est refusé au lieu de boucler', () => {
    const texte = { composant: 'Texte', proprietes: { contenu: 'x' } };
    expect(codes(doc({ composant: 'Conteneur', enfants: [texte, texte] }))).toEqual(['CYCLE_OU_PARTAGE']);
    const boucle: { composant: string; enfants: unknown[] } = { composant: 'Conteneur', enfants: [] };
    boucle.enfants.push(boucle);
    expect(codes(doc(boucle))).toEqual(['CYCLE_OU_PARTAGE']);
  });
});

describe('arbre très profond (50 000 niveaux) : pas de débordement de pile', () => {
  it('dans les deux sens', () => {
    let racine: Record<string, unknown> = { composant: 'Texte', proprietes: { contenu: 'fond' } };
    for (let i = 0; i < 50_000; i++) racine = { composant: 'Conteneur', proprietes: {}, enfants: [racine] };
    const r = depuisImbrique(doc(racine), catalogue);
    expect(r.succes).toBe(true);
    const d = (r as { document: DocumentPivot }).document;
    expect(Object.keys(d.noeuds)).toHaveLength(50_001);
    let n = versImbrique(d).racine;
    let profondeur = 0;
    while (n.enfants !== undefined) { n = n.enfants[0]!; profondeur++; }
    expect(profondeur).toBe(50_000);
  });
});

describe('estFormatImbrique', () => {
  it('reconnaît le champ format', () => {
    expect(estFormatImbrique(versImbrique(documentDemonstration))).toBe(true);
    expect(estFormatImbrique(documentDemonstration)).toBe(false);
    expect(estFormatImbrique(null)).toBe(false);
  });
});
