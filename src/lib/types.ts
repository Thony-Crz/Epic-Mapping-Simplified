export type CardType = 'epic' | 'rule' | 'example' | 'question';

export interface Card {
	id: string;
	type: CardType;
	content: string;
	position: { x: number; y: number };
}

export interface ExampleMappingData {
	cards: Card[];
	version: string;
}
