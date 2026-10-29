// COHÉRENCE entre le JSON Schema et le validateur du noyau, par tests par propriétés.
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { EditeurApplicatif } from '@plateforme/noyau';
import type { DepotDocument, DocumentPivot } from '@plateforme/noyau';
import { documentDemonstration } from '@plateforme/rendu-web';
import { catalogue, codesNoyau, copie, schemaAccepte } from './outils';

/** Défauts que le schéma SAIT exprimer (forme, composant, propriétés, enfants interdits). */
const EXPRIMABLES = new Set([
  'FORME_INVALIDE',
  'NOEUD_MAL_FORME',
  'COMPOSANT_INCONNU',
  'PROPRIETE_MANQUANTE',
  'PROPRIETE_INCONNUE',
  'PROPRIETE_TYPE_INVALIDE',
  'PROPRIETE_CHOIX_INVALIDE',
  'ENFANTS_INTERDITS',
]);

const ids = Object.keys(documentDemonstration.noeuds);
const proprietesConnues = [...new Set(catalogue.lister().flatMap((d) => d.proprietes.map((p) => p.nom)))];

describe('propriété 1 : tout ce que produisent les commandes est conforme au schéma', () => {
  it('des suites aléatoires de commandes, passées par le VRAI service', () => {
    const commande = fc.oneof(
      fc.record({ k: fc.constant('ajouter' as const), parent: fc.nat(), composant: fc.constantFrom('Texte', 'Bouton', 'Conteneur') }),
      fc.record({ k: fc.constant('deplacer' as const), cible: fc.nat(), parent: fc.nat(), position: fc.integer({ min: -1, max: 5 }) }),
      fc.record({ k: fc.constant('supprimer' as const), cible: fc.nat() }),
      fc.record({ k: fc.constant('modifier' as const), cible: fc.nat(), nom: fc.constantFrom(...proprietesConnues), valeur: fc.oneof(fc.string({ maxLength: 6 }), fc.integer({ min: 0, max: 30 }), fc.boolean(), fc.constantFrom('primaire', 'centre', 'ligne', 'grand', 'espace')) }),
    );
    fc.assert(
      fc.property(fc.array(commande, { maxLength: 40 }), (suite) => {
        let n = 0;
        let contenu: unknown = copie(documentDemonstration);
        const depot: DepotDocument = { charger: () => contenu, enregistrer: (d) => { contenu = d; } };
        const service = new EditeurApplicatif(catalogue, { nouveau: () => `n${++n}` }, depot);
        for (const c of suite) {
          const doc = service.lireDocument();
          const liste = Object.keys(doc.noeuds);
          const choisir = (i: number) => liste[i % liste.length]!;
          if (c.k === 'ajouter') service.executer({ type: 'ajouter-noeud', parentId: choisir(c.parent), composant: c.composant });
          else if (c.k === 'deplacer') service.executer({ type: 'deplacer-noeud', id: choisir(c.cible), nouveauParentId: choisir(c.parent), position: c.position });
          else if (c.k === 'supprimer') service.executer({ type: 'supprimer-noeud', id: choisir(c.cible) });
          else service.executer({ type: 'modifier-propriete', id: choisir(c.cible), nom: c.nom, valeur: c.valeur });
          expect(schemaAccepte(service.lireDocument())).toBe(true);
        }
      }),
      { numRuns: 200 },
    );
  });
});

describe('propriété 2 : sur des documents CORROMPUS au hasard, le schéma et le noyau sont cohérents', () => {
  // Corruptions possibles (sans champ structurel en trop ni clé ≠ id : voir les tests de limites).
  const corruption = fc.oneof(
    fc.record({ k: fc.constant('propriete' as const), noeud: fc.constantFrom(...ids), nom: fc.constantFrom(...proprietesConnues, 'inconnue'), valeur: fc.oneof(fc.string({ maxLength: 4 }), fc.integer({ min: -3, max: 30 }), fc.double({ min: -2, max: 30, noNaN: true }), fc.boolean(), fc.constant(null), fc.constantFrom('primaire', 'rose', 'centre', 'ligne', 'grand', 'espace', 'etirer')) }),
    fc.record({ k: fc.constant('retirer' as const), noeud: fc.constantFrom(...ids), nom: fc.constantFrom(...proprietesConnues) }),
    fc.record({ k: fc.constant('composant' as const), noeud: fc.constantFrom(...ids), composant: fc.constantFrom('Texte', 'Bouton', 'Conteneur', 'Carrousel') }),
    fc.record({ k: fc.constant('enfant' as const), noeud: fc.constantFrom(...ids), enfant: fc.constantFrom(...ids) }),
    fc.record({ k: fc.constant('version' as const), version: fc.integer({ min: 0, max: 3 }) }),
    fc.record({ k: fc.constant('parentId' as const), noeud: fc.constantFrom(...ids), valeur: fc.constantFrom<unknown>(5, true, null, 'page') }),
  );

  type Mutable = { versionMetamodele: unknown; noeuds: Record<string, Record<string, unknown> & { proprietes: Record<string, unknown>; enfants: unknown[] }> };

  it('défaut exprimable ⇒ le schéma refuse ; schéma refuse ⇒ le noyau refuse aussi', () => {
    fc.assert(
      fc.property(fc.array(corruption, { minLength: 1, maxLength: 4 }), (corruptions) => {
        const d = copie(documentDemonstration) as unknown as Mutable;
        for (const c of corruptions) {
          if (c.k === 'version') d.versionMetamodele = c.version;
          else if (c.k === 'propriete') d.noeuds[c.noeud]!.proprietes[c.nom] = c.valeur;
          else if (c.k === 'retirer') delete d.noeuds[c.noeud]!.proprietes[c.nom];
          else if (c.k === 'composant') d.noeuds[c.noeud]!['composant'] = c.composant;
          else if (c.k === 'enfant') d.noeuds[c.noeud]!.enfants.push(c.enfant);
          else d.noeuds[c.noeud]!['parentId'] = c.valeur;
        }
        const accepte = schemaAccepte(d);
        const codes = codesNoyau(d as unknown as DocumentPivot);
        if (codes.some((code) => EXPRIMABLES.has(code))) expect(accepte).toBe(false);
        if (!accepte) expect(codes.length).toBeGreaterThan(0);
      }),
      { numRuns: 1000 },
    );
  });
});
