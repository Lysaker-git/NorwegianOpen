<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import DarkLogo from '$lib/components/logo/nopenDarkLogo.png';
	import RegistrationCountdown from '$lib/components/htmlComponents/RegistrationCountdown.svelte';
	import { today, regOpenDate, eventDate } from '$lib/components/constants';

	// eagerly import all highlight images from previous year folder
	const highlightModules = import.meta.glob('/src/lib/components/images/previousYears/2025/images/highlight/*.{avif,webp,png,jpg}', { eager: true }) as Record<string, { default: string }>;
	const highlights: { src: string; name: string }[] = Object.keys(highlightModules).map((path) => {
		const parts = path.split('/');
		const filename = parts[parts.length - 1];
		const name = filename.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
		return { src: highlightModules[path].default, name };
	});

	// modal / lightbox state
	let modalOpen = false;
	let modalSrc = '';
	let modalAlt = '';

	function openModal(h: { src: string; name: string }) {
		modalSrc = h.src;
		modalAlt = h.name;
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		modalSrc = '';
		modalAlt = '';
	}

	function onWindowKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && modalOpen) closeModal();
	}

	// Rotating two-image display state
	let rotIndex = 0; // start index of the pair
	let rotInterval: number | null = null;
	const ROTATE_MS = 3000; // rotate every 3s

	const pairCount = Math.max(1, Math.floor(highlights.length / 2));

	onMount(() => {
		if (highlights.length > 2) {
			rotInterval = setInterval(() => {
				rotIndex = (rotIndex + 2) % highlights.length;
			}, ROTATE_MS) as unknown as number;
		}
	});

	onDestroy(() => {
		if (rotInterval) clearInterval(rotInterval as unknown as number);
	});

</script>

<svelte:head>
	<title>Norwegian Open WCS 2025</title>
</svelte:head>

<svelte:window on:keydown={onWindowKeydown} />

	<main class="flex-grow">
		<section
			id="hero"
		>
			<div
				style="height: fit-content"
				class="bg-opacity-50 inset-0 flex h-screen items-center justify-center"
			>
				<div class="mx-auto max-w-3xl px-6 py-2 text-center md:py-8 lg:py-12">
					
			        {#if today <= regOpenDate}
					<img class="cInvert max-h-100 mx-auto" src={DarkLogo} alt="Norwegian Open WCS 2025 Logo" />
					<h2 class="mb-10 text-2xl font-bold md:text-3xl lg:text-4xl text-white">Save the dates 1. of October - 5. of October 2026</h2>

					<div class="pt-4">
						<RegistrationCountdown />
					</div>

					{:else if today <= eventDate}
					<h2 class="pt-4 mb-10 text-2xl font-bold md:text-3xl lg:text-4xl text-white">
						 Registration is now open!
					</h2>
					<img class="cInvert max-h-100 mx-auto" src={DarkLogo} alt="Norwegian Open WCS 2025 Logo" />
					<h2 class="mb-10 text-2xl font-bold md:text-3xl lg:text-4xl text-white">Save the dates 2. of October - 6. of October</h2>
					<a
						href="/register"
						class="mt-10 rounded-md bg-[#A09992] px-6 py-3 text-lg font-semibold text-black hover:bg-[#D4CABC]"
						>Register</a>
					{:else}
					<h2 class="pt-4 mb-6 text-2xl font-bold md:text-3xl lg:text-4xl text-white">
						Thank you for joining Norwegian Open WCS 2025!
					</h2>
					<p class="mb-6 text-gray-300">
						Thank you for being part of this year's event — we hope you had a wonderful time. See you next year!
					</p>
					<img class="cInvert max-h-100 mx-auto" src={DarkLogo} alt="Norwegian Open WCS 2025 Logo" />
					<h2 class="mb-10 text-2xl font-bold md:text-3xl lg:text-4xl text-white">Save the dates 1. of October - 5. of October</h2>
					{/if}
				</div>
			</div>	
		</section>

		<!-- Highlights section (previous year) -->
		<section id="highlights" class="py-12">
			<div class="max-w-5xl mx-auto px-6 text-center">
				<div class="w-full flex items-center justify-center mb-4">
					<div class="h-px w-24 bg-amber-400 mr-4"></div>
					<h3 class="text-2xl md:text-3xl font-bold text-amber-100">Highlights from 2025</h3>
					<div class="h-px w-24 bg-amber-400 ml-4"></div>
				</div>

				<p class="text-amber-200/70 mb-6">A quick look back — tap an image to view full screen.</p>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
					{#if highlights.length === 0}
						<div class="text-gray-400">No highlights available.</div>
					{:else}
						{#each [0,1] as offset}
							{#if highlights[(rotIndex + offset) % highlights.length]}
								{#key (rotIndex + offset)}
									<figure class="overflow-hidden rounded-lg bg-gray-800">
										<img
											src={highlights[(rotIndex + offset) % highlights.length].src}
											alt={highlights[(rotIndex + offset) % highlights.length].name}
											loading="lazy"
											class="w-full h-64 md:h-80 object-cover shadow-md transform transition-transform duration-300 hover:scale-105 cursor-pointer"
											on:click={() => openModal(highlights[(rotIndex + offset) % highlights.length])}
										/>
									</figure>
								{/key}
							{/if}
						{/each}
					{/if}
				</div>

				<div class="mt-6 flex items-center justify-center">
					<a href="/gallery" class="text-sm text-amber-200/90 bg-amber-400/5 px-3 py-1 rounded-md hover:bg-amber-400/10">View full gallery</a>
				</div>
			</div>
			<div class="mt-8 h-px bg-amber-400/20"></div>
		</section>

		{#if modalOpen}
			<div class="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4" on:click={closeModal} aria-modal="true" role="dialog">
				<div class="max-w-[95%] max-h-[95%] relative">
					<button class="absolute top-3 right-3 text-white text-2xl bg-black/40 rounded-full w-10 h-10 flex items-center justify-center" on:click|stopPropagation={closeModal} aria-label="Close">✕</button>
					<img src={modalSrc} alt={modalAlt} class="max-w-full max-h-full rounded shadow-lg mx-auto" on:click|stopPropagation />
				</div>
			</div>
		{/if}

	</main>

<style>
	h2 {
		font-family: 'Norse';
	}
	.cInvert {
		filter: invert(100%);
	}
</style>
