import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { cardsStore } from './cards';
import type { Card } from '../types';

describe('cardsStore', () => {
	beforeEach(() => {
		cardsStore.reset();
	});

	it('should initialize with an empty array', () => {
		const cards = get(cardsStore);
		expect(cards).toEqual([]);
	});

	it('should add a card', () => {
		const card: Card = {
			id: '1',
			type: 'epic',
			content: 'Test Epic',
			position: { x: 0, y: 0 }
		};

		cardsStore.addCard(card);
		const cards = get(cardsStore);

		expect(cards).toHaveLength(1);
		expect(cards[0]).toEqual(card);
	});

	it('should update a card', () => {
		const card: Card = {
			id: '1',
			type: 'epic',
			content: 'Test Epic',
			position: { x: 0, y: 0 }
		};

		cardsStore.addCard(card);
		cardsStore.updateCard('1', { content: 'Updated Epic' });

		const cards = get(cardsStore);
		expect(cards[0].content).toBe('Updated Epic');
	});

	it('should delete a card', () => {
		const card: Card = {
			id: '1',
			type: 'epic',
			content: 'Test Epic',
			position: { x: 0, y: 0 }
		};

		cardsStore.addCard(card);
		cardsStore.deleteCard('1');

		const cards = get(cardsStore);
		expect(cards).toHaveLength(0);
	});

	it('should set cards', () => {
		const cards: Card[] = [
			{ id: '1', type: 'epic', content: 'Epic 1', position: { x: 0, y: 0 } },
			{ id: '2', type: 'rule', content: 'Rule 1', position: { x: 100, y: 100 } }
		];

		cardsStore.setCards(cards);
		const storedCards = get(cardsStore);

		expect(storedCards).toEqual(cards);
	});

	it('should reset cards', () => {
		const card: Card = {
			id: '1',
			type: 'epic',
			content: 'Test Epic',
			position: { x: 0, y: 0 }
		};

		cardsStore.addCard(card);
		cardsStore.reset();

		const cards = get(cardsStore);
		expect(cards).toEqual([]);
	});
});
