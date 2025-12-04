export type CardType = 'epic' | 'rule' | 'example' | 'question';

export interface Card {
	id: string;
	type: CardType;
	content: string;
	position: { x: number; y: number };
	parentId?: string; // ID of the parent card (rule for examples/questions, epic for rules)
}

export interface ExampleMappingData {
	cards: Card[];
	version: string;
}

// Nested structure for export/import
export interface Example {
	id: string;
	text: string;
}

export interface Question {
	id: string;
	text: string;
}

export interface Rule {
	id: string;
	title: string;
	examples: Example[];
	questions: Question[];
}

export interface Epic {
	id: string;
	title: string;
	rules: Rule[];
}

export interface NestedExampleMappingData {
	epics: Epic[];
	version: string;
}
