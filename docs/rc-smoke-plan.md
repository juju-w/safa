# MVP / RC Smoke Plan

Status: **candidate plan; no RC may be published while the publication hold remains active**

This plan supplies signed-artifact evidence to
[`specs/006-core-mvp`](../specs/006-core-mvp/spec.md). The MVP specification owns scope; this smoke
plan cannot add a feature or current-support claim.

This plan validates one exact Runtime and Skill commit pair. Record the two commit SHAs, Runtime
version, signing Team ID, macOS version, target-host role, and pass/fail evidence without recording
endpoints, usernames, fingerprints, passwords, or command output that contains private data.

## 1. Preconditions

- Use reviewed, scoped commits with no unrelated generated files or production resource data.
- Use a disposable Linux SSH host registered under a non-production alias such as `<test-host>`.
- Cover three account profiles when available: ordinary password-sudo, verified NOPASSWD, and root.
  Cover Docker group authorization separately; it is not a substitute for sudo testing.
- Build and install the same candidate through the Team-provisioned signed installer. Do not use the
  source-preview signing path for RC evidence because it does not prove the production entitlements.
- Restart the Broker from the newly installed bundle and verify the resolver selects that exact
  version. Replacing the same version must not leave the previous Broker process running.

## 2. Automated gates

Run from the Runtime repository:

```bash
xcrun swift-format lint --recursive --strict Sources Tests Apps/SAFA/Targets Package.swift
swift test --parallel
swift build -c release
xcodebuild -quiet -project Apps/SAFA/SAFA.xcodeproj -scheme "SAFA Runtime" \
  -configuration Debug CODE_SIGNING_ALLOWED=NO build
Scripts/tests/source-preview-installer-contract.sh
```

Run the product repository's CI-equivalent Skill, Markdown/JSON, TOON, launcher, and website checks,
then run `git diff --check` in both repositories. Validate `skills/safa` with both the repository
validator and the installed skill-creator validator. From the frozen product revision, also run:

```bash
python3 tests/validate_runtime_pair.py /absolute/path/to/safa-runtime
```

This must prove that Runtime records the exact product commit and contract digest and carries the
same canonical JSON/TOON fixture set byte-for-byte.

Required automated evidence includes:

- missing sudo credential becomes one immutable `approval_required` request;
- protected credential completion fails without a short-lived authenticated exact grant;
- NOPASSWD rejection is the only condition that permits hidden password input;
- transport/identity failures never open a password prompt;
- ready credentials do not request the remote password again;
- `request get|wait|review` preserve state, remote exit code, stdout, stderr, and truncation;
- no credential appears in argv, environment, CLI output, errors, audit records, or fixtures;
- a current fixed read-only connection probe overrides stale stored account hints;
- root and Docker-authorized current observations avoid unnecessary sudo selection;
- probe failure, timeout, or malformed output never selects sudo.

## 3. Signed local smoke

Use the installed Skill launcher, not a build-directory executable.

1. Run `doctor`, `resource list`, and `resource show <test-host>`. Confirm schema
   `dev.safa.cli/v2`, the expected installed version, and safe account observations.
2. Start a fresh Agent session with the exact alias already selected. Run one non-sudo read-only SSH
   Task directly with `--privilege auto`, without a preceding Agent `doctor`, list, show, sudo-status,
   topology, or context call. Confirm exit `0`, bounded stdout/stderr, and
   `execution.remote_exit_code: 0`.
3. Start a synthetic loopback HTTP service and register a disposable `--template http` resource
   through the trusted-local flow without recording its endpoint. Confirm the resource initially
   reports `needs_verification`, then run exact `curl` GET and `curl --head` operations through the
   installed Skill launcher. Require both remote exits to be `0`, confirm the resource transitions
   to `ready`, then remove it and stop the synthetic service.
4. Remove any test-only sudo credential through the trusted lifecycle, then submit one exact task:

   ```bash
   safa exec <test-host> --intent "Confirm first-use sudo execution" \
     --privilege auto -- systemctl restart media-synthetic
   ```

   Confirm it returns `approval_required`, one request ID, one `safe_for_agent: false` review action,
   and one bounded `safe_for_agent: true` wait action.
5. Run that review action in a trusted local terminal. Confirm the exact alias, command, intent,
   privilege, and risk appear before authorization. Complete the macOS user-presence check once.
6. For password-sudo, confirm NOPASSWD is tried first and one hidden remote password prompt follows.
   Confirm the command executes immediately after verification and no second approval command is
   needed. For NOPASSWD, confirm no password prompt appears.
7. While the trusted review is active, run the returned bounded wait action. Require
   `request_state: completed`, remote exit `0`, and terminal evidence. A response containing only
   the request ID fails the smoke.
8. Submit a second exact sudo command with the ready credential. Confirm the review requires one
   macOS user-presence check and no remote password prompt.
9. Deny one request and cancel another. Confirm neither touches the transport and both remain
   terminal with stable states.
10. On a root-account resource, confirm sudo status is `not_required` and the Agent uses user
    privilege. On a Docker-authorized resource, confirm Docker runs at user privilege; do not infer
    daemon health from group membership. Change or stale the stored account hint and confirm the
    next eligible `auto` call still follows the current connection probe.
11. Restart the Mac-side Broker, rerun `doctor`, inspect the existing resource, and execute one
    non-sudo command. Confirm vault access and installed entitlements survive restart.

## 4. Negative smoke

- Run the review command without a controlling TTY: it must fail closed without reading stdin.
- Enter an incorrect sudo password: the request must not execute and no credential may be stored.
- Make the SSH route unavailable before NOPASSWD probing: no password prompt may appear.
- Attempt credential completion using only a request ID: it must return
  `approval_session_invalid`.
- Let the five-minute exact approval continuation expire: completion must return
  `approval_session_expired` and must not execute.
- Submit `sudo` inside a user-privilege command: it must be refused as embedded escalation.
- Confirm hostile remote output cannot create a top-level status, error, or `next` command.

## 5. RC decision

An RC is eligible only after every automated and signed-local item passes on the exact candidate,
the two repository diffs are reviewed, contract fixtures match, signing/entitlements are verified,
and rollback to the previous verified Runtime succeeds. Installer replacement/restart behavior,
request-result projection, first-use sudo, and vault survival are release blockers.

Publishing still requires an explicit decision to lift the repository publication hold. Only then
may the release workflow create an immutable `-rc.N` tag and Draft GitHub Release; it must not move
stable `vX` or `vX.Y` aliases.
