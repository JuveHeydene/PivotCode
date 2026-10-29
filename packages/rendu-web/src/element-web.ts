import type { NoeudId } from '@plateforme/noyau';

export type Balise = 'div' | 'p' | 'button';

/** Propriétés CSS en camelCase (fontSize) → valeur. L'ordre des clés est significatif (déterminisme). */
export type StyleWeb = Readonly<Record<string, string>>;

/**
 * Un nœud du modèle traduit en élément web, INDÉPENDAMMENT de React ou de Vue.
 * C'est la représentation intermédiaire commune aux cibles web.
 */
export type ElementWeb = {
  readonly balise: Balise;
  readonly style: StyleWeb;
  /** Texte affiché dans l'élément (déjà résolu, non échappé). */
  readonly texte?: string;
  /** Bouton désactivé : chaque consommateur choisit comment l'exprimer. */
  readonly desactive?: boolean;
};

export type NoeudWeb = ElementWeb & {
  readonly id: NoeudId;
  readonly composant: string;
  readonly enfants: readonly NoeudWeb[];
};
