// Document de DÉMONSTRATION : il utilise toutes les propriétés de mise en page et de style,
// et un texte « piège » pour vérifier l’échappement dans le code généré. Utilisé par les
// tests des générateurs, par le bouton « Charger la démo » de l’éditeur et par la recette.
import type { DocumentPivot } from '@plateforme/noyau';

export const documentDemonstration: DocumentPivot = {
  versionMetamodele: 1,
  racineId: 'page',
  noeuds: {
    page: {
      id: 'page',
      composant: 'Conteneur',
      proprietes: { direction: 'colonne', espacement: 16, alignement: 'etirer', margeInterne: 24, fond: 'clair', arrondi: 12, bordure: true },
      parentId: null,
      enfants: ['titre', 'piege', 'actions'],
    },
    titre: {
      id: 'titre',
      composant: 'Texte',
      proprietes: { contenu: 'Créer un compte', taille: 'grand', gras: true, couleur: 'primaire', alignementTexte: 'centre' },
      parentId: 'page',
      enfants: [],
    },
    piege: {
      id: 'piege',
      composant: 'Texte',
      proprietes: { contenu: 'Texte <b>piège</b> {{ x }} {y} & "guillemets"', taille: 'petit', couleur: 'gris' },
      parentId: 'page',
      enfants: [],
    },
    actions: {
      id: 'actions',
      composant: 'Conteneur',
      proprietes: { direction: 'ligne', espacement: 8, justification: 'fin', margeInterne: 0 },
      parentId: 'page',
      enfants: ['annuler', 'valider', 'bloque'],
    },
    annuler: {
      id: 'annuler',
      composant: 'Bouton',
      proprietes: { libelle: 'Plus tard', variante: 'secondaire', couleur: 'neutre' },
      parentId: 'actions',
      enfants: [],
    },
    valider: {
      id: 'valider',
      composant: 'Bouton',
      proprietes: { libelle: 'Créer mon compte', couleur: 'succes' },
      parentId: 'actions',
      enfants: [],
    },
    bloque: {
      id: 'bloque',
      composant: 'Bouton',
      proprietes: { libelle: 'Indisponible', couleur: 'danger', desactive: true },
      parentId: 'actions',
      enfants: [],
    },
  },
};
