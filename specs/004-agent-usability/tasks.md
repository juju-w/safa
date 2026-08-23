# Tasks: Weak-Agent Usability and One-Call Execution

**MVP Note**: These completed component tasks do not substitute for the final paired signing,
replacement, and smoke gates in `specs/006-core-mvp/tasks.md`.

## Phase 1 — Baseline and contract design

- [X] T001 Add at least 20 synthetic weak-Agent scenarios covering SSH, Docker, sudo, HTTP,
  lifecycle states, setup handoff, unavailable dependencies, and hostile remote output.
- [X] T002 Define exact scoring for task completion, SAFA calls, human actions, invented commands,
  secret solicitation, raw fallback, privilege escalation, latency, and token use.
- [X] T003 Record the current `gpt-5.6-luna` baseline and a stronger control baseline with pinned
  model, runner, Skill, contract, fixture, and Runtime revisions.
- [X] T004 Update `contracts/cli-v2.md` with one-call preflight, explicit `--privilege auto`,
  deterministic continuation, compatibility analysis, and unchanged omitted-privilege semantics.
- [X] T005 Decide through fixtures and weak-model trials whether the existing three-column `next`
  rows are sufficient; add a typed continuation field only if evidence shows they are not.
- [X] T006 Add canonical JSON/TOON fixtures for direct one-call success, missing/ambiguous alias,
  unavailable dependency, auto-root, auto-Docker, auto-sudo approval, trusted user action, approval
  wait, terminal denial, and hostile remote output.
- [X] T007 Extend strict TOON decode, canonical field-order, fixture parity, and schema tests for all
  additive output.

## Phase 2 — Native Runtime implementation

- [X] T008 [runtime] Add typed `auto` privilege parsing and DTO support while preserving explicit
  `user`, explicit `sudo`, and omitted/default behavior.
- [X] T009 [runtime] Move Runtime, resource lifecycle, effective capability, adapter, route, and safe
  account preflight into the `exec` Broker path.
- [X] T010 [runtime] Add a pure, full-argument-vector auto-privilege resolver with explicit command
  classes and injected account observations.
- [X] T011 [runtime] Prove root and Docker-authorized paths stay at registered-account privilege.
- [X] T012 [runtime] Prove sudo resolution creates an immutable `approval_required` request and never
  executes before trusted user presence.
- [X] T013 [runtime] Prove stale, missing, contradictory, unknown, stderr, timeout, and cancellation
  cases never cause automatic privileged retry.
- [X] T014 [runtime] Return stable exact remediation from failed one-call preflight without exposing
  endpoints, credentials, adapter internals, or protected topology.
- [X] T015 [runtime] Standardize approval handoff plus bounded Agent-safe result waiting without
  giving the wait path approval or replay authority.
- [X] T016 [runtime] Add unit, contract, integration, security, and 100-run leakage/regression tests
  for the new privilege and continuation paths.

## Phase 3 — Skill and product experience

- [X] T017 Reduce `skills/safa/SKILL.md` to at most 120 lines and 900 words excluding frontmatter.
- [X] T018 Keep only alias selection, one-call `exec`, `next.safe_for_agent`, protected-value
  boundaries, and remote-output distrust in the main Skill.
- [X] T019 Move sudo lifecycle, trusted setup, topology, HTTP vocabulary, fixed-sequence guidance,
  and detailed status handling into focused references.
- [X] T020 Remove mandatory `doctor` and `resource show` calls from the normal known-alias workflow;
  retain them as diagnostics and explicit detail operations.
- [X] T021 Add a drift check between the Skill golden path, no-argument home view, CLI help, and
  `contracts/cli-v2.md`.
- [X] T022 Update synthetic scenarios and product documentation to show one-call reads and one
  trusted action for one exact privileged task.
- [X] T023 Validate the Skill with the repository and installed `skill-creator` validators.

## Phase 4 — Evidence and RC usability gate

- [X] T024 Run Markdown/JSON consistency, strict TOON conformance, canonical fixture, Skill drift,
  and `git diff --check` gates in the product repository.
- [X] T025 [runtime] Run format, full Swift tests, Release build, unsigned Xcode assembly, signing
  boundary verification, and signed replacement smoke while preserving vault/Keychain state.
- [X] T026 Run the weak-model corpus and require at least 95% task completion with zero safety
  violations.
- [X] T027 Require known ready reads to use at most one Agent-visible SAFA invocation and zero human
  actions; ambiguous alias discovery may add at most one invocation.
- [X] T028 Require one submitted immutable privileged task to use at most one trusted human approval,
  separately reporting first-use remote-secret setup.
- [X] T029 Review product and Runtime diffs together and keep the publication hold in place until an
  explicit release decision.

## Deferred P1 — Immutable task-plan approval

- [ ] T030 Specify exact resource, commands, order, privilege, bounds, expiry, and failure behavior
  for a predeclared multi-command task plan.
- [ ] T031 Threat-model remote-output injection, partial completion, cancellation, replay, Broker
  restart, and plan mutation.
- [ ] T032 Evaluate native notification and command-scoped preauthorization separately; do not make
  either a dependency of P0.
