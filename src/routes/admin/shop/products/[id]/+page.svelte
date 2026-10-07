<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { ONE_SIZE_LABEL } from '$lib/shop/config';

	export let data: PageData;
	export let form: ActionData;

	type Row = { id: string; label: string; stock: number | string };

	let rows: Row[] = data.product?.product_variants.map((v) => ({ id: v.id, label: v.label, stock: v.stock })) ?? [
		{ id: '', label: ONE_SIZE_LABEL, stock: 0 }
	];
	// After a failed save, show what the admin typed.
	$: if (form?.values) rows = form.values.variants.map((v) => ({ id: v.id ?? '', label: v.label, stock: Number.isNaN(v.stock) ? '' : v.stock }));

	$: values = form?.values;
	$: errors = form?.errors ?? {};
	$: ordered = new Set(data.orderedVariantIds);

	function addRow() {
		rows = [...rows, { id: '', label: '', stock: 0 }];
	}
	function removeRow(index: number) {
		rows = rows.filter((_, i) => i !== index);
	}
</script>

<a href="/admin/shop/products" class="text-amber-300 underline">← All products</a>
<h1 class="mb-6 mt-2 text-2xl font-bold text-amber-400">{data.product ? `Edit ${data.product.name}` : 'Add product'}</h1>

{#if form?.message}
	<p class="mb-4 rounded border border-red-500 bg-red-500/10 p-3 text-red-200">{form.message}</p>
{/if}
{#if data.imageFailed}
	<p class="mb-4 rounded border border-amber-500 bg-amber-500/10 p-3 text-amber-200">The product was saved, but the image upload failed. Please try uploading it again.</p>
{/if}

<form method="POST" action="?/save" enctype="multipart/form-data" class="max-w-2xl space-y-5">
	<label class="block">
		<span class="text-sm">Name *</span>
		<input name="name" required value={values?.name ?? data.product?.name ?? ''} class="mt-1 block w-full rounded px-3 py-2 text-gray-900" />
		{#if errors.name}<span class="text-sm text-red-300">{errors.name}</span>{/if}
	</label>

	<label class="block">
		<span class="text-sm">Description</span>
		<textarea name="description" rows="3" class="mt-1 block w-full rounded px-3 py-2 text-gray-900">{values?.description ?? data.product?.description ?? ''}</textarea>
	</label>

	<label class="block">
		<span class="text-sm">Price (NOK, whole kroner) *</span>
		<input name="price_nok" type="number" min="0" step="1" required value={values ? (Number.isNaN(values.price_nok) ? '' : values.price_nok) : (data.product?.price_nok ?? '')} class="mt-1 block w-40 rounded px-3 py-2 text-gray-900" />
		{#if errors.price_nok}<span class="block text-sm text-red-300">{errors.price_nok}</span>{/if}
	</label>

	<fieldset class="rounded border border-gray-600 p-4">
		<legend class="px-2 text-sm">Sizes and stock *</legend>
		<p class="mb-3 text-xs text-gray-400">For items without sizes, keep a single row called "{ONE_SIZE_LABEL}".</p>
		{#each rows as row, i (i)}
			<div class="mb-2 flex items-center gap-2">
				<input type="hidden" name="variant_id" value={row.id} />
				<input name="variant_label" placeholder="Size, e.g. M" bind:value={row.label} class="w-40 rounded px-3 py-2 text-gray-900" />
				<input name="variant_stock" type="number" min="0" step="1" bind:value={row.stock} class="w-28 rounded px-3 py-2 text-gray-900" aria-label="Stock" />
				{#if row.id && ordered.has(row.id)}
					<span class="text-xs text-gray-400" title="This size has orders. Set stock to 0 instead of removing it.">has orders</span>
				{:else}
					<button type="button" on:click={() => removeRow(i)} class="text-sm text-red-300 underline">Remove</button>
				{/if}
			</div>
		{/each}
		<button type="button" on:click={addRow} class="mt-2 text-sm text-amber-300 underline">+ Add size</button>
		{#if errors.variants}<p class="mt-2 text-sm text-red-300">{errors.variants}</p>{/if}
	</fieldset>

	<div>
		<span class="text-sm">Image (JPG, PNG or WebP, max 4 MB)</span>
		{#if data.imageUrl}
			<div class="my-2 flex items-center gap-4">
				<img src={data.imageUrl} alt="" class="h-24 w-24 rounded object-cover" />
				<label class="flex items-center gap-2 text-sm"><input type="checkbox" name="remove_image" /> Remove image</label>
			</div>
		{/if}
		<input type="file" name="image" accept="image/jpeg,image/png,image/webp" class="mt-1 block text-sm" />
		{#if errors.image}<span class="text-sm text-red-300">{errors.image}</span>{/if}
	</div>

	<label class="flex items-center gap-2">
		<input type="checkbox" name="is_active" checked={values ? values.is_active : (data.product?.is_active ?? true)} />
		Visible in shop
	</label>

	<button type="submit" class="rounded bg-amber-500 px-6 py-2 font-semibold text-gray-900 hover:bg-amber-400">Save product</button>
</form>

{#if data.product}
	<form
		method="POST"
		action="?/delete"
		class="mt-10"
		on:submit={(e) => {
			if (!confirm(`Delete ${data.product?.name}? This cannot be undone.`)) e.preventDefault();
		}}
	>
		<button type="submit" class="rounded bg-red-700 px-4 py-2 text-sm hover:bg-red-600">Delete product</button>
	</form>
{/if}
