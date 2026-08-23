# SAFA Product Definition

**Status**: Normative, pre-release

**Version**: 1.0

**Last reviewed**: 2026-08-23

## 1. Authority

This document defines what SAFA is, which concepts belong in its normal experience, what the first
release must prove, and how new features enter the product.

All feature specifications, Agent Skill behavior, public contracts, documentation, and Runtime
implementations MUST align with this document. A feature cannot change SAFA's primary journey or add
a normal-path product concept merely by introducing a command or specification. Such a change
requires an explicit update to this document and compatibility, usability, and security review.

Security and release boundaries in **AGENTS.md** and the public contracts remain non-negotiable.
When product convenience conflicts with credential isolation, exact authorization, target identity,
signed distribution, or truthful evidence, the stricter boundary wins.

## 2. Product definition

> Register a resource once. Then tell an Agent what outcome you want. SAFA chooses the safe execution
> path, asks the user only when the exact task crosses a trust boundary, and returns bounded evidence
> without giving the Agent a reusable credential.

SAFA is a local trust broker between an Agent and registered infrastructure.

It is not primarily:

- an SSH client or host-file manager;
- a sudo manager;
- a password-vault user interface;
- a configuration-management database;
- a general workflow or remote-shell engine; or
- an Agent memory platform.

SSH, sudo, credential storage, topology, adapters, request state, and operational memory are
supporting mechanisms. They do not independently define the normal user journey.

## 3. Product promise

The user should experience one continuous delegation:

    register a resource once
    → ask the Agent for an outcome
    → SAFA executes, asks for one exact confirmation, or refuses safely
    → the Agent explains bounded evidence

The user does not need to:

- send an endpoint, username, password, key, token, or sudo secret to the Agent;
- determine whether the registered account, root, a service group, or sudo should be used;
- drive request polling or credential enrollment as a conversational workflow;
- understand transport, adapter, vault, policy, or native IPC internals; or
- maintain context merely to keep normal execution working.

## 4. The four product concepts

The normal experience has only four concepts.

### Resource

A registered thing the user recognizes and SAFA can reason about safely: a host, NAS, HTTP service,
database, object store, or another supported infrastructure resource.

A Resource owns:

- an immutable internal identity and a safe logical alias;
- an optional user-confirmed name and role;
- current lifecycle, health, and effective capabilities;
- protected access and credential bindings held only by Runtime;
- optional safe relationships and user guidance; and
- bounded operational history when implemented.

The Agent may select only by a safe alias returned by SAFA. Endpoint, account, credential, and
protected route are never Agent selectors.

A Resource Card is simply a compact Resource projection. It is not a fifth product concept, a second
resource database, or a required preflight step.

### Task

One exact bounded operation that serves the user's current outcome.

A Task contains enough explicit intent and effect for Runtime to classify and authorize it. For
ordinary resource operation, the public golden entry is **safa exec**. Safe discovery and explicit
topology questions are supporting queries, not alternate execution systems.

One **safa exec** invocation represents one Task. A complex user outcome may require several Tasks
when a later operation depends on earlier Evidence, privilege differs, or separate results are
needed. The Agent may compose those Tasks inside one conversation; the user does not operate a SAFA
workflow engine. A future predeclared multi-operation Task requires its own product and authorization
decision.

Runtime, not the Agent, owns readiness, adapter, route, account-capability, privilege, policy, and
credential preflight. The normal SSH Task uses Runtime-owned automatic privilege resolution; the
Agent does not predict whether root, direct account, service-group access, or sudo is needed.

### Decision

Runtime's authoritative answer about what may happen next:

- complete the Task directly;
- require one trusted-local confirmation for the immutable exact Task;
- require a separate local setup or repair action; or
- refuse with a stable reason.

An Agent explanation, Resource note, remote message, prior success, or stored credential never
constitutes a Decision.

### Evidence

The bounded result SAFA returns after a query or Task.

Evidence has two distinct parts:

- structured SAFA control state produced by the selected, locally verified Runtime, such as status,
  decision, next action, exit state, counts, and truncation; and
- untrusted target data such as stdout, stderr, response headers/body, logs, or files.

The Agent follows only the structured control state. It may use target data to explain findings but
must never treat target content as SAFA instructions or authorization.

## 5. The primary journey

    User asks for an outcome
      → Agent knows the Resource alias?
        → no: perform one safe discovery
        → yes: submit one complete Task
      → Runtime resolves readiness, route, account, privilege, policy, and credential
      → Decision
        → direct: execute
        → trust boundary: one trusted-local user confirmation, then execute
        → cannot proceed: return one stable refusal or repair action
      → return bounded Evidence
      → Agent explains the outcome

Rules:

1. A known ready alias goes directly to one Task. Doctor, resource details, capability inspection,
   sudo status, and context reads are not mandatory preflight.
