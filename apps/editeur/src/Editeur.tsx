// Adaptateur entrant : l'interface graphique. Elle LIT le document (useDocument)
// et ÉCRIT uniquement en envoyant des commandes au service (décision D2).
import { useEffect, useMemo, useState } from 'react';
import { trouverNoeud } from '@plateforme/noyau';
import type { Commande, ErreurModele, NoeudId, ServiceEditeur } from '@plateforme/noyau';
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
};

export function Editeur({ service, nouvelId = () => crypto.randomUUID() }: Props) {
  const document = useDocument(service);
  const definitions = useMemo(() => service.lireCatalogue(), [service]);
  const index = useMemo(() => indexerCatalogue(definitions), [definitions]);

  // État DE L'ÉDITEUR, pas du modèle : la sélection et les messages ne sont
  // pas dans le document pivot (ils ne font pas partie de l'application conçue).
  const [selectionBrute, setSelection] = useState<NoeudId | null>(null);
  const [erreurs, setErreurs] = useState<readonly ErreurModele[]>([]);

  // Si le nœud sélectionné a disparu (suppression, annuler, JSON), plus de sélection.
  const selectionId = selectionBrute !== null && trouverNoeud(document, selectionBrute) ? selectionBrute : null;
  const selection = selectionId === null ? undefined : trouverNoeud(document, selectionId);

  function executer(commande: Commande) {
    const resultat = service.executer(commande);
    setErreurs(resultat.succes ? [] : resultat.erreurs);
    return resultat;
  }

  function ajouter(composant: string) {
    const resultat = executer({ type: 'ajouter-noeud', composant, ...cibleAjout(document, selectionId, index) });
    if (resultat.succes) {
      const ajout = resultat.evenements.find((e) => e.type === 'noeud-ajoute');
      if (ajout !== undefined) setSelection(ajout.id);
    }
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
        </div>
      </header>

      {erreurs.length > 0 && (
        <div className="messages erreurs" role="alert">
          {erreurs.map((e, i) => (
            <p key={i}>
              <code>{e.code}</code> {e.message}
            </p>
          ))}
        </div>
      )}

      <aside className="colonne gauche">
        <section>
          <h2>Palette</h2>
          <Palette definitions={definitions} onAjouter={ajouter} />
        </section>
        <section>
          <h2>Arbre</h2>
          <Arbre document={document} index={index} selectionId={selectionId} onSelectionner={setSelection} />
        </section>
      </aside>

      <main className="colonne centre">
        <h2>Canevas</h2>
        <Canevas document={document} selectionId={selectionId} onSelectionner={setSelection} />
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
            />
          )}
        </section>
        <section className="section-json">
          <h2>Modèle pivot (JSON)</h2>
          <VueModelePivot document={document} service={service} onSelectionner={setSelection} />
        </section>
      </aside>
    </div>
  );
}
