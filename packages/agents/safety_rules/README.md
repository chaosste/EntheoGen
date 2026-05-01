# Safety Rules

Purpose: define draft-only safety signal rules that route review context to the
Ethics Advisor workflow without adding new decision authority.

This package supports Safety Sentinel outputs. Rules classify signals for review;
they do not decide safety, approve escalation outcomes, or block workflow by
themselves.

## Files

- `rules.json` - rule labels, severities, review-routing surfaces, and workflow
  labels.
- `examples/high-risk-interaction.example.json` - minimal rule output example.

## Output Boundaries

Automation may:

- classify visible safety signals,
- name the trigger and evidence span,
- suggest a workflow label and reviewer role,
- propose whether a human should consider pausing downstream work.

Humans must approve:

- interpretation,
- escalation outcome,
- any consequential workflow action,
- any follow-on communication or dataset change.

## Verification

```bash
npm run agents:verify-safety
```

Expected output: rules and examples parse successfully, workflow labels are
within the declared set, Ethics Advisor pathways are represented, and no rule
claims autonomous decision authority.
