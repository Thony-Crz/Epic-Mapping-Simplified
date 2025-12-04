import { writable } from 'svelte/store';
import type { Card } from '../types';

function createCardsStore() {
	const { subscribe, set, update } = writable<Card[]>([]);

	return {
		subscribe,
		addCard: (card: Card) => update(cards => [...cards, card]),
		updateCard: (id: string, updates: Partial<Card>) => 
			update(cards => cards.map(card => 
				card.id === id ? { ...card, ...updates } : card
			)),
		deleteCard: (id: string) => 
			update(cards => {
				// When deleting a card, also delete its children
				const cardToDelete = cards.find(c => c.id === id);
				if (!cardToDelete) return cards;
				
				const idsToDelete = new Set([id]);
				
				// If it's an epic, delete all its rules and their children
				if (cardToDelete.type === 'epic') {
					const rules = cards.filter(c => c.parentId === id);
					rules.forEach(rule => {
						idsToDelete.add(rule.id);
						// Delete examples and questions of this rule
						cards.filter(c => c.parentId === rule.id).forEach(child => {
							idsToDelete.add(child.id);
						});
					});
				}
				// If it's a rule, delete all its examples and questions
				else if (cardToDelete.type === 'rule') {
					cards.filter(c => c.parentId === id).forEach(child => {
						idsToDelete.add(child.id);
					});
				}
				
				return cards.filter(card => !idsToDelete.has(card.id));
			}),
		linkCard: (childId: string, parentId: string) =>
			update(cards => cards.map(card =>
				card.id === childId ? { ...card, parentId } : card
			)),
		unlinkCard: (childId: string) =>
			update(cards => cards.map(card =>
				card.id === childId ? { ...card, parentId: undefined } : card
			)),
		setCards: (cards: Card[]) => set(cards),
		reset: () => set([])
	};
}

export const cardsStore = createCardsStore();
