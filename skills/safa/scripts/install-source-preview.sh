#!/bin/sh
set -eu
PATH=/usr/bin:/bin:/usr/sbin:/sbin
export PATH

usage() {
  /usr/bin/printf '%s\n' \
    'Usage: install-source-preview.sh --confirm-local-build [--identity-hash SHA1] [--replace]' \
    '       install-source-preview.sh --check [--identity-hash SHA1]' \
    '       install-source-preview.sh --verify-source' \
    '' \
    'Build the exact digest-pinned SAFA Runtime source preview on this Mac.' \
    'This script does not download or install a precompiled Runtime.'
}

fail() {
  /usr/bin/printf 'error: %s\n' "$1" >&2
  exit 1
}

note() {
  /usr/bin/printf '%s\n' "$1" >&2
}

version_at_least() {
  /usr/bin/awk -v have="$1" -v need="$2" 'BEGIN {
    split(have, h, "."); split(need, n, ".");
    for (i = 1; i <= 3; i += 1) {
      hv = (h[i] == "" ? 0 : h[i] + 0);
      nv = (n[i] == "" ? 0 : n[i] + 0);
      if (hv > nv) exit 0;
      if (hv < nv) exit 1;
    }
    exit 0;
  }'
}

confirm_local_build=0
check_only=0
verify_source_only=0
replace_existing=0
identity_hash=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --confirm-local-build)
      confirm_local_build=1
      shift
      ;;
    --check)
      check_only=1
      shift
      ;;
    --verify-source)
      verify_source_only=1
      shift
      ;;
    --identity-hash)
      [ "$#" -ge 2 ] || fail "--identity-hash requires a value"
      identity_hash="$2"
      shift 2
      ;;
    --replace)
      replace_existing=1
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *) fail "unexpected argument: $1" ;;
  esac
done

mode_count=$((confirm_local_build + check_only + verify_source_only))
[ "$mode_count" -eq 1 ] || fail "select exactly one of --confirm-local-build, --check, or --verify-source"
if [ "$confirm_local_build" -ne 1 ] && [ "$replace_existing" -eq 1 ]; then
  fail "--replace requires --confirm-local-build"
fi

[ "$(/usr/bin/uname -s)" = "Darwin" ] || fail "the Source Preview requires macOS"
[ -n "${HOME:-}" ] || fail "the current user home directory is unavailable"

script_dir=$(CDPATH= cd -- "$(/usr/bin/dirname -- "$0")" && /bin/pwd)
skill_root=$(CDPATH= cd -- "${script_dir}/.." && /bin/pwd)
manifest_path="${skill_root}/manifests/source-preview-macos-v1.json"
[ -f "$manifest_path" ] && [ ! -L "$manifest_path" ] || fail "the pinned Source Preview manifest is missing or unsafe"

manifest_field() {
  /usr/bin/plutil -extract "$1" raw -o - "$manifest_path" 2>/dev/null
}

manifest_schema=$(manifest_field schema) || fail "the Source Preview manifest is invalid"
runtime_version=$(manifest_field runtime_version) || fail "the Source Preview manifest is invalid"
cli_schema=$(manifest_field cli_schema) || fail "the Source Preview manifest is invalid"
platform=$(manifest_field platform) || fail "the Source Preview manifest is invalid"
minimum_os=$(manifest_field minimum_os_version) || fail "the Source Preview manifest is invalid"
minimum_xcode=$(manifest_field minimum_xcode_version) || fail "the Source Preview manifest is invalid"
repository=$(manifest_field source.repository) || fail "the Source Preview manifest is invalid"
revision=$(manifest_field source.revision) || fail "the Source Preview manifest is invalid"
archive_url=$(manifest_field source.archive_url) || fail "the Source Preview manifest is invalid"
archive_sha256=$(manifest_field source.sha256) || fail "the Source Preview manifest is invalid"
archive_format=$(manifest_field source.archive_format) || fail "the Source Preview manifest is invalid"
source_root_name=$(manifest_field source.root_directory) || fail "the Source Preview manifest is invalid"
installer_path=$(manifest_field installer.path) || fail "the Source Preview manifest is invalid"
signing_kind=$(manifest_field installer.signing_kind) || fail "the Source Preview manifest is invalid"

[ "$manifest_schema" = "dev.safa.source-preview-manifest/v1" ] || fail "unsupported Source Preview manifest schema"
[ "$cli_schema" = "dev.safa.cli/v2" ] || fail "the Source Preview CLI schema is incompatible"
[ "$platform" = "macos" ] || fail "the Source Preview platform is incompatible"
[ "$repository" = "https://github.com/juju-w/safa-runtime" ] || fail "the Source Preview repository is not trusted"
[ "$archive_format" = "tar.gz" ] || fail "the Source Preview archive format is unsupported"
[ "$installer_path" = "Scripts/install-local-runtime.sh" ] || fail "the Source Preview installer path is invalid"
[ "$signing_kind" = "local-apple-development" ] || fail "the Source Preview signing mode is invalid"

/usr/bin/printf '%s\n' "$runtime_version" | /usr/bin/grep -Eq '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$' \
  || fail "the Source Preview Runtime version is invalid"
/usr/bin/printf '%s\n' "$revision" | /usr/bin/grep -Eq '^[0-9a-f]{40}$' \
  || fail "the Source Preview revision is invalid"
/usr/bin/printf '%s\n' "$archive_sha256" | /usr/bin/grep -Eq '^[0-9a-f]{64}$' \
  || fail "the Source Preview archive digest is invalid"
[ "$archive_url" = "${repository}/archive/${revision}.tar.gz" ] \
  || fail "the Source Preview archive URL is not bound to its exact revision"
