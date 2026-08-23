# Research: Resource Cards and Cross-Agent Operational Memory

**Status**: Design input for a post-RC feature that needs rebaseline; not current behavior

**Reviewed**: 2026-08-23

This research resolves the planning questions in `spec.md`. All examples and future fixtures use
synthetic resources. No existing `ssh-hosts` file, resource endpoint, username, or credential is an
input to these decisions.

## Decision 1: Reuse resource list and show as the Resource Card surface

**Decision**: Resource Card is a product projection, not a new CLI noun. Keep the existing default
`resource list` and no-argument home rows unchanged for `dev.safa.cli/v2`. Add reviewed `card_name`
and `role` values to the command-specific `--fields` allowlist. Define the existing default
`resource show ALIAS` safe object as the detailed card and add optional bounded card fields at the
end. Known-alias execution continues directly through `safa exec` without a card read.

Do not expose the current `Resource.displayName` automatically. `contracts/resource-directory-v1.md`
classifies it as authorized internal context, and the Runtime's `SafeResourceProjection` currently
suppresses it deliberately. `card_name` is a distinct Agent-visible value created or confirmed by a
trusted-local path and filtered by the same safe-text policy as Notebook content.

**Rationale**: `resource list/show` already provide content-first discovery and detail. A parallel
`card` or `context` command would increase weak-Agent vocabulary, create two ways to inspect a
resource, and tempt Agents to add a preflight before every execution. Optional fields and new
allowlisted list fields are additive v2 changes; replacing the current home/list schema is not.

**Alternatives considered**:

- Add `safa card list/show`: rejected because it duplicates resource discovery.
- Put complete cards into the no-argument home response: rejected because every session would pay
  for unrelated Notebook and Timeline data.
- Use `resource show --details`: rejected because that path deliberately requires user presence and
  may disclose authorized connection metadata.
- Publish a `memory.md`: rejected because it cannot preserve typed source and authority boundaries.

## Decision 2: Use explicit workspace bindings for ambient context

**Decision**: Define a platform-neutral `SessionContextProviderV1`. Each supported Agent adapter
runs only at session start and invokes the same safe resource-list projector from the current
working directory. Relevant resources come only from an explicit `WorkspaceResourceBinding` from a
workspace scope to immutable Resource IDs. Bindings are created and changed through trusted-local
setup; SAFA does not scan repository content, transcripts, shell history, or remote output to infer
relevance.

The fixed ambient invocation uses the equivalent of:

```text
safa resource list --scope workspace --fields alias,card_name,role,health
```

Vendor-specific Codex, Claude Code, and OpenCode hook formats remain adapters in the Skill package,
not public CLI contract. Each adapter must pass its own conformance suite before support is claimed.
Install, repair, and deactivate are explicit, directory-scoped, idempotent operations. An adapter
modifies only its namespaced fragment and removes it only when the stored digest still matches.
Hook failure soft-fails and never triggers a remote probe, approval, login, or session-start block.

**Rationale**: The useful `ssh-hosts` behavior is immediate business context, not Markdown as a
storage format. Explicit workspace bindings reproduce that behavior without global inventory
leakage, prompt injection, or automatic guesses. Session-start-only integration has the smallest
blast radius and matches the existing no-transcript contract.

**Alternatives considered**:

- Inject every registered resource globally: rejected for token cost and accidental disclosure.
- Infer resources from repository text or prior conversations: rejected as untrusted and opaque.
- Capture post-tool or session-end transcripts: rejected because it would ingest raw task data.
- Write generated cards into `AGENTS.md`: rejected because facts would become stale and pollute the
  user's repository.

## Decision 3: Map Profile to existing Runtime facts and store memory in the current vault

**Decision**: The product Profile layer maps to the Runtime's existing `Resource`,
`ResourceProfile`, `ResourceVerification`, and `SafeResourceProjection`; do not create another type
named `ResourceProfile`. Add `ResourceNotebook` and `ResourceTimelineEvent` as top-level collections
in `VaultDocument`, each bound by immutable Resource ID. Do not place either in resource metadata or
inside the high-frequency `Resource.profile` aggregate.

P0 uses the existing AES-GCM `EncryptedVault` and its Data Protection Keychain key with
`WhenUnlockedThisDeviceOnly`. Add explicit backwards-compatible decoding so absent collections
become empty and record an additive migration marker when first materialized. Keep
`VaultEnvelope.formatVersion` unchanged because the envelope cryptographic format does not change.

**Rationale**: One authenticated document gives resource removal an atomic zero-orphan transaction
and lets signed replacement smoke verify a single persistent chain. The P0 bounds make whole-vault
atomic replacement acceptable while the product is small. A separate journal can be reconsidered
only when measured event volume justifies a second encrypted persistence protocol.

