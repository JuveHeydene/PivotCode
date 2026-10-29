// Générateur Vue : modèle pivot (PIM) → projet Vite + Vue 3 complet.
// Transformation DÉTERMINISTE : même document ⇒ exactement les mêmes fichiers.
import type { Catalogue, DocumentPivot } from '@plateforme/noyau';
import { arbreWeb, CSS_DE_BASE, echapperHtml, nomDePaquet } from '@plateforme/rendu-web';
import { lignesTemplate } from './template';

export type FichierGenere = { readonly chemin: string; readonly contenu: string };

export type OptionsGeneration = {
  /** Nom affiché de l'application (titre de la page, nom du paquet). */
  readonly nom?: string;
};

/** Versions des dépendances des projets générés (fixées : le résultat ne dépend pas du jour). */
export const VERSIONS_VUE = {
  vue: '^3.5.44',
  vite: '^8.3.4',
  '@vitejs/plugin-vue': '^6.0.10',
} as const;

/** Le composant App.vue, qui affiche la page. */
export function genererApp(document: DocumentPivot, catalogue: Catalogue): string {
  const arbre = arbreWeb(document, catalogue, { inconnu: 'erreur' });
  return [
    '<!--',
    '  Fichier généré par la plateforme low-code à partir du modèle pivot.',
    '  Ne pas le modifier à la main : le régénérer depuis l’éditeur.',
    '-->',
    '<template>',
    ...lignesTemplate(arbre, 1),
    '</template>',
    '',
  ].join('\n');
}

/** Le projet complet, prêt à installer (`npm install`) et lancer (`npm run dev`). */
export function genererProjetVue(
  document: DocumentPivot,
  catalogue: Catalogue,
  options: OptionsGeneration = {},
): FichierGenere[] {
  const nom = options.nom ?? 'Application générée';
  const paquet = {
    name: nomDePaquet(nom),
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
    dependencies: { vue: VERSIONS_VUE.vue },
    devDependencies: { vite: VERSIONS_VUE.vite, '@vitejs/plugin-vue': VERSIONS_VUE['@vitejs/plugin-vue'] },
  };
  return [
    { chemin: 'package.json', contenu: `${JSON.stringify(paquet, null, 2)}\n` },
    {
      chemin: 'index.html',
      contenu: `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Icône vide : évite que le navigateur réclame /favicon.ico (erreur 404). -->
    <link rel="icon" href="data:," />
    <title>${echapperHtml(nom)}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`,
    },
    {
      chemin: 'vite.config.js',
      contenu: `import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
});
`,
    },
    {
      chemin: 'src/main.js',
      contenu: `import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

createApp(App).mount('#app');
`,
    },
    { chemin: 'src/App.vue', contenu: genererApp(document, catalogue) },
    { chemin: 'src/index.css', contenu: CSS_DE_BASE },
    {
      chemin: 'README.md',
      contenu: `# ${nom}

Application Vue générée par la plateforme low-code à partir du modèle pivot.

\`\`\`bash
npm install
npm run dev
\`\`\`
`,
    },
  ];
}
