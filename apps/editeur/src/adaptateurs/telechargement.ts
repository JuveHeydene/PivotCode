// Adaptateur sortant : emballer des fichiers générés dans un .zip et le faire
// télécharger par le navigateur. Les générateurs, eux, ne connaissent ni le zip
// ni le navigateur : ils produisent seulement une liste { chemin, contenu }.
import { strToU8, zipSync } from 'fflate';
import type { Zippable } from 'fflate';

export type FichierAExporter = { readonly chemin: string; readonly contenu: string };

/** Signature injectée dans l'éditeur (remplaçable dans les tests). */
export type Telecharger = (dossier: string, fichiers: readonly FichierAExporter[]) => void;

/** Signature injectée pour télécharger UN fichier texte (par exemple le JSON Schema). */
export type TelechargerFichier = (nom: string, contenu: string, typeMime: string) => void;

/** Date fixe des fichiers du zip : le même modèle donne toujours le même zip (déterminisme). */
const DATE_FIXE = new Date(2000, 0, 1);

/** Construit le zip : chaque fichier est rangé dans `dossier/`. Fonction pure. */
export function creerZip(dossier: string, fichiers: readonly FichierAExporter[]): Uint8Array {
  const contenu: Zippable = {};
  for (const f of fichiers) contenu[`${dossier}/${f.chemin}`] = strToU8(f.contenu);
  return zipSync(contenu, { mtime: DATE_FIXE });
}

/** Déclenche le téléchargement de `dossier.zip` dans le navigateur. */
export const telechargerZip: Telecharger = (dossier, fichiers) => {
  const blob = new Blob([creerZip(dossier, fichiers) as Uint8Array<ArrayBuffer>], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = `${dossier}.zip`;
  lien.click();
  URL.revokeObjectURL(url);
};

/** Déclenche le téléchargement d'un seul fichier texte. */
export const telechargerFichier: TelechargerFichier = (nom, contenu, typeMime) => {
  const url = URL.createObjectURL(new Blob([contenu], { type: typeMime }));
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nom;
  lien.click();
  URL.revokeObjectURL(url);
};
