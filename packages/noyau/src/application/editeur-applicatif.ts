import type { Commande, Evenement } from '../domaine/commandes';
import { appliquerCommande } from '../domaine/commandes';
import type { Catalogue, DefinitionComposant } from '../domaine/composant';
import { creerDocumentInitial } from '../domaine/document-initial';
import { erreur } from '../domaine/erreur';
import type { DocumentPivot } from '../domaine/noeud';
import { copierDocumentValide, validerDocument } from '../domaine/validation';
import type { DepotDocument } from './ports/depot-document';
import type { GenerateurIdentifiants } from './ports/generateur-identifiants';
import type { Ecouteur, ResultatExecution, ServiceEditeur } from './ports/service-editeur';

/** Nombre maximal de documents gardés dans chaque pile de l'historique. */
const TAILLE_HISTORIQUE = 100;

/**
 * Cas d'utilisation de l'édition. Ne connaît QUE des interfaces (ports) :
 * aucune technologie (React, localStorage, crypto…) n'apparaît ici.
 *
 * Patron Observateur : les écouteurs s'abonnent et sont prévenus après
 * chaque changement réussi du document.
 */
export class EditeurApplicatif implements ServiceEditeur {
  // Champs déclarés explicitement (erasableSyntaxOnly interdit constructor(private …)).
  readonly #catalogue: Catalogue;
  readonly #identifiants: GenerateurIdentifiants;
  readonly #depot: DepotDocument;
  readonly #ecouteurs = new Set<Ecouteur>();
  #document: DocumentPivot;
  // Historique : deux piles de documents. Grâce à l'immuabilité, chaque entrée
  // partage presque tous ses nœuds avec ses voisines : le coût mémoire est faible.
  #passe: DocumentPivot[] = [];
  #futur: DocumentPivot[] = []; 

  constructor(catalogue: Catalogue, identifiants: GenerateurIdentifiants, depot: DepotDocument) {
    this.#catalogue = catalogue;
    this.#identifiants = identifiants;
    this.#depot = depot;

    const charge = depot.charger();
    if (charge !== null && validerDocument(charge, catalogue).length === 0) {
      this.#document = copierDocumentValide(charge);
    } else {
      // Rien d'enregistré, ou contenu invalide : on repart d'un document neuf.
      this.#document = creerDocumentInitial(catalogue, () => identifiants.nouveau());
      depot.enregistrer(this.#document);
    }
  }

  lireDocument(): DocumentPivot {
    return this.#document;
  }

  lireCatalogue(): readonly DefinitionComposant[] {
    return this.#catalogue.lister();
  }

  executer(commande: Commande): ResultatExecution {
    const resultat = appliquerCommande(this.#document, commande, this.#catalogue, () => this.#identifiants.nouveau());
    if (!resultat.succes) return { succes: false, erreurs: resultat.erreurs };
    if (resultat.document !== this.#document) {
      this.#passe.push(this.#document);
      if (this.#passe.length > TAILLE_HISTORIQUE) this.#passe.shift();
      this.#futur = [];
      this.#changer(resultat.document, resultat.evenements);
    }
    return { succes: true, evenements: resultat.evenements };
  }

  annuler(): ResultatExecution {
    const precedent = this.#passe.pop();
    if (precedent === undefined) return { succes: false, erreurs: [erreur('HISTORIQUE_VIDE', 'Rien à annuler.')] };
    this.#futur.push(this.#document);
    return this.#restaurer(precedent);
  }

  retablir(): ResultatExecution {
    const suivant = this.#futur.pop();
    if (suivant === undefined) return { succes: false, erreurs: [erreur('HISTORIQUE_VIDE', 'Rien à rétablir.')] };
    this.#passe.push(this.#document);
    return this.#restaurer(suivant);
  }

  peutAnnuler(): boolean {
    return this.#passe.length > 0;
  }

  peutRetablir(): boolean {
    return this.#futur.length > 0;
  }

  abonner(ecouteur: Ecouteur): () => void {
    this.#ecouteurs.add(ecouteur);
    return () => {
      this.#ecouteurs.delete(ecouteur);
    };
  }

  #restaurer(document: DocumentPivot): ResultatExecution {
    const evenements: readonly Evenement[] = [{ type: 'document-remplace' }];
    this.#changer(document, evenements);
    return { succes: true, evenements };
  }

  #changer(document: DocumentPivot, evenements: readonly Evenement[]): void {
    this.#document = document;
    this.#depot.enregistrer(document);
    // Copie de l'ensemble : un écouteur peut se désabonner pendant la notification.
    for (const ecouteur of [...this.#ecouteurs]) ecouteur(evenements);
  }
}
