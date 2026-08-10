// @ts-check
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const { STORYBLOK_TOKEN } = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

// Local HTTPS cert for Storyblok's Visual Editor preview iframe (requires https://).
// Generate with mkcert — see storyblok-schema/README.md. Dev server falls back to
// plain http if these aren't present, so this is optional for local development.
const certPath = fileURLToPath(new URL('./.tools/localhost-cert.pem', import.meta.url));
const keyPath = fileURLToPath(new URL('./.tools/localhost-key.pem', import.meta.url));
const httpsConfig =
	existsSync(certPath) && existsSync(keyPath)
		? { cert: readFileSync(certPath), key: readFileSync(keyPath) }
		: undefined;

// The production domain, used for the sitemap, canonical link tags, and
// Open Graph URLs.
const SITE = 'https://servresults.com';

// The Storyblok bridge (click-to-edit, live-reload on publish) only ever
// does anything when the site is opened through the Visual Editor, which
// points at the local dev server (see storyblok-schema/README.md — the
// deployed static build can't serve draft content anyway). Keep it out of
// the production bundle so real visitors aren't downloading and running an
// editor script that can never do anything for them.
// (Checked via argv rather than defineConfig's `command` callback — the
// function form of defineConfig breaks this project's local HTTPS dev
// server setup, so this stays a plain object.)
const isDev = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
	site: SITE,
	output: 'static',
	vite: {
		server: httpsConfig ? { https: httpsConfig } : undefined,
	},
	integrations: [
		sitemap({
			filter: (page) => !page.includes('/404'),
		}),
		storyblok({
			accessToken: STORYBLOK_TOKEN ?? '',
			components: {
				page: 'storyblok/Page',
				'auto-insights-section': 'storyblok/AutoInsightsSection',
				'elite-conquest-section': 'storyblok/EliteConquestSection',
				'job-listing': 'storyblok/JobListing',
			},
			apiOptions: {
				region: 'eu',
			},
			enableFallbackComponent: true,
			bridge: isDev,
		}),
	],
});
