# Implementation Plan: Resource Cards and Cross-Agent Operational Memory

**Branch**: `feat/005-resource-context` | **Date**: 2026-08-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-resource-context/spec.md`

**Delivery classification**: Only the minimal user-confirmed Resource projection is eligible for the
core RC. Notebook/Timeline persistence, Agent observation, semantic compaction, ambient adapters,
and legacy migration are independent post-RC slices. They do not block or enlarge the core release.

**Plan status**: **NEEDS REBASELINE** — do not generate tasks from or implement this document as one
phase sequence. Split post-RC capabilities into independently admitted specifications after the
minimal Resource projection is evaluated.

## Summary

Make SAFA feel as immediately understandable as `ssh-hosts` without moving credentials, policy, or
machine truth into Markdown. Reuse `resource list/show` as the Agent-facing Resource Card surface,
add optional attributed Agent observations, and compose each card from existing Runtime facts plus a
new encrypted Resource Notebook and automatic mechanical Timeline.

The product repository defines additive CLI v2 fields, typed product contracts, canonical fixtures,
Skill behavior, Agent integration semantics, migration rules, and weak-model gates first. The macOS
Runtime then adds atomic vault mutation, typed Notebook/Timeline/workspace/migration models, focused
Broker services, explicit versioned IPC DTOs, CLI projection, and trusted-local console flows. No new
execution verb, generic context workflow, custom GUI, secret ingestion path, or public release is
introduced.

## Technical Context

**Language/Version**: Product contracts and fixtures in Markdown, JSON, and TOON v4.1; validators in
Python 3 and Node.js 23.7. Current Runtime implementation uses Swift tools 6.1, Swift language mode
6, and strict concurrency.

**Primary Dependencies**: Existing repository validators and pinned official TOON 4.1.1 reference;
Runtime Foundation, CryptoKit, Security/Keychain, LocalAuthentication, XPC, and
`swift-argument-parser` 1.8.2. No new third-party production dependency.

**Storage**: Existing AES-GCM encrypted `VaultDocument` with an OS-protected
`WhenUnlockedThisDeviceOnly` Keychain key and atomic file replacement. Add backwards-compatible
top-level Notebook, Timeline, workspace-binding, and migration-transaction collections. No
plaintext context file, second vault, database, or remote memory.

**Testing**: Product Markdown/JSON checks, Skill validator, Skill drift validator, strict canonical
JSON/TOON conformance, launcher shell syntax, and isolated Luna weak-Agent evaluation. Runtime
`swift test` across Unit, Contract, Integration, and Security targets; `swift-format`, Release build,
synthetic trusted-local journeys, and signed non-destructive replacement smoke.

**Target Platform**: Platform-neutral product contract. First conforming implementation is native
macOS 14+ on arm64 and x86_64 where the existing signed Swift Runtime passes all gates. No Linux or
Windows support claim is added.

**Project Type**: Coordinated two-repository product/CLI plus native per-user Broker Runtime.

**Performance Goals**:

- workspace ambient projection: at most eight cards, 2 KiB canonical TOON, and 512 reference tokens;
- detailed card: at most 6 KiB canonical TOON and 1,200 reference tokens;
- warm local card projection p95 below 250 ms for the supported scale, with no network operation;
- session integration hard timeout at 2 seconds and soft failure rather than blocking Agent startup;
- Timeline append completes before the control response under a healthy vault without changing
  remote execution timeout semantics;
- `--version` fast path and known-alias one-call execution latency remain unchanged.

**Constraints**:

- `dev.safa.cli/v2` and canonical TOON remain the only Agent control channel;
- known-alias execution has no mandatory card, context, doctor, capability, or privilege-status read;
- ambient session start performs no remote probe, approval, user-presence prompt, or transcript read;
- no endpoint, username, fingerprint, credential, raw command, stdout, stderr, or transcript enters
  Notebook, Timeline, ambient context, fixtures, or migration preview;
- Runtime facts remain authoritative over all semantic memory;
- trusted user guidance and `ssh-hosts` migration use the signed trusted-local role;
- context maintenance failure cannot falsify or block an already authorized operation;
- Runtime remains CLI-first; this plan adds no SwiftUI/window/menu-bar/custom approval surface;
- exact signed replacement must preserve the previous compatible vault and Keychain state;
- publication hold remains in effect.

**Scale/Scope**: Up to 64 active Resources per installation; eight cards per ambient projection; 16
active user-guidance entries, 64 Agent observations, eight summaries, a 128 KiB Notebook, and 128
Timeline events/64 KiB per Resource. Three Agent session adapters are independently gated. Migration
supports only explicitly versioned synthetic-tested `ssh-hosts` document shapes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

The ratified constitution applies `PRODUCT.md` as the product gate, while this repository's
`AGENTS.md` and the Runtime repository's `AGENTS.md` provide the security and delivery gates. The
post-design re-check keeps only the minimal Resource projection in the core-RC path; all richer
memory and migration slices remain post-RC.

| Gate | Pre-research result | Evidence/decision |
|---|---|---|
| Product alignment and RC scope | PASS WITH SPLIT | Minimal confirmed Resource meaning may support core selection; memory, ambient integration, and migration are post-RC and cannot block release |
| Product/runtime ownership | PASS | Product repo owns CLI/TOON/Skill/contracts; Runtime repo owns vault, IPC, native authorization, and execution |
| Credential and protected-data isolation | PASS | No card, note, hook, or migration path accepts or returns a credential; trusted-local helper owns protected input |
| CLI v2 and AXI compatibility | PASS | Reuse list/show, preserve default rows, add only reviewed optional fields/flags and one optional mutation |
| One-call execution | PASS | `safa exec` remains sole normal execution entry; card reads are never prerequisites |
| Typed boundaries | PASS | New Agent/trusted-local operations use explicit versioned DTOs, not dynamic dictionaries or persistence models |
| Publisher/Keychain persistence | PASS | One existing vault/entitlement chain; two replacement-smoke matrices; no reset workaround |
| CLI-first Runtime scope | PASS | Trusted view uses existing terminal helper; no custom GUI target |
| Publication hold | PASS | No manifest, installer, tag, Release, or package publication in this feature |
| Validation and synthetic data | PASS | Contract fixtures, weak-Agent corpus, Swift test layers, leakage suite, and replacement smoke use synthetic resources only |

No gate violation requires a complexity exception.

## Project Structure

### Documentation and design artifacts

```text
specs/005-resource-context/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── resource-card-v2.md
    ├── resource-memory-v1.md
    ├── session-context-provider-v1.md
    └── ssh-hosts-migration-v1.md
