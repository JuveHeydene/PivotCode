// Les RÈGLES DE CORRESPONDANCE « composant du modèle → élément web ».
// Une règle par composant, rangées dans une table (patron Stratégie).
// Source UNIQUE pour le canevas et pour tous les générateurs web : la parité
// entre ce qu'on voit et ce qu'on exporte est garantie par construction.

import type { Catalogue, Noeud, ValeurPropriete } from '@plateforme/noyau';
import type { ElementWeb } from './element-web';
import { PALETTE } from './palette';

/** Lecture typée d'une propriété : valeur du nœud, sinon valeur par défaut du catalogue. */
class Lecteur {
  readonly #noeud: Noeud;
  readonly #catalogue: Catalogue;

  constructor(noeud: Noeud, catalogue: Catalogue) {
    this.#noeud = noeud;
    this.#catalogue = catalogue;
  }

  #valeur(nom: string): ValeurPropriete | undefined {
    if (Object.hasOwn(this.#noeud.proprietes, nom)) return this.#noeud.proprietes[nom];
    return this.#catalogue.trouverPropriete(this.#noeud.composant, nom)?.defaut;
  }

  texte(nom: string): string {
    const v = this.#valeur(nom);
    return typeof v === 'string' ? v : '';
  }

  nombre(nom: string): number {
    const v = this.#valeur(nom);
    return typeof v === 'number' ? v : 0;
  }

  booleen(nom: string): boolean {
    return this.#valeur(nom) === true;
  }
}

const px = (n: number): string => `${n}px`;
const couleur = (nom: string): string => PALETTE[nom] ?? PALETTE['neutre'] ?? '#000000';

const TAILLES: Readonly<Record<string, string>> = { petit: '0.85rem', moyen: '1rem', grand: '1.6rem' };
const ALIGNEMENT_TEXTE: Readonly<Record<string, string>> = { gauche: 'left', centre: 'center', droite: 'right' };
const ALIGNEMENT: Readonly<Record<string, string>> = { debut: 'flex-start', centre: 'center', fin: 'flex-end', etirer: 'stretch' };
const JUSTIFICATION: Readonly<Record<string, string>> = {
  debut: 'flex-start',
  centre: 'center',
  fin: 'flex-end',
  espace: 'space-between',
};

type Regle = (l: Lecteur) => ElementWeb;

const regles: Readonly<Record<string, Regle>> = {
  Texte: (l) => ({
    balise: 'p',
    texte: l.texte('contenu'),
    style: {
      margin: px(l.nombre('marge')),
      fontSize: TAILLES[l.texte('taille')] ?? '1rem',
      fontWeight: l.booleen('gras') ? '700' : '400',
      color: couleur(l.texte('couleur')),
      textAlign: ALIGNEMENT_TEXTE[l.texte('alignementTexte')] ?? 'left',
    },
  }),

  Bouton: (l) => {
    const c = couleur(l.texte('couleur'));
    const plein = l.texte('variante') !== 'secondaire';
    const desactive = l.booleen('desactive');
    return {
      balise: 'button',
      texte: l.texte('libelle'),
      desactive,
      style: {
        margin: px(l.nombre('marge')),
        padding: '6px 14px',
        fontFamily: 'inherit',
        fontSize: '1rem',
        lineHeight: '1.4',
        color: plein ? '#ffffff' : c,
        backgroundColor: plein ? c : '#ffffff',
        border: `1px solid ${c}`,
        borderRadius: '6px',
        cursor: desactive ? 'not-allowed' : 'pointer',
        ...(desactive ? { opacity: '0.45' } : {}),
        ...(l.booleen('pleineLargeur') ? { width: '100%' } : {}),
      },
    };
  },

  Conteneur: (l) => {
    const fond = l.texte('fond');
    const arrondi = l.nombre('arrondi');
    return {
      balise: 'div',
      style: {
        display: 'flex',
        flexDirection: l.texte('direction') === 'ligne' ? 'row' : 'column',
        gap: px(l.nombre('espacement')),
        alignItems: ALIGNEMENT[l.texte('alignement')] ?? 'flex-start',
        justifyContent: JUSTIFICATION[l.texte('justification')] ?? 'flex-start',
        padding: px(l.nombre('margeInterne')),
        margin: px(l.nombre('marge')),
        ...(fond !== 'aucun' && fond !== '' ? { backgroundColor: couleur(fond) } : {}),
        ...(l.booleen('bordure') ? { border: '1px solid #d8dce3' } : {}),
        ...(arrondi > 0 ? { borderRadius: px(arrondi) } : {}),
      },
    };
  },
};

/** Vrai si une règle de rendu web existe pour ce composant. */
export function aUneRegle(composant: string): boolean {
  return Object.hasOwn(regles, composant);
}

/** Traduit UN nœud en élément web, ou `null` si aucune règle n'existe pour son composant. */
export function decrireNoeud(noeud: Noeud, catalogue: Catalogue): ElementWeb | null {
  const regle = Object.hasOwn(regles, noeud.composant) ? regles[noeud.composant] : undefined;
  return regle === undefined ? null : regle(new Lecteur(noeud, catalogue));
}
