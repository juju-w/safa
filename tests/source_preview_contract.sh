#!/bin/sh
set -eu

repository_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
installer="${repository_root}/skills/safa/scripts/install-source-preview.sh"
manifest="${repository_root}/skills/safa/manifests/source-preview-macos-v1.json"

[ -x "$installer" ]
[ -f "$manifest" ]

help_output=$("$installer" --help)
printf '%s\n' "$help_output" | grep -F -- '--confirm-local-build' >/dev/null
printf '%s\n' "$help_output" | grep -F -- '--verify-source' >/dev/null

# Keep fail-closed checks in the reviewed installer even where CI cannot safely synthesize a
# second operating system, Keychain identity set, malicious GitHub archive, or failed Xcode build.
grep -F '[ "$(/usr/bin/uname -s)" = "Darwin" ] || fail' "$installer" >/dev/null
grep -F 'multiple Apple Development identities are available' "$installer" >/dev/null
grep -F 'the downloaded Source Preview archive digest does not match' "$installer" >/dev/null
grep -F 'the Source Preview archive contains an unsafe path' "$installer" >/dev/null
grep -F 'the Source Preview archive contains an unexpected root' "$installer" >/dev/null
grep -F '"$runtime_installer" "$@"' "$installer" >/dev/null

set +e
invalid_output=$("$installer" --check --verify-source 2>&1)
invalid_result=$?
set -e
[ "$invalid_result" -eq 1 ]
printf '%s\n' "$invalid_output" | grep -F 'select exactly one' >/dev/null

if [ "$(uname -s)" = "Darwin" ]; then
  set +e
  noninteractive_output=$("$installer" --confirm-local-build 2>&1)
  noninteractive_result=$?
  set -e
  [ "$noninteractive_result" -eq 1 ]
  if printf '%s\n' "$noninteractive_output" | grep -F 'Downloading exact SAFA Runtime source' >/dev/null; then
    printf '%s\n' 'source preview performed a download before rejecting non-interactive use' >&2
    exit 1
  fi
  printf '%s\n' "$noninteractive_output" \
    | grep -Eq '(interactive local terminal|Apple Development identity|multiple Apple Development identities)'
fi

printf '%s\n' 'source preview contract passed'
