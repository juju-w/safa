# Release Readiness: SAFA v0.1.0 Preview

**Status**: Source Preview implementation complete — publication hold active

**Updated**: 2026-08-18

## P0 Source Preview Trust

- [X] Exact Runtime source revision, immutable archive URL, SHA-256, root layout, version, schema, OS,
  Xcode, and architecture policy are checked in.
- [X] First `doctor` returns a human-only explicit bootstrap without hidden download or build.
- [X] Local build uses one Apple Development identity and verifies every native component/CDHash.
- [X] Clean source bootstrap passes without Homebrew, `sudo`, `xattr`, or manual binary copying.

Developer ID membership is not a Source Preview blocker. It remains a future prebuilt-binary gate.

## Deferred Prebuilt Runtime Candidate

- [ ] Release builds contain arm64 and x86_64 slices for every distributed executable.
- [ ] Nested component identities and entitlements match reviewed evidence.
- [ ] Unit, contract, integration, security, packaging, and credential-leak tests pass.
- [ ] Exact archive, checksum, component evidence, and notarization log are complete.

## Product Bootstrap

- [X] Source manifest and semantic checks bind the exact repository, revision, archive, digest, root,
  toolchain, architecture set, and reviewed Runtime installer.
- [X] Bootstrap fails closed on mutable/malformed authority, platform/toolchain/signing prerequisites,
  digest mismatch, unsafe extraction, and missing installer/dependency locks.
- [X] Atomic activation retains the previous Runtime and passes the Apple Silicon clean-profile test.
- [X] Agent-facing bootstrap output conforms to `dev.safa.cli/v2` and AXI/TOON requirements.

## Distribution and Presentation

- [X] skills.sh-compatible local-checkout installation finds exactly one `safa` Skill and installs no
  Runtime by itself; repeat the remote-repository check only after publication approval.
- [X] Apple Silicon clean-profile journey passes without `sudo` or Gatekeeper bypass.
- [ ] Intel clean-profile journey passes without `sudo` or Gatekeeper bypass.
- [ ] Website claims and install action match canonical manifests and platform support.
- [X] Secret scan, link checks, manifest fixtures, Skill validation, and conformance tests pass.

## Human Publication Gate

- [X] No unresolved Source Preview P0/P1 defect or unsupported public claim remains.
- [ ] Repository owner explicitly approves lifting the publication hold for exact `v0.1.0`.
- [X] Runtime source support is merged and the exact public source archive is independently verified.
- [ ] Public post-install, bounded diagnostic, failed-update, and rollback smoke tests pass.
