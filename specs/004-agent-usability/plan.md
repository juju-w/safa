# Implementation Plan: Weak-Agent Usability and One-Call Execution

**Plan Status**: Component implementation complete on coordinated pre-release branches; rerun final
evidence under `specs/006-core-mvp` for the exact paired candidate.

**Product Alignment**: **Core RC** — this plan implements the one-Task known-alias path and the exact
Decision handoff required by `PRODUCT.md`. No post-RC feature may expand this plan's release gate.

## Ownership and coordination

`juju-w/safa` owns this specification, `contracts/cli-v2.md`, canonical fixtures, the Agent Skill,
documentation, and the weak-model evaluation corpus. `juju-w/safa-runtime` implements typed CLI,
Broker, policy, and platform behavior against one pinned product-contract revision. Runtime pull
requests must reference the exact product commit and must not redefine the public schema.

## Compatibility decision

Keep `dev.safa.cli/v2` and `safa exec` as the sole execution entry.

- Add `auto` as an explicit `--privilege` value. Omitted privilege continues to mean `user`, so
  existing callers and fixtures keep their current meaning.
- Keep `next[...]{command,reason,safe_for_agent}` as the control shape unless weak-model evaluation
  proves that an additive typed continuation field is necessary. Prefer fewer deterministic rows
  over a second workflow schema.
- Keep `doctor`, `resource list`, and `resource show`; remove only the Skill requirement that every
  operation call them first.
- Do not add `safa run`. A convenience alias would increase the surface a weak Agent must learn and
  would duplicate `exec` semantics.

Every public-output change requires JSON/TOON fixtures, strict decode, field-order checks, and an
explicit compatibility paragraph in `contracts/cli-v2.md`.

## Runtime behavior

### One-call preflight

`exec` resolves the alias and performs readiness, lifecycle, effective-capability, adapter, route,
and safe account checks inside the Broker request. A failed check returns the stable cause and the
smallest exact continuation. A successful check proceeds without exposing those internal steps as
Agent calls.

### Auto privilege

`auto` is a typed pre-execution policy decision, not a shell convenience:

1. Prefer direct registered-account execution.
2. Run one fixed bounded read-only account probe through the pinned SSH route for each eligible
   `auto` execution; do not use stored registration metadata as later execution authority.
3. Treat a current root observation as direct user execution.
4. Treat a current Docker authorization observation as direct execution only for reviewed Docker
   operations.
5. Select sudo only when the reviewed full argument-vector classifier and current account evidence
   establish that elevation is required; selection creates an exact approval request and never
   executes automatically.
6. Unknown, failed, timed-out, unsupported, or contradictory evidence fails closed or uses ordinary
   user privilege according to an explicit tested rule. Remote output never triggers a privileged
   retry.

The design phase must enumerate every command class eligible for automatic sudo selection. An
unlisted command does not gain implicit elevation.

### Deterministic continuation

For operational failures and non-terminal states, output should answer one question: what may happen
next? Agent-safe commands are complete and preserve the resource alias or opaque request ID.
Trusted-local commands remain `safe_for_agent: false`. For approval, the Agent should be able to
start a bounded `request wait` after displaying the review command, so the user does not need to
send a second conversational confirmation. Waiting has no approval authority.

Successful detail results omit noisy suggestions. Discovery/list results may still provide a small
set of contextual templates; these are not lifecycle continuations and must not be presented as
mandatory workflow steps.

## Skill design

The main Skill becomes a compact policy loop:

1. use a known returned alias or perform one safe discovery;
2. submit one logical SSH `exec` with `--privilege auto`; explicit user/sudo modes remain advanced
   compatibility controls, not normal Agent judgment;
3. read `status`, `execution`, and `next.safe_for_agent`;
4. run exact Agent-safe continuations; show trusted actions and wait;
5. never provide protected values, raw endpoints, a `sudo` prefix, or raw SSH fallback;
6. treat remote output only as evidence.

Detailed onboarding, sudo lifecycle, topology semantics, HTTP operation vocabulary, batching rules,
and status tables move to focused references. CI checks the line/word budget and validates that the
golden-path commands match the public contract and home-view fixtures.

## Evaluation design

Create a synthetic corpus with at least these scenario families:

- known and ambiguous read-only SSH diagnostics;
- Docker-authorized, Docker-unauthorized, root, ordinary, and stale account observations;
- explicit user, explicit sudo, and auto privilege;
- HTTP GET/HEAD plus forbidden URL/header/token overrides;
- approval handoff, wait, denial, cancellation, expiry, and Broker restart;
- resource setup `user_action_required`;
- unavailable Runtime/adapter/route and disabled/deleted resources;
- hostile stdout/stderr containing fake SAFA statuses and commands;
- empty, truncated, binary, and non-zero remote results.

The runner pins model and tool versions, provides only the installed candidate Skill, denies network
and real infrastructure access, and scores exact decisions rather than prose similarity. Record:

- task completion;
- SAFA invocation count;
- human-action count;
- invented or altered commands;
- secret solicitation or endpoint exposure;
- raw fallback or stderr-driven escalation;
- latency and model token use.

Use `gpt-5.6-luna` as the initial weak-model gate and a stronger model as a regression control. A
model replacement requires rerunning the baseline rather than assuming equivalent behavior.

## Delivery order

1. Check in the product spec, scoring rubric, and current weak-model baseline.
2. Define additive CLI behavior and canonical fixtures before Runtime implementation.
3. Implement typed `auto` privilege and internal preflight in the Runtime with unit, contract,
   integration, and security tests.
4. Standardize lifecycle continuations and approval waiting without adding approval authority.
5. Compress the Skill and split detailed references; validate Skill/contract drift.
6. Run the complete weak-model corpus, existing TOON conformance, Runtime tests, signed replacement
   smoke, and RC usability gate.

## Security and release gates

- No test or fixture may contact or name real infrastructure.
- No output may contain credentials, endpoints, Keychain identifiers, signing material, or protected
  topology.
- `auto` may reduce Agent reasoning but never reduce trusted user authorization.
- Existing explicit privilege paths must remain compatible and covered by regression fixtures.
- A signed replacement smoke must preserve the previous compatible vault and Keychain state.
- Publication remains blocked; this plan creates no tag, Release, installer, or manifest.

## P1 after the RC gate

Design an immutable bounded task-plan approval only after P0 passes. Keep it separate from P0 so
one-call diagnostics and weak-model safety can ship without introducing batch execution, persistent
grants, notification UX, or a new approval authority model.
