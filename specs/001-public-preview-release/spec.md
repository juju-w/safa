# Feature Specification: SAFA Public Preview Release

**Feature Branch**: `feat/001-public-preview-release`

**Created**: 2026-08-18

**Status**: Draft — source preview implementation authorized; binary publication hold remains active

**Input**: Prepare a free skills.sh-compatible source preview now and retain Developer ID signing as
a later verified-binary distribution gate.

## Product decision

The first release is a **macOS-only `v0.1.0` Source Preview**. The installed Skill remains a small,
reviewable Agent instruction package. On first explicit `safa doctor`, it directs the local human to
one source-bootstrap command. That command downloads an exact digest-pinned Runtime source archive,
builds it locally with Xcode, signs it with the user's Apple Development identity, verifies every
component, and installs it atomically in the current-user scope. It never downloads or asks the user
to bypass Gatekeeper for an untrusted prebuilt executable.

The Runtime still contains the Agent-facing CLI and vault-authoritative Broker; credentials never
enter the Skill, source manifest, shell launcher, Agent transcript, or website. A later precompiled
binary release requires paid Apple Developer Program membership, Developer ID Application signing,
notarization, and the separate verified-distribution gates retained below.

The release is not authorized by this specification. Tags, GitHub Releases, runtime uploads,
skills.sh promotion, and public installers remain blocked until the owner explicitly approves the
final release candidate.

## User Scenarios & Testing

### User Story 1 — Build and install a source preview (Priority: P0)

A Mac developer installs the `safa` Skill through skills.sh-compatible tooling, runs `safa doctor`,
and follows one explicit local build action. The installer verifies an exact source archive, builds
with Xcode, uses the user's local Apple Development identity, verifies native component identities,
and activates the Runtime without Homebrew, `sudo`, a shell-pipe installer, or Gatekeeper bypass.

**Why this priority**: It provides a safe no-subscription preview without weakening the Runtime trust
boundary or teaching users to execute unsigned downloaded binaries.

**Independent test**: On a clean macOS 14.4+ developer profile with supported Xcode and one Apple
Development identity, install the Skill from an exact Git commit, run `doctor`, execute the returned
human-only source-bootstrap action, and verify the Runtime is built, signed, checked, and atomically
activated.

**Acceptance scenarios**:

1. **Given** no Runtime is installed, **When** the Agent runs `doctor`, **Then** the launcher returns
   one `safe_for_agent: false` local source-bootstrap action and performs no hidden download/build.
2. **Given** the user explicitly runs that action, **When** the source revision, archive digest,
   archive layout, local Apple Development identity, component identifier, Team identifier, code
   signature, Runtime version, or host architecture fails validation, **Then** activation fails
   closed and the previous verified Runtime remains active.
3. **Given** a valid Runtime is already active, **When** `doctor` runs again, **Then** the resolver
   reuses it without downloading or asking for elevated privilege.

---

### User Story 2 — Diagnose a host without revealing credentials (Priority: P1)

An Agent discovers an authorized SSH resource and executes a bounded, argument-vector diagnostic
through SAFA. The remote command receives credentials only through the native Runtime boundary.

**Independent test**: Register a synthetic SSH host, run one allowlisted non-`sudo` diagnostic, and
confirm successful TOON v2 output while scanning process arguments, environment, logs, stdout, and
stderr for credential material.

**Acceptance scenarios**:

1. **Given** an enabled SSH resource and a valid stored credential, **When** the Agent runs a bounded
   diagnostic, **Then** the Runtime connects without exposing the credential to the Agent or launcher.
2. **Given** an arbitrary shell, `sudo`, unsupported transport, or unapproved protected detail,
   **When** the Agent requests it, **Then** the Broker denies it with a concise actionable response.
3. **Given** untrusted remote output, **When** it resembles a SAFA control message, **Then** it remains
   remote data and cannot alter control status or next actions.

---

### User Story 3 — Publish a verified prebuilt Runtime later (Priority: P2)

