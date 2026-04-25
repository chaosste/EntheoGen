import { canonicalPairKey, slugify, splitSentences, stableHash } from './kb-utils';

export interface PerplexityCitation {
  title?: string;
  url?: string;
  doi?: string;
  authors?: string;
  year?: number | string;
  citation_text?: string;
}

export interface PerplexityMechanismMatch {
  label: string;
  patterns: RegExp[];
}

export interface PerplexityClaimCandidate {
  claim_id: string;
  source_id: string;
  claim: string;
  claim_type: 'mechanism' | 'interaction' | 'risk' | 'contraindication' | 'guidance';
  entities: string[];
  mechanism: string[];
  evidence_strength: 'theoretical';
  confidence: 'low';
  supports_pairs: [string, string][];
  clinical_actionability: 'none' | 'monitor' | 'caution' | 'avoid';
  review_state: 'needs_verification';
  notes: string;
  provenance: {
    source_type: 'ai_synthesis';
    requires_verification: true;
    ingestion_method: 'perplexity_ingestion_v1';
    cited_sources: PerplexityCitation[];
  };
  source_specific?: {
    original_row?: string;
    normalized_medication_name?: string;
    original_medication_name?: string;
    aliases?: string[];
    severity_label?: string;
    other_information?: string;
    derivation?: string;
  };
}

const MEDICATION_CLASS_MAP: Array<{ label: string; classLabel: string }> = [
  { label: 'sertraline', classLabel: 'SSRIs' },
  { label: 'citalopram', classLabel: 'SSRIs' },
  { label: 'escitalopram', classLabel: 'SSRIs' },
  { label: 'fluoxetine', classLabel: 'SSRIs' },
  { label: 'fluvoxamine', classLabel: 'SSRIs' },
  { label: 'paroxetine', classLabel: 'SSRIs' },
  { label: 'duloxetine', classLabel: 'SNRIs' },
  { label: 'venlafaxine', classLabel: 'SNRIs' },
  { label: 'desvenlafaxine', classLabel: 'SNRIs' },
  { label: 'milnacipran', classLabel: 'SNRIs' },
  { label: 'amitriptyline', classLabel: 'TCAs' },
  { label: 'clomipramine', classLabel: 'TCAs' },
  { label: 'desipramine', classLabel: 'TCAs' },
  { label: 'doxepin', classLabel: 'TCAs' },
  { label: 'imipramine', classLabel: 'TCAs' },
  { label: 'nortriptyline', classLabel: 'TCAs' },
  { label: 'trimipramine', classLabel: 'TCAs' },
  { label: 'amphetamine', classLabel: 'stimulants' },
  { label: 'dextroamphetamine', classLabel: 'stimulants' },
  { label: 'methamphetamine', classLabel: 'stimulants' },
  { label: 'methylphenidate', classLabel: 'stimulants' },
  { label: 'cocaine', classLabel: 'stimulants' },
  { label: 'phentermine', classLabel: 'stimulants' },
  { label: 'codeine', classLabel: 'opioids' },
  { label: 'tramadol', classLabel: 'opioids' },
  { label: 'meperidine', classLabel: 'opioids' },
  { label: 'methadone', classLabel: 'opioids' },
  { label: 'oxycodone', classLabel: 'opioids' },
  { label: 'sumatriptan', classLabel: 'triptans' },
  { label: 'rizatriptan', classLabel: 'triptans' },
  { label: 'zolmitriptan', classLabel: 'triptans' },
  { label: 'naratriptan', classLabel: 'triptans' },
  { label: 'eletriptan', classLabel: 'triptans' },
  { label: 'frovatriptan', classLabel: 'triptans' },
  { label: 'almotriptan', classLabel: 'triptans' },
  { label: 'moclobemide', classLabel: 'MAOIs' },
  { label: 'phenelzine', classLabel: 'MAOIs' },
  { label: 'tranylcypromine', classLabel: 'MAOIs' },
  { label: 'isocarboxazid', classLabel: 'MAOIs' },
  { label: 'selegiline', classLabel: 'MAOIs' },
  { label: 'rasagiline', classLabel: 'MAOIs' },
  { label: 'linezolid', classLabel: 'MAOIs' },
  { label: 'diphenhydramine', classLabel: 'antihistamines' },
  { label: 'hydroxyzine', classLabel: 'antihistamines' },
  { label: 'chlorpheniramine', classLabel: 'antihistamines' },
  { label: 'cetirizine', classLabel: 'antihistamines' },
  { label: 'loratadine', classLabel: 'antihistamines' },
  { label: 'hydralazine', classLabel: 'antihypertensives' },
  { label: 'methyldopa', classLabel: 'antihypertensives' },
  { label: 'chlorthalidone', classLabel: 'antihypertensives' },
  { label: 'guanethidine', classLabel: 'antihypertensives' },
  { label: 'guanadrel', classLabel: 'antihypertensives' },
  { label: 'ketamine', classLabel: 'dissociatives' },
  { label: 'clonidine', classLabel: 'antihypertensives' },
  { label: 'guanfacine', classLabel: 'antihypertensives' },
  { label: 'beta_blockers', classLabel: 'antihypertensives' },
  { label: 'calcium_channel_blockers', classLabel: 'antihypertensives' }
];

