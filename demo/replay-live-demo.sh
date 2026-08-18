#!/bin/sh
# replay-live-demo.sh — replay the live SAFA diagnostic demo on this machine.
#
# This is NOT a scripted fake: every step below invokes the real `safa` launcher,
# which verifies the signed local Runtime, talks to the real Broker, and executes
# bounded read-only diagnostics on the registered resources of THIS machine.
#
# Requires:
#   - macOS with an installed, signed SAFA Runtime (see scripts/safa for the lock)
#   - at least one registered resource reachable from this network
#   - the demo aliases below (edit TARGET to point at one of your own resources)
#
# Usage:
#   ./replay-live-demo.sh              # replay everything, full TOON output
#   ./replay-live-demo.sh --summary    # only step titles and exit codes
#   ./replay-live-demo.sh --record DIR # full output archived under DIR/
#
# The demo narrative ("NAS got slower, find out why") is documented in
# live-demo.md. Replace TARGET/aliases with your own before publishing anywhere.

set -eu
PATH=/usr/bin:/bin:/usr/sbin:/sbin
export PATH

# ---- which registered resource is the demo target? -------------------------
# Set SAFA_DEMO_TARGET to one of YOUR registered aliases before replaying;
# the placeholder below is kept sanitized for public distribution.
TARGET="${SAFA_DEMO_TARGET:-nas.primary}"
DENIED_RESOURCE="${SAFA_DEMO_UNREGISTERED:-not-registered-alias}"

# The launcher must run with the Skill directory as the working directory.
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
SKILL_DIR="${SCRIPT_DIR}/../skills/safa"
SAFA="${SKILL_DIR}/scripts/safa"
cd "${SKILL_DIR}"

MODE="full"
RECORD_DIR=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    --summary) MODE="summary" ;;
    --record)
      [ "$#" -ge 2 ] || { echo "error: --record needs a directory" >&2; exit 2; }
      RECORD_DIR="$2"; shift ;;
    -h|--help) sed -n '2,16p' "$0"; exit 0 ;;
    *) echo "error: unknown option $1" >&2; exit 2 ;;
  esac
  shift
done
# Resolve --record relative to the caller's cwd BEFORE we cd into the skill dir.
if [ -n "$RECORD_DIR" ]; then
  case "$RECORD_DIR" in
    /*) ;;
    *) RECORD_DIR="$(pwd)/$RECORD_DIR" ;;
  esac
  mkdir -p "$RECORD_DIR"
fi

step_count=0
step() {
  # step <slug> <title> <command...>
  slug="$1"; title="$2"; shift 2
  step_count=$((step_count + 1))
  printf '\n━━━ [%02d] %s ━━━\n' "$step_count" "$title"
  if [ -n "$RECORD_DIR" ]; then
    out="${RECORD_DIR}/step-$(printf '%02d' "$step_count")-${slug}.toon"
    if "$@" >"$out" 2>"${out}.stderr"; then ec=0; else ec=$?; fi
    printf '  → exit %d  (full TOON archived: %s)\n' "$ec" "${out##*/}"
    if [ "$MODE" = "full" ]; then sed -n '1,24p' "$out"; [ "$(wc -l <"$out")" -gt 24 ] && echo '  …'; fi
  else
    if [ "$MODE" = "full" ]; then
      "$@" >/tmp/safa_demo_out.$ 2>/tmp/safa_demo_err.$; ec=$?
      sed -n '1,30p' /tmp/safa_demo_out.$
      [ "$(wc -l </tmp/safa_demo_out.$)" -gt 30 ] && echo '  … (full output: run with --record DIR)'
      if [ -s /tmp/safa_demo_err.$ ]; then echo '  [stderr]'; sed -n '1,5p' /tmp/safa_demo_err.$; fi
      rm -f /tmp/safa_demo_out.$ /tmp/safa_demo_err.$
    else
      "$@" >/tmp/safa_demo_out.$$ 2>/tmp/safa_demo_err.$$; ec=$?
      status=$(sed -n 's/^status: //p' /tmp/safa_demo_out.$$ | head -1)
      printf '  → exit %d  status=%s\n' "$ec" "${status:-?}"
      rm -f /tmp/safa_demo_out.$$ /tmp/safa_demo_err.$$
    fi
  fi
}

echo "# SAFA live diagnostic demo (real runtime, real resources)"
echo "# target: ${TARGET}   date: $(date '+%Y-%m-%d %H:%M:%S %Z')"

step doctor "runtime readiness" "${SAFA}" doctor
step resource-list "discover safe aliases" "${SAFA}" resource list
step resource-show "safe summary of ${TARGET}" "${SAFA}" resource show "${TARGET}"
step topology-show "topology placement of ${TARGET}" "${SAFA}" topology show "${TARGET}" --limit 64
step df-root "disk: root filesystem of ${TARGET}" "${SAFA}" exec "${TARGET}" --intent "Check root filesystem capacity during a slowness report" -- df -h /
step uptime "load: uptime of ${TARGET}" "${SAFA}" exec "${TARGET}" --intent "Check load average and uptime for a slowness report" -- uptime
step free "memory: memory and swap of ${TARGET}" "${SAFA}" exec "${TARGET}" --intent "Check memory and swap pressure" -- free -h
step ps-mem "memory: top consumers on ${TARGET}" "${SAFA}" exec "${TARGET}" --intent "Find which processes hold the most memory to explain swap usage" -- ps -eo pid,ppid,user,stat,comm,%cpu,%mem --sort=-%mem
step systemctl-jellyfin "service: is jellyfin active on ${TARGET}" "${SAFA}" exec "${TARGET}" --intent "Verify whether the jellyfin media service is running" -- systemctl is-active jellyfin
step systemctl-postgres "service: is postgresql active on ${TARGET}" "${SAFA}" exec "${TARGET}" --intent "Verify whether the postgresql database service is running" -- systemctl is-active postgresql
step denied-sudo "boundary: sudo is refused" "${SAFA}" exec "${TARGET}" --intent "Restart the jellyfin service with elevated rights" -- sudo systemctl restart jellyfin
step denied-off-allowlist "boundary: off-allowlist command is refused" "${SAFA}" exec "${TARGET}" --intent "Inspect system logs" -- journalctl -n 4000 --no-pager
step denied-unregistered "boundary: unregistered resource is refused" "${SAFA}" exec "${DENIED_RESOURCE}" --intent "Check production disk capacity" -- df -h /

echo
echo "# demo finished. Every credential, endpoint, and private key stayed inside the Runtime."