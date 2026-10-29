// Le document de l'étape 2, écrit à la main. `satisfies` fait vérifier sa
// FORME par le compilateur ; sa COHÉRENCE est vérifiée par validerDocument.
import type { DocumentPivot } from '../src/index';

export const documentExemple = {
  versionMetamodele: 1,
  racineId: 'racine',
  noeuds: {
    racine: {
      id: 'racine',
      composant: 'Conteneur',
      proprietes: { direction: 'colonne', espacement: 8 },
      parentId: null,
      enfants: ['t1', 'c1'],
    },
    t1: {
      id: 't1',
      composant: 'Texte',
      proprietes: { contenu: 'Bienvenue', taille: 'moyen' },
      parentId: 'racine',
      enfants: [],
    },
    c1: {
      id: 'c1',
      composant: 'Conteneur',
      proprietes: { direction: 'ligne', espacement: 8 },
      parentId: 'racine',
      enfants: ['b1', 'b2'],
    },
    b1: {
      id: 'b1',
      composant: 'Bouton',
      proprietes: { libelle: 'Valider', variante: 'principal' },
      parentId: 'c1',
      enfants: [],
    },
    b2: {
      id: 'b2',
      composant: 'Bouton',
      proprietes: { libelle: 'Annuler', variante: 'secondaire' },
      parentId: 'c1',
      enfants: [],
    },
  },
} satisfies DocumentPivot;



