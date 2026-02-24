<script>
  import { fade } from 'svelte/transition';
  import AGIntensive from '$lib/components/images/AGIntensive.jpg';
  import HSIntensive from '$lib/components/images/HSIntensive.jpg';
  import IFIntensive from '$lib/components/images/IFIntensive.jpg';
</script>

<svelte:head>
  <title>Intensives - Norwegian Open WCS 2026</title>
</svelte:head>

<div class="container mx-auto px-4 md:px-8 py-12">
  <div class="text-white" in:fade={{ duration: 600, delay: 100 }}>
    <h1 class="text-4xl md:text-5xl font-bold mb-8 text-center" style="font-family: 'NorseBold', sans-serif;">
      Event Intensives
    </h1>
    <div class="max-w-3xl mx-auto mb-12">
      <p class="text-lg md:text-xl text-center mb-4">
        Take your Norwegian Open WCS 2026 experience to the next level with our exclusive intensives! Whether you want to master the groove of blues or unlock your expressive styling, these special sessions are designed to inspire and elevate your dancing.
      </p>
    </div>
  </div>

  <!-- Overview images for intensives (stand for the info) -->
  <div in:fade={{ duration: 600, delay: 150 }} class="max-w-3xl mx-auto mb-12">
    <img src={AGIntensive} alt="AG Intensive" class="w-full shadow-md schedule-img border border-gray-700 mb-6" />
    <img src={HSIntensive} alt="HS Intensive" class="w-full shadow-md schedule-img border border-gray-700 mb-6" />
    <img src={IFIntensive} alt="IF Intensive" class="w-full shadow-md schedule-img border border-gray-700 mb-6" />
  </div>

</div>