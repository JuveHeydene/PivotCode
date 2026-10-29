// Recette de bout en bout dans un VRAI navigateur (Chrome), sur la version
// construite (`vite build`), servie par `vite preview`.
// Déroule les scénarios S1 à S7 de l'étape 13 et enregistre des captures.
// Usage : pnpm recette   (depuis la racine du monodépôt)
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { preview } from 'vite';
import { chromium } from 'playwright-core';

const CHROME = process.env.CHROME ?? '/usr/bin/google-chrome';
// Les captures montrent l'ÉTAT ACTUEL : elles vont dans docs/reference/.
// Celles des phases terminées (docs/0N-phase-…/captures/) restent figées.
const CAPTURES = resolve(import.meta.dirname, '../../../docs/reference/captures');
mkdirSync(CAPTURES, { recursive: true });

const serveur = await preview({ preview: { port: 4173, strictPort: true }, logLevel: 'silent' });
const url = serveur.resolvedUrls.local[0];
const navigateur = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await navigateur.newPage({ viewport: { width: 1440, height: 900 } });

const erreursConsole = [];
page.on('console', (m) => m.type() === 'error' && erreursConsole.push(m.text()));
page.on('pageerror', (e) => erreursConsole.push(e.message));

const resultats = [];
async function scenario(nom, fn) {
  try {
    await fn();
    resultats.push(['✅', nom]);
  } catch (e) {
    resultats.push(['❌', `${nom} — ${e.message.split('\n')[0]}`]);
  }
}
function verifier(condition, message) {
  if (!condition) throw new Error(message);
}
const json = async () => JSON.parse(await page.getByLabel('Modèle pivot (JSON)', { exact: true }).textContent());
// Chrome refuse parfois une capture prise juste après un rechargement
// (« Unable to capture screenshot », phase 2, problème P2-07) : on attend
// l'affichage, puis on retente une fois.
async function capture(nom) {
  await page.locator('.canevas').waitFor();
  try {
    await page.screenshot({ path: `${CAPTURES}/${nom}.png` });
  } catch {
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${CAPTURES}/${nom}.png` });
  }
}
const dansCanevas = (id) => page.locator(`.canevas [data-noeud-id="${id}"]`);
async function editerJson(transformer) {
  await page.getByRole('button', { name: 'Modifier' }).click();
  const zone = page.getByLabel('Modèle pivot (JSON) en édition');
  await zone.fill(transformer(await zone.inputValue()));
  await page.getByRole('button', { name: 'Appliquer' }).click();
}

try {
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await scenario('S0 Démarrage : une racine Conteneur avec un identifiant UUID', async () => {
    const doc = await json();
    verifier(Object.keys(doc.noeuds).length === 1, 'un seul nœud attendu');
    verifier(/^[0-9a-f-]{36}$/.test(doc.racineId), `UUID attendu, reçu ${doc.racineId}`);
    await capture('01-document-initial');
  });

  await page.getByRole('button', { name: 'Charger l’exemple' }).click();
  await capture('02-exemple-charge');

  await scenario('S1 Ajouter un Bouton dans la racine', async () => {
    await page.locator('.canevas').click({ position: { x: 5, y: 5 } }); // désélectionner
    await page.getByRole('button', { name: '+ Bouton' }).click();
    const doc = await json();
    const ajoutes = doc.noeuds.racine.enfants.filter((id) => !['t1', 'c1'].includes(id));
    verifier(ajoutes.length === 1, 'un nouvel enfant attendu dans racine.enfants');
    const nouveau = doc.noeuds[ajoutes[0]];
    verifier(nouveau.composant === 'Bouton' && nouveau.parentId === 'racine', 'nœud Bouton avec parentId racine');
    await capture('03-s1-bouton-ajoute');
  });

  await scenario('S2 Modifier le libellé dans le panneau (JSON à chaque frappe)', async () => {
    await dansCanevas('b1').click();
    const champ = page.getByLabel('Libellé');
    await champ.fill('');
    await champ.pressSequentially('Confirmer', { delay: 10 });
    verifier((await json()).noeuds.b1.proprietes.libelle === 'Confirmer', 'libellé dans le JSON');
    verifier((await dansCanevas('b1').textContent()) === 'Confirmer', 'libellé dans le canevas');
    await capture('04-s2-proprietes');
  });

  await scenario('S3 Modifier un libellé dans le JSON puis Appliquer', async () => {
    await editerJson((t) => t.replace('"Confirmer"', '"Envoyer"'));
    verifier((await dansCanevas('b1').textContent()) === 'Envoyer', 'canevas mis à jour');
    verifier((await page.locator('.arbre').textContent()).includes('Envoyer'), 'arbre mis à jour');
  });

  await scenario('S4 Ajouter un Texte à la main dans le JSON', async () => {
    await editerJson((t) => {
      const doc = JSON.parse(t);
      doc.noeuds.c1.enfants.push('t2');
      doc.noeuds.t2 = { id: 't2', composant: 'Texte', proprietes: { contenu: 'Écrit dans le JSON', taille: 'grand' }, parentId: 'c1', enfants: [] };
      return JSON.stringify(doc, null, 2);
    });
    verifier((await dansCanevas('t2').textContent()) === 'Écrit dans le JSON', 'nouveau texte visible');
    await capture('05-s4-ajout-par-json');
  });

  await scenario('S5a JSON qui viole le métamodèle : erreurs, document inchangé', async () => {
    const avant = await page.evaluate(() => localStorage.getItem('plateforme.document'));
    await editerJson((t) => {
      const doc = JSON.parse(t);
      doc.noeuds.t1.enfants = ['b1'];
      doc.noeuds.b2.proprietes.variante = 'fluo';
      return JSON.stringify(doc, null, 2);
    });
    const alerte = await page.getByRole('alert').textContent();
    verifier(alerte.includes('ENFANTS_INTERDITS') && alerte.includes('PROPRIETE_CHOIX_INVALIDE'), 'codes affichés');
    await capture('06-s5-erreurs-metamodele');
    const apres = await page.evaluate(() => localStorage.getItem('plateforme.document'));
    verifier(avant === apres, 'document enregistré inchangé');
    await page.getByRole('button', { name: 'Abandonner' }).click();
  });

  await scenario('S5b JSON syntaxiquement faux : message, document inchangé', async () => {
    const avant = await json();
    await editerJson((t) => t.replace(/,\s*"racineId"/, ' "racineId"'));
    verifier((await page.getByRole('alert').textContent()).includes('JSON invalide'), 'message de syntaxe');
    await capture('07-s5-erreur-syntaxe');
    await page.getByRole('button', { name: 'Abandonner' }).click();
    verifier(JSON.stringify(await json()) === JSON.stringify(avant), 'document inchangé');
  });

  await scenario('S6 Recharger la page : document conservé', async () => {
    const avant = await json();
    await page.reload();
    verifier(JSON.stringify(await json()) === JSON.stringify(avant), 'même document après rechargement');
  });

  await scenario('S7 Supprimer un Conteneur et tous ses descendants', async () => {
    await dansCanevas('c1').click({ position: { x: 3, y: 3 } });
    await page.getByRole('button', { name: 'Supprimer' }).click();
    const ids = Object.keys((await json()).noeuds);
    verifier(!['c1', 'b1', 'b2', 't2'].some((id) => ids.includes(id)), `descendants encore présents : ${ids}`);
    await capture('08-s7-suppression');
  });

  await scenario('Bonus Ctrl+Z restaure le Conteneur supprimé, Ctrl+Y le resupprime', async () => {
    await page.locator('h1').click();
    await page.keyboard.press('Control+z');
    verifier(Object.hasOwn((await json()).noeuds, 'c1'), 'c1 restauré');
    await page.keyboard.press('Control+y');
    verifier(!Object.hasOwn((await json()).noeuds, 'c1'), 'c1 supprimé à nouveau');
    await page.keyboard.press('Control+z');
  });

  await scenario('Démo : construire une interface uniquement à la souris', async () => {
    await page.getByRole('button', { name: 'Nouveau document' }).click();
    await page.getByRole('button', { name: '+ Texte' }).click();
    await page.getByLabel('Contenu').fill('Inscription');
    await page.getByLabel('Taille').selectOption('grand');
    await page.locator('.canevas').click({ position: { x: 5, y: 5 } });
    await page.getByRole('button', { name: '+ Conteneur' }).click();
    await page.getByLabel('Direction').selectOption('ligne');
    await page.getByLabel('Espacement (px)').fill('16');
    await page.getByRole('button', { name: '+ Bouton' }).click();
    await page.getByLabel('Libellé').fill('Créer mon compte');
    await page.getByRole('button', { name: '+ Bouton' }).click();
    await page.getByLabel('Libellé').fill('Plus tard');
    await page.getByLabel('Variante').selectOption('secondaire');
    const doc = await json();
    verifier(Object.keys(doc.noeuds).length === 5, '5 nœuds attendus');
    await capture('09-demo-construction-souris');
  });

  // --- Phase 3 : glisser-déposer RÉEL (souris) et déplacements ---
  const ligneArbre = (id) => page.locator(`[data-arbre-id="${id}"]`);
  async function chargerExemple() {
    await page.getByRole('button', { name: 'Charger l’exemple' }).click();
    await page.locator('.canevas').click({ position: { x: 5, y: 5 } });
  }
  /** Glisse `source` et relâche au point (fx, fy) de `cible`, en fractions de sa taille. */
  async function glisser(source, cible, fx = 0.5, fy = 0.5) {
    const boite = await cible.boundingBox();
    await source.dragTo(cible, { targetPosition: { x: boite.width * fx, y: boite.height * fy } });
  }
  /** Relâche dans la MARGE INTÉRIEURE gauche d'un conteneur : seul le conteneur est sous la souris. */
  async function glisserDansLaMarge(source, conteneur) {
    const boite = await conteneur.boundingBox();
    await source.dragTo(conteneur, { targetPosition: { x: 3, y: boite.height / 2 } });
  }

  await scenario('P3-1 Glisser « + Bouton » de la palette DANS un conteneur (sur sa marge intérieure)', async () => {
    await chargerExemple();
    await glisserDansLaMarge(page.getByRole('button', { name: '+ Bouton' }), dansCanevas('c1'));
    const doc = await json();
    verifier(doc.noeuds.c1.enfants.length === 3, `c1.enfants = ${doc.noeuds.c1.enfants}`);
    verifier(doc.noeuds[doc.noeuds.c1.enfants[2]].composant === 'Bouton', 'un Bouton ajouté à la fin de c1');
  });

  await scenario('P3-2 Glisser un élément du canevas vers un autre conteneur', async () => {
    await chargerExemple();
    await glisserDansLaMarge(dansCanevas('t1'), dansCanevas('c1'));
    const doc = await json();
    verifier(doc.noeuds.t1.parentId === 'c1', `t1.parentId = ${doc.noeuds.t1.parentId}`);
    verifier(JSON.stringify(doc.noeuds.racine.enfants) === '["c1"]', `racine.enfants = ${doc.noeuds.racine.enfants}`);
  });

  await scenario('P3-3 Dans un conteneur EN LIGNE : déposer à GAUCHE d’un bouton le place avant lui', async () => {
    await chargerExemple();
    await glisser(dansCanevas('b2'), dansCanevas('b1'), 0.15, 0.5);
    verifier(JSON.stringify((await json()).noeuds.c1.enfants) === '["b2","b1"]', 'b2 avant b1');
  });

  await scenario('P3-4 Dans l’ARBRE : déposer en bas d’une ligne place après', async () => {
    await chargerExemple();
    await glisser(ligneArbre('t1'), ligneArbre('b2'), 0.5, 0.85);
    const doc = await json();
    verifier(JSON.stringify(doc.noeuds.c1.enfants) === '["b1","b2","t1"]', `c1.enfants = ${doc.noeuds.c1.enfants}`);
  });

  await scenario('P3-5 Dépôt INTERDIT (un conteneur dans lui-même) : rien ne change', async () => {
    await chargerExemple();
    const avant = JSON.stringify(await json());
    await glisser(ligneArbre('c1'), ligneArbre('c1'), 0.5, 0.5);
    verifier(JSON.stringify(await json()) === avant, 'document inchangé');
  });

  await scenario('P3-6 Retour visuel pendant le glissement, puis Ctrl+Z annule le déplacement', async () => {
    await chargerExemple();
    const source = page.getByRole('button', { name: '+ Texte' });
    const cible = dansCanevas('c1');
    await source.hover();
    await page.mouse.down();
    // Au CENTRE de c1 se trouve un bouton (c1 est ajusté à son contenu) : on vise sa marge intérieure.
    const boite = await cible.boundingBox();
    await page.mouse.move(boite.x + 3, boite.y + boite.height / 2, { steps: 5 });
    await page.mouse.move(boite.x + 4, boite.y + boite.height / 2, { steps: 2 });
    verifier((await cible.getAttribute('class')).includes('depot-dedans'), 'indication « dedans » affichée');
    await capture('14-p3-glisser-retour-visuel');
    await page.mouse.up();
    verifier((await json()).noeuds.c1.enfants.length === 3, 'Texte déposé dans c1');
    await page.locator('h1').click();
    await page.keyboard.press('Control+z');
    verifier((await json()).noeuds.c1.enfants.length === 2, 'Ctrl+Z a annulé l’ajout');
  });

  await scenario('P3-7 « ↓ Descendre » puis « ↑ Monter »', async () => {
    await chargerExemple();
    await dansCanevas('t1').click();
    await page.getByRole('button', { name: '↓ Descendre' }).click();
    verifier(JSON.stringify((await json()).noeuds.racine.enfants) === '["c1","t1"]', 'descendu');
    await page.getByRole('button', { name: '↑ Monter' }).click();
    verifier(JSON.stringify((await json()).noeuds.racine.enfants) === '["t1","c1"]', 'remonté');
    await capture('15-p3-monter-descendre');
  });

  // --- Phase 4 : format d'échange imbriqué ---
  const panneauJson = () => page.getByLabel('Modèle pivot (JSON)', { exact: true });

  await scenario('P4-1 « Imbriqué » : le même document en poupées russes, téléchargeable', async () => {
    await chargerExemple();
    await page.getByRole('button', { name: 'Imbriqué' }).click();
    const imbrique = JSON.parse(await panneauJson().textContent());
    verifier(imbrique.format === 'pivot-imbrique', 'champ format');
    verifier(JSON.stringify(imbrique.racine.enfants[1].enfants.map((e) => e.id)) === '["b1","b2"]', 'boutons DANS c1');
    verifier(!(await panneauJson().textContent()).includes('parentId'), 'aucun parentId');
    const [telechargement] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Télécharger interface.imbrique.json' }).click(),
    ]);
    verifier(telechargement.suggestedFilename() === 'interface.imbrique.json', 'nom du fichier');
    const contenu = JSON.parse(readFileSync(await telechargement.path(), 'utf8'));
    verifier(JSON.stringify(contenu) === JSON.stringify(imbrique), 'contenu téléchargé = contenu affiché');
    await capture('16-p4-vue-imbriquee');
  });

  await scenario('P4-2 Coller un document imbriqué SANS identifiants : il remplace l’interface', async () => {
    await page.getByRole('button', { name: 'Modifier' }).click();
    await page.getByLabel('Modèle pivot (JSON) en édition').fill(
      JSON.stringify(
        {
          format: 'pivot-imbrique',
          versionMetamodele: 1,
          racine: {
            composant: 'Conteneur',
            proprietes: { direction: 'colonne', espacement: 12 },
            enfants: [
              { composant: 'Texte', proprietes: { contenu: 'Écrit en poupées russes', taille: 'grand' } },
              {
                composant: 'Conteneur',
                proprietes: { direction: 'ligne', espacement: 8 },
                enfants: [
                  { composant: 'Bouton', proprietes: { libelle: 'Oui' } },
                  { composant: 'Bouton', proprietes: { libelle: 'Non', variante: 'secondaire' } },
                ],
              },
            ],
          },
        },
        null,
        2,
      ),
    );
    await page.getByRole('button', { name: 'Appliquer' }).click();
    verifier((await page.locator('.canevas').textContent()).includes('Écrit en poupées russes'), 'texte visible');
    verifier((await page.locator('.canevas').getByRole('button', { name: 'Non' }).count()) === 1, 'bouton visible');
    const imbrique = JSON.parse(await panneauJson().textContent());
    verifier(imbrique.racine.id === 'n1' && imbrique.racine.enfants[1].enfants[1].id === 'n5', 'identifiants fabriqués n1…n5');
    await capture('17-p4-import-imbrique');
  });

  await scenario('P4-3 Document imbriqué invalide : refusé, et l’erreur dit OÙ', async () => {
    const avant = await page.evaluate(() => localStorage.getItem('plateforme.document'));
    await editerJson((t) => t.replace('"Non"', '42'));
    const alerte = await page.getByRole('alert').textContent();
    verifier(alerte.includes('PROPRIETE_TYPE_INVALIDE') && alerte.includes('racine.enfants[1].enfants[1]'), 'code et chemin');
    await capture('18-p4-erreur-avec-chemin');
    await page.getByRole('button', { name: 'Abandonner' }).click();
    verifier((await page.evaluate(() => localStorage.getItem('plateforme.document'))) === avant, 'document inchangé');
    await page.getByRole('button', { name: 'À plat' }).click();
    verifier((await json()).racineId === 'n1', 'retour au format à plat');
  });

  verifier(erreursConsole.length === 0, `erreurs dans la console : ${erreursConsole.join(' | ')}`);
} catch (e) {
  resultats.push(['❌', `arrêt : ${e.message}`]);
} finally {
  await navigateur.close();
  await new Promise((ok) => serveur.httpServer.close(ok));
}

for (const [etat, nom] of resultats) console.log(`${etat} ${nom}`);
if (erreursConsole.length > 0) console.log('Console :', erreursConsole);
console.log(`Captures : ${CAPTURES}`);
process.exit(resultats.some(([etat]) => etat === '❌') ? 1 : 0);
