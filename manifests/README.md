# Runtime manifests

The installed Skill currently carries
`skills/safa/manifests/source-preview-macos-v1.json`. It pins the exact public Runtime repository,
full commit, immutable source archive URL, SHA-256 digest, archive root, versions, platform,
architectures, toolchain floor, and local signing mode. The explicit local bootstrap consumes it;
skills.sh itself does not execute it.

This top-level directory will later contain immutable exact-version **binary** Runtime manifests
after verified releases exist. A binary manifest pins platform, architecture, Runtime version,
HTTPS asset URL, SHA-256 digest, archive format, CLI schema range, and platform signing identity.

No binary Runtime manifest is committed during the publication hold. Do not add placeholders,
mutable `latest` URLs, unsigned assets, local paths, or private credentials.

Schemas:

- [Source Preview manifest v1](../contracts/source-preview-manifest-v1.schema.json)
- [Verified binary Runtime manifest v1](../contracts/runtime-manifest-v1.schema.json)
