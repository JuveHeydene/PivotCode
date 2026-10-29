import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DepotLocalStorage } from './depot-local-storage';
import { documentExemple } from '../outils-editeur';

describe('DepotLocalStorage', () => {
  beforeEach(() => localStorage.clear());

  it('renvoie null quand rien n’est enregistré', () => {
    expect(new DepotLocalStorage('cle').charger()).toBeNull();
  });

  it('relit ce qui a été enregistré', () => {
    const depot = new DepotLocalStorage('cle');
    depot.enregistrer(documentExemple);
    expect(depot.charger()).toEqual(documentExemple);
  });

  it('renvoie null si le contenu n’est pas du JSON', () => {
    localStorage.setItem('cle', '{ cassé');
    expect(new DepotLocalStorage('cle').charger()).toBeNull();
  });

  it('ne plante pas si le stockage refuse l’écriture', () => {
    const plein = { setItem: () => { throw new Error('QuotaExceededError'); } } as unknown as Storage;
    const erreurConsole = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => new DepotLocalStorage('cle', plein).enregistrer(documentExemple)).not.toThrow();
    expect(erreurConsole).toHaveBeenCalled();
    erreurConsole.mockRestore();
  });
});
