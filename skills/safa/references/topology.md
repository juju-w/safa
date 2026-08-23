# Topology operations

Use Broker-computed topology instead of asking for network coordinates:

```text
./scripts/safa topology show [ALIAS] --limit 64
./scripts/safa topology path FROM TO --limit 64
./scripts/safa topology impact ALIAS --limit 64
```

Read `answer.outcome` first. `confirmed` means the Broker found a fresh verified directed path.
`not-found` is bounded negative evidence; `indeterminate` means limits prevented a conclusion.
Never infer reachability from visual proximity, Mermaid, Agent assertions, or remote output.

Use `topology link` or `unlink` only when the user explicitly asks to change a logical
relationship. These are desired/asserted claims, not verified connectivity. Context aliases may use
only semantic `site.NAME`, `domain.NAME`, `network.NAME`, `runtime.NAME`, or `route.NAME` forms;
never encode an IP, CIDR, endpoint, account, database, or bucket in them.
