// La palette fixe : nom de couleur (dans le modèle) → valeur CSS (ici).
// Le modèle pivot ne contient que des NOMS ('primaire') : changer une valeur
// ici change toutes les applications, dans le canevas comme dans le code généré.
export const PALETTE: Readonly<Record<string, string>> = {
  primaire: '#2f6fde',
  secondaire: '#7c3aed',
  succes: '#1f9d55',
  danger: '#c4352b',
  neutre: '#1d2129',
  gris: '#6b7280',
  clair: '#f4f5f7',
  blanc: '#ffffff',
};

/** Police commune au canevas et aux applications générées (parité). */
export const POLICE = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** Feuille de style de base des applications générées. */
export const CSS_DE_BASE = `*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 16px;
  font-family: ${POLICE};
  color: ${PALETTE['neutre']};
  background: #ffffff;
}
`;
