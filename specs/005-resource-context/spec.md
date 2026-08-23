# Feature Specification: Resource Cards and Cross-Agent Operational Memory

**Feature Branch**: `feat/005-resource-context`

**Created**: 2026-08-23

**Status**: Draft — needs rebaseline under `PRODUCT.md`; post-RC work must be split before tasks or
implementation

**Input**: Make a registered resource as easy for an Agent to understand and reuse as an
`ssh-hosts` Markdown entry, while preserving SAFA's native credential, policy, approval, and audit
boundaries.

**Owner**: `juju-w/safa` owns the product contract, Agent experience, compatibility fixtures, and
Skill. Encrypted storage, automatic facts and history, native authorization, and trusted-local UI
belong in `juju-w/safa-runtime`.

**Product Alignment**: **Split delivery** — a small user-confirmed Resource name, role, and caution
may support the core RC by improving safe alias selection. Rich Notebook/Timeline memory,
Agent-authored observations, semantic summaries, compaction, ambient session injection, and
`ssh-hosts` migration are **post-RC**. They must stay optional, outside the execution critical path,
and out of the main Skill until weak-Agent evidence passes the `PRODUCT.md` admission gate.

## Delivery boundary

The only core-RC candidate in this specification is an additive, bounded Resource projection with a
user-confirmed safe name, role, and caution. This draft does not authorize implementation of its
Notebook, Timeline, observation, summary, ambient integration, or migration proposals. Those slices
must be split and pass the `PRODUCT.md` feature-admission gate independently.

## Problem statement

SAFA's secure execution path is approaching an internal MVP, but the product still exposes too much
of its implementation model. An Agent may need to discover a resource, inspect it, understand its
capabilities, decide whether context matters, manage a request continuation, and explicitly maintain
memory. A weak Agent therefore has to understand security workflow nouns before it can complete an
ordinary infrastructure task.

`ssh-hosts` feels easier because a loaded Skill gives the Agent a compact, human-readable description
of each machine and lets later work enrich the same shared files. That convenience is real, but the
Markdown also mixes potentially stale prose, connection details, user instructions, and Agent
inference without typed provenance or a native authorization boundary.

SAFA needs the same immediate orientation and accumulating familiarity without making a Markdown
file, remote host, prior Agent, or stored observation authoritative for execution. The normal product
experience must become:

1. recognize the resource;
2. submit one complete task;
3. follow at most one trustworthy human handoff when the task truly requires it; and
4. make the useful result available to the next Agent without user-maintained context work.

## Experience goal

A resource may be presented to Agents and users through a compact **Resource projection** that
becomes more useful over time. “Resource Card” is a design label for that projection, not an
external product object, authorization object, or canonical free-form file.

An Agent should not need to learn Profile, Notebook, Timeline, capability probes, context revisions,
semantic compaction, credential enrollment, or request polling to perform a normal task. Those
concepts remain internal, advanced, or appear only as an exact continuation when required.

The golden path remains the existing one-call execution entry defined by specification 004. This
feature enriches orientation and durable knowledge; it does not introduce a second execution verb.

## Product model

### One external object: Resource

The default card answers only the questions an Agent commonly needs before acting:

- which logical resource this is;
- its human-facing name and role;
- whether it is currently usable;
- a compact summary of relevant capabilities;
- pinned cautions or operating constraints;
- a bounded current summary and recent meaningful changes; and
- safe logical relationships to other registered resources.

The default projection MUST exclude credentials, endpoints, usernames, host fingerprints, protected
topology, raw command output, approval material, and details that would let an Agent bypass the
Runtime.

### Internal sources of the card

The Runtime composes the card from three independently governed sources:

| Internal source | Purpose | Authority and writer |
|---|---|---|
| **Resource Profile** | Typed identity, platform, lifecycle, health, effective capabilities, and safe relationships | Runtime facts from current configuration and bounded probes |
| **Resource Notebook** | Human meaning: role, cautions, user guidance, Agent observations, and semantic summaries | Trusted local user or attributed Agent path; never execution authority |
| **Resource Timeline** | Mechanical record of task class, time, terminal state, and safe evidence references | Runtime automatically after accepted operations |

