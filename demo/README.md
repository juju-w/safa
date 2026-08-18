# SAFA Live Demo

A **real** SAFA session, captured and replayed — not a scripted mock. On 2026-08-19 the
checked-in demo ran against a signed local Runtime (0.1.0) and a real registered
resource, following the exact workflow the Skill teaches: doctor → discover → safe
summary → topology → bounded read-only diagnostics → boundary refusals.

| File | Purpose |
|---|---|
| [live-demo.md](live-demo.md) | Full narrative: the Agent's reasoning at every step, the exact command, the real TOON evidence, and the interpretation. |
| [replay-live-demo.sh](replay-live-demo.sh) | Replay the same 13 steps on your own machine against your own registered resources. |
| [output/](output/) | Real TOON archives generated locally by the replay script (git-ignored; never commit machine-specific output). |

The public website renders the same session (sanitized) at
[juju-w.github.io/safa/live-demo/](https://juju-w.github.io/safa/live-demo/).

## What the demo shows

- Real resource discovery: only safe aliases, no IP/username/key.
- Real topology answers: placement, and the discipline of *not* inventing a route.
- Real allow-listed diagnostics: df, uptime, free, ps, systemctl is-active.
- A genuine finding: swap 95% used while RAM had headroom (historical memory spike,
  unreclaimed pages) — plus an honest contradiction: systemd reports inactive for
  services that are actually running under the vendor stack/containers.
- Real boundary refusals: sudo, off-allowlist commands, and unregistered resources
  are all rejected with stable TOON errors.

## Replay it yourself

```sh
# 1. Make sure the signed SAFA Runtime is installed and a resource is reachable.
# 2. Point the replay at one of YOUR aliases (the checked-in default is sanitized):
SAFA_DEMO_TARGET=my-nas ./demo/replay-live-demo.sh --record demo/output

# summary only:
./demo/replay-live-demo.sh --summary
```

## Sanitization

Everything in this directory and in the website data is sanitized: hostnames, aliases,
and process names are replaced with placeholders (nas.primary, download-client,
nas-app-*, …). Measurements are verbatim. Machine-specific replay output written to
[output/](output/) must be reviewed before it is ever committed or published.
