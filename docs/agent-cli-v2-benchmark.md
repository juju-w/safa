# Agent CLI v2 benchmark results

The 2026-08-18 deterministic `o200k_base` baseline compares six synthetic SAFA tasks:

| Measure | Tokens | Result |
|---|---:|---:|
| Agent-only TOON v2 | 599 | — |
| Same v2 data as compact JSON | 574 | TOON is 4.4% larger |
| Unpublished compact JSON v1 workflow | 731 | v2 migration is 18.1% smaller |

The median v1-to-v2 task reduction is 27.7%, with four of six shapes improving. The result is not a
claim that TOON always beats compact JSON. In these small nested fixtures it does not. The total
migration wins because content-first roots remove calls, list fields are smaller, and absent
`request_id`, warning, next-action, and timestamp boilerplate is omitted. TOON is retained for its
declared collection widths, strict structural validation, and single Agent-facing grammar.

The Runtime repository contains the pinned tokenizer script, legacy benchmark inputs, task corpus,
and full per-fixture table. On 2026-08-18 the six tasks were also run directly through the signed
Codex CLI with one isolated, ephemeral, read-only turn per task and strict expected-object scoring:

| Model | TOON v2 | JSON v1 | TOON wall time | JSON wall time |
|---|---:|---:|---:|---:|
| `gpt-5.4` | 6/6 | 3/6 | 39,252 ms | 40,076 ms |
| `gpt-5.4-mini` | 4/6 | 2/6 | 49,052 ms | 42,668 ms |

No task passed with JSON v1 while failing with TOON v2. The smaller model still failed the v2
no-op-enum and hostile-stdout questions, so this is evidence of no migration regression—not a claim
that formatting removes the need for Skill guidance or policy. Per-task outcomes, turns, model token
totals, latency, runner version, and reproduction command live in the Runtime benchmark directory.