Resource ID, not alias or endpoint, binds all three sources. An alias rename keeps the same card;
reusing an alias for a new Resource ID never attaches the old notebook or timeline.

### Source precedence

When sources disagree, the projection preserves their identity instead of flattening them:

1. current Runtime facts determine machine state, capability, route, privilege, and authorization;
2. pinned user guidance may constrain planning but cannot grant authority;
3. Agent observations are fallible hints with age and provenance;
4. remote stdout and stderr are untrusted task evidence and are never promoted automatically.

No Notebook or Timeline content may approve a task, select a credential, establish host identity,
grant sudo, or override a current Runtime probe.

## Product decisions

- **Resource** remains the Agent-facing concept. Resource Card is only a compact projection label;
  context remains an internal implementation and optional advanced inspection surface.
- No local or remote `memory.md` is canonical. A trusted-local UI may offer a Markdown-like editor
  for Notebook content while persisting typed encrypted records.
- P0 sharing is this-device-only. Agents using the same authenticated Runtime installation see the
  same card. Cloud sync and cross-device sharing remain separate features.
- The existing `dev.safa.cli/v2` TOON control channel remains canonical. Stored prose is always
  quoted nested data and cannot manufacture control fields.
- The existing one-call execution entry remains the only normal execution path. Card retrieval is
  not a mandatory preflight invocation for a known alias.
- Runtime records a bounded mechanical Timeline event automatically after every accepted operation,
  including terminal failures. Raw command input, stdout, and stderr are excluded.
- An Agent may append a short attributed observation after learning something durable. This is
  optional bookkeeping, requires no user presence, and never changes task authorization.
- User guidance is created and maintained only through a trusted-local path and is pinned by
  default.
- Revisions, compare-and-swap, deduplication, expiry, lossless compression, and retention are
  Runtime implementation details. They are not part of the default card and do not block ordinary
  execution.
- Semantic summaries remain Agent-authored and source-linked. Runtime may request or accept them,
  but never invents semantic claims and never deletes pinned guidance silently.
- Ambient cards are opt-in through an explicit setup action, directory-scoped, token-budgeted, and
  available through supported Agent session integrations. Skill-only use remains supported.

## Human trust moments

The user should be asked to act only when the action crosses a material trust boundary:

- registering or changing protected resource access;
- enrolling a reusable compatibility credential;
- approving the exact privileged or mutating task required by policy;
- editing pinned user guidance or trust policy; or
- deleting a resource and its persistent data.

Resource discovery, card reads, current capability probes, Timeline maintenance, safe progress
waiting, and attributed Agent observations MUST NOT require the user to remain at the computer.

## User scenarios and testing

### User Story 1 — Start with enough resource understanding (Priority: P1)

A new Agent session receives a compact safe view of relevant resources and can identify the intended
machine or service from its logical role without first interrogating every resource.

**Why this priority**: Immediate orientation is the main usability advantage users currently feel in
`ssh-hosts`. Without it, durable memory exists but remains hidden behind extra calls.

**Independent test**: In an isolated Agent session with the opt-in integration enabled, seed
synthetic resources and cards, then verify the session receives only the relevant bounded card list
and can select an unambiguous alias without invoking discovery.

**Acceptance scenarios**:

1. **Given** the current workspace has relevant registered resources, **when** a new Agent session
   starts, **then** it receives a compact card list containing safe aliases, display names, roles,
   health summaries, and only the smallest useful caution or change signal.
2. **Given** no resource is relevant to the current directory, **when** a session starts, **then**
   the integration emits a definitive empty state rather than unrelated global inventory.
3. **Given** the card list exceeds its token budget, **when** it is projected, **then** it includes
   exact total and returned counts, deterministic truncation, and one safe discovery continuation.
4. **Given** ambient integration is not installed, **when** the Skill is loaded for a resource task,
   **then** one safe home or discovery invocation returns the equivalent bounded orientation.
