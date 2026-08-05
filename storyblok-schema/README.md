# Storyblok content types

`components.json` defines the CMS structure this site expects:

- **page** (root) — a `body` field of nestable blocks (`auto-insights-section`, `elite-conquest-section`)
- **auto-insights-section** — `heading` (text), `body` (richtext) — Auto Insights product copy
- **elite-conquest-section** — `heading` (text), `body` (richtext) — Elite Conquest product copy
- **job-listing** — `title`, `location`, `employment_type`, `description` (richtext), `apply_url` — placeholder in case hiring content is needed later

## Pushing to Storyblok

Requires the [Storyblok CLI](https://github.com/storyblok/storyblok-cli) and a management OAuth token.

```bash
npx storyblok login
npx storyblok push-components storyblok-schema/components.json --space <your-space-id>
```

## Expected stories

Create these stories once components exist:

- `auto-insights` (type: `page`) — pull into `src/pages/auto-insights.astro`
- `elite-conquest` (type: `page`) — pulled into `src/pages/elite-conquest.astro`
- `jobs/*` (type: `job-listing`) — surfaced as a small "We're hiring" section on `src/pages/about.astro` when any exist

Until these stories exist, the corresponding pages render the placeholder copy in the templates instead of failing the build.
