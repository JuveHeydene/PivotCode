// TESTS PAR PROPRIÉTÉS (fast-check) : au lieu d'écrire quelques exemples à la main,
// on décrit une PROPRIÉTÉ qui doit être vraie pour TOUTES les entrées, et l'outil
// génère des centaines de cas aléatoires pour essayer de la mettre en défaut.
// En cas d'échec, fast-check RÉDUIT le contre-exemple au plus petit cas qui échoue.
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { appliquerCommande } from '../src/domaine/commandes';
import type { Commande } from '../src/domaine/commandes';
import { creerDocumentInitial } from '../src/domaine/document-initial';
import { Catalogue, composantsDeBase, validerDocument } from '../src/index';
import type { DocumentPivot, ValeurPropriete } from '../src/index';
import { copieProfonde } from './doublures';

const catalogue = new Catalogue(composantsDeBase);
const noms = catalogue.lister().map((d) => d.nom);

/**
 * Une « intention » abstraite, traduite en commande concrète au moment de l'appliquer :
 * les nombres choisissent un nœud ou une propriété parmi ceux qui EXISTENT à cet instant.
 * Ainsi, beaucoup de commandes sont valides (sinon on ne testerait que des refus).
 */
const intention = fc.oneof(
  { weight: 3, arbitrary: fc.record({ k: fc.constant('ajouter' as const), parent: fc.nat(), composant: fc.constantFrom(...noms), position: fc.option(fc.integer({ min: -2, max: 6 }), { nil: undefined }) }) },
  { weight: 1, arbitrary: fc.record({ k: fc.constant('supprimer' as const), cible: fc.nat() }) },
  { weight: 5, arbitrary: fc.record({ k: fc.constant('deplacer' as const), cible: fc.nat(), parent: fc.nat(), position: fc.option(fc.integer({ min: -2, max: 6 }), { nil: undefined }) }) },
  { weight: 1, arbitrary: fc.record({ k: fc.constant('modifier' as const), cible: fc.nat(), propriete: fc.nat(), valeur: fc.oneof(fc.string({ maxLength: 8 }), fc.integer({ min: -5, max: 40 }), fc.boolean(), fc.constantFrom('primaire', 'centre', 'ligne', 'grand')) }) },
  // Modification avec une valeur VALIDE pour le type de la propriété (sinon presque tout serait refusé).
  { weight: 2, arbitrary: fc.record({ k: fc.constant('modifierValide' as const), cible: fc.nat(), propriete: fc.nat(), choix: fc.nat(), texte: fc.string({ maxLength: 8 }), nombre: fc.integer({ min: 0, max: 40 }) }) },
);

/**
 * Document de départ RICHE, construit par des commandes (donc valide) : des conteneurs
 * imbriqués, pour que les déplacements (et les tentatives de cycle) soient fréquents.
 *   racine ─ A(Conteneur) ─ B(Conteneur) ─ C(Conteneur) ─ Texte
 *          ├ Bouton           └ Texte
 *          └ D(Conteneur) ─ Bouton
 */
function documentDeDepart(nouvelId: () => string): DocumentPivot {
  let doc = creerDocumentInitial(catalogue, nouvelId);
  const ajouter = (parentId: string, composant: string): string => {
    const r = appliquerCommande(doc, { type: 'ajouter-noeud', parentId, composant }, catalogue, nouvelId);
    if (!r.succes) throw new Error('départ invalide');
    doc = r.document;
    const e = r.evenements[0];
    return e?.type === 'noeud-ajoute' ? e.id : '';
  };
  const a = ajouter(doc.racineId, 'Conteneur');
  const b = ajouter(a, 'Conteneur');
  const c = ajouter(b, 'Conteneur');
  ajouter(c, 'Texte');
  ajouter(b, 'Texte');
  ajouter(doc.racineId, 'Bouton');
  const d = ajouter(doc.racineId, 'Conteneur');
  ajouter(d, 'Bouton');
  return doc;
}

