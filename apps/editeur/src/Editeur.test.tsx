// Tests d'intégration : la VRAIE interface React branchée sur le VRAI noyau,
// avec des adaptateurs de test (identifiants prévisibles, stockage en mémoire).
// Ils déroulent les scénarios d'acceptation S1 à S7 de l'étape 13.
import { describe, it, expect, afterEach, vi } from 'vitest';
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
  const telecharger = vi.fn();
  const telechargerUnFichier = vi.fn();
  const vue = render(
    <Editeur service={service} nouvelId={() => 'nouvelle-racine'} telecharger={telecharger} telechargerUnFichier={telechargerUnFichier} />,
  );
  return { service, depot, utilisateur, vue, telecharger, telechargerUnFichier };
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

describe('Phase 2 — aperçu et export', () => {
  it('le mode aperçu retire les repères d’édition et désactive vraiment les boutons', async () => {
    const { utilisateur } = monter();
    await utilisateur.click(screen.getByRole('button', { name: 'Charger la démo' }));
    expect(elementCanevas('page').className).toContain('apercu');
    expect(elementCanevas('bloque').hasAttribute('disabled')).toBe(false); // édition : sélectionnable
    expect(elementCanevas('bloque').getAttribute('aria-disabled')).toBe('true');

    await utilisateur.click(screen.getByRole('button', { name: '👁 Aperçu' }));
    expect(elementCanevas('page').className).toBe('');
    expect(elementCanevas('bloque').hasAttribute('disabled')).toBe(true);
    await utilisateur.click(elementCanevas('titre'));
    expect(screen.getByText('Sélectionne un élément dans le canevas ou dans l’arbre.')).toBeTruthy(); // aucune sélection
  });

  it('le canevas applique les nouvelles propriétés de mise en page et de style', async () => {
    const { utilisateur } = monter();
    await utilisateur.click(screen.getByRole('button', { name: 'Charger la démo' }));
    const page = elementCanevas('page');
    expect(page.style.alignItems).toBe('stretch');
    expect(page.style.padding).toBe('24px');
    expect(page.style.borderRadius).toBe('12px');
    expect(elementCanevas('actions').style.justifyContent).toBe('flex-end');
    expect(elementCanevas('titre').style.fontWeight).toBe('700');
  });

  it('les nouvelles propriétés apparaissent dans le panneau, sans code d’interface dédié', async () => {
    const { utilisateur } = monter();
    await utilisateur.click(elementCanevas('c1'));
    await utilisateur.selectOptions(screen.getByLabelText('Alignement des enfants'), 'centre');
    await utilisateur.selectOptions(screen.getByLabelText('Fond'), 'clair');
    expect(jsonAffiche().noeuds['c1']?.proprietes).toMatchObject({ alignement: 'centre', fond: 'clair' });
    expect(elementCanevas('c1').style.alignItems).toBe('center');
  });

  it('« Exporter React » transmet un projet React complet à l’adaptateur de téléchargement', async () => {
    const { utilisateur, telecharger } = monter();
    await utilisateur.click(screen.getByRole('button', { name: '⤓ Exporter React' }));
    expect(telecharger).toHaveBeenCalledTimes(1);
    const [dossier, fichiers] = telecharger.mock.calls[0] as [string, { chemin: string; contenu: string }[]];
    expect(dossier).toBe('application-generee-react');
    const app = fichiers.find((f) => f.chemin === 'src/App.jsx')?.contenu ?? '';
    expect(app).toContain('Bienvenue');
    expect(app).toContain('Valider');
  });

  it('« Exporter Vue » transmet un projet Vue complet', async () => {
    const { utilisateur, telecharger } = monter();
    await utilisateur.click(screen.getByRole('button', { name: '⤓ Exporter Vue' }));
    const [dossier, fichiers] = telecharger.mock.calls[0] as [string, { chemin: string; contenu: string }[]];
    expect(dossier).toBe('application-generee-vue');
    expect(fichiers.map((f) => f.chemin)).toContain('src/App.vue');
  });
});

