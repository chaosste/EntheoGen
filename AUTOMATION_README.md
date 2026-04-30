# EntheoGen Automation & Workflow Execution

This document describes how EntheoGen uses workflow automation, role
augmentation, and PR-based execution around the live application and dataset.

The current system is treated as live and operational. Work should preserve
stability and avoid unnecessary foundational redesign, while still allowing
normal product, data, tooling, and reliability improvements.

## Scope

This is not a build or setup guide. It defines how work is executed, how roles
interact, and how automation operates within the live workflow.

Included:

- Linear-driven workflow execution.
- Codex implementation and maintenance work.
- GitHub PR-based review for consequential system and dataset changes.
- Role-aligned automation responsibilities.
- Dataset interaction through controlled, reviewable workflows.
- Integrations with approved tools and services.

Not included:

- Autonomous replacement of human decision authority.
- Unreviewed production mutation.
- Unscoped database, schema, or infrastructure redesign.
- Bypassing safety, evidence, publication, or deployment gates.

## Core Principles

### Human Authority

Humans retain final authority over ethics, safety, evidence interpretation,
publication, participant welfare, and consequential product scope.

Automation may draft, extract, compare, summarize, flag, test, and implement
reviewable changes. It does not approve its own consequential outputs.

### Workflow Over Autonomy

Automation improves coordination, throughput, visibility, and quality. It does
not replace judgement, approval, or accountability.

### PR-Based Execution

Consequential system and dataset changes should be produced as reviewable
artifacts, normally GitHub branches and pull requests. Humans review and approve
before deployment.

Small local fixes, documentation edits, scripts, tests, and verification updates
may be made directly in the working tree when requested. They still need to be
reviewable and reversible.

### Linear As Workflow Authority

Linear defines work, ownership, state, and approval requirements. It is the
workflow authority, not a substitute for human judgement and not an execution
engine by itself.

### Bounded Execution

Codex should stay within the intent of assigned work. It may inspect the repo,
run relevant verification, and make small adjacent fixes when needed to complete
the task safely.

If a task requires meaningful scope expansion, Codex should document the reason
and keep the resulting change reviewable.

## Operational Architecture

The workflow uses several tools. These tools support delivery; they do not
create independent authority.

- **Linear**: workflow control, state, ownership, and approvals.
- **Codex**: repo inspection, implementation, verification, and reviewable
  output.
- **Cursor**: optional reasoning, drafting, transformation, and editing support.
- **GitHub Copilot**: optional implementation acceleration.
- **GitHub**: version control, pull requests, review, and change history.
- **Azure**: current deployment target for the live application at
  `https://entheogen.azurewebsites.net/`.
- **Supabase**: allowed data, auth, storage, and database integration surface
  when explicitly scoped and safely verified.
- **Cloudflare/Wrangler**: allowed worker, edge, tooling, and deployment-support
  surface when explicitly scoped and safely verified.
- **Slack**: allowed communication, notification, triage, and workflow bridge
  surface when explicitly scoped.
- **Other approved tools**: allowed when they support the requested work, follow
  the same approval boundaries, and do not introduce unreviewed authority.

## Integration Allowances

Automation may interact with external services when the interaction is scoped to
the task, uses already-approved credentials or local configuration, and produces
reviewable output.

Allowed examples:

- Reading workflow state, issues, PRs, logs, diagnostics, or channel context.
- Running health checks, dry runs, local validation, and type checks.
- Posting or drafting Slack updates when explicitly requested.
- Preparing Supabase migrations, policies, queries, or schema changes for human
  review.
- Running Wrangler or Cloudflare commands for local development, validation, dry
  runs, and explicitly approved deployment-support work.
- Generating branches, PR descriptions, changelogs, summaries, and structured
  review packets.

Boundaries:

- Do not add or expose real secrets.
- Do not mutate production without explicit scope and approval.
- Do not publish autonomously.
- Do not modify schemas, databases, auth rules, or infrastructure unless the
  work is explicitly scoped and reviewable.
- Prefer dry runs, local verification, and PR-based changes before live effects.
- If a service action is high-impact or irreversible, stop and surface the
  approval requirement.

