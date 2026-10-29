// Recette de la phase 2 : EXPORT et PARITÉ, dans un vrai navigateur (Chrome).
//
// 1. L'éditeur (version construite) charge le document de démonstration, en mode aperçu.
// 2. On clique sur « Exporter React » puis « Exporter Vue » : on récupère les vrais .zip.
// 3. Chaque projet est décompressé, installé, construit (vite build) et lancé (vite preview).
// 4. On compare, élément par élément, le canevas, l'application React et l'application Vue :
//    balise, texte, attribut disabled et styles CALCULÉS par le navigateur.
// 5. On enregistre des captures.
//
// Usage : pnpm recette:export   (depuis la racine du monodépôt)
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { unzipSync } from 'fflate';
import { chromium } from 'playwright-core';
import { preview } from 'vite';

const CHROME = process.env.CHROME ?? '/usr/bin/google-chrome';
const CAPTURES = resolve(import.meta.dirname, '../../../docs/reference/captures');
mkdirSync(CAPTURES, { recursive: true });

/** Propriétés comparées. Les largeurs et hauteurs sont exclues : elles dépendent de la fenêtre. */
const PROPRIETES = [
  'display', 'flexDirection', 'rowGap', 'columnGap', 'alignItems', 'justifyContent',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'backgroundColor', 'borderTopWidth', 'borderTopStyle', 'borderTopColor', 'borderTopLeftRadius',
  'color', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign', 'opacity', 'cursor',
];

/** Signature d'un sous-arbre DOM : exécutée DANS la page. */
function signature(racine, proprietes) {
  const lire = (el) => {
    const style = getComputedStyle(el);
    const texte = [...el.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent)
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
    return {
      balise: el.tagName.toLowerCase(),
      texte,
      desactive: el.hasAttribute('disabled'),
      styles: Object.fromEntries(proprietes.map((p) => [p, style[p]])),
      enfants: [...el.children].map(lire),
    };
  };
  return lire(racine);
}

/** Liste des différences entre deux signatures (chemin → attendu / obtenu). */
function comparer(a, b, chemin = 'racine') {
  const ecarts = [];
  for (const champ of ['balise', 'texte', 'desactive']) {
    if (a[champ] !== b[champ]) ecarts.push(`${chemin}.${champ} : ${JSON.stringify(a[champ])} ≠ ${JSON.stringify(b[champ])}`);
  }
  for (const p of PROPRIETES) {
    if (a.styles[p] !== b.styles[p]) ecarts.push(`${chemin}.${p} : ${a.styles[p]} ≠ ${b.styles[p]}`);
  }
  if (a.enfants.length !== b.enfants.length) {
    ecarts.push(`${chemin} : ${a.enfants.length} enfant(s) ≠ ${b.enfants.length}`);
  } else {
    a.enfants.forEach((e, i) => ecarts.push(...comparer(e, b.enfants[i], `${chemin}>${e.balise}[${i}]`)));
  }
  return ecarts;
}

function compter(s) {
  return 1 + s.enfants.reduce((n, e) => n + compter(e), 0);
}

async function attendre(url) {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // le serveur démarre encore
    }
    await new Promise((ok) => setTimeout(ok, 500));
  }
  throw new Error(`Le serveur ${url} ne répond pas`);
}

const resultats = [];
const nettoyages = [];
const ok = (nom) => resultats.push(['✅', nom]);
const ko = (nom, detail) => resultats.push(['❌', `${nom} — ${detail}`]);

const serveur = await preview({ preview: { port: 4174, strictPort: true }, logLevel: 'silent' });
const navigateur = await chromium.launch({ executablePath: CHROME, headless: true });