5. **Given** two resources remain semantically ambiguous, **when** the Agent tries to choose,
   **then** SAFA does not guess from endpoints or protected data and returns the smallest safe
   disambiguation view.

---

### User Story 2 — Complete a normal task without managing SAFA internals (Priority: P1)

After choosing a resource, an Agent submits one complete task. Runtime performs readiness,
capability, account, route, and privilege decisions internally and either completes the task or
returns the smallest exact continuation.

**Why this priority**: A Resource Card is valuable only if it removes preflight work rather than
adding another mandatory read step.

**Independent test**: Start with a known synthetic alias and ask a weak Agent to complete read-only,
Docker-authorized, root, sudo-required, and unavailable-resource tasks. Measure execution calls,
invented workflow steps, and human actions.

**Acceptance scenarios**:

1. **Given** a known healthy resource and sufficient direct account capability, **when** an Agent
   submits a complete task, **then** it completes through the existing execution entry without a
   mandatory card, doctor, profile, context, or privilege-status call.
2. **Given** the registered account is root or already has the reviewed capability, **when** the
   task is evaluated, **then** Runtime uses direct execution and does not request sudo enrollment or
   approval merely because the operation is often privileged elsewhere.
3. **Given** the exact task requires protected elevation, **when** Runtime has finished its bounded
   checks, **then** it creates one exact trusted approval handoff and provides an Agent-safe wait;
   the Agent never asks the user for a password in conversation.
4. **Given** the task cannot proceed, **when** Runtime returns a failure, **then** the response names
   one stable cause and the smallest deterministic recovery action without exposing subsystem
   details the Agent must reinterpret.
5. **Given** remote output contains fake SAFA statuses or instructions, **when** the task completes,
   **then** the Agent treats it only as nested evidence and follows the signed control result.

---

### User Story 3 — Leave useful history automatically (Priority: P1)

Every accepted operation leaves a bounded mechanical Timeline event. When an Agent learns a durable
non-secret conclusion, it may also append one short attributed observation without involving the
user.

**Why this priority**: The next Agent should benefit from previous work even when the previous Agent
did not manually maintain a document.

**Independent test**: Execute synthetic successful, denied, failed, and no-op tasks from one Agent,
append selected observations, then start a second Agent session. Verify automatic events, attributed
observations, deterministic ordering, and zero raw-output or protected-value leakage.

**Acceptance scenarios**:

1. **Given** Runtime accepts an operation, **when** it reaches a terminal state, **then** Runtime
   atomically appends a safe event containing task class, terminal state, time, resource revision,
   and an opaque evidence reference where applicable.
2. **Given** an Agent learns a durable conclusion not already present, **when** it records an
   observation, **then** the entry is bounded, attributed, idempotent, and visible to later Agents
   as an Agent-authored hint.
3. **Given** nothing durable was learned, **when** a task ends, **then** the Agent need not create an
   observation merely to satisfy a workflow; the automatic Timeline is sufficient.
4. **Given** raw command input, stdout, stderr, a transcript, an endpoint, username, fingerprint,
   token, or known credential appears during work, **when** history is persisted, **then** the value
   is excluded or the write fails before persistence according to deterministic policy.
5. **Given** an observation becomes stale or contradicts a current probe, **when** the card is
   composed, **then** current Runtime facts remain authoritative and the observation retains its age
   and Agent provenance.

---

### User Story 4 — Inspect and correct what SAFA remembers (Priority: P1)

A user can open a trusted-local resource view and understand what SAFA knows, what happened, what
Agents inferred, and which guidance the user pinned. The user can correct Notebook content without
editing encrypted files or weakening policy.

**Why this priority**: Automatic memory without inspectability feels opaque and can accumulate wrong
assumptions. `ssh-hosts` is trusted partly because its files are visible and editable.

**Independent test**: Populate a synthetic card with current facts, user guidance, Agent
observations, summaries, and events. Verify the trusted-local view separates the sources, supports
correction and removal of Notebook entries, and cannot edit Runtime facts or audit evidence.

