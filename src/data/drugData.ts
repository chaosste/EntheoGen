export interface Drug {
  id: string;
  name: string;
  class: string;
  mechanismTag: string;
  notes: string;
}

export interface InteractionMetadata {
  label: string;
  symbol: string;
  color: string;
  description: string;
  riskScale: number;
}

export interface InteractionEvidence {
  code: string;
  summary: string;
  confidence: string;
  sources: string;
}

export const DRUGS: Drug[] = [
  {
    id: 'ayahuasca',
    name: 'Ayahuasca',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'MAOI + DMT',
    notes: 'Contains harmala alkaloids; interaction profile strongly MAOI-mediated.'
  },
  {
    id: 'psilocybin',
    name: 'Psilocybin Mushrooms',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'Serotonergic psychedelic',
    notes: 'Classical psychedelic; medication interactions include blunting/intensification.'
  },
  {
    id: 'nn_dmt',
    name: 'N,N-DMT',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'Serotonergic tryptamine',
    notes: 'Referenced as generally lower risk with ayahuasca context than 5-MeO-DMT.'
  },
  {
    id: 'five_meo_dmt',
    name: '5-MeO-DMT',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'Serotonergic tryptamine',
    notes: 'Specifically flagged as dangerous with MAOIs in supplied sources.'
  },
  {
    id: 'mescaline_peyote',
    name: 'Mescaline / Peyote',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'Phenethylamine psychedelic',
    notes: 'Listed with spacing guidance relative to ayahuasca.'
  },
  {
    id: 'yopo',
    name: 'Yopo',
    class: 'Ceremonial Psychedelic',
    mechanismTag: '5-MeO-DMT + bufotenine containing seeds',
    notes: 'Source notes caution due active constituents.'
  },
  {
    id: 'lsd',
    name: 'LSD',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'Serotonergic psychedelic',
    notes: 'Included in lower-risk ayahuasca combination examples.'
  },
  {
    id: 'salvia',
    name: 'Salvia divinorum',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'Atypical dissociative/dysphoric profile',
    notes: 'Marked distinct per request; no explicit risk ratings in provided documents.'
  },
  {
    id: 'belladonna',
    name: 'Belladonna',
    class: 'Deliriant',
    mechanismTag: 'Anticholinergic deliriant',
    notes: 'Marked distinct per request; no explicit risk ratings in provided documents.'
  },
  {
    id: 'brugmansia',
    name: 'Brugmansia',
    class: 'Deliriant',
    mechanismTag: 'Anticholinergic deliriant',
    notes: 'Marked distinct per request; no explicit risk ratings in provided documents.'
  },
  {
    id: 'kambo',
    name: 'Kambo',
    class: 'Ceremonial Adjunct',
    mechanismTag: 'Ceremonial adjunct',
    notes: 'Caution advised around co-presentation with ayahuasca.'
  },
  {
    id: 'tobacco_rape',
    name: 'Tobacco / Rapé',
    class: 'Ceremonial Adjunct',
    mechanismTag: 'Nicotinic stimulant (traditional adjunct)',
    notes: 'Generally noted as acceptable with caveats on admixtures.'
  },
  {
    id: 'cannabis',
    name: 'Cannabis',
    class: 'Ceremonial Or Recreational',
    mechanismTag: 'Cannabinoid',
    notes: 'Listed in lower-risk ayahuasca combinations.'
  },
  {
    id: 'alcohol',
    name: 'Alcohol',
    class: 'Non Ceremonial',
    mechanismTag: 'CNS depressant',
    notes: 'Explicitly advised against with ayahuasca in provided text.'
  },
  {
    id: 'ssri',
    name: 'SSRIs',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Serotonin reuptake inhibition',
    notes: 'Psilocybin chart: blunted effects; ayahuasca: serotonin syndrome risk.'
  },
  {
    id: 'snri',
    name: 'SNRIs',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Serotonin + norepinephrine reuptake inhibition',
    notes: 'Psilocybin chart: blunted effects; ayahuasca contraindication list includes SNRIs.'
  },
  {
    id: 'tricyclic_ad',
    name: 'Tricyclic Antidepressants',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Mixed monoamine reuptake effects',
    notes: 'Psilocybin chart: intensified effects; specific tricyclics listed as contraindicated with ayahuasca.'
  },
  {
    id: 'maoi_pharma',
    name: 'Pharmaceutical MAOIs',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Monoamine oxidase inhibition',
    notes: 'Major contraindication category around ayahuasca and serotonergic combinations.'
  },
  {
    id: 'atypical_ad',
    name: 'Atypical Antidepressants',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Mixed serotonergic mechanisms',
    notes: 'Buspirone, trazodone, mirtazapine in psilocybin chart mostly blunted.'
  },
  {
    id: 'ndri_bupropion',
    name: 'NDRI (Bupropion)',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Norepinephrine + dopamine reuptake inhibition',
    notes: 'Psilocybin chart flags reduced seizure threshold and individualized risk.'
  },
  {
    id: 'amphetamine_stims',
    name: 'Amphetamine Stimulants',
    class: 'Pharmaceutical Or Recreational',
    mechanismTag: 'Monoamine releasing stimulant',
    notes: 'Explicitly high risk with MAOI context; potential hypertensive crisis/serotonin toxicity.'
  },
  {
    id: 'methylphenidate',
    name: 'Methylphenidate',
    class: 'Pharmaceutical',
    mechanismTag: 'Catecholaminergic stimulant',
    notes: 'Contraindication list item with ayahuasca in source slides.'
  },
  {
    id: 'cocaine',
    name: 'Cocaine',
    class: 'Recreational Stimulant',
    mechanismTag: 'Monoamine reuptake inhibition',
    notes: 'Contraindication list item with ayahuasca in source slides.'
  },
  {
    id: 'mdma_2cx_dox_nbome',
    name: 'MDMA / 2C-x / DOx / NBOMe',
    class: 'Recreational Serotonergic',
    mechanismTag: 'Serotonergic stimulant/psychedelic cluster',
    notes: 'Contraindication cluster with ayahuasca in source slides.'
  },
  {
    id: 'serotonergic_opioids',
    name: 'Serotonergic Opioids (Tramadol/Methadone/Meperidine/Tapentadol)',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Opioid + serotonergic action',
    notes: 'Contraindication list item with ayahuasca in source slides.'
  },
  {
    id: 'antipsychotics',
    name: 'Antipsychotics',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Dopamine/serotonin modulation',
    notes: 'Mixed source signals; treat as elevated caution/high risk with ayahuasca.'
  },
  {
    id: 'antihypertensives',
    name: 'Antihypertensives',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Blood pressure modulation',
    notes: 'Mentioned as risk area and also emergency management context.'
  },
  {
    id: 'benzodiazepines',
    name: 'Benzodiazepines',
    class: 'Pharmaceutical Class',
    mechanismTag: 'GABAergic sedatives',
    notes: 'Listed as generally low-risk emergency management option in supplied slides.'
  },
];

