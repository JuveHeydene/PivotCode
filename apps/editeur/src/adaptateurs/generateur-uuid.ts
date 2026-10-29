import type { GenerateurIdentifiants, NoeudId } from '@plateforme/noyau';

/** Adaptateur sortant : identifiants aléatoires du navigateur (UUID v4). */
export class GenerateurUuid implements GenerateurIdentifiants {
  nouveau(): NoeudId {
    return crypto.randomUUID();
  }
}