```

### Product repository: `juju-w/safa`

```text
contracts/
├── cli-v2.md
├── resource-directory-v1.md
└── skill-runtime-v1.md

conformance/agent-cli-v2/
├── resource-show-baseline.*
├── resource-card-list.*
├── resource-card.*
├── resource-observe.*
├── setup-context.*
└── resource-migration.*

skills/safa/
├── SKILL.md
├── references/
│   ├── cli.md
│   ├── resources.md
│   └── lifecycle.md
└── scripts/
    └── session-context/        # generated/validated Agent adapter fragments

evals/agent-usability/
├── scenarios.json
├── rubric.json
└── baseline-*.json

tests/
├── validate_skill.py
├── validate_skill_drift.py
├── validate_agent_usability_eval.mjs
├── validate_session_context_adapters.*
└── verify_toon_conformance.mjs
```

### Runtime repository: `juju-w/safa-runtime`

```text
Sources/
├── SAFADomain/
│   └── Resources/
│       ├── ResourceNotebook.swift
│       ├── ResourceTimeline.swift
│       ├── WorkspaceResourceBinding.swift
│       └── ResourceMigration.swift
├── SAFACrypto/
│   └── EncryptedVault.swift
├── SAFAProtocol/
│   ├── Agent/
│   │   ├── AgentResourceCardV2.swift
│   │   └── AgentResourceObservationV2.swift
│   ├── ResourceCardV1.swift
│   ├── ResourceNotebookMutationV1.swift
│   ├── WorkspaceResourceBindingV1.swift
│   └── TrustedLocal/
│       ├── TrustedResourceViewV1.swift
│       └── SSHHostsMigrationPlanV1.swift
├── SAFABroker/
│   ├── Resources/
│   │   ├── ResourceCardService.swift
│   │   ├── ResourceCardProjectionMapper.swift
│   │   ├── ResourceNotebookService.swift
│   │   ├── ResourceTimelineService.swift
│   │   ├── WorkspaceResourceBindingService.swift
│   │   └── SSHHostsMigrationService.swift
│   └── Execution/
│       └── ResourceTimelineRecorder.swift
├── SAFACLI/
│   ├── Commands/Resource/
│   ├── Commands/Setup/
│   └── Presentation/
└── SAFATrustedSetup/
    ├── TrustedResourceManagementFlow.swift
    ├── TrustedSessionContextFlow.swift
    └── TrustedSSHHostsMigrationFlow.swift

Tests/
├── Unit/
├── Contract/
├── Integration/
├── Security/
└── Fixtures/
```

**Structure Decision**: Extend the existing typed Resource directory and target boundaries. Notebook
and Timeline are separate domain files and vault collections; card composition lives in a focused
Broker service; public presentation remains in SAFACLI; trusted-local editing and migration remain
in the signed helper. Do not expand the existing Broker or CLI monolith files when a feature
directory owns the responsibility.

## Rebaseline decision

The former combined Phase A–F delivery sequence is retired. This document is design input, not an
implementation queue, and MUST NOT be converted wholesale into tasks.

### Core-RC candidate

Create a separate narrow specification only if the existing safe Resource projection cannot meet the
`PRODUCT.md` alias-selection gate. That specification may consider user-confirmed safe name, role,
and caution fields. It must prove a measurable weak-Agent selection benefit without adding a
known-alias preflight, memory write, new product noun, or user-presence step to ordinary execution.

### Independent post-RC proposals

The following each require their own Product Alignment, threat/compatibility analysis, weak-Agent
evidence, contract fixtures, Runtime plan, and explicit human review before tasks are generated:

1. encrypted Notebook and bounded mechanical Timeline;
2. Agent-authored observations or semantic summaries;
3. workspace-scoped ambient session integration;
4. trusted-local Resource management views; and
5. non-destructive `ssh-hosts` migration.

None may modify the current CLI contract, main Skill, Runtime, RC smoke gate, or release claim merely
because its design appears below or in a linked artifact.

### Retained design evidence

[research.md](research.md), [data-model.md](data-model.md), [quickstart.md](quickstart.md), and the
proposed [contracts](contracts/) remain non-normative research inputs. Their models, budgets, phases,
and command examples are not fixed interfaces or current support. Each independent future proposal
must revalidate rather than inherit their conclusions.

## Post-rebaseline constitution check

| Gate | Result | Decision |
|---|---|---|
| Core product path | PASS | Known aliases still go directly to one Task; no context read or write is required |
| Core-RC scope | PASS | Only a separately proven minimal Resource projection may enter the core release |
| Post-RC isolation | PASS | Memory, observations, ambient integration, trusted views, and migration have no active delivery sequence |
| Current support truthfulness | PASS | Proposed contracts and quickstart are explicitly non-current |
| Publication hold | PASS | This rebaseline authorizes no Runtime implementation, manifest, installer, tag, or Release |
