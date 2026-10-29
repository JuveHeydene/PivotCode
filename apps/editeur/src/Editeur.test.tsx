// Tests d'intégration : la VRAIE interface React branchée sur le VRAI noyau,
// avec des adaptateurs de test (identifiants prévisibles, stockage en mémoire).
// Ils déroulent les scénarios d'acceptation S1 à S7 de l'étape 13.
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Catalogue, EditeurApplicatif, composantsDeBase } from '@plateforme/noyau';
import type { DepotDocument, DocumentPivot, GenerateurIdentifiants } from '@plateforme/noyau';
import { Editeur } from './Editeur';
import { documentExemple } from './outils-editeur';

class GenerateurSequentiel implements GenerateurIdentifiants {
  #n = 0;
  nouveau() {
    return `n${++this.#n}`;
  }
}

class DepotMemoire implements DepotDocument {
  contenu: unknown;
  constructor(contenu: unknown = null) {
    this.contenu = contenu;
  }
  charger() {
    return this.contenu;
  }
  enregistrer(document: DocumentPivot) {
    // Comme localStorage : on garde une COPIE sérialisée.
    this.contenu = JSON.parse(JSON.stringify(document));
  }
}

const catalogue = new Catalogue(composantsDeBase);

function monter(contenu: unknown = JSON.parse(JSON.stringify(documentExemple))) {
  const depot = new DepotMemoire(contenu);
  const service = new EditeurApplicatif(catalogue, new GenerateurSequentiel(), depot);
  const utilisateur = userEvent.setup();
  const vue = render(<Editeur service={service} nouvelId={() => 'nouvelle-racine'} />);
  return { service, depot, utilisateur, vue };
}

/** Le document tel qu'affiché dans le panneau JSON (mode lecture). */
function jsonAffiche(): DocumentPivot {
  return JSON.parse(screen.getByLabelText('Modèle pivot (JSON)').textContent ?? '') as DocumentPivot;
}

function canevas(): HTMLElement {
  return document.querySelector('.canevas') as HTMLElement;
}

function elementCanevas(id: string): HTMLElement {
  return canevas().querySelector(`[data-noeud-id="${id}"]`) as HTMLElement;
}

afterEach(cleanup);

describe('Affichage initial', () => {
  it('le canevas, l’arbre et le JSON montrent le même document', () => {
    monter();
    expect(jsonAffiche()).toEqual(documentExemple);
    expect(within(canevas()).getByText('Bienvenue').tagName).toBe('P');
    expect(within(canevas()).getByRole('button', { name: 'Valider' })).toBeTruthy();
    const arbre = screen.getByRole('list', { name: 'Arbre des composants' });
    expect(within(arbre).getByText('« Annuler »', { exact: false })).toBeTruthy();
  });

  it('la palette est construite à partir du catalogue', () => {
    monter();
    expect(screen.getByRole('button', { name: '+ Texte' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '+ Bouton' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '+ Conteneur' })).toBeTruthy();
  });

  it('un conteneur en ligne est rendu en flex « row »', () => {
    monter();
    expect(elementCanevas('c1').style.flexDirection).toBe('row');
    expect(elementCanevas('racine').style.flexDirection).toBe('column');
  });
});

