<script lang="ts">
	import Card from './Card.svelte';
	import type { Card as CardType, CardType as CardTypeEnum } from '../types';
	import { cardsStore } from '../stores/cards';

	let cards = $state<CardType[]>([]);
	let draggedCard: CardType | null = $state(null);
	let dragOffset = $state({ x: 0, y: 0 });
	let gridElement: HTMLElement;
	let linkMode = $state(false);
	let linkSource: CardType | null = $state(null);

	cardsStore.subscribe(value => {
		cards = value;
	});

	interface Props {
		newCardType: CardTypeEnum | null;
		onCardCreated: () => void;
		linkModeEnabled: boolean;
	}

	let { newCardType, onCardCreated, linkModeEnabled }: Props = $props();

	$effect(() => {
		linkMode = linkModeEnabled;
		if (!linkMode) {
			linkSource = null;
		}
	});

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
		if (linkMode) return; // Don't drag in link mode
		
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

	function handleCardClick(card: CardType) {
		if (!linkMode) return;
		
		if (!linkSource) {
			// First click - select source (child)
			linkSource = card;
		} else {
			// Second click - link to parent
			const child = linkSource;
			const parent = card;
			
			// Validate the link
			if (child.id === parent.id) {
				alert('Cannot link a card to itself');
				linkSource = null;
				return;
			}
			
			// Validate hierarchy rules
			if (child.type === 'epic') {
				alert('Epic cards cannot have parents');
				linkSource = null;
				return;
			}
			
			if (child.type === 'rule' && parent.type !== 'epic') {
				alert('Rules can only be linked to Epics');
				linkSource = null;
				return;
			}
			
			if ((child.type === 'example' || child.type === 'question') && parent.type !== 'rule') {
				alert('Examples and Questions can only be linked to Rules');
				linkSource = null;
				return;
			}
			
			// Check for circular reference - build parent map for O(1) lookup
			const parentMap = new Map<string, string>();
			cards.forEach(c => {
				if (c.parentId) {
					parentMap.set(c.id, c.parentId);
				}
			});
			
			let currentId: string | undefined = parent.id;
			while (currentId) {
				if (currentId === child.id) {
					alert('Cannot create circular reference');
					linkSource = null;
					return;
				}
				currentId = parentMap.get(currentId);
			}
			
			// Perform the link
			cardsStore.linkCard(child.id, parent.id);
			linkSource = null;
		}
	}
</script>

<div class="grid" bind:this={gridElement}>
	{#if linkMode && linkSource}
		<div class="link-indicator">
			Linking: {linkSource.type} "{linkSource.content.substring(0, 30)}..." → Click parent card
		</div>
	{/if}
	
	{#each cards as card (card.id)}
		<Card 
			{card} 
			onDragStart={handleDragStart} 
			onCardClick={handleCardClick}
			allCards={cards}
		/>
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

	.link-indicator {
		position: fixed;
		top: 80px;
		left: 50%;
		transform: translateX(-50%);
		background: #f59e0b;
		color: white;
		padding: 12px 24px;
		border-radius: 8px;
		font-weight: bold;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		z-index: 999;
	}
</style>
