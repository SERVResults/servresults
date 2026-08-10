# SERV Results — Marketing Website

Marketing site for [SERV Results](https://servresults.com), a B2B digital marketing platform for car dealerships. Built with [Astro](https://astro.build) (static output) and [Storyblok](https://www.storyblok.com) for CMS-managed content.

## Project structure

```text
/
├── public/                  static assets (favicons, images)
├── storyblok-schema/        pushable Storyblok content-type definitions (see its README)
├── src/
│   ├── components/          Nav, Footer, ContactForm
│   ├── layouts/             BaseLayout.astro (nav + footer + global styles)
│   ├── lib/                 storyblok.ts (fetch helpers), submitContactForm.ts (form submission)
│   ├── pages/                index, auto-insights, elite-conquest, about, contact
│   ├── storyblok/            components registered with @storyblok/astro (Page, sections, JobListing)
│   └── styles/global.css    global styles, CSS variables for brand colors/fonts
├── astro.config.mjs
└── .env.example
```

## Setup

```bash
npm install
cp .env.example .env   # fill in STORYBLOK_TOKEN
```

## Development

```bash
npm run dev
```

Runs at `http://localhost:4321` (or `https://localhost:4321` if a local cert is set up — see below). In dev, Storyblok content is fetched with `version: draft`; in production builds it uses `published`.

### Local HTTPS (for Storyblok's Visual Editor preview)

Storyblok's Visual Editor iframe refuses `http://` preview URLs. To preview with it locally:

```bash
# Download mkcert (Windows) — or use choco/scoop if you have them
mkdir .tools
curl -L -o .tools/mkcert.exe https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-v1.4.4-windows-amd64.exe

.tools/mkcert.exe -install
.tools/mkcert.exe -cert-file .tools/localhost-cert.pem -key-file .tools/localhost-key.pem localhost 127.0.0.1 ::1
```

`astro.config.mjs` picks up `.tools/localhost-{cert,key}.pem` automatically if present and serves the dev server over HTTPS; without them it falls back to plain HTTP. `.tools/` is gitignored (it holds a private key) — each developer generates their own.

In Storyblok, set the space's Visual Editor preview URL (Settings → Visual Editor) to `https://localhost:4321/`.

## Build

```bash
npm run build
npm run preview   # preview the production build locally
```

Output is static HTML in `./dist`.

## Content (Storyblok)

Auto Insights and Elite Conquest body copy, plus job listings, are managed in Storyblok. Content types are defined in [`storyblok-schema/components.json`](./storyblok-schema/components.json) — see [`storyblok-schema/README.md`](./storyblok-schema/README.md) for how to push them to a Storyblok space and which stories to create (`auto-insights`, `elite-conquest`, `jobs/*`).

Until those stories exist in Storyblok, the corresponding pages render clearly-marked placeholder copy (e.g. `[AUTO INSIGHTS COPY PENDING]`) instead of failing the build.

## Contact form

The `/contact` page offers two options: an embedded Microsoft Bookings widget for scheduling a demo directly, and a quick-message form (`src/components/ContactForm.astro`, name/email/dealership name/message). The form posts through `submitContactForm` in `src/lib/submitContactForm.ts` to a standalone Lambda function (`functions/contact-form`) that sends the email via Amazon SES, authenticated via the function's own IAM role — no API key involved. See `functions/contact-form/README.md` to deploy it.

## Deployment (AWS Amplify Hosting)

This repo uses Astro's standard static build (`output: 'static'`), which Amplify's default Astro build settings support out of the box:

1. Connect this git repository in the Amplify console.
2. Amplify auto-detects Astro; confirm build settings: build command `npm run build`, output directory `dist`.
3. Add environment variables in the Amplify app settings (App settings → Environment variables): `STORYBLOK_TOKEN` and `PUBLIC_CONTACT_FUNCTION_URL` (see `functions/contact-form/README.md` for deploying that function and getting its URL).
4. Push to the connected branch to trigger a deploy.

**Rollout plan (per client decision):** the current live site (servresults.com, on Wix) stays up during the rebuild. Point a subdomain (e.g. `new.servresults.com`) at this Amplify app first for client review; only cut the apex domain over from Wix to Amplify after approval.

## Brand

Colors and fonts are placeholders (`src/styles/global.css` — dark navy/charcoal neutral palette + one accent color) pending brand assets from the client. Reference sites for visual direction are also pending.
