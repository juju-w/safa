# Implementation Plan: SAFA Core MVP

**Branch**: `feat/006-core-mvp` | **Date**: 2026-08-23 | **Spec**: [spec.md](spec.md)

**Product Alignment**: **Core RC** — integrate and prove the existing four-concept journey without
adding a feature, command family, Agent step, user-presence moment, adapter, or platform.

## Summary

Freeze one exact Product/Runtime revision pair, rerun all automated evidence, build the final staged
macOS candidate with the fixed production identity, execute the complete non-destructive smoke, and
record an MVP decision. The default response to a missing gate is to fix or reject the candidate,
not expand scope.

## Delivery classification

| Workstream | Classification | Current decision |
|---|---|---|
| Product definition, CLI v2, compact Skill, one-call auto privilege, canonical fixtures, weak-Agent runner | Core MVP | Implemented in product workspace; rerun after revision freeze |
| Native SSH/HTTP execution, exact approval, credential isolation, packaging | Core MVP | Runtime evidence must be pinned to the final product revision |
| Final production-Team signing, notarization, entitlement verification, replacement smoke | Core MVP blocker | Must pass on final staged artifact |
| Minimal additional Resource name/role/caution | Conditional core candidate | Do not implement unless alias-selection evaluation misses the 95% gate |
| Memory, Timeline, observation, ambient integration, migration, GUI, task plans, more adapters/platforms | Post-RC | No tasks in this plan |
| Public tag, manifest promotion, installer, marketplace publication | Separate RC decision | Forbidden by this plan |

## Candidate identity

Before final validation, record in a private/local evidence worksheet without protected resource
data:

- exact `juju-w/safa` commit;
- exact `juju-w/safa-runtime` commit;
- CLI schema and Skill digest;
- Runtime version, artifact digest, architecture set, and macOS version;
- production Developer Team and expected signed role identifiers;
- previous compatible Runtime version used for replacement; and
- every automated and manual gate result.

Changing either commit, public contract, Skill, Runtime binary, entitlement, signing step, package,
or manifest invalidates downstream evidence and restarts the affected gates.

## Execution plan

### Phase 1 — Freeze scope and paired revisions

1. Review the final diff against `PRODUCT.md` and [spec.md](spec.md).
2. Confirm specification 004 is evidence for the implemented Agent path, not a second release plan.
3. Confirm specification 005 and all proposed context contracts remain post-RC and non-current.
4. Select one product commit and one Runtime commit; record the pair before building.
5. Reject any proposed MVP addition that is not required by an unmet acceptance criterion.

### Phase 2 — Reproduce automated product and Runtime evidence

1. Run Product Skill validation, product-core drift, weak-Agent evidence validation, strict TOON
   conformance, launcher contracts, JSON/YAML consistency, website checks, and whitespace checks.
2. Run the isolated `gpt-5.6-luna` corpus on the frozen Skill/contract/runner/rubric revisions;
   require at least 95% completion and zero safety violations.
3. In Runtime, run formatting, full Swift unit/contract/integration/security tests, Release build,
   unsigned Xcode assembly, leakage repetitions, and source-preview installer contracts.
4. Verify Runtime conformance consumes the exact pinned product contract and fixtures rather than a
   mirrored divergent schema.

### Phase 3 — Produce and verify the final staged candidate

1. Build through the reviewed production packaging path using protected publisher automation.
2. Verify the final staged app after every export/signing step: exact version, digest,
   architectures, production Team, role identifiers, designated requirements, Broker-only Keychain
   entitlement, Hardened Runtime, and notarization.
3. Confirm the resolver selects only that exact version and digest and has no unsigned or `latest`
   fallback.
4. Stop immediately on a Team, entitlement, helper-role, digest, notarization, or replacement
   mismatch. Do not reset the vault or re-register Resources to continue.

### Phase 4 — Run the end-to-end MVP smoke

Use [the RC smoke plan](../../docs/rc-smoke-plan.md) on disposable non-production Resources and the
installed Skill launcher. Record only pass/fail, versions, safe aliases/placeholders, and bounded
sanitized evidence.

The smoke must cover:

- trusted SSH and HTTP registration with zero Agent-visible protected values;
- a fresh known-alias direct read with no mandatory preflight;
- unknown-alias one-discovery behavior;
- exact HTTP GET and HEAD plus override rejection;
- root, Docker-authorized, ordinary, password-sudo, NOPASSWD, and failure privilege cases;
- one exact review plus Agent-safe wait and terminal Evidence;
- denial, cancellation, expiry, hostile output, unavailable dependency, and Broker restart;
- previous-compatible-to-candidate replacement preserving Resource, vault, and Keychain state; and
- rollback behavior without deleting durable state.

### Phase 5 — Record the MVP decision

The human reviewer chooses exactly one outcome:

- **MVP accepted**: every required automated, signed-artifact, and smoke gate passed on the same
  immutable candidate; the publication hold still remains.
- **Candidate rejected**: record stable failed gates and produce a new paired candidate after fixes.

Do not use “accepted with known security/replacement failures.” Do not call a source preview,
partially signed build, or state-reset workaround an MVP.

### Phase 6 — Optional RC handoff

Only after MVP acceptance and a separate explicit release request may release work create an RC tag,
Draft GitHub Release, exact verified manifest, or installer publication. Release scope equals the
accepted candidate; it does not reopen deferred features.

## Constitution check

| Gate | Result | Evidence/decision |
|---|---|---|
| Product concepts | PASS | No concept beyond Resource, Task, Decision, Evidence |
| Normal Agent path | PASS | Known alias is one exact Task; unknown alias permits one discovery |
| Runtime-owned complexity | PASS | Readiness, route, account, privilege, policy, credential, and bounds stay native |
| Human presence | PASS | Registration/change and one exact privileged handoff only |
| Credential boundary | PASS | No secret or protected selector enters Agent-visible channels or repository evidence |
| Current-support truthfulness | PASS | Only SSH and exact HTTP slice are MVP execution claims |
| Deferred isolation | PASS | 005 capabilities and broader platform/adapter work have no MVP tasks |
| Publication hold | PASS | MVP acceptance is internal; RC publication remains separately authorized |

## Complexity tracking

This plan adds no production component. Its only new artifacts are the acceptance specification,
paired-candidate record, reproducible evidence, and final decision. Any implementation task beyond
fixing a failed existing gate requires a new Product Alignment decision.
