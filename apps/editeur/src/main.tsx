// RACINE DE COMPOSITION : le seul fichier qui choisit les implémentations
// concrètes et fait des `new`. Tout le reste ne connaît que des interfaces.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Catalogue, EditeurApplicatif, composantsDeBase } from '@plateforme/noyau';
import { DepotLocalStorage } from './adaptateurs/depot-local-storage';
import { GenerateurUuid } from './adaptateurs/generateur-uuid';
import { Editeur } from './Editeur';
import './editeur.css';

const CLE_STOCKAGE = 'plateforme.document';

const catalogue = new Catalogue(composantsDeBase);
const service = new EditeurApplicatif(catalogue, new GenerateurUuid(), new DepotLocalStorage(CLE_STOCKAGE));

const racine = document.getElementById('root');
if (racine === null) throw new Error('Élément #root introuvable dans index.html');

createRoot(racine).render(
  <StrictMode>
    <Editeur service={service} />
  </StrictMode>,
);
