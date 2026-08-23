# Contract: Agent Resource Card Projection

**Status**: Proposed post-RC design; not part of the current selected `dev.safa.cli/v2` contract

**Proposed schema target**: additive `dev.safa.cli/v2`, subject to `PRODUCT.md` admission and
compatibility review

**Owner**: `juju-w/safa`

## Compatibility decision

Resource Card reuses `resource list` and `resource show`; it does not introduce `card` or `context`
commands and does not change `safa exec`.

- The default no-argument home and default `resource list` rows remain
  `{alias,kind,state,health}` in the same field order.
- `resource list --fields` gains allowlisted `card_name` and `role`.
- `resource list` gains `--scope workspace`, which filters by an explicit current-directory binding.
- Default `resource show ALIAS` keeps all existing fields and may append one optional `card` object.
- Existing protected `resource show --details` semantics do not change.
- `display_name` does not imply `card_name`; an authorized legacy display name remains suppressed
  until trusted-local confirmation.

An older Runtime that does not understand a new field or flag returns its ordinary structured usage
error. The coordinated Skill/Runtime manifest must not guess alternate commands or downgrade output.

## Workspace card list

```text
safa resource list --scope workspace --fields alias,card_name,role,health
```

The CLI derives the current working directory locally and sends it only to the Broker's typed scope
resolver. The Broker matches encrypted `WorkspaceResourceBinding` records and returns current safe
projections. A caller-selected path cannot grant authority or reveal protected resource fields.

Canonical shape:

```toon
schema: dev.safa.cli/v2
command: resource.list
status: completed
scope: workspace
count:
  total: 1
  returned: 1
  truncated: false
resources[1]{alias,card_name,role,health}:
  storage.synthetic,Home storage,Backups and media,healthy
```

Rules:

- at most eight returned rows;
- exactly four requested scalar columns in requested allowlist order;
- deterministic sort by canonical alias;
- 2 KiB hard encoded TOON limit and 512-token regression gate;
- `count.total`, `count.returned`, and `count.truncated` are mandatory;
- empty scope returns a successful zero-length `resources` collection;
- truncation includes one Agent-safe continuation that preserves `--scope workspace` and requests a
  bounded detail/disambiguation action;
- no summary body, caution body, Timeline, capabilities, or relationships in this projection;
- no remote probe, approval, or user-presence operation during session start.

`card_name` is at most 80 normalized Unicode scalar values. `role` is at most 120. Missing values are
encoded according to the existing resource-list null/empty-field rule fixed by canonical fixtures;
the Runtime never substitutes authorized `display_name`.

## Detailed card

```text
safa resource show storage.synthetic
```

The existing safe `resource` object remains the top-level data object. The optional `card` field is
appended after existing summary fields:

```toon
schema: dev.safa.cli/v2
command: resource.show
status: completed
resource:
  alias: storage.synthetic
  resource_type: host.linux
  kind: host
  state: active
  health: healthy
  card:
    card_name: Home storage
    role: Backups and media
    summary:
      source: agent_summary
      preview: Storage is healthy after the latest bounded check.
      truncated: false
    guidance_count:
      total: 1
      returned: 1
      truncated: false
    guidance[1]{source,kind,preview,truncated}:
      user_guidance,caution,Avoid maintenance during backup windows,false
    change_count:
      total: 1
      returned: 1
      truncated: false
    recent_changes[1]{task_class,terminal_state,time_signal}:
      storage.read,completed,recent
    relationship_count:
      total: 1
      returned: 1
      truncated: false
    relationships[1]{kind,target_alias}:
      hosted-on,host.synthetic
```

The final fixture determines the complete existing Resource field set and exact field order; this
example omits unchanged fields only for readability.

Detailed-card limits:

- 6 KiB encoded TOON and 1,200-token regression gate;
- one summary preview of at most 500 characters;
- three guidance previews of at most 240 characters each;
- three recent Timeline events;
- six safe logical relationships;
- eight effective capabilities;
- exact totals and truncation for every bounded collection.

Default detail is a curated safe projection, not arbitrary Notebook pagination. It has no `--full`
escape hatch in P0. Complete Activity and Guidance belong to the trusted-local view. A self-contained
successful detail response omits `next`.

## Source and control rules

- Runtime facts determine state, health, capability, route, privilege, and authorization.
- `user_guidance`, `agent_observation`, `agent_summary`, and Timeline sources remain explicit.
- Card strings are nested data. The encoder must quote content resembling TOON fields, commands,
  Markdown instructions, terminal controls, or `next` rows.
- Notebook text cannot create top-level `status`, `error`, `request_id`, `execution`, or `next`.
- Conflicts are bounded card data; they never replace the Runtime fact or become policy.
- Resource Card is not accepted as an execution selector other than its canonical safe alias.

## Required fixtures

- existing `resource.show` baseline without card additions;
- workspace card list completed, empty, and truncated;
- detailed card completed;
- conflicting Runtime fact/user guidance/Agent observation;
- hostile control-like Notebook content;
- disabled resource;
- unapproved legacy display name.

Every JSON/TOON pair must strict-decode, canonical re-encode, preserve field order, and pass byte
budgets.