export const LEGEND: Record<string, InteractionMetadata> = {
  LOW: {
    label: 'Low Risk',
    symbol: 'CIRCLE',
    color: '#1C8AD1',
    description: 'Generally low physiologic interaction risk in source context.',
    riskScale: 1
  },
  LOW_MOD: {
    label: 'Low Risk, Effect Modulation',
    symbol: 'DOWN',
    color: '#3EA5E6',
    description: 'Low acute risk, but may blunt/decrease/increase subjective effects.',
    riskScale: 2
  },
  CAU: {
    label: 'Caution / Moderate Risk',
    symbol: 'WARN',
    color: '#D7CA25',
    description: 'Meaningful interaction risk; monitor and/or avoid unless supervised.',
    riskScale: 3
  },
  UNS: {
    label: 'Unsafe / High Risk',
    symbol: 'HEART',
    color: '#DD8B28',
    description: 'High adverse-event risk; generally avoid.',
    riskScale: 4
  },
  DAN: {
    label: 'Dangerous / Contraindicated',
    symbol: 'X',
    color: '#E21B2B',
    description: 'Potentially severe or life-threatening interaction risk; avoid.',
    riskScale: 5
  },
  UNK: {
    label: 'Unknown/Insufficient Data',
    symbol: 'INFO',
    color: '#6C757D',
    description: 'No explicit classification in currently loaded ceremonial source set.',
    riskScale: 0
  },
  SELF: {
    label: 'Same Entity / N-A',
    symbol: 'SELF',
    color: '#274F13',
    description: 'Diagonal/self pairing; not an interaction pair.',
    riskScale: -1
  },
};

