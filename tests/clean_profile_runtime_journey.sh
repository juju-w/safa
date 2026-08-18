#!/bin/sh
set -eu
PATH=/usr/bin:/bin:/usr/sbin:/sbin
export PATH

if [ "$(uname -s)" != "Darwin" ] || [ -z "${SAFA_TEST_RUNTIME_APP:-}" ]; then
  printf '%s\n' "SKIP: set SAFA_TEST_RUNTIME_APP to a signed SAFA.app on macOS"
  exit 0
fi

repository_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
launcher="${repository_root}/skills/safa/scripts/safa"
source_app=$(CDPATH= cd -- "$(dirname -- "$SAFA_TEST_RUNTIME_APP")" && pwd)/$(basename -- "$SAFA_TEST_RUNTIME_APP")
test_home=$(/usr/bin/mktemp -d "${TMPDIR:-/tmp}/safa-clean-profile.XXXXXX")

cleanup() {
  rm -rf -- "$test_home"
}
trap cleanup EXIT HUP INT TERM

signature_field() {
  component="$1"
  field="$2"
  /usr/bin/codesign --display --verbose=4 "$component" 2>&1 \
    | /usr/bin/sed -n "s/^${field}=//p" \
    | /usr/bin/head -n 1
}

source_cli="${source_app}/Contents/MacOS/safa"
runtime_version=$("$source_cli" --version)
architecture=$(uname -m)
team_identifier=$(signature_field "$source_cli" TeamIdentifier)
data_root="${test_home}/Library/Application Support/SAFA"
runtime_root="${data_root}/runtimes/${runtime_version}"
runtime_app="${runtime_root}/SAFA.app"
/bin/mkdir -p "$runtime_root"
/usr/bin/ditto "$source_app" "$runtime_app"

broker_app="${runtime_app}/Contents/Library/Helpers/SAFABrokerAgent.app"
askpass_path="${runtime_app}/Contents/Library/Helpers/safa-askpass"
trusted_setup_path="${runtime_app}/Contents/Library/Helpers/safa-trusted-setup"
app_cdhash=$(signature_field "$runtime_app" CDHash)
broker_cdhash=$(signature_field "$broker_app" CDHash)
askpass_cdhash=$(signature_field "$askpass_path" CDHash)
trusted_setup_cdhash=$(signature_field "$trusted_setup_path" CDHash)

umask 077
printf '%s\n' "{\"schema\":\"dev.safa.local-runtime-lock/v1\",\"runtime_version\":\"${runtime_version}\",\"platform\":\"macos\",\"architecture\":\"${architecture}\",\"team_identifier\":\"${team_identifier}\",\"app_cdhash\":\"${app_cdhash}\",\"broker_cdhash\":\"${broker_cdhash}\",\"askpass_cdhash\":\"${askpass_cdhash}\",\"trusted_setup_cdhash\":\"${trusted_setup_cdhash}\"}" \
  > "${data_root}/runtime.local.json"
/bin/chmod 600 "${data_root}/runtime.local.json"

output=$(HOME="$test_home" "$launcher" doctor)
printf '%s\n' "$output" | /usr/bin/grep -Fx 'schema: dev.safa.cli/v2' >/dev/null
printf '%s\n' "$output" | /usr/bin/grep -Fx 'command: doctor' >/dev/null
printf '%s\n' "$output" | /usr/bin/grep -Fx 'status: completed' >/dev/null
printf '%s\n' "$output" | /usr/bin/grep -Fx 'broker: ready' >/dev/null
printf '%s\n' "$output" | /usr/bin/grep -Fx 'vault: ready' >/dev/null
printf '%s\n' "PASS: clean profile Skill -> signed Runtime -> Broker"
