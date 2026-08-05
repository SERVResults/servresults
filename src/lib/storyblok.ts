import { useStoryblokApi } from '@storyblok/astro';
import type { ISbStoryData } from '@storyblok/astro';

/**
 * Fetches a Storyblok story by slug. Returns null on failure (e.g. slug not
 * yet created, missing token) so pages can fall back to placeholder copy
 * instead of failing the build.
 */
export async function getStory(slug: string): Promise<ISbStoryData | null> {
	try {
		const storyblokApi = useStoryblokApi();
		const { data } = await storyblokApi.get(`cdn/stories/${slug}`, {
			version: import.meta.env.DEV ? 'draft' : 'published',
		});
		return data?.story ?? null;
	} catch {
		return null;
	}
}

export async function getStories(startsWith: string): Promise<ISbStoryData[]> {
	try {
		const storyblokApi = useStoryblokApi();
		const { data } = await storyblokApi.get('cdn/stories', {
			starts_with: startsWith,
			version: import.meta.env.DEV ? 'draft' : 'published',
		});
		return data?.stories ?? [];
	} catch {
		return [];
	}
}
