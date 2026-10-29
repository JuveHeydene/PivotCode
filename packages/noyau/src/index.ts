// API publique du noyau : le SEUL point d'entrée (champ "exports" du package.json).
// `appliquerCommande` n'est volontairement pas exportée : l'extérieur passe par
// le port entrant ServiceEditeur.

export type { NoeudId, ValeurPropriete, Noeud, DocumentPivot } from './domaine/noeud';
export { trouverNoeud } from './domaine/noeud';
export type { TypePropriete, DefinitionPropriete, DefinitionComposant } from './domaine/composant';
export { Catalogue } from './domaine/composant';
export { composantsDeBase } from './domaine/composants-base';
export type { CodeErreur, ErreurModele } from './domaine/erreur';
export { validerDocument } from './domaine/validation';
export { COMPOSANT_RACINE } from './domaine/document-initial';
export type { Commande, Evenement } from './domaine/commandes';

export type { ServiceEditeur, ResultatExecution, Ecouteur } from './application/ports/service-editeur';
export type { GenerateurIdentifiants } from './application/ports/generateur-identifiants';
export type { DepotDocument } from './application/ports/depot-document';
export { EditeurApplicatif } from './application/editeur-applicatif';
