// Adaptateur entrant : l'interface graphique. Elle LIT le document (useDocument)
// et ÉCRIT uniquement en envoyant des commandes au service (décision D2).
import { useEffect, useMemo, useState } from 'react';
import { Catalogue, trouverNoeud } from '@plateforme/noyau';
import type { Commande, ErreurModele, NoeudId, ServiceEditeur } from '@plateforme/noyau';
import { genererProjetReact } from '@plateforme/generateur-react';
import { genererProjetVue } from '@plateforme/generateur-vue';
import { documentDemonstration } from '@plateforme/rendu-web';
import { genererSchemaJson } from '@plateforme/schema-json';
import { telechargerFichier, telechargerZip } from './adaptateurs/telechargement';
import { useGlisserDeposer } from './glisser-deposer/use-glisser-deposer';
import type { FichierAExporter, Telecharger, TelechargerFichier } from './adaptateurs/telechargement';
import { useDocument } from './adaptateurs/use-document';
import { Arbre } from './composants/Arbre';
import { Canevas } from './composants/Canevas';
import { PanneauProprietes } from './composants/PanneauProprietes';
import { Palette } from './composants/Palette';
import { VueModelePivot } from './composants/VueModelePivot';
import { cibleAjout, documentExemple, documentVide, indexerCatalogue } from './outils-editeur';

type Props = {
  service: ServiceEditeur;
  /** Fabrique l'identifiant de la racine d'un document vide (injecté pour les tests). */
  nouvelId?: () => NoeudId;
  /** Adaptateur de téléchargement des projets exportés (injecté pour les tests). */
  telecharger?: Telecharger;
  /** Adaptateur de téléchargement d'un fichier unique : JSON Schema, modèle pivot (injecté pour les tests). */
  telechargerUnFichier?: TelechargerFichier;
};

/** Nom du dossier des projets exportés. */
const NOM_EXPORT = 'application-generee';

