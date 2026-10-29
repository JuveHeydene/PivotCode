/** fontSize → font-size : nom de propriété CSS à partir du nom camelCase. */
export function versNomCss(propriete: string): string {
  return propriete.replace(/[A-Z]/g, (majuscule) => `-${majuscule.toLowerCase()}`);
}

/** { fontSize: '1rem', color: 'red' } → "font-size: 1rem; color: red" */
export function styleEnLigne(style: Readonly<Record<string, string>>): string {
  return Object.entries(style)
    .map(([nom, valeur]) => `${versNomCss(nom)}: ${valeur}`)
    .join('; ');
}

/** « Mon Appli ! » → « mon-appli » : nom de paquet npm valide (projets générés). */
export function nomDePaquet(nom: string): string {
  const slug = nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug === '' ? 'application-generee' : slug;
}

/** Échappe & < > " pour du texte ou un attribut HTML. */
export function echapperHtml(texte: string): string {
  return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
