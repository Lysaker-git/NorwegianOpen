<script lang="ts">
// Import all images in the 2025 images folder (use import.meta.glob with eager option)
const modules = import.meta.glob('/src/lib/components/images/previousYears/2025/images/**/*.{avif,webp,png,jpg}', { eager: true }) as Record<string, { default: string }>;

// Build a simple array of image objects
const images = Object.keys(modules)
	.sort()
	.map((path) => {
		const filename = path.split('/').pop() as string;
		return { src: modules[path].default, name: filename.replace(/\.[^/.]+$/, '') };
	});

// track loaded images
let loaded = new Set<string>();
function markLoaded(src: string) {
	// update immutably so Svelte reactivity picks up the change
	const s = new Set(loaded);
	s.add(src);
	loaded = s;
}

// action to ensure images already complete (from cache) are detected,
// and to mark on error as well so spinner doesn't persist for broken files
function imageTracker(node: HTMLImageElement, src: string) {
	const mark = () => markLoaded(src);
	if (node.complete && node.naturalWidth !== 0) mark();
	node.addEventListener('load', mark);
	node.addEventListener('error', mark);
	return {
		destroy() {
			node.removeEventListener('load', mark);
			node.removeEventListener('error', mark);
		}
	};
}
</script>

<svelte:head>
	<title>Gallery — 2025</title>
</svelte:head>

<main class="py-12">
	<div class="max-w-6xl mx-auto px-6">
		<header class="text-center mb-8">
			<h1 class="text-3xl md:text-4xl font-bold text-white mb-2">Gallery</h1>
			<p class="text-amber-200/70">2025</p>
		</header>

		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
			{#each images as img}
				<figure class="relative overflow-hidden rounded-md bg-gray-800">
					{#if !loaded.has(img.src)}
						<div class="skeleton absolute inset-0"></div>
					{/if}
					<img
						src={img.src}
						alt={img.name}
						loading="lazy"
						class="w-full h-40 md:h-48 object-cover gallery-img"
						class:loaded={loaded.has(img.src)}
						use:imageTracker={img.src}
					/>
				</figure>
			{/each}
		</div>
	</div>
</main>

<style>
/* minimal extra styling if needed */
	.skeleton {
		background: linear-gradient(90deg, rgba(100,100,100,0.18) 25%, rgba(150,150,150,0.18) 50%, rgba(100,100,100,0.18) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.2s linear infinite;
	}

	.gallery-img {
		transition: opacity .5s ease;
		opacity: 0;
		display: block;
	}
	.gallery-img.loaded {
		opacity: 1;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
</style>