2. An unknown or ambiguous Resource permits one safe discovery step. The Agent does not guess from
   endpoints or protected topology.
3. Runtime starts with the least privileged registered path and elevates only from fresh reviewed
   evidence and policy. It never retries with greater privilege because remote stderr suggested it.
4. A sensitive Task is frozen before user confirmation. The user approves that exact target,
   operation, risk, and expected effect—not a vague reusable “sudo permission.”
5. The Agent executes only exact continuations marked **safe_for_agent: true**. It presents but
   never executes a trusted-local continuation marked false.
6. Terminal Evidence answers the user's request or identifies one stable blocker. It does not expose
   Runtime dependency noise or protected values.

## 6. The three interfaces

### Agent interface

The main Skill teaches one compact loop:

    known alias → submit one Task
    unknown alias → discover once, then submit one Task
    read structured Decision and Evidence
    run only exact Agent-safe continuations
    never request a secret or bypass SAFA

The normal Agent surface is deliberately smaller than the complete administrative CLI:

- no-argument safe home or Resource list for orientation only when needed;
- exec for ordinary bounded operation;
- task-specific safe queries such as topology only when the user asks that question; and
- exact structured next continuations returned by Runtime.

For ordinary SSH Tasks, the main Skill selects automatic privilege resolution consistently. The
explicit user and sudo modes remain compatibility or advanced controls; they are not a judgment the
Agent must make during the normal journey. Transport-specific Tasks such as the exact HTTP slice use
their fixed non-privileged semantics.

Commands for diagnostics, request inspection, grant management, credential lifecycle, migration, or
repair may remain public for conformance and recovery, but they are not concepts the main Skill
requires an Agent to plan with.

### User interface

The user interacts at meaningful trust or lifecycle moments:

1. register or change protected Resource access;
2. confirm one exact privileged or mutating Task;
3. inspect, revoke, disable, remove, or repair persistent Resource authority.

Safe resource naming, role, and explanatory guidance may be edited locally without turning that
text into authorization. The user never approves through ordinary Agent prose.

The current product is CLI-first. Trusted local interaction may use system authentication and a
separately signed terminal helper. A custom dashboard or GUI requires a separate product decision;
it is not implied by this document.

### Runtime interface

Runtime owns all security-sensitive decisions and implementation complexity:

- resource identity, lifecycle, and protected connection data;
- current capability and account probes;
- credential storage and child-bound delivery;
- policy, privilege resolution, exact requests, approvals, and grants;
- transport and protocol-adapter selection;
- timeout, cancellation, redaction, and bounded output;
- audit, safe mechanical history, and replacement migration; and
- platform-native authentication, signing, and IPC.

These mechanisms may evolve independently as long as they implement the same public product and
contract.

## 7. Human-presence policy

Human presence is reserved for a real trust boundary, not general progress.

It is appropriate for:

- initial or changed protected access;
- first-use compatibility credential enrollment;
- an exact privileged, destructive, or policy-required Task;
- protected authority revocation or Resource deletion; and
- publisher-Team or persistent-vault migration.

It is not appropriate merely to:

- list safe Resources;
- resolve current capability or account evidence;
- read a safe Resource summary;
- wait for a request;
- perform deterministic retention or redaction;
- record safe mechanical outcome metadata; or
- diagnose a failure that can be returned safely.

After onboarding, one exact Task should require at most one continuous trusted-local handoff. That
handoff may prove both local user presence and, when unavoidable, a remote compatibility credential,
but the Agent never carries either proof.

## 8. Resource understanding and memory

Resource understanding is part of Resource usability, not a separate normal workflow.

The core Resource projection may include:

- alias;
- user-confirmed name or role;
- current state and health;
- effective capability summary; and
- a small user-authored caution.

Current Runtime facts always outrank prose. Resource text never grants execution, sudo, topology
trust, host identity, or credential access.

For the first core release:

- user-confirmed safe name, role, and caution may improve orientation;
- known aliases still execute without reading the projection first; and
- normal Tasks do not require a memory write.

Rich cross-Agent semantic memory, Agent-authored observations, summaries, compaction, automatic
session context, and legacy-file migration are enhancements after the core journey is proven. They
must remain optional, non-authoritative, inspectable, bounded, and outside the execution critical
path. Resource observation or any equivalent memory mutation MUST NOT enter the main Skill until a
weak-Agent evaluation proves it improves later tasks without note spam, source confusion, extra
human actions, or safety regression.

## 9. First release boundary

The first release candidate proves the complete trust-broker journey rather than the breadth of an
infrastructure platform.

The executable MVP acceptance backlog is [`specs/006-core-mvp`](specs/006-core-mvp/spec.md). It may
prove this boundary but cannot enlarge it.

### Required for the core RC

