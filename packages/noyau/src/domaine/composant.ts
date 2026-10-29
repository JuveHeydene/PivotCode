// Niveau M2 (métamodèle) : la description des composants disponibles.
// Un Noeud dit « je suis un Bouton dont le libellé est Valider » (M1) ;
// une DefinitionComposant dit « un Bouton a un libellé de type texte » (M2).

import type { ValeurPropriete } from './noeud';

export type TypePropriete = DefinitionPropriete['type'];

type BasePropriete = {
  readonly nom: string;
  /** Texte affiché dans le panneau de propriétés. */
  readonly libelle: string;
  /** Obligatoire = la clé doit être présente dans `proprietes`. */
  readonly obligatoire: boolean;
};

// Union discriminée par `type` : la valeur par défaut a forcément le bon type,
// et `choix` n'existe (et n'est obligatoire) que pour le type 'choix'.
export type DefinitionPropriete =
  | (BasePropriete & { readonly type: 'texte'; readonly defaut: string })
  | (BasePropriete & {
      readonly type: 'nombre';
      readonly defaut: number;
      /** Bornes facultatives, incluses. */
      readonly min?: number;
      readonly max?: number;
    })
  | (BasePropriete & { readonly type: 'booleen'; readonly defaut: boolean })
  | (BasePropriete & {
      readonly type: 'choix';
      readonly defaut: string;
      readonly choix: readonly string[];
    });

export type DefinitionComposant = {
  readonly nom: string;
  readonly libelle: string;
  readonly accepteEnfants: boolean;
  readonly proprietes: readonly DefinitionPropriete[];
};

/**
 * Registre des composants. Les définitions sont rangées dans des `Map` :
 * `trouver` et `trouverPropriete` sont en O(1).
 */
export class Catalogue {
  readonly #definitions: ReadonlyArray<DefinitionComposant>;
  readonly #parNom: ReadonlyMap<string, DefinitionComposant>;
  readonly #proprietes: ReadonlyMap<string, ReadonlyMap<string, DefinitionPropriete>>;

  constructor(definitions: readonly DefinitionComposant[]) {
    const parNom = new Map<string, DefinitionComposant>();
    const proprietes = new Map<string, ReadonlyMap<string, DefinitionPropriete>>();
    for (const definition of definitions) {
      if (parNom.has(definition.nom)) {
        throw new Error(`Catalogue : le composant « ${definition.nom} » est défini deux fois.`);
      }
      const parPropriete = new Map<string, DefinitionPropriete>();
      for (const propriete of definition.proprietes) {
        if (parPropriete.has(propriete.nom)) {
          throw new Error(`Catalogue : la propriété « ${definition.nom}.${propriete.nom} » est définie deux fois.`);
        } 
        const probleme = verifierValeur(propriete, propriete.defaut);
        if (probleme !== null) {
          throw new Error(`Catalogue : valeur par défaut de « ${definition.nom}.${propriete.nom} » : ${probleme}`);
        }
        parPropriete.set(propriete.nom, propriete);
      }
      parNom.set(definition.nom, definition);
      proprietes.set(definition.nom, parPropriete);
    }
    this.#definitions = [...definitions];
    this.#parNom = parNom;
    this.#proprietes = proprietes;
  }

  lister(): readonly DefinitionComposant[] {
    return this.#definitions;
  }

  trouver(nom: string): DefinitionComposant | undefined {
    return this.#parNom.get(nom);
  }

  trouverPropriete(composant: string, propriete: string): DefinitionPropriete | undefined {
    return this.#proprietes.get(composant)?.get(propriete);
  }
}

/** Renvoie `null` si la valeur convient à la définition, sinon la raison du refus. */
export function verifierValeur(definition: DefinitionPropriete, valeur: unknown): string | null {
  switch (definition.type) {
    case 'texte':
      return typeof valeur === 'string' ? null : 'un texte est attendu';
    case 'nombre':
      // NaN et Infinity sont exclus : JSON.stringify les transformerait en null.
      if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return 'un nombre fini est attendu';
      if (definition.min !== undefined && valeur < definition.min) return `la valeur minimale est ${definition.min}`;
      if (definition.max !== undefined && valeur > definition.max) return `la valeur maximale est ${definition.max}`;
      return null;
    case 'booleen':
      return typeof valeur === 'boolean' ? null : 'un booléen (true ou false) est attendu';
    case 'choix':
      if (typeof valeur !== 'string') return 'un texte est attendu';
      return definition.choix.includes(valeur)
        ? null
        : `valeur non permise (choix possibles : ${definition.choix.join(', ')})`;
  }
}

/** Les valeurs par défaut d'un composant, utilisées à la création d'un nœud. */
export function valeursParDefaut(definition: DefinitionComposant): Record<string, ValeurPropriete> {
  const valeurs: Record<string, ValeurPropriete> = {};
  for (const propriete of definition.proprietes) {
    valeurs[propriete.nom] = propriete.defaut;
  }
  return valeurs;
}
