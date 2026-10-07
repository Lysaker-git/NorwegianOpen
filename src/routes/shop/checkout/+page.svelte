<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { cart, cartTotal, type StockProblem } from '$lib/shop/cart';
	import { formatNok, itemDisplayName } from '$lib/shop/format';

	export let data: PageData;
	export let form: ActionData;

	let mounted = false;
	let submitting = false;
	let delivery: 'pickup' | 'shipping' = form?.values?.delivery_method === 'shipping' ? 'shipping' : 'pickup';
	let stockMessages: string[] = [];

	onMount(() => {
		// Refresh prices and stock limits in the stored cart from the server.
		cart.sync(data.catalog);
		mounted = true;
	});

	function handleStockProblems(problems: StockProblem[]) {
		stockMessages = problems.map((p) => {
			const item = $cart.find((i) => i.variantId === p.variant_id);
			const name = item ? itemDisplayName(item.name, item.label) : 'An item';
			return p.available > 0
				? `Only ${p.available} left of ${name}. We've updated your cart.`
				: `${name} is sold out and was removed from your cart.`;
		});
		cart.applyStockProblems(problems);
	}

	$: if (form?.stockProblems) handleStockProblems(form.stockProblems);
	$: shippingAvailable = data.shippingPriceNok !== null;
	$: if (!shippingAvailable) delivery = 'pickup';
	$: itemsTotal = cartTotal($cart);
	$: shipping = delivery === 'shipping' && data.shippingPriceNok !== null ? data.shippingPriceNok : 0;
	$: cartJson = JSON.stringify($cart.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
	$: errors = form?.errors ?? {};
	$: values = form?.values;
</script>

<svelte:head>
	<title>Checkout | Norwegian Open Shop</title>
</svelte:head>

<div class="container mx-auto max-w-3xl px-4 py-12 text-white">
	<a href="/shop" class="text-amber-300 underline">← Back to shop</a>
	<h1 class="mb-8 mt-4 text-4xl font-bold">CHECKOUT</h1>

	{#if !mounted}
		<p>Loading your cart…</p>
	{:else if $cart.length === 0}
		{#each stockMessages as msg}
			<p class="mb-2 rounded border border-red-400 bg-red-400/10 p-3 text-red-200">{msg}</p>
		{/each}
		<p>Your cart is empty. <a href="/shop" class="text-amber-300 underline">Go to the shop</a>.</p>
	{:else}
		{#each stockMessages as msg}
			<p class="mb-2 rounded border border-red-400 bg-red-400/10 p-3 text-red-200">{msg}</p>
		{/each}
		{#if form?.message}
			<p class="mb-4 rounded border border-red-400 bg-red-400/10 p-3 text-red-200">{form.message}</p>
		{/if}

		<section class="mb-8 rounded-lg border border-amber-400/30 bg-[#232B3A] p-5">
			<h2 class="mb-4 text-xl font-semibold text-amber-400">Your cart</h2>
			<ul class="divide-y divide-gray-600">
				{#each $cart as item (item.variantId)}
					<li class="flex items-center gap-4 py-3">
						{#if item.imageUrl}
							<img src={item.imageUrl} alt="" class="h-14 w-14 rounded object-cover" />
						{/if}
						<div class="flex-1">
							<p class="font-medium">{itemDisplayName(item.name, item.label)}</p>
							<p class="text-sm text-white/70">{formatNok(item.unitPriceNok)} each</p>
						</div>
						<input
							type="number"
							min="1"
							max={Math.min(item.maxQuantity, 20)}
							value={item.quantity}
							on:change={(e) => {
								cart.setQuantity(item.variantId, Number(e.currentTarget.value));
								e.currentTarget.value = String(get(cart).find((i) => i.variantId === item.variantId)?.quantity ?? '');
							}}
							class="w-16 rounded px-2 py-1 text-gray-900"
							aria-label="Quantity"
						/>
						<span class="w-24 text-right">{formatNok(item.unitPriceNok * item.quantity)}</span>
						<button type="button" on:click={() => cart.remove(item.variantId)} class="text-sm text-red-300 underline">
							Remove
						</button>
					</li>
				{/each}
			</ul>
		</section>

		<form
			method="POST"
			action="?/placeOrder"
			class="space-y-6"
			use:enhance={() => {
				submitting = true;
				stockMessages = [];
				return async ({ update }) => {
					await update({ reset: false });
					submitting = false;
				};
			}}
		>
			<input type="hidden" name="cart" value={cartJson} />

			<section class="space-y-4 rounded-lg border border-amber-400/30 bg-[#232B3A] p-5">
				<h2 class="text-xl font-semibold text-amber-400">Your details</h2>
				<label class="block">
					<span class="text-sm">Full name *</span>
					<input name="customer_name" required value={values?.customer_name ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
					{#if errors.customer_name}<span class="text-sm text-red-300">{errors.customer_name}</span>{/if}
				</label>
				<label class="block">
					<span class="text-sm">Email *</span>
					<input name="email" type="email" required value={values?.email ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
					{#if errors.email}<span class="text-sm text-red-300">{errors.email}</span>{/if}
				</label>
				<label class="block">
					<span class="text-sm">Phone *</span>
					<input name="phone" type="tel" required value={values?.phone ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
					{#if errors.phone}<span class="text-sm text-red-300">{errors.phone}</span>{/if}
				</label>
			</section>

			<section class="space-y-4 rounded-lg border border-amber-400/30 bg-[#232B3A] p-5">
				<h2 class="text-xl font-semibold text-amber-400">Delivery</h2>
				<label class="flex items-center gap-2">
					<input type="radio" name="delivery_method" value="pickup" bind:group={delivery} />
					Pickup / arrange with the organizer
				</label>
				{#if shippingAvailable}
					<label class="flex items-center gap-2">
						<input type="radio" name="delivery_method" value="shipping" bind:group={delivery} />
						Ship to me (+ {formatNok(data.shippingPriceNok ?? 0)})
					</label>
				{/if}
				{#if errors.delivery_method}<p class="text-sm text-red-300">{errors.delivery_method}</p>{/if}

				{#if delivery === 'shipping'}
					<label class="block">
						<span class="text-sm">Street address *</span>
						<input name="address_line" required value={values?.address_line ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
						{#if errors.address_line}<span class="text-sm text-red-300">{errors.address_line}</span>{/if}
					</label>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<label class="block">
							<span class="text-sm">Postcode *</span>
							<input name="postal_code" required value={values?.postal_code ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
							{#if errors.postal_code}<span class="text-sm text-red-300">{errors.postal_code}</span>{/if}
						</label>
						<label class="block sm:col-span-2">
							<span class="text-sm">City *</span>
							<input name="city" required value={values?.city ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
							{#if errors.city}<span class="text-sm text-red-300">{errors.city}</span>{/if}
						</label>
					</div>
					<label class="block">
						<span class="text-sm">Country</span>
						<input name="country" value={values?.country ?? 'Norway'} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
					</label>
				{/if}
			</section>

			<section class="rounded-lg border border-amber-400/30 bg-[#232B3A] p-5">
				<div class="flex justify-between"><span>Items</span><span>{formatNok(itemsTotal)}</span></div>
				{#if shipping > 0}
					<div class="flex justify-between"><span>Shipping</span><span>{formatNok(shipping)}</span></div>
				{/if}
				<div class="mt-2 flex justify-between border-t border-gray-600 pt-2 text-lg font-semibold">
					<span>Total</span><span>{formatNok(itemsTotal + shipping)}</span>
				</div>
				{#if errors.items}<p class="mt-2 text-sm text-red-300">{errors.items}</p>{/if}
				<p class="mt-4 text-sm text-white/80">
					You pay with Vipps after placing the order. Your items are reserved when you place the order. Unpaid orders may be cancelled.
					See our <a href="/privacy" class="text-amber-300 underline" target="_blank">Privacy Policy</a>.
				</p>
				<button
					type="submit"
					disabled={submitting}
					class="mt-4 w-full rounded bg-amber-500 px-4 py-3 text-lg font-semibold text-gray-900 hover:bg-amber-400 disabled:opacity-50"
				>
					{submitting ? 'Placing order…' : 'Place order'}
				</button>
			</section>
		</form>
	{/if}
</div>

<style>
	h1 {
		font-family: 'NorseBold';
	}
</style>
