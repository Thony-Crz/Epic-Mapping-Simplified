import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

const isProd = process.env.NODE_ENV === 'production';
const basePath = '/Epic-Mapping-Simplified';

export default defineConfig({
	plugins: [sveltekit()],
	base: isProd ? basePath : '/',
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom'
	}
});
