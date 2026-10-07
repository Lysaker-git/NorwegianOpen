<script lang="ts">
	import type { PageData } from './$types';
	import { formatNok } from '$lib/shop/format';
	export let data: PageData;
</script>

<div class="mb-4 flex items-center justify-between">
	<h1 class="text-2xl font-bold text-amber-400">Products</h1>
	<a href="/admin/shop/products/new" class="rounded bg-amber-500 px-4 py-2 font-semibold text-gray-900 hover:bg-amber-400">+ Add product</a>
</div>

{#if data.notice}
	<p class="mb-4 rounded border border-green-500 bg-green-500/10 p-3 text-green-200">{data.notice}</p>
{/if}

{#if data.products.length === 0}
	<p>No products yet. Add your first one.</p>
{:else}
	<div class="overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead class="bg-gray-800 text-gray-300">
				<tr>
					<th class="p-2">Image</th>
					<th class="p-2">Name</th>
					<th class="p-2">Price</th>
					<th class="p-2">Stock</th>
					<th class="p-2">In shop</th>
					<th class="p-2"></th>
				</tr>
			</thead>
			<tbody>
				{#each data.products as p (p.id)}
					<tr class="border-b border-gray-700">
						<td class="p-2">
							{#if p.imageUrl}<img src={p.imageUrl} alt="" class="h-12 w-12 rounded object-cover" />{:else}<span class="text-gray-500">—</span>{/if}
						</td>
						<td class="p-2 font-medium">{p.name}</td>
						<td class="p-2">{formatNok(p.price_nok)}</td>
						<td class="p-2">
							{#each p.product_variants as v, i (v.id)}
								<span class={v.stock === 0 ? 'text-red-400' : ''}>{v.label} {v.stock}</span>{i < p.product_variants.length - 1 ? ' · ' : ''}
							{/each}
						</td>
						<td class="p-2">{p.is_active ? 'Yes' : 'Hidden'}</td>
						<td class="p-2"><a href="/admin/shop/products/{p.id}" class="text-amber-300 underline">Edit</a></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
