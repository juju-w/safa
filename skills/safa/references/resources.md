# Resource setup and lifecycle

Use `resource list` only when an exact alias is not already known. Default `resource show ALIAS` is
a safe summary; `--details` is a protected read requiring macOS user presence and still never
returns credentials or credential locators.

Register or resume resources only on explicit user request:

```text
./scripts/safa resource add ALIAS --from-ssh-config SSH_ALIAS
./scripts/safa resource add ALIAS --type host.linux
./scripts/safa resource add ALIAS --template http
./scripts/safa resource edit ALIAS --from-ssh-config SSH_ALIAS
```

Aliases are logical names, not endpoints. SSH import uses existing OpenSSH identity and trusted
host-key material. New SSH and HTTP setup use a separately signed trusted helper that obtains
protected fields from a local terminal with echo disabled. Show a returned `safe_for_agent: false`
retry exactly and do not run it. Database, object-store, cache, messaging, graph, and search
templates remain operation-inert until their returned capabilities include `exec`.

Use `resource edit ALIAS --state disabled|active` and `resource remove ALIAS` only for explicit
mutations. Do not repeat a denied system authorization prompt.

`resource sudo ALIAS --status` is a safe read. Enrollment, `--passwordless`, and `--remove` are
trusted-local lifecycle actions: show them to the user but never execute them as the Agent. Normal
privileged work does not require pre-enrollment; submit `exec --privilege auto` and let first-use
review handle NOPASSWD or hidden password enrollment for the immutable task.
