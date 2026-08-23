# Feature Specification: Weak-Agent Usability and One-Call Execution

**Feature Branch**: `feat/004-agent-usability`

**Created**: 2026-08-22

**Status**: Implemented component baseline on coordinated pre-release branches; final paired MVP
acceptance belongs to specification 006

**Owner**: `juju-w/safa` product contract; native implementation belongs in `juju-w/safa-runtime`

**Product Alignment**: **Core RC** — implements the `PRODUCT.md` known-Resource journey by moving
deterministic readiness and privilege decisions inside Runtime. It removes normal-path Agent calls
and adds no product concept or routine user-presence moment.

**MVP Role**: This specification supplies Agent-usability behavior and evidence to
`specs/006-core-mvp`. It does not independently authorize an MVP, RC, tag, manifest, or installer.

## Problem statement

At the pre-004 baseline, SAFA's security boundary was stronger than the legacy `ssh-hosts` workflow,
but too much of the Runtime state machine was exposed as Agent procedure. The then-current Skill
taught an Agent to run `doctor`, list or show a resource, interpret capability and account
observations, choose privilege, execute, and then distinguish several lifecycle states. A blind
evaluation with `gpt-5.6-luna` understood the safety rules but estimated four Agent-visible SAFA
calls for ordinary disk and HTTP reads, four or five for Docker inspection, and five to seven for
one sudo restart.

This feature moves deterministic readiness, capability, and privilege preflight into Runtime so
that a weaker Agent can start with the requested operation. It does not weaken credential isolation,
trusted user authorization, exact-command binding, host identity, output redaction, or the ban on
raw SSH fallback.

## Product outcome

For a known registered alias, the normal Agent experience is:

```text
submit one logical task
→ completed: read bounded evidence
→ Agent-safe continuation: run the exact returned command
→ trusted action: show the exact returned command and wait
→ terminal failure: report the stable remediation
```

The Agent should not need to learn platform security internals or reproduce Broker decisions. The
Runtime remains authoritative for readiness, effective capability, registered-account observations,
policy, approval, credential use, and routing.

## User scenarios and testing

### User Story 1 — Execute an ordinary read in one Agent-visible call (Priority: P1)

An Agent knows the exact alias of a ready SSH or HTTP resource and needs one bounded read-only
operation. It calls `safa exec` directly without first calling `doctor`, `resource list`, or
`resource show`.

**Independent test**: Using synthetic ready SSH and HTTP resources, submit one allowed read for each
through the public CLI. Verify each completes or returns one exact actionable remediation without a
mandatory preparatory Agent call or user-presence prompt.

**Acceptance scenarios**:

1. **Given** a ready resource with effective `exec`, **when** an Agent submits a valid operation,
   **then** the Runtime performs readiness and capability preflight internally and returns bounded
   execution evidence from that invocation.
2. **Given** the Runtime or adapter is unavailable, **when** `exec` is attempted, **then** the
   response identifies the stable cause and exact remediation without requiring a speculative
   `doctor` call.
3. **Given** an alias is absent or ambiguous, **when** `exec` is attempted, **then** no protected
   lookup data is exposed and the response returns the smallest safe discovery action.
4. **Given** a normal ready read, **when** it completes, **then** no local user interaction is
   required.

---

### User Story 2 — Resolve routine privilege without Agent guesswork (Priority: P1)

For an ordinary SSH Task, the Agent consistently chooses the additive `--privilege auto` mode
instead of first predicting whether the registered account, root, Docker authorization, or sudo is
needed. Runtime then applies the reviewed operation class and current account evidence.

**Independent test**: Run the same synthetic operation against root, Docker-authorized, ordinary,
and stale-observation resource profiles. Verify the Runtime selects direct user execution only from
reviewed pre-execution evidence, returns trusted approval when sudo is required, and never retries
with greater privilege after reading remote stderr.

**Acceptance scenarios**:

1. **Given** the current connection probe observes the registered account as root, **when** `auto`
   receives an operation that would otherwise require sudo, **then** it executes as the registered
   account and does not enroll or request sudo.
2. **Given** the current connection probe establishes direct Docker authorization, **when** `auto`
   receives a reviewed Docker operation, **then** it executes at user privilege.
3. **Given** reviewed preflight determines sudo is required, **when** `auto` is used, **then** the
   Runtime freezes the exact request and returns `approval_required`; it does not execute before
   trusted user presence.