export function Editeur({
  service,
  nouvelId = () => crypto.randomUUID(),
  telecharger = telechargerZip,
  telechargerUnFichier = telechargerFichier,
}: Props) {
  const document = useDocument(service);
  const definitions = useMemo(() => service.lireCatalogue(), [service]);
  const index = useMemo(() => indexerCatalogue(definitions), [definitions]);
  // Les règles de rendu lisent les valeurs par défaut dans le catalogue (métamodèle).
  const catalogue = useMemo(() => new Catalogue(definitions), [definitions]);
  const [apercu, setApercu] = useState(false);

  // État DE L'ÉDITEUR, pas du modèle : la sélection et les messages ne sont
  // pas dans le document pivot (ils ne font pas partie de l'application conçue).
  const [selectionBrute, setSelection] = useState<NoeudId | null>(null);
  const [erreurs, setErreurs] = useState<readonly ErreurModele[]>([]);
  const [erreurExport, setErreurExport] = useState<string | null>(null);

  // Si le nœud sélectionné a disparu (suppression, annuler, JSON), plus de sélection.
  const selectionId = selectionBrute !== null && trouverNoeud(document, selectionBrute) ? selectionBrute : null;
  const selection = selectionId === null ? undefined : trouverNoeud(document, selectionId);

  function executer(commande: Commande) {
    const resultat = service.executer(commande);
    setErreurs(resultat.succes ? [] : resultat.erreurs);
    return resultat;
  }

  const glisser = useGlisserDeposer(document, index, executer, setSelection);

  // Monter / descendre : la même commande deplacer-noeud, dans le même parent.
  const parentSelection = selection?.parentId ? trouverNoeud(document, selection.parentId) : undefined;
  const rangSelection = selection && parentSelection ? parentSelection.enfants.indexOf(selection.id) : -1;
  function deplacerDe(decalage: number) {
    if (selection === undefined || parentSelection === undefined) return;
    executer({ type: 'deplacer-noeud', id: selection.id, nouveauParentId: parentSelection.id, position: rangSelection + decalage });
  }

  function ajouter(composant: string) {
    const resultat = executer({ type: 'ajouter-noeud', composant, ...cibleAjout(document, selectionId, index) });
    if (resultat.succes) {
      const ajout = resultat.evenements.find((e) => e.type === 'noeud-ajoute');
      if (ajout !== undefined) setSelection(ajout.id);
    }
  }

  // Les générateurs sont des fonctions pures : document → fichiers. Le téléchargement
  // est un détail du navigateur, délégué à l'adaptateur `telecharger`.
  function exporter(cible: 'react' | 'vue') {
    let fichiers: FichierAExporter[];
    try {
      fichiers =
        cible === 'react'
          ? genererProjetReact(document, catalogue, { nom: 'Application générée' })
          : genererProjetVue(document, catalogue, { nom: 'Application générée' });
    } catch (e) {
      setErreurExport(e instanceof Error ? e.message : String(e));
      return;
    }
    setErreurExport(null);
    telecharger(`${NOM_EXPORT}-${cible}`, fichiers);
  }

  function annuler() {
    setErreurs([]);
    service.annuler();
  }

  function retablir() {
    setErreurs([]);
    service.retablir();
  }

  // Raccourcis Ctrl+Z / Ctrl+Y (ou Ctrl+Maj+Z), sauf dans un champ de saisie
  // où ils gardent leur sens habituel (annuler la frappe).
  useEffect(() => {
    function surTouche(e: KeyboardEvent) {
      const cible = e.target as HTMLElement | null;
      if (cible?.closest('input, textarea, select') || !(e.ctrlKey || e.metaKey)) return;
      const touche = e.key.toLowerCase();
      if (touche === 'z' && !e.shiftKey) {
        e.preventDefault();
        service.annuler();
      } else if (touche === 'y' || (touche === 'z' && e.shiftKey)) {
        e.preventDefault();
        service.retablir();
      }
    }
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [service]);

  return (
    <div className="editeur">
      <header className="barre">
        <h1>Plateforme low-code — éditeur</h1>
        <div className="barre-actions">
          <button type="button" onClick={annuler} disabled={!service.peutAnnuler()} title="Ctrl+Z">
            ↶ Annuler
          </button>
          <button type="button" onClick={retablir} disabled={!service.peutRetablir()} title="Ctrl+Y">
            ↷ Rétablir
          </button>
          <button type="button" onClick={() => executer({ type: 'remplacer-document', document: documentExemple })}>
            Charger l’exemple
          </button>
          <button type="button" onClick={() => executer({ type: 'remplacer-document', document: documentVide(index, nouvelId()) })}>
            Nouveau document
          </button>
          <button type="button" onClick={() => executer({ type: 'remplacer-document', document: documentDemonstration })}>
            Charger la démo
          </button>
          <span className="separateur" aria-hidden="true" />
          <button type="button" className="principal" onClick={() => exporter('react')}>
            ⤓ Exporter React
          </button>
          <button type="button" className="principal" onClick={() => exporter('vue')}>
            ⤓ Exporter Vue
          </button>
          <button
            type="button"
            title="Le métamodèle au format standard JSON Schema, produit à partir du catalogue"
            onClick={() =>
              telechargerUnFichier(
                'document-pivot.v1.schema.json',
                `${JSON.stringify(genererSchemaJson(catalogue), null, 2)}\n`,
                'application/schema+json',
              )
            }
          >
            ⤓ JSON Schema
          </button>
        </div>
      </header>

      {(erreurExport !== null || erreurs.length > 0) && (
        <div className="messages">
          {erreurExport !== null && (
            <div className="erreurs" role="alert">
              <p>
                <code>EXPORT_IMPOSSIBLE</code> {erreurExport}
              </p>
            </div>
          )}
          {erreurs.length > 0 && (
            <div className="erreurs" role="alert">
              {erreurs.map((e, i) => (
                <p key={i}>
                  <code>{e.code}</code> {e.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <aside className="colonne gauche">
        <section>
          <h2>Palette</h2>
          <Palette definitions={definitions} onAjouter={ajouter} glisser={glisser} />
        </section>
        <section>
          <h2>Arbre</h2>
          <Arbre document={document} index={index} selectionId={selectionId} onSelectionner={setSelection} glisser={glisser} />
        </section>
      </aside>

      <main className="colonne centre">
        <div className="entete-canevas">
          <h2>Canevas</h2>
          <button type="button" aria-pressed={apercu} onClick={() => setApercu(!apercu)}>
            {apercu ? '✎ Revenir à l’édition' : '👁 Aperçu'}
          </button>
        </div>
        <Canevas
          document={document}
          catalogue={catalogue}
          selectionId={selectionId}
          onSelectionner={setSelection}
          apercu={apercu}
          glisser={apercu ? undefined : glisser}
        />
      </main>

      <aside className="colonne droite">
        <section>
          <h2>Propriétés</h2>
          {selection === undefined ? (
            <p className="indice">Sélectionne un élément dans le canevas ou dans l’arbre.</p>
          ) : (
            <PanneauProprietes
              noeud={selection}
              definition={index.get(selection.composant)}
              estRacine={selection.id === document.racineId}
              onModifier={(nom, valeur) => executer({ type: 'modifier-propriete', id: selection.id, nom, valeur })}
              onSupprimer={() => executer({ type: 'supprimer-noeud', id: selection.id })}
              onMonter={rangSelection > 0 ? () => deplacerDe(-1) : undefined}
              onDescendre={parentSelection && rangSelection < parentSelection.enfants.length - 1 ? () => deplacerDe(1) : undefined}
            />
          )}
        </section>
        <section className="section-json">
          <h2>Modèle pivot (JSON)</h2>
          <VueModelePivot
            document={document}
            service={service}
            catalogue={catalogue}
            onSelectionner={setSelection}
            telechargerUnFichier={telechargerUnFichier}
          />
        </section>
      </aside>
    </div>
  );
}
