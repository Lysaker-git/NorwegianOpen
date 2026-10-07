<script lang="ts">
	import { onMount } from 'svelte';
	import { cart } from '$lib/shop/cart';
	import { MAX_LINE_QUANTITY, ONE_SIZE_LABEL } from '$lib/shop/config';
	import { formatNok } from '$lib/shop/format';
	import type { ShopProduct } from '$lib/shop/types';

	export let product: ShopProduct;

	let selectedId: string | null = product.product_variants.find((v) => v.stock > 0)?.id ?? null;
	let quantity = 1;
	let added = false;
	let mounted = false;
	onMount(() => (mounted = true));

	$: variants = product.product_variants;
	$: hasSizes = !(variants.length === 1 && variants[0].label === ONE_SIZE_LABEL);
	$: soldOut = variants.every((v) => v.stock <= 0);
	$: selected = variants.find((v) => v.id === selectedId) ?? null;
	$: inCart = mounted ? ($cart.find((i) => i.variantId === selectedId)?.quantity ?? 0) : 0;
	$: maxAddable = selected ? Math.max(0, Math.min(selected.stock, MAX_LINE_QUANTITY) - inCart) : 0;
	$: if (maxAddable > 0 && quantity > maxAddable) quantity = maxAddable;

	function add() {
		const q = Math.floor(Number(quantity));
		if (!selected || !(q >= 1) || maxAddable < 1) return;
		cart.add(
			{
				variantId: selected.id,
				productId: product.id,
				name: product.name,
				label: selected.label,
				unitPriceNok: product.price_nok,
				maxQuantity: selected.stock,
				imageUrl: product.imageUrl
			},
			Math.min(q, maxAddable)
		);
		quantity = 1;
		added = true;
		setTimeout(() => (added = false), 2000);
	}
</script>

<div class="flex flex-col overflow-hidden rounded-lg border border-amber-400/30 bg-[#232B3A] text-white shadow-xl">
	{#if product.imageUrl}
		<img src={product.imageUrl} alt={product.name} class="aspect-square w-full object-cover" loading="lazy" />
	{:else}
		<div class="flex aspect-square w-full items-center justify-center bg-gray-700 text-white/50">No image</div>
	{/if}
	<div class="flex flex-1 flex-col gap-3 p-5">
		<div class="flex items-start justify-between gap-2">
			<h2 class="text-xl font-semibold">{product.name}</h2>
			<span class="whitespace-nowrap font-semibold text-amber-400">{formatNok(product.price_nok)}</span>
		</div>
		{#if product.description}
			<p class="whitespace-pre-line text-sm text-white/80">{product.description}</p>
		{/if}

		{#if soldOut}
			<p class="mt-auto font-semibold text-red-400">Sold out</p>
		{:else}
			{#if hasSizes}
				<div class="flex flex-wrap gap-2" role="group" aria-label="Size">
					{#each variants as v (v.id)}
						<button
							type="button"
							disabled={v.stock <= 0}
							aria-pressed={selectedId === v.id}
							on:click={() => (selectedId = v.id)}
							class="min-w-12 rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 {selectedId === v.id
								? 'border-amber-400 bg-amber-400 text-gray-900'
								: 'border-gray-400'}"
						>
							{v.label}
						</button>
					{/each}
				</div>
			{/if}
			<div class="mt-auto flex items-center gap-3">
				<label class="text-sm">
					Qty
					<input
						type="number"
						min="1"
						max={Math.max(1, maxAddable)}
						bind:value={quantity}
						class="ml-1 w-16 rounded px-2 py-1 text-gray-900"
					/>
				</label>
				<button
					type="button"
					on:click={add}
					disabled={maxAddable < 1}
					class="flex-1 rounded bg-amber-500 px-4 py-2 font-semibold text-gray-900 hover:bg-amber-400 disabled:opacity-50"
				>
					{added ? 'Added ✓' : maxAddable < 1 ? 'All in cart' : 'Add to cart'}
				</button>
			</div>
		{/if}
	</div>
</div>
