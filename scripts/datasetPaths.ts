import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export interface CanonicalDatasetPaths {
  interactionDatasetV2: string;
  interactionPairsExport: string;
  substancesSnapshot: string;
  sourceManifest: string;
  sourceTags: string;
  citationRegistry: string;
  sourceSchema: string;
  claimSchema: string;
}

export interface BetaCsvPaths {
  dataDir: string;
  substancesCsv: string;
  interactionsCsv: string;
}

export const defaultBetaCsvFilenames = {
  substances: 'substances.csv',
  interactions: 'interactions.csv'
} as const;

export function getCanonicalDatasetPaths(root = repoRoot): CanonicalDatasetPaths {
  return {
    interactionDatasetV2: path.join(root, 'src', 'data', 'interactionDatasetV2.json'),
    interactionPairsExport: path.join(root, 'src', 'exports', 'interaction_pairs.json'),
    substancesSnapshot: path.join(root, 'src', 'data', 'substances_snapshot.json'),
    sourceManifest: path.join(root, 'knowledge-base', 'indexes', 'source_manifest.json'),
    sourceTags: path.join(root, 'knowledge-base', 'indexes', 'source_tags.json'),
    citationRegistry: path.join(root, 'knowledge-base', 'indexes', 'citation_registry.json'),
    sourceSchema: path.join(root, 'knowledge-base', 'schemas', 'source.schema.json'),
    claimSchema: path.join(root, 'knowledge-base', 'schemas', 'claim.schema.json')
  };
}

export function getDefaultBetaDataDir(root = repoRoot): string {
  return path.join(path.dirname(root), 'EntheoGen-Dataset-Beta-0-1', 'data');
}

export function getBetaCsvPaths(dataDir: string): BetaCsvPaths {
  return {
    dataDir,
    substancesCsv: path.join(dataDir, defaultBetaCsvFilenames.substances),
    interactionsCsv: path.join(dataDir, defaultBetaCsvFilenames.interactions)
  };
}
