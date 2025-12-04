import type { Card, ExampleMappingData, NestedExampleMappingData, Epic, Rule, Example, Question } from '../types';

const VERSION = '1.0.0';
const NESTED_VERSION = '2.0.0';

// Legacy export (flat structure)
export function exportToJSON(cards: Card[]): string {
	const data: ExampleMappingData = {
		cards,
		version: VERSION
	};
	return JSON.stringify(data, null, 2);
}

// New nested export
export function exportToNestedJSON(cards: Card[]): string {
	const epics: Epic[] = [];
	
	// Get all epic cards
	const epicCards = cards.filter(c => c.type === 'epic');
	
	epicCards.forEach(epicCard => {
		const rules: Rule[] = [];
		
		// Get all rules for this epic
		const ruleCards = cards.filter(c => c.type === 'rule' && c.parentId === epicCard.id);
		
		ruleCards.forEach(ruleCard => {
			const examples: Example[] = cards
				.filter(c => c.type === 'example' && c.parentId === ruleCard.id)
				.map(c => ({ id: c.id, text: c.content }));
			
			const questions: Question[] = cards
				.filter(c => c.type === 'question' && c.parentId === ruleCard.id)
				.map(c => ({ id: c.id, text: c.content }));
			
			rules.push({
				id: ruleCard.id,
				title: ruleCard.content,
				examples,
				questions
			});
		});
		
		epics.push({
			id: epicCard.id,
			title: epicCard.content,
			rules
		});
	});
	
	const data: NestedExampleMappingData = {
		epics,
		version: NESTED_VERSION
	};
	
	return JSON.stringify(data, null, 2);
}

