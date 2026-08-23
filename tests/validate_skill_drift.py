#!/usr/bin/env python3
"""Keep the compact Skill, public command reference, fixtures, and optional Runtime help aligned."""

from json import loads
from pathlib import Path
import subprocess
import sys


root = Path(__file__).resolve().parents[1]
product = (root / "PRODUCT.md").read_text(encoding="utf-8")
agents = (root / "AGENTS.md").read_text(encoding="utf-8")
skill = (root / "skills/safa/SKILL.md").read_text(encoding="utf-8")
reference = (root / "skills/safa/references/cli.md").read_text(encoding="utf-8")
contract = (root / "contracts/cli-v2.md").read_text(encoding="utf-8")
core_spec = (root / "specs/004-agent-usability/spec.md").read_text(encoding="utf-8")
context_spec = (root / "specs/005-resource-context/spec.md").read_text(encoding="utf-8")
context_plan = (root / "specs/005-resource-context/plan.md").read_text(encoding="utf-8")
mvp_spec = (root / "specs/006-core-mvp/spec.md").read_text(encoding="utf-8")
mvp_tasks = (root / "specs/006-core-mvp/tasks.md").read_text(encoding="utf-8")
home = loads((root / "conformance/agent-cli-v2/home.completed.json").read_text(encoding="utf-8"))
approval = loads(
    (root / "conformance/agent-cli-v2/sudo-approval.required.json").read_text(encoding="utf-8")
)
user_approval = loads(
    (root / "conformance/agent-cli-v2/user-approval.required.json").read_text(encoding="utf-8")
)
ready_sudo_approval = loads(
    (root / "conformance/agent-cli-v2/ready-sudo-approval.required.json").read_text(
        encoding="utf-8"
    )
)

for concept in ("Resource", "Task", "Decision", "Evidence"):
    if product.count(f"### {concept}\n") != 1:
        raise SystemExit(f"PRODUCT.md no longer defines exactly one {concept} concept")
if (
    "known alias → submit one Task" not in product
    or "normal SSH Task uses Runtime-owned automatic privilege resolution" not in product
):
    raise SystemExit("PRODUCT.md drifted from the one-call Runtime-owned privilege path")
if "`PRODUCT.md` is the normative source" not in agents:
    raise SystemExit("AGENTS.md no longer recognizes PRODUCT.md authority")
if "**Product Alignment**: **Core RC**" not in core_spec:
    raise SystemExit("004 is no longer classified as the core-RC usability journey")
if "needs rebaseline under `PRODUCT.md`" not in context_spec or "**NEEDS REBASELINE**" not in context_plan:
    raise SystemExit("005 post-RC memory plan is no longer held behind rebaseline")
if "**Product Alignment**: **Core RC**" not in mvp_spec:
    raise SystemExit("006 is no longer the core-MVP acceptance specification")
for deferred in ("Notebook", "ambient session integration", "`ssh-hosts` migration", "Linux"):
    if deferred not in mvp_tasks:
        raise SystemExit(f"006 MVP backlog no longer defers {deferred}")

for document, label in [(reference, "Skill CLI reference"), (contract, "public contract")]:
    if "--privilege user|sudo|auto" not in document:
        raise SystemExit(f"{label} does not expose the typed auto privilege value")

golden_exec = (
    './scripts/safa exec ALIAS --intent "Explain the requested purpose" '
    '--privilege auto -- COMMAND ARG...'
)
if golden_exec not in skill:
    raise SystemExit("Skill golden path drifted from one-call SSH exec with Runtime-owned privilege")
if "main Skill submits one exact `exec --privilege auto` Task" not in contract:
    raise SystemExit("public contract drifted from Runtime-owned normal-path privilege")
if "Do not run\n`doctor`, `resource list`, or `resource show` first." not in skill:
    raise SystemExit("Skill again requires diagnostic calls before known-alias exec")
if "approved system-permission context" not in skill or "exact absolute path" not in skill:
    raise SystemExit("Skill no longer explains the scoped Codex Broker integration")
if home["next"][0]["command"] != "safa resource show <alias>":
    raise SystemExit("home view no longer exposes the documented safe detail action")

expected_approval = [
    ("safa request review ", False),
    ("safa request wait ", True),
]
for row, (prefix, safe) in zip(approval["next"], expected_approval, strict=True):
    if not row["command"].startswith(prefix) or row["safe_for_agent"] is not safe:
        raise SystemExit("approval continuation drifted from the Skill control loop")
if "--timeout 300" not in approval["next"][1]["command"]:
    raise SystemExit("approval wait is no longer explicitly bounded")
if len(user_approval["next"]) != 1:
    raise SystemExit("registered-account approval must have exactly one continuation")
user_review = user_approval["next"][0]
if not user_review["command"].startswith("safa request review ") or not user_review["safe_for_agent"]:
    raise SystemExit("registered-account review is no longer Agent-launchable")
if len(ready_sudo_approval["next"]) != 1 or not ready_sudo_approval["next"][0]["safe_for_agent"]:
    raise SystemExit("ready-sudo review is no longer Agent-launchable")

if len(sys.argv) == 2:
    result = subprocess.run(
        [sys.argv[1], "exec", "--help"],
        check=True,
        capture_output=True,
        text=True,
    )
    if "user, sudo, or auto" not in result.stdout:
        raise SystemExit("Runtime exec help does not enumerate user, sudo, and auto")

print("validated product core, Skill, contract, home, approval, and CLI-help drift")