**Alternatives considered**:

- Embed memory in `ResourceProfile`: rejected because it mixes current facts with untrusted prose
  and changes resource revision for every event.
- Encode memory as generic metadata: rejected because metadata is typed and source-allowlisted.
- Add plaintext files or SQLite: rejected because plaintext leaks context and SQLite adds a second
  persistence and migration boundary.
- Store notes as Keychain items: rejected because Keychain is not a growing collection store.

## Decision 4: Make vault mutation atomic at the persistence layer

**Decision**: Extend `VaultDocumentStoring` and `EncryptedVault` with an actor-isolated synchronous
mutation closure: load, mutate `inout VaultDocument`, seal, atomic file replacement, and rollback
marker update. The mutation closure cannot suspend. Migrate Resource, Topology, Notebook, Timeline,
workspace-binding, and migration-transaction writers to this primitive. Retain an outer coordination
gate only for compensating operations that span Keychain and the vault.

**Rationale**: The current actor serializes individual `readDocument` and `writeDocument` calls, but
two services can still interleave read-modify-write sequences and lose an update. Relying on every
future service to share the same externally injected lock is brittle. Correctness belongs in the
persistence interface.

**Alternatives considered**:

- Continue sharing `ResourceMutationGate`: rejected as an easy-to-forget convention.
- Expose vault revision and retry CAS in every service: rejected because it duplicates conflict
  loops and leaks a storage concern upward.
- Introduce a database now: rejected as unnecessary for the bounded P0 workload.

## Decision 5: Preserve source authority and apply one safe-text policy

**Decision**: Notebook entries are immutable content with mutable lifecycle metadata. Source class
is one of `user_guidance`, `agent_observation`, or `agent_summary`; entry kind further identifies
`card_name`, `purpose`, `caution`, `guidance`, `observation`, or `summary`. Only a validated
trusted-local peer may
create or change user guidance. Agent attribution comes from the Broker's authenticated XPC caller;
an Agent-provided name is always self-declared metadata, never authority.

Extract a shared `AgentVisibleTextPolicy` from the existing resource-metadata safety rules. It
normalizes Unicode, rejects terminal controls, enforces byte and rate bounds, rejects exact matches
for known protected resource values, and rejects credential-bearing URIs and recognized secret/key
shapes. It never reads a Keychain secret merely to filter a note. Remote command input, intent,
stdout, stderr, environment, and transcripts are never automatic Notebook sources.

An Agent may submit at most one `AgentObservationProposalV1` for a terminal request, only when the
conclusion is resource-scoped, durable across sessions, absent from the card, non-transient, and not
a Runtime security fact. Observation failure does not change the completed task result.

P2 semantic summarization reuses the same `resource observe` command with an opaque Broker-issued
summary ticket. The ticket binds Resource ID, exact source IDs, expected Notebook revision, and
expiry without projecting those internals. Runtime may offer this Agent-safe maintenance continuation
opportunistically, but never as an execution prerequisite. The default Skill does not invent a
summary ticket or initiate compaction on its own.

**Rationale**: Source labels are valuable only when the caller cannot self-promote. A shared text
policy prevents independent allowlists from drifting while keeping semantic content strictly weaker
than Runtime facts and policy.

**Alternatives considered**:

- Trust an Agent-supplied author or source class: rejected as source spoofing.
- Store command output or Agent intent automatically: rejected for secret and prompt-injection risk.
- Require user presence for every observation: rejected because it destroys cross-Agent usability.
- Claim arbitrary secret detection is complete: rejected; known and recognizable values can be
  rejected, but unknown secrets remain a documented residual risk.

## Decision 6: Keep Timeline distinct from audit

**Decision**: Add a persistent `ResourceTimelineService`; do not project or repurpose the current
in-memory `AuditService`. A Timeline event contains only an event ID, Resource ID, Broker-selected
allowlisted task class, terminal state, timestamp, resource revision, and optional opaque evidence
or request reference. It excludes command, intent, stdout, stderr, endpoint, username, fingerprint,
and credentials. Reads do not create Timeline events. Accepted execution requests and state-changing
resource or Notebook operations do.

Every use case calls a shared terminal recording hook and awaits its append before returning the
control response. If history persistence fails after an external operation has already happened, the
Runtime reports the truthful operation result with bounded degraded-health metadata and queues an
idempotent in-memory retry. It never reports that the remote operation failed merely because local
history failed. The 100% Timeline criterion applies under a healthy available vault; permanent disk
or Keychain failure cannot be represented as a stronger guarantee.

**Rationale**: Audit is security evidence; Timeline is a user-visible operational memory with a
different schema, authority, and retention policy. Fixed Broker classifications are safer than
Agent-authored task labels.

