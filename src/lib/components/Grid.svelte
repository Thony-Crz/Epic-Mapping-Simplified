<script lang="ts">
	import Card from './Card.svelte';
	import type { Card as CardType, CardType as CardTypeEnum } from '../types';
	import { cardsStore } from '../stores/cards';

	let cards = $state<CardType[]>([]);
	let draggedCard: CardType | null = $state(null);
	let dragOffset = $state({ x: 0, y: 0 });
	let gridElement: HTMLElement;

	cardsStore.subscribe(value => {
		cards = value;
	});

	interface Props {
		newCardType: CardTypeEnum | null;
		onCardCreated: () => void;
	}

	let { newCardType, onCardCreated }: Props = $props();

	$effect(() => {
		if (newCardType) {
			const newCard: CardType = {
				id: crypto.randomUUID(),
				type: newCardType,
				content: '',
				position: { x: 100, y: 150 }
			};
			cardsStore.addCard(newCard);
			onCardCreated();
		}
	});

	function handleDragStart(card: CardType, e: PointerEvent) {
		draggedCard = card;
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		dragOffset = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
		
		target.setPointerCapture(e.pointerId);
		
		target.addEventListener('pointermove', handlePointerMove);
		target.addEventListener('pointerup', handlePointerUp);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!draggedCard || !gridElement) return;
		
		const gridRect = gridElement.getBoundingClientRect();
		const newX = e.clientX - gridRect.left - dragOffset.x;
		const newY = e.clientY - gridRect.top - dragOffset.y;
		
		cardsStore.updateCard(draggedCard.id, {
			position: { x: newX, y: newY }
		});
	}

	function handlePointerUp(e: PointerEvent) {
		const target = e.currentTarget as HTMLElement;
		target.removeEventListener('pointermove', handlePointerMove);
		target.removeEventListener('pointerup', handlePointerUp);
		draggedCard = null;
	}
</script>

<div class="grid" bind:this={gridElement}>
	{#each cards as card (card.id)}
		<Card {card} onDragStart={handleDragStart} />
	{/each}
</div>

<style>
	.grid {
		position: relative;
		width: 100%;
		min-height: calc(100vh - 70px);
		margin-top: 70px;
		background: 
			linear-gradient(90deg, rgba(200, 200, 200, 0.1) 1px, transparent 1px),
			linear-gradient(rgba(200, 200, 200, 0.1) 1px, transparent 1px);
		background-size: 20px 20px;
	}
</style>