## Execution Flow

Typical consequential change flow:

```text
User or team need
↓
Linear issue or explicit scoped task
↓
Codex implementation and verification
↓
GitHub branch or reviewable working-tree diff
↓
Human review and approval
↓
Approved deployment pipeline
↓
Live Azure application
```

Approval and deployment gates must not be skipped for consequential changes.
Small non-production docs, scripts, tests, and local verification fixes do not
need ceremony beyond clear scope and reviewable diffs.

## Role-Based Automation

Automation is aligned to human roles. It supports role responsibilities without
replacing role authority.

### Product Lead

Automation supports summaries, release visibility, planning context, issue
drafting, and workflow tracking.

The Product Lead retains scope decisions, approval authority, and governance
ownership.

### Data Curator

Automation supports structured drafts, duplicate detection, normalization,
formatting, evidence comparison, and changelog preparation.

The Data Curator retains scientific judgement and final content approval.

### Ethics Advisor

Automation supports risk flag surfacing, structured summaries, missing-context
identification, and escalation packets.

The Ethics Advisor retains ethical judgement and approval authority.

### Technical Lead

Automation supports implementation, CI/CD, testing, diagnostics, integration
work, and reliability improvements.

The Technical Lead retains architecture ownership and system integrity
authority.

### Beta Coordinator / UX

Automation supports intake, classification, summarization, issue creation, and
feedback synthesis.

The Beta Coordinator / UX role retains human interaction and experience
judgement.

## Dataset Interaction Model

The deployed dataset is the current authoritative baseline. It is not assumed to
be final or complete.

Dataset updates should be reviewable:

```text
proposed change -> branch or diff -> PR/review -> approval -> merge -> deployment
```

Automation may draft, extract, normalize, and compare dataset changes. Humans
approve scientific interpretation, safety classification, and publication.

Canonical dataset files should be named in the task or issue when a change
depends on them. Do not assume a source workspace's file layout matches this
repository.

## Automation Components

Automation operates as role-aligned functions.

### Knowledge Steward

The Knowledge Steward structures data into schema-aligned drafts, separates
extracted facts from inferred suggestions, preserves uncertainty notes, and
generates summaries or changelogs.

Outputs are review material, not final approval.

### Safety Sentinel

The Safety Sentinel identifies risk signals, missing context, and escalation
needs.

Outputs are flags and recommendations, not final decisions.

### Workflow Integration

Linear tracks work and responsibility. GitHub tracks execution artifacts. Azure
is the current live deployment target. Supabase, Cloudflare/Wrangler, Slack, and
other approved tools may support the workflow within the boundaries above.

## Non-Automated Decisions

The following decisions remain human-controlled:

- Ethics approval.
- Safety classification approval.
- Publication approval.
- Participant welfare decisions.
- Final scientific claim interpretation.
- High-impact production or infrastructure changes.

Automation may prepare the materials that inform these decisions, but it does
not make or approve them.

## Definition Of Done

Automation alignment is healthy when:

- Linear or an explicit user request defines the work and owner.
- Codex can build, fix, verify, and document bounded changes.
- Consequential changes are reviewable through GitHub or equivalent review.
- Human approval gates are preserved.
- The approved deployment pipeline controls live deployment.
- The dataset remains a protected authoritative baseline.
- Automation improves workflow without taking over authority.

## Ongoing Work

Ongoing work may include workflow alignment, documentation clarity, automation
refinement, role-based execution improvements, product changes, dataset
corrections, integration work, reliability fixes, and normal implementation.

Foundational redesign should be explicitly scoped and reviewed, not smuggled
into routine automation work.

## References

- `AGENTS.md`
- `docs/automation/AUTOMATION_AGENTS.md`
- `AUTOMATION_GOVERNANCE.md`
- `AUTOMATION_PHASE_1_BACKLOG.md`

## Core Principle

Codex builds within EntheoGen. It does not govern EntheoGen.

Codex executes bounded work, produces reviewable outputs, verifies its changes,
and leaves consequential approval to humans and the approved workflow.
