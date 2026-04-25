# Knowledge Base Pipeline

This directory is the lightweight source-to-claim pipeline for the EntheoGen interaction dataset.

## Folder Layout

- `sources/` stores raw `.md` and `.txt` source notes.
- `indexes/` stores the source manifest, tag index, and citation registry.
- `extracted/claims/pending/` stores machine-generated claim candidates waiting for review.
- `extracted/claims/reviewed/` stores human-reviewed claims ready for dataset linking.
- `extracted/claims/rejected/` stores claims that were reviewed and rejected.
- `schemas/` stores the JSON Schemas used to validate source and claim records.

The preferred extraction format is `.md` or `.txt`. PDFs can remain archival/source-of-record, but they are not part of the extraction pipeline yet.

## Workflow

1. Add or edit a source file under `knowledge-base/sources/`.
2. Run `npm run kb:extract` to create machine-generated claim candidates in `extracted/claims/pending/`.
3. Review the pending claims manually.
4. Mark reviewed claims as `human_reviewed` or `rejected`.
5. Run `npm run kb:promote` to move reviewed claims into `reviewed/` or `rejected/`.
6. Run `npm run kb:link` to attach reviewed claim source references into the interaction dataset.
7. Run `npm run kb:validate` to verify manifests, claim files, source files, and dataset references.

## Adding a Source

Create a new `.md` or `.txt` file under one of the typed subfolders:

- `academic-papers/`
- `clinical-guidelines/`
- `expert-guidelines/`
- `traditional-contexts/`
- `legal-policy/`
- `pharmacology-reference/`

Frontmatter is optional, but recommended. When present, it can define source metadata such as `source_id`, `title`, `source_type`, `authority_level`, `evidence_domain`, `year`, `authors`, `citation`, and `url_or_path`.

## Extraction

`npm run kb:extract`

The extractor scans `.md` and `.txt` files, looks for explicit interaction/risk/mechanism language, and writes candidate claims into `extracted/claims/pending/`.

All machine-generated claims are provisional. They should be treated as candidates only, not validated evidence.

## Review and Promotion

After human review, set the claim `review_state` to one of:

- `human_reviewed`
- `rejected`
- `needs_revision`

Then run:

`npm run kb:promote`

Reviewed claims move to `reviewed/`, rejected claims move to `rejected/`, and unresolved claims stay in `pending/`.

## Linking

`npm run kb:link`

The linker reads reviewed claims and adds source references to non-SELF interaction records using:

- `supports_pairs`
- entity overlap
- mechanism overlap

It does not modify SELF records, and it does not upgrade weak evidence into strong evidence.

## Validation

`npm run kb:validate`

Validation checks:

- `source_manifest.json` entries against `schemas/source.schema.json`
- claim files against `schemas/claim.schema.json`
- reviewed claims are actually marked `human_reviewed`
- rejected claims are actually marked `rejected`
- reviewed claims reference known source IDs
- manifest entries point to real source files
- dataset source references resolve to known dataset sources

## Safety Note

Machine-extracted claims are not validated evidence. They are the first pass in a review workflow, not a final citation layer.
