# Contract: Session Context Provider V1

**Status**: Proposed post-RC design; not current CLI behavior and not a core-RC requirement

`SessionContextProviderV1` is the platform-neutral behavior shared by Codex, Claude Code, and
OpenCode adapters. Agent-vendor configuration files are integration implementation details, not the
SAFA CLI schema.

## Lifecycle

The provider has exactly one data-producing lifecycle event in P0:

```text
session-start(current-working-directory)
  -> safe workspace resource-list TOON
```

It does not subscribe to prompt, tool, shell, file, transcript, stop, or session-end events. It does
not cache remote output or create Notebook content.

## Explicit setup

Public setup vocabulary:

```text
safa setup context status
safa setup context activate
safa setup context deactivate
```

`status` is a safe non-interactive read. `activate` and `deactivate` are trusted-local launch-only
operations and accept no resource endpoint, credential, hook body, or arbitrary configuration path
from Agent argv. The helper lets the user choose:

- supported Agent targets whose adapter conformance has passed;
- one workspace scope and whether descendants inherit it;
- registered safe aliases, which Broker resolves to immutable Resource IDs.

Activation stores an encrypted `WorkspaceResourceBinding`, installs only a namespaced adapter
fragment, and records the expected configuration digest. Repeating the same activation is a silent
no-op. Repair replaces only a SAFA-owned fragment whose identity is known. Deactivation removes only
a digest-matching SAFA fragment and disables the binding; it never rewrites the complete user
configuration.

If setup cannot run in the current process context, output is `user_action_required` with one exact
trusted command and `safe_for_agent: false`.

## Session-start behavior

The adapter:

1. obtains the current working directory from the Agent lifecycle API;
2. invokes the PATH-verified SAFA launcher, falling back to its configured absolute verified path;
3. requests `resource list --scope workspace --fields alias,card_name,role,health`;
4. accepts only one canonical `dev.safa.cli/v2` TOON document;
5. injects it as planning context explicitly labelled non-authoritative; and
6. terminates without any remote, approval, Notebook-write, or transcript operation.

The provider returns at most eight rows, 2 KiB, and the pinned reference-token budget. A timeout,
missing Runtime, locked vault, malformed output, non-zero exit, or unsupported adapter soft-fails and
does not block the Agent session. Where the Agent API permits a deterministic empty context, use it;
otherwise inject nothing and leave explicit Skill discovery available.

## Scope and disclosure

- Relevance comes only from active WorkspaceResourceBindings.
- Current and descendant directory matching follows the binding's explicit rule.
- Plaintext workspace paths are not persisted in the encrypted vault; Broker stores a keyed scope
  digest.
- The adapter cannot request arbitrary fields or protected details.
- A missing/deleted Resource ID is omitted and reflected in safe aggregate state.
- No endpoint, username, fingerprint, topology coordinate, credential state, Notebook source ID, or
  Timeline detail enters session-start context.

## Adapter conformance

Each Agent adapter independently proves:

- explicit install, idempotent repeat, path repair, and safe deactivate;
- exactly one session-start invocation;
- directory and descendant scoping;
- definitive empty, bounded success, and truncation;
- timeout and non-zero soft failure;
- no remote request, approval, user-presence prompt, transcript read, or Notebook write;
- namespaced config merge without overwriting unrelated user content;
- static Skill guidance and invoked command remain in drift validation.

An adapter that has not passed these tests is reported as unsupported even when another adapter has
passed.
