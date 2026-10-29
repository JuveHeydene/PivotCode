// @plateforme/rendu-web : les règles de correspondance « modèle pivot → web »,
// communes au canevas de l'éditeur et à tous les générateurs web (React, Vue…).
export type { Balise, StyleWeb, ElementWeb, NoeudWeb } from './element-web';
export { PALETTE, POLICE, CSS_DE_BASE } from './palette';
export { aUneRegle, decrireNoeud } from './regles';
export { arbreWeb, ErreurRendu } from './arbre-web';
export type { OptionsArbre } from './arbre-web';
export { versNomCss, styleEnLigne, nomDePaquet, echapperHtml } from './css';
export { documentDemonstration } from './document-demonstration';
