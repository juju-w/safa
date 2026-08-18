# Tasks: SAFA Source Preview

**Status rule**: Check an item only when its command/test evidence exists. Prebuilt binary
publication remains held.

## Phase 0 — Source Preview contract and installer

- [X] T001 Record the local non-sensitive baseline: macOS arm64, supported Xcode, one usable Apple
  Development identity, and an already functioning source-built Runtime.
- [X] T002 Add and validate a versioned Source Preview manifest contract covering exact repository,
  commit, archive URL/digest/root, Runtime/CLI versions, macOS/Xcode minimums, architectures, and
  local signing mode.
- [X] T003 Add the exact manifest for the reviewed public `safa-runtime` commit and independently
  verify its GitHub source archive SHA-256 and layout.
- [X] T004 Add a human-only source-bootstrap script that validates platform, toolchain, identity,
  manifest, digest, archive paths, required installer, and pinned dependency locks before build.
- [X] T005 Reuse the Runtime's existing build/sign/verify/atomic-install script without copying native
  implementation into the product repository.
- [X] T006 Update first `doctor` and stale-lock remediation to return the exact Source Preview action
  as `safe_for_agent: false`, with no hidden download/build.

## Phase 1 — Fail-closed tests and documentation

- [X] T007 Add manifest schema/semantic tests for mutable URLs, malformed revisions/digests, wrong
  root/repository, unsupported versions/architectures, and missing installer data.
- [X] T008 Add launcher tests proving missing Runtime returns the Source Preview action while a valid
  local Runtime remains the only executable path.
- [X] T009 Add bootstrap contract tests for unsupported OS, non-interactive invocation, missing or
  ambiguous Apple Development identities, digest mismatch, unsafe archive layout, and installer
  failure without mutating an active Runtime.
- [X] T010 Update Skill instructions, README, architecture, distribution, platform support, and
  manifest documentation to distinguish free source preview from paid verified-binary distribution.
- [X] T011 Keep `dev.safa.cli/v2`, credential boundaries, bounded SSH policy, and source-vs-remote
  output handling unchanged.

## Phase 2 — Local Source Preview acceptance

- [X] T012 Run Skill validation, manifest tests, launcher syntax/contract tests, TOON conformance,
  secret scanning, Markdown/link checks, and `git diff --check`.
- [X] T013 Run the exact source-bootstrap on the current Mac, retain the prior Runtime as a backup,
  and verify component signatures, identities, Team binding, CDHashes, architecture, and version.
- [X] T014 Run `doctor`, resource listing, topology, and one synthetic/local non-secret command path
  through the installed Source Preview without contacting production infrastructure.
- [X] T015 Verify `npx skills add` against the release checkout discovers exactly one Skill, installs
  no native code by itself, and carries the source manifest/bootstrap script. Repeat against the
  remote repository only after publication is explicitly approved.
- [X] T016 Record Apple Silicon evidence; retain Intel clean-profile validation as a publication
  checklist item if no Intel runner is available during implementation.

## Phase 3 — Preview review and publication decision

- [X] T017 Complete `checklists/release-readiness.md` with zero unresolved Source Preview P0/P1
  defects and truthful developer-toolchain prerequisites.
- [ ] T018 Open a Draft PR for review; do not tag, create a GitHub Release, upload a binary, or deploy
  a marketplace package.
- [ ] T019 Obtain explicit owner approval before merging/promoting the Source Preview through
  skills.sh discovery or the planned GitHub Pages site.
- [ ] T020 Monitor bootstrap/build failures and fix forward by pinning a new exact Runtime commit and
  digest; never mutate a committed manifest's source authority silently.

## Deferred track — Verified prebuilt macOS Runtime

- [ ] T021 Join Apple Developer Program only when prebuilt distribution is justified.
- [ ] T022 Create Developer ID Application and local `notarytool` credentials through human-only
  Apple account flows.
- [ ] T023 Reconcile Runtime tasks T081, T082, T083, T084, T095, T096, and T099; implement universal
  build, Hardened Runtime, timestamp, notarization, stapling, Gatekeeper, and release evidence.
- [ ] T024 Extend/version the binary manifest and resolver, validate clean Apple Silicon/Intel
  downloads and rollback, and lift the binary publication hold only by explicit approval.

## Later presentation track — GitHub Pages

- [ ] T025 Create the static `website/` project and Pages workflow without adding Runtime binaries or
  a second source of truth for release facts.
- [ ] T026 Implement Home, synthetic interactive demo, Security, Docs, and Releases pages using the
  current mascot assets and responsive HTML content.
- [ ] T027 Generate or verify website version, install, platform-support, and provenance claims from
  canonical repository files; fail CI on drift.
- [ ] T028 Test keyboard access, reduced motion, mobile/desktop layouts, broken links, metadata/social
  previews, and the Source Preview journey.
