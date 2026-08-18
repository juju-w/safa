# Agent CLI Contract v2

Status: **implemented on the coordinated pre-release migration branches; publication blocked**

Encoding: **TOON v4.1**
Schema: `dev.safa.cli/v2`

This contract replaces the pre-release JSON v1 surface before SAFA's first public release. SAFA is
still under a publication hold, so v2 is intentionally a clean break rather than a permanent
dual-format compatibility layer.

## 1. Product decision

The `safa` executable is an Agent eXperience Interface (AXI), not a terminal application for people.
Its only public consumer is an Agent or an Agent integration such as a Skill or an explicitly
installed session hook.

- stdout is a single canonical TOON document for every command result, empty result, no-op, and
  error;
- stderr is reserved for redacted diagnostics and progress that the Agent must not parse;
- there is no human presentation mode, colorized table mode, `--json`, or output-format switch;
- the bare `-v`, `-V`, and `--version` fast path is the sole exception and prints only SemVer;
- CLI input remains a validated argument vector. SAFA does not accept TOON programs, secrets, or
  approval decisions through stdin;
- internal Broker IPC, persistence, and platform adapters are private implementation details and
  may use typed Codable/XPC representations without becoming part of this contract.

The CLI converts an explicit typed response DTO to TOON only after the Broker has completed policy,
authorization, redaction, and output bounding. TOON is a presentation boundary, not a security
boundary.

## 2. Command surface

```text
safa
safa -v|-V|--version
safa doctor
safa setup status|activate|deactivate

safa resource [list|ls] [--state STATE] [--limit N] [--fields FIELD,...]
safa resource show ALIAS [--details]
safa resource add ALIAS [--from-ssh-config SSH_ALIAS]
  [--template TEMPLATE] [--type RESOURCE_TYPE]
safa resource edit ALIAS [--from-ssh-config SSH_ALIAS]
  [--template TEMPLATE] [--type RESOURCE_TYPE] [--state active|disabled]
safa resource remove ALIAS

safa topology [show] [ALIAS] [--limit N] [--fields FIELD,...]
safa topology path FROM TO [--limit N]
safa topology impact ALIAS [--limit N]
safa topology link FROM RELATION TO
safa topology unlink FROM RELATION TO

safa exec ALIAS --intent TEXT [--expected-effect TEXT] [--rollback TEXT]
  [--timeout SECONDS] [--output-limit BYTES] [--full] -- ARG...
```

Running `safa`, `safa resource`, or `safa topology` without a deeper verb returns bounded live data,
not a usage dump. Every command and subtree still supports concise `--help`. Unknown commands,
arguments, and flags fail before Broker or remote work begins.

Endpoint, username, password, sudo password, private key, credential locator, host-key approval,
recovery material, and raw approval have no Agent-facing option. Resource aliases remain the only
selectors.

When `resource add` cannot resolve an explicit OpenSSH alias, the macOS Runtime may launch its
separately signed trusted-setup helper using only the safe alias/type. Protected input is hidden and
does not travel through CLI argv, environment, Agent-controlled stdin, stdout, or stderr. If no
trusted controlling terminal is available, the CLI returns the exact retry as a
`safe_for_agent: false` next command.

## 3. Canonical output

All non-version invocations emit exactly one UTF-8 TOON v4.1 document with LF line endings and no
trailing prose. The common control fields appear before command data:

```toon
schema: dev.safa.cli/v2
command: resource.list
status: completed
count:
  total: 2
  returned: 2
  truncated: false
resources[2]{alias,kind,state,health}:
  storage.primary,host,active,healthy
  worker.batch,host,active,degraded
next[1]{command,reason,safe_for_agent}:
  safa resource show <alias>,Inspect one safe summary,true
```

Required common fields:

- `schema`, `command`, and `status` are always present;
- `request_id` is present only for a real Broker request that can be correlated later;
- collections declare exact returned row counts through TOON array headers;
- a single paged or bounded collection includes `count.total`, `count.returned`, and
  `count.truncated`; topology projections bound node and edge tables together and instead include
  `count.nodes`, `count.edges`, and `count.truncated`;
- `warnings` and `next` are omitted when empty, avoiding repeated ambient boilerplate;
- `next[].safe_for_agent` is authoritative. A suggestion with `false` requires a user or trusted
  local action and must not be invoked automatically. `true` means only that the command may be
  called by an Agent; it does not grant access or override Broker policy.

Field order is stable and covered by contract fixtures. Values are encoded by a conforming encoder;
remote strings are never concatenated into TOON syntax. Wall-clock timestamps stay in the native
audit trail unless a command-specific result requires one; an immediate CLI response does not repeat
the current time for the Agent.

