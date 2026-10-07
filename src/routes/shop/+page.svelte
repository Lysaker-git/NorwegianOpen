<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import ProductCard from '$lib/components/shop/ProductCard.svelte';
	import { cart, cartCount } from '$lib/shop/cart';

	export let data: PageData;

	// The cart lives in localStorage, so only show its count after hydration.
	let mounted = false;
	onMount(() => (mounted = true));
	$: count = cartCount($cart);
</script>

<svelte:head>
	<title>Shop | Norwegian Open WCS</title>
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-12">
	<div class="mb-6 flex items-center justify-between gap-4">
		<h1 class="text-4xl font-bold text-white md:text-5xl">SHOP</h1>
		<a href="/shop/checkout" class="rounded bg-amber-500 px-4 py-2 font-semibold text-gray-900 hover:bg-amber-400">
			Cart{#if mounted && count > 0}&nbsp;({count}){/if}
		</a>
	</div>
	<p class="mb-8 text-white/80">
		Norwegian Open merch. Place your order and pay with Vipps{data.shippingEnabled
			? '. Pick it up or have it shipped to you.'
			: '. We will contact you to arrange pickup.'}
	</p>

	{#if data.products.length === 0}
		<p class="text-white">There are no products in the shop right now. Check back soon!</p>
	{:else}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.products as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	{/if}
</div>

<style>
	h1 {
		font-family: 'NorseBold';
	}
</style>
