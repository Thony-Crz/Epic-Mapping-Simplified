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

	it('should delete epic and all its children', () => {
		const epic: Card = { id: 'epic-1', type: 'epic', content: 'Epic 1', position: { x: 0, y: 0 } };
		const rule1: Card = { id: 'rule-1', type: 'rule', content: 'Rule 1', position: { x: 100, y: 0 }, parentId: 'epic-1' };
		const rule2: Card = { id: 'rule-2', type: 'rule', content: 'Rule 2', position: { x: 100, y: 100 }, parentId: 'epic-1' };
		const example1: Card = { id: 'ex-1', type: 'example', content: 'Example 1', position: { x: 200, y: 0 }, parentId: 'rule-1' };
		const question1: Card = { id: 'q-1', type: 'question', content: 'Question 1', position: { x: 300, y: 0 }, parentId: 'rule-1' };
		const question2: Card = { id: 'q-2', type: 'question', content: 'Question 2', position: { x: 300, y: 100 }, parentId: 'rule-2' };

		cardsStore.setCards([epic, rule1, rule2, example1, question1, question2]);
		cardsStore.deleteCard('epic-1');

		const cards = get(cardsStore);
		expect(cards).toHaveLength(0); // All cards should be deleted
	});

	it('should delete rule and all its children', () => {
		const epic: Card = { id: 'epic-1', type: 'epic', content: 'Epic 1', position: { x: 0, y: 0 } };
		const rule1: Card = { id: 'rule-1', type: 'rule', content: 'Rule 1', position: { x: 100, y: 0 }, parentId: 'epic-1' };
		const rule2: Card = { id: 'rule-2', type: 'rule', content: 'Rule 2', position: { x: 100, y: 100 }, parentId: 'epic-1' };
		const example1: Card = { id: 'ex-1', type: 'example', content: 'Example 1', position: { x: 200, y: 0 }, parentId: 'rule-1' };
		const question1: Card = { id: 'q-1', type: 'question', content: 'Question 1', position: { x: 300, y: 0 }, parentId: 'rule-1' };
		const question2: Card = { id: 'q-2', type: 'question', content: 'Question 2', position: { x: 300, y: 100 }, parentId: 'rule-2' };

		cardsStore.setCards([epic, rule1, rule2, example1, question1, question2]);
		cardsStore.deleteCard('rule-1');

		const cards = get(cardsStore);
		expect(cards).toHaveLength(3); // epic, rule2, and question2 should remain
		expect(cards.find(c => c.id === 'epic-1')).toBeDefined();
		expect(cards.find(c => c.id === 'rule-2')).toBeDefined();
		expect(cards.find(c => c.id === 'q-2')).toBeDefined();
		expect(cards.find(c => c.id === 'rule-1')).toBeUndefined();
		expect(cards.find(c => c.id === 'ex-1')).toBeUndefined();
		expect(cards.find(c => c.id === 'q-1')).toBeUndefined();
	});

	it('should link a card to a parent', () => {
		const rule: Card = { id: 'rule-1', type: 'rule', content: 'Rule 1', position: { x: 100, y: 0 } };
		const epic: Card = { id: 'epic-1', type: 'epic', content: 'Epic 1', position: { x: 0, y: 0 } };

		cardsStore.setCards([epic, rule]);
		cardsStore.linkCard('rule-1', 'epic-1');

		const cards = get(cardsStore);
		const linkedRule = cards.find(c => c.id === 'rule-1');
		expect(linkedRule?.parentId).toBe('epic-1');
	});

	it('should unlink a card from a parent', () => {
		const rule: Card = { id: 'rule-1', type: 'rule', content: 'Rule 1', position: { x: 100, y: 0 }, parentId: 'epic-1' };
		const epic: Card = { id: 'epic-1', type: 'epic', content: 'Epic 1', position: { x: 0, y: 0 } };

		cardsStore.setCards([epic, rule]);
		cardsStore.unlinkCard('rule-1');

		const cards = get(cardsStore);
		const unlinkedRule = cards.find(c => c.id === 'rule-1');
		expect(unlinkedRule?.parentId).toBeUndefined();
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
