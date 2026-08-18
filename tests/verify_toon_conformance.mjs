#!/usr/bin/env node

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

const EXPECTED_SPEC_VERSION = '4.1.1'
const [referenceRoot, specRoot, fixtureRoot] = process.argv.slice(2)
if (!referenceRoot || !specRoot || !fixtureRoot) {
  process.stderr.write(
    'usage: verify_toon_conformance.mjs <reference-root> <spec-root> <fixture-root>\n',
  )
  process.exit(2)
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function sortedFiles(root, suffix) {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .flatMap((entry) => {
      const candidate = path.join(root, entry.name)
      if (entry.isDirectory()) return sortedFiles(candidate, suffix)
      return entry.isFile() && entry.name.endsWith(suffix) ? [candidate] : []
    })
    .sort()
}

assert.equal(
  readJSON(path.join(referenceRoot, 'packages/toon/package.json')).version,
  EXPECTED_SPEC_VERSION,
)
assert.equal(readJSON(path.join(specRoot, 'package.json')).version, EXPECTED_SPEC_VERSION)

const { decode, encode } = await import(
  pathToFileURL(path.join(referenceRoot, 'packages/toon/src/index.ts')).href
)

let productCount = 0
for (const toonPath of sortedFiles(fixtureRoot, '.toon')) {
  const expectedPath = toonPath.replace(/\.toon$/, '.json')
  assert.ok(fs.existsSync(expectedPath), `missing expected JSON for ${toonPath}`)
  const toon = fs.readFileSync(toonPath, 'utf8').replace(/\n$/, '')
  const expected = readJSON(expectedPath)
  assert.deepEqual(decode(toon, { strict: true }), expected, toonPath)
  assert.equal(encode(expected), toon, `non-canonical fixture: ${toonPath}`)
  productCount += 1
}
assert.ok(productCount > 0, 'no SAFA TOON fixtures found')

let officialEncodeCount = 0
for (const fixturePath of sortedFiles(path.join(specRoot, 'tests/fixtures/encode'), '.json')) {
  for (const test of readJSON(fixturePath).tests) {
    if (test.shouldError) {
      assert.throws(() => encode(test.input, test.options), undefined, test.name)
    } else {
      assert.equal(encode(test.input, test.options), test.expected, test.name)
    }
    officialEncodeCount += 1
  }
}

let officialDecodeCount = 0
for (const fixturePath of sortedFiles(path.join(specRoot, 'tests/fixtures/decode'), '.json')) {
  for (const test of readJSON(fixturePath).tests) {
    if (test.options?.strict === false) continue
    if (test.shouldError) {
      assert.throws(
        () => decode(test.input, { ...test.options, strict: true }),
        undefined,
        test.name,
      )
    } else {
      assert.deepEqual(
        decode(test.input, { ...test.options, strict: true }),
        test.expected,
        test.name,
      )
    }
    officialDecodeCount += 1
  }
}

process.stdout.write(
  `TOON ${EXPECTED_SPEC_VERSION}: ${productCount} SAFA, ${officialEncodeCount} official encode, `
    + `${officialDecodeCount} official strict-decode fixtures passed.\n`,
)
