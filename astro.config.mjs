// @ts-check
import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';

const { STORYBLOK_TOKEN } = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
	output: 'static',
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
