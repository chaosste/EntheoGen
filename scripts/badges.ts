import fs from "node:fs";
import path from "node:path";

const DATASET_PATH = process.argv[2] ?? "data/interactions.json";
const README_PATH = process.argv[3] ?? "README.md";

type Interaction = {
  classification?: { code?: string };
  confidence?: string;
  evidence?: {
    status?: string;
    evidence_strength?: string;
    source_refs?: unknown[];
  };
  agents?: unknown[];
};

function badge(label: string, message: string | number, color: string) {
  const safeLabel = encodeURIComponent(label).replace(/-/g, "--");
  const safeMessage = encodeURIComponent(String(message)).replace(/-/g, "--");
  return `![${label}](https://img.shields.io/badge/${safeLabel}-${safeMessage}-${color})`;
}

function countBy<T extends string | undefined>(
  items: Interaction[],
  getter: (item: Interaction) => T
) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = getter(item) ?? "unknown";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

const raw = fs.readFileSync(DATASET_PATH, "utf8");
const dataset = JSON.parse(raw);

const interactions: Interaction[] = Array.isArray(dataset)
  ? dataset
  : dataset.interactions ?? dataset.records ?? [];

if (!Array.isArray(interactions) || interactions.length === 0) {
  throw new Error(`No interactions found in ${DATASET_PATH}`);
}

const classificationCounts = countBy(
  interactions,
  (i) => i.classification?.code
);

const evidenceCounts = countBy(interactions, (i) => i.evidence?.status);
const confidenceCounts = countBy(interactions, (i) => i.confidence);

const sourceLinked = interactions.filter((i) => {
  const refs = i.evidence?.source_refs;
  return Array.isArray(refs) && refs.length > 0 && !refs.includes("source_gap");
}).length;

const substances = new Set<string>();

for (const interaction of interactions) {
  for (const agent of interaction.agents ?? []) {
    if (typeof agent === "string") substances.add(agent);
    else if (
      agent &&
      typeof agent === "object" &&
      "id" in agent &&
      typeof (agent as { id?: unknown }).id === "string"
    ) {
      substances.add((agent as { id: string }).id);
    }
  }
}

const badges = [
  badge("Schema Version", "v2.2.0", "blue"),
  badge("Interactions", interactions.length, "informational"),
  badge("Substances", substances.size || "unknown", "informational"),
  badge("Validation", "tiered", "brightgreen"),
  badge("Build", "typescript compile pass", "brightgreen"),
  badge("Status", "active development", "orange"),
  badge("Data Model", "knowledge graph", "purple"),
  badge("Uncertainty", "explicit", "lightgrey"),
  badge("Evidence Model", "multistate", "blueviolet"),
  badge("Provenance", "explicit", "blue"),
  badge("Sources", `${sourceLinked}/${interactions.length} linked`, "green"),
  badge("Deterministic", classificationCounts.DETERMINISTIC ?? 0, "blue"),
  badge("Theoretical", classificationCounts.THEORETICAL ?? 0, "yellow"),
  badge("Inferred", classificationCounts.INFERRED ?? 0, "yellow"),
  badge("Unknown", classificationCounts.UNKNOWN ?? 0, "lightgrey"),
  badge("Low Confidence", confidenceCounts.low ?? 0, "yellow"),
  badge("Supported Evidence", evidenceCounts.supported ?? 0, "green"),
  badge("Mechanistic Evidence", evidenceCounts.mechanistic_inference ?? 0, "yellow"),
  badge("License", "research use", "lightgrey")
].join("\n");

const start = "<!-- BADGES:START -->";
const end = "<!-- BADGES:END -->";

const readme = fs.readFileSync(README_PATH, "utf8");

const nextReadme = readme.includes(start) && readme.includes(end)
  ? readme.replace(
      new RegExp(`${start}[\\s\\S]*?${end}`),
      `${start}\n${badges}\n${end}`
    )
  : `${start}\n${badges}\n${end}\n\n${readme}`;

fs.writeFileSync(README_PATH, nextReadme);

console.log("Updated badges:");
console.log(badges);
