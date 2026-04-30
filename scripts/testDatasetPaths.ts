import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getBetaCsvPaths, getCanonicalDatasetPaths, getDefaultBetaDataDir } from './datasetPaths';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const canonical = getCanonicalDatasetPaths(root);

assert.ok(
  canonical.interactionDatasetV2.endsWith(path.join('src', 'data', 'interactionDatasetV2.json')),
  'interactionDatasetV2 path should resolve to canonical v2 dataset file'
);
assert.ok(
  canonical.interactionPairsExport.endsWith(path.join('src', 'exports', 'interaction_pairs.json')),
  'interactionPairsExport path should resolve to app export snapshot file'
);
assert.ok(
  canonical.substancesSnapshot.endsWith(path.join('src', 'data', 'substances_snapshot.json')),
  'substancesSnapshot path should resolve to app substance snapshot file'
);
assert.ok(
  canonical.sourceManifest.endsWith(path.join('knowledge-base', 'indexes', 'source_manifest.json')),
  'sourceManifest path should resolve to canonical KB source manifest'
);
assert.ok(
  canonical.citationRegistry.endsWith(path.join('knowledge-base', 'indexes', 'citation_registry.json')),
  'citationRegistry path should resolve to canonical KB citation registry'
);

const betaDir = getDefaultBetaDataDir(root);
const betaCsv = getBetaCsvPaths(betaDir);
assert.strictEqual(betaCsv.substancesCsv, path.join(betaDir, 'substances.csv'));
assert.strictEqual(betaCsv.interactionsCsv, path.join(betaDir, 'interactions.csv'));

console.log('dataset path helper checks passed');