[ "$source_root_name" = "safa-runtime-${revision}" ] \
  || fail "the Source Preview archive root is not bound to its exact revision"

architecture=$(/usr/bin/uname -m)
case "$architecture" in
  arm64 | x86_64) ;;
  *) fail "unsupported macOS architecture: $architecture" ;;
esac
supported_architecture=0
index=0
while manifest_architecture=$(manifest_field "architectures.${index}"); do
  if [ "$manifest_architecture" = "$architecture" ]; then
    supported_architecture=1
  fi
  index=$((index + 1))
done
[ "$supported_architecture" -eq 1 ] || fail "the Source Preview does not support this Mac architecture"

os_version=$(/usr/bin/sw_vers -productVersion)
version_at_least "$os_version" "$minimum_os" \
  || fail "macOS ${minimum_os} or newer is required"

if [ "$verify_source_only" -ne 1 ]; then
  [ -x /usr/bin/xcodebuild ] || fail "Xcode is required for the Source Preview local build"
  xcode_version=$(/usr/bin/xcodebuild -version | /usr/bin/awk 'NR == 1 { print $2 }')
  version_at_least "$xcode_version" "$minimum_xcode" \
    || fail "Xcode ${minimum_xcode} or newer is required"

  available_identities=$(/usr/bin/security find-identity -v -p codesigning 2>/dev/null \
    | /usr/bin/awk 'index($0, "Apple Development:") > 0 { print $2 }')
  if [ -n "$identity_hash" ]; then
    /usr/bin/printf '%s\n' "$identity_hash" | /usr/bin/grep -Eq '^[0-9A-Fa-f]{40}$' \
      || fail "--identity-hash must contain exactly 40 hexadecimal characters"
    matching_identity_count=$(/usr/bin/printf '%s\n' "$available_identities" \
      | /usr/bin/awk -v selected="$identity_hash" '
          toupper($0) == toupper(selected) { count += 1 }
          END { print count + 0 }
        ')
    [ "$matching_identity_count" -eq 1 ] || fail "the selected Apple Development identity is not available"
  else
    identity_count=$(/usr/bin/printf '%s\n' "$available_identities" \
      | /usr/bin/awk 'NF { count += 1 } END { print count + 0 }')
    [ "$identity_count" -gt 0 ] || fail "create an Apple Development identity in Xcode"
    [ "$identity_count" -eq 1 ] \
      || fail "multiple Apple Development identities are available; select one locally with --identity-hash"
    identity_hash=$(/usr/bin/printf '%s\n' "$available_identities" | /usr/bin/awk 'NF { print; exit }')
  fi
fi

if [ "$check_only" -eq 1 ]; then
  /usr/bin/printf 'Source Preview prerequisites are ready for Runtime %s on %s.\n' "$runtime_version" "$architecture"
  exit 0
fi

if [ "$confirm_local_build" -eq 1 ] && { [ ! -t 0 ] || [ ! -t 1 ]; }; then
  fail "run the Source Preview build from an interactive local terminal"
fi

work_root=$(/usr/bin/mktemp -d "${TMPDIR:-/tmp}/safa-source-preview.XXXXXX")
archive_path="${work_root}/runtime.tar.gz"
listing_path="${work_root}/archive.list"

cleanup() {
  /bin/rm -rf -- "$work_root"
}
trap cleanup EXIT HUP INT TERM

note "Downloading exact SAFA Runtime source ${revision}."
/usr/bin/curl --proto '=https' --tlsv1.2 --fail --location --silent --show-error \
  --output "$archive_path" "$archive_url"
actual_sha256=$(/usr/bin/shasum -a 256 "$archive_path" | /usr/bin/awk '{ print $1 }')
[ "$actual_sha256" = "$archive_sha256" ] || fail "the downloaded Source Preview archive digest does not match"

/usr/bin/tar -tzf "$archive_path" > "$listing_path" \
  || fail "the Source Preview archive could not be inspected"
[ -s "$listing_path" ] || fail "the Source Preview archive is empty"
if /usr/bin/grep -Eq '(^/|(^|/)\.\.(/|$))' "$listing_path"; then
  fail "the Source Preview archive contains an unsafe path"
fi
if /usr/bin/grep -Ev "^${source_root_name}(/|$)" "$listing_path" >/dev/null; then
  fail "the Source Preview archive contains an unexpected root"
fi

/usr/bin/tar -xzf "$archive_path" -C "$work_root" \
  || fail "the Source Preview archive could not be extracted"
source_root="${work_root}/${source_root_name}"
[ -d "$source_root" ] && [ ! -L "$source_root" ] || fail "the extracted Source Preview root is unsafe"
runtime_installer="${source_root}/${installer_path}"
[ -f "$runtime_installer" ] && [ -x "$runtime_installer" ] && [ ! -L "$runtime_installer" ] \
  || fail "the reviewed Runtime installer is missing or unsafe"
[ -f "${source_root}/Package.resolved" ] \
  || fail "the root Swift dependency lock is missing"
[ -f "${source_root}/Apps/SAFA/SAFA.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved" ] \
  || fail "the Xcode Swift dependency lock is missing"

if [ "$verify_source_only" -eq 1 ]; then
  /usr/bin/printf 'Verified exact SAFA Runtime source %s (%s).\n' "$revision" "$archive_sha256"
  exit 0
fi

set -- --source-preview --identity-hash "$identity_hash"
if [ "$replace_existing" -eq 1 ]; then
  set -- "$@" --replace
fi

note "Building and locally signing SAFA Runtime ${runtime_version}."
"$runtime_installer" "$@"
/usr/bin/printf '%s\n' 'Source Preview installation completed. Run ./scripts/safa doctor again.'