**Acceptance scenarios**:

1. **Given** a resource has all three internal sources, **when** the user opens it locally, **then**
   the experience separates Overview, Activity, Guidance, and Access without exposing credentials.
2. **Given** an Agent observation is wrong, **when** the user corrects or removes it, **then** the
   change is auditable and future cards stop presenting the old observation as current.
3. **Given** a user adds operating guidance, **when** it is committed locally, **then** it is marked
   user-authored and pinned by default but still cannot grant execution authority.
4. **Given** guidance conflicts with a current Runtime fact, **when** the resource is displayed,
   **then** the conflict is visible and the Runtime fact remains authoritative for execution.

---

### User Story 5 — Migrate the useful `ssh-hosts` experience safely (Priority: P1)

An existing `ssh-hosts` user can bring human-friendly names, roles, cautions, and logical service
relationships into SAFA without letting an Agent scrape secrets or silently convert Markdown into
trusted execution configuration.

**Why this priority**: A secure replacement that discards accumulated machine knowledge creates a
large switching cost and will continue to feel less useful after installation.

**Independent test**: Use synthetic `hosts.md` and `services.md` fixtures containing safe notes,
connection details, shell examples, stale statements, and secret-like values. Run a trusted-local
preview and import, then verify only approved semantic content becomes user guidance and no
credential, endpoint, command, or authority is imported into the wrong store.

**Acceptance scenarios**:

1. **Given** existing Markdown contains display names, roles, cautions, and logical relationships,
   **when** the user runs a trusted-local migration preview, **then** each candidate is classified
   and displayed before any write.
2. **Given** Markdown contains endpoints, usernames, private keys, tokens, passwords, or executable
   command examples, **when** it is previewed, **then** those values are never ingested as Notebook
   guidance or exposed to an Agent; protected access uses normal native resource enrollment.
3. **Given** a statement is ambiguous or stale, **when** it cannot be safely classified, **then** it
   remains unimported until the user explicitly edits or accepts it.
4. **Given** imported semantic metadata is accepted, **when** a new Agent session starts, **then**
   the resulting Resource Card preserves the familiar logical name, role, caution, and service
   relationship without requiring the old Skill.
5. **Given** migration has not passed resource verification, **when** the old files remain present,
   **then** SAFA does not delete or rewrite them and reports migration as incomplete.

#### Migration journey

| Familiar `ssh-hosts` behavior | SAFA replacement experience |
|---|---|
| Skill loads machine descriptions | Opt-in session integration loads bounded Resource Cards |
| Agent matches a human name to a host | Agent selects a stable safe alias using display name and role |
| Markdown contains connection details | Native Runtime owns protected resource access and identity |
| Agent edits shared Markdown after work | Runtime appends Timeline automatically; Agent adds attributed observations when useful |
| User opens a file to correct context | Trusted-local Notebook view provides Markdown-like editing with source labels |
| Later Agent reads accumulated notes | Later Agent receives the updated card through the same local Runtime |

---

### User Story 6 — Retain and compact memory without workflow interruption (Priority: P2)

The card remains bounded as history grows. Runtime performs deterministic storage maintenance, and
Agent summaries preserve provenance, without making compaction a prerequisite for execution.

**Why this priority**: Bounded memory is necessary for long-lived use, but visible compaction
workflows would recreate the complexity this feature is intended to remove.

**Independent test**: Fill a synthetic Notebook and Timeline past their soft limits while continuing
normal execution. Race observation writers and semantic summaries, then verify linear history,
bounded cards, preserved guidance, and no blocked task caused solely by context maintenance.

**Acceptance scenarios**:

1. **Given** Timeline exceeds its projection or storage threshold, **when** maintenance runs, **then**
   Runtime applies deterministic retention and lossless compression without an Agent-visible task.
2. **Given** observations would benefit from semantic summarization, **when** an Agent supplies a
   summary for an exact source set, **then** the summary is appended atomically and retains links to
   recoverable source entries.
