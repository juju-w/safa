# Research: Free Source Preview and Future Developer ID Distribution

## Decision 1 — Ship a source-built preview before paying for Developer ID

**Decision**: The first macOS `v0.1.0` is a developer Source Preview. A human explicitly downloads an
exact digest-pinned Runtime source archive, builds it locally with Xcode, and signs it with the local
Apple Development identity.

**Rationale**: Apple offers no free Developer ID distribution identity. Local source build validates
SAFA's functional and security workflow before incurring the annual Apple Developer Program cost. It
also avoids distributing a quarantined unsigned binary or teaching users to bypass Gatekeeper.

**Local baseline on 2026-08-18**: macOS arm64, supported Xcode, one usable Apple Development identity,
and an existing locally built/signed Runtime. Developer ID Application and a dedicated notary profile
are absent. Personal names, Team identifiers, certificate fingerprints, and credentials were not
recorded.

## Decision 2 — Source bootstrap remains explicit and human-only

**Decision**: `safa doctor` never downloads or compiles. With no Runtime, it returns one
`safe_for_agent: false` command that a local human runs from the installed Skill directory.

**Rationale**: skills.sh copies Skill files and is not a native installer. Hidden build hooks would
make Skill installation surprising and enlarge its supply-chain boundary. Explicit bootstrap keeps
network access, Xcode signing, and installation visible while preserving Agent-native remediation.

## Decision 3 — Pin both source identity and archive bytes

**Decision**: The Source Preview manifest binds the public repository, full Git commit, exact GitHub
archive URL, SHA-256, expected root directory, Runtime version, CLI schema, platform/toolchain floors,
architectures, and installer path.

**Rationale**: A commit hash identifies Git content; the independent archive digest also proves the
actual downloaded bytes. Archive-root/path validation prevents extraction outside private staging.
The installer then verifies native signatures, component identifiers, Team binding, CDHashes,
architecture, and version before atomic activation.

**Rejected alternatives**:

- cloning or downloading `main`, `latest`, or a branch archive;
- piping a remote shell script into `sh`;
- publishing an unsigned/ad-hoc prebuilt Runtime and removing quarantine with `xattr`;
- copying the Runtime implementation or build logic into the Skill repository.

## Decision 4 — Reuse local Apple Development signing, but do not market it as distribution trust

**Decision**: Source Preview requires one usable Apple Development identity on the local Mac. It is
selected by local certificate fingerprint; the effective Team identifier is derived from the actual
signed Mach-O rather than inferred from the certificate display name, then stored as public
verification metadata in the user's Runtime lock.

**Rationale**: Local signing gives the CLI, Broker, AskPass, and trusted-setup processes stable native
identities so current XPC peer verification works. It is not a public publisher identity, not
notarization, and not proof that downloaded binaries are safe. Documentation must preserve that
distinction.

## Decision 5 — Keep the verified-binary design for later

**Decision**: A future prebuilt macOS Runtime still requires Developer ID Application, Hardened
Runtime, secure timestamps, notarization, stapling, Gatekeeper validation, a universal arm64/x86_64
archive, immutable checksums, and a verified binary manifest.

**Rationale**: Apple documents Developer ID as the identity for software distributed outside the Mac
App Store. Apple also requires notarized software to use a valid Developer ID identity, Hardened
Runtime, a secure timestamp, and acceptable entitlements. Apple Development cannot substitute for
that public distribution identity.

**References**:

- [Developer ID certificates](https://developer.apple.com/help/account/certificates/create-developer-id-certificates)
- [Notarizing macOS software before distribution](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)
- [Creating distribution-signed code for macOS](https://developer.apple.com/documentation/xcode/creating-distribution-signed-code-for-the-mac)
- [TN3147: Migrating to notarytool](https://developer.apple.com/documentation/technotes/tn3147-migrating-to-the-latest-notarization-tool)

## Decision 6 — A team API key is only a later CI concern

**Decision**: If verified-binary CI is enabled later, prefer a protected team App Store Connect API
key. Individual API keys cannot use `notaryTool`. Source Preview stores no notary credentials and
needs no app-specific password.

**References**:

- [Creating API Keys for App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi/creating-api-keys-for-app-store-connect-api)
- [App Store Connect API access](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api)

## Decision 7 — skills.sh distributes only the Skill

**Decision**: Keep the skills.sh install copy-only. First use returns the explicit local source-build
action; the Agent never treats Skill installation as evidence that native code is present.

**Rationale**: This matches the actual installer behavior and keeps native credential authority in
the locally built Runtime.

## Decision 8 — Website is an experience layer, not release authority

**Decision**: Build GitHub Pages after Source Preview closure. The site may render canonical facts,
but manifests and repository contracts remain authoritative.

**Rationale**: The website should explain the developer prerequisite and future verified-binary
track clearly; it must never imply that Source Preview has Developer ID provenance.
