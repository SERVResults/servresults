// @ts-check
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
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

// https://astro.build/config
export default defineConfig({
	output: 'static',
	vite: {
		server: httpsConfig ? { https: httpsConfig } : undefined,
	},
	integrations: [
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
		}),
	],
});
