<script lang="ts">
    export let images: string[] = []
    export let altText: string = "Room Image"

    let current = 0;
    function prev() { current = (current - 1 + images.length) % images.length; }
    function next() { current = (current + 1) % images.length; }
</script>
<div class="relative w-full h-48 rounded-lg overflow-hidden">
    <img src={images[current]} alt={altText} class="object-cover w-full h-full" />
    <button type="button" class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1" on:click={prev}>&lt;</button>
    <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1" on:click={next}>&gt;</button>
    <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {#each images as _, i}
            <span class="w-2 h-2 rounded-full {i === current ? 'bg-amber-400' : 'bg-white/40'} inline-block"></span>
        {/each}
    </div>
</div>