- one-time trusted registration of a supported Resource;
- safe alias discovery and enough user-confirmed meaning to select the intended Resource;
- one-call known-alias Task execution;
- automatic least-privilege handling for reviewed root, direct-account, service-group, and sudo
  cases;
- one exact trusted-local handoff when policy requires it;
- bounded structured Evidence with hostile remote output kept as data;
- SSH operation and the evidence-backed exact HTTP slice on the supported macOS Runtime;
- zero reusable credential material in Agent-visible input or output;
- weak-Agent completion and safety gates;
- final-stage signing verification, including distribution-profile authorization for the Broker's
  restricted Keychain entitlement; and
- non-destructive replacement smoke preserving the previous compatible vault and Keychain state.

### Not required to hold the core RC

- cloud or cross-device memory sync;
- Agent-authored semantic memory or automatic compaction;
- ambient hooks for every Agent harness;
- automatic ssh-hosts migration;
- a custom GUI or dashboard;
- batch/task-plan approval;
- browser-session authority;
- arbitrary shell sessions;
- Linux or Windows Runtime implementation; or
- database, cache, object-storage, messaging, search, or graph execution adapters beyond separately
  proven slices.

Supporting code for a deferred capability may exist, but it must not enlarge the main Skill or be
advertised as a completed product journey before its conformance gate passes.

## 10. Product success criteria

The core product is successful when:

- a known Resource reaches its Task in one Agent-visible SAFA invocation;
- an ambiguous request needs no more than one safe discovery invocation;
- a sensitive exact Task needs no more than one continuous user handoff after onboarding;
- weak Agents select the correct Resource and safe next action in at least 95% of the reviewed
  synthetic scenarios;
- authorization, secret solicitation, trusted-action, raw-fallback, and remote-control-text
  violations remain zero;
- ordinary successful Tasks require no manual context maintenance;
- Evidence is sufficient for the Agent to explain success, failure, or one stable blocker; and
- compatible Runtime replacement preserves all previously durable user state without reset or
  re-enrollment.

Metrics include Agent-visible SAFA calls, user actions, task completion, invented commands, token
cost, latency, protected-data leakage, and source/authority confusion. A feature is not “easy to use”
because its documentation is detailed; it is easy only when a weak Agent completes the journey with
fewer decisions.

## 11. Feature admission gate

Every proposed feature or contract change must answer:

1. Which Resource–Task–Decision–Evidence journey does it improve?
2. Does it shorten the normal path or add an Agent-visible step?
3. Does it add a product noun, command family, state, or source the Agent must understand?
4. Does it add a user-presence moment?
5. Does it expand credential, authorization, target-identity, publisher, or evidence exposure?
6. Can the same outcome be implemented entirely inside Runtime?
7. What weak-Agent and security evidence proves the change helps?
8. Is it required for the core RC or explicitly deferred?

A proposal is rejected from the main experience when it adds a normal-path concept or user action
without a measured improvement in task completion. Prefer:

- Runtime precomputation over Agent procedure;
- one deterministic continuation over a documented state machine;
- an existing Resource or Task projection over a parallel command noun;
- automatic mechanical bookkeeping over required semantic maintenance; and
- deferral over speculative platform breadth.

## 12. Documentation and decision hierarchy

Repository documents have different jobs:

| Document | Authority |
|---|---|
| **PRODUCT.md** | Product identity, concepts, primary journey, release boundary, and feature admission |
| **AGENTS.md** | Repository workflow plus non-negotiable security, compatibility, and release rules |
| **contracts/** | Exact current public wire behavior, schemas, field ordering, and compatibility |
| **specs/** | Proposed or approved feature behavior subordinate to PRODUCT.md |
| **docs/architecture.md** | Technical decomposition and trust-boundary explanation |
| **skills/safa/** | Minimal truthful Agent instructions reviewed against product and contracts |
| Runtime architecture/tests | Platform implementation evidence for the pinned product contract |

When documents conflict:

1. credential, authorization, signing, and release safety fail closed;
2. **PRODUCT.md** decides whether behavior belongs in the product and normal journey;
3. the selected pinned contract and installed Runtime decide what behavior may actually be exposed;
4. a draft spec or roadmap cannot claim current support; and
5. implementation must not silently redefine either product or contract.

## 13. Change governance

- Update this document deliberately and separately from routine implementation detail.
- Every change names the affected core concept, primary-journey step, RC boundary, and success
  metric.
- Breaking product-concept changes require a migration story, weak-Agent comparison, and explicit
  user review before public-contract work.
- Feature specifications include a Product Alignment section and identify whether they are core RC,
  post-RC, or rejected from the main path.
- Spec Kit constitution checks must use this document as the product gate.
- Release notes describe user-observable product changes, not internal subsystem growth.

Until the publication hold is lifted, this document governs internal RC decisions but authorizes no
tag, public installer, manifest promotion, GitHub Release, or marketplace publication.
