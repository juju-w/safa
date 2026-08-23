# Agent usability evaluation

This corpus tests whether an Agent can choose the smallest safe SAFA action from the candidate
Skill. Every resource, result, endpoint-like string, and request identifier is synthetic. The runner
gives the model no tools, uses an ephemeral read-only session, and rejects tool events.

Validate the corpus and deterministic scorer:

```sh
node tests/validate_agent_usability_eval.mjs
```

Run a pinned model and write the JSON report outside the repository before reviewing it:

```sh
node evals/agent-usability/run-codex-eval.mjs /absolute/path/to/codex gpt-5.6-luna \
  <exact-runtime-git-revision> \
  > /tmp/safa-agent-usability-luna.json
```

The runner records exact SHA-256 digests for the Skill, contract, and corpus plus the supplied
Runtime revision. Do not check in Codex authentication, local paths, environment variables, or raw
diagnostic logs.
