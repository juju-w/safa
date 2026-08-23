#!/usr/bin/env python3
"""Verify that one Runtime worktree consumes this exact product contract revision."""

from hashlib import sha256
import json
from pathlib import Path
import re
import subprocess
import sys


def fail(message: str) -> None:
    raise SystemExit(message)


if len(sys.argv) != 2:
    fail("usage: validate_runtime_pair.py <runtime-repository>")

product_root = Path(__file__).resolve().parents[1]
runtime_root = Path(sys.argv[1]).resolve()
runtime_fixture_root = runtime_root / "conformance/toon-v4.1/agent-cli-v2"
source_path = runtime_root / "conformance/product-source.json"

if not (runtime_root / ".git").exists() or not runtime_fixture_root.is_dir():
    fail(f"not a SAFA Runtime repository: {runtime_root}")
if not source_path.is_file():
    fail(f"Runtime is missing its exact product source manifest: {source_path}")

source = json.loads(source_path.read_text(encoding="utf-8"))
if source.get("schema") != "dev.safa.runtime-product-source/v1":
    fail("Runtime product source manifest has an unsupported schema")
if source.get("repository") != "juju-w/safa":
    fail("Runtime product source manifest names an unexpected repository")
if source.get("cli_schema") != "dev.safa.cli/v2":
    fail("Runtime product source manifest does not select CLI v2")

product_revision = subprocess.run(
    ["git", "rev-parse", "HEAD"],
    cwd=product_root,
    check=True,
    capture_output=True,
    text=True,
).stdout.strip()
recorded_revision = source.get("revision")
if not isinstance(recorded_revision, str) or not re.fullmatch(r"[0-9a-f]{40}", recorded_revision):
    fail("Runtime product source manifest has an invalid revision")
if recorded_revision != product_revision:
    fail(f"Runtime consumes product {recorded_revision}, not current {product_revision}")

contract_digest = sha256((product_root / "contracts/cli-v2.md").read_bytes()).hexdigest()
if source.get("contract_sha256") != contract_digest:
    fail("Runtime product source manifest has a stale CLI contract digest")

product_fixture_root = product_root / "conformance/agent-cli-v2"
product_files = sorted(
    path.relative_to(product_fixture_root)
    for path in product_fixture_root.iterdir()
    if path.is_file() and path.suffix in {".json", ".toon"}
)
runtime_files = sorted(
    path.relative_to(runtime_fixture_root)
    for path in runtime_fixture_root.iterdir()
    if path.is_file() and path.suffix in {".json", ".toon"}
)
if runtime_files != product_files:
    fail("Runtime and product canonical fixture sets differ")

fixture_hash = sha256()
for relative in product_files:
    product_bytes = (product_fixture_root / relative).read_bytes()
    runtime_bytes = (runtime_fixture_root / relative).read_bytes()
    if runtime_bytes != product_bytes:
        fail(f"Runtime fixture differs from product: {relative}")
    fixture_hash.update(relative.as_posix().encode("utf-8"))
    fixture_hash.update(b"\0")
    fixture_hash.update(product_bytes)

if source.get("fixtures_sha256") != fixture_hash.hexdigest():
    fail("Runtime product source manifest has a stale canonical fixture digest")

print(
    "validated Runtime against exact product revision, CLI contract digest, "
    f"and {len(product_files) // 2} canonical fixture pairs"
)
