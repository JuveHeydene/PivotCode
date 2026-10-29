import { describe, it, expect, beforeEach } from 'vitest';
import { appliquerCommande } from '../src/domaine/commandes';
import type { Commande, ResultatCommande } from '../src/domaine/commandes';
import { creerDocumentInitial } from '../src/domaine/document-initial';
import { Catalogue, composantsDeBase, validerDocument } from '../src/index';
import type { DocumentPivot } from '../src/index';
import { copieProfonde } from './doublures';
import { documentExemple } from './exemple';

const catalogue = new Catalogue(composantsDeBase);

let n = 0;
const nouvelId = () => `n${++n}`;
beforeEach(() => {
  n = 0;
});

/** Applique la commande en vérifiant les deux invariants communs à TOUTES les commandes. */
function appliquer(document: DocumentPivot, commande: Commande): ResultatCommande {
  const avant = copieProfonde(document);
  const resultat = appliquerCommande(document, commande, catalogue, nouvelId);
  // 1. Le document reçu n'a jamais été modifié (immuabilité).
  expect(document).toEqual(avant);
  // 2. Le document produit respecte toujours le métamodèle (filet de sécurité).
  if (resultat.succes) expect(validerDocument(resultat.document, catalogue)).toEqual([]);
  return resultat;
}

function reussi(resultat: ResultatCommande) {
  if (!resultat.succes) throw new Error(`Commande refusée : ${JSON.stringify(resultat.erreurs)}`);
  return resultat;
}

function codesErreur(resultat: ResultatCommande): string[] {
  return resultat.succes ? [] : resultat.erreurs.map((e) => e.code);
}

describe('creerDocumentInitial', () => {
  it('contient seulement une racine Conteneur avec ses valeurs par défaut', () => {
    const doc = creerDocumentInitial(catalogue, nouvelId);
    expect(doc).toEqual({
      versionMetamodele: 1,
      racineId: 'n1',
      noeuds: {
        n1: { id: 'n1', composant: 'Conteneur', proprietes: { direction: 'colonne', espacement: 8 }, parentId: null, enfants: [] },
      },
    });
    expect(validerDocument(doc, catalogue)).toEqual([]);
  });
});

describe('ajouter-noeud', () => {
  it('ajoute un nœud à la fin, avec les valeurs par défaut', () => {
    const { document, evenements } = reussi(appliquer(documentExemple, { type: 'ajouter-noeud', parentId: 'racine', composant: 'Bouton' }));
    expect(document.noeuds['n1']).toEqual({
      id: 'n1',
      composant: 'Bouton',
      proprietes: { libelle: 'Bouton', variante: 'principal', desactive: false },
      parentId: 'racine',
      enfants: [],
    });
    expect(document.noeuds['racine']?.enfants).toEqual(['t1', 'c1', 'n1']);
    expect(evenements).toEqual([{ type: 'noeud-ajoute', id: 'n1', parentId: 'racine' }]);
  });

  it('respecte la position demandée', () => {
    const { document } = reussi(appliquer(documentExemple, { type: 'ajouter-noeud', parentId: 'racine', composant: 'Texte', position: 1 }));
    expect(document.noeuds['racine']?.enfants).toEqual(['t1', 'n1', 'c1']);
  });

  it.each([
    [-5, ['n1', 't1', 'c1']],
    [99, ['t1', 'c1', 'n1']],
  ])('ramène une position hors limites (%d) dans les limites', (position, attendu) => {
    const { document } = reussi(appliquer(documentExemple, { type: 'ajouter-noeud', parentId: 'racine', composant: 'Texte', position }));
    expect(document.noeuds['racine']?.enfants).toEqual(attendu);
  });

  it('partage les nœuds non touchés avec l’ancien document (copie superficielle)', () => {
    const { document } = reussi(appliquer(documentExemple, { type: 'ajouter-noeud', parentId: 'racine', composant: 'Texte' }));
    expect(document.noeuds['b1']).toBe(documentExemple.noeuds.b1);
    expect(document.noeuds['racine']).not.toBe(documentExemple.noeuds.racine);
  });

  it('refuse un parent inexistant', () => {
    expect(codesErreur(appliquer(documentExemple, { type: 'ajouter-noeud', parentId: 'absent', composant: 'Texte' }))).toEqual(['NOEUD_INTROUVABLE']);
  });

  it('refuse un parent qui n’accepte pas d’enfants', () => {
    expect(codesErreur(appliquer(documentExemple, { type: 'ajouter-noeud', parentId: 'b1', composant: 'Texte' }))).toEqual(['ENFANTS_INTERDITS']);
  });

  it('refuse un composant inconnu', () => {
    expect(codesErreur(appliquer(documentExemple, { type: 'ajouter-noeud', parentId: 'racine', composant: 'Carrousel' }))).toEqual(['COMPOSANT_INCONNU']);
  });

  it('refuse un identifiant déjà utilisé', () => {
    const resultat = appliquerCommande(documentExemple, { type: 'ajouter-noeud', parentId: 'racine', composant: 'Texte' }, catalogue, () => 'b1');
    expect(codesErreur(resultat)).toEqual(['IDENTIFIANT_DEJA_UTILISE']);
  });
});

