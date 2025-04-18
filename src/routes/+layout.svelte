<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

{@render children()}


<style>
    @font-face {
		font-family: 'NorseBold';
		src: url('$lib/fonts/Norsebold.otf');
		font-weight: normal;
		font-style: normal;
    }
</style>