3. **Given** a concurrent Notebook change occurs, **when** a semantic summary commits, **then** the
   stale write fails safely or is retried by the integration without blocking unrelated execution.
4. **Given** the hard capacity limit is reached, **when** Runtime cannot safely retain another
   observation, **then** optional observation writes fail explicitly while resource execution and
   pinned guidance remain available.

---

### User Story 7 — Preserve cards through lifecycle and replacement (Priority: P2)

Cards survive Broker restart, alias change, and compatible signed Runtime replacement. Removal and
publisher-Team migration retain the same persistent-data safety boundary as credentials.

**Independent test**: Create all three card sources, restart the Broker, rename the alias, perform a
signed compatible replacement, and finally remove the synthetic resource. Verify preservation,
identity binding, explicit removal disposition, and zero orphan data.

**Acceptance scenarios**:

1. **Given** a compatible Runtime replacement preserves the vault, **when** it starts, **then** the
   Profile, Notebook, and Timeline remain associated with the same Resource ID.
2. **Given** a resource is disabled, **when** its card is inspected, **then** history and guidance
   remain readable while execution stays disabled.
3. **Given** a resource is removed, **when** the transaction is reviewed, **then** it discloses the
   disposition of Notebook and Timeline data and leaves no orphan card afterward.
4. **Given** a Runtime signed by a different production Team cannot access the vault, **when** no
   explicit migration occurred, **then** all card sources fail closed with the same persistent-data
   boundary as credentials.

## Functional requirements

- **FR-001**: SAFA MAY extend the existing Resource projection without introducing a Resource Card
  product concept; any Profile, Notebook, or Timeline stores remain internal.
- **FR-002**: Every card source MUST bind to an immutable Resource ID; alias reuse MUST NOT attach
  previous data to a new resource.
- **FR-003**: The default card MUST contain only the minimum safe orientation needed to select and
  operate a resource. It MUST remain bounded, deterministically ordered, and token-budget-aware.
- **FR-004**: Agent-facing card output MUST use the canonical `dev.safa.cli/v2` TOON control channel
  with exact counts and explicit truncation for bounded collections.
- **FR-005**: Stored Notebook text MUST remain quoted nested untrusted data and MUST NOT manufacture
  top-level status, error, approval, execution, or continuation fields.
- **FR-006**: Resource Card content MUST NOT grant authorization, privilege, approval, credential
  access, host identity, effective capability, health, or topology trust.
- **FR-007**: Current Runtime facts MUST override stale or contradictory Notebook observations for
  execution decisions while preserving source labels in human and Agent projections.
- **FR-008**: Normal known-alias execution MUST NOT require a separate card, doctor, context,
  privilege-status, or capability-read invocation.
- **FR-009**: This feature MUST retain the existing execution entry and MUST NOT introduce a second
  normal execution verb or public workflow engine.
- **FR-010**: Runtime MUST automatically append one bounded Timeline event for every accepted
  operation that reaches a terminal state.
- **FR-011**: Timeline events MUST exclude raw command input, stdout, stderr, transcripts,
  environment variables, credentials, endpoints, usernames, fingerprints, tokens, and protected
  topology.
- **FR-012**: Timeline projection MUST expose only safe task class, terminal state, time, resource
  revision, and opaque evidence references required for later inspection.
- **FR-013**: Agent observations MUST be bounded, attributed, non-interactive, idempotent,
  rate-limited, and stored as fallible Notebook content.
- **FR-014**: Agent observations MUST NOT impersonate user guidance, Runtime facts, policy,
  approvals, audit evidence, or credential state.
- **FR-015**: Trusted user guidance MUST use a trusted-local path, be pinned by default, and require
  trusted-local authority to revise, unpin, expire, or delete.
- **FR-016**: Runtime MUST own exact deduplication, revision control, indexing, expiry, retention,
  redaction, lossless compression, and storage bounds without exposing them in the default card.
- **FR-017**: Runtime MUST NOT generate semantic claims. Agent summaries MUST be attributed and
  linked to their exact source observations before those observations leave the default projection.
