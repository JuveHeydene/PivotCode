// Le FORMAT D'ÉCHANGE IMBRIQUÉ : le même document pivot, écrit en « poupées
// russes » (chaque nœud contient ses enfants) au lieu d'un « annuaire » à plat.
//
// Le format à plat reste le format INTERNE (D8) : idéal pour éditer (accès en
// O(1), modifications locales). Le format imbriqué sert à ÉCHANGER avec
// l'extérieur (humain, autre outil, IA) : il ne contient aucune référence, donc
// ni lien cassé, ni cycle, ni deuxième racine ne sont possibles par construction,
// et JSON Schema peut tout vérifier sauf l'unicité des `id` facultatifs (D72).
//
// Les deux fonctions sont pures, déterministes et ITÉRATIVES (pile explicite) :
// pas de débordement de la pile d'appels sur un arbre très profond.
import { validerDocument } from '@plateforme/noyau';
import type { Catalogue, DocumentPivot, ErreurModele, Noeud, NoeudId, ValeurPropriete } from '@plateforme/noyau';

/** Valeur du champ `format` : distingue un document imbriqué d'un document à plat. */
export const FORMAT_IMBRIQUE = 'pivot-imbrique';

export type NoeudImbrique = {
  /** Facultatif : absent, il est fabriqué à l'import (n1, n2…). */
  readonly id?: NoeudId;
  readonly composant: string;
  readonly proprietes: Readonly<Record<string, ValeurPropriete>>;
  /** Absent = aucun enfant. Jamais présent pour un composant sans enfants. */
  readonly enfants?: readonly NoeudImbrique[];
};

export type DocumentImbrique = {
  readonly format: typeof FORMAT_IMBRIQUE;
  readonly versionMetamodele: 1;
  readonly racine: NoeudImbrique;
};

export type OptionsExport = {
  /** `false` : arbre pur, sans aucun identifiant (le plus simple à produire pour une IA). Défaut : `true`. */
  readonly ids?: boolean;
};

type NoeudEnConstruction = {
  id?: NoeudId;
  composant: string;
  proprietes: Record<string, ValeurPropriete>;
  enfants?: NoeudEnConstruction[];
};

/**
 * À plat → imbriqué. Le document est supposé VALIDE (il vient du noyau).
 * O(n + e) : chaque nœud et chaque lien sont visités une fois.
 */
export function versImbrique(document: DocumentPivot, options: OptionsExport = {}): DocumentImbrique {
  const avecIds = options.ids ?? true;
  const creer = (noeud: Noeud): NoeudEnConstruction => ({
    ...(avecIds ? { id: noeud.id } : {}),
    composant: noeud.composant,
    proprietes: { ...noeud.proprietes },
    ...(noeud.enfants.length > 0 ? { enfants: [] } : {}),
  });

  const racine = document.noeuds[document.racineId] as Noeud;
  const sortie = creer(racine);
  const pile: [Noeud, NoeudEnConstruction][] = [[racine, sortie]];
  while (pile.length > 0) {
    const [noeud, copie] = pile.pop() as [Noeud, NoeudEnConstruction];
    for (const enfantId of noeud.enfants) {
      const enfant = document.noeuds[enfantId] as Noeud;
      const copieEnfant = creer(enfant);
      copie.enfants?.push(copieEnfant);
      pile.push([enfant, copieEnfant]);
    }
  }
  return { format: FORMAT_IMBRIQUE, versionMetamodele: 1, racine: sortie };
}

export type ResultatImport =
  | { readonly succes: true; readonly document: DocumentPivot }
  | { readonly succes: false; readonly erreurs: readonly ErreurModele[] };

/** Un nœud lu pendant le parcours, avec de quoi retrouver son chemin (`racine.enfants[2]…`). */
type Entree = {
  readonly valeur: Record<string, unknown>;
  readonly parent: number | null;
  readonly rang: number;
  /** `null` tant que l'identifiant n'est pas fourni ou fabriqué. */
  id: NoeudId | null;
  fabrique: boolean;
  readonly enfants: number[];
};

