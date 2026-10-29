import { describe, it, expect } from 'vitest';
import { Catalogue, composantsDeBase } from '@plateforme/noyau';
import type { DocumentPivot } from '@plateforme/noyau';
import { CSS_DE_BASE, documentDemonstration, ErreurRendu } from '@plateforme/rendu-web';
import { genererApp, genererProjetVue, texteVue } from '../src/index';

const catalogue = new Catalogue(composantsDeBase);

const minimal: DocumentPivot = {
  versionMetamodele: 1,
  racineId: 'r',
  noeuds: {
    r: { id: 'r', composant: 'Conteneur', proprietes: {}, parentId: null, enfants: ['t'] },
    t: { id: 't', composant: 'Texte', proprietes: { contenu: 'Bonjour' }, parentId: 'r', enfants: [] },
  },
};

describe('genererApp (Vue)', () => {
  it('produit exactement le code attendu pour un petit document', () => {
    expect(genererApp(minimal, catalogue)).toBe(`<!--
  Fichier généré par la plateforme low-code à partir du modèle pivot.
  Ne pas le modifier à la main : le régénérer depuis l’éditeur.
-->
<template>
  <div
    style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start; justify-content: flex-start; padding: 8px; margin: 0px"
  >
    <p
      style="margin: 0px; font-size: 1rem; font-weight: 400; color: #1d2129; text-align: left"
    >Bonjour</p>
  </div>
</template>
`);
  });

  it('est déterministe : même document ⇒ même code, au caractère près', () => {
    const a = genererProjetVue(documentDemonstration, catalogue);
    const b = genererProjetVue(JSON.parse(JSON.stringify(documentDemonstration)) as DocumentPivot, catalogue);
    expect(b).toEqual(a);
  });

  it('le texte reste collé aux balises (pas d’espaces ajoutés par Vue)', () => {
    expect(genererApp(documentDemonstration, catalogue)).toContain('>Créer un compte</p>');
  });

  it('un bouton désactivé reçoit l’attribut disabled', () => {
    expect(genererApp(documentDemonstration, catalogue)).toMatch(/type="button"\n\s+disabled\n/);
  });

  it('refuse un composant sans règle', () => {
    const inconnu: DocumentPivot = {
      ...minimal,
      noeuds: { ...minimal.noeuds, t: { id: 't', composant: 'Carrousel', proprietes: {}, parentId: 'r', enfants: [] } },
    };
    expect(() => genererApp(inconnu, catalogue)).toThrow(ErreurRendu);
  });
});

describe('échappement (Vue)', () => {
  it.each([
    ['Bonjour', 'Bonjour'],
    ['a < b', 'a &lt; b'],
    ['{{ x }}', '&#123;&#123; x &#125;&#125;'],
    ['Tom & Jerry', 'Tom &amp; Jerry'],
    ['dit "oui"', 'dit &quot;oui&quot;'],
  ])('texte %j → %s', (texte, attendu) => {
    expect(texteVue(texte)).toBe(attendu);
  });

  it('aucune interpolation Vue ne subsiste dans le code généré', () => {
    expect(genererApp(documentDemonstration, catalogue)).not.toContain('{{');
  });
});

describe('genererProjetVue', () => {
  const fichiers = genererProjetVue(documentDemonstration, catalogue, { nom: 'Démo Inscription' });

  it('produit un projet Vite + Vue complet', () => {
    expect(fichiers.map((f) => f.chemin)).toEqual([
      'package.json',
      'index.html',
      'vite.config.js',
      'src/main.js',
      'src/App.vue',
      'src/index.css',
      'README.md',
    ]);
  });

  it('package.json : dépendance Vue', () => {
    const paquet = JSON.parse(fichiers[0]!.contenu) as { name: string; dependencies: Record<string, string> };
    expect(paquet.name).toBe('demo-inscription');
    expect(Object.keys(paquet.dependencies)).toEqual(['vue']);
  });

  it('le CSS de base vient de rendu-web, comme pour React (parité)', () => {
    expect(fichiers.find((f) => f.chemin === 'src/index.css')?.contenu).toBe(CSS_DE_BASE);
  });
});
