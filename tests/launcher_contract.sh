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

grep -F 'exec /usr/bin/env -i' "$launcher" >/dev/null

set +e
output=$(HOME="$test_home" "$launcher" doctor 2>&1)
result=$?
set -e

printf '%s\n' "$output" | grep -Fx 'schema: dev.safa.cli/v2' >/dev/null
printf '%s\n' "$output" | grep -Fx 'command: launcher' >/dev/null
printf '%s\n' "$output" | grep -Eq '^status: (failed|user_action_required)$'
printf '%s\n' "$output" | grep -Eq '^  code: (runtime\.missing|unsupported_platform)$'

case "$(uname -s)" in
  Darwin)
    printf '%s\n' "$output" \
      | grep -Fx '  ./scripts/install-source-preview.sh --confirm-local-build,A local human must explicitly build the exact pinned source preview,false' >/dev/null
    [ "$result" -eq 1 ]

    data_root="${test_home}/Library/Application Support/SAFA"
    mkdir -p "$data_root"
    architecture=$(uname -m)
    printf '%s\n' "{\"schema\":\"dev.safa.local-runtime-lock/v1\",\"runtime_version\":\"0.1.0\",\"platform\":\"macos\",\"architecture\":\"${architecture}\",\"team_identifier\":\"ABCDEFGHIJ\",\"app_cdhash\":\"0000000000000000000000000000000000000000\",\"broker_cdhash\":\"0000000000000000000000000000000000000000\",\"askpass_cdhash\":\"0000000000000000000000000000000000000000\",\"trusted_setup_cdhash\":\"0000000000000000000000000000000000000000\"}" \
      > "${data_root}/runtime.local.json"
    chmod 600 "${data_root}/runtime.local.json"

    set +e
    output=$(HOME="$test_home" "$launcher" doctor 2>&1)
    result=$?
    set -e

    printf '%s\n' "$output" | grep -Fx 'status: user_action_required' >/dev/null
    printf '%s\n' "$output" | grep -Fx '  code: runtime.lock_upgrade_required' >/dev/null
    printf '%s\n' "$output" \
      | grep -Fx '  ./scripts/install-source-preview.sh --confirm-local-build --replace,A local human must rebuild the exact pinned source preview,false' >/dev/null
    [ "$result" -eq 1 ]

    printf '%s\n' "{\"schema\":\"dev.safa.local-runtime-lock/v1\",\"runtime_version\":\"0.1.0\",\"cli_schema\":\"dev.safa.cli/v1\",\"platform\":\"macos\",\"architecture\":\"${architecture}\",\"team_identifier\":\"ABCDEFGHIJ\",\"app_cdhash\":\"0000000000000000000000000000000000000000\",\"broker_cdhash\":\"0000000000000000000000000000000000000000\",\"askpass_cdhash\":\"0000000000000000000000000000000000000000\",\"trusted_setup_cdhash\":\"0000000000000000000000000000000000000000\"}" \
      > "${data_root}/runtime.local.json"
    chmod 600 "${data_root}/runtime.local.json"

    set +e
    output=$(HOME="$test_home" "$launcher" doctor 2>&1)
    result=$?
    set -e

    printf '%s\n' "$output" | grep -Fx 'status: failed' >/dev/null
    printf '%s\n' "$output" | grep -Fx '  code: runtime_lock_incompatible' >/dev/null
    [ "$result" -eq 1 ]

    /usr/bin/sed -i '' 's#dev.safa.cli/v1#dev.safa.cli/v2#' "${data_root}/runtime.local.json"
    set +e
    output=$(HOME="$test_home" "$launcher" doctor 2>&1)
    result=$?
    set -e

    printf '%s\n' "$output" | grep -Fx 'status: user_action_required' >/dev/null
    printf '%s\n' "$output" | grep -Fx '  code: runtime.missing' >/dev/null
    printf '%s\n' "$output" \
      | grep -Fx '  ./scripts/install-source-preview.sh --confirm-local-build --replace,A local human must explicitly build the exact pinned source preview,false' >/dev/null
    [ "$result" -eq 1 ]
    ;;
  *)
    [ "$result" -eq 1 ]
    ;;
esac
