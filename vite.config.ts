import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
	plugins: [sveltekit()],
	base: isProd ? '/Epic-Mapping-Simplified/' : '/',
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom'
	}
});