const INTERACTION_RULES: Record<string, InteractionEvidence> = {
  'alcohol|ayahuasca': {
    code: 'DAN',
    summary: 'Advised against; MAOI context and stated potential for dangerous outcomes.',
    confidence: 'high',
    sources: 'ayahuasca-interactions.pdf (p1 text)'
  },
  'amphetamine_stims|ayahuasca': {
    code: 'DAN',
    summary: 'Explicitly contraindicated; risk includes hypertensive crisis/serotonin toxicity.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'antihypertensives|ayahuasca': {
    code: 'CAU',
    summary: 'Listed as risk category and also management context; treat as caution.',
    confidence: 'low',
    sources: 'ayahuasca-interactions.pdf + Ayahuasca and Drug Interaction.pdf'
  },
  'antipsychotics|ayahuasca': {
    code: 'UNS',
    summary: 'Appears in contraindication list; emergency-use context in source makes this high-caution.',
    confidence: 'low',
    sources: 'Ayahuasca and Drug Interaction.pdf (The Good + Contraindications slides)'
  },
  'atypical_ad|psilocybin': {
    code: 'LOW_MOD',
    summary: 'Mostly blunted effects (buspirone/trazodone/mirtazapine entries).',
    confidence: 'high',
    sources: 'Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf'
  },
  'ayahuasca|benzodiazepines': {
    code: 'LOW',
    summary: 'Listed as low-risk emergency combination option in source context.',
    confidence: 'medium',
    sources: 'Ayahuasca and Drug Interaction.pdf (The Good slide)'
  },
  'ayahuasca|cannabis': {
    code: 'LOW_MOD',
    summary: 'Listed among generally lower-risk combinations in source context.',
    confidence: 'medium',
    sources: 'Ayahuasca and Drug Interaction.pdf (The Good slide)'
  },
  'ayahuasca|cocaine': {
    code: 'DAN',
    summary: 'Listed as contraindicated with ayahuasca.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'ayahuasca|five_meo_dmt': {
    code: 'DAN',
    summary: 'Source explicitly states 5-MeO-DMT may be dangerous with MAOIs.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (summary slide text)'
  },
  'ayahuasca|kambo': {
    code: 'CAU',
    summary: 'Caution advised where substances are co-presented in program.',
    confidence: 'medium',
    sources: 'ayahuasca-interactions.pdf (p1 text)'
  },
  'ayahuasca|lsd': {
    code: 'LOW_MOD',
    summary: 'Listed in lower-risk ceremonial/recreational combinations.',
    confidence: 'medium',
    sources: 'Ayahuasca and Drug Interaction.pdf (The Good slide)'
  },
  'ayahuasca|maoi_pharma': {
    code: 'DAN',
    summary: 'Other MAOIs explicitly called out as interaction risks.',
    confidence: 'high',
    sources: 'ayahuasca-interactions.pdf (p1 text)'
  },
  'ayahuasca|mdma_2cx_dox_nbome': {
    code: 'DAN',
    summary: 'Ceremonial/recreational serotonergic phenethylamines listed as contraindicated.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'ayahuasca|mescaline_peyote': {
    code: 'CAU',
    summary: 'Source notes spacing recommendation (>=24h later), indicating caution.',
    confidence: 'medium',
    sources: 'Ayahuasca and Drug Interaction.pdf (The Good slide)'
  },
  'ayahuasca|methylphenidate': {
    code: 'DAN',
    summary: 'Listed in contraindicated stimulant class with ayahuasca.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'ayahuasca|nn_dmt': {
    code: 'LOW_MOD',
    summary: 'Not reported toxic in source context though effects/PK differ by route.',
    confidence: 'medium',
    sources: 'Ayahuasca and Drug Interaction.pdf (summary slide text)'
  },
  'ayahuasca|psilocybin': {
    code: 'CAU',
    summary: 'Reported to intensify effects; not reported toxic but requires caution.',
    confidence: 'medium',
    sources: 'Ayahuasca and Drug Interaction.pdf (pharmahuasca section)'
  },
  'ayahuasca|serotonergic_opioids': {
    code: 'DAN',
    summary: 'Methadone/tramadol/meperidine/tapentadol listed as contraindicated.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'ayahuasca|snri': {
    code: 'DAN',
    summary: 'SNRIs included in contraindicated antidepressant list.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'ayahuasca|ssri': {
    code: 'DAN',
    summary: 'Serotonin syndrome risk explicitly discussed in MAOI context.',
    confidence: 'high',
    sources: 'ayahuasca-interactions.pdf + Ayahuasca and Drug Interaction.pdf'
  },
  'ayahuasca|tobacco_rape': {
    code: 'LOW_MOD',
    summary: 'Generally acceptable with caveats on admixtures.',
    confidence: 'medium',
    sources: 'Ayahuasca and Drug Interaction.pdf (The Good slide)'
  },
  'ayahuasca|tricyclic_ad': {
    code: 'DAN',
    summary: 'Specific tricyclics listed as contraindicated with MAOI context.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'ayahuasca|yopo': {
    code: 'UNS',
    summary: 'Caution noted for yopo blends due 5-MeO-DMT/bufotenine content.',
    confidence: 'medium',
    sources: 'Ayahuasca and Drug Interaction.pdf (Good combinations caveat)'
  },
  'maoi_pharma|psilocybin': {
    code: 'DAN',
    summary: 'Serotonin syndrome or hypertension category in source chart.',
    confidence: 'high',
    sources: 'Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf'
  },
  'ndri_bupropion|psilocybin': {
    code: 'CAU',
    summary: 'Reduced seizure-threshold caution; individualized risk assessment advised.',
    confidence: 'high',
    sources: 'Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf'
  },
  'psilocybin|snri': {
    code: 'LOW_MOD',
    summary: 'Blunted effects with typical 2-week washout guidance.',
    confidence: 'high',
    sources: 'Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf'
  },
  'psilocybin|ssri': {
    code: 'LOW_MOD',
    summary: 'Blunted effects; washout mostly 2 weeks (fluoxetine 6 weeks).',
    confidence: 'high',
    sources: 'Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf'
  },
  'psilocybin|tricyclic_ad': {
    code: 'CAU',
    summary: 'Intensified effects; chart indicates caution with 2-week washout guidance.',
    confidence: 'high',
    sources: 'Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf'
  },
};

const pairKey = (a: string, b: string) => [a, b].sort().join("|");

export const getInteractionEvidence = (drug1: string, drug2: string): InteractionEvidence => {
  if (drug1 === drug2) {
    return {
      code: 'SELF',
      summary: 'Same entity selected; this is not an interaction pair.',
      confidence: 'n/a',
      sources: 'n/a'
    };
  }
  return (
    INTERACTION_RULES[pairKey(drug1, drug2)] || {
      code: 'UNK',
      summary: 'No explicit interaction classification in the current ceremonial source set.',
      confidence: 'low',
      sources: 'source-gap'
    }
  );
};