const MECHANISM_MATCHES: PerplexityMechanismMatch[] = [
  { label: 'serotonergic_toxicity', patterns: [/serotonin syndrome/i, /serotonergic/i, /5-ht/i] },
  { label: 'maoi_potentiation', patterns: [/maoi/i, /monoamine oxidase/i, /rima/i] },
  { label: 'hemodynamic_interaction', patterns: [/blood pressure/i, /heart rate/i, /hemodynamic/i] },
  { label: 'noradrenergic_suppression', patterns: [/alpha-2/i, /alpha 2/i, /sympathetic outflow/i] },
  { label: 'glutamate_modulation', patterns: [/nmda/i, /glutamate/i, /ketamine/i] },
  { label: 'ion_channel_modulation', patterns: [/sodium channel/i, /ion channel/i, /lamotrigine/i] },
  { label: 'pharmacodynamic_cns_depression', patterns: [/sedation/i, /respiratory depression/i, /cns depress/i] },
  { label: 'sympathomimetic_load', patterns: [/stimulant/i, /sympathomimetic/i, /cocaine/i, /amphetamine/i] },
  { label: 'cardiovascular_load', patterns: [/blood pressure/i, /hypertension/i, /tachycardia/i, /bradycardia/i] }
];

const KNOWN_CLASS_LABELS = new Set(MEDICATION_CLASS_MAP.map((entry) => entry.classLabel));

export const normalizeMedicationLabel = (value: string): { normalized: string; aliases: string[] } => {
  const original = value.trim();
  const aliases: string[] = [];
  const bracketMatches = [...original.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1].trim()).filter(Boolean);
  aliases.push(...bracketMatches);
  const normalized = original
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\s*\/\s*rima\s*/i, '')
    .replace(/\s*\([^)]*\)/g, '')
    .trim()
    .toLowerCase();
  return { normalized: normalized || original.toLowerCase(), aliases: Array.from(new Set(aliases)) };
};

export const inferPerplexityClass = (entity: string): string | null => {
  const normalized = entity.toLowerCase().trim();
  const match = MEDICATION_CLASS_MAP.find((entry) => entry.label === normalized);
  return match?.classLabel ?? null;
};

export const extractPerplexityEntities = (text: string, sourceId: string, sourceTitle?: string): string[] => {
  const normalizedText = `${sourceId} ${sourceTitle ?? ''} ${text}`.toLowerCase();
  const entities = new Set<string>();
  if (/ayahuasca/.test(normalizedText)) {
    entities.add('ayahuasca');
  }
  for (const entry of MEDICATION_CLASS_MAP) {
    const pattern = new RegExp(`\\b${entry.label.replace(/_/g, '[ _-]')}\\b`, 'i');
    if (pattern.test(normalizedText)) {
      entities.add(entry.label);
      entities.add(entry.classLabel);
    }
  }
  if (/moclobemide/i.test(normalizedText)) {
    entities.add('moclobemide');
    entities.add('MAOIs');
  }
  if (/rima/i.test(normalizedText)) {
    entities.add('MAOIs');
  }
  if (/beta[-_\s]?block/i.test(normalizedText)) {
    entities.add('beta_blockers');
  }
  if (/calcium[-_\s]?channel[-_\s]?block/i.test(normalizedText)) {
    entities.add('calcium_channel_blockers');
  }
  return Array.from(entities).sort();
};