function estObjet(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

/** Chemin lisible d'un nœud. Calculé seulement pour les messages d'erreur : O(profondeur). */
function chemin(entrees: readonly (Entree | undefined)[], parent: number | null, rang: number): string {
  const morceaux: string[] = [];
  let p = parent;
  let r = rang;
  while (p !== null) {
    morceaux.push(`.enfants[${r}]`);
    const e = entrees[p] as Entree;
    p = e.parent;
    r = e.rang;
  }
  return `racine${morceaux.reverse().join('')}`;
}

function mal(message: string): ResultatImport {
  return { succes: false, erreurs: [{ code: 'NOEUD_MAL_FORME', message }] };
}

/**
 * Imbriqué → à plat, puis validation COMPLÈTE par le noyau (R1 à R8).
 * Ne fait jamais confiance à l'entrée (D9) et ne lève jamais d'exception.
 * Tolérant (Postel, D64) : `proprietes` ou `enfants` absents valent {} et [],
 * et les champs inconnus sont ignorés. Le schéma imbriqué, lui, est strict.
 */
export function depuisImbrique(candidat: unknown, catalogue: Catalogue): ResultatImport {
  if (
    !estObjet(candidat) ||
    candidat['format'] !== FORMAT_IMBRIQUE ||
    candidat['versionMetamodele'] !== 1 ||
    !estObjet(candidat['racine'])
  ) {
    return {
      succes: false,
      erreurs: [
        {
          code: 'FORME_INVALIDE',
          message: `Un document imbriqué doit être un objet { format: "${FORMAT_IMBRIQUE}", versionMetamodele: 1, racine: nœud }.`,
        },
      ],
    };
  }

  // 1. Parcours en profondeur (pile explicite), dans l'ordre de lecture.
  //    `vus` détecte un même objet rencontré deux fois : impossible depuis du
  //    JSON, mais possible si un programme passe un objet JavaScript partagé.
  const entrees: Entree[] = [];
  const vus = new Set<object>();
  const pile: { valeur: unknown; parent: number | null; rang: number }[] = [
    { valeur: candidat['racine'], parent: null, rang: 0 },
  ];
  while (pile.length > 0) {
    const { valeur, parent, rang } = pile.pop() as (typeof pile)[number];
    const ici = (): string => chemin(entrees, parent, rang);
    if (!estObjet(valeur)) return mal(`${ici()} : un nœud doit être un objet.`);
    if (vus.has(valeur)) {
      return { succes: false, erreurs: [{ code: 'CYCLE_OU_PARTAGE', message: `${ici()} : ce nœud apparaît deux fois.` }] };
    }
    vus.add(valeur);
    const { id, composant, proprietes, enfants } = valeur;
    if (
      typeof composant !== 'string' ||
      !(id === undefined || typeof id === 'string') ||
      !(proprietes === undefined || estObjet(proprietes)) ||
      !(enfants === undefined || Array.isArray(enfants))
    ) {
      return mal(
        `${ici()} : un nœud a composant (texte), et éventuellement id (texte), proprietes (objet) et enfants (tableau).`,
      );
    }
    const index = entrees.length;
    entrees.push({ valeur, parent, rang, id: id ?? null, fabrique: id === undefined, enfants: [] });
    if (parent !== null) (entrees[parent] as Entree).enfants[rang] = index;
    const liste = (enfants ?? []) as unknown[];
    for (let i = liste.length - 1; i >= 0; i--) pile.push({ valeur: liste[i], parent: index, rang: i });
  }

  // 2. Identifiants : ceux fournis doivent être uniques (seule règle globale
  //    qui reste, et que JSON Schema ne sait pas vérifier) ; les autres sont fabriqués.
  const premierUsage = new Map<NoeudId, number>();
  const erreurs: ErreurModele[] = [];
  entrees.forEach((e, i) => {
    if (e.id === null) return;
    const deja = premierUsage.get(e.id);
    if (deja === undefined) premierUsage.set(e.id, i);
    else {
      erreurs.push({
        code: 'IDENTIFIANT_DEJA_UTILISE',
        message: `L'identifiant « ${e.id} » est utilisé deux fois : ${chemin(entrees, (entrees[deja] as Entree).parent, (entrees[deja] as Entree).rang)} et ${chemin(entrees, e.parent, e.rang)}.`,
        noeudId: e.id,
      });
    }
  });
  if (erreurs.length > 0) return { succes: false, erreurs };
  let compteur = 0;
  for (const e of entrees) {
    if (e.id !== null) continue;
    do compteur += 1;
    while (premierUsage.has(`n${compteur}`));
    e.id = `n${compteur}`;
  }

  const idDe = (i: number): NoeudId => (entrees[i] as Entree).id as NoeudId;

  // 3. Le document à plat. `Object.fromEntries` crée de vraies propriétés,
  //    même pour une clé comme `__proto__`.
  const noeuds = Object.fromEntries(
    entrees.map((e): [NoeudId, Noeud] => [
      e.id as NoeudId,
      {
        id: e.id as NoeudId,
        composant: e.valeur['composant'] as string,
        proprietes: { ...((e.valeur['proprietes'] ?? {}) as Record<string, ValeurPropriete>) },
        parentId: e.parent === null ? null : idDe(e.parent),
        enfants: e.enfants.map(idDe),
      },
    ]),
  );
  const document: DocumentPivot = { versionMetamodele: 1, racineId: idDe(0), noeuds };

  // 4. Le noyau vérifie tout le reste (catalogue, propriétés, enfants interdits…).
  //    On ajoute le chemin aux messages. Un identifiant FABRIQUÉ ne dit rien à
  //    l'auteur, et pourrait désigner par hasard un autre nœud ailleurs : on le retire.
  const indexParId = new Map(entrees.map((e) => [e.id as NoeudId, e]));
  const refus = validerDocument(document, catalogue).map((err): ErreurModele => {
    const e = err.noeudId === undefined ? undefined : indexParId.get(err.noeudId);
    if (e === undefined) return err;
    const message = `${err.message} (${chemin(entrees, e.parent, e.rang)})`;
    return e.fabrique ? { code: err.code, message } : { ...err, message };
  });
  return refus.length > 0 ? { succes: false, erreurs: refus } : { succes: true, document };
}

/** Vrai si la valeur se déclare au format imbriqué (pour choisir le bon import). */
export function estFormatImbrique(valeur: unknown): boolean {
  return estObjet(valeur) && valeur['format'] === FORMAT_IMBRIQUE;
}
