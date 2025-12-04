import { describe, it, expect } from 'vitest';
import { exportToJSON, importFromJSON } from './jsonService';
import type { Card } from '../types';

describe('jsonService', () => {
	const sampleCards: Card[] = [
		{ id: '1', type: 'epic', content: 'Epic 1', position: { x: 0, y: 0 } },
		{ id: '2', type: 'rule', content: 'Rule 1', position: { x: 100, y: 100 } },
		{ id: '3', type: 'example', content: 'Example 1', position: { x: 200, y: 200 } },
		{ id: '4', type: 'question', content: 'Question 1', position: { x: 300, y: 300 } }
	];

	describe('exportToJSON', () => {
		it('should export cards to JSON string', () => {
			const json = exportToJSON(sampleCards);
			const parsed = JSON.parse(json);

			expect(parsed).toHaveProperty('cards');
			expect(parsed).toHaveProperty('version');
			expect(parsed.cards).toEqual(sampleCards);
			expect(parsed.version).toBe('1.0.0');
		});

		it('should produce valid JSON', () => {
			const json = exportToJSON(sampleCards);
			expect(() => JSON.parse(json)).not.toThrow();
		});
	});

	describe('importFromJSON', () => {
		it('should import cards from JSON string', () => {
			const json = exportToJSON(sampleCards);
			const imported = importFromJSON(json);

			expect(imported).toEqual(sampleCards);
		});

		it('should throw error for invalid JSON', () => {
			expect(() => importFromJSON('invalid json')).toThrow();
		});

		it('should throw error for JSON without cards array', () => {
			const invalidJSON = JSON.stringify({ version: '1.0.0' });
			expect(() => importFromJSON(invalidJSON)).toThrow('cards must be an array');
		});

		it('should handle empty cards array', () => {
			const json = exportToJSON([]);
			const imported = importFromJSON(json);

			expect(imported).toEqual([]);
		});
	});
});
