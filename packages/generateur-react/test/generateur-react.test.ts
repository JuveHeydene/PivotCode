import { describe, it, expect } from 'vitest';
import { Catalogue, composantsDeBase } from '@plateforme/noyau';
import type { DocumentPivot } from '@plateforme/noyau';
import { CSS_DE_BASE, documentDemonstration, ErreurRendu } from '@plateforme/rendu-web';
import { chaineJs, genererApp, genererProjetReact, texteJsx } from '../src/index';

const catalogue = new Catalogue(composantsDeBase);

const minimal: DocumentPivot = {
  versionMetamodele: 1,
  racineId: 'r',
  noeuds: {
    r: { id: 'r', composant: 'Conteneur', proprietes: {}, parentId: null, enfants: ['t'] },
    t: { id: 't', composant: 'Texte', proprietes: { contenu: 'Bonjour' }, parentId: 'r', enfants: [] },
  },
};

describe('genererApp', () => {
  it('produit exactement le code attendu pour un petit document', () => {
    expect(genererApp(minimal, catalogue)).toBe(`// Fichier généré par la plateforme low-code à partir du modèle pivot.
// Ne pas le modifier à la main : le régénérer depuis l'éditeur.
export default function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '8px',
        margin: '0px',
      }}
    >
      <p
        style={{
          margin: '0px',
          fontSize: '1rem',
          fontWeight: '400',
          color: '#1d2129',
          textAlign: 'left',
        }}
      >
        Bonjour
      </p>
    </div>
  );
}
`);
  });

  it('est déterministe : même document ⇒ même code, au caractère près', () => {
    const a = genererProjetReact(documentDemonstration, catalogue);
    const b = genererProjetReact(JSON.parse(JSON.stringify(documentDemonstration)) as DocumentPivot, catalogue);
    expect(b).toEqual(a);
  });

  it('respecte l’ordre des enfants', () => {
    const code = genererApp(documentDemonstration, catalogue);
    expect(code.indexOf('Plus tard')).toBeLessThan(code.indexOf('Créer mon compte'));
    expect(code.indexOf('Créer mon compte')).toBeLessThan(code.indexOf('Indisponible'));
  });

  it('un bouton désactivé reçoit l’attribut disabled', () => {
    expect(genererApp(documentDemonstration, catalogue)).toMatch(/type="button"\n\s+disabled\n/);
  });

  it('refuse un composant sans règle plutôt que de produire du code faux', () => {
    const inconnu: DocumentPivot = {
      ...minimal,
      noeuds: { ...minimal.noeuds, t: { id: 't', composant: 'Carrousel', proprietes: {}, parentId: 'r', enfants: [] } },
    };
    expect(() => genererApp(inconnu, catalogue)).toThrow(ErreurRendu);
  });
});

describe('échappement', () => {
  it.each([
    ['Bonjour', 'Bonjour'],
    ['Prix : 5 €', 'Prix : 5 €'],
    ['a < b', '{"a < b"}'],
    ['{{ x }}', '{"{{ x }}"}'],
    ['Tom & Jerry', '{"Tom & Jerry"}'],
    ['  espaces  ', '{"  espaces  "}'],
    ['dit "oui"', 'dit "oui"'],
  ])('texte %j → %s', (texte, attendu) => {
    expect(texteJsx(texte)).toBe(attendu);
  });

  it('chaîne JavaScript avec apostrophe et barre oblique inverse', () => {
    expect(chaineJs("l'a\\b")).toBe("'l\\'a\\\\b'");
  });

  it('le texte piège du document de démonstration est écrit comme une expression', () => {
    expect(genererApp(documentDemonstration, catalogue)).toContain('{"Texte <b>piège</b> {{ x }} {y} & \\"guillemets\\""}');
  });
});

describe('genererProjetReact', () => {
  const fichiers = genererProjetReact(documentDemonstration, catalogue, { nom: 'Démo Inscription' });
  const contenu = (chemin: string) => fichiers.find((f) => f.chemin === chemin)?.contenu ?? '';

  it('produit un projet Vite + React complet', () => {
    expect(fichiers.map((f) => f.chemin)).toEqual([
      'package.json',
      'index.html',
      'vite.config.js',
      'src/main.jsx',
      'src/App.jsx',
      'src/index.css',
      'README.md',
    ]);
  });

  it('package.json : nom valide et dépendances React', () => {
    const paquet = JSON.parse(contenu('package.json')) as { name: string; dependencies: Record<string, string> };
    expect(paquet.name).toBe('demo-inscription');
    expect(Object.keys(paquet.dependencies)).toEqual(['react', 'react-dom']);
  });

  it('le CSS de base vient de rendu-web (parité avec Vue et le canevas)', () => {
    expect(contenu('src/index.css')).toBe(CSS_DE_BASE);
  });

  it('index.html : titre échappé', () => {
    const avecChevrons = genererProjetReact(minimal, catalogue, { nom: 'A <b> B' });
    expect(avecChevrons.find((f) => f.chemin === 'index.html')?.contenu).toContain('<title>A &lt;b&gt; B</title>');
  });
});
