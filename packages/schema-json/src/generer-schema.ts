// Traduit le CATALOGUE (notre format maison, M2) en JSON Schema (standard
// draft 2020-12), lisible par n'importe quel outil, dans n'importe quel langage,
// et par les modèles de langage (« sorties structurées »).
//
// Le schéma décrit la forme CANONIQUE d'un document : aucun champ en trop.
// Le noyau, lui, tolère des champs structurels en trop puis les retire (D17) :
// « tolérant dans ce qu'on accepte, strict dans ce qu'on produit ».
//
// Ce que JSON Schema ne PEUT PAS exprimer pour le format À PLAT (et que seul le
// noyau vérifie) : la clé d'un nœud égale à son id, l'existence de la racine, la
// cohérence parentId / enfants, l'absence de cycle. Voir la théorie de la phase 3.
// Le format IMBRIQUÉ (en bas du fichier) fait disparaître ces limites (phase 4).
import type { Catalogue, DefinitionComposant, DefinitionPropriete } from '@plateforme/noyau';
import { FORMAT_IMBRIQUE } from '@plateforme/format-imbrique';

export const DIALECTE = 'https://json-schema.org/draft/2020-12/schema';
export const IDENTIFIANT_SCHEMA = 'https://plateforme-low-code.local/schemas/document-pivot/v1.schema.json';
export const IDENTIFIANT_SCHEMA_IMBRIQUE = 'https://plateforme-low-code.local/schemas/document-imbrique/v1.schema.json';

export type SchemaJson = { readonly [cle: string]: unknown };

function schemaPropriete(p: DefinitionPropriete): SchemaJson {
  const commun = { title: p.libelle, default: p.defaut };
  switch (p.type) {
    case 'texte':
      return { type: 'string', ...commun };
    case 'nombre':
      return {
        type: 'number',
        ...(p.min === undefined ? {} : { minimum: p.min }),
        ...(p.max === undefined ? {} : { maximum: p.max }),
        ...commun,
      };
    case 'booleen':
      return { type: 'boolean', ...commun };
    case 'choix':
      return { type: 'string', enum: [...p.choix], ...commun };
  }
}

function schemaProprietes(d: DefinitionComposant): SchemaJson {
  const obligatoires = d.proprietes.filter((p) => p.obligatoire).map((p) => p.nom);
  return {
    type: 'object',
    additionalProperties: false,
    ...(obligatoires.length > 0 ? { required: obligatoires } : {}),
    properties: Object.fromEntries(d.proprietes.map((p) => [p.nom, schemaPropriete(p)])),
  };
}

function schemaComposant(d: DefinitionComposant): SchemaJson {
  return {
    type: 'object',
    title: d.libelle,
    description: `Un nœud de type ${d.nom}.`,
    required: ['id', 'composant', 'proprietes', 'parentId', 'enfants'],
    additionalProperties: false,
    properties: {
      id: { type: 'string', description: 'Identifiant du nœud (égal à sa clé dans « noeuds »).' },
      composant: { const: d.nom },
      parentId: { type: ['string', 'null'], description: 'Identifiant du parent ; null uniquement pour la racine.' },
      enfants: d.accepteEnfants
        ? { type: 'array', items: { type: 'string' }, description: 'Identifiants des enfants, dans l’ordre d’affichage.' }
        : { type: 'array', maxItems: 0, description: `Un ${d.nom} n’accepte pas d’enfants.` },
      proprietes: schemaProprietes(d),
    },
  };
}

/** Le JSON Schema du document pivot, version 1 du métamodèle, pour ce catalogue. Fonction pure et déterministe. */
export function genererSchemaJson(catalogue: Catalogue): SchemaJson {
  const definitions = catalogue.lister();
  return {
    $schema: DIALECTE,
    $id: IDENTIFIANT_SCHEMA,
    title: 'Document pivot',
    description:
      'Modèle pivot d’une interface (version 1 du métamodèle). Produit automatiquement à partir du catalogue des composants.',
    type: 'object',
    required: ['versionMetamodele', 'racineId', 'noeuds'],
    additionalProperties: false,
    properties: {
      versionMetamodele: { const: 1 },
      racineId: { type: 'string', description: 'Identifiant du nœud racine.' },
      noeuds: {
        type: 'object',
        description: 'Table à plat : identifiant → nœud.',
        additionalProperties: { $ref: '#/$defs/Noeud' },
      },
    },
    $defs: {
      Noeud: { oneOf: definitions.map((d) => ({ $ref: `#/$defs/${d.nom}` })) },
      ...Object.fromEntries(definitions.map((d) => [d.nom, schemaComposant(d)])),
    },
  };
}

// --- Le format d'échange IMBRIQUÉ (phase 4, D72) -----------------------------
// Chaque nœud CONTIENT ses enfants : le schéma est récursif ($ref vers Noeud).
// Plus de références entre nœuds, donc plus de liens cassés, de cycles ni de
// racine absente : JSON Schema vérifie TOUT, sauf l'unicité des `id` facultatifs.

function schemaComposantImbrique(d: DefinitionComposant): SchemaJson {
  return {
    type: 'object',
    title: d.libelle,
    description: `Un nœud de type ${d.nom}.`,
    required: ['composant', 'proprietes'],
    additionalProperties: false,
    properties: {
      id: { type: 'string', description: 'Facultatif. S’il est absent, il est fabriqué à l’import. Doit être unique dans le document.' },
      composant: { const: d.nom },
      proprietes: schemaProprietes(d),
      // Un composant sans enfants n'a PAS de champ « enfants » (additionalProperties: false).
      ...(d.accepteEnfants
        ? { enfants: { type: 'array', items: { $ref: '#/$defs/Noeud' }, description: 'Les enfants, dans l’ordre d’affichage. Absent = aucun.' } }
        : {}),
    },
  };
}

/** Le JSON Schema du format d'échange imbriqué, pour ce catalogue. Fonction pure et déterministe. */
export function genererSchemaImbrique(catalogue: Catalogue): SchemaJson {
  const definitions = catalogue.lister();
  return {
    $schema: DIALECTE,
    $id: IDENTIFIANT_SCHEMA_IMBRIQUE,
    title: 'Document pivot (format d’échange imbriqué)',
    description:
      'Le même modèle pivot, chaque nœud contenant ses enfants. Format d’échange (humains, outils, IA). Produit automatiquement à partir du catalogue.',
    type: 'object',
    required: ['format', 'versionMetamodele', 'racine'],
    additionalProperties: false,
    properties: {
      format: { const: FORMAT_IMBRIQUE },
      versionMetamodele: { const: 1 },
      racine: { $ref: '#/$defs/Noeud' },
    },
    $defs: {
      Noeud: { oneOf: definitions.map((d) => ({ $ref: `#/$defs/${d.nom}` })) },
      ...Object.fromEntries(definitions.map((d) => [d.nom, schemaComposantImbrique(d)])),
    },
  };
}
