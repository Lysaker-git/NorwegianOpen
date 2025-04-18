<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/htmlComponents/Header.svelte';
	import Footer from '$lib/components/htmlComponents/Footer.svelte';
	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col bg-[#4F4943] text-white">
	<Header />
	{@render children()}
	<Footer />

</div>


<style>
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