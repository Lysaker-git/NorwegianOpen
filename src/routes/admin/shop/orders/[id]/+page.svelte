<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ActionData, PageData } from './$types';
	import { EMAIL_TYPE_LABELS, STATUS_LABELS, confirmMessage } from '$lib/shop/orderStatus';
	import { formatNok, itemDisplayName } from '$lib/shop/format';

	export let data: PageData;
	export let form: ActionData;

	let busy = false;

	$: order = data.order;
	$: itemsTotal = order.total_nok - order.shipping_price_nok;

	const fmt = (iso: string | null) =>
		iso ? new Date(iso).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' }) : '—';
</script>

<a href="/admin/shop/orders" class="text-amber-300 underline">← All orders</a>

<div class="mb-6 mt-2 flex flex-wrap items-center gap-4">
	<h1 class="text-2xl font-bold text-amber-400">Order {order.order_number}</h1>
	<span class="rounded bg-gray-700 px-3 py-1 text-sm font-semibold">{STATUS_LABELS[order.status]}</span>
</div>

{#if form?.result}
	<p class="mb-6 rounded border p-3 {form.result.ok ? 'border-green-500 bg-green-500/10 text-green-200' : 'border-amber-500 bg-amber-500/10 text-amber-200'}">
		{form.result.ok ? '✅' : '⚠️'} {form.result.message}
	</p>
{/if}

<section class="mb-6 rounded border border-gray-700 bg-gray-800 p-4">
	<h2 class="mb-3 text-lg font-semibold text-amber-400">Actions</h2>
	<div class="flex flex-wrap gap-3">
		{#each data.actions as action (action.id + action.emailType)}
			<form
				method="POST"
				action="?/act"
				use:enhance={({ cancel }) => {
					if (!confirm(confirmMessage(action, order.order_number, order.email))) {
						cancel();
						return;
					}
					busy = true;
					return async ({ result, update }) => {
						await update();
						if (result.type === 'failure') await invalidateAll();
						busy = false;
					};
				}}
			>
				<input type="hidden" name="action_id" value={action.id} />
				<input type="hidden" name="email_type" value={action.emailType} />
				<button
					type="submit"
					disabled={busy}
					class="rounded px-4 py-2 font-semibold disabled:opacity-50 {action.danger
						? 'bg-red-700 hover:bg-red-600'
						: action.kind === 'resend'
							? 'bg-gray-600 hover:bg-gray-500'
							: 'bg-amber-500 text-gray-900 hover:bg-amber-400'}"
				>
					{action.label}
				</button>
			</form>
		{/each}
	</div>
	<p class="mt-3 text-xs text-gray-400">Every action asks for confirmation and emails the customer (copy to norwegianopenwcs@gmail.com).</p>
</section>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
	<section class="rounded border border-gray-700 bg-gray-800 p-4">
		<h2 class="mb-3 text-lg font-semibold text-amber-400">Customer</h2>
		<p>{order.customer_name}</p>
		<p><a href="mailto:{order.email}" class="text-amber-300 underline">{order.email}</a></p>
		<p><a href="tel:{order.phone}" class="text-amber-300 underline">{order.phone}</a></p>
		<h3 class="mb-1 mt-4 font-semibold">Delivery</h3>
		{#if order.delivery_method === 'shipping'}
			<p>Shipping to:<br />{order.address_line}<br />{order.postal_code} {order.city}<br />{order.country}</p>
		{:else}
			<p>Pickup / arrange with customer</p>
		{/if}
		<h3 class="mb-1 mt-4 font-semibold">Customer order page</h3>
		<a href={data.customerUrl} target="_blank" rel="noopener noreferrer" class="break-all text-sm text-amber-300 underline">{data.customerUrl}</a>
	</section>

	<section class="rounded border border-gray-700 bg-gray-800 p-4">
		<h2 class="mb-3 text-lg font-semibold text-amber-400">Items</h2>
		<ul>
			{#each order.order_items as item (item.id)}
				<li class="flex justify-between py-1">
					<span>{item.quantity} × {itemDisplayName(item.product_name, item.variant_label)}</span>
					<span>{formatNok(item.unit_price_nok * item.quantity)}</span>
				</li>
			{/each}
		</ul>
		<div class="mt-2 border-t border-gray-600 pt-2">
			<div class="flex justify-between"><span>Items</span><span>{formatNok(itemsTotal)}</span></div>
			{#if order.shipping_price_nok > 0}
				<div class="flex justify-between"><span>Shipping</span><span>{formatNok(order.shipping_price_nok)}</span></div>
			{/if}
			<div class="flex justify-between font-semibold"><span>Total</span><span>{formatNok(order.total_nok)}</span></div>
		</div>
		<h3 class="mb-1 mt-4 font-semibold">Timeline</h3>
		<dl class="grid grid-cols-2 gap-x-4 text-sm">
			<dt class="text-gray-400">Placed</dt><dd>{fmt(order.created_at)}</dd>
			<dt class="text-gray-400">Paid</dt><dd>{fmt(order.paid_at)}</dd>
			<dt class="text-gray-400">Sent</dt><dd>{fmt(order.sent_at)}</dd>
			<dt class="text-gray-400">Delivered</dt><dd>{fmt(order.delivered_at)}</dd>
			<dt class="text-gray-400">Cancelled</dt><dd>{fmt(order.cancelled_at)}</dd>
		</dl>
	</section>
</div>

<section class="mt-6 rounded border border-gray-700 bg-gray-800 p-4">
	<h2 class="mb-3 text-lg font-semibold text-amber-400">Email log</h2>
	{#if data.emails.length === 0}
		<p class="text-sm text-gray-400">No emails sent yet.</p>
	{:else}
		<table class="w-full text-left text-sm">
			<thead class="text-gray-400">
				<tr><th class="py-1">Time</th><th class="py-1">Email</th><th class="py-1">To</th><th class="py-1">Result</th></tr>
			</thead>
			<tbody>
				{#each data.emails as e (e.id)}
					<tr class="border-t border-gray-700">
						<td class="py-1">{fmt(e.created_at)}</td>
						<td class="py-1">{EMAIL_TYPE_LABELS[e.email_type]}</td>
						<td class="py-1">{e.recipient}</td>
						<td class="py-1">{#if e.success}<span class="text-green-300">Sent</span>{:else}<span class="text-red-300">Failed: {e.error}</span>{/if}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</section>