describe('Phase 3 — déplacer et glisser-déposer', () => {
  it('« Descendre » puis « Monter » réordonnent les frères', async () => {
    const { utilisateur } = monter();
    await utilisateur.click(elementCanevas('b1'));
    await utilisateur.click(screen.getByRole('button', { name: '↓ Descendre' }));
    expect(jsonAffiche().noeuds['c1']?.enfants).toEqual(['b2', 'b1']);
    expect((screen.getByRole('button', { name: '↓ Descendre' }) as HTMLButtonElement).disabled).toBe(true); // déjà dernier
    await utilisateur.click(screen.getByRole('button', { name: '↑ Monter' }));
    expect(jsonAffiche().noeuds['c1']?.enfants).toEqual(['b1', 'b2']);
  });

  it('glisser un composant de la palette DANS un conteneur du canevas', () => {
    monter();
    fireEvent.dragStart(screen.getByRole('button', { name: '+ Texte' }));
    fireEvent.dragOver(elementCanevas('c1'));
    expect(elementCanevas('c1').className).toContain('depot-dedans'); // retour visuel
    fireEvent.drop(elementCanevas('c1'));
    expect(jsonAffiche().noeuds['c1']?.enfants).toEqual(['b1', 'b2', 'n1']);
    expect(jsonAffiche().noeuds['n1']?.composant).toBe('Texte');
  });

  it('glisser un élément du canevas vers un autre conteneur', () => {
    monter();
    fireEvent.dragStart(elementCanevas('t1'));
    fireEvent.dragOver(elementCanevas('c1'));
    fireEvent.drop(elementCanevas('c1'));
    expect(jsonAffiche().noeuds['racine']?.enfants).toEqual(['c1']);
    expect(jsonAffiche().noeuds['c1']?.enfants).toEqual(['b1', 'b2', 't1']);
    expect(jsonAffiche().noeuds['t1']?.parentId).toBe('c1');
  });

  it('glisser dans l’ARBRE : après un frère', () => {
    monter();
    const ligne = (id: string) => document.querySelector(`[data-arbre-id="${id}"]`) as HTMLElement;
    fireEvent.dragStart(ligne('b1'));
    fireEvent.dragOver(ligne('b2')); // élément sans taille dans jsdom : « après »
    fireEvent.drop(ligne('b2'));
    expect(jsonAffiche().noeuds['c1']?.enfants).toEqual(['b2', 'b1']);
  });

  it('dépôt interdit (un conteneur dans lui-même) : aucun retour visuel, aucun changement', () => {
    const { service } = monter();
    const avant = service.lireDocument();
    fireEvent.dragStart(elementCanevas('c1'));
    fireEvent.dragOver(elementCanevas('c1'));
    expect(elementCanevas('c1').className).not.toContain('depot-');
    fireEvent.drop(elementCanevas('c1'));
    expect(service.lireDocument()).toBe(avant);
  });

  it('un déplacement s’annule avec Ctrl+Z, sans code spécial', async () => {
    const { utilisateur } = monter();
    fireEvent.dragStart(elementCanevas('t1'));
    fireEvent.dragOver(elementCanevas('c1'));
    fireEvent.drop(elementCanevas('c1'));
    await utilisateur.click(screen.getByRole('heading', { name: 'Plateforme low-code — éditeur' }));
    await utilisateur.keyboard('{Control>}z{/Control}');
    expect(jsonAffiche().noeuds['racine']?.enfants).toEqual(['t1', 'c1']);
  });

  it('la racine ne se glisse pas ; en aperçu, rien ne se glisse', async () => {
    const { utilisateur } = monter();
    expect(elementCanevas('racine').getAttribute('draggable')).toBe('false');
    expect(elementCanevas('c1').getAttribute('draggable')).toBe('true');
    await utilisateur.click(screen.getByRole('button', { name: '👁 Aperçu' }));
    expect(elementCanevas('c1').hasAttribute('draggable')).toBe(false);
  });
});

describe('Phase 3 — JSON Schema', () => {
  it('« ⤓ JSON Schema » télécharge le schéma produit à partir du catalogue', async () => {
    const { utilisateur, telechargerUnFichier } = monter();
    await utilisateur.click(screen.getByRole('button', { name: '⤓ JSON Schema' }));
    const [nom, contenu, type] = telechargerUnFichier.mock.calls[0] as [string, string, string];
    expect(nom).toBe('document-pivot.v1.schema.json');
    expect(type).toBe('application/schema+json');
    const schema = JSON.parse(contenu) as { $schema: string; $defs: Record<string, unknown> };
    expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(Object.keys(schema.$defs)).toContain('Bouton');
  });
});

