#!/usr/bin/env python3

import copy
import json
import re
import sys
from pathlib import Path, PurePosixPath


class ValidationError(ValueError):
    pass


def fail(message: str) -> None:
    raise ValidationError(message)


def require_exact_keys(value: object, expected: set[str], label: str) -> dict:
    if not isinstance(value, dict):
        fail(f"{label} must be an object")
    if set(value) != expected:
        fail(f"{label} fields are incomplete or unexpected")
    return value


def validate(schema: object, manifest: object) -> None:
    if not isinstance(schema, dict):
        fail("schema must be an object")
    if schema.get("$id") != "https://safa.dev/contracts/source-preview-manifest-v1.schema.json":
        fail("unexpected schema identifier")

    manifest = require_exact_keys(
        manifest,
        {
            "schema",
            "runtime_version",
            "cli_schema",
            "platform",
            "architectures",
            "minimum_os_version",
            "minimum_xcode_version",
            "source",
            "installer",
        },
        "manifest",
    )
    if manifest.get("schema") != "dev.safa.source-preview-manifest/v1":
        fail("unexpected manifest schema")
    if manifest.get("cli_schema") != "dev.safa.cli/v2":
        fail("unexpected CLI schema")
    if manifest.get("platform") != "macos":
        fail("unexpected platform")
    if manifest.get("architectures") != ["arm64", "x86_64"]:
        fail("architectures must be the canonical macOS pair")

    semver = re.compile(r"^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$")
    numeric_version = re.compile(r"^[0-9]+(?:\.[0-9]+){1,2}$")
    if not semver.fullmatch(manifest.get("runtime_version", "")):
        fail("runtime_version is not stable SemVer")
    for field in ("minimum_os_version", "minimum_xcode_version"):
        if not numeric_version.fullmatch(manifest.get(field, "")):
            fail(f"{field} is invalid")

    source = require_exact_keys(
        manifest.get("source"),
        {"repository", "revision", "archive_url", "sha256", "archive_format", "root_directory"},
        "source",
    )
    repository = "https://github.com/juju-w/safa-runtime"
    if source.get("repository") != repository:
        fail("source repository is not trusted")
    revision = source.get("revision", "")
    if not re.fullmatch(r"[0-9a-f]{40}", revision):
        fail("source revision is invalid")
    if source.get("archive_url") != f"{repository}/archive/{revision}.tar.gz":
        fail("archive URL is not bound to the exact revision")
    if not re.fullmatch(r"[0-9a-f]{64}", source.get("sha256", "")):
        fail("source SHA-256 is invalid")
    if source.get("archive_format") != "tar.gz":
        fail("archive format is invalid")
    if source.get("root_directory") != f"safa-runtime-{revision}":
        fail("archive root is not bound to the exact revision")

    installer = require_exact_keys(manifest.get("installer"), {"path", "signing_kind"}, "installer")
    installer_path = installer.get("path", "")
    pure_installer = PurePosixPath(installer_path)
    if (
        installer_path != "Scripts/install-local-runtime.sh"
        or pure_installer.is_absolute()
        or ".." in pure_installer.parts
    ):
        fail("installer path is unsafe")
    if installer.get("signing_kind") != "local-apple-development":
        fail("unexpected signing kind")


def verify_negative_cases(schema: object, manifest: object) -> None:
    mutations = {
        "mutable archive URL": ("source", "archive_url", "https://github.com/juju-w/safa-runtime/archive/main.tar.gz"),
        "malformed revision": ("source", "revision", "main"),
        "malformed digest": ("source", "sha256", "0" * 63),
        "wrong archive root": ("source", "root_directory", "safa-runtime-main"),
        "wrong repository": ("source", "repository", "https://example.invalid/safa-runtime"),
        "unsupported architecture set": (None, "architectures", ["arm64"]),
        "unstable runtime version": (None, "runtime_version", "0.1"),
        "unsafe installer": ("installer", "path", "../install.sh"),
    }
    for label, (section, field, value) in mutations.items():
        candidate = copy.deepcopy(manifest)
        target = candidate if section is None else candidate[section]
        target[field] = value
        try:
            validate(schema, candidate)
        except ValidationError:
            continue
        fail(f"negative case was accepted: {label}")

    candidate = copy.deepcopy(manifest)
    del candidate["installer"]["signing_kind"]
    try:
        validate(schema, candidate)
    except ValidationError:
        return
    fail("negative case was accepted: missing installer data")


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: validate_source_preview.py <schema> <manifest>")

    schema = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    manifest = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
    try:
        validate(schema, manifest)
        verify_negative_cases(schema, manifest)
    except ValidationError as error:
        raise SystemExit(f"source preview validation failed: {error}") from error

    print(f"validated source preview {manifest['runtime_version']} at {manifest['source']['revision']}")


if __name__ == "__main__":
    main()
