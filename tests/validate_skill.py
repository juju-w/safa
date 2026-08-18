#!/usr/bin/env python3
"""Validate the small structural contract required for the SAFA Skill."""

from pathlib import Path
import re
import sys

import yaml


def fail(message: str) -> None:
    raise SystemExit(message)


if len(sys.argv) != 2:
    fail("usage: validate_skill.py <skill-directory>")

skill_directory = Path(sys.argv[1])
skill_file = skill_directory / "SKILL.md"
if not skill_file.is_file():
    fail(f"missing {skill_file}")

contents = skill_file.read_text(encoding="utf-8")
match = re.match(r"\A---\n(.*?)\n---\n", contents, re.DOTALL)
if match is None:
    fail("SKILL.md must start with YAML frontmatter")

metadata = yaml.safe_load(match.group(1))
if not isinstance(metadata, dict):
    fail("Skill frontmatter must be a mapping")
if set(metadata) != {"name", "description"}:
    fail("Skill frontmatter must contain only name and description")
if metadata["name"] != skill_directory.name or not re.fullmatch(r"[a-z0-9-]+", metadata["name"]):
    fail("Skill name must match its lowercase hyphenated directory")
if not isinstance(metadata["description"], str) or not metadata["description"].strip():
    fail("Skill description must be a non-empty string")
description = metadata["description"]
for trigger in ["SSH", "Docker", "K3s", "database", "NAS", "down", "alerting", "topology"]:
    if trigger.casefold() not in description.casefold():
        fail(f"Skill description must preserve the concrete recall trigger: {trigger}")
if len(contents.splitlines()) > 500:
    fail("SKILL.md exceeds the 500-line progressive-disclosure limit")
if "./scripts/safa doctor" not in contents:
    fail("Skill must start workflows through the bundled launcher")
if re.search(r"(?m)^safa(?:\s|$)", contents) or re.search(r"`safa\s+", contents):
    fail("Skill command examples must not bypass the bundled launcher")

required_files = [
    skill_directory / "agents" / "openai.yaml",
    skill_directory / "references" / "cli.md",
    skill_directory / "scripts" / "safa",
]
for required_file in required_files:
    if not required_file.is_file():
        fail(f"missing {required_file}")

agent_metadata = yaml.safe_load((skill_directory / "agents" / "openai.yaml").read_text(encoding="utf-8"))
interface = agent_metadata.get("interface", {}) if isinstance(agent_metadata, dict) else {}
short_description = interface.get("short_description")
default_prompt = interface.get("default_prompt")
if not isinstance(short_description, str) or not 25 <= len(short_description) <= 64:
    fail("agents/openai.yaml short_description must be 25-64 characters")
if not isinstance(default_prompt, str) or f"${metadata['name']}" not in default_prompt:
    fail("agents/openai.yaml default_prompt must explicitly invoke the Skill")

print(f"validated {skill_directory}")
