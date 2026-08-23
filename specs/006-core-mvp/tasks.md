# Tasks: SAFA Core MVP

**Status**: Acceptance backlog for one exact Product/Runtime candidate

**Rule**: Check a task only from evidence produced against the final paired revisions. Earlier
feature-branch evidence may guide diagnosis but cannot satisfy final signing or replacement gates.

## Phase 1 — Product scope and contract freeze

- [X] T001 Establish `PRODUCT.md` as the normative product definition and feature-admission gate.
- [X] T002 Fix the MVP mental model to Resource, Task, Decision, and Evidence.
- [X] T003 Keep known-alias execution at one exact `exec`, unknown alias at one discovery, and
  ordinary SSH privilege at Runtime-owned `auto`.
- [X] T004 Mark specification 004 as the implemented Agent-usability component and specification 005
  as post-RC design input requiring independent rebaseline.
- [X] T005 Keep the current selected CLI contract free of ambient hooks, semantic memory, migration,
  task plans, extra execution adapters, and extra platform claims.
- [ ] T006 Freeze and record the exact final `juju-w/safa` commit.
- [ ] T007 Freeze and record the exact final `juju-w/safa-runtime` commit that consumes T006.

## Phase 2 — Final automated evidence

- [ ] T008 Run repository and skill-creator Skill validators against the frozen Skill.
- [ ] T009 Run product-core/Skill drift and pinned weak-Agent baseline validation.
- [ ] T010 Run the raw 20+ scenario `gpt-5.6-luna` evaluation against the frozen Skill, contract,
  corpus, rubric, runner, and Runtime revision; require at least 95% completion and zero safety
  violations.
- [ ] T011 Run strict TOON conformance against the pinned official implementation/specification and
  all canonical product fixtures.
- [ ] T012 Run launcher syntax/fail-closed, Markdown/JSON/YAML, website, and whitespace checks.
- [ ] T013 [runtime] Run formatting, full Swift Unit/Contract/Integration/Security tests, Release
  build, unsigned Xcode assembly, and installer-contract tests.
- [ ] T014 [runtime] Run repeated credential-leakage, approval, privilege, hostile-output, timeout,
  cancellation, and restart regressions.
- [ ] T015 Run `python3 tests/validate_runtime_pair.py <runtime-repository>` to prove Runtime records
  and consumes the exact T006 contract and byte-identical fixture set without public-schema drift.

## Phase 3 — Final signed candidate

- [ ] T016 [runtime] Build the exact T007 candidate through protected production signing automation.
- [ ] T017 Verify final staged version, digest, architectures, production Team, role identifiers,
  designated requirements, Broker-only Keychain entitlement, Hardened Runtime, and notarization.
- [ ] T018 Verify the resolver selects only the exact candidate version and digest with no `latest`,
  unsigned, or source-preview fallback.
- [ ] T019 Install the candidate over the previous compatible signed Runtime without deleting or
  resetting vault, Keychain, Resource, or credential state.

## Phase 4 — End-to-end smoke

- [ ] T020 Register disposable non-production SSH and HTTP Resources through the installed trusted
  local path and confirm zero protected-value exposure.
- [ ] T021 In a fresh Agent session, execute a known SSH alias directly with `--privilege auto` and
  no mandatory doctor/list/show/status/context call.
- [ ] T022 Verify an ambiguous request needs only one safe discovery before the exact Task.
- [ ] T023 Verify registered HTTP GET and HEAD succeed and every target/auth/config override fails
  before local-client or network work.
- [ ] T024 Verify root, direct Docker authorization, ordinary account, password-sudo, NOPASSWD,
  failed probe, stale evidence, and hostile stderr follow the reviewed least-privilege matrix.
- [ ] T025 Verify one immutable privileged Task uses one continuous trusted-local review/enrollment
  handoff plus Agent-safe wait and returns terminal bounded Evidence.
- [ ] T026 Verify denial, cancellation, expiry, unavailable dependency, hostile target output,
  truncation, empty output, non-zero remote exit, and Broker restart remain fail-closed and truthful.
- [ ] T027 Verify replacement preserves existing direct and privileged execution, then prove rollback
  behavior without deleting durable state.

## Phase 5 — MVP and RC decision

- [ ] T028 Review all evidence against [spec.md](spec.md) on the same immutable candidate pair.
- [ ] T029 Record either **MVP accepted** or **candidate rejected**; no conditional acceptance for
  signing, credential, authorization, target-identity, or replacement failures.
- [ ] T030 Keep the publication hold after MVP acceptance.
- [ ] T031 Only after a separate explicit release request, prepare the same accepted candidate for an
  RC tag, Draft GitHub Release, exact manifest, and installer publication.

## Deferred outside this backlog

- Resource Notebook, Timeline, Agent observations, summaries, ambient session integration,
  `ssh-hosts` migration, GUI, notifications, task plans, persistent sessions, additional adapters,
  Linux, and Windows.
