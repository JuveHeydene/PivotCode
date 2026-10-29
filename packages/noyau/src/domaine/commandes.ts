// Les commandes sont des DONNÉES (décision D3) : un objet JSON qui décrit une
// intention. `appliquerCommande` est une fonction pure : elle ne modifie jamais
// le document reçu et renvoie un NOUVEAU document (décision D7).
//
// Copie superficielle : seuls les objets sur le chemin du changement sont
// recréés (le nœud touché, son parent, la table `noeuds`, le document).
// Tous les autres nœuds sont PARTAGÉS entre l'ancien et le nouveau document.

import type { Catalogue } from './composant';
import { valeursParDefaut, verifierValeur } from './composant';
import type { ErreurModele } from './erreur';
import { erreur } from './erreur';
import type { DocumentPivot, Noeud, NoeudId, ValeurPropriete } from './noeud';
import { estDansSousArbre, trouverNoeud } from './noeud';
import { copierDocumentValide, validerDocument } from './validation';

export type Commande =
  | { readonly type: 'ajouter-noeud'; readonly parentId: NoeudId; readonly composant: string; readonly position?: number }
  | { readonly type: 'supprimer-noeud'; readonly id: NoeudId }
  | {
      readonly type: 'deplacer-noeud';
      readonly id: NoeudId;
      readonly nouveauParentId: NoeudId;
      /** Position parmi les enfants du nouveau parent, comptée APRÈS le retrait du nœud. Absente = à la fin. */
      readonly position?: number;
    }
  | { readonly type: 'modifier-propriete'; readonly id: NoeudId; readonly nom: string; readonly valeur: ValeurPropriete }
  | { readonly type: 'remplacer-document'; readonly document: unknown };

export type Evenement =
  | { readonly type: 'noeud-ajoute'; readonly id: NoeudId; readonly parentId: NoeudId }
  | { readonly type: 'noeud-supprime'; readonly id: NoeudId }
  | { readonly type: 'noeud-deplace'; readonly id: NoeudId; readonly ancienParentId: NoeudId; readonly nouveauParentId: NoeudId }
  | { readonly type: 'propriete-modifiee'; readonly id: NoeudId; readonly nom: string }
  | { readonly type: 'document-remplace' };

/** Union discriminée par `succes` : TypeScript sait quels champs existent. */
export type ResultatCommande =
  | { readonly succes: true; readonly document: DocumentPivot; readonly evenements: readonly Evenement[] }
  | { readonly succes: false; readonly erreurs: readonly ErreurModele[] };

function echec(...erreurs: ErreurModele[]): ResultatCommande {
  return { succes: false, erreurs };
}

export function appliquerCommande(
  document: DocumentPivot,
  commande: Commande,
  catalogue: Catalogue,
  nouvelId: () => NoeudId,
): ResultatCommande {
  switch (commande.type) {
    case 'ajouter-noeud':
      return ajouterNoeud(document, commande, catalogue, nouvelId);
    case 'supprimer-noeud':
      return supprimerNoeud(document, commande);
    case 'deplacer-noeud':
      return deplacerNoeud(document, commande, catalogue);
    case 'modifier-propriete':
      return modifierPropriete(document, commande, catalogue);
    case 'remplacer-document':
      return remplacerDocument(commande, catalogue);
  }
}

