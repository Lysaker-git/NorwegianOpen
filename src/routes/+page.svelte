<script lang="ts">
	import DarkLogo from '$lib/components/logo/nopenDarkLogo.png';
	import RegistrationCountdown from '$lib/components/htmlComponents/RegistrationCountdown.svelte';
	import { today, regOpenDate, eventDate } from '$lib/components/constants';


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
					<!-- <h2 class="mb-10 text-2xl font-bold md:text-3xl lg:text-4xl text-white">Save the dates 2. of October - 6. of October</h2> -->
					{/if}
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
