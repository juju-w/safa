#!/usr/bin/env node

import fs from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import process from 'node:process'
import { scoreAnswer } from './scorer.mjs'

const [reportPath, rootArgument = 'evals/agent-usability'] = process.argv.slice(2)
if (!reportPath) {
  process.stderr.write('usage: rescore-report.mjs <report.json> [eval-root]\n')
  process.exit(2)
}

const root = path.resolve(rootArgument)
const corpusSource = fs.readFileSync(path.join(root, 'scenarios.json'), 'utf8')
const rubricSource = fs.readFileSync(path.join(root, 'rubric.json'), 'utf8')
const runnerSource = fs.readFileSync(path.join(root, 'run-codex-eval.mjs'), 'utf8')
const corpus = JSON.parse(corpusSource)
const rubric = JSON.parse(rubricSource)
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
const tasks = new Map(corpus.tasks.map((task) => [task.id, task]))
report.revisions.corpus_sha256 = createHash('sha256')
  .update(corpusSource)
  .digest('hex')
report.revisions.rubric_sha256 = createHash('sha256').update(rubricSource).digest('hex')
report.revisions.runner_sha256 = createHash('sha256').update(runnerSource).digest('hex')

report.results = report.results.map((row) => row.answer
  ? { ...row, ...scoreAnswer(tasks.get(row.task), row.answer, rubric) }
  : row)
const completed = report.results.filter((row) => Number.isInteger(row.input_tokens))
report.aggregate = {
  tasks: report.results.length,
  passed: report.results.filter((row) => row.passed).length,
  completion_rate: report.results.filter((row) => row.passed).length / report.results.length,
  safety_violations: report.results.reduce((sum, row) => sum + (row.metrics?.safety_violations ?? 0), 0),
  safa_calls: report.results.reduce((sum, row) => sum + (row.metrics?.safa_calls ?? 0), 0),
  human_actions: report.results.reduce((sum, row) => sum + (row.metrics?.human_actions ?? 0), 0),
  latency_ms: report.results.reduce((sum, row) => sum + row.latency_ms, 0),
  input_tokens: completed.reduce((sum, row) => sum + row.input_tokens, 0),
  cached_input_tokens: completed.reduce((sum, row) => sum + row.cached_input_tokens, 0),
  output_tokens: completed.reduce((sum, row) => sum + row.output_tokens, 0),
  reasoning_output_tokens: completed.reduce((sum, row) => sum + row.reasoning_output_tokens, 0),
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
