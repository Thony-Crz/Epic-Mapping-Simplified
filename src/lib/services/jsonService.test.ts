import { describe, it, expect } from 'vitest';
import { exportToJSON, importFromJSON, exportToNestedJSON, importFromNestedJSON } from './jsonService';
import type { Card } from '../types';

describe('jsonService', () => {
	const sampleCards: Card[] = [
		{ id: '1', type: 'epic', content: 'Epic 1', position: { x: 0, y: 0 } },
		{ id: '2', type: 'rule', content: 'Rule 1', position: { x: 100, y: 100 } },
		{ id: '3', type: 'example', content: 'Example 1', position: { x: 200, y: 200 } },
		{ id: '4', type: 'question', content: 'Question 1', position: { x: 300, y: 300 } }
	];

	describe('exportToJSON (legacy)', () => {
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

	describe('importFromJSON (legacy)', () => {
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

	describe('exportToNestedJSON', () => {
		it('should export hierarchical structure', () => {
			const hierarchicalCards: Card[] = [
				{ id: 'epic-1', type: 'epic', content: 'Epic A', position: { x: 0, y: 0 } },
				{ id: 'rule-1', type: 'rule', content: 'Rule 1', position: { x: 100, y: 0 }, parentId: 'epic-1' },
				{ id: 'rule-2', type: 'rule', content: 'Rule 2', position: { x: 100, y: 150 }, parentId: 'epic-1' },
				{ id: 'ex-1', type: 'example', content: 'Example 1', position: { x: 200, y: 0 }, parentId: 'rule-1' },
				{ id: 'ex-2', type: 'example', content: 'Example 2', position: { x: 200, y: 50 }, parentId: 'rule-1' },
				{ id: 'q-1', type: 'question', content: 'Question 1', position: { x: 300, y: 0 }, parentId: 'rule-1' },
				{ id: 'q-2', type: 'question', content: 'Question 2', position: { x: 300, y: 150 }, parentId: 'rule-2' },
				{ id: 'q-3', type: 'question', content: 'Question 3', position: { x: 300, y: 200 }, parentId: 'rule-2' },
				{ id: 'q-4', type: 'question', content: 'Question 4', position: { x: 300, y: 250 }, parentId: 'rule-2' }
			];

			const json = exportToNestedJSON(hierarchicalCards);
			const parsed = JSON.parse(json);

			expect(parsed.version).toBe('2.0.0');
			expect(parsed.epics).toHaveLength(1);
			
			const epic = parsed.epics[0];
			expect(epic.id).toBe('epic-1');
			expect(epic.title).toBe('Epic A');
			expect(epic.rules).toHaveLength(2);
			
			const rule1 = epic.rules[0];
			expect(rule1.id).toBe('rule-1');
			expect(rule1.title).toBe('Rule 1');
			expect(rule1.examples).toHaveLength(2);
			expect(rule1.questions).toHaveLength(1);
			
			const rule2 = epic.rules[1];
			expect(rule2.id).toBe('rule-2');
			expect(rule2.examples).toHaveLength(0);
			expect(rule2.questions).toHaveLength(3);
		});

		it('should handle empty structure', () => {
			const json = exportToNestedJSON([]);
			const parsed = JSON.parse(json);

			expect(parsed.epics).toEqual([]);
		});

		it('should handle epic without rules', () => {
			const cards: Card[] = [
				{ id: 'epic-1', type: 'epic', content: 'Epic A', position: { x: 0, y: 0 } }
			];

			const json = exportToNestedJSON(cards);
			const parsed = JSON.parse(json);

			expect(parsed.epics).toHaveLength(1);
			expect(parsed.epics[0].rules).toEqual([]);
		});

		it('should handle rule without examples and questions', () => {
			const cards: Card[] = [
				{ id: 'epic-1', type: 'epic', content: 'Epic A', position: { x: 0, y: 0 } },
				{ id: 'rule-1', type: 'rule', content: 'Rule 1', position: { x: 100, y: 0 }, parentId: 'epic-1' }
			];

			const json = exportToNestedJSON(cards);
			const parsed = JSON.parse(json);

			expect(parsed.epics[0].rules).toHaveLength(1);
			expect(parsed.epics[0].rules[0].examples).toEqual([]);
			expect(parsed.epics[0].rules[0].questions).toEqual([]);
		});
	});

	describe('importFromNestedJSON', () => {
		it('should import valid nested structure', () => {
			const nestedJSON = JSON.stringify({
				version: '2.0.0',
				epics: [
					{
						id: 'epic-uuid',
						title: 'Epic A',
						rules: [
							{
								id: 'rule-uuid',
								title: 'Rule 1',
								examples: [
									{ id: 'ex-uuid-1', text: 'Example 1' },
									{ id: 'ex-uuid-2', text: 'Example 2' }
								],
								questions: [
									{ id: 'q-uuid', text: 'Question 1' }
								]
							}
						]
					}
				]
			}, null, 2);

			const result = importFromNestedJSON(nestedJSON);

			expect(result.success).toBe(true);
			expect(result.cards).toBeDefined();
			expect(result.cards).toHaveLength(5); // 1 epic + 1 rule + 2 examples + 1 question

			const cards = result.cards!;
			const epic = cards.find(c => c.type === 'epic');
			const rule = cards.find(c => c.type === 'rule');
			const examples = cards.filter(c => c.type === 'example');
			const questions = cards.filter(c => c.type === 'question');

			expect(epic?.id).toBe('epic-uuid');
			expect(epic?.content).toBe('Epic A');
			
			expect(rule?.id).toBe('rule-uuid');
			expect(rule?.parentId).toBe('epic-uuid');
			
			expect(examples).toHaveLength(2);
			expect(examples[0].parentId).toBe('rule-uuid');
			expect(examples[1].parentId).toBe('rule-uuid');
			
			expect(questions).toHaveLength(1);
			expect(questions[0].parentId).toBe('rule-uuid');
		});

		it('should handle acceptance criteria test case', () => {
			// 1 epic, 2 rules, Rule A: 2 examples + 1 question, Rule B: 0 examples + 3 questions
			const nestedJSON = JSON.stringify({
				version: '2.0.0',
				epics: [
					{
						id: 'epic-1',
						title: 'Test Epic',
						rules: [
							{
								id: 'rule-a',
								title: 'Rule A',
								examples: [
									{ id: 'ex-1', text: 'Example 1' },
									{ id: 'ex-2', text: 'Example 2' }
								],
								questions: [
									{ id: 'q-1', text: 'Question 1' }
								]
							},
							{
								id: 'rule-b',
								title: 'Rule B',
								examples: [],
								questions: [
									{ id: 'q-2', text: 'Question 2' },
									{ id: 'q-3', text: 'Question 3' },
									{ id: 'q-4', text: 'Question 4' }
								]
							}
						]
					}
				]
			}, null, 2);

			const result = importFromNestedJSON(nestedJSON);

			expect(result.success).toBe(true);
			expect(result.cards).toHaveLength(9); // 1 epic + 2 rules + 2 examples + 4 questions

			const cards = result.cards!;
			const ruleA = cards.find(c => c.id === 'rule-a');
			const ruleB = cards.find(c => c.id === 'rule-b');
			
			const ruleAExamples = cards.filter(c => c.parentId === 'rule-a' && c.type === 'example');
			const ruleAQuestions = cards.filter(c => c.parentId === 'rule-a' && c.type === 'question');
			const ruleBExamples = cards.filter(c => c.parentId === 'rule-b' && c.type === 'example');
			const ruleBQuestions = cards.filter(c => c.parentId === 'rule-b' && c.type === 'question');

			expect(ruleAExamples).toHaveLength(2);
			expect(ruleAQuestions).toHaveLength(1);
			expect(ruleBExamples).toHaveLength(0);
			expect(ruleBQuestions).toHaveLength(3);
		});

		it('should reject invalid JSON', () => {
			const result = importFromNestedJSON('invalid json');

			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors![0].type).toBe('invalid_format');
		});

		it('should reject JSON without epics array', () => {
			const result = importFromNestedJSON(JSON.stringify({ version: '2.0.0' }));

			expect(result.success).toBe(false);
			expect(result.errors![0].message).toContain('epics must be an array');
		});

		it('should reject epic with missing ID', () => {
			const nestedJSON = JSON.stringify({
				version: '2.0.0',
				epics: [
					{
						title: 'Epic without ID',
						rules: []
					}
				]
			});

			const result = importFromNestedJSON(nestedJSON);

			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors!.some(e => e.type === 'missing_id')).toBe(true);
		});

		it('should reject epic with duplicate ID', () => {
			const nestedJSON = JSON.stringify({
				version: '2.0.0',
				epics: [
					{
						id: 'duplicate-id',
						title: 'Epic 1',
						rules: [
							{
								id: 'duplicate-id',
								title: 'Rule with same ID',
								examples: [],
								questions: []
							}
						]
					}
				]
			});

			const result = importFromNestedJSON(nestedJSON);

			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors!.some(e => e.type === 'duplicate_id')).toBe(true);
		});

		it('should reject rule with missing ID', () => {
			const nestedJSON = JSON.stringify({
				version: '2.0.0',
				epics: [
					{
						id: 'epic-1',
						title: 'Epic 1',
						rules: [
							{
								title: 'Rule without ID',
								examples: [],
								questions: []
							}
						]
					}
				]
			});

			const result = importFromNestedJSON(nestedJSON);

			expect(result.success).toBe(false);
			expect(result.errors!.some(e => e.type === 'missing_id')).toBe(true);
		});

		it('should handle empty epics array', () => {
			const nestedJSON = JSON.stringify({
				version: '2.0.0',
				epics: []
			});

			const result = importFromNestedJSON(nestedJSON);

			expect(result.success).toBe(true);
			expect(result.cards).toEqual([]);
		});

		it('should round-trip nested export and import', () => {
			const originalCards: Card[] = [
				{ id: 'epic-1', type: 'epic', content: 'Epic A', position: { x: 0, y: 0 } },
				{ id: 'rule-1', type: 'rule', content: 'Rule 1', position: { x: 100, y: 0 }, parentId: 'epic-1' },
				{ id: 'ex-1', type: 'example', content: 'Example 1', position: { x: 200, y: 0 }, parentId: 'rule-1' },
				{ id: 'q-1', type: 'question', content: 'Question 1', position: { x: 300, y: 0 }, parentId: 'rule-1' }
			];

			const exported = exportToNestedJSON(originalCards);
			const result = importFromNestedJSON(exported);

			expect(result.success).toBe(true);
			expect(result.cards).toHaveLength(4);
			
			const cards = result.cards!;
			
			// Check all IDs are preserved
			expect(cards.find(c => c.id === 'epic-1')).toBeDefined();
			expect(cards.find(c => c.id === 'rule-1')).toBeDefined();
			expect(cards.find(c => c.id === 'ex-1')).toBeDefined();
			expect(cards.find(c => c.id === 'q-1')).toBeDefined();
			
			// Check content is preserved
			expect(cards.find(c => c.id === 'epic-1')?.content).toBe('Epic A');
			expect(cards.find(c => c.id === 'rule-1')?.content).toBe('Rule 1');
			
			// Check hierarchy is preserved
			expect(cards.find(c => c.id === 'rule-1')?.parentId).toBe('epic-1');
			expect(cards.find(c => c.id === 'ex-1')?.parentId).toBe('rule-1');
			expect(cards.find(c => c.id === 'q-1')?.parentId).toBe('rule-1');
		});
	});
});
