# Contract: Resource Notebook, Timeline, and Trusted View

**Status**: Proposed post-RC design; not part of the current selected `dev.safa.cli/v2` contract and
not admitted to the main Skill

This document explores product semantics across platform runtimes. Native IPC operation names and
transport details remain private. Implementation requires a separate `PRODUCT.md` admission review.

## Agent observation

The sole P0 Agent mutation is an optional attributed observation:

```text
safa resource observe ALIAS --text TEXT --idempotency-key KEY [--request-id ID]
```

The command is non-interactive. `TEXT` must already be non-secret and is limited to 512 UTF-8 bytes.
The CLI never prompts for missing text, reads a note from stdin, or accepts a source-class flag.

Request semantics map to `AgentObservationProposalV1`:

- Broker resolves ALIAS to immutable Resource ID.
- Broker derives `agent_observation` and authenticated caller attribution.
- `--request-id`, when present, must identify a terminal request for the same Resource.
- `--idempotency-key` is bounded to 128 bytes and is scoped by caller plus Resource ID.
- one terminal request may originate at most one observation;
- rate limit is 20 observations per Resource per hour;
- safe-text policy runs before persistence.

Completed response:

```toon
schema: dev.safa.cli/v2
command: resource.observe
status: completed
observation:
  resource: storage.synthetic
  outcome: stored
  card_updated: true
```

Identical replay returns `status: no_op` and `outcome: already_present`. Reusing an idempotency key
with different normalized text fails with `resource.observation_idempotency_conflict`. Rejected text
uses `resource.observation_rejected`; capacity uses `resource.observation_capacity_reached`.
Responses and errors never echo the submitted body or the protected value that caused rejection.

Observation failure is independent from task completion and has no authorization effect. The Skill
submits an observation only for a resource-scoped, durable, novel conclusion; routine task success,
transient status, raw output, security facts, and user instructions do not generate an observation.

P2 semantic summary uses the same command vocabulary:

```text
safa resource observe ALIAS --text TEXT --idempotency-key KEY --summary-ticket TICKET
```

`--request-id` and `--summary-ticket` are mutually exclusive. The opaque authenticated ticket binds
the Resource ID, exact source entries, expected Notebook revision, and expiry. It does not grant
execution authority. A valid commit returns `outcome: summary_stored`; stale, expired, wrong-resource,
or replayed-with-different-content tickets fail without changing source entries. Runtime may return
an exact Agent-safe summary continuation during optional maintenance, but execution never waits for
it and the Skill never invents a ticket or source selection.

## Automatic Timeline

Runtime appends one `ResourceTimelineEvent` for each accepted execution or state-changing Resource,
Notebook, workspace-binding, or migration operation when it reaches a terminal state. Safe reads do
not append.

Allowed Agent-visible fields are:

- allowlisted Broker-selected task class;
- terminal state;
- bounded time signal or timestamp in trusted-local detail;
- Resource revision;
- optional opaque evidence reference.

Timeline never contains raw command, intent, stdout, stderr, environment, endpoint, username,
fingerprint, credential, or Agent-authored label. The append is idempotent by evidence reference.
Temporary persistence failure does not rewrite the truthful operation result; Runtime marks bounded
degraded health and retries in memory.

## Trusted-local resource management

The public launch-only entry is:

```text
safa resource manage ALIAS
```

It passes only a safe alias to the separately signed trusted-local helper. The helper communicates
through typed private IPC and renders Overview, Activity, Guidance, and Access in its controlling
terminal. Agent-facing stdout receives only the terminal structured result. When a trusted terminal
is unavailable, the CLI returns `user_action_required` with the exact command marked
`safe_for_agent: false`.

Platform-neutral operations:

```text
GetResourceView(resourceID) -> TrustedResourceViewV1
ListActivity(resourceID, cursor, limit) -> TimelinePageV1
AddGuidance(resourceID, expectedNotebookRevision, entry) -> NotebookMutationResultV1
ReviseGuidance(resourceID, expectedNotebookRevision, oldEntryID, replacement) -> NotebookMutationResultV1
RemoveGuidance(resourceID, expectedNotebookRevision, entryID) -> NotebookMutationResultV1
OpenProtectedAccessAction(resourceID, action) -> platform-authenticated continuation
```

Authority rules:

- Overview Runtime facts are read-only.
- Activity Timeline events are read-only.
- Agent observations may be removed or superseded by the trusted user.
- User guidance is pinned by default and requires trusted-local authority to add or change.
- Access contains status and action identifiers only; values and locators never enter the common
  view DTO.
- Notebook revision is present only in trusted-local mutation DTOs, not the default Agent card.
- A revision conflict returns a fresh trusted-local snapshot; it never asks an Agent to compact or
  merge user guidance.

## Retention

- User-pinned guidance does not expire automatically.
- Agent observations leave the active view after 90 days unless summarized.
- Superseded observations remain recoverable for 30 days.
- At most 16 active user guidance, 64 observations, and 8 summaries exist per Resource.
- Notebook hard limit is 128 KiB per Resource.
- Timeline retains at most 128 events and 64 KiB within 90 days.
- Deterministic expiry runs before optional observation rejection.
- Context maintenance never deletes pinned guidance or blocks authorized execution.

## Resource lifecycle

Alias rename keeps Notebook and Timeline through Resource ID. Disabled resources retain readable
cards but cannot execute. Resource removal atomically deletes Notebook, Timeline, workspace-binding
references, and pending migration bindings. The trusted transaction must disclose this disposition.
Alias reuse never reattaches deleted data.