describe('Sens éditeur → modèle', () => {
  it('S1 — ajouter un Bouton dans la racine met à jour le JSON', async () => {
    const { utilisateur } = monter();
    await utilisateur.click(screen.getByRole('button', { name: '+ Bouton' }));
    const doc = jsonAffiche();
    expect(doc.noeuds['n1']).toMatchObject({ composant: 'Bouton', parentId: 'racine', enfants: [] });
    expect(doc.noeuds['racine']?.enfants).toEqual(['t1', 'c1', 'n1']);
    expect(elementCanevas('n1').textContent).toBe('Bouton');
  });

  it('S2 — modifier le libellé dans le panneau met à jour le JSON à chaque frappe', async () => {
    const { utilisateur } = monter();
    await utilisateur.click(elementCanevas('b1'));
    const champ = screen.getByLabelText(/Libellé/);
    await utilisateur.clear(champ);
    await utilisateur.type(champ, 'Env');
    expect(jsonAffiche().noeuds['b1']?.proprietes['libelle']).toBe('Env');
    expect(elementCanevas('b1').textContent).toBe('Env');
  });

  it('ajouter dans un conteneur sélectionné, puis le supprimer avec ses descendants (S7)', async () => {
    const { utilisateur } = monter();
    await utilisateur.click(screen.getByRole('button', { name: '+ Conteneur' })); // n1, sélectionné
    await utilisateur.click(screen.getByRole('button', { name: '+ Texte' })); // n2 dans n1, sélectionné
    await utilisateur.click(screen.getByRole('button', { name: '+ Texte' })); // n3 à côté de n2
    let doc = jsonAffiche();
    expect(doc.noeuds['n1']?.enfants).toEqual(['n2', 'n3']);
    expect(doc.noeuds['n3']?.parentId).toBe('n1');

    await utilisateur.click(elementCanevas('n1'));
    await utilisateur.click(screen.getByRole('button', { name: 'Supprimer' }));
    doc = jsonAffiche();
    expect(Object.keys(doc.noeuds).sort()).toEqual(['b1', 'b2', 'c1', 'racine', 't1']);
    expect(doc.noeuds['racine']?.enfants).toEqual(['t1', 'c1']);
  });

  it('le bouton Supprimer est désactivé pour la racine', async () => {
    const { utilisateur } = monter();
    await utilisateur.click(elementCanevas('racine'));
    expect((screen.getByRole('button', { name: 'Supprimer' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('le formulaire est généré : un select pour un choix, un nombre, une case à cocher', async () => {
    const { utilisateur } = monter();
    await utilisateur.click(elementCanevas('c1'));
    await utilisateur.selectOptions(screen.getByLabelText('Direction'), 'colonne');
    expect(jsonAffiche().noeuds['c1']?.proprietes['direction']).toBe('colonne');

    const espacement = screen.getByLabelText('Espacement (px)');
    await utilisateur.clear(espacement); // champ vide : aucune commande envoyée
    expect(jsonAffiche().noeuds['c1']?.proprietes['espacement']).toBe(8);
    await utilisateur.type(espacement, '24');
    expect(jsonAffiche().noeuds['c1']?.proprietes['espacement']).toBe(24);

    await utilisateur.click(elementCanevas('b2'));
    await utilisateur.click(screen.getByLabelText('Désactivé'));
    expect(jsonAffiche().noeuds['b2']?.proprietes['desactive']).toBe(true);
  });

  it('l’arbre et le canevas partagent la sélection', async () => {
    const { utilisateur } = monter();
    const arbre = screen.getByRole('list', { name: 'Arbre des composants' });
    await utilisateur.click(within(arbre).getByText('« Valider »', { exact: false }));
    expect(elementCanevas('b1').classList.contains('selectionne')).toBe(true);
    await utilisateur.click(elementCanevas('t1'));
    expect(within(arbre).getByText('« Bienvenue »', { exact: false }).closest('button')?.getAttribute('aria-current')).toBe('true');
  });
});

describe('Sens modèle → éditeur', () => {
  async function editerJson(utilisateur: ReturnType<typeof userEvent.setup>, transformer: (json: string) => string) {
    await utilisateur.click(screen.getByRole('button', { name: 'Modifier' }));
    const zone = screen.getByLabelText('Modèle pivot (JSON) en édition') as HTMLTextAreaElement;
    // fireEvent.change : userEvent.type interpréterait les accolades comme des touches spéciales.
    fireEvent.change(zone, { target: { value: transformer(zone.value) } });
    await utilisateur.click(screen.getByRole('button', { name: 'Appliquer' }));
  }

  it('S3 — modifier un libellé dans le JSON met à jour le canevas et l’arbre', async () => {
    const { utilisateur } = monter();
    await editerJson(utilisateur, (json) => json.replace('"Valider"', '"Envoyer"'));
    expect(elementCanevas('b1').textContent).toBe('Envoyer');
    expect(screen.getByRole('list', { name: 'Arbre des composants' }).textContent).toContain('Envoyer');
    expect(screen.queryByLabelText('Modèle pivot (JSON) en édition')).toBeNull(); // retour en lecture
  });

  it('S4 — ajouter un Texte à la main dans le JSON le fait apparaître dans le canevas', async () => {
    const { utilisateur } = monter();
    await editerJson(utilisateur, (json) => {
      const doc = JSON.parse(json) as { noeuds: Record<string, { enfants: string[] }> };
      doc.noeuds['racine']!.enfants.push('t2');
      (doc.noeuds as Record<string, unknown>)['t2'] = { id: 't2', composant: 'Texte', proprietes: { contenu: 'Ajouté à la main' }, parentId: 'racine', enfants: [] };
      return JSON.stringify(doc);
    });
    expect(elementCanevas('t2').textContent).toBe('Ajouté à la main');
  });

  it('S5a — une règle du métamodèle violée : erreurs affichées, document inchangé', async () => {
    const { utilisateur, service } = monter();
    const avant = service.lireDocument();
    await editerJson(utilisateur, (json) => {
      const doc = JSON.parse(json) as { noeuds: Record<string, { enfants: string[] }> };
      doc.noeuds['t1']!.enfants.push('b1');
      return JSON.stringify(doc);
    });
    const alerte = screen.getByRole('alert');
    expect(alerte.textContent).toContain('ENFANTS_INTERDITS');
    expect(service.lireDocument()).toBe(avant);
    expect(screen.getByLabelText('Modèle pivot (JSON) en édition')).toBeTruthy(); // reste en édition
  });

  it('S5b — une erreur de syntaxe JSON : message affiché, document inchangé', async () => {
    const { utilisateur, service } = monter();
    const avant = service.lireDocument();
    await editerJson(utilisateur, (json) => json.replace('"t1",', '"t1"'));
    expect(screen.getByRole('alert').textContent).toContain('JSON invalide');
    expect(service.lireDocument()).toBe(avant);
  });

  it('Abandonner le brouillon revient au mode lecture sans rien changer', async () => {
    const { utilisateur, service } = monter();
    const avant = service.lireDocument();
    await utilisateur.click(screen.getByRole('button', { name: 'Modifier' }));
    await utilisateur.click(screen.getByRole('button', { name: 'Abandonner' }));
    expect(service.lireDocument()).toBe(avant);
    expect(jsonAffiche()).toEqual(documentExemple);
  });
});

describe('Persistance et historique', () => {
  it('S6 — après « rechargement », le document est conservé', async () => {
    const { utilisateur, depot } = monter();
    await utilisateur.click(screen.getByRole('button', { name: '+ Bouton' }));
    cleanup();
    // Nouveau service sur le même dépôt = rechargement de la page.
    const service = new EditeurApplicatif(catalogue, new GenerateurSequentiel(), depot);
    render(<Editeur service={service} />);
    expect(jsonAffiche().noeuds['n1']?.composant).toBe('Bouton');
  });

  it('annuler / rétablir par boutons et par Ctrl+Z / Ctrl+Y', async () => {
    const { utilisateur } = monter();
    await utilisateur.click(screen.getByRole('button', { name: '+ Texte' }));
    expect(jsonAffiche().noeuds['n1']).toBeDefined();
    await utilisateur.click(screen.getByRole('button', { name: '↶ Annuler' }));
    expect(jsonAffiche().noeuds['n1']).toBeUndefined();
    await utilisateur.click(screen.getByRole('button', { name: '↷ Rétablir' }));
    expect(jsonAffiche().noeuds['n1']).toBeDefined();
    await utilisateur.keyboard('{Control>}z{/Control}');
    expect(jsonAffiche().noeuds['n1']).toBeUndefined();
    await utilisateur.keyboard('{Control>}y{/Control}');
    expect(jsonAffiche().noeuds['n1']).toBeDefined();
  });

  it('un document corrompu dans le stockage est ignoré au démarrage', () => {
    monter({ versionMetamodele: 1, racineId: 'x', noeuds: { x: 'cassé' } });
    expect(Object.keys(jsonAffiche().noeuds)).toEqual(['n1']);
  });

  it('« Nouveau document » et « Charger l’exemple » passent par la commande remplacer-document', async () => {
    const { utilisateur, service } = monter();
    await utilisateur.click(screen.getByRole('button', { name: 'Nouveau document' }));
    expect(Object.keys(jsonAffiche().noeuds)).toEqual(['nouvelle-racine']);
    await utilisateur.click(screen.getByRole('button', { name: 'Charger l’exemple' }));
    expect(jsonAffiche()).toEqual(documentExemple);
    expect(service.peutAnnuler()).toBe(true);
  });
});