**Alternatives considered**:

- Persist and expose `AuditEvent`: rejected because fingerprints and audit semantics are not a
  product notebook.
- Fire-and-forget Timeline writes: rejected because Broker restart could silently lose them.
- Fail an already completed remote action when Timeline fails: rejected because it is untruthful.
- Add a durable write-ahead log now: deferred until reliability or scale measurements justify the
  additional encrypted format.

## Decision 7: Pin P0 projection and retention budgets

**Decision**: Use deterministic UTF-8 byte limits as hard gates and tokenizer counts only as
regression measurements.

| Surface | P0 limit |
|---|---|
| Workspace ambient list | 8 cards, four scalar fields, 2 KiB encoded TOON, 512 reference tokens |
| Card name | 80 Unicode scalar values after normalization |
| Role summary | 120 Unicode scalar values after normalization |
| Default detailed card | 6 KiB encoded TOON, 1,200 reference tokens |
| Detailed summary | 500 characters |
| Guidance preview | 3 entries, 240 characters each |
| Recent changes | 3 events |
| Safe relationships | 6 rows |
| Capabilities | 8 identifiers |
| User-guidance body | 1,024 UTF-8 bytes; at most 16 active entries per resource |
| Agent-observation body | 512 UTF-8 bytes; at most 64 active entries per resource |
| Agent-summary body | 2,048 UTF-8 bytes; at most 8 active entries per resource |
| Notebook encoded hard limit | 128 KiB per resource |
| Timeline | 128 events and 64 KiB per resource |
| Agent observation rate | one per terminal request and 20 per resource per hour |

User-pinned guidance has no automatic expiry. Agent observations expire from the default active view
after 90 days unless summarized sooner. Superseded source observations remain recoverable for 30
days. Timeline events retain the newest 128 events within 90 days. Runtime applies deterministic
expiry before rejecting an optional write; it never deletes pinned guidance or active unsummarized
entries to make room. P0 targets at most 64 active resources per installation.

**Rationale**: These limits cover ordinary machine context while keeping session and whole-vault
cost predictable. The list stays substantially smaller than a full card, and no routine task needs a
`--full` memory workflow.

**Alternatives considered**:

- Unlimited Notebook or Timeline: rejected because whole-vault replacement and Agent token use
  would grow without bound.
- Character-only storage limits: rejected because encoded persistence and IPC operate on bytes.
- Expose retention controls to Agents: rejected because limits are policy, not task parameters.

## Decision 8: Keep the trusted-local experience CLI-first

**Decision**: Define `TrustedResourceViewV1` with Overview, Activity, Guidance, and Access sections.
Runtime facts and Timeline are read-only. Guidance mutations use trusted-local authority plus
compare-and-swap. Access exposes status and protected actions, never credential values or locators.
P0 implements this model through the existing signed trusted terminal helper and typed private IPC;
it does not add a SwiftUI window, menu-bar item, or custom approval UI.

Safe overview reads do not require repeated user presence. User-guidance mutation requires an
explicit local gesture, and credential or privileged operations retain their existing macOS system
authentication. Source and authority are explicit fields, not color-only presentation.

**Rationale**: A terminal helper preserves the current Runtime architecture and still gives users a
visible, editable, Markdown-like experience. A future native UI can consume the same semantic DTO
after a separate scope decision.

**Alternatives considered**:

- Add a macOS dashboard in P0: rejected by the current CLI-first Runtime scope.
- Let the Agent CLI edit user guidance: rejected because an Agent cannot impersonate the user.
- Require user presence on every overview read: rejected as approval fatigue without a trust gain.

## Decision 9: Migrate `ssh-hosts` through deterministic trusted-local staging

**Decision**: Migration reads only user-selected files in the trusted-local helper. A versioned,
deterministic column/section classifier and secret scanner assigns every candidate to one class:
`safe_semantic`, `binding_candidate`, `safe_relationship_candidate`, `protected_access`,
`stale_operational_claim`, `executable_content`, `secret_like`, or `ambiguous`. An LLM never reads or
classifies source files.

Safe semantic candidates include only confirmed names, roles, purposes, and cautions. Endpoint,
route, account, fingerprint, key or credential locators, tunnel inventory, live status, sudo claims,
commands, and secret-like content never enter Notebook or Agent preview. Protected access returns
only category counts and continues through native enrollment.

The state machine is:

```text
selected -> classified -> previewed -> bindings_required|ready
         -> user_confirmed -> pending_verification -> committed|cancelled|failed
```

