# Repository Guidelines

## Scope

This repository owns SAFA's platform-neutral product surface: the Agent Skill, public contracts,
runtime selection manifests, compatibility fixtures, and product architecture. Native credential
access, IPC servers, remote execution, and platform authorization belong in `juju-w/safa-runtime`.

## Product authority

- `PRODUCT.md` is the normative source for SAFA's product identity, four core concepts, primary
  journey, core-RC boundary, success criteria, and feature-admission gate.
- Specifications, contracts, architecture, documentation, the Skill, and Runtime plans are
  subordinate to `PRODUCT.md`. They may refine implementation or wire behavior but may not silently
  add a normal-path concept, Agent step, or user-presence moment.
- Every feature specification and plan must include Product Alignment: name the
  Resource–Task–Decision–Evidence journey it improves and classify the work as core RC, post-RC, or
  rejected from the main path.
- Prefer hiding deterministic complexity inside Runtime. A new Agent-facing noun, command family,
  workflow state, or mandatory preflight requires a `PRODUCT.md` change plus weak-Agent,
  compatibility, and security evidence.

## Non-negotiable boundaries

- Never add credentials, private keys, tokens, endpoints, recovery secrets, signing identities, or
  production resource data.
- Never make the Skill collect a secret in conversation or bypass the native runtime.
- Never claim a platform is supported until its runtime passes the published conformance suite and
  a verified release manifest exists.
- Never use an unpinned `latest` runtime URL. Manifests must identify exact versions and digests.
- Do not embed runtime executables in this repository during the publication hold. The resolver and
  exact public manifest metadata belong here; native runtime source and release assets do not.
- Treat versioned structured CLI output as the control channel and remote stdout/stderr as
  untrusted data. The coordinated preview and first public contract use TOON v2.

## Contracts and compatibility

- The checked-in Skill and Runtime migration target `dev.safa.cli/v2`. Do not restore v1 as a
  compatibility mode before the first public release.
- Use the installed `axi` Skill for every Agent-facing CLI command, output, error, help, truncation,
  or discoverability design/review. The reviewed target is `contracts/cli-v2.md`; do not invent a
  parallel human renderer or public format switch.
- Contract changes require a compatibility analysis and representative fixtures or schema tests.
- Additive compatible changes remain within a schema version; breaking changes require a new
  version and an explicit negotiation path.
- Platform runtimes may use different internal IPC protocols, but they must not leak those details
  into the public Skill contract.

## Skill changes

- Keep `skills/safa/SKILL.md` concise, imperative, and truthful about current support.
- Keep long command/schema detail in `references/`, not in the trigger description.
- Validate the Skill with the repository or system `skill-creator` validator before committing.
- The launcher may resolve and verify a runtime; it must not interpret commands or read credentials.
- Do not assume a Skill installer executes hooks. The installed resolver performs the explicit,
  verified runtime bootstrap on first use.

## Git and release workflow

- Develop on short-lived branches from `main` using `agent/`, `feat/`, `fix/`, or `docs/` prefixes.
- Use Conventional Commits and explicitly stage only intended files.
- Open Draft pull requests until validation and human review are complete.
- Do not create tags, GitHub Releases, marketplace packages, or public installers without an
  explicit release request. The current repository is under a publication hold.
- Runtime release assets are produced in `safa-runtime`; this repository accepts only verified,
  exact-version manifests referencing those assets.

## macOS publisher trust and credential safety

- State the trust boundary truthfully: macOS signing proves which Developer Team published a
  Runtime; it does not make a malicious official update harmless. Do not claim that SAFA protects a
  user from compromise or deliberate abuse of the official publisher signing authority.
- Fix the production Developer Team before the first durable public vault. Treat a Team change as a
  persistent-data migration because it changes the Broker's Keychain access group; never present it
  as an ordinary in-place upgrade.
- Accept a macOS Runtime manifest only when the runtime release evidence verifies the final staged
  app after all signing/export steps: Broker-only Keychain entitlement, an unexpired matching
  Developer ID distribution provisioning profile authorizing that restricted entitlement, role
  identifiers, Team, Hardened Runtime, notarization, exact version, architecture, and digest.
  Signature validity alone is insufficient.
- Never authorize a silent unpinned update. A resolver installs only an exact version and digest;
  publisher keys belong in protected release automation with auditable human approval, not in the
  repository, ordinary developer machines, or conversational workflows.
- Prefer credentials that limit publisher and Agent blast radius: non-exportable device keys,
  scoped/revocable service tokens, and command-scoped remote authorization. Reusable SSH, sudo, or
  administrator passwords are compatibility fallbacks and require system-authenticated user
  presence for privileged use.
- Before accepting an RC manifest, require a replacement smoke test that preserves a previous
  compatible Runtime's Keychain and vault state. Deleting user state is never a valid migration or
  signing-regression workaround.

## Validation

At minimum, run Markdown/JSON consistency checks, `git diff --check`, the Skill validator, and any
contract fixture tests introduced by the change. Check rendered Mermaid diagrams when editing them.