export const extractPerplexityMechanisms = (text: string): string[] =>
  Array.from(
    new Set(
      MECHANISM_MATCHES
        .filter((entry) => entry.patterns.some((pattern) => pattern.test(text)))
        .map((entry) => entry.label)
    )
  );

export const inferPerplexityClaimType = (text: string): PerplexityClaimCandidate['claim_type'] => {
  const normalized = text.toLowerCase();
  if (/contraindicat|do not|avoid/.test(normalized)) return 'contraindication';
  if (/mechanism|mediated by|because|due to/.test(normalized)) return 'mechanism';
  if (/monitor|blood pressure|heart rate|risk|sedation|hypotension|hypertension/.test(normalized)) return 'risk';
  if (/guidance|recommend|screen|caution/.test(normalized)) return 'guidance';
  return 'interaction';
};

export const inferPerplexityActionability = (text: string): PerplexityClaimCandidate['clinical_actionability'] => {
  const normalized = text.toLowerCase();
  if (/contraindicat|major|avoid/.test(normalized)) return 'avoid';
  if (/monitor/.test(normalized)) return 'monitor';
  if (/caution|minor|moderate/.test(normalized)) return 'caution';
  return 'none';
};

export const extractPerplexityCitations = (text: string): PerplexityCitation[] => {
  const citations = new Map<string, PerplexityCitation>();

  for (const match of text.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)) {
    const title = match[1].trim();
    const url = match[2].trim();
    citations.set(url, { title, url, citation_text: match[0] });
  }

  for (const match of text.matchAll(/https?:\/\/[^\s)]+/g)) {
    const url = match[0].replace(/[.,;]+$/g, '');
    if (!citations.has(url)) {
      citations.set(url, { url, citation_text: url });
    }
  }

  for (const match of text.matchAll(/\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/gi)) {
    const doi = match[1];
    const key = doi.toLowerCase();
    if (!citations.has(key)) {
      citations.set(key, { doi, citation_text: doi });
    }
  }

  return Array.from(citations.values());
};

const collectCandidateLines = (body: string): string[] => {
  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const candidates = new Set<string>();

  for (const line of lines) {
    if (/^[-*•]\s+/.test(line)) {
      candidates.add(line.replace(/^[-*•]\s+/, '').trim());
      continue;
    }
    if (/^\d+[\).]\s+/.test(line)) {
      candidates.add(line.replace(/^\d+[\).]\s+/, '').trim());
      continue;
    }
    if (/[.?!]/.test(line) || /interaction|risk|mechanism|monitor|avoid|caution|contraindicat/i.test(line)) {
      candidates.add(line);
    }
  }

  for (const sentence of splitSentences(body)) {
    candidates.add(sentence);
  }

  return Array.from(candidates).filter((line) => line.length > 0 && !/^references?:?$/i.test(line));
};

const buildSupportsPairs = (entities: string[]): [string, string][] => {
  const pairs: [string, string][] = [];
  const normalized = Array.from(new Set(entities.map((entity) => entity.toLowerCase())));
  const hasAyahuasca = normalized.includes('ayahuasca');
  const pairable = normalized.filter((entity) => entity !== 'ayahuasca');
  if (hasAyahuasca) {
    for (const entity of pairable) {
      pairs.push(['ayahuasca', entity]);
    }
  }
  if (!hasAyahuasca) {
    for (let index = 0; index < normalized.length; index += 1) {
      for (let offset = index + 1; offset < normalized.length; offset += 1) {
        pairs.push([normalized[index], normalized[offset]]);
      }
    }
  }
  return Array.from(new Map(pairs.map((pair) => [canonicalPairKey(pair[0], pair[1]), pair] as const)).values());
};