A maintainer can later replace source bootstrap with a universal prebuilt macOS archive from one
reviewed commit, sign every native component with Developer ID Application, notarize it, publish
immutable checksums, and update the product manifest only after all release gates pass.

**Independent test**: Build a non-public release candidate, notarize it, staple the ticket, verify all
components and both architectures, then install and roll back between two synthetic exact versions.

**Acceptance scenarios**:

1. **Given** a reviewed release commit and available signing credentials, **When** release assembly
   runs, **Then** it produces a universal arm64/x86_64 package, checksums, component evidence, and a
   draft manifest without leaking signing material.
2. **Given** any failed test, signature, entitlement, notarization, checksum, architecture, or schema
   gate, **When** release automation runs, **Then** no asset becomes public and no compatibility alias
   advances.
3. **Given** a bad newly installed Runtime, **When** its health check fails, **Then** the resolver keeps
   or restores the prior verified exact version.

---

### User Story 4 — Understand SAFA before installing it (Priority: P2)

A visitor can understand the Agent workflow, trust boundary, current platform support, limitations,
and install path from a focused GitHub Pages site rather than reading an internal roadmap.

**Independent test**: A first-time visitor can identify what SAFA protects, what it currently
supports, what remains unsupported, and the exact installation action without consulting the source
tree.

## Scope

### Included in `v0.1.0` Source Preview

- macOS 14.4 or newer on Apple Silicon and Intel, built for the local architecture;
- Keychain-backed protected resource lifecycle and native user authorization;
- SSH host resources, resource CRUD, topology projection, `doctor`, and bounded non-`sudo` argument
  execution already covered by the shared conformance suite;
- Agent-only `dev.safa.cli/v2` TOON output;
- exact Runtime source revision/archive digest and explicit human-only first-use build/bootstrap;
- a minimal product website and skills.sh-compatible Skill install path.

### Excluded from `v0.1.0`

- Linux or Windows Runtime support;
- arbitrary shell execution, `sudo`, remote account creation, or policy override;
- database, object-storage, cache, browser-password, or service protocol operations;
- GUI, menu-bar application, hosted control plane, iCloud sync, and fleet orchestration;
- automatic execution during Skill installation;
- a public precompiled Runtime archive, mutable `latest` URL, unsigned mirror, or manual Gatekeeper
  bypass.

## Functional Requirements

- **FR-001**: The Source Preview manifest MUST pin an exact public Runtime repository, full commit,
  immutable archive URL, SHA-256 digest, archive root, Runtime version, CLI schema, minimum macOS,
  minimum Xcode, and supported host architectures.
- **FR-002**: First `doctor` MUST perform no hidden source download or build. It MUST return one
  human-only `safe_for_agent: false` action for explicit local bootstrap.
- **FR-003**: Source bootstrap MUST reject unsupported systems/toolchains, a missing or ambiguous
  Apple Development identity, manifest drift, digest mismatch, unsafe archive paths/layout, missing
  installer, invalid component signatures/identities, version mismatch, and architecture mismatch.
- **FR-004**: Source bootstrap MUST build only the local architecture, use the pinned dependency lock,
  install under the current-user application-support scope, use private temporary paths and atomic
  activation, require no `sudo`, and retain the previous verified version on replacement/failure.
- **FR-005**: Signing certificate private keys, Apple credentials, API keys, and app-specific
  passwords MUST remain outside both repositories and logs. Public verification metadata such as the
  Developer Team identifier MAY appear only where the manifest/signature policy requires it.
- **FR-006**: The Source Preview MUST NOT require Apple Developer Program membership, Developer ID,
  notarization credentials, or an app-specific password. A free local Apple Development identity is
  sufficient only because the executable is built for and signed on that user's own Mac.
- **FR-007**: A future verified-binary manifest MUST pin an exact SemVer Runtime version, immutable HTTPS asset
  URL, SHA-256 digest, supported platform/architecture, minimum OS, CLI schema range, Apple publisher
  identity, component identifiers, and mandatory notarization policy.
