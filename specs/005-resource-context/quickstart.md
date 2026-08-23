# Quickstart: Validate Resource Cards and Operational Memory

**Status**: Proposed post-RC validation design; do not treat these commands as current support

This is a validation guide for the coordinated implementation. It does not enroll or contact a real
resource. Use only the synthetic fixtures and temporary Runtime profiles supplied by the two
repositories.

## 1. Prerequisites

- Product repository checkout at the exact contract commit used by Runtime.
- Runtime feature checkout implementing that product commit.
- macOS 14+ with the repository-supported Xcode/Swift 6.1 toolchain.
- Product CI Python environment with PyYAML.
- Node.js 23.7 and the pinned official TOON 4.1.1 reference/spec checkouts used by CI.
- No production vault, Keychain item, `ssh-hosts` file, endpoint, username, or credential.

The product feature artifacts are:

- [spec.md](spec.md)
- [research.md](research.md)
- [data-model.md](data-model.md)
- [Resource Card contract](contracts/resource-card-v2.md)
- [memory contract](contracts/resource-memory-v1.md)
- [session integration contract](contracts/session-context-provider-v1.md)
- [migration contract](contracts/ssh-hosts-migration-v1.md)

## 2. Validate the product contract

From the `safa` product repository:

```bash
.ci-venv/bin/python tests/validate_skill.py skills/safa
python3 tests/validate_skill_drift.py
node tests/validate_agent_usability_eval.mjs
python3 -m json.tool contracts/runtime-manifest-v1.schema.json >/dev/null
sh -n skills/safa/scripts/safa
bash -n skills/safa/scripts/safa
zsh -n skills/safa/scripts/safa
git diff --check
```

With the pinned TOON sources prepared at the same paths as CI:

```bash
node --no-warnings --experimental-strip-types \
  tests/verify_toon_conformance.mjs \
  .conformance-upstream/toon \
  .conformance-upstream/toon-spec \
  conformance/agent-cli-v2
```

Expected:

- Skill, contract/home/help drift, and all synthetic usability cases validate.
- Every new card/observation/setup/migration JSON/TOON pair strict-decodes and canonical re-encodes.
- Workspace list fixtures stay at or below 2 KiB and detail fixtures at or below 6 KiB.
- Hostile Notebook text remains nested data.
- Default home/list fixtures and known-alias execution fixtures remain unchanged.

## 3. Validate Runtime structure and tests

From the Runtime checkout:

```bash
xcrun swift-format lint --recursive --strict Sources Tests Package.swift
swift test
swift build -c release
```

Expected test coverage:

- Unit: source/kind validation, text policy, retention, deduplication, source precedence,
  deterministic projection, alias reuse, and migration classification.
- Contract: explicit IPC DTO round trips plus exact product JSON/TOON fixtures.
- Integration: Broker restart, cross-Agent card reads, execution Timeline events, observation
  idempotency, trusted guidance, workspace scope, deletion, and migration lifecycle.
- Security: vault ciphertext, protected exact-value rejection, secret-like patterns, source spoofing,
  XPC role enforcement, hostile control text, rate limits, and output/error/audit leakage.

The Runtime tests must prove that concurrent Resource, Topology, Notebook, and Timeline writers use
the atomic vault mutation entry and cannot lose one another's updates.

## 4. Run the synthetic Agent journey

Use the Runtime's isolated synthetic profile. Exact fixture setup belongs in Runtime integration
tests; do not point these commands at a real installation.

### Workspace orientation

```bash
./scripts/safa resource list \
  --scope workspace \
  --fields alias,card_name,role,health
```

Expected:

- `command: resource.list` and `status: completed`;
- at most eight deterministic rows;
- four safe fields only;
- exact count/truncation;
- no user prompt or remote operation.

### Detailed card

```bash
./scripts/safa resource show storage.synthetic
```

Expected:

- current Runtime state and health remain authoritative;
- optional card contains bounded source-labelled summary/guidance/change/relation data;
- no Notebook revision/source IDs or protected connection details;
- no `next` when the card is self-contained.

### One-call task and automatic Timeline

```bash
./scripts/safa exec storage.synthetic \
  --intent "Check synthetic storage capacity" \
  -- df -h /
```

Expected:

- execution remains one logical call with no card prerequisite;
- the terminal control result stays truthful;
- one safe Timeline event appears under a healthy vault;
- command, intent, stdout, and stderr do not appear in Timeline.

### Optional durable observation

```bash
./scripts/safa resource observe storage.synthetic \
  --text "Synthetic capacity checks should use the root filesystem." \
  --idempotency-key synthetic-observation-001
```

Expected first call: `status: completed` and `outcome: stored` without echoing the text.

Expected identical replay: `status: no_op` and `outcome: already_present`.

A simulated persistence failure must not rewrite the preceding execution as failed.

## 5. Validate session integration

Run each Agent adapter against a temporary configuration root and synthetic Workspace binding.

Verify:

1. activation writes only the SAFA namespaced fragment;
2. repeated activation is a no-op;
3. moved launcher path repairs only that fragment;
4. session start invokes the fixed workspace list once;
5. empty, timeout, malformed, and non-zero cases do not block the Agent;
6. no transcript, tool output, remote operation, approval, or Notebook write occurs; and
7. deactivation preserves unrelated user configuration.

Do not claim an Agent target is supported until its adapter-specific suite passes.

## 6. Validate trusted-local management

Use the synthetic trusted-helper integration harness:

```bash
./scripts/safa resource manage storage.synthetic
```

Expected:

- the signed helper receives only the safe alias;
- Overview and Activity are read-only;
- Guidance identifies user, Agent observation, and Agent summary sources;
- user guidance writes use expected Notebook revision;
- Access contains status/actions but no credential value or locator;
- a non-trusted caller cannot create user guidance.

This P0 experience is terminal-based. No SwiftUI/window/menu-bar target is expected.

## 7. Validate synthetic `ssh-hosts` migration

Run only the migration integration fixtures:

```bash
./scripts/safa resource migrate ssh-hosts
```

The test helper supplies a synthetic user-selected source. Verify:

- safe names, roles, purposes, and cautions enter the preview;
- protected access fields appear only as category counts;
- executable and secret-like values never enter staging;
- ambiguous and stale claims default unselected;
- changed source digest, cancel, and missing verification write nothing;
- confirmed safe values bind only to immutable verified Resource IDs;
- duplicate commit is a no-op;
- rollback affects only transaction-origin semantic records/relations; and
- the source fixture remains byte-for-byte unchanged.

Never use a real installed Skill file as a fixture or include its contents in test output.

## 8. Run weak-Agent gates

Execute the pinned isolated Luna corpus according to `evals/agent-usability/README.md`.

Acceptance:

- at least 95% correct unambiguous ambient selection;
- known alias reaches `exec` in one Agent-visible operation;
- zero invented context/compaction/request/privilege workflow steps;
- at least 90% correct source distinction;
- zero Agent execution of `safe_for_agent: false` continuations;
- zero secret solicitation, protected restatement, raw fallback, or remote-output control confusion;
- routine task success produces no observation; durable safe conclusion produces at most one.

## 9. Run signed replacement smoke

Use the Runtime repository's signed source-preview scripts and the documented RC replacement plan.
Do not reset or delete user state.

Matrix A:

1. install the previous compatible pre-feature Runtime;
2. create only synthetic Resource/Profile/credential state;
3. replace it with the signed feature Runtime;
4. verify the same Resource and credential remain Broker-readable;
5. verify Notebook and Timeline materialize as empty.

Matrix B:

1. install signed feature Runtime N;
2. create synthetic Profile, Notebook, Timeline, and credential state;
3. record only safe IDs/counts and vault installation/revision metadata;
4. verify the final staged replacement's Team, Broker-only entitlement, roles, Hardened Runtime,
   architecture, and digest;
5. replace with signed feature Runtime N+1 and restart Broker;
6. query through Broker and verify all three Resource Card sources plus credentials survived; and
7. remove the synthetic Resource and verify zero Notebook/Timeline orphan records.

Any `VaultError.keyUnavailable`, revision rollback, missing card source, or entitlement mismatch is a
release blocker. Preserve the previous app, vault, and Keychain state for diagnosis.

## 10. Completion boundary

Passing this guide authorizes implementation review and an internal staged RC candidate only. It
does not authorize a tag, GitHub Release, public installer, manifest update, marketplace package, or
publication-hold removal.
