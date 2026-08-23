# Contract: Trusted `ssh-hosts` Migration V1

**Status**: Proposed post-RC design; not current CLI behavior and not a core-RC requirement

Migration is a trusted-local, non-destructive compatibility flow. An Agent never reads, uploads,
summarizes, or classifies the source Markdown.

## Public handoff

```text
safa resource migrate ssh-hosts
```

The Agent-facing CLI passes no source path, source contents, endpoint, account, credential locator,
or classification override. It launches the signed trusted-local helper, which obtains the user's
file selection and confirmation from its controlling terminal. If that cannot happen, the response
contains the exact command with `safe_for_agent: false`.

Agent-facing completion reports only status and safe counts:

```toon
schema: dev.safa.cli/v2
command: resource.migrate.ssh-hosts
status: completed
migration:
  outcome: committed
  safe_semantic_imported: 4
  relationships_imported: 1
  protected_fields_skipped: 6
  ambiguous_fields_skipped: 2
```

No candidate value, source line, path, endpoint, username, fingerprint, command, or credential-like
content appears on Agent stdout or stderr.

## Trusted-local classification

Only user-selected regular files are read. There is no recursive home-directory scan. The exact
versioned adapter applies deterministic section/column classification and safe-text scanning:

| Class | Treatment |
|---|---|
| `safe_semantic` | Confirmed display name, role, purpose, or caution may become trusted user guidance |
| `binding_candidate` | Old logical alias may be bound by user to an existing immutable Resource ID |
| `safe_relationship_candidate` | May commit only after both Resource IDs are bound and verified |
| `protected_access` | Value is excluded; only category count may continue to native enrollment |
| `stale_operational_claim` | Skipped by default; never becomes Runtime fact |
| `executable_content` | Always excluded |
| `secret_like` | Hard reject/quarantine from staging; never persisted |
| `ambiguous` | Unselected until the user edits or explicitly confirms safe semantic text |

Unknown headers fail closed as ambiguous. Code fences, shell/config snippets, URI userinfo,
credential locators, encoded key material, tunnel coordinates, endpoints, accounts, fingerprints,
live status, group membership, sudo claims, and version observations are never imported as Profile
facts or Notebook guidance.

## Preview and commit

The trusted preview shows destination, source class, and counts for write/exclude/edit decisions.
Protected classes show only category and count. Preview computes:

- source digest;
- adapter version;
- selected candidates;
- immutable Resource-ID bindings;
- proposed relationships;
- plan digest covering all of the above.

Commit requirements:

1. source digest still matches;
2. plan digest still matches the confirmed plan;
3. every destination Resource exists and is verified;
4. every relation target exists and passes topology validation;
5. all selected semantic values pass Broker safe-text policy again;
6. the user confirms the immutable plan locally; and
7. Notebook entries and relationships commit atomically with one migration transaction ID.

Multiple Resources either commit as the explicitly confirmed verified subset or remain pending. No
silent partial commit is allowed. Cancel and pre-commit failure produce zero durable semantic writes.
Repeating the same source digest, adapter version, selection, and bindings is a no-op.

## Rollback

Rollback is a separate trusted-local action against a committed migration transaction. It may:

- remove or supersede Notebook entries created by that transaction;
- remove relationship assertions created by that transaction; and
- restore prior Notebook states recorded by that transaction.

It never removes a Resource, credential, Runtime Profile fact, Timeline unrelated to migration, or
source file. A Resource enrolled separately during migration requires its own explicit lifecycle
operation.

## Source preservation

SAFA never deletes, moves, rewrites, or marks the source Markdown as authoritative. Migration remains
incomplete until resulting Resource bindings pass verification. All product fixtures use synthetic
files and values.

## Required tests

- every supported source column maps to one deterministic class;
- unknown headers, malicious Markdown, HTML, links, code fences, encoded key material, and
  credential-bearing URIs fail closed;
- cancel and source-change paths perform zero writes;
- alias reuse with another Resource ID never attaches old context;
- duplicate import is a no-op;
- missing relation target blocks commit;
- rollback changes only transaction-origin records;
- 100-run output/error/audit leakage corpus emits no protected candidate value.
