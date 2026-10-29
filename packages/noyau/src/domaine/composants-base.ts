import type { DefinitionComposant, DefinitionPropriete } from './composant';

// Ajouter un composant = ajouter une entrée ici. La palette, le panneau de
// propriétés et la validation s'adaptent sans modification. Pour qu'il
// s'affiche, il faut aussi une règle de rendu dans @plateforme/rendu-web.
//
// Phase 2 : propriétés de mise en page et de style, toutes FACULTATIVES pour
// que les documents de la phase 1 restent valides (versionMetamodele = 1).

/** Noms des couleurs de la palette fixe (les valeurs sont dans @plateforme/rendu-web). */
export const COULEURS = ['primaire', 'secondaire', 'succes', 'danger', 'neutre', 'gris', 'clair', 'blanc'] as const;

const marge: DefinitionPropriete = {
  nom: 'marge',
  libelle: 'Marge externe (px)',
  type: 'nombre',
  defaut: 0,
  min: 0,
  obligatoire: false,
};

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
      { nom: 'couleur', libelle: 'Couleur', type: 'choix', choix: COULEURS, defaut: 'neutre', obligatoire: false },
      { nom: 'gras', libelle: 'Gras', type: 'booleen', defaut: false, obligatoire: false },
      {
        nom: 'alignementTexte',
        libelle: 'Alignement du texte',
        type: 'choix',
        choix: ['gauche', 'centre', 'droite'],
        defaut: 'gauche',
        obligatoire: false,
      },
      marge,
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
      {
        nom: 'couleur',
        libelle: 'Couleur',
        type: 'choix',
        choix: ['primaire', 'secondaire', 'succes', 'danger', 'neutre'],
        defaut: 'primaire',
        obligatoire: false,
      },
      { nom: 'pleineLargeur', libelle: 'Pleine largeur', type: 'booleen', defaut: false, obligatoire: false },
      { nom: 'desactive', libelle: 'Désactivé', type: 'booleen', defaut: false, obligatoire: false },
      marge,
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
      { nom: 'espacement', libelle: 'Espacement (px)', type: 'nombre', defaut: 8, min: 0, obligatoire: false },
      {
        nom: 'alignement',
        libelle: 'Alignement des enfants',
        type: 'choix',
        choix: ['debut', 'centre', 'fin', 'etirer'],
        defaut: 'debut',
        obligatoire: false,
      },
      {
        nom: 'justification',
        libelle: 'Répartition des enfants',
        type: 'choix',
        choix: ['debut', 'centre', 'fin', 'espace'],
        defaut: 'debut',
        obligatoire: false,
      },
      { nom: 'margeInterne', libelle: 'Marge interne (px)', type: 'nombre', defaut: 8, min: 0, obligatoire: false },
      {
        nom: 'fond',
        libelle: 'Fond',
        type: 'choix',
        choix: ['aucun', ...COULEURS],
        defaut: 'aucun',
        obligatoire: false,
      },
      { nom: 'bordure', libelle: 'Bordure', type: 'booleen', defaut: false, obligatoire: false },
      { nom: 'arrondi', libelle: 'Arrondi (px)', type: 'nombre', defaut: 0, min: 0, obligatoire: false },
      marge,
    ],
  },
];