export const extractPerplexityClaims = (
  sourceId: string,
  sourceTitle: string,
  body: string,
  citedSources: PerplexityCitation[],
  sourceSpecific?: Record<string, unknown>
): PerplexityClaimCandidate[] => {
  const candidates = collectCandidateLines(body);
  const claims: PerplexityClaimCandidate[] = [];
  const sourceKeywords = `${sourceId} ${sourceTitle}`.toLowerCase();

  candidates.forEach((candidate, index) => {
    const entities = extractPerplexityEntities(candidate, sourceId, sourceTitle);
    if (entities.length === 0 && !/ayahuasca/.test(sourceKeywords) && !/ayahuasca/.test(candidate.toLowerCase())) {
      return;
    }
    const mechanisms = extractPerplexityMechanisms(candidate);
    const claimEntities = entities.length > 0 ? entities : extractPerplexityEntities(`${sourceTitle} ${body}`, sourceId, sourceTitle);
    const claim = candidate.trim();
    const supportsPairs = buildSupportsPairs(claimEntities);
    const claimId = `${sourceId}_${String(index + 1).padStart(3, '0')}`;
    claims.push({
      claim_id: claimId,
      source_id: sourceId,
      claim,
      claim_type: inferPerplexityClaimType(candidate),
      entities: claimEntities.length > 0 ? claimEntities : ['ayahuasca'],
      mechanism: mechanisms.length > 0 ? mechanisms : ['provisional_secondary'],
      evidence_strength: 'theoretical',
      confidence: 'low',
      supports_pairs: supportsPairs,
      clinical_actionability: inferPerplexityActionability(candidate),
      review_state: 'needs_verification',
      notes: 'Provisional claim extracted from AI synthesis; requires corroboration before promotion.',
      provenance: {
        source_type: 'ai_synthesis',
        requires_verification: true,
        ingestion_method: 'perplexity_ingestion_v1',
        cited_sources: citedSources
      },
      source_specific: sourceSpecific
        ? {
            original_row: typeof sourceSpecific.original_row === 'string' ? String(sourceSpecific.original_row) : undefined,
            normalized_medication_name: typeof sourceSpecific.normalized_medication_name === 'string' ? String(sourceSpecific.normalized_medication_name) : undefined,
            original_medication_name: typeof sourceSpecific.original_medication_name === 'string' ? String(sourceSpecific.original_medication_name) : undefined,
            aliases: Array.isArray(sourceSpecific.aliases) ? sourceSpecific.aliases.map((value) => String(value)) : undefined,
            severity_label: typeof sourceSpecific.severity_label === 'string' ? String(sourceSpecific.severity_label) : undefined,
            other_information: typeof sourceSpecific.other_information === 'string' ? String(sourceSpecific.other_information) : undefined,
            derivation: typeof sourceSpecific.derivation === 'string' ? String(sourceSpecific.derivation) : undefined
          }
        : undefined
    });
  });

  return claims;
};

export const isPerplexitySourceId = (sourceId: string): boolean => sourceId.startsWith('perplexity_');

export const summarizePerplexityClaimText = (claim: PerplexityClaimCandidate): string => {
  const mechanismSummary = claim.mechanism.length > 0 ? ` mechanisms=${claim.mechanism.join(',')}` : '';
  const pairSummary = claim.supports_pairs.length > 0 ? ` pairs=${claim.supports_pairs.map((pair) => canonicalPairKey(pair[0], pair[1])).join(',')}` : '';
  return `${claim.claim}${mechanismSummary}${pairSummary}`;
};

export const buildPerplexityCitationKey = (citation: PerplexityCitation): string =>
  stableHash(
    [
      citation.title ?? '',
      citation.url ?? '',
      citation.doi ?? '',
      citation.citation_text ?? ''
    ].join('|'),
    12
  );

export const normalizePerplexitySourceLabel = (value: string): string =>
  value
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\s*\/\s*rima\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

export const knownPerplexityClassLabels = Array.from(KNOWN_CLASS_LABELS).sort();