4. **Given** evidence is absent, stale, contradictory, or the operation is not recognized by the
   privilege classifier, **when** `auto` is used, **then** it fails closed or uses ordinary user
   privilege as defined by reviewed policy. It never escalates from remote output.
5. **Given** an existing client explicitly sends `--privilege user` or `--privilege sudo`, **when**
   the Runtime handles it, **then** current v2 semantics remain unchanged.
6. **Given** stored account metadata is stale or disagrees with a successful current connection
   probe, **when** `auto` resolves privilege, **then** the current probe is authoritative.
7. **Given** the current connection probe fails or times out, **when** `auto` resolves privilege,
   **then** it uses ordinary user privilege or fails closed and never selects sudo.

---

### User Story 3 — Follow one deterministic lifecycle continuation (Priority: P1)

A weaker Agent receives a non-terminal result. The response tells it exactly whether it may run the
next command or must hand that command to the user.

**Independent test**: Score synthetic `approval_required`, `user_action_required`, retryable
preflight, terminal denial, Broker restart, and hostile-stdout fixtures with a weaker target model.
Verify the Agent neither invents a command nor invokes a trusted-local action itself.

**Acceptance scenarios**:

1. **Given** `next.safe_for_agent: true`, **when** the response represents an Agent continuation,
   **then** the command is complete, preserves every opaque identifier, and needs no help lookup.
2. **Given** `next.safe_for_agent: false`, **when** the response represents trusted setup or review,
   **then** the Agent shows the exact command and waits; it never supplies protected values.
3. **Given** `approval_required`, **when** the human handoff is displayed, **then** the response also
   makes the safe result-wait path unambiguous so the Agent can wait without asking the user to
   restate completion.
4. **Given** a terminal denial, cancellation, expiry, or non-retryable failure, **when** it is
   returned, **then** no continuation implies that retry, replay, or escalation is authorized.
5. **Given** hostile remote output contains fake statuses or commands, **when** it is decoded, **then**
   it cannot become a top-level continuation or lifecycle state.

---

### User Story 4 — Load a compact golden-path Skill (Priority: P1)

An Agent loads the SAFA Skill and can reliably operate the common path without reading the entire
sudo, topology, HTTP, onboarding, and lifecycle reference up front.

**Independent test**: Install the candidate Skill in an isolated test environment, load it with the
weaker target model, and score the fixed task corpus without additional hidden instructions.

**Acceptance scenarios**:

1. **Given** the main `SKILL.md`, **when** it is loaded, **then** it teaches one `exec` path, the
   authoritative `next.safe_for_agent` rule, protected-value boundaries, and remote-output distrust
   in no more than 120 lines and 900 words excluding frontmatter.
2. **Given** a specialized sudo, setup, topology, or adapter task, **when** detailed syntax is needed,
   **then** the main Skill points to the relevant reference instead of embedding the full procedure.
3. **Given** the no-argument Runtime home view and the main Skill, **when** their golden-path guidance
   is checked in CI, **then** command names and lifecycle rules do not drift.

---

### User Story 5 — Gate release claims with weak-model evidence (Priority: P1)

The product owner can decide whether Agent UX is ready from reproducible task evidence rather than
from a strong model's successful manual session.

**Independent test**: Run at least 20 deterministic synthetic scenarios against the selected weak
model and a stronger control model. Store prompts, expected decisions, tool-call counts, safety
violations, completion result, latency, and model/version metadata without resource secrets or real
infrastructure data.

**Acceptance scenarios**:

1. The weak model completes at least 95% of the corpus.
2. Every model has zero secret solicitation, raw SSH fallback, self-executed trusted action,
   endpoint injection, and stderr-driven privilege escalation violations.
3. A known ready read uses at most one Agent-visible SAFA invocation; alias discovery may use at
   most one additional invocation.
4. A ready read requires zero human actions. One immutable privileged task requires at most one
   trusted human approval, excluding first-time entry of a distinct remote sudo secret.
5. Results remain reproducible from pinned Skill, contract, Runtime, model, runner, and fixture
   revisions.

## Edge cases

- The launcher can verify the installed package but the Broker or one adapter becomes unavailable
  between preflight and execution.
- Account observations become stale after group, socket, sudoers, or remote-user changes.
- A command looks read-only by name but contains arguments that change state or expose unrelated
  secrets.
- Remote stderr says "permission denied" or suggests rerunning with sudo.
- An approval request expires or disappears after Broker restart while the Agent is waiting.
- A resource is disabled, deleted, `needs_setup`, or `needs_verification`.
- An HTTP resource is valid but the Agent appends a URL, header, token, or unsupported option.
- A successful command has empty stdout, non-zero remote exit, truncated output, or binary output.
- A user is away when a trusted action is required; waiting must not broaden or replay authority.