Preview fixes a source digest and immutable import-plan digest. Commit fails if the source changed.
Only verified Resource IDs may receive Notebook content or relationships. Commit tags every created
entry and relation with a migration transaction ID. Repeating the same source digest and selection
is a no-op. Rollback affects only records created or superseded by that transaction; it never removes
a resource, credential, Runtime fact, Timeline, or source file. Source Markdown is never edited,
moved, or deleted.

**Rationale**: Existing Markdown combines useful meaning with protected access material in the same
tables. Deterministic field classification plus a verified Resource ID is the only auditable way to
preserve useful context without trusting stale endpoints or exposing content to an Agent.

**Alternatives considered**:

- Ask an Agent or LLM to summarize the files: rejected because protected source enters the model.
- Auto-create resources from aliases or endpoints: rejected because neither proves current identity.
- Import old status as Profile facts: rejected because it is not current Runtime evidence.
- Delete the source after import: rejected as destructive and harmful to rollback.

## Decision 10: Use explicit versioned DTOs and feature services

**Decision**: Runtime adds explicit DTOs such as `ResourceCardV1`,
`ResourceNotebookMutationV1`, `TrustedResourceViewV1`, `WorkspaceResourceBindingV1`, and
`SSHHostsMigrationPlanV1`. Agent and trusted-local XPC protocols gain separate typed Data methods and
dispatchers. Do not extend the synthesized `AgentClientOperation` enum or the dynamic
`BrokerReply.data` dictionary.

Create focused Broker services and mappers rather than adding behavior to the existing large
`MVPBrokerHandler.swift` or `BrokerService.swift`. CLI maps private replies to explicit Agent v2 DTOs
and canonical TOON. The product repository fixes public fields and fixtures before Runtime code.

**Rationale**: The resource-directory V1 DTOs already demonstrate the intended typed seam. Separate
services keep persistence, composition, presentation, and trusted-local mutation testable under
Swift 6 strict concurrency.

**Alternatives considered**:

- Return free-form dictionaries: rejected as an unstable public and IPC schema.
- Serialize domain persistence models directly: rejected because domain migrations would change the
  wire protocol.
- Put all feature behavior in existing monolith files: rejected by Runtime architecture rules.

## Decision 11: Validate weak-Agent behavior and every trust boundary

**Decision**: Extend the existing isolated Luna corpus with at least 16 synthetic cases covering
unique and ambiguous ambient selection, irrelevant workspaces, truncation, missing integration,
Runtime-fact conflicts, hostile fake control text, guidance versus authorization, observation
heuristics and failure, migration cancel/change/alias reuse/rollback, and zero protected-data
restatement.

Runtime uses the existing Unit, Contract, Integration, and Security test targets. Product fixtures
cover existing resource-show baseline plus card list/detail completed, empty, truncated,
conflicting-source, hostile-content, disabled, and unapproved-name cases. Strict TOON decode,
canonical re-encode, field order, UTF-8 budgets, Skill drift, and migration classification are
required. Hook conformance is separate per Agent adapter and tests one start call, cwd scope, empty,
timeout, non-zero exit, truncation, no remote action, and no transcript read.

**Rationale**: DTO tests cannot reveal a weak Agent adding unnecessary discovery calls, trusting an
observation as policy, or trying to parse migration files. Existing usability evaluation provides a
measurable regression gate.

**Alternatives considered**:

- Test only Swift services: rejected because Agent behavior is the product surface.
- Use real infrastructure or real `ssh-hosts` files: rejected because fixtures must be synthetic.
- Use snapshot text without strict decoding: rejected because malformed TOON can still look
  plausible to an Agent.

## Decision 12: Make replacement preservation a release gate

**Decision**: Add two non-destructive signed replacement smoke paths:

1. previous pre-feature Runtime to feature Runtime, proving old Resource/Profile/credential state
   survives and new Notebook/Timeline collections materialize empty; and
2. feature Runtime N to N+1, proving Profile, Notebook, Timeline, vault revision, and credentials all
   remain readable through the Broker.

Verify the final staged app's Broker-only Keychain entitlement, Team, role identifiers, Hardened
Runtime, notarization state when applicable, architecture, and digest before replacement. Preserve
the previous app and all vault/Keychain state on failure. Reset, deletion, or re-enrollment is not a
valid recovery step. After preservation succeeds, separately verify resource removal leaves zero
Notebook and Timeline records.

**Rationale**: Signature validity alone does not prove the final Broker kept its Keychain authority.
The publisher Team is a persistent-data boundary, and context must survive exactly where credentials
do.

**Alternatives considered**:

- Test only a fresh empty installation: rejected because it cannot expose replacement regression.
- Verify only `codesign`: rejected because entitlement survival and Broker access need runtime proof.
- Delete state and enroll again: rejected as a destructive workaround.
