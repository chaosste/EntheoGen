# EntheoGen Automation Agents

## Core Principle

Automation supports EntheoGen. It does not control EntheoGen.

Linear defines work. Codex executes tasks. Humans approve outcomes. The system
enforces results.

Linear issue states are operational signals: `Backlog`, `Todo`, `In Progress`,
`In Review`, `Done`, `Canceled`, and `Duplicate`. Automation may move work
between these states when scoped to the issue, but those transitions are not
human approval for dataset, publication, safety, or production outcomes.

## Automation Role

Automation supports workflow execution, role augmentation, and structured output
generation. It does not replace human authority, approval, or governance.

Automation outputs must be reviewable and non-destructive. Consequential system
and dataset changes should be PR-based. Automation treats Linear as the workflow
authority and operates conservatively under uncertainty.

Automation may interact with approved services such as Azure, Supabase,
Cloudflare/Wrangler, Slack, GitHub, and Linear when the interaction is scoped,
uses approved credentials or local configuration, and preserves human approval
boundaries.

## Output Discipline

Automation outputs must:

- Distinguish extracted facts from inferred suggestions.
- Identify missing information.
- Preserve uncertainty notes.
- Emit structured errors instead of failing silently.

## Audit Compatibility

Automation records should include these audit-compatible fields:

- `item_id`
- `actor`
- `timestamp`
- `action_context`
- `rationale`

## Hard Prohibitions

Automation must not:

- Mutate production without explicit scope and approval.
- Publish autonomously.
- Modify schemas or databases unless explicitly scoped by a Linear issue.
- Treat workflow-state updates as approval decisions.
- Bypass human approval gates.
- Bypass workflow transition guards for publication-aligned state changes.

## Components

### Knowledge Steward

The Knowledge Steward supports the Data Curator and Product Lead by helping
extract, normalize, compare, and summarize knowledge artifacts. It may suggest
updates, identify conflicts, and prepare structured review material, but humans
approve changes.

```json
{
  "component": "knowledge_steward",
  "item_id": "NEW-000",
  "actor": "codex",
  "timestamp": "2026-04-30T00:00:00.000Z",
  "action_context": "summarize candidate interaction evidence",
  "rationale": "prepare reviewable curator input without changing source data",
  "extracted_facts": [
    {
      "source": "placeholder-source-id",
      "fact": "Extracted fact stated by the source.",
      "confidence": "medium"
    }
  ],
  "inferred_suggestions": [
    {
      "suggestion": "Suggested review action.",
      "basis": "Why the suggestion follows from the extracted facts.",
      "confidence": "low"
    }
  ],
  "missing_information": [
    "Information needed before approval."
  ],
  "uncertainty_notes": [
    "Known ambiguity or limitation."
  ],
  "review_required_by": [
    "Data Curator",
    "Product Lead"
  ],
  "errors": []
}
```

### Safety Sentinel

The Safety Sentinel supports the Ethics Advisor, Product Lead, and Data Curator
by identifying safety risks, approval gaps, and uncertainty that should block or
escalate automation output. It may recommend review paths, but it does not make
governance decisions.

```json
{
  "component": "safety_sentinel",
  "item_id": "NEW-000",
  "actor": "codex",
  "timestamp": "2026-04-30T00:00:00.000Z",
  "action_context": "screen proposed automation output",
  "rationale": "surface safety and governance issues before human approval",
  "extracted_facts": [
    {
      "source": "placeholder-source-id",
      "fact": "Extracted safety-relevant fact.",
      "confidence": "high"
    }
  ],
  "risk_flags": [
    {
      "risk": "Potential safety concern.",
      "severity": "medium",
      "basis": "Evidence or policy reason for the flag."
    }
  ],
  "inferred_suggestions": [
    {
      "suggestion": "Escalate for ethics review.",
      "basis": "Why escalation is warranted.",
      "confidence": "medium"
    }
  ],
  "missing_information": [
    "Information needed before safe approval."
  ],
  "uncertainty_notes": [
    "Known ambiguity or limitation."
  ],
  "approval_gate": {
    "required": true,
    "owner": "Ethics Advisor",
    "reason": "Safety risk requires human review."
  },
  "errors": []
}
```

## Structured Errors

When automation cannot complete a requested operation, it should emit an error
object instead of failing silently:

```json
{
  "error": {
    "code": "missing_required_input",
    "message": "A concise human-readable explanation.",
    "missing_information": [
      "Specific missing input."
    ],
    "recoverable": true
  }
}
```

## Escalation Mapping

- Safety risk -> Ethics Advisor
- Data inconsistency -> Data Curator
- Workflow ambiguity -> Product Lead
- System issue -> Technical Lead

## Publication Path Notes

In this repository, publication-aligned workflow enforcement is represented by:

- workflow transition guards in `scripts/workflow/stateMachine.ts` and
  `scripts/workflow/transitionInteractionUpdateState.ts`
- GitHub branch/PR review
- Azure deployment workflow in `.github/workflows/azure-deploy.yml`

There is no `/apps/api/routes/publish.*` path in the current repo layout.