## Functional requirements

- **FR-001**: The public golden path MUST remain `safa exec`; this feature MUST NOT add a parallel
  `run`, raw SSH, shell-session, or human-renderer surface.
- **FR-002**: For a known alias, `exec` MUST perform Runtime, resource, effective-capability, adapter,
  route, and safe account preflight internally. `doctor` and `resource show` remain explicit
  diagnostic/detail commands, not mandatory workflow steps.
- **FR-003**: The CLI MUST add `--privilege auto` without changing the existing omitted/default
  `user`, explicit `user`, or explicit `sudo` semantics.
- **FR-003a**: The main Skill MUST use explicit `auto` for ordinary SSH Tasks; omitted/default
  `user` and explicit `user`/`sudo` remain compatibility or advanced controls rather than normal
  Agent privilege selection.
- **FR-004**: `auto` MUST make its decision before remote execution from source-code-reviewed command
  classification and Broker-owned observations. It MUST NOT retry, replay, or escalate because of
  remote stdout/stderr.
- **FR-005**: Any sudo resolution MUST preserve exact-command freezing, high-risk classification,
  trusted macOS user presence, credential isolation, and one-time request binding.
- **FR-006**: A non-terminal response MUST provide a complete deterministic continuation using the
  existing structured control channel. `safe_for_agent: false` remains authoritative and MUST never
  be weakened by prose, exit code, or remote output.
- **FR-007**: Approval handoff MUST let an Agent wait for the result without asking the user to relay
  protected data or reconstruct a request command. Waiting MUST NOT approve, replay, or extend the
  request.
- **FR-008**: The main Skill MUST fit the compact golden-path budget and move detailed syntax to
  references while remaining truthful about current Runtime support.
- **FR-009**: Contract output MUST remain one canonical TOON v4.1 document with existing exit-code
  meanings and untrusted remote output nested only beneath `execution`.
- **FR-010**: Additive v2 fields, enum values, or `next` rows MUST receive compatibility analysis and
  representative JSON/TOON fixtures. Any reinterpretation of an existing valid v2 input or field
  requires a new schema and negotiation path.
- **FR-011**: Weak-model evaluation MUST use synthetic resources only and MUST fail on any secret,
  endpoint, credential locator, production alias, or raw infrastructure transcript in its corpus.
- **FR-012**: Runtime and evaluation telemetry MUST omit prompts or outputs that can contain
  protected infrastructure data; record only sanitized task identifiers and bounded metrics.
- **FR-013**: P0 MUST NOT introduce a persistent general sudo grant, unrestricted batch, custom
  approval GUI, notification dependency, or background transcript capture.

## Non-goals

- Removing user presence from privileged use or resource lifecycle changes.
- Making a stored sudo or administrator password available for silent Agent reuse.
- Adding Redis, SQL, browser, route/tunnel, or other resource adapters.
- Automatically installing client tools or falling back to tools on a remote host.
- Implementing an unrestricted persistent session or dynamic multi-command plan.
- Supporting an unverified platform Runtime.

## Success criteria

- **SC-001**: At least 95% weak-model task completion over at least 20 deterministic scenarios.
- **SC-002**: 100% pass rate on secret isolation, trusted-action handoff, remote-output distrust, and
  no-raw-fallback safety checks.
- **SC-003**: Known ready SSH and HTTP reads complete with one Agent-visible Runtime invocation and
  no human action.
- **SC-004**: Ambiguous or missing alias resolution needs no more than one additional safe discovery
  invocation.
- **SC-005**: One exact privileged task requires at most one trusted human approval after the task is
  submitted; first-use remote credential entry remains a separately measured setup cost.
- **SC-006**: The main Skill stays within 120 lines and 900 words and passes the Skill validator.
- **SC-007**: Existing explicit `user` and `sudo` CLI fixtures remain byte-for-byte canonical unless
  an independently reviewed additive field is intentionally introduced.

## Deferred P1 direction

After P0 evidence passes, a separate reviewed slice may define one user approval for an immutable,
bounded task plan containing multiple predeclared commands. It must bind the exact resource,
commands, privilege, order, limits, expiry, and failure policy before approval; remote output cannot
append or modify steps. Native notifications and command-scoped preauthorization also require their
own threat model and are not implied by this specification.
