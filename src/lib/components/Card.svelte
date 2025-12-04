<script lang="ts">
	import type { Card as CardType } from '../types';
	import { cardsStore } from '../stores/cards';

	interface Props {
		card: CardType;
		onDragStart: (card: CardType, e: PointerEvent) => void;
		onCardClick?: (card: CardType) => void;
		allCards: CardType[];
	}

	let { card, onDragStart, onCardClick, allCards }: Props = $props();
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

	// Get parent card
	let parentCard = $derived(
		card.parentId ? allCards.find(c => c.id === card.parentId) : undefined
	);

	// Get children counts - memoized by building lookup maps
	let childrenCounts = $derived(() => {
		if (card.type === 'epic') {
			// Build a map of children by parent ID for O(1) lookup
			const childrenByParent = new Map<string, CardType[]>();
			allCards.forEach(c => {
				if (c.parentId) {
					const children = childrenByParent.get(c.parentId) || [];
					children.push(c);
					childrenByParent.set(c.parentId, children);
				}
			});
			
			const rules = childrenByParent.get(card.id)?.filter(c => c.type === 'rule') || [];
			let examplesCount = 0;
			let questionsCount = 0;
			
			rules.forEach(rule => {
				const ruleChildren = childrenByParent.get(rule.id) || [];
				examplesCount += ruleChildren.filter(c => c.type === 'example').length;
				questionsCount += ruleChildren.filter(c => c.type === 'question').length;
			});
			
			return { rules: rules.length, examples: examplesCount, questions: questionsCount };
		} else if (card.type === 'rule') {
			const children = allCards.filter(c => c.parentId === card.id);
			const examplesCount = children.filter(c => c.type === 'example').length;
			const questionsCount = children.filter(c => c.type === 'question').length;
			return { examples: examplesCount, questions: questionsCount };
		}
		return null;
	});

	function handlePointerDown(e: PointerEvent) {
		if (!isEditing) {
			onDragStart(card, e);
		}
	}

	function handleClick(e: MouseEvent) {
		if (!isEditing && onCardClick) {
			e.stopPropagation();
			onCardClick(card);
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

	function handleEditClick(e: MouseEvent) {
		e.stopPropagation();
		startEdit();
	}

	function deleteCard() {
		const hasChildren = allCards.some(c => c.parentId === card.id);
		const message = hasChildren 
			? 'This will delete this card and all its children. Are you sure?'
			: 'Are you sure you want to delete this card?';
		if (confirm(message)) {
			cardsStore.deleteCard(card.id);
		}
	}

	function unlinkFromParent() {
		if (confirm('Unlink this card from its parent?')) {
			cardsStore.unlinkCard(card.id);
		}
	}
</script>

<div
	class="card {cardColors[card.type]}"
	style="position: absolute; left: {card.position.x}px; top: {card.position.y}px;"
	onpointerdown={handlePointerDown}
	onclick={handleClick}
>
	<div class="card-header">
		<span class="card-type">{card.type.toUpperCase()}</span>
		<div class="card-actions">
			<button class="edit-btn" onclick={handleEditClick} title="Edit">✏️</button>
			<button class="delete-btn" onclick={deleteCard} title="Delete">×</button>
		</div>
	</div>
	
	{#if parentCard}
		<div class="parent-info">
			<span class="parent-badge" title="Parent: {parentCard.content}">
				↑ {parentCard.type}: {parentCard.content.substring(0, 20)}{parentCard.content.length > 20 ? '...' : ''}
			</span>
			<button class="unlink-btn" onclick={unlinkFromParent} title="Unlink from parent">⛓️‍💥</button>
		</div>
	{/if}
	
	{#if isEditing}
		<textarea
			bind:value={editContent}
			onkeydown={handleKeyDown}
			onblur={saveEdit}
			class="card-input"
		></textarea>
	{:else}
		<div class="card-content" ondblclick={startEdit}>
			{card.content || 'Double-click to edit'}
		</div>
	{/if}

	{#if childrenCounts()}
		<div class="children-info">
			{#if card.type === 'epic'}
				{#if childrenCounts().rules > 0}
					<span class="badge badge-rule" title="Rules">{childrenCounts().rules} 📘</span>
				{/if}
				{#if childrenCounts().examples > 0}
					<span class="badge badge-example" title="Examples">{childrenCounts().examples} ✅</span>
				{/if}
				{#if childrenCounts().questions > 0}
					<span class="badge badge-question" title="Questions">{childrenCounts().questions} ❓</span>
				{/if}
			{:else if card.type === 'rule'}
				{#if childrenCounts().examples > 0}
					<span class="badge badge-example" title="Examples">{childrenCounts().examples} ✅</span>
				{/if}
				{#if childrenCounts().questions > 0}
					<span class="badge badge-question" title="Questions">{childrenCounts().questions} ❓</span>
				{/if}
			{/if}
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

	.card-actions {
		display: flex;
		gap: 4px;
	}

	.edit-btn,
	.delete-btn {
		background: rgba(0, 0, 0, 0.1);
		border: none;
		border-radius: 4px;
		width: 24px;
		height: 24px;
		cursor: pointer;
		font-size: 16px;
		line-height: 1;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete-btn {
		font-size: 18px;
	}

	.edit-btn:hover,
	.delete-btn:hover {
		background: rgba(0, 0, 0, 0.2);
	}

	.parent-info {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-bottom: 8px;
		padding: 4px;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 4px;
		font-size: 11px;
	}

	.parent-badge {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.unlink-btn {
		background: transparent;
		border: none;
		cursor: pointer;
		font-size: 14px;
		padding: 2px;
		opacity: 0.6;
	}

	.unlink-btn:hover {
		opacity: 1;
	}

	.card-content {
		min-height: 60px;
		white-space: pre-wrap;
		word-wrap: break-word;
		padding: 4px;
		margin-bottom: 8px;
	}

	.card-input {
		width: 100%;
		min-height: 60px;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 4px;
		resize: vertical;
		font-family: inherit;
		margin-bottom: 8px;
	}

	.children-info {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
		padding-top: 8px;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
	}

	.badge {
		display: inline-block;
		padding: 2px 6px;
		border-radius: 12px;
		font-size: 11px;
		font-weight: bold;
	}

	.badge-rule {
		background: #bfdbfe;
		color: #1e40af;
	}

	.badge-example {
		background: #bbf7d0;
		color: #166534;
	}

	.badge-question {
		background: #fecaca;
		color: #991b1b;
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
