// Écriture du JSX à partir de l'arbre web (transformation modèle → texte, M2T).
// Parcours récursif : chaque nœud produit ses lignes, puis celles de ses enfants.
import type { NoeudWeb, StyleWeb } from '@plateforme/rendu-web';

const INDENTATION = '  ';
/** Au-delà, une balise ouvrante est écrite sur plusieurs lignes (comme Prettier). */
const LARGEUR_MAX = 100;

/** Chaîne JavaScript entre apostrophes, échappée. */
export function chaineJs(valeur: string): string {
  return `'${valeur.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
}

/**
 * Texte d'un élément JSX. Écrit tel quel s'il est sans danger ; sinon sous forme
 * d'expression {"…"} : les caractères { } < > & seraient interprétés par JSX, et
 * les espaces en début ou en fin seraient supprimés.
 */
export function texteJsx(texte: string): string {
  const sansDanger = /^[^{}<>&\n\r]*$/.test(texte) && texte.trim() === texte && texte !== '';
  return sansDanger ? texte : `{${JSON.stringify(texte)}}`;
}

function attributsSimples(n: NoeudWeb): string[] {
  const attributs: string[] = [];
  if (n.balise === 'button') attributs.push('type="button"');
  if (n.desactive === true) attributs.push('disabled');
  return attributs;
}

function styleSurUneLigne(style: StyleWeb): string {
  const paires = Object.entries(style).map(([cle, valeur]) => `${cle}: ${chaineJs(valeur)}`);
  return `style={{ ${paires.join(', ')} }}`;
}

/** Les lignes JSX d'un nœud et de ses descendants, indentées au niveau donné. */
export function lignesJsx(n: NoeudWeb, niveau: number): string[] {
  const ind = INDENTATION.repeat(niveau);
  const fermeture = `</${n.balise}>`;
  const contenu = n.texte === undefined || n.texte === '' ? null : texteJsx(n.texte);
  const sansEnfant = n.enfants.length === 0;

  // 1. Tentative sur une seule ligne.
  const attributs = [...attributsSimples(n), styleSurUneLigne(n.style)].join(' ');
  const ouvrante = `<${n.balise} ${attributs}`;
  if (sansEnfant) {
    const ligne = contenu === null ? `${ind}${ouvrante} />` : `${ind}${ouvrante}>${contenu}${fermeture}`;
    if (ligne.length <= LARGEUR_MAX) return [ligne];
  }

  // 2. Balise ouvrante (une ligne si elle tient, sinon un attribut par ligne).
  const lignes: string[] = [];
  if (`${ind}${ouvrante}>`.length <= LARGEUR_MAX) {
    lignes.push(`${ind}${ouvrante}${sansEnfant && contenu === null ? ' />' : '>'}`);
  } else {
    const ind2 = ind + INDENTATION;
    lignes.push(`${ind}<${n.balise}`);
    for (const a of attributsSimples(n)) lignes.push(`${ind2}${a}`);
    lignes.push(`${ind2}style={{`);
    for (const [cle, valeur] of Object.entries(n.style)) lignes.push(`${ind2}${INDENTATION}${cle}: ${chaineJs(valeur)},`);
    lignes.push(`${ind2}}}`);
    lignes.push(sansEnfant && contenu === null ? `${ind}/>` : `${ind}>`);
  }
  if (sansEnfant && contenu === null) return lignes;

  // 3. Contenu : texte puis enfants, un niveau plus loin.
  if (contenu !== null) lignes.push(`${ind}${INDENTATION}${contenu}`);
  for (const enfant of n.enfants) lignes.push(...lignesJsx(enfant, niveau + 1));
  lignes.push(`${ind}${fermeture}`);
  return lignes;
}
