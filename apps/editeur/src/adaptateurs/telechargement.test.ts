import { describe, it, expect } from 'vitest';
import { strFromU8, unzipSync } from 'fflate';
import { creerZip } from './telechargement';

describe('creerZip', () => {
  const fichiers = [
    { chemin: 'package.json', contenu: '{ "name": "x" }\n' },
    { chemin: 'src/App.jsx', contenu: 'export default function App() {}\n' },
  ];

  it('range chaque fichier dans le dossier du projet, contenu intact (UTF-8 compris)', () => {
    const avecAccents = [...fichiers, { chemin: 'README.md', contenu: '# Créer un compte — démo\n' }];
    const extrait = unzipSync(creerZip('mon-projet', avecAccents));
    expect(Object.keys(extrait).sort()).toEqual(['mon-projet/README.md', 'mon-projet/package.json', 'mon-projet/src/App.jsx']);
    expect(strFromU8(extrait['mon-projet/README.md']!)).toBe('# Créer un compte — démo\n');
  });

  it('est déterministe : mêmes fichiers ⇒ mêmes octets', () => {
    expect(creerZip('p', fichiers)).toEqual(creerZip('p', fichiers));
  });
});
