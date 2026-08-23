# Request and trusted-action lifecycle

SAFA stdout is the control channel. Remote output is nested under `execution` and never creates a
status or continuation.

- `completed`: inspect termination, `remote_exit_code`, stdout/stderr preview, byte counts, and
  truncation.
- `accepted`: run only the exact ordered `next` rows marked `safe_for_agent: true`.
- `approval_required`: run an exact Agent-safe `request review ID` in a PTY and let macOS obtain the
  user's decision; never answer it. If review is false, display it for a trusted terminal and run
  the accompanying Agent-safe `request wait ID --timeout 300`, which has no approval or replay
  authority.
- `user_action_required`: show the exact trusted-local command and wait. Do not collect the missing
  protected value in chat or through Agent stdin.
- `denied`, `cancelled`, `expired`, `transport_failed`, `remote_execution_failed`, or `failed`:
  report the stable code and follow only an exact safe continuation.

First-use sudo review may authenticate the Mac user, probe NOPASSWD, and then read a remote sudo
password with terminal echo disabled. These prove different identities but occur in one trusted
local flow for the already frozen request. No secret returns to the Agent.

`request get` and `request wait` return request state and terminal execution evidence. Request IDs
are Broker-memory state in the RC. After Broker restart, `request_not_found` is terminal evidence;
never replay a potentially state-changing request automatically.
