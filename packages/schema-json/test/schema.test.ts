import { describe, it, expect } from 'vitest';
import { documentDemonstration } from '@plateforme/rendu-web';
import { codesNoyau, copie, schema, schemaAccepte, validerParSchema } from './outils';

type Doc = { versionMetamodele: unknown; racineId: string; noeuds: Record<string, Record<string, unknown> & { proprietes: Record<string, unknown>; enfants: string[] }> };
const demo = () => copie(documentDemonstration) as unknown as Doc;

describe('le schéma lui-même', () => {
  it('est un JSON Schema 2020-12 valide (Ajv le compile en mode strict)', () => {
    expect(typeof validerParSchema).toBe('function');
    expect(schema['$schema']).toBe('https://json-schema.org/draft/2020-12/schema');
  });

  it('a une définition par composant du catalogue, et Noeud = l’un d’eux', () => {
    const defs = schema['$defs'] as Record<string, unknown>;
    expect(Object.keys(defs)).toEqual(['Noeud', 'Texte', 'Bouton', 'Conteneur']);
  });

  it('traduit chaque type de propriété dans le vocabulaire standard', () => {
    const bouton = (schema['$defs'] as Record<string, { properties: { proprietes: { properties: Record<string, unknown>; required: string[] } } }>)['Bouton']!;
    const p = bouton.properties.proprietes;
    expect(p.properties['libelle']).toEqual({ type: 'string', title: 'Libellé', default: 'Bouton' });
    expect(p.properties['couleur']).toMatchObject({ type: 'string', enum: ['primaire', 'secondaire', 'succes', 'danger', 'neutre'] });
    expect(p.properties['desactive']).toMatchObject({ type: 'boolean', default: false });
    expect(p.properties['marge']).toMatchObject({ type: 'number', minimum: 0 });
    expect(p.required).toEqual(['libelle']);
  });
});

describe('documents valides', () => {
  it('le document de démonstration est accepté par le schéma ET par le noyau', () => {
    expect(schemaAccepte(documentDemonstration)).toBe(true);
    expect(codesNoyau(documentDemonstration)).toEqual([]);
  });
});

describe('violations que le schéma SAIT exprimer : refusées par les deux', () => {
  it.each<[string, (d: Doc) => void]>([
    ['autre version du métamodèle', (d) => { d.versionMetamodele = 2; }],
    ['composant inconnu', (d) => { d.noeuds['titre']!['composant'] = 'Carrousel'; }],
    ['propriété obligatoire absente', (d) => { delete d.noeuds['titre']!.proprietes['contenu']; }],
    ['propriété inconnue', (d) => { d.noeuds['titre']!.proprietes['clignotement'] = true; }],
    ['mauvais type', (d) => { d.noeuds['page']!.proprietes['espacement'] = 'seize'; }],
    ['choix hors liste', (d) => { d.noeuds['titre']!.proprietes['couleur'] = 'rose'; }],
    ['nombre sous le minimum', (d) => { d.noeuds['page']!.proprietes['arrondi'] = -1; }],
    ['un Texte avec des enfants', (d) => { d.noeuds['titre']!.enfants = ['annuler']; }],
    ['enfants qui ne sont pas des textes', (d) => { (d.noeuds['page']!.enfants as unknown[]).push(3); }],
    ['parentId de mauvais type', (d) => { d.noeuds['titre']!['parentId'] = 5; }],
  ])('%s', (_nom, casser) => {
    const d = demo();
    casser(d);
    expect(schemaAccepte(d)).toBe(false);
    expect(codesNoyau(d).length).toBeGreaterThan(0);
  });
});

describe('LIMITES : ce que le schéma ne PEUT PAS exprimer (seul le noyau le voit)', () => {
  it.each<[string, (d: Doc) => void, string]>([
    ['la clé d’un nœud différente de son id', (d) => { d.noeuds['titre']!['id'] = 'autre'; }, 'NOEUD_MAL_FORME'],
    ['une racine absente', (d) => { d.racineId = 'absente'; }, 'RACINE_INVALIDE'],
    ['un enfant qui n’existe pas', (d) => { d.noeuds['page']!.enfants.push('fantome'); }, 'LIEN_INCOHERENT'],
    ['un parentId qui contredit les enfants', (d) => { d.noeuds['valider']!['parentId'] = 'page'; }, 'LIEN_INCOHERENT'],
    ['un nœud orphelin', (d) => { d.noeuds['page']!.enfants = ['titre', 'piege']; }, 'NOEUD_ORPHELIN'],
    ['un cycle', (d) => { d.noeuds['actions']!.enfants.push('page'); }, 'CYCLE_OU_PARTAGE'],
  ])('%s : le schéma accepte, le noyau refuse (%s)', (_nom, casser, code) => {
    const d = demo();
    casser(d);
    expect(schemaAccepte(d)).toBe(true);
    expect(codesNoyau(d)).toContain(code);
  });
});

describe('strict dans ce qu’on produit, tolérant dans ce qu’on accepte', () => {
  it('un champ structurel en trop : refusé par le schéma, toléré (puis retiré) par le noyau', () => {
    const d = { ...demo(), commentaire: 'en trop' };
    expect(schemaAccepte(d)).toBe(false);
    expect(codesNoyau(d)).toEqual([]);
  });
});