- **FR-008**: A future verified-binary resolver MUST verify the manifest contract, digest, native
  signature, expected Apple publisher identity, component identities, architecture, notarization,
  and Gatekeeper result before activation.
- **FR-009**: Bootstrap MUST install only under the current user's application-support scope, use a
  private temporary directory and atomic activation, require no `sudo`, and retain the previous
  verified version for rollback.
- **FR-010**: Runtime discovery MUST be explicit on first `doctor`; the Skill installer MUST NOT be
  assumed to execute hooks or arbitrary repository code.
- **FR-011**: All Agent-facing output, including bootstrap errors and corrective actions, MUST conform
  to `dev.safa.cli/v2` and the reviewed AXI/TOON contract. Raw dependency errors MUST NOT enter the
  control channel.
- **FR-012**: Public capability claims MUST match `docs/platform-support.md` and automated evidence.
  Preview and unsupported capabilities MUST be labeled without implying availability.
- **FR-013**: The skills.sh installation path MUST install exactly one `safa` Skill and MUST remain
  usable even though skills.sh does not install, compile, or execute the native Runtime directly.
- **FR-014**: Release automation MUST assemble and validate a draft candidate before any publication;
  it MUST NOT create or move tags, publish assets, or update compatibility aliases while the
  publication hold is active.
- **FR-015**: The GitHub Pages site MUST explain the user journey, trust boundary, security model,
  current support, limitations, exact installation path, and release provenance without duplicating
  mutable facts by hand.
- **FR-016**: Website version/support/install facts MUST be derived from canonical repository
  contracts or manifests and checked for drift in CI.

## Security Invariants

- A modified Skill, launcher, or CLI cannot obtain raw credentials from the Broker.
- Client-supplied identity or authorization claims do not grant Broker authority.
- A mismatched, unsigned, mutable, or unsupported source-built Runtime fails closed. A future
  verified binary additionally fails closed on publisher or notarization mismatch.
- Release metadata and remote output are untrusted input.
- No repository, release log, website, or Agent response contains signing secrets or resource
  credentials.
- The first release does not broaden the existing command policy merely to simplify a demo.

## Success Criteria

- **SC-001**: On clean macOS 14.4+ Apple Silicon and Intel developer profiles, the documented Skill
  install, first `doctor`, and one explicit local source-bootstrap action reach `ready` without
  `sudo`, Homebrew, `xattr` bypass, or manual binary copying.
- **SC-002**: Source archive SHA-256/layout validation, `codesign --verify --deep --strict`, component
  identity/Team/CDHash checks, architecture inspection, Runtime version binding, and launcher lock
  verification pass for the locally built Runtime.
- **SC-003**: A synthetic resource lifecycle and bounded SSH diagnostic pass the shared conformance
  suite with zero credential findings in captured arguments, environment, logs, stdout, and stderr.
- **SC-004**: Every public Runtime reference is exact-versioned and digest-pinned; no `latest`, branch
  archive, floating download URL, or silent fallback is accepted.
- **SC-005**: A failed update retains the previous verified Runtime and a tested rollback restores it
  without accessing secrets outside the Broker.
- **SC-006**: A clean skills.sh discovery check finds exactly one `safa` Skill and its instructions
  resolve the correct platform Runtime on first explicit use.
- **SC-007**: A website content check proves its install command, current version, support matrix, and
  security claims agree with canonical repository files.

## External Dependencies and Human Gates

- A free Apple Account configured in Xcode with one usable Apple Development identity is required for
  Source Preview local signing. Login and signing setup are human-only actions.
- Active Apple Developer Program membership and Account Holder access remain required only for a
  future precompiled Developer ID distribution.
- Apple account login, agreements, payment, certificate issuance, app-specific password entry, and
  private API-key download are human-only actions and MUST NOT be performed or recorded by an Agent.
- A maintainer must explicitly approve lifting the publication hold after the final release-readiness
  checklist passes.
