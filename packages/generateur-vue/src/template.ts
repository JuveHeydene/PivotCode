// Écriture du <template> Vue à partir de l'arbre web (transformation modèle → texte, M2T).
import { echapperHtml, styleEnLigne } from '@plateforme/rendu-web';
import type { NoeudWeb } from '@plateforme/rendu-web';

const INDENTATION = '  ';
const LARGEUR_MAX = 100;

/**
 * Texte d'un élément Vue : échappement HTML (& < > ") et des accolades, pour qu'un
 * texte comme « {{ x }} » ne soit jamais lu comme une interpolation Vue.
 */
export function texteVue(texte: string): string {
  return echapperHtml(texte).replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
}

function attributs(n: NoeudWeb): string[] {
  const liste: string[] = [];
  if (n.balise === 'button') liste.push('type="button"');
  if (n.desactive === true) liste.push('disabled');
  liste.push(`style="${echapperHtml(styleEnLigne(n.style))}"`);
  return liste;
}

/**
 * Les lignes du template pour un nœud et ses descendants.
 * Le texte reste TOUJOURS collé aux balises (>texte</p>) : avec des retours à la ligne
 * autour, Vue garderait des espaces en début et en fin de texte.
 */
export function lignesTemplate(n: NoeudWeb, niveau: number): string[] {
  const ind = INDENTATION.repeat(niveau);
  const texte = n.texte === undefined ? '' : texteVue(n.texte);
  const fermeture = `</${n.balise}>`;
  const surUneLigne = `${ind}<${n.balise} ${attributs(n).join(' ')}>`;
  const ouvranteTient = surUneLigne.length <= LARGEUR_MAX;

  if (n.enfants.length === 0) {
    const ligne = `${surUneLigne}${texte}${fermeture}`;
    if (ligne.length <= LARGEUR_MAX) return [ligne];
    return [`${ind}<${n.balise}`, ...attributs(n).map((a) => `${ind}${INDENTATION}${a}`), `${ind}>${texte}${fermeture}`];
  }

  const lignes = ouvranteTient
    ? [surUneLigne]
    : [`${ind}<${n.balise}`, ...attributs(n).map((a) => `${ind}${INDENTATION}${a}`), `${ind}>`];
  if (texte !== '') lignes.push(`${ind}${INDENTATION}${texte}`);
  for (const enfant of n.enfants) lignes.push(...lignesTemplate(enfant, niveau + 1));
  lignes.push(`${ind}${fermeture}`);
  return lignes;
}
