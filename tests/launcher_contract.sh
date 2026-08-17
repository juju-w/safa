#!/bin/sh
set -eu

repository_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
launcher="${repository_root}/skills/safa/scripts/safa"

if [ ! -x "$launcher" ]; then
  printf '%s\n' "launcher is missing or not executable: ${launcher}" >&2
  exit 1
fi

set +e
output=$($launcher doctor --json 2>&1)
result=$?
set -e

printf '%s' "$output" | python3 -c '
import json
import sys

payload = json.load(sys.stdin)
assert payload["schema"] == "dev.safa.cli/v1"
assert payload["command"] == "launcher"
assert payload["status"] in {"failed", "user_action_required"}
assert payload["data"]["error"]["code"] in {"runtime_missing", "unsupported_platform"}
'

case "$(uname -s)" in
  Darwin)
    [ "$result" -eq 22 ]
    ;;
  *)
    [ "$result" -eq 45 ]
    ;;
esac
