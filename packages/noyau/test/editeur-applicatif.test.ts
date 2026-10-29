import { describe, it, expect } from 'vitest';
import { Catalogue, EditeurApplicatif, composantsDeBase } from '../src/index';
import type { Evenement } from '../src/index';
import { DepotMemoire, GenerateurSequentiel, copieProfonde } from './doublures';
import { documentExemple } from './exemple';

const catalogue = new Catalogue(composantsDeBase);

function creerService(contenuDepot: unknown = null) {
  const depot = new DepotMemoire(contenuDepot);
  const service = new EditeurApplicatif(catalogue, new GenerateurSequentiel(), depot);
  const recus: Evenement[][] = [];
  service.abonner((evenements) => recus.push([...evenements]));
  return { service, depot, recus };
}

describe('EditeurApplicatif — démarrage', () => {
  it('avec un dépôt vide : une seule racine Conteneur, enregistrée', () => {
    const { service, depot } = creerService();
    const doc = service.lireDocument();
    expect(Object.keys(doc.noeuds)).toEqual(['n1']);
    expect(doc.noeuds['n1']?.composant).toBe('Conteneur');
    expect(depot.nombreEnregistrements).toBe(1);
  });

  it('avec un document valide dans le dépôt : il est repris', () => {
    const { service } = creerService(copieProfonde(documentExemple));
    expect(service.lireDocument()).toEqual(documentExemple);
  });

  it('avec un document INVALIDE dans le dépôt : repart du document initial sans planter', () => {
    const corrompu = copieProfonde(documentExemple) as unknown as { noeuds: { t1: { enfants: string[] } } };
    corrompu.noeuds.t1.enfants = ['b1'];
    const { service } = creerService(corrompu);
    expect(Object.keys(service.lireDocument().noeuds)).toEqual(['n1']);
  });

  it('expose le catalogue', () => {
    const { service } = creerService();
    expect(service.lireCatalogue().map((d) => d.nom)).toEqual(['Texte', 'Bouton', 'Conteneur']);
  });
});

describe('EditeurApplicatif — exécution des commandes', () => {
  it('commande réussie : document mis à jour, enregistré, abonnés prévenus', () => {
    const { service, depot, recus } = creerService();
    const racineId = service.lireDocument().racineId;
    const resultat = service.executer({ type: 'ajouter-noeud', parentId: racineId, composant: 'Bouton' });
    expect(resultat).toEqual({ succes: true, evenements: [{ type: 'noeud-ajoute', id: 'n2', parentId: racineId }] });
    expect(service.lireDocument().noeuds['n2']?.composant).toBe('Bouton');
    expect(depot.contenu).toBe(service.lireDocument());
    expect(depot.nombreEnregistrements).toBe(2);
    expect(recus).toEqual([[{ type: 'noeud-ajoute', id: 'n2', parentId: racineId }]]);
  });

  it('commande refusée : rien ne change, rien n’est enregistré, personne n’est prévenu', () => {
    const { service, depot, recus } = creerService();
    const avant = service.lireDocument();
    const resultat = service.executer({ type: 'supprimer-noeud', id: avant.racineId });
    expect(resultat.succes).toBe(false);
    expect(service.lireDocument()).toBe(avant);
    expect(depot.nombreEnregistrements).toBe(1);
    expect(recus).toEqual([]);
  });

  it('commande sans effet : ni enregistrement ni notification', () => {
    const { service, depot, recus } = creerService(copieProfonde(documentExemple));
    service.executer({ type: 'modifier-propriete', id: 'b1', nom: 'libelle', valeur: 'Valider' });
    expect(depot.nombreEnregistrements).toBe(0);
    expect(recus).toEqual([]);
  });

  it('après désabonnement, l’écouteur n’est plus appelé', () => {
    const { service } = creerService();
    let appels = 0;
    const desabonner = service.abonner(() => appels++);
    service.executer({ type: 'ajouter-noeud', parentId: service.lireDocument().racineId, composant: 'Texte' });
    desabonner();
    service.executer({ type: 'ajouter-noeud', parentId: service.lireDocument().racineId, composant: 'Texte' });
    expect(appels).toBe(1);
  });

  it('un écouteur peut se désabonner pendant une notification sans perturber les autres', () => {
    const { service } = creerService();
    const appels: string[] = [];
    const desabonnerA = service.abonner(() => {
      appels.push('A');
      desabonnerA();
    });
    service.abonner(() => appels.push('B'));
    service.executer({ type: 'ajouter-noeud', parentId: service.lireDocument().racineId, composant: 'Texte' });
    service.executer({ type: 'ajouter-noeud', parentId: service.lireDocument().racineId, composant: 'Texte' });
    expect(appels).toEqual(['A', 'B', 'B']);
  });

  it('lireDocument renvoie le MÊME objet tant que rien ne change, un AUTRE après (indispensable pour React)', () => {
    const { service } = creerService();
    const premier = service.lireDocument();
    expect(service.lireDocument()).toBe(premier);
    service.executer({ type: 'supprimer-noeud', id: 'absent' });
    expect(service.lireDocument()).toBe(premier);
    service.executer({ type: 'ajouter-noeud', parentId: premier.racineId, composant: 'Texte' });
    expect(service.lireDocument()).not.toBe(premier);
  });
});

describe('EditeurApplicatif — annuler / rétablir', () => {
  it('annule puis rétablit une commande', () => {
    const { service, recus } = creerService();
    const initial = service.lireDocument();
    expect(service.peutAnnuler()).toBe(false);
    service.executer({ type: 'ajouter-noeud', parentId: initial.racineId, composant: 'Texte' });
    const apres = service.lireDocument();
    expect(service.peutAnnuler()).toBe(true);

    expect(service.annuler().succes).toBe(true);
    expect(service.lireDocument()).toBe(initial);
    expect(service.peutRetablir()).toBe(true);

    expect(service.retablir().succes).toBe(true);
    expect(service.lireDocument()).toBe(apres);
    expect(recus.at(-1)).toEqual([{ type: 'document-remplace' }]);
  });

  it('une nouvelle commande efface le futur', () => {
    const { service } = creerService();
    const racineId = service.lireDocument().racineId;
    service.executer({ type: 'ajouter-noeud', parentId: racineId, composant: 'Texte' });
    service.annuler();
    service.executer({ type: 'ajouter-noeud', parentId: racineId, composant: 'Bouton' });
    expect(service.peutRetablir()).toBe(false);
  });

  it('refuse d’annuler quand l’historique est vide', () => {
    const { service } = creerService();
    const resultat = service.annuler();
    expect(resultat.succes).toBe(false);
    expect(resultat.succes ? [] : resultat.erreurs.map((e) => e.code)).toEqual(['HISTORIQUE_VIDE']);
  });

  it('une commande refusée ou sans effet n’entre pas dans l’historique', () => {
    const { service } = creerService(copieProfonde(documentExemple));
    service.executer({ type: 'supprimer-noeud', id: 'racine' });
    service.executer({ type: 'modifier-propriete', id: 'b1', nom: 'libelle', valeur: 'Valider' });
    expect(service.peutAnnuler()).toBe(false);
  });
});
