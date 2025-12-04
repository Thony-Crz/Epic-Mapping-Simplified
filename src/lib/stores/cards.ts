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
			update(cards => cards.filter(card => card.id !== id)),
		setCards: (cards: Card[]) => set(cards),
		reset: () => set([])
	};
}

export const cardsStore = createCardsStore();
