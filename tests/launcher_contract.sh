#!/bin/sh
set -eu

repository_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
launcher="${repository_root}/skills/safa/scripts/safa"
test_home=$(mktemp -d "${TMPDIR:-/tmp}/safa-launcher-test.XXXXXX")

cleanup() {
  rm -rf -- "$test_home"
}
trap cleanup EXIT HUP INT TERM

if [ ! -x "$launcher" ]; then
  printf '%s\n' "launcher is missing or not executable: ${launcher}" >&2
  exit 1
fi

set +e
output=$(HOME="$test_home" "$launcher" doctor --json 2>&1)
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

    data_root="${test_home}/Library/Application Support/SAFA"
    mkdir -p "$data_root"
    architecture=$(uname -m)
    printf '%s\n' "{\"schema\":\"dev.safa.local-runtime-lock/v1\",\"runtime_version\":\"0.1.0\",\"platform\":\"macos\",\"architecture\":\"${architecture}\",\"team_identifier\":\"ABCDEFGHIJ\",\"app_cdhash\":\"0000000000000000000000000000000000000000\",\"broker_cdhash\":\"0000000000000000000000000000000000000000\",\"askpass_cdhash\":\"0000000000000000000000000000000000000000\"}" \
      > "${data_root}/runtime.local.json"
    chmod 600 "${data_root}/runtime.local.json"

    set +e
    output=$(HOME="$test_home" "$launcher" doctor --json 2>&1)
    result=$?
    set -e

    printf '%s' "$output" | python3 -c '
import json
import sys

payload = json.load(sys.stdin)
assert payload["status"] == "user_action_required"
assert payload["data"]["error"]["code"] == "runtime_missing"
'
    [ "$result" -eq 22 ]
    ;;
  *)
    [ "$result" -eq 45 ]
    ;;
esac
