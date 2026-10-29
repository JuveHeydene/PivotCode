// Niveau M2 (métamodèle) : la FORME de tout document pivot.
// Un document concret (niveau M1) est une valeur de type DocumentPivot.
//
// Tous les champs sont `readonly` : le compilateur interdit de modifier un
// document en place (décision D7, document immuable).

export type NoeudId = string;

export type ValeurPropriete = string | number | boolean;

export type Noeud = {
  readonly id: NoeudId;
  /** Nom d'une DefinitionComposant du catalogue, ex. 'Bouton'. */
  readonly composant: string;
  readonly proprietes: Readonly<Record<string, ValeurPropriete>>;
  /** `null` uniquement pour la racine. */
  readonly parentId: NoeudId | null;
  /** Identifiants des enfants, dans l'ordre d'affichage. */
  readonly enfants: readonly NoeudId[];
};

export type DocumentPivot = { 
  /** Version de la forme du document : permettra les migrations futures. */
  readonly versionMetamodele: 1;
  readonly racineId: NoeudId;
  /** Table « à plat » identifiant → nœud (décision D8) : accès en O(1). */
  readonly noeuds: Readonly<Record<NoeudId, Noeud>>;
};

/** Accès sûr à un nœud : ignore les clés héritées comme `toString` ou `__proto__`. */
export function trouverNoeud(document: DocumentPivot, id: NoeudId): Noeud | undefined {
  return Object.hasOwn(document.noeuds, id) ? document.noeuds[id] : undefined;
}
