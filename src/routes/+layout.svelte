<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/htmlComponents/Header.svelte';
	import Footer from '$lib/components/htmlComponents/Footer.svelte';
	import BackdropWebP from '$lib/components/bgHero.webp'
	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col bg-[#4F4943]">
	<div
	class="relative overflow-hidden bg-cover bg-center"
	style={`background-image: url('${BackdropWebP}');`}
	>
		<Header />
		{@render children()}
		<Footer />
	</div>

</div>


<style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');


    @font-face {
		font-family: 'NorseBold';
		src: url('$lib/fonts/Norsebold.otf');
		font-weight: normal;
		font-style: normal;
    }
    @font-face {
		font-family: 'Norse';
		src: url('$lib/fonts/Norse.otf');
		font-weight: normal;
		font-style: normal;
    }


</style>