# Execution and privilege

Use one `exec` for one logical task. Keep requests separate when later commands depend on earlier
output, privilege differs, or the user needs separate results and audit records. A fixed sequence
known completely in advance may use an explicit interpreter such as
`sh -c 'check_one && check_two'`; it is high risk, has one combined result, and must never contain
remote or otherwise untrusted text. Bare `&&` is data unless an interpreter evaluates it.

The complete public form is:

```text
./scripts/safa exec ALIAS --intent TEXT [--expected-effect TEXT] [--rollback TEXT]
  [--privilege user|sudo|auto] [--timeout SECONDS] [--output-limit BYTES] [--full] -- ARG...
```

Omission remains `user` for contract compatibility. The main Skill uses explicit `auto` for ordinary
SSH Tasks so privilege is not an Agent judgment; explicit `user` and explicit `sudo` are advanced or
compatibility controls. For a listed command class, the Broker runs a fixed bounded read-only
account probe through the pinned SSH route, classifies the full argument vector, and resolves to
effective `user` or `sudo` before policy evaluation. Stored resource observations are display hints,
not authority for a later execution. Unsupported, missing, failed, timed-out, contradictory, shell,
or near-match evidence never selects sudo. Remote output, timeout, cancellation, and exit status
from the requested command never cause a privileged retry.

Current auto-sudo classes are bounded Docker metadata reads and exact three-argument systemctl
`start|stop|restart|reload UNIT` operations. Root remains direct. A freshly Docker-authorized
account remains direct. A sudo result always enters the same immutable trusted approval workflow as
explicit `sudo`.

HTTP resources accept only semantic `curl` or `curl --head`. The Broker chooses the registered
endpoint and optional token and invokes its verified native HTTP client. Stable local-adapter
failures include `capability_not_supported`, `client_not_installed`, `client_unavailable`,
`local_command_not_allowed`, `resource_endpoint_invalid`, `credential_transport_insecure`,
`privilege_not_supported`, and `resource_not_ready`. Follow only the exact returned remediation.