function ajouterNoeud(
  document: DocumentPivot,
  { parentId, composant, position }: Extract<Commande, { type: 'ajouter-noeud' }>,
  catalogue: Catalogue,
  nouvelId: () => NoeudId,
): ResultatCommande {
  const parent = trouverNoeud(document, parentId);
  if (parent === undefined) {
    return echec(erreur('NOEUD_INTROUVABLE', `Le parent « ${parentId} » n'existe pas.`, parentId));
  }
  const definitionParent = catalogue.trouver(parent.composant);
  if (definitionParent === undefined || !definitionParent.accepteEnfants) {
    return echec(erreur('ENFANTS_INTERDITS', `Le composant ${parent.composant} n'accepte pas d'enfants.`, parentId));
  }
  const definition = catalogue.trouver(composant);
  if (definition === undefined) {
    return echec(erreur('COMPOSANT_INCONNU', `Le composant « ${composant} » n'existe pas dans le catalogue.`));
  }
  const id = nouvelId();
  if (Object.hasOwn(document.noeuds, id)) {
    return echec(erreur('IDENTIFIANT_DEJA_UTILISE', `L'identifiant « ${id} » est déjà utilisé.`, id));
  }

  // Position ramenée dans [0, nombre d'enfants] ; absente = à la fin.
  const index = borner(position, parent.enfants.length);
  const enfants = [...parent.enfants.slice(0, index), id, ...parent.enfants.slice(index)];

  const nouveau: Noeud = { id, composant, proprietes: valeursParDefaut(definition), parentId, enfants: [] };
  return {
    succes: true,
    document: {
      ...document,
      noeuds: { ...document.noeuds, [parentId]: { ...parent, enfants }, [id]: nouveau },
    },
    evenements: [{ type: 'noeud-ajoute', id, parentId }],
  };
}

function supprimerNoeud(
  document: DocumentPivot,
  { id }: Extract<Commande, { type: 'supprimer-noeud' }>,
): ResultatCommande {
  const noeud = trouverNoeud(document, id);
  if (noeud === undefined) {
    return echec(erreur('NOEUD_INTROUVABLE', `Le nœud « ${id} » n'existe pas.`, id));
  }
  if (id === document.racineId || noeud.parentId === null) {
    return echec(erreur('SUPPRESSION_RACINE', 'La racine du document ne peut pas être supprimée.', id));
  }
  const parent = trouverNoeud(document, noeud.parentId);
  if (parent === undefined) {
    return echec(erreur('NOEUD_INTROUVABLE', `Le parent « ${noeud.parentId} » n'existe pas.`, noeud.parentId));
  }

  // Collecte du sous-arbre avec une pile (parcours en profondeur) : O(taille du sous-arbre).
  const aSupprimer = new Set<NoeudId>();
  const pile: NoeudId[] = [id];
  while (pile.length > 0) {
    const courant = pile.pop() as NoeudId;
    aSupprimer.add(courant);
    for (const enfantId of trouverNoeud(document, courant)?.enfants ?? []) pile.push(enfantId);
  }

  // Nouvelle table sans le sous-arbre : O(n). Object.fromEntries crée des clés propres.
  const noeuds = {
    ...Object.fromEntries(Object.entries(document.noeuds).filter(([cle]) => !aSupprimer.has(cle))),
    [parent.id]: { ...parent, enfants: parent.enfants.filter((enfantId) => enfantId !== id) },
  };

  return {
    succes: true,
    document: { ...document, noeuds },
    evenements: [...aSupprimer].map((supprime) => ({ type: 'noeud-supprime', id: supprime })),
  };
}

/** Position ramenée dans [0, n] ; absente ou non finie = n (à la fin). */
function borner(position: number | undefined, n: number): number {
  return position === undefined || !Number.isFinite(position) ? n : Math.min(Math.max(0, Math.trunc(position)), n);
}

