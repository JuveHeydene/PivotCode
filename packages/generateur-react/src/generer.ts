// Générateur React : modèle pivot (PIM) → projet Vite + React complet.
// Transformation DÉTERMINISTE : même document ⇒ exactement les mêmes fichiers.
import type { Catalogue, DocumentPivot } from '@plateforme/noyau';
import { arbreWeb, CSS_DE_BASE, echapperHtml, nomDePaquet } from '@plateforme/rendu-web';
import { lignesJsx } from './jsx';

export type FichierGenere = { readonly chemin: string; readonly contenu: string };

export type OptionsGeneration = {
  /** Nom affiché de l'application (titre de la page, nom du paquet). */
  readonly nom?: string;
};

/** Versions des dépendances des projets générés (fixées : le résultat ne dépend pas du jour). */
export const VERSIONS_REACT = {
  react: '^19.3.1',
  'react-dom': '^19.3.1',
  vite: '^8.3.4',
  '@vitejs/plugin-react': '^6.1.2',
} as const;

const ENTETE = `// Fichier généré par la plateforme low-code à partir du modèle pivot.
// Ne pas le modifier à la main : le régénérer depuis l'éditeur.`;

/** Le composant App.jsx, qui affiche la page. */
export function genererApp(document: DocumentPivot, catalogue: Catalogue): string {
  const arbre = arbreWeb(document, catalogue, { inconnu: 'erreur' });
  return [
    ENTETE,
    'export default function App() {',
    '  return (',
    ...lignesJsx(arbre, 2),
    '  );',
    '}',
    '',
  ].join('\n');
}

/** Le projet complet, prêt à installer (`npm install`) et lancer (`npm run dev`). */
export function genererProjetReact(
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
    dependencies: { react: VERSIONS_REACT.react, 'react-dom': VERSIONS_REACT['react-dom'] },
    devDependencies: { vite: VERSIONS_REACT.vite, '@vitejs/plugin-react': VERSIONS_REACT['@vitejs/plugin-react'] },
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
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
    },
    {
      chemin: 'vite.config.js',
      contenu: `import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
});
`,
    },
    {
      chemin: 'src/main.jsx',
      contenu: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
    },
    { chemin: 'src/App.jsx', contenu: genererApp(document, catalogue) },
    { chemin: 'src/index.css', contenu: CSS_DE_BASE },
    {
      chemin: 'README.md',
      contenu: `# ${nom}

Application React générée par la plateforme low-code à partir du modèle pivot.

\`\`\`bash
npm install
npm run dev
\`\`\`
`,
    },
  ];
}
