// Le FORMAT D'ÉCHANGE IMBRIQUÉ (phase 4) : les limites de la phase 3 disparaissent.
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { documentDemonstration } from '@plateforme/rendu-web';
import { EditeurApplicatif } from '@plateforme/noyau';
import type { DepotDocument } from '@plateforme/noyau';
import { versImbrique } from '@plateforme/format-imbrique';
import { catalogue, codesImport, copie, schemaImbrique, schemaImbriqueAccepte } from './outils';

type N = Record<string, unknown> & { proprietes: Record<string, unknown>; enfants?: N[] };
type D = { format: unknown; versionMetamodele: unknown; racine: N };
const demo = (ids = true) => copie(versImbrique(documentDemonstration, { ids })) as unknown as D;
/** Tous les nœuds, dans l'ordre de lecture (pour en choisir un au hasard). */
function tous(d: D): N[] {
  const sortie: N[] = [];
  const pile = [d.racine];
  while (pile.length > 0) {
    const n = pile.pop()!;
    sortie.push(n);
    pile.push(...[...(n.enfants ?? [])].reverse());
  }
  return sortie;
}
const parId = (d: D, id: string) => tous(d).find((n) => n['id'] === id)!;

describe('le schéma imbriqué lui-même', () => {
  it('est récursif : un conteneur contient des Noeud ; Texte et Bouton n’ont pas de champ enfants', () => {
    const defs = schemaImbrique['$defs'] as Record<string, { properties: Record<string, unknown>; required: string[] }>;
    expect(Object.keys(defs)).toEqual(['Noeud', 'Texte', 'Bouton', 'Conteneur']);
    expect(defs['Conteneur']!.properties['enfants']).toMatchObject({ items: { $ref: '#/$defs/Noeud' } });
    expect(defs['Bouton']!.properties['enfants']).toBeUndefined();
    expect(defs['Bouton']!.required).toEqual(['composant', 'proprietes']);
  });

  it('accepte la démonstration exportée, avec ou sans identifiants', () => {
    expect(schemaImbriqueAccepte(demo())).toBe(true);
    expect(schemaImbriqueAccepte(demo(false))).toBe(true);
  });
});

describe('les 6 LIMITES de la phase 3 ne peuvent plus être écrites', () => {
  it('clé ≠ id, parentId contradictoire : ces champs n’existent plus (aucune clé, aucun parentId)', () => {
    const texte = JSON.stringify(demo());
    expect(texte).not.toContain('parentId');
    expect(texte).not.toContain('racineId');
    const d = demo();
    d.racine['parentId'] = null;
    expect(schemaImbriqueAccepte(d)).toBe(false); // un champ inconnu : le schéma refuse
  });

  it('racine absente : le schéma l’exige', () => {
    const { racine: _, ...sansRacine } = demo();
    expect(schemaImbriqueAccepte(sansRacine)).toBe(false);
    expect(codesImport(sansRacine)).toEqual(['FORME_INVALIDE']);
  });

  it('enfant inexistant : un enfant est un NŒUD, pas une référence', () => {
    const d = demo();
    (d.racine.enfants as unknown[]).push('fantome');
    expect(schemaImbriqueAccepte(d)).toBe(false);
    expect(codesImport(d)).toEqual(['NOEUD_MAL_FORME']);
  });

  it('orphelin, cycle : impossibles en JSON, un texte JSON est toujours un arbre', () => {
    // Le seul moyen d'en fabriquer un est un objet JavaScript partagé, que JSON ne peut pas écrire.
    const d = demo();
    d.racine.enfants!.push(d.racine);
    expect(() => JSON.stringify(d)).toThrow(); // « Converting circular structure to JSON »
    expect(codesImport(d)).toEqual(['CYCLE_OU_PARTAGE']);
  });

  it('enfants d’un Bouton : maintenant exprimable, donc refusé par le schéma ET par l’import', () => {
    const d = demo();
    parId(d, 'valider').enfants = [{ composant: 'Texte', proprietes: { contenu: 'x' } }];
    expect(schemaImbriqueAccepte(d)).toBe(false);
    expect(codesImport(d)).toEqual(['ENFANTS_INTERDITS']);
  });
});

describe('la SEULE limite qui reste : l’unicité des identifiants', () => {
  it('deux nœuds avec le même id : le schéma accepte, l’import refuse', () => {
    const d = demo();
    parId(d, 'valider')['id'] = 'titre';
    expect(schemaImbriqueAccepte(d)).toBe(true);
    expect(codesImport(d)).toEqual(['IDENTIFIANT_DEJA_UTILISE']);
  });

  it('… et elle disparaît si l’on omet les identifiants', () => {
    expect(JSON.stringify(demo(false))).not.toContain('"id"');
    expect(codesImport(demo(false))).toEqual([]);
  });
});

describe('strict dans ce qu’on produit, tolérant dans ce qu’on accepte', () => {
  it.each<[string, (d: D) => void]>([
    ['un champ en trop', (d) => { d.racine['commentaire'] = 'x'; }],
    ['proprietes absent', (d) => { delete (d.racine as Partial<N>).proprietes; }],
    ['« enfants: [] » sur un Bouton', (d) => { parId(d, 'valider').enfants = []; }],
  ])('%s : refusé par le schéma, toléré par l’import', (_nom, modifier) => {
    const d = demo();
    modifier(d);
    expect(schemaImbriqueAccepte(d)).toBe(false);
    expect(codesImport(d)).toEqual([]);
  });
});