function deplacerNoeud(
  document: DocumentPivot,
  { id, nouveauParentId, position }: Extract<Commande, { type: 'deplacer-noeud' }>,
  catalogue: Catalogue,
): ResultatCommande {
  const noeud = trouverNoeud(document, id);
  if (noeud === undefined) {
    return echec(erreur('NOEUD_INTROUVABLE', `Le nœud « ${id} » n'existe pas.`, id));
  }
  if (id === document.racineId || noeud.parentId === null) {
    return echec(erreur('RACINE_IMMOBILE', 'La racine du document ne peut pas être déplacée.', id));
  }
  const ancienParent = trouverNoeud(document, noeud.parentId);
  const nouveauParent = trouverNoeud(document, nouveauParentId);
  if (ancienParent === undefined || nouveauParent === undefined) {
    return echec(erreur('NOEUD_INTROUVABLE', `Le parent « ${nouveauParentId} » n'existe pas.`, nouveauParentId));
  }
  if (!catalogue.trouver(nouveauParent.composant)?.accepteEnfants) {
    return echec(erreur('ENFANTS_INTERDITS', `Le composant ${nouveauParent.composant} n'accepte pas d'enfants.`, nouveauParentId));
  }
  // Interdit : déplacer un nœud dans lui-même ou dans un de ses descendants (cycle).
  if (estDansSousArbre(document, id, nouveauParentId)) {
    return echec(
      erreur('DEPLACEMENT_CYCLIQUE', 'Un élément ne peut pas être déplacé dans lui-même ni dans un de ses descendants.', id),
    );
  }

  const memeParent = ancienParent.id === nouveauParent.id;
  const ancienIndex = ancienParent.enfants.indexOf(id);
  const sansLeNoeud = ancienParent.enfants.filter((enfantId) => enfantId !== id);
  const base = memeParent ? sansLeNoeud : nouveauParent.enfants;
  const index = borner(position, base.length);
  // Rien ne change : on renvoie LE MÊME document, sans événement (comme D18).
  if (memeParent && index === ancienIndex) return { succes: true, document, evenements: [] };

  const enfants = [...base.slice(0, index), id, ...base.slice(index)];
  const noeuds = memeParent
    ? { ...document.noeuds, [ancienParent.id]: { ...ancienParent, enfants } }
    : {
        ...document.noeuds,
        [ancienParent.id]: { ...ancienParent, enfants: sansLeNoeud },
        [nouveauParent.id]: { ...nouveauParent, enfants },
        [id]: { ...noeud, parentId: nouveauParent.id },
      };
  return {
    succes: true,
    document: { ...document, noeuds },
    evenements: [{ type: 'noeud-deplace', id, ancienParentId: ancienParent.id, nouveauParentId: nouveauParent.id }],
  };
}

function modifierPropriete(
  document: DocumentPivot,
  { id, nom, valeur }: Extract<Commande, { type: 'modifier-propriete' }>,
  catalogue: Catalogue,
): ResultatCommande {
  const noeud = trouverNoeud(document, id);
  if (noeud === undefined) {
    return echec(erreur('NOEUD_INTROUVABLE', `Le nœud « ${id} » n'existe pas.`, id));
  }
  const definition = catalogue.trouverPropriete(noeud.composant, nom);
  if (definition === undefined) {
    return echec(erreur('PROPRIETE_INCONNUE', `${noeud.composant} : la propriété « ${nom} » n'existe pas.`, id));
  }
  const probleme = verifierValeur(definition, valeur);
  if (probleme !== null) {
    const code = definition.type === 'choix' && typeof valeur === 'string' ? 'PROPRIETE_CHOIX_INVALIDE' : 'PROPRIETE_TYPE_INVALIDE';
    return echec(erreur(code, `${noeud.composant}.${nom} : ${probleme}.`, id));
  }
  // Rien ne change : on renvoie LE MÊME document, sans événement.
  if (Object.hasOwn(noeud.proprietes, nom) && noeud.proprietes[nom] === valeur) {
    return { succes: true, document, evenements: [] };
  }

  const nouveau: Noeud = { ...noeud, proprietes: { ...noeud.proprietes, [nom]: valeur } };
  return {
    succes: true,
    document: { ...document, noeuds: { ...document.noeuds, [id]: nouveau } },
    evenements: [{ type: 'propriete-modifiee', id, nom }],
  };
}

function remplacerDocument(
  { document }: Extract<Commande, { type: 'remplacer-document' }>,
  catalogue: Catalogue,
): ResultatCommande {
  const erreurs = validerDocument(document, catalogue);
  if (erreurs.length > 0) return echec(...erreurs);
  return { succes: true, document: copierDocumentValide(document), evenements: [{ type: 'document-remplace' }] };
}