describe('supprimer-noeud', () => {
  it('supprime un nœud et le retire des enfants de son parent', () => {
    const { document, evenements } = reussi(appliquer(documentExemple, { type: 'supprimer-noeud', id: 't1' }));
    expect(document.noeuds['t1']).toBeUndefined();
    expect(document.noeuds['racine']?.enfants).toEqual(['c1']);
    expect(evenements).toEqual([{ type: 'noeud-supprime', id: 't1' }]);
  });

  it('supprime aussi tous les descendants', () => {
    const { document, evenements } = reussi(appliquer(documentExemple, { type: 'supprimer-noeud', id: 'c1' }));
    expect(Object.keys(document.noeuds).sort()).toEqual(['racine', 't1']);
    expect(evenements.map((e) => (e.type === 'noeud-supprime' ? e.id : '')).sort()).toEqual(['b1', 'b2', 'c1']);
  });

  it('refuse de supprimer la racine', () => {
    expect(codesErreur(appliquer(documentExemple, { type: 'supprimer-noeud', id: 'racine' }))).toEqual(['SUPPRESSION_RACINE']);
  });

  it('refuse un nœud inexistant', () => {
    expect(codesErreur(appliquer(documentExemple, { type: 'supprimer-noeud', id: 'absent' }))).toEqual(['NOEUD_INTROUVABLE']);
  });
});

describe('modifier-propriete', () => {
  it('modifie une propriété', () => {
    const { document, evenements } = reussi(appliquer(documentExemple, { type: 'modifier-propriete', id: 'b1', nom: 'libelle', valeur: 'Envoyer' }));
    expect(document.noeuds['b1']?.proprietes['libelle']).toBe('Envoyer');
    expect(evenements).toEqual([{ type: 'propriete-modifiee', id: 'b1', nom: 'libelle' }]);
  });

  it('ajoute une propriété facultative absente', () => {
    const { document } = reussi(appliquer(documentExemple, { type: 'modifier-propriete', id: 'b1', nom: 'desactive', valeur: true }));
    expect(document.noeuds['b1']?.proprietes['desactive']).toBe(true);
  });

  it('renvoie LE MÊME document si la valeur ne change pas', () => {
    const { document, evenements } = reussi(appliquer(documentExemple, { type: 'modifier-propriete', id: 'b1', nom: 'libelle', valeur: 'Valider' }));
    expect(document).toBe(documentExemple);
    expect(evenements).toEqual([]);
  });

  it.each<[string, Commande, string]>([
    ['nœud inexistant', { type: 'modifier-propriete', id: 'absent', nom: 'libelle', valeur: 'x' }, 'NOEUD_INTROUVABLE'],
    ['propriété inconnue', { type: 'modifier-propriete', id: 'b1', nom: 'couleur', valeur: 'rouge' }, 'PROPRIETE_INCONNUE'],
    ['mauvais type', { type: 'modifier-propriete', id: 'c1', nom: 'espacement', valeur: '8' }, 'PROPRIETE_TYPE_INVALIDE'],
    ['nombre non fini', { type: 'modifier-propriete', id: 'c1', nom: 'espacement', valeur: Number.NaN }, 'PROPRIETE_TYPE_INVALIDE'],
    ['choix non permis', { type: 'modifier-propriete', id: 'b1', nom: 'variante', valeur: 'danger' }, 'PROPRIETE_CHOIX_INVALIDE'],
  ])('refuse : %s', (_nom, commande, code) => {
    expect(codesErreur(appliquer(documentExemple, commande))).toEqual([code]);
  });
});

describe('remplacer-document', () => {
  it('remplace par un document valide', () => {
    const nouveau = copieProfonde(documentExemple);
    nouveau.noeuds.b1.proprietes.libelle = 'Envoyer';
    const { document, evenements } = reussi(appliquer(creerDocumentInitial(catalogue, nouvelId), { type: 'remplacer-document', document: nouveau }));
    expect(document).toEqual(nouveau);
    expect(evenements).toEqual([{ type: 'document-remplace' }]);
  });

  it('ne partage aucun objet avec le candidat reçu', () => {
    const candidat = copieProfonde(documentExemple);
    const { document } = reussi(appliquer(documentExemple, { type: 'remplacer-document', document: candidat }));
    candidat.noeuds.b1.proprietes.libelle = 'modifié après coup';
    expect(document.noeuds['b1']?.proprietes['libelle']).toBe('Valider');
  });

  it('ne garde que les champs du métamodèle', () => {
    const candidat = { ...copieProfonde(documentExemple), commentaire: 'champ en trop' };
    const { document } = reussi(appliquer(documentExemple, { type: 'remplacer-document', document: candidat }));
    expect(document).not.toHaveProperty('commentaire');
  });

  it('refuse un document invalide et renvoie toutes les erreurs de validation', () => {
    const candidat = copieProfonde(documentExemple) as unknown as { noeuds: { t1: { enfants: string[] } } };
    candidat.noeuds.t1.enfants = ['b1'];
    const codes = codesErreur(appliquer(documentExemple, { type: 'remplacer-document', document: candidat }));
    expect(codes).toContain('ENFANTS_INTERDITS');
    expect(codes.length).toBeGreaterThan(1);
  });

  it('refuse n’importe quoi sans planter', () => {
    expect(codesErreur(appliquer(documentExemple, { type: 'remplacer-document', document: 'pas un document' }))).toEqual(['FORME_INVALIDE']);
  });
});
