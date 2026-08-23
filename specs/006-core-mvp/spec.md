# Feature Specification: SAFA Core MVP

**Feature Branch**: `feat/006-core-mvp`

**Created**: 2026-08-23

**Status**: Draft acceptance specification; publication hold remains active

**Input**: Turn the implemented pre-release SAFA capabilities into one bounded, signed, testable
macOS MVP without adding another product concept or expanding the current feature surface.

**Product Alignment**: **Core RC** — this specification is the single integration and acceptance
wrapper for the Resource–Task–Decision–Evidence journey in `PRODUCT.md`. Specification 004 supplies
the implemented Agent-usability component. Specification 005 and every richer context proposal are
outside this MVP.

**Owner**: `juju-w/safa` owns product scope, Skill, public contract, fixtures, weak-Agent evidence,
and the MVP decision record. `juju-w/safa-runtime` owns the exact native implementation, platform
tests, signing, packaging, and staged replacement evidence.

## Product decision

The MVP is one exact, internally distributed, production-identity-signed macOS candidate that proves:

> Register a supported Resource once, ask an Agent for an outcome, let Runtime execute or request one
> exact trusted-local handoff, and receive bounded Evidence without exposing a reusable credential.

The MVP is not a public release. Passing this specification makes the same immutable candidate
eligible for an RC decision; it does not lift the publication hold, create a tag, publish an asset,
or authorize an installer.

## MVP boundary

| Area | Included in MVP | Explicitly outside MVP |
|---|---|---|
| Platform | macOS 14+ on the architectures proven by the exact signed candidate | Linux and Windows Runtime claims |
| Resources | Registered SSH host and exact HTTP GET/HEAD slice | Database, cache, object-store, messaging, search, graph, browser, and generic client adapters |
| Agent execution | Known alias to one exact `exec`; one discovery only when alias is unknown | Raw SSH, arbitrary interactive shell, persistent session, dynamic workflow, or batch/task-plan engine |
| Privilege | SSH `--privilege auto` with fresh root, Docker, ordinary-account, and reviewed sudo decisions | Silent broad sudo grants or stderr-driven privileged retry |
| Human interaction | Trusted registration/change and at most one continuous exact Task handoff | Routine approval polling, capability confirmation, context maintenance, or conversational secret entry |
| Resource understanding | Existing bounded safe Resource projection sufficient for tested alias selection | Notebook, Timeline, Agent observations, semantic summaries, ambient hooks, and `ssh-hosts` migration |
| Evidence | Canonical TOON v2 control state plus bounded untrusted target output | Raw dependency output, unbounded content, or target text treated as control instructions |
| Distribution | Exact version/digest, production Team, final-stage signature/entitlement/profile/notarization evidence, and non-destructive replacement | `latest`, unsigned fallback, developer-only identity as durable vault authority, public tag, or public installer |

Existing topology queries, diagnostics, explicit privilege compatibility controls, and Resource
administration may remain available. They do not become mandatory steps or additional MVP concepts.

## Primary journey

    user registers a supported Resource in a trusted local terminal
      → user asks an Agent for an outcome
      → exact alias known?
        → no: Agent performs one safe discovery
        → yes: Agent submits one exact Task
      → Runtime resolves readiness, route, account, privilege, policy, and credential
      → Runtime completes, requests one exact handoff, returns one repair action, or refuses
      → Agent follows only safe_for_agent continuations
      → Runtime returns bounded Evidence
      → Agent explains the outcome and uncertainty

One `exec` is one exact bounded Task. A diagnosis may use multiple Tasks when later work depends on
earlier Evidence; that composition remains in the Agent conversation and does not create an MVP
workflow engine.

## User scenarios and acceptance

### User Story 1 — Register once without exposing access material (Priority: P1)

A user registers a disposable SSH host or HTTP service through the trusted-local setup path. The
Agent receives only a safe alias and bounded state, never an endpoint, account, key, password,
token, fingerprint, or credential locator.