try {
  const page = await navigateur.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const erreursConsole = [];
  page.on('pageerror', (e) => erreursConsole.push(e.message));

  // 1. L'éditeur, le document de démonstration, le mode aperçu
  await page.goto(serveur.resolvedUrls.local[0]);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Charger la démo' }).click();
  await page.getByRole('button', { name: '👁 Aperçu' }).click();
  const racineCanevas = page.locator('.canevas [data-noeud-id="page"]');
  const reference = await racineCanevas.evaluate(signature, PROPRIETES);
  await racineCanevas.screenshot({ path: `${CAPTURES}/10-apercu-canevas.png` });
  await page.screenshot({ path: `${CAPTURES}/11-editeur-demo-apercu.png` });
  ok(`Canevas en aperçu : ${compter(reference)} éléments relevés`);

  for (const cible of [
    { nom: 'React', bouton: '⤓ Exporter React', racine: '#root > *', port: 4175 },
    { nom: 'Vue', bouton: '⤓ Exporter Vue', racine: '#app > *', port: 4176 },
  ]) {
    // 2. Le vrai bouton d'export : on récupère le .zip téléchargé
    const [telechargement] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: cible.bouton }).click(),
    ]);
    const zip = unzipSync(readFileSync(await telechargement.path()));
    const dossier = mkdtempSync(join(tmpdir(), `export-${cible.nom.toLowerCase()}-`));
    nettoyages.push(dossier);
    for (const [chemin, octets] of Object.entries(zip)) {
      const destination = join(dossier, chemin);
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, octets);
    }
    const projet = join(dossier, Object.keys(zip)[0].split('/')[0]);
    ok(`${cible.nom} : ${telechargement.suggestedFilename()} téléchargé (${Object.keys(zip).length} fichiers)`);

    // 3. Installer, construire, lancer
    try {
      execFileSync('pnpm', ['install', '--ignore-workspace', '--prefer-offline'], { cwd: projet, stdio: 'pipe' });
      ok(`${cible.nom} : dépendances installées`);
      execFileSync('pnpm', ['exec', 'vite', 'build'], { cwd: projet, stdio: 'pipe' });
      ok(`${cible.nom} : le projet généré se construit (vite build)`);
    } catch (e) {
      ko(`${cible.nom} : installation ou construction`, String(e.stderr ?? e.message).slice(0, 800));
      continue;
    }
    const serveurProjet = spawn('pnpm', ['exec', 'vite', 'preview', '--port', String(cible.port), '--strictPort'], {
      cwd: projet,
      stdio: 'ignore',
      detached: true,
    });
    nettoyages.push(() => process.kill(-serveurProjet.pid));
    const url = `http://localhost:${cible.port}/`;
    await attendre(url);

    // 4. Comparer avec le canevas
    const pageProjet = await navigateur.newPage({ viewport: { width: 1000, height: 600 } });
    const erreursProjet = [];
    pageProjet.on('pageerror', (e) => erreursProjet.push(e.message));
    pageProjet.on('console', (m) => m.type() === 'error' && erreursProjet.push(m.text()));
    await pageProjet.goto(url);
    const racine = pageProjet.locator(cible.racine).first();
    await racine.waitFor();
    const obtenu = await racine.evaluate(signature, PROPRIETES);
    const ecarts = comparer(reference, obtenu);
    if (ecarts.length === 0) ok(`${cible.nom} : PARITÉ avec le canevas sur ${compter(obtenu)} éléments × ${PROPRIETES.length + 3} critères`);
    else ko(`${cible.nom} : parité`, `${ecarts.length} écart(s) :\n   ${ecarts.slice(0, 15).join('\n   ')}`);
    if (erreursProjet.length === 0) ok(`${cible.nom} : aucune erreur dans la console`);
    else ko(`${cible.nom} : console`, erreursProjet.join(' | '));
    await pageProjet.screenshot({ path: `${CAPTURES}/${cible.nom === 'React' ? '12' : '13'}-application-${cible.nom.toLowerCase()}-generee.png` });
    await pageProjet.close();
  }

  if (erreursConsole.length === 0) ok('Éditeur : aucune erreur dans la console');
  else ko('Éditeur : console', erreursConsole.join(' | '));
} catch (e) {
  ko('arrêt', e.message);
} finally {
  await navigateur.close();
  await new Promise((fin) => serveur.httpServer.close(fin));
  for (const n of nettoyages.reverse()) {
    try {
      if (typeof n === 'function') n();
      else rmSync(n, { recursive: true, force: true });
    } catch {
      // déjà arrêté ou supprimé
    }
  }
}

for (const [etat, nom] of resultats) console.log(`${etat} ${nom}`);
console.log(`Captures : ${CAPTURES}`);
process.exit(resultats.some(([etat]) => etat === '❌') ? 1 : 0);
