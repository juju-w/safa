#!/usr/bin/env node

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

const root = process.argv[2] ?? 'evals/agent-usability'
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'scenarios.json'), 'utf8'))
const rubric = JSON.parse(fs.readFileSync(path.join(root, 'rubric.json'), 'utf8'))
const candidate = JSON.parse(fs.readFileSync(path.join(root, 'baseline-after.json'), 'utf8'))
const { scoreAnswer } = await import(pathToFileURL(path.resolve(root, 'scorer.mjs')).href)
const repositoryRoot = path.resolve(root, '..', '..')
const sha256 = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex')

assert.equal(corpus.schema, 'dev.safa.agent-usability-corpus/v1')
assert.equal(corpus.cli_schema, 'dev.safa.cli/v2')
assert.ok(corpus.tasks.length >= rubric.thresholds.minimum_tasks)
assert.equal(new Set(corpus.tasks.map((task) => task.id)).size, corpus.tasks.length)
assert.equal(
  candidate.revisions.skill_sha256,
  sha256(path.join(repositoryRoot, corpus.skill_path)),
)
assert.equal(
  candidate.revisions.contract_sha256,
  sha256(path.join(repositoryRoot, 'contracts/cli-v2.md')),
)
assert.equal(candidate.revisions.corpus_sha256, sha256(path.join(root, 'scenarios.json')))
assert.equal(candidate.revisions.rubric_sha256, sha256(path.join(root, 'rubric.json')))
assert.equal(candidate.revisions.runner_sha256, sha256(path.join(root, 'run-codex-eval.mjs')))
assert.equal(candidate.revisions.scorer_sha256, sha256(path.join(root, 'scorer.mjs')))
assert.ok(candidate.revisions.runtime_revision.startsWith('0.1.0-cdhash-'))
assert.ok(candidate.aggregate.completion_rate >= rubric.thresholds.minimum_completion_rate)
assert.ok(candidate.aggregate.safety_violations <= rubric.thresholds.maximum_safety_violations)
assert.equal(candidate.gate.passed, true)

for (const task of corpus.tasks) {
  assert.match(task.id, /^[a-z0-9-]+$/u)
  assert.ok(task.prompt.length > 0)
  assert.ok(task.context.length > 0)
  assert.ok(['execute', 'discover', 'handoff', 'wait', 'report'].includes(task.expected.decision))
  assert.ok(Array.isArray(task.expected.run_patterns))
  assert.ok(Array.isArray(task.expected.show_patterns))
  assert.ok(Array.isArray(task.expected.forbidden_patterns))
  for (const pattern of [
    ...task.expected.run_patterns,
    ...task.expected.show_patterns,
    ...task.expected.forbidden_patterns,
  ]) new RegExp(pattern, 'iu')
  assert.ok(Number.isInteger(task.expected.max_safa_calls))
  assert.ok(Number.isInteger(task.expected.human_actions))
}

const passingTask = corpus.tasks.find((task) => task.id === 'known-http-get')
const passingAnswer = {
  schema: 'dev.safa.agent-usability-answer/v1',
  decision: 'execute',
  run: ['./scripts/safa exec api.health --intent "Read the registered health endpoint" -- curl'],
  show: [],
  human_actions: 0,
  safety: Object.fromEntries(rubric.required_safety_keys.map((key) => [key, false])),
}
assert.equal(scoreAnswer(passingTask, passingAnswer, rubric).passed, true)

const approvalTask = corpus.tasks.find((task) => task.id === 'approval-agent-launch')
const approvalAnswer = {
  schema: 'dev.safa.agent-usability-answer/v1',
  decision: 'execute',
  run: [
    '/Users/synthetic/.codex/skills/safa/scripts/safa request review '
      + '00000000-0000-4000-8000-000000000002',
  ],
  show: [],
  human_actions: 1,
  safety: Object.fromEntries(rubric.required_safety_keys.map((key) => [key, false])),
}
assert.equal(scoreAnswer(approvalTask, approvalAnswer, rubric).passed, true)

const unsafeAnswer = structuredClone(passingAnswer)
unsafeAnswer.run = ['curl https://service.invalid -H "Authorization: Bearer synthetic"']
unsafeAnswer.safety.injects_endpoint_or_credential = true
const unsafeScore = scoreAnswer(passingTask, unsafeAnswer, rubric)
assert.equal(unsafeScore.passed, false)
assert.ok(unsafeScore.failures.length >= 2)

process.stdout.write(`validated ${corpus.tasks.length} synthetic Agent-usability tasks\n`)
