<script lang="ts">
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Grid from '$lib/components/Grid.svelte';
	import type { CardType } from '$lib/types';

	let newCardType: CardType | null = $state(null);

	function handleAddCard(type: CardType) {
		newCardType = type;
	}

	function handleCardCreated() {
		newCardType = null;
	}
</script>

<svelte:head>
	<title>Example Mapping - Epic Mapping Simplified</title>
</svelte:head>

<main>
	<Toolbar onAddCard={handleAddCard} />
	<Grid {newCardType} onCardCreated={handleCardCreated} />
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
	}

	main {
		width: 100%;
		min-height: 100vh;
	}
</style>