**Independent test**: Register synthetic SSH and HTTP Resources through the final signed candidate,
restart the Broker, and confirm the Resources remain safely discoverable and executable without
re-entering unchanged access material.

**Acceptance scenarios**:

1. A protected setup value never appears in Agent-controlled argv, environment, stdin, stdout,
   stderr, TOON, logs, fixtures, or the decision record.
2. A verified Resource returns a stable safe alias, lifecycle state, health, and effective
   capability sufficient for tested selection.
3. Registration or protected access changes require trusted local user presence; safe discovery
   afterward does not.

### User Story 2 — Complete an ordinary Task in one Agent-visible call (Priority: P1)

For a known ready alias, the Agent submits one `exec` directly. Runtime performs all deterministic
preflight internally and returns bounded Evidence or one stable exact remediation.

**Independent test**: In a fresh Agent session with an exact SSH alias, run a read-only diagnostic
using `--privilege auto` without preceding `doctor`, list, detail, sudo-status, or context calls. Do
the equivalent exact GET and HEAD operations for a registered HTTP Resource.

**Acceptance scenarios**:

1. A known ready SSH or HTTP Task needs one Agent-visible SAFA invocation and zero human actions.
2. An unknown or ambiguous alias needs at most one additional safe discovery invocation.
3. HTTP execution accepts only the registered GET/HEAD vocabulary and rejects Agent-supplied URL,
   header, token, config, redirect, stdin, working-directory, or shell overrides.
4. A failed Runtime, adapter, route, or Resource preflight returns one stable cause and smallest safe
   next action without exposing implementation noise or protected selectors.

### User Story 3 — Resolve privilege without Agent guesswork (Priority: P1)

The main Skill uses `--privilege auto` for ordinary SSH Tasks. Runtime keeps root and current
Docker-authorized accounts direct, uses ordinary account access when sufficient, and selects sudo
only for a reviewed command class from fresh evidence.

**Independent test**: Run the privilege matrix against disposable root, Docker-authorized,
ordinary, password-sudo, NOPASSWD, stale-observation, failed-probe, and hostile-stderr profiles.

**Acceptance scenarios**:

1. Root and current direct Docker authorization do not create a sudo request.
2. Sudo selection freezes the exact Resource, arguments, intent, effect, risk, bounds, and expiry
   before returning `approval_required`.
3. One continuous trusted-local handoff performs macOS user authentication and, only when required,
   hidden remote sudo credential enrollment before executing that exact Task.
4. Missing, failed, stale, contradictory, unsupported, timed-out, cancelled, or remote-output
   evidence never causes greater privilege or an elevated retry.

### User Story 4 — Follow one authoritative Decision (Priority: P1)

The Agent reads structured status and exact `next.safe_for_agent` rows. It runs Agent-safe
continuations, displays trusted-local continuations without executing them, waits when allowed, and
reports terminal refusal without inventing recovery.

**Independent test**: Use canonical approval, setup, wait, denial, cancellation, expiry, restart,
truncation, empty-output, and hostile-target fixtures with the pinned weak model.

**Acceptance scenarios**:

1. Structured Runtime control fields cannot be manufactured by target stdout/stderr/body.
2. An approval result contains one exact trusted review action and one bounded Agent-safe wait
   action; waiting has no approval or replay authority.
3. Terminal Evidence preserves remote exit state, bounded stdout/stderr or response data, counts,
   classification, and truncation needed to explain the outcome.
4. Weak-Agent completion is at least 95% over at least 20 deterministic synthetic scenarios with
   zero safety violations.

### User Story 5 — Replace the candidate without losing durable authority (Priority: P1)

A user installs the exact signed MVP candidate over a previous compatible Runtime. Existing
Resources, vault state, and Keychain-backed credentials remain available under the fixed production
Developer Team without deletion, reset, or re-enrollment.

**Independent test**: Run the replacement smoke from the previous compatible signed candidate to
the exact MVP candidate, restart the Broker, execute existing direct and privileged Tasks, then
verify rollback behavior without deleting user state.

**Acceptance scenarios**:

1. Final staged evidence verifies exact version, digest, architecture, production Team, role
   identifiers, Broker-only Keychain entitlement, its unexpired matching Developer ID distribution
   provisioning profile, Hardened Runtime, and notarization after export.
2. The previous compatible vault and Keychain state survive installation and Broker restart.
3. Signature, entitlement, digest, Team, migration, or replacement failure blocks MVP acceptance;
   deleting state is never a workaround.

## Functional requirements

- **MVP-001**: The normal Agent experience MUST contain only Resource, Task, Decision, and Evidence.
- **MVP-002**: `dev.safa.cli/v2` canonical TOON MUST remain the sole Agent control contract.
- **MVP-003**: A known alias MUST go directly to one exact `exec`; diagnostic, detail, sudo-status,
  topology, or context reads MUST NOT be mandatory preflight.
- **MVP-004**: The main Skill MUST use `--privilege auto` for ordinary SSH Tasks and MUST NOT add a
  `sudo` argument prefix or retry from remote output.
- **MVP-005**: Runtime MUST own readiness, lifecycle, adapter, route, account, privilege, policy,
  credential, timeout, cancellation, redaction, and bounded-output decisions.
- **MVP-006**: The Agent MUST execute only exact continuations with `safe_for_agent: true` and MUST
  never execute or complete a trusted-local action marked false.
- **MVP-007**: No reusable credential or protected selector MAY enter the Agent-visible channel.
- **MVP-008**: SSH and the exact registered HTTP GET/HEAD slice MUST pass the same public contract,
  fail-closed, leakage, and bounded-Evidence gates on the final candidate.
- **MVP-009**: The final candidate MUST be selected by exact version and digest and MUST pass
  final-stage macOS signing, restricted-entitlement provisioning-profile, notarization, and
  replacement verification.
- **MVP-010**: The product/runtime commit pair, candidate identity, test evidence, and smoke result
  MUST be recorded without production resource data or secrets.
- **MVP-011**: Notebook, Timeline, Agent observations, summaries, ambient hooks, legacy migration,
  task plans, additional adapters, and additional platforms MUST NOT block or enlarge this MVP.
- **MVP-012**: MVP acceptance MUST NOT publish, tag, promote a manifest, or lift the publication
  hold; RC publication requires a separate explicit human decision.

## Success criteria

- **SC-001**: Known ready SSH and HTTP Tasks complete with one Agent-visible invocation and zero
  human actions.
- **SC-002**: Unknown or ambiguous alias selection needs at most one safe discovery invocation.
- **SC-003**: One exact privileged Task requires at most one continuous trusted-local handoff after
  onboarding.
- **SC-004**: The pinned weak model achieves at least 95% task completion with zero credential,
  endpoint, trusted-action, raw-fallback, remote-control-text, or privilege-escalation violations.
- **SC-005**: All canonical TOON fixtures strict-decode and re-encode against the pinned official
  implementation and specification.
- **SC-006**: The exact signed candidate passes Runtime unit, contract, integration, security,
  Release-build, packaging, signing-boundary, and non-destructive replacement gates.
- **SC-007**: The final smoke records zero reusable credential exposure and preserves all previous
  compatible durable state.
- **SC-008**: Every deferred capability remains absent from the main Skill, current-support claims,
  MVP task list, and MVP release blockers.

## Non-goals

- Expanding the resource type or command vocabulary to make the MVP appear broader.
- Adding memory, ambient integration, migration, GUI, notifications, task plans, or persistent
  sessions before MVP acceptance.
- Treating a developer-signed, unsigned, source-preview, or state-reset build as the durable MVP.
- Publishing an RC, stable release, installer, marketplace package, or unpinned update channel.

## Assumptions

- The production Developer Team is fixed before the durable MVP vault is accepted.
- All smoke Resources are disposable, non-production, and represented only by placeholders in the
  product repository.
- Existing implemented capabilities may be reused, but all final evidence is rerun against the
  exact paired product and Runtime revisions rather than inherited from earlier feature branches.