describe('propriété 1 : tout document produit par les commandes s’exporte en imbriqué conforme', () => {
  it('avec et sans identifiants', () => {
    const commande = fc.oneof(
      fc.record({ k: fc.constant('ajouter' as const), parent: fc.nat(), composant: fc.constantFrom('Texte', 'Bouton', 'Conteneur') }),
      fc.record({ k: fc.constant('deplacer' as const), cible: fc.nat(), parent: fc.nat(), position: fc.integer({ min: -1, max: 5 }) }),
      fc.record({ k: fc.constant('supprimer' as const), cible: fc.nat() }),
    );
    fc.assert(
      fc.property(fc.array(commande, { maxLength: 40, size: 'max' }), (suite) => {
        let n = 0;
        let contenu: unknown = copie(documentDemonstration);
        const depot: DepotDocument = { charger: () => contenu, enregistrer: (d) => { contenu = d; } };
        const service = new EditeurApplicatif(catalogue, { nouveau: () => `n${++n}` }, depot);
        for (const c of suite) {
          const liste = Object.keys(service.lireDocument().noeuds);
          const choisir = (i: number) => liste[i % liste.length]!;
          if (c.k === 'ajouter') service.executer({ type: 'ajouter-noeud', parentId: choisir(c.parent), composant: c.composant });
          else if (c.k === 'deplacer') service.executer({ type: 'deplacer-noeud', id: choisir(c.cible), nouveauParentId: choisir(c.parent), position: c.position });
          else service.executer({ type: 'supprimer-noeud', id: choisir(c.cible) });
        }
        expect(schemaImbriqueAccepte(versImbrique(service.lireDocument()))).toBe(true);
        expect(schemaImbriqueAccepte(versImbrique(service.lireDocument(), { ids: false }))).toBe(true);
      }),
      { numRuns: 200 },
    );
  });
});

describe('propriété 2 : sur des documents imbriqués CORROMPUS, le schéma et l’import sont cohérents', () => {
  const proprietesConnues = [...new Set(catalogue.lister().flatMap((d) => d.proprietes.map((p) => p.nom)))];
  const corruption = fc.oneof(
    fc.record({ k: fc.constant('propriete' as const), noeud: fc.nat(), nom: fc.constantFrom(...proprietesConnues, 'inconnue'), valeur: fc.oneof(fc.string({ maxLength: 4 }), fc.integer({ min: -3, max: 30 }), fc.boolean(), fc.constant(null), fc.constantFrom('primaire', 'rose', 'centre', 'ligne', 'grand')) }),
    fc.record({ k: fc.constant('retirer' as const), noeud: fc.nat(), nom: fc.constantFrom(...proprietesConnues) }),
    fc.record({ k: fc.constant('composant' as const), noeud: fc.nat(), composant: fc.constantFrom('Texte', 'Bouton', 'Conteneur', 'Carrousel') }),
    fc.record({ k: fc.constant('enfant' as const), noeud: fc.nat(), composant: fc.constantFrom('Texte', 'Conteneur') }),
    fc.record({ k: fc.constant('memeId' as const), noeud: fc.nat(), autre: fc.nat() }),
    fc.record({ k: fc.constant('version' as const), version: fc.integer({ min: 0, max: 3 }) }),
  );

  /** Le seul défaut que le schéma ne sait pas voir. */
  const INEXPRIMABLES = new Set(['IDENTIFIANT_DEJA_UTILISE']);

  it('schéma accepte ⇒ import accepte (sauf identifiant en double) ; import refuse ⇒ schéma refuse (idem)', () => {
    const compte = { lesDeuxRefusent: 0, lesDeuxAcceptent: 0, seulementIdDouble: 0, contradiction: 0 };
    fc.assert(
      fc.property(fc.array(corruption, { minLength: 1, maxLength: 4 }), (corruptions) => {
        const d = demo();
        for (const c of corruptions) {
          if (c.k === 'version') { d.versionMetamodele = c.version; continue; }
          const noeuds = tous(d);
          const n = noeuds[c.noeud % noeuds.length]!;
          if (c.k === 'propriete') n.proprietes[c.nom] = c.valeur;
          else if (c.k === 'retirer') delete n.proprietes[c.nom];
          else if (c.k === 'composant') n['composant'] = c.composant;
          else if (c.k === 'enfant') (n.enfants ??= []).push(c.composant === 'Texte' ? { composant: 'Texte', proprietes: { contenu: 'x' } } : { composant: 'Conteneur', proprietes: {} });
          else n['id'] = noeuds[c.autre % noeuds.length]!['id'];
        }
        const accepte = schemaImbriqueAccepte(d);
        const codes = codesImport(d);
        const inexprimable = codes.length > 0 && codes.every((code) => INEXPRIMABLES.has(code));
        if (accepte && codes.length === 0) compte.lesDeuxAcceptent++;
        else if (!accepte && codes.length > 0) compte.lesDeuxRefusent++;
        else if (accepte && inexprimable) compte.seulementIdDouble++;
        else compte.contradiction++;
        expect(accepte && codes.length > 0 && !inexprimable).toBe(false);
        expect(!accepte && codes.length === 0).toBe(false);
      }),
      { numRuns: 1000 },
    );
    expect(compte.contradiction).toBe(0);
    // Chaque catégorie doit être réellement exercée (sinon le test ne prouverait rien).
    expect(compte.lesDeuxRefusent).toBeGreaterThan(100);
    expect(compte.lesDeuxAcceptent).toBeGreaterThan(50);
    expect(compte.seulementIdDouble).toBeGreaterThan(10);
  });
});
