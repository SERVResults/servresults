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

Runs at `http://localhost:4321`. In dev, Storyblok content is fetched with `version: draft`; in production builds it uses `published`.

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

The contact/demo form (`src/components/ContactForm.astro`) collects name, email, dealership name, and message. Submission goes through a single function, `submitContactForm` in `src/lib/submitContactForm.ts` — swap its implementation for whichever provider is chosen (Resend, Formspree, or EmailJS) without touching the form markup.

## Deployment (AWS Amplify Hosting)

This repo uses Astro's standard static build (`output: 'static'`), which Amplify's default Astro build settings support out of the box:

1. Connect this git repository in the Amplify console.
2. Amplify auto-detects Astro; confirm build settings: build command `npm run build`, output directory `dist`.
3. Add environment variables in the Amplify app settings (App settings → Environment variables): `STORYBLOK_TOKEN`, plus whichever email-provider variable is chosen once the contact form is wired up.
4. Push to the connected branch to trigger a deploy.

## Brand

Colors and fonts are placeholders (`src/styles/global.css` — dark navy/charcoal neutral palette + one accent color) pending brand assets from the client. Reference sites for visual direction are also pending.
