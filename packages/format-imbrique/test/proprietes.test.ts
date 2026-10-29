// TESTS PAR PROPRIÉTÉS : sur des documents produits au hasard par le VRAI service.
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { documentDemonstration } from '@plateforme/rendu-web';
import type { DocumentPivot, ValeurPropriete } from '@plateforme/noyau';
import { depuisImbrique, versImbrique } from '../src/index';
import { catalogue, copie, serviceSur } from './outils';

const commande = fc.oneof(
  { weight: 6, arbitrary: fc.record({ k: fc.constant('ajouter' as const), parent: fc.nat(), composant: fc.constantFrom('Texte', 'Bouton', 'Conteneur', 'Conteneur') }) },
  { weight: 3, arbitrary: fc.record({ k: fc.constant('deplacer' as const), cible: fc.nat(), parent: fc.nat(), position: fc.integer({ min: -1, max: 5 }) }) },
  { weight: 1, arbitrary: fc.record({ k: fc.constant('supprimer' as const), cible: fc.nat() }) },
);

/** Un document valide quelconque : la démonstration transformée par une suite de commandes. */
const documentAuHasard = fc.array(commande, { minLength: 5, maxLength: 60, size: 'max' }).map((suite): DocumentPivot => {
  const service = serviceSur(documentDemonstration);
  for (const c of suite) {
    const ids = Object.keys(service.lireDocument().noeuds);
    const choisir = (i: number) => ids[i % ids.length]!;
    if (c.k === 'ajouter') service.executer({ type: 'ajouter-noeud', parentId: choisir(c.parent), composant: c.composant });
    else if (c.k === 'deplacer') service.executer({ type: 'deplacer-noeud', id: choisir(c.cible), nouveauParentId: choisir(c.parent), position: c.position });
    else service.executer({ type: 'supprimer-noeud', id: choisir(c.cible) });
  }
  return service.lireDocument();
});

describe('aller-retour à plat → imbriqué → à plat', () => {
  it('avec identifiants : on retrouve EXACTEMENT le même document (passage par du texte JSON compris)', () => {
    fc.assert(
      fc.property(documentAuHasard, (d) => {
        expect(depuisImbrique(copie(versImbrique(d)), catalogue)).toEqual({ succes: true, document: d });
      }),
      { numRuns: 300 },
    );
  });

  it('sans identifiants : même arbre (mêmes composants, propriétés et ordre), identifiants renommés', () => {
    fc.assert(
      fc.property(documentAuHasard, (d) => {
        const arbre = versImbrique(d, { ids: false });
        const r = depuisImbrique(copie(arbre), catalogue);
        expect(r.succes).toBe(true);
        if (r.succes) expect(versImbrique(r.document, { ids: false })).toEqual(arbre);
      }),
      { numRuns: 300 },
    );
  });
});

describe('robustesse', () => {
  it('ne lève jamais d’exception, quelle que soit l’entrée', () => {
    // Surtout des nœuds PRESQUE valides (propriétés obligatoires présentes), pour aller
    // jusqu'au bout de l'import ; parfois des propriétés ou des valeurs quelconques.
    const valides: Record<string, Record<string, ValeurPropriete>> = { Texte: { contenu: 'x' }, Bouton: { libelle: 'OK' } };
    const noeud = fc.letrec((tie) => ({
      noeud: fc.oneof(
        { depthSize: 'small', withCrossShrink: true },
        { weight: 1, arbitrary: fc.anything() },
        {
          weight: 15,
          arbitrary: fc
            .record({
              id: fc.option(fc.constantFrom('a', 'b', 'n1', 'n2'), { nil: undefined, freq: 2 }),
              composant: fc.constantFrom('Texte', 'Bouton', 'Conteneur', 'Conteneur', 'Conteneur', 'X'),
              autres: fc.oneof(
                { weight: 4, arbitrary: fc.constant(undefined) },
                { weight: 1, arbitrary: fc.dictionary(fc.constantFrom('contenu', 'libelle', 'marge', 'z'), fc.oneof(fc.string(), fc.integer(), fc.boolean())) },
              ),
              enfants: fc.option(fc.array(tie('noeud'), { maxLength: 3 }), { nil: undefined, freq: 3 }),
            })
            .map(({ autres, composant, ...reste }) => ({ ...reste, composant, proprietes: autres ?? valides[composant] ?? {} })),
        },
      ),
    })).noeud;
    fc.assert(
      fc.property(fc.oneof({ weight: 1, arbitrary: fc.anything() }, { weight: 4, arbitrary: noeud.map((racine) => ({ format: 'pivot-imbrique', versionMetamodele: 1, racine })) }), (x) => {
        expect(() => depuisImbrique(x, catalogue)).not.toThrow();
      }),
      { numRuns: 1000 },
    );
  });
});
