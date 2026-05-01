# Safety Sentinel Agent

Purpose: produce review-facing safety signals and routing context without
claiming authority over escalation outcomes or follow-on action.

This package defines the Safety Sentinel prompt and output contract for ENT-015.
It pairs with `packages/agents/safety_rules/`, which defines the rule labels and
review routing surfaces used by the agent.

## Files

- `system.md` - system message for Safety Sentinel.
- `output-contract.json` - JSON Schema for pipeline output.
- `examples/safety-signal.example.json` - sample safety signal with Linear
  draft routing fields.

## Output Boundaries

Automation may:

- classify and explain safety signals,
- prepare Linear routing context,
- recommend reviewer ownership,
- recommend a workflow hold for human review.

Humans must approve:

- escalation outcomes,
- Ethics Advisor interpretation,
- downstream dataset/app changes,
- public or participant-facing follow-on action.

The agent must not imply autonomous escalation authority or hide review
ownership.

## Linear Routing Fields

Linear fields are draft metadata:

- `linear_escalation.create_issue`
- `linear_escalation.team_key`
- `linear_escalation.issue_title`
- `linear_escalation.description`
- `linear_escalation.labels`
- `linear_escalation.priority`
- `linear_escalation.review_owner`
- `linear_escalation.external_refs`

`review_owner` must be `ethics_advisor` for critical, participant-welfare,
consent/data-handling, indigenous-knowledge, and legal/policy signals.

## Verification

```bash
npm run agents:verify-safety
```

Expected output: Safety Sentinel examples match the output contract, Safety
Rules labels match the Sentinel contract, Linear routing fields are present and
review ownership remains human-approved.

## Known Limits

- The verifier checks structure and label compatibility, not ethical truth.
- Linear fields are routing context only; actual issue creation and outcomes
  require human approval.
- Workflow hold recommendations are signals for review, not autonomous blocking
  authority.
