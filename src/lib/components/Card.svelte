<script lang="ts">
	import type { Card as CardType } from '../types';
	import { cardsStore } from '../stores/cards';

	interface Props {
		card: CardType;
		onDragStart: (card: CardType, e: PointerEvent) => void;
	}

	let { card, onDragStart }: Props = $props();
	let isEditing = $state(false);
	let editContent = $state('');

	$effect(() => {
		editContent = card.content;
	});

	const cardColors: Record<CardType['type'], string> = {
		epic: 'bg-purple-200 border-purple-400',
		rule: 'bg-blue-200 border-blue-400',
		example: 'bg-green-200 border-green-400',
		question: 'bg-red-200 border-red-400'
	};

	function handlePointerDown(e: PointerEvent) {
		if (!isEditing) {
			onDragStart(card, e);
		}
	}

	function startEdit() {
		isEditing = true;
		editContent = card.content;
	}

	function saveEdit() {
		cardsStore.updateCard(card.id, { content: editContent });
		isEditing = false;
	}

	function cancelEdit() {
		editContent = card.content;
		isEditing = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			saveEdit();
		} else if (e.key === 'Escape') {
			cancelEdit();
		}
	}

	function deleteCard() {
		cardsStore.deleteCard(card.id);
	}
</script>

<div
	class="card {cardColors[card.type]}"
	style="position: absolute; left: {card.position.x}px; top: {card.position.y}px;"
	onpointerdown={handlePointerDown}
	role="button"
	tabindex="0"
>
	<div class="card-header">
		<span class="card-type">{card.type.toUpperCase()}</span>
		<button class="delete-btn" onclick={deleteCard} title="Delete">×</button>
	</div>
	
	{#if isEditing}
		<textarea
			bind:value={editContent}
			onkeydown={handleKeyDown}
			onblur={saveEdit}
			class="card-input"
		></textarea>
	{:else}
		<div class="card-content" ondblclick={startEdit} role="button" tabindex="0">
			{card.content || 'Double-click to edit'}
		</div>
	{/if}
</div>

<style>
	.card {
		width: 200px;
		min-height: 120px;
		border: 2px solid;
		border-radius: 8px;
		padding: 8px;
		cursor: move;
		user-select: none;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.card:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.card-type {
		font-size: 10px;
		font-weight: bold;
		opacity: 0.7;
	}

	.delete-btn {
		background: rgba(0, 0, 0, 0.1);
		border: none;
		border-radius: 4px;
		width: 24px;
		height: 24px;
		cursor: pointer;
		font-size: 18px;
		line-height: 1;
		padding: 0;
	}

	.delete-btn:hover {
		background: rgba(0, 0, 0, 0.2);
	}

	.card-content {
		min-height: 80px;
		white-space: pre-wrap;
		word-wrap: break-word;
		padding: 4px;
	}

	.card-input {
		width: 100%;
		min-height: 80px;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 4px;
		resize: vertical;
		font-family: inherit;
	}

	.bg-purple-200 { background-color: #e9d5ff; }
	.border-purple-400 { border-color: #a855f7; }
	
	.bg-blue-200 { background-color: #bfdbfe; }
	.border-blue-400 { border-color: #60a5fa; }
	
	.bg-green-200 { background-color: #bbf7d0; }
	.border-green-400 { border-color: #4ade80; }
	
	.bg-red-200 { background-color: #fecaca; }
	.border-red-400 { border-color: #f87171; }
</style>
