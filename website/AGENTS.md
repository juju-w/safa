# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

## SAFA website decisions

- Use the selected Aurora Vault mock at `/Users/wangkuiju/.codex/generated_images/019fe9da-6b80-77a0-8d29-233568773b40/exec-0aa7523a-3165-4813-a34d-0925800ab228.png` as the visual target.
- Keep one large `SAFA` wordmark in the hero; do not add a giant S/A/F/A acronym breakdown.
- Do not include the Source Preview section in the marketing page.
- Center the page narrative on an interactive Agent conversation, exact user authorization, Touch ID, and continued read-only diagnosis.
- Provide English and Simplified Chinese UI, with English as the default.
- Use an in-page `How it works` destination until a real documentation site exists; do not publish a dead Docs link.
- Avoid lightning, wavy electric cables, excessive glow, and card-heavy dashboard composition.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
