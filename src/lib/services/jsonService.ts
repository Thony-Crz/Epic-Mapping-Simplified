import type { Card, ExampleMappingData } from '../types';

const VERSION = '1.0.0';

export function exportToJSON(cards: Card[]): string {
	const data: ExampleMappingData = {
		cards,
		version: VERSION
	};
	return JSON.stringify(data, null, 2);
}

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
				const cards = importFromJSON(text);
				resolve(cards);
			} catch (error) {
				reject(error);
			}
		};
		input.click();
	});
}
