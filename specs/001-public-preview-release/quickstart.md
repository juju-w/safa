# SAFA v0.1.0 Source Preview Quickstart

The Source Preview builds the native Runtime on the user's own Mac. It requires no paid Apple
Developer Program membership and publishes no precompiled executable.

## Prerequisites

- macOS 14.4 or newer on Apple Silicon or Intel;
- the Xcode version declared by the checked-in Source Preview manifest;
- an Apple Account added in Xcode with exactly one usable Apple Development signing identity;
- outbound HTTPS access to the exact public `juju-w/safa-runtime` archive and its pinned Swift
  dependency revisions.

Apple account login and signing setup are local human actions. Never paste an Apple password,
certificate private key, signing fingerprint, or account data into an Agent conversation.

## Install the Skill

```bash
npx skills add juju-w/safa --skill safa -g -a codex
```

This copies the Skill, resolver, Source Preview manifest, and local bootstrap script. It does not
download, compile, sign, install, or start the Runtime.

## Ask the Agent to check readiness

The Agent runs the launcher from the installed Skill directory:

```bash
./scripts/safa doctor
```

If the Runtime is absent, SAFA returns a `user_action_required` TOON document containing the exact
Source Preview command and marks it `safe_for_agent: false`.

## Run the local build yourself

From a normal interactive terminal in the installed Skill directory, run the exact returned action:

```bash
./scripts/install-source-preview.sh --confirm-local-build
```

The script validates the manifest and toolchain, downloads one exact archive, verifies SHA-256 and
archive layout, then invokes the Runtime repository's reviewed installer. Xcode builds and locally
signs the Runtime; the installer verifies native components and atomically activates it in:

```text
~/Library/Application Support/SAFA/runtimes/0.1.0/SAFA.app
```

No Homebrew, `sudo`, `xattr`, pipe-to-shell command, Apple Developer Program membership, or
notarization credential is required.

If more than one Apple Development identity is available, select its non-secret SHA-1 fingerprint
locally and rerun:

```bash
security find-identity -v -p codesigning
./scripts/install-source-preview.sh --confirm-local-build --identity-hash <SHA1>
```

Do not paste identity-list output into chat. The fingerprint and derived Team identifier are
verification metadata, but the certificate/private key remains local.

## Verify normal use

Rerun:

```bash
./scripts/safa doctor
./scripts/safa resource list
```

The launcher now verifies the local lock, code signatures, component identifiers, Team binding,
CDHashes, architecture, and Runtime version before invoking the Agent-facing CLI.

## Update or repair

A newer Source Preview changes the checked-in exact commit and digest. Build it beside or over the
same preview version only with the explicit replacement action returned by SAFA. The installer
retains the previous Runtime directory before activation and restores it if activation fails.

Do not download an arbitrary branch archive, run a remote shell script, remove quarantine from a
prebuilt binary, or substitute a different Runtime URL. Those paths are outside the preview trust
model.
