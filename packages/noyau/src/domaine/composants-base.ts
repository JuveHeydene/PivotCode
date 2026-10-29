import type { DefinitionComposant } from './composant';

// Ajouter un composant = ajouter une entrée ici. La palette, le panneau de
// propriétés et la validation s'adaptent sans modification.
export const composantsDeBase: readonly DefinitionComposant[] = [
  {
    nom: 'Texte',
    libelle: 'Texte',
    accepteEnfants: false,
    proprietes: [
      { nom: 'contenu', libelle: 'Contenu', type: 'texte', defaut: 'Nouveau texte', obligatoire: true },
      {
        nom: 'taille',
        libelle: 'Taille',
        type: 'choix',
        choix: ['petit', 'moyen', 'grand'],
        defaut: 'moyen',
        obligatoire: false,
      },
    ],
  },
  {
    nom: 'Bouton',
    libelle: 'Bouton',
    accepteEnfants: false,
    proprietes: [
      { nom: 'libelle', libelle: 'Libellé', type: 'texte', defaut: 'Bouton', obligatoire: true },
      {
        nom: 'variante',
        libelle: 'Variante',
        type: 'choix',
        choix: ['principal', 'secondaire'],
        defaut: 'principal',
        obligatoire: false,
      },
      { nom: 'desactive', libelle: 'Désactivé', type: 'booleen', defaut: false, obligatoire: false },
    ],
  },
  {
    nom: 'Conteneur',
    libelle: 'Conteneur',
    accepteEnfants: true,
    proprietes: [
      {
        nom: 'direction',
        libelle: 'Direction',
        type: 'choix',
        choix: ['colonne', 'ligne'],
        defaut: 'colonne',
        obligatoire: false,
      },
      { nom: 'espacement', libelle: 'Espacement (px)', type: 'nombre', defaut: 8, obligatoire: false },
    ],
  },
];