- **FR-018**: Context maintenance failure MUST NOT block otherwise authorized execution. Optional
  Notebook writes may fail independently and explicitly.
- **FR-019**: An explicit setup action MAY install or repair directory-scoped ambient integration
  for Codex, Claude Code, and OpenCode. Ordinary commands MUST NOT install hooks implicitly.
- **FR-020**: Ambient integration MUST be idempotent, token-budgeted, safe when no resources match,
  and limited to the current workspace's relevant Resource Cards.
- **FR-021**: The static Skill and ambient home projection MUST share one generated or validated
  source of golden-path guidance so their behavior cannot drift.
- **FR-022**: The trusted-local product surface MUST separate Overview, Activity, Guidance, and
  Access, and MUST make source class and authority visible without exposing credentials.
- **FR-023**: A trusted-local `ssh-hosts` migration MUST classify and preview every candidate before
  writing Profile, Notebook, relationship, or protected enrollment data.
- **FR-024**: Migration MUST NOT allow an Agent to scrape, submit, or classify secrets in
  conversation. Protected access data MUST use the native trusted enrollment path.
- **FR-025**: Migration MUST be non-destructive until the imported resources pass explicit
  verification; SAFA MUST NOT delete or rewrite source Markdown automatically.
- **FR-026**: Resource removal MUST disclose and authorize the disposition of Notebook and Timeline
  data in the same trusted transaction.
- **FR-027**: Compatible signed Runtime replacement smoke MUST prove Profile, Notebook, Timeline,
  vault, and credential preservation together. Deleting user state is not a migration workaround.
- **FR-028**: New public fields, commands, lifecycle values, and errors require AXI review,
  compatibility analysis, JSON/TOON fixtures, strict decode tests, and Skill drift validation before
  entering `dev.safa.cli/v2`.
- **FR-029**: Weak-Agent evaluation MUST measure task completion, SAFA invocation count, human-action
  count, invented commands, unsafe fallback, context-source confusion, and protected-data leakage.
- **FR-030**: Resource discovery, card reads, safe probes, Timeline maintenance, Agent observation
  writes, and safe waiting MUST NOT require trusted user presence.

## Key entities

- **ResourceCardProjection**: A bounded, safe, read-only composition optimized for Agent orientation
  and local human inspection. It has no independent authority.
- **ResourceProfile**: Typed current resource facts, lifecycle, health, effective capabilities, and
  safe logical relationships owned by Runtime.
- **ResourceNotebook**: Encrypted semantic context bound to a Resource ID. It contains pinned user
  guidance, attributed Agent observations, and attributed summaries.
- **ResourceNotebookEntry**: Immutable bounded semantic content with opaque ID, source class,
  creation time, lifecycle state, provenance, and optional source or request references.
- **ResourceTimelineEvent**: Runtime-authored mechanical history for one accepted operation. It
  records safe classification and terminal outcome, never raw task content or output.
- **ResourceRelationship**: A typed safe logical relation between registered resources, separate
  from protected network topology.
- **ContextRetentionPolicy**: Internal bounds and retention rules protecting pinned guidance and
  recoverable provenance without appearing in ordinary Agent workflows.

## Success criteria

- **SC-001**: With ambient integration enabled, a new weak-Agent session correctly selects an
  unambiguous synthetic resource from its display name and role without a discovery invocation in at
  least 95% of evaluation cases.
- **SC-002**: A known-alias normal task reaches the existing execution entry in one Agent-visible
  operation with zero mandatory context-maintenance or privilege-status calls.
- **SC-003**: A privileged exact task requires no more than one user approval after initial resource
  and compatibility-credential enrollment.
- **SC-004**: 100% of accepted synthetic operations produce one terminal Timeline event, and a
  100-run leakage suite emits no protected endpoint, username, fingerprint, credential, token, raw
  command, stdout, stderr, or transcript through cards, history, errors, fixtures, or audit views.
- **SC-005**: A later isolated Agent session sees the current pinned guidance, summary, and recent
  meaningful changes without user-maintained file edits or mandatory remote probing.
