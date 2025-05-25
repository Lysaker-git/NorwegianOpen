<script lang="ts">
	import Logo from '$lib/components/logo/nopenLogo.png';
	import BackdropSrc from '$lib/components/backdropHero.png';
	import DarkLogo from '$lib/components/logo/nopenDarkLogo.png';
	import BackdropWebP from '$lib/components/bgHero.webp'
	import RegistrationCountdown from '$lib/components/htmlComponents/RegistrationCountdown.svelte';
	import { REG_OPEN_STRING } from '$lib/components/constants';

    const regOpenDate = new Date(REG_OPEN_STRING + 'T19:00:00');
    const today = new Date();

</script>

<svelte:head>
	<title>Norwegian Open WCS 2025</title>
</svelte:head>

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
					<div class="pt-4">
						<RegistrationCountdown />
					</div>
					{:else}
					<h2 class="pt-4 mb-10 text-2xl font-bold md:text-3xl lg:text-4xl text-white">
						 Registration is now open!
					</h2>
					{/if}
					<img class="cInvert max-h-100 mx-auto" src={DarkLogo} alt="Norwegian Open WCS 2025 Logo" />
					<!-- <h1 class="mb-10 text-4xl font-bold md:text-5xl lg:text-6xl">Norwegian Open 2025</h1> -->
					<h2 class="mb-10 text-2xl font-bold md:text-3xl lg:text-4xl text-white">Save the dates 2. of October - 6. of October</h2>
					<a
						href="/register"
						class="mt-10 rounded-md bg-[#A09992] px-6 py-3 text-lg font-semibold text-black hover:bg-[#D4CABC]"
						>Register</a
					>
				</div>
			</div>	
		</section>
	</main>

<style>
	h2 {
		font-family: 'Norse';
	}
	.cInvert {
		filter: invert(100%);
	}
</style>
