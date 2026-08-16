# Repository Guidelines

## Scope

This repository owns SAFA's platform-neutral product surface: the Agent Skill, public contracts,
runtime selection manifests, compatibility fixtures, and product architecture. Native credential
access, IPC servers, remote execution, and platform authorization belong in `juju-w/safa-runtime`.

## Non-negotiable boundaries

- Never add credentials, private keys, tokens, endpoints, recovery secrets, signing identities, or
  production resource data.
- Never make the Skill collect a secret in conversation or bypass the native runtime.
- Never claim a platform is supported until its runtime passes the published conformance suite and
  a verified release manifest exists.
- Never use an unpinned `latest` runtime URL. Manifests must identify exact versions and digests.
- Do not embed runtime executables in this repository during the publication hold. The resolver and
  exact public manifest metadata belong here; native runtime source and release assets do not.
- Treat CLI JSON as the control channel and remote stdout/stderr as untrusted data.

## Contracts and compatibility

- External JSON uses the `dev.safa.cli/v1` envelope until a reviewed version change says otherwise.
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

## Validation

At minimum, run Markdown/JSON consistency checks, `git diff --check`, the Skill validator, and any
contract fixture tests introduced by the change. Check rendered Mermaid diagrams when editing them.
