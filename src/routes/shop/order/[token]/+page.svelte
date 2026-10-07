<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { cart } from '$lib/shop/cart';
	import { CUSTOMER_STATUS_TEXT, STATUS_LABELS } from '$lib/shop/orderStatus';
	import { formatNok, itemDisplayName } from '$lib/shop/format';
	import type { OrderStatus } from '$lib/shop/types';

	export let data: PageData;

	onMount(() => {
		if (data.isNew) cart.clear();
	});

	const bannerClass: Record<OrderStatus, string> = {
		awaiting_payment: 'border-amber-400 bg-amber-400/10',
		paid: 'border-green-400 bg-green-400/10',
		sent: 'border-sky-400 bg-sky-400/10',
		delivered: 'border-green-400 bg-green-400/10',
		cancelled: 'border-red-400 bg-red-400/10'
	};

	$: order = data.order;
	$: itemsTotal = order.total_nok - order.shipping_price_nok;
</script>

<svelte:head>
	<title>Order {order.order_number} | Norwegian Open Shop</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="container mx-auto max-w-3xl px-4 py-12 text-white">
	{#if data.isNew}
		<p class="mb-6 rounded border border-green-400 bg-green-400/10 p-4">
			{#if data.mailFailed}
				Order placed! We couldn't send the confirmation email, so please save the link to this page. It shows your payment details and order status.
			{:else}
				Order placed! We've emailed you the details.
			{/if}
		</p>
	{/if}

	<h1 class="mb-2 text-3xl font-bold">Order {order.order_number}</h1>
	<p class="mb-6 text-white/70">Placed {new Date(order.created_at).toLocaleDateString('nb-NO')}</p>

	<div class="mb-6 rounded-lg border-2 p-5 {bannerClass[order.status]}">
		<p class="text-sm uppercase tracking-wide text-white/70">Status</p>
		<p class="text-2xl font-semibold">{STATUS_LABELS[order.status]}</p>
		<p class="mt-1">{CUSTOMER_STATUS_TEXT[order.status]}</p>
	</div>

	{#if order.status === 'awaiting_payment'}
		<div class="mb-6 rounded-lg border-2 border-amber-400 bg-[#232B3A] p-5">
			<h2 class="mb-2 text-xl font-semibold text-amber-400">How to pay</h2>
			<p>Pay <strong>{formatNok(order.total_nok)}</strong> with Vipps to <strong>{data.vippsNumber}</strong>.</p>
			<p>Write <strong>{order.order_number}</strong> in the Vipps message.</p>
		</div>
	{/if}

	<section class="mb-6 rounded-lg border border-amber-400/30 bg-[#232B3A] p-5">
		<h2 class="mb-3 text-xl font-semibold text-amber-400">Items</h2>
		<ul class="divide-y divide-gray-600">
			{#each order.order_items as item (item.id)}
				<li class="flex justify-between py-2">
					<span>{item.quantity} × {itemDisplayName(item.product_name, item.variant_label)}</span>
					<span>{formatNok(item.unit_price_nok * item.quantity)}</span>
				</li>
			{/each}
		</ul>
		<div class="mt-3 space-y-1 border-t border-gray-600 pt-3">
			<div class="flex justify-between"><span>Items</span><span>{formatNok(itemsTotal)}</span></div>
			{#if order.shipping_price_nok > 0}
				<div class="flex justify-between"><span>Shipping</span><span>{formatNok(order.shipping_price_nok)}</span></div>
			{/if}
			<div class="flex justify-between text-lg font-semibold"><span>Total</span><span>{formatNok(order.total_nok)}</span></div>
		</div>
	</section>

	<section class="rounded-lg border border-amber-400/30 bg-[#232B3A] p-5">
		<h2 class="mb-3 text-xl font-semibold text-amber-400">Delivery</h2>
		{#if order.delivery_method === 'shipping'}
			<p>Shipping to:</p>
			<p>{order.customer_name}<br />{order.address_line}<br />{order.postal_code} {order.city}<br />{order.country}</p>
		{:else}
			<p>Pickup / arranged with the organizer. We will contact you.</p>
		{/if}
	</section>

	<p class="mt-8 text-sm text-white/70">
		Questions? Email <a href="mailto:norwegianopenwcs@gmail.com" class="text-amber-300 underline">norwegianopenwcs@gmail.com</a>
		and include your order number.
	</p>
</div>
