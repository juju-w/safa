# Runtime manifests

This directory will contain immutable, exact-version runtime manifests after verified runtime
releases exist. A manifest pins platform, architecture, runtime version, HTTPS asset URL, SHA-256
digest, archive format, CLI schema range, and platform signing identity.

No runtime manifest is committed during the publication hold. Do not add placeholders, mutable
`latest` URLs, unsigned assets, local paths, or private credentials.

The schema is [`contracts/runtime-manifest-v1.schema.json`](../contracts/runtime-manifest-v1.schema.json).