// Legacy import (flat structure)
export function importFromJSON(jsonString: string): Card[] {
	try {
		const data: ExampleMappingData = JSON.parse(jsonString);
		if (!Array.isArray(data.cards)) {
			throw new Error('Invalid JSON format: cards must be an array');
		}
		return data.cards;
	} catch (error) {
		throw new Error(`Failed to import JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

export interface ImportValidationError {
	type: 'missing_id' | 'invalid_format' | 'duplicate_id' | 'invalid_hierarchy';
	message: string;
	details?: string;
}

export interface ImportResult {
	success: boolean;
	cards?: Card[];
	errors?: ImportValidationError[];
}

// New nested import with validation
export function importFromNestedJSON(jsonString: string): ImportResult {
	const errors: ImportValidationError[] = [];
	
	try {
		const data = JSON.parse(jsonString);
		
		// Check if it's the nested format
		if (!data.epics || !Array.isArray(data.epics)) {
			return {
				success: false,
				errors: [{
					type: 'invalid_format',
					message: 'Invalid JSON format: epics must be an array',
					details: 'Expected a "epics" array in the root of the JSON'
				}]
			};
		}
		
		const cards: Card[] = [];
		const seenIds = new Set<string>();
		
		// Validate and convert nested structure to flat cards
		data.epics.forEach((epic: Epic, epicIndex: number) => {
			// Validate epic
			if (!epic.id || typeof epic.id !== 'string') {
				errors.push({
					type: 'missing_id',
					message: `Epic at index ${epicIndex} is missing a valid ID`,
					details: JSON.stringify(epic)
				});
				return;
			}
			
			if (seenIds.has(epic.id)) {
				errors.push({
					type: 'duplicate_id',
					message: `Duplicate ID found: ${epic.id}`,
					details: 'IDs must be unique across all entities'
				});
				return;
			}
			seenIds.add(epic.id);
			
			if (!epic.title || typeof epic.title !== 'string') {
				errors.push({
					type: 'invalid_format',
					message: `Epic ${epic.id} is missing a valid title`,
					details: JSON.stringify(epic)
				});
				return;
			}
			
			// Create epic card
			cards.push({
				id: epic.id,
				type: 'epic',
				content: epic.title,
				position: { x: 100, y: 100 + epicIndex * 300 }
			});
			
			// Validate and process rules
			if (!Array.isArray(epic.rules)) {
				errors.push({
					type: 'invalid_format',
					message: `Epic ${epic.id} has invalid rules (must be an array)`,
					details: JSON.stringify(epic)
				});
				return;
			}
			
			epic.rules.forEach((rule: Rule, ruleIndex: number) => {
				if (!rule.id || typeof rule.id !== 'string') {
					errors.push({
						type: 'missing_id',
						message: `Rule at index ${ruleIndex} in epic ${epic.id} is missing a valid ID`,
						details: JSON.stringify(rule)
					});
					return;
				}
				
				if (seenIds.has(rule.id)) {
					errors.push({
						type: 'duplicate_id',
						message: `Duplicate ID found: ${rule.id}`,
						details: 'IDs must be unique across all entities'
					});
					return;
				}
				seenIds.add(rule.id);
				
				if (!rule.title || typeof rule.title !== 'string') {
					errors.push({
						type: 'invalid_format',
						message: `Rule ${rule.id} is missing a valid title`,
						details: JSON.stringify(rule)
					});
					return;
				}
				
				// Create rule card
				cards.push({
					id: rule.id,
					type: 'rule',
					content: rule.title,
					position: { x: 350, y: 100 + epicIndex * 300 + ruleIndex * 150 },
					parentId: epic.id
				});
				
				// Validate and process examples
				if (!Array.isArray(rule.examples)) {
					errors.push({
						type: 'invalid_format',
						message: `Rule ${rule.id} has invalid examples (must be an array)`,
						details: JSON.stringify(rule)
					});
					return;
				}
				
				rule.examples.forEach((example: Example, exampleIndex: number) => {
					if (!example.id || typeof example.id !== 'string') {
						errors.push({
							type: 'missing_id',
							message: `Example at index ${exampleIndex} in rule ${rule.id} is missing a valid ID`,
							details: JSON.stringify(example)
						});
						return;
					}
					
					if (seenIds.has(example.id)) {
						errors.push({
							type: 'duplicate_id',
							message: `Duplicate ID found: ${example.id}`,
							details: 'IDs must be unique across all entities'
						});
						return;
					}
					seenIds.add(example.id);
					
					if (!example.text || typeof example.text !== 'string') {
						errors.push({
							type: 'invalid_format',
							message: `Example ${example.id} is missing valid text`,
							details: JSON.stringify(example)
						});
						return;
					}
					
					cards.push({
						id: example.id,
						type: 'example',
						content: example.text,
						position: { x: 600, y: 100 + epicIndex * 300 + ruleIndex * 150 + exampleIndex * 60 },
						parentId: rule.id
					});
				});
				
				// Validate and process questions
				if (!Array.isArray(rule.questions)) {
					errors.push({
						type: 'invalid_format',
						message: `Rule ${rule.id} has invalid questions (must be an array)`,
						details: JSON.stringify(rule)
					});
					return;
				}
				
				rule.questions.forEach((question: Question, questionIndex: number) => {
					if (!question.id || typeof question.id !== 'string') {
						errors.push({
							type: 'missing_id',
							message: `Question at index ${questionIndex} in rule ${rule.id} is missing a valid ID`,
							details: JSON.stringify(question)
						});
						return;
					}
					
					if (seenIds.has(question.id)) {
						errors.push({
							type: 'duplicate_id',
							message: `Duplicate ID found: ${question.id}`,
							details: 'IDs must be unique across all entities'
						});
						return;
					}
					seenIds.add(question.id);
					
					if (!question.text || typeof question.text !== 'string') {
						errors.push({
							type: 'invalid_format',
							message: `Question ${question.id} is missing valid text`,
							details: JSON.stringify(question)
						});
						return;
					}
					
					cards.push({
						id: question.id,
						type: 'question',
						content: question.text,
						position: { x: 850, y: 100 + epicIndex * 300 + ruleIndex * 150 + questionIndex * 60 },
						parentId: rule.id
					});
				});
			});
		});
		
		if (errors.length > 0) {
			return {
				success: false,
				errors
			};
		}
		
		return {
			success: true,
			cards
		};
	} catch (error) {
		return {
			success: false,
			errors: [{
				type: 'invalid_format',
				message: `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
				details: 'Ensure the JSON is properly formatted'
			}]
		};
	}
}

export function downloadJSON(cards: Card[], filename: string = 'example-mapping.json') {
	const json = exportToJSON(cards);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export function downloadNestedJSON(cards: Card[], filename: string = 'example-mapping-nested.json') {
	const json = exportToNestedJSON(cards);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export function uploadJSON(): Promise<Card[]> {
	return new Promise((resolve, reject) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) {
				reject(new Error('No file selected'));
				return;
			}
			try {
				const text = await file.text();
				
				// Try nested format first
				const nestedResult = importFromNestedJSON(text);
				if (nestedResult.success && nestedResult.cards) {
					resolve(nestedResult.cards);
					return;
				}
				
				// Fall back to legacy format
				try {
					const cards = importFromJSON(text);
					resolve(cards);
				} catch (legacyError) {
					// If both fail, show errors from nested import
					const errorMessages = nestedResult.errors?.map(e => e.message).join('\n') || 'Unknown error';
					reject(new Error(`Import failed:\n${errorMessages}`));
				}
			} catch (error) {
				reject(error);
			}
		};
		input.click();
	});
}
