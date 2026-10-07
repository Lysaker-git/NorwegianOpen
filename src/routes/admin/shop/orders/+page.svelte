<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { ORDER_STATUSES, STATUS_LABELS } from '$lib/shop/orderStatus';
	import { formatNok, itemDisplayName } from '$lib/shop/format';

	export let data: PageData;
	export let form: ActionData;

	const filters = [...ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })), { value: 'all', label: 'All' }];
</script>

<section class="mb-8 rounded border border-gray-700 bg-gray-800 p-4">
	<h2 class="mb-3 text-lg font-semibold text-amber-400">Shop settings</h2>
	<form method="POST" action="?/saveSettings" use:enhance={() => async ({ update }) => update({ reset: false })} class="flex flex-wrap items-end gap-4">
		<label class="block">
			<span class="text-sm">Vipps number</span>
			<input name="vipps_number" value={data.settings.vipps_number} class="mt-1 block w-48 rounded px-3 py-2 text-gray-900" />
		</label>
		<label class="block">
			<span class="text-sm">Shipping price (NOK, empty = no shipping)</span>
			<input name="shipping_price_nok" type="number" min="0" step="1" value={data.settings.shipping_price_nok ?? ''} class="mt-1 block w-48 rounded px-3 py-2 text-gray-900" />
		</label>
		<button type="submit" class="rounded bg-amber-500 px-4 py-2 font-semibold text-gray-900 hover:bg-amber-400">Save settings</button>
	</form>
	{#if form?.settingsSaved}<p class="mt-2 text-sm text-green-300">Settings saved.</p>{/if}
	{#if form?.settingsError}<p class="mt-2 text-sm text-red-300">{form.settingsError}</p>{/if}
	{#if !data.settings.vipps_number}
		<p class="mt-2 text-sm text-amber-300">⚠️ No Vipps number set. Customers will not see where to pay.</p>
	{/if}
</section>

<h1 class="mb-4 text-2xl font-bold text-amber-400">Orders</h1>

<div class="mb-4 flex flex-wrap gap-2">
	{#each filters as f}
		<a
			href="?status={f.value}"
			class="rounded px-3 py-1 text-sm {data.status === f.value ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}"
		>
			{f.label}
		</a>
	{/each}
</div>

{#if data.orders.length === 0}
	<p>No orders here.</p>
{:else}
	<div class="overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead class="bg-gray-800 text-gray-300">
				<tr>
					<th class="p-2">Order</th>
					<th class="p-2">Date</th>
					<th class="p-2">Customer</th>
					<th class="p-2">Items</th>
					<th class="p-2">Delivery</th>
					<th class="p-2">Total</th>
					<th class="p-2">Status</th>
				</tr>
			</thead>
			<tbody>
				{#each data.orders as o (o.id)}
					<tr class="border-b border-gray-700 hover:bg-gray-800">
						<td class="p-2">
							<a href="/admin/shop/orders/{o.id}" class="font-semibold text-amber-300 underline">{o.order_number}</a>
							{#if o.lastEmailFailed}<span title="The last email to this customer failed">⚠️</span>{/if}
						</td>
						<td class="p-2">{new Date(o.created_at).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' })}</td>
						<td class="p-2">{o.customer_name}<br /><span class="text-gray-400">{o.email}</span></td>
						<td class="p-2">
							{#each o.order_items as item}
								<div>{item.quantity} × {itemDisplayName(item.product_name, item.variant_label)}</div>
							{/each}
						</td>
						<td class="p-2">{o.delivery_method === 'shipping' ? 'Shipping' : 'Pickup'}</td>
						<td class="p-2">{formatNok(o.total_nok)}</td>
						<td class="p-2">{STATUS_LABELS[o.status]}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