/** Le type des valeurs produites par l'arbitraire `intention`. */
type Intention = typeof intention extends fc.Arbitrary<infer T> ? T : never;

function versCommande(doc: DocumentPivot, i: Intention): Commande {
  const ids = Object.keys(doc.noeuds);
  const choisir = (n: number) => ids[n % ids.length]!;
  // L'élément à déplacer ou à supprimer est pris hors de la racine (quand c'est possible),
  // sinon presque tous les essais seraient refusés et la propriété serait peu testée.
  const horsRacine = ids.filter((id) => id !== doc.racineId);
  const choisirHorsRacine = (n: number) => (horsRacine.length === 0 ? doc.racineId : horsRacine[n % horsRacine.length]!);
  switch (i.k) {
    case 'ajouter':
      return { type: 'ajouter-noeud', parentId: choisir(i.parent), composant: i.composant, ...(i.position === undefined ? {} : { position: i.position }) };
    case 'supprimer':
      return { type: 'supprimer-noeud', id: choisirHorsRacine(i.cible) };
    case 'deplacer':
      return { type: 'deplacer-noeud', id: choisirHorsRacine(i.cible), nouveauParentId: choisir(i.parent), ...(i.position === undefined ? {} : { position: i.position }) };
    case 'modifier': {
      const noeud = doc.noeuds[choisir(i.cible)]!;
      const props = catalogue.trouver(noeud.composant)!.proprietes;
      return { type: 'modifier-propriete', id: noeud.id, nom: props[i.propriete % props.length]!.nom, valeur: i.valeur as ValeurPropriete };
    }
    case 'modifierValide': {
      const noeud = doc.noeuds[choisir(i.cible)]!;
      const props = catalogue.trouver(noeud.composant)!.proprietes;
      const def = props[i.propriete % props.length]!;
      const valeur: ValeurPropriete =
        def.type === 'choix' ? def.choix[i.choix % def.choix.length]! : def.type === 'nombre' ? i.nombre : def.type === 'booleen' ? i.choix % 2 === 0 : i.texte;
      return { type: 'modifier-propriete', id: noeud.id, nom: def.nom, valeur };
    }
  }
}

describe('propriétés des commandes (tests par propriétés)', () => {
  it('quelle que soit la suite de commandes, le document reste VALIDE et l’original n’est JAMAIS modifié', () => {
    fc.assert(
      fc.property(fc.array(intention, { minLength: 5, maxLength: 60 }), (intentions) => {
        let n = 0;
        const nouvelId = () => `n${++n}`;
        let doc = documentDeDepart(nouvelId);
        for (const i of intentions) {
          const avant = copieProfonde(doc);
          const resultat = appliquerCommande(doc, versCommande(doc, i), catalogue, nouvelId);
          expect(doc).toEqual(avant); // immuabilité
          if (resultat.succes) {
            expect(validerDocument(resultat.document, catalogue)).toEqual([]); // validité
            doc = resultat.document;
          }
        }
      }),
      { numRuns: 300 },
    );
  });

  it('une commande refusée ne laisse aucune trace, une commande acceptée produit des événements ou rien', () => {
    fc.assert(
      fc.property(fc.array(intention, { minLength: 1, maxLength: 20 }), (intentions) => {
        let n = 0;
        const nouvelId = () => `n${++n}`;
        let doc = documentDeDepart(nouvelId);
        for (const i of intentions) {
          const resultat = appliquerCommande(doc, versCommande(doc, i), catalogue, nouvelId);
          if (!resultat.succes) {
            expect(resultat.erreurs.length).toBeGreaterThan(0);
          } else if (resultat.document === doc) {
            expect(resultat.evenements).toEqual([]); // sans effet ⇒ même objet, aucun événement
          } else {
            doc = resultat.document;
          }
        }
      }),
      { numRuns: 200 },
    );
  });
});