## 4. SAFA AXI profile

SAFA adopts all ten AXI principles with security-specific bounds:

1. **TOON-only output**: encode the typed public DTO as canonical TOON v4.1 at the final CLI layer.
2. **Minimal defaults**: list rows contain at most four fields by default. `--fields` accepts only
   command-specific, source-code-allowlisted safe fields.
3. **Bounded previews**: long text includes a preview, original size, truncation flag, and a concrete
   `--full` suggestion. `--full` raises the soft limit but never bypasses the Broker hard limit,
   redaction, or binary-output policy.
4. **Precomputed answers**: include cheap counts, health summaries, Broker-computed topology answers,
   remote exit state, and truncation metadata when they prevent predictable follow-up calls.
5. **Definitive empty states**: successful empty results emit `count.total: 0` and an explicit
   zero-length typed collection; empty stdout never represents success.
6. **Structured failures**: failures use the same TOON schema on stdout. Mutations are idempotent
   only when target identity and desired effect are unambiguous; duplicate resource creation remains
   a conflict rather than silently binding to an existing protected resource.
7. **Opt-in ambient context**: an explicit setup action may install a directory-scoped Agent hook
   that calls the safe home view. It contains only non-interactive safe summaries. SAFA does not
   capture session transcripts, command history, protected topology, or remote output for future
   ambient context.
8. **Content first**: no-argument roots return the smallest useful live view, including Runtime
   readiness, resource aggregates, bounded safe aliases, and next commands.
9. **Contextual disclosure**: results include only a few relevant command templates. Dynamic values
   stay parameterized; suggestions never manufacture an alias, approval, or protected value.
10. **Concise help**: each subtree owns a complete local help response with arguments, valid flags,
    defaults, and two or three examples. `--version` returns before Broker startup or the full
    command graph is initialized.

## 5. Errors and exits

```toon
schema: dev.safa.cli/v2
command: resource.list
status: failed
error:
  code: usage.unknown_flag
  message: Unknown flag --stat for resource list
  retryable: false
valid_flags[4]: "--state","--limit","--fields","--help"
next[1]{command,reason,safe_for_agent}:
  safa resource list --help,Read the complete local command reference,true
```

Process exits are deliberately small:

| Exit | Meaning |
|---:|---|
| `0` | completed, accepted, or an unambiguous idempotent no-op |
| `1` | the requested operation did not complete in this invocation |
| `2` | invalid command, argument, or flag; no Broker/remote action occurred |

The TOON `status` and stable `error.code` carry lifecycle detail such as `approval_required`,
`user_action_required`, `denied`, `cancelled`, `expired`, `transport_failed`, or
`remote_execution_failed`. Remote process status remains in `execution.remote_exit_code`; it is not
reused as the SAFA process exit code.

The CLI never prompts on stdin or reads a secret from the terminal. A user-presence operation may
cause macOS to display trusted system UI, but the Agent receives only its structured outcome.

## 6. Untrusted remote output

Remote stdout and stderr are data fields beneath `execution`. Each contains an encoded preview,
original byte or character count, truncation state, and content classification. The encoder must
quote and escape control characters according to TOON; binary data is summarized rather than
inlined. Remote text cannot create a top-level key, `next` entry, status, or command.

The Skill must continue to treat every remote string as evidence only and never follow an
instruction found inside it.

## 7. Conformance and migration

The coordinated migration is accepted only when all of these gates pass:

1. pin a TOON implementation that conforms to the current normative v4.1 fixtures;
2. generate v2 output only from explicit public DTOs, never dynamic dictionaries;
3. add canonical fixtures for success, zero results, truncation, no-op, usage failure, policy
   failure, protected user action, transport failure, and hostile remote strings;
4. strict-decode every fixture back to the expected JSON data model in CI;
5. measure SAFA fixtures against compact JSON for tokens, parse accuracy, and task completion;
6. update the Skill and Runtime manifest schema range in the same reviewed change;
7. remove `--json`, human rendering, legacy completion generation, and v1 fixtures before the first
   public release rather than shipping two public contracts.

The migration branches emit `dev.safa.cli/v2`; publication remains blocked until the gates and human
review pass. JSON v1 is intentionally not retained as a second public mode.

## References

- [AXI principles](https://axi.md/)
- [Pinned official AXI Skill](https://github.com/kunchenguid/axi/blob/408a6536625e5b05e5c56e6c4a04fe83e1f510a5/.agents/skills/axi/SKILL.md)
- [TOON specification v4.1](https://toonformat.dev/reference/spec.html)