- **SC-006**: Weak-Agent evaluation distinguishes Runtime facts, user guidance, Agent observations,
  remote evidence, and control output correctly in at least 90% of scenarios with zero authorization
  or trusted-action violations.
- **SC-007**: Default ambient cards remain within the pinned token and byte budget, report exact
  truncation, and add no more than the reviewed session-start latency budget.
- **SC-008**: Synthetic `ssh-hosts` migration imports 100% of explicitly accepted safe names, roles,
  cautions, and logical relations while importing zero endpoints, credentials, executable examples,
  or unreviewed ambiguous statements as Notebook guidance.
- **SC-009**: Broker restart, alias change, and signed compatible Runtime replacement preserve all
  card sources; resource removal leaves zero orphan Notebook or Timeline records.
- **SC-010**: In weak-model usability evaluation, ordinary tasks require zero user context
  maintenance and produce no invented context, compaction, request-management, or privilege
  workflow steps.

## Compatibility analysis

This draft does not itself change `dev.safa.cli/v2`. It changes the product decomposition and the
requirements that future contract work must satisfy.

- Existing `safa exec`, resource discovery, approval continuations, and `next.safe_for_agent`
  semantics remain authoritative.
- A Resource Card may be introduced as an additive safe projection or as an additive expansion of
  the existing home/detail view. The planning phase must choose the smallest AXI-reviewed vocabulary
  and must not add a duplicate execution path.
- Existing Profile fields remain typed Runtime facts. Notebook and Timeline data must use new
  optional typed fields or separately versioned detail projections so older v2 decoders can reject
  or ignore them according to the published compatibility rule.
- Revisions, source IDs, retention state, and compaction continuations move out of the default Agent
  projection. Advanced maintenance or trusted-local APIs may retain them.
- The existing opt-in ambient-context clause in `contracts/cli-v2.md` remains valid and is narrowed
  here to Resource Card projections with no transcript capture.
- Every public addition requires representative completed, empty, truncated, conflicting-source,
  hostile-content, migration-preview, and lifecycle fixtures before Runtime implementation.

## Assumptions

- P0 shares cards only among Agents using the same installed, authenticated Runtime and encrypted
  local vault.
- Agent observations are useful but fallible. Age, provenance, and supersession remain available in
  detail views even when omitted from the compact card.
- User guidance may influence planning but never broadens execution authority.
- Exact card, Timeline, Notebook, rate, retention, token, byte, and latency budgets will be pinned
  during planning and enforced by contract tests.
- Existing signing, Keychain access-group, peer validation, audit, approval, and replacement rules
  apply unchanged.
- A trusted-local UI may vary by platform while all supported runtimes conform to the same product
  source and authority model.

## Non-goals

- Cloud sync, cross-device vault replication, or multi-user collaborative editing.
- A canonical Markdown file, remote filesystem watcher, shell history, terminal transcript, or
  automatic ingestion of raw command output.
- Allowing memory, Timeline, remote output, or an Agent to authorize execution or establish trust.
- Vector search, embeddings, or a hosted semantic retrieval service in P0.
- A new task language, unrestricted batch execution, silent standing privilege grants, or replaying
  prior commands.
- Automatically deleting, rewriting, or publishing existing `ssh-hosts` files.
- Replacing native resource enrollment with parsing connection secrets from Markdown.
- Publishing an installer, tag, Release, or Runtime manifest while the repository publication hold
  remains active.

## Questions for planning

- Choose whether the compact Resource Card extends the safe home/detail views or requires one new
  read-only projection, using weak-model call count and token cost as the deciding evidence.
- Fix exact ambient and detail budgets, including how many cards, cautions, relationships, changes,
  and summary characters appear by default.
- Define the smallest durable-observation heuristic so the Skill records useful conclusions without
  producing a note after every task.
- Decide the platform-neutral contract for the trusted-local Overview, Activity, Guidance, and
  Access experience without leaking native IPC details.
- Define a non-destructive synthetic `ssh-hosts` migration fixture and trusted-local confirmation
  flow before any real-data migration implementation.
