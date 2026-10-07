<script lang="ts">
	import { page } from '$app/stores';
	const tabs = [
		{ href: '/admin/shop/orders', label: 'Orders' },
		{ href: '/admin/shop/products', label: 'Products' }
	];
</script>

<div class="mb-6 flex gap-2 border-b border-gray-700">
	{#each tabs as tab}
		<a
			href={tab.href}
			class="-mb-px border-b-2 px-4 py-2 font-semibold {$page.url.pathname.startsWith(tab.href)
				? 'border-amber-400 text-amber-400'
				: 'border-transparent text-gray-300 hover:text-white'}"
		>
			{tab.label}
		</a>
	{/each}
</div>

<slot />
