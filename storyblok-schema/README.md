# Storyblok content types

`components.json` defines the CMS structure this site expects:

- **page** (root) — `hero_heading` (text), `hero_subheading` (textarea), and a `body` field of nestable blocks (`auto-insights-section`, `elite-conquest-section`)
- **auto-insights-section** — `heading` (text), `body` (richtext) — Auto Insights product copy
- **elite-conquest-section** — `heading` (text), `body` (richtext) — Elite Conquest product copy
- **job-listing** — `title`, `location`, `employment_type`, `description` (richtext), `apply_url` — placeholder in case hiring content is needed later

## 1. Create a space

The Storyblok CLI cannot create spaces — do this once in the dashboard:

1. Go to [app.storyblok.com](https://app.storyblok.com) → **New space**.
2. In **Settings → API Keys**, note the **Space ID** and copy an access token (a **Preview** token for local dev, since it can read draft content; use the **Public** token in production).
3. Put the token in `.env` at the project root: `STORYBLOK_TOKEN=<token>`.

## 2. Push these content types into the space

Requires the [Storyblok CLI](https://github.com/storyblok/storyblok-cli) (`npx storyblok@latest ...`, v4+). Command syntax below matches that version — it changed from older `push-components`/`pull-components` docs you may find online.

```bash
npx storyblok login

# Stage the schema where the CLI expects it (path is <base>/components/<space-id>/*.json)
mkdir -p .storyblok/components/<SPACE_ID>
cp storyblok-schema/components.json .storyblok/components/<SPACE_ID>/components.json

npx storyblok components push --space <SPACE_ID>
```

`.storyblok/` is CLI staging data (gitignored) — re-copy the file there any time you want to re-push after editing `storyblok-schema/components.json`.

## 3. Create the expected stories

Once the components exist in the space, create these stories:

- `home` (type: `page`) — pulled into `src/pages/index.astro` (currently just `hero_heading`)
- `auto-insights` (type: `page`) — pulled into `src/pages/auto-insights.astro`
- `elite-conquest` (type: `page`) — pulled into `src/pages/elite-conquest.astro`
- `jobs/*` (type: `job-listing`) — surfaced as a small "We're hiring" section on `src/pages/about.astro` when any exist

Until these stories exist, the corresponding pages render the placeholder copy in the templates instead of failing the build.
