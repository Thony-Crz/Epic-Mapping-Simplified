<script lang="ts">
	import type { CardType } from '../types';
	import { cardsStore } from '../stores/cards';
	import { downloadJSON, uploadJSON, downloadNestedJSON } from '../services/jsonService';
	import { get } from 'svelte/store';
	import logo from '$lib/assets/favicon.svg';

	interface Props {
		onAddCard: (type: CardType) => void;
		onLinkMode?: (enabled: boolean) => void;
	}

	let { onAddCard, onLinkMode }: Props = $props();
	let linkModeEnabled = $state(false);

	async function handleImport() {
		try {
			const cards = await uploadJSON();
			cardsStore.setCards(cards);
		} catch (error) {
			alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	function handleExport() {
		const cards = get(cardsStore);
		downloadJSON(cards);
	}

	function handleExportNested() {
		const cards = get(cardsStore);
		downloadNestedJSON(cards);
	}

	function handleReset() {
		if (confirm('Are you sure you want to clear all cards?')) {
			cardsStore.reset();
		}
	}

	function toggleLinkMode() {
		linkModeEnabled = !linkModeEnabled;
		onLinkMode?.(linkModeEnabled);
	}
</script>

<div class="toolbar">
	<div class="toolbar-section logo-section">
		<img src={logo} alt="Example Mapping logo showing hierarchical post-it note structure with Epic, Rule, Example and Question cards" class="toolbar-logo" />
		<h2 class="app-title">Example Mapping</h2>
	</div>
	<div class="toolbar-section">
		<h3>Add Card:</h3>
		<button class="btn btn-epic" onclick={() => onAddCard('epic')}>Epic</button>
		<button class="btn btn-rule" onclick={() => onAddCard('rule')}>Rule</button>
		<button class="btn btn-example" onclick={() => onAddCard('example')}>Example</button>
		<button class="btn btn-question" onclick={() => onAddCard('question')}>Question</button>
	</div>
	
	<div class="toolbar-section">
		<button 
			class="btn {linkModeEnabled ? 'btn-link-active' : 'btn-secondary'}" 
			onclick={toggleLinkMode}
			title="Click to enable linking mode, then click a child card and a parent card to link them"
		>
			{linkModeEnabled ? '🔗 Linking...' : '🔗 Link Cards'}
		</button>
		<button class="btn btn-secondary" onclick={handleImport}>Import JSON</button>
		<button class="btn btn-secondary" onclick={handleExport}>Export (Flat)</button>
		<button class="btn btn-secondary" onclick={handleExportNested}>Export (Nested)</button>
		<button class="btn btn-danger" onclick={handleReset}>Clear All</button>
	</div>
</div>

<style>
	.toolbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background: #f5f5f5;
		border-bottom: 2px solid #ddd;
		padding: 12px 16px;
		display: flex;
		gap: 24px;
		align-items: center;
		z-index: 1000;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.toolbar-section {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.toolbar-section h3 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
	}

	.logo-section {
		gap: 12px;
	}

	.toolbar-logo {
		width: 40px;
		height: 40px;
		object-fit: contain;
	}

	.app-title {
		margin: 0;
		font-size: 18px;
		font-weight: 700;
		color: #374151;
		letter-spacing: -0.5px;
	}

	.btn {
		padding: 8px 16px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.btn-epic {
		background: #a855f7;
		color: white;
	}

	.btn-rule {
		background: #60a5fa;
		color: white;
	}

	.btn-example {
		background: #4ade80;
		color: white;
	}

	.btn-question {
		background: #f87171;
		color: white;
	}

	.btn-secondary {
		background: #6b7280;
		color: white;
	}

	.btn-link-active {
		background: #f59e0b;
		color: white;
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	.btn-danger {
		background: #dc2626;
		color: white;
	}
</style>
