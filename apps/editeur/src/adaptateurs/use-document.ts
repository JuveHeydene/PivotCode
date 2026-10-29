import { useCallback, useSyncExternalStore } from 'react';
import type { DocumentPivot, ServiceEditeur } from '@plateforme/noyau';

/**
 * Adaptateur entre le patron Observateur du noyau et React.
 * React appelle `lireDocument()` après chaque notification et compare le
 * résultat au précédent PAR RÉFÉRENCE : grâce à l'immuabilité, la référence
 * change si et seulement si le document a changé.
 */
export function useDocument(service: ServiceEditeur): DocumentPivot {
  const abonner = useCallback((prevenirReact: () => void) => service.abonner(() => prevenirReact()), [service]);
  return useSyncExternalStore(abonner, () => service.lireDocument());
}