describe('Phase 4 — format d’échange imbriqué', () => {
  it('« Imbriqué » affiche le même document en poupées russes ; « À plat » revient au format interne', async () => {
    const { utilisateur } = monter();
    await utilisateur.click(screen.getByRole('button', { name: 'Imbriqué' }));
    expect(screen.getByRole('button', { name: 'Imbriqué' }).getAttribute('aria-pressed')).toBe('true');
    const imbrique = JSON.parse(screen.getByLabelText('Modèle pivot (JSON)').textContent ?? '') as {
      format: string;
      racine: { id: string; enfants: { id: string; enfants?: { id: string }[] }[] };
    };
    expect(imbrique.format).toBe('pivot-imbrique');
    expect(imbrique.racine.enfants.map((e) => e.id)).toEqual(['t1', 'c1']);
    expect(imbrique.racine.enfants[1]!.enfants!.map((e) => e.id)).toEqual(['b1', 'b2']);
    expect(screen.getByLabelText('Modèle pivot (JSON)').textContent).not.toContain('parentId');
    await utilisateur.click(screen.getByRole('button', { name: 'À plat' }));
    expect(jsonAffiche()).toEqual(documentExemple);
  });

  it('⤓ télécharge le JSON dans le format affiché', async () => {
    const { utilisateur, telechargerUnFichier } = monter();
    await utilisateur.click(screen.getByRole('button', { name: 'Télécharger interface.pivot.json' }));
    await utilisateur.click(screen.getByRole('button', { name: 'Imbriqué' }));
    await utilisateur.click(screen.getByRole('button', { name: 'Télécharger interface.imbrique.json' }));
    const appels = telechargerUnFichier.mock.calls as [string, string, string][];
    expect(appels.map(([nom, , type]) => [nom, type])).toEqual([
      ['interface.pivot.json', 'application/json'],
      ['interface.imbrique.json', 'application/json'],
    ]);
    expect(JSON.parse(appels[0]![1])).toEqual(documentExemple);
    expect(JSON.parse(appels[1]![1])).toMatchObject({ format: 'pivot-imbrique', racine: { id: 'racine' } });
  });

  it('un document imbriqué SANS identifiants, collé dans l’éditeur JSON, remplace le document', async () => {
    const { utilisateur, service } = monter();
    await utilisateur.click(screen.getByRole('button', { name: 'Modifier' }));
    const imbrique = {
      format: 'pivot-imbrique',
      versionMetamodele: 1,
      racine: { composant: 'Conteneur', proprietes: {}, enfants: [{ composant: 'Bouton', proprietes: { libelle: 'Collé' } }] },
    };
    fireEvent.change(screen.getByLabelText('Modèle pivot (JSON) en édition'), { target: { value: JSON.stringify(imbrique) } });
    await utilisateur.click(screen.getByRole('button', { name: 'Appliquer' }));
    const doc = service.lireDocument();
    expect(Object.values(doc.noeuds).map((n) => n.composant).sort()).toEqual(['Bouton', 'Conteneur']);
    expect(screen.getByRole('button', { name: 'Collé' })).toBeTruthy();
    // Comme tout remplacement : annulable.
    await utilisateur.keyboard('{Control>}z{/Control}');
    expect(service.lireDocument()).toEqual(documentExemple);
  });

  it('un document imbriqué invalide est refusé, et l’erreur dit OÙ', async () => {
    const { utilisateur, service } = monter();
    await utilisateur.click(screen.getByRole('button', { name: 'Imbriqué' }));
    await utilisateur.click(screen.getByRole('button', { name: 'Modifier' }));
    const zone = screen.getByLabelText('Modèle pivot (JSON) en édition') as HTMLTextAreaElement;
    expect(JSON.parse(zone.value)).toMatchObject({ format: 'pivot-imbrique' }); // le brouillon suit le format affiché
    fireEvent.change(zone, { target: { value: zone.value.replace('"Bouton"', '"Carrousel"') } });
    await utilisateur.click(screen.getByRole('button', { name: 'Appliquer' }));
    const alerte = screen.getByRole('alert');
    expect(alerte.textContent).toContain('COMPOSANT_INCONNU');
    expect(alerte.textContent).toContain('racine.enfants[1].enfants[0]');
    expect(service.lireDocument()).toEqual(documentExemple);
  });
});
