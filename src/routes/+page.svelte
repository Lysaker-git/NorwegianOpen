<script lang="ts">
	import Logo from '$lib/components/logo/nopenLogo.png';
	import BackdropSrc from '$lib/components/backdropHero.png';
	import DarkLogo from '$lib/components/logo/nopenDarkLogo.png';
	import BackdropWebP from '$lib/components/bgHero.webp'
</script>

<svelte:head>
	<title>Norwegian Open WCS 2025</title>
</svelte:head>

<!-- <div class="flex min-h-screen flex-col bg-[#4F4943] text-white">
	<header class="flex items-center justify-between px-8 py-6">
		<div class="logo">
			<img class="cInvert h-12" src={DarkLogo} alt="Norwegian Open WCS 2025 Logo" />
		</div>
		<nav class="hidden md:block">
			<ul class="flex space-x-6">
				<li><a href="#about" class="hover:text-gray-300">About</a></li>
				<li><a href="#schedule" class="hover:text-gray-300">Schedule</a></li>
				<li><a href="#location" class="hover:text-gray-300">Location</a></li>
				<li><a href="#contact" class="hover:text-gray-300">Contact</a></li>
			</ul>
		</nav>
		<div class="md:hidden">
			<button class="text-white focus:ring focus:outline-none">
				<svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
					<path
						fill-rule="evenodd"
						d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
					/>
				</svg>
			</button>
		</div>
	</header> -->

	<main class="flex-grow">
		<section
			id="hero"
			class="relative overflow-hidden bg-cover bg-center pb-20"
			style={`background-image: url('${BackdropWebP}');`}
		>
			<div
				style="height: 80vh"
				class="bg-opacity-50 inset-0 flex h-screen items-center justify-center"
			>
				<div class="mx-auto max-w-3xl px-6 py-24 text-center md:py-32 lg:py-48">
					<img class="cInvert max-h-120 mx-auto" src={DarkLogo} alt="Norwegian Open WCS 2025 Logo" />
					<!-- <h1 class="mb-10 text-4xl font-bold md:text-5xl lg:text-6xl">Norwegian Open 2025</h1> -->
					<h2 class="mb-10 text-4xl font-bold md:text-3xl lg:text-4xl text-white">Save the dates 2nd of October - 6th of October</h2>
					<a
						href="/register"
						class="mt-10 rounded-md bg-[#A09992] px-6 py-3 text-lg font-semibold text-black hover:bg-[#D4CABC]"
						>Register</a
					>
				</div>
			</div>	
		</section>

		<!-- <section id="about" class="px-6 py-12 md:px-8 lg:px-16">
			<div class="mx-auto max-w-3xl text-center">
				<h2 class="mb-6 text-3xl font-semibold">About the Norwegian Open WCS 2025</h2>
				<p class="mb-4 text-lg">
					Join us for an unforgettable World Championship Series event hosted in beautiful Norway.
					Witness top players compete, connect with the community, and be part of the excitement.
					This event will feature thrilling matches, engaging activities, and a celebration of
					competitive gaming.
				</p>
				<p class="text-lg">
					More details about the tournament format and participating players will be announced soon.
				</p>
			</div>
		</section>

		<section id="schedule" class="bg-opacity-50 rounded-md bg-gray-800 px-6 py-12 md:px-8 lg:px-16">
			<div class="mx-auto max-w-3xl text-center">
				<h2 class="mb-6 text-3xl font-semibold">Schedule</h2>
				<p class="mb-4 text-lg">
					Stay tuned for the full schedule of events, including group stages, playoffs, and special
					activities.
				</p>
				<ul class="list-disc pl-6 text-left">
					<li class="mb-2">Day 1: Opening Ceremony & Group Stage Matches</li>
					<li class="mb-2">Day 2: Continued Group Stage & Quarterfinals</li>
					<li class="mb-2">Day 3: Semifinals & Finals</li>
					<li>More details to be announced...</li>
				</ul>
			</div>
		</section>

		<section id="location" class="px-6 py-12 md:px-8 lg:px-16">
			<div class="mx-auto max-w-3xl text-center">
				<h2 class="mb-6 text-3xl font-semibold">Location</h2>
				<p class="mb-4 text-lg">
					The Norwegian Open WCS 2025 will be held in the vibrant city of Oslo, Norway.
				</p>
				<p class="mb-4 text-lg">[Specific venue details will be added here]</p>
				<div class="overflow-hidden rounded-md">
					<iframe
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2008.972241458581!2d10.7522454!3d59.9138688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46416dd0f19796e9%3A0xa00a54f7d47cf266!2sOslo%2C%20Norway!5e0!3m2!1sen!2sus!4v1713197477888!5m2!1sen!2sus"
						width="100%"
						height="450"
						style="border:0;"
						allowfullscreen=""
						loading="lazy"
						referrerpolicy="no-referrer-when-downgrade"
					></iframe>
				</div>
			</div>
		</section>

		<section id="contact" class="bg-opacity-50 rounded-md bg-gray-800 px-6 py-12 md:px-8 lg:px-16">
			<div class="mx-auto max-w-3xl text-center">
				<h2 class="mb-6 text-3xl font-semibold">Contact Us</h2>
				<p class="mb-4 text-lg">Have questions? Reach out to us!</p>
				<p class="mb-2 text-lg">Email: info@norwegianopenwcs.com</p>
				<p class="text-lg">Social Media: [Links to your social media]</p>
			</div>
		</section>

		<section id="register" class="px-6 py-16 text-center md:px-8 lg:px-16">
			<div class="mx-auto max-w-md">
				<h2 class="mb-6 text-3xl font-semibold">Register for the Norwegian Open WCS 2025</h2>
				<p class="mb-8 text-lg">
					Don't miss your chance to be part of the action. Registration opens soon!
				</p>
				<button
					class="rounded-full bg-[#D4CABC] px-8 py-4 text-lg font-bold text-black hover:bg-gray-300"
					>Register Now</button
				>
			</div>
		</section> -->
	</main>

	<!-- <footer class="py-4 text-center text-gray-300">
		<p>© 2025 Norwegian Open WCS | All Rights Reserved</p>
	</footer> -->
<!-- </div> -->

<style>
	/* Optional custom styles */
	/* @font-face {
		font-family: 'NorseBold';
		src: url('/fonts/Norsebold.otf') format('opentype');
		font-weight: normal;
		font-style: normal;
	}
	@font-face {
		font-family: 'NorseSmall';
		src: url('/fonts/Norse.otf') format('opentype');
		font-weight: normal;
		font-style: normal;
	}
	h1 {
		font-family: 'NorseSmall';
	} */
	h2 {
		font-family: 'Norse';
	}
	.cInvert {
		filter: invert(100%);
	}
</style>
