<script lang="ts">
  import type { ActionData } from './$types';
  import { regOpenDate, today } from '$lib/components/constants';
  import RegistrationCountdown from '$lib/components/htmlComponents/RegistrationCountdown.svelte';
  import { onMount } from 'svelte';
  export let form: ActionData;

  let isVisible = false;

  onMount(() => {
    setTimeout(() => {
      isVisible = true;
    }, 100);
  });
</script>

<div class="mx-4">
  <div class={`max-w-2xl mx-auto p-6 rounded-lg transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
    {#if form?.success}
      <div class="p-4 mb-4 text-sm text-green-400 bg-green-800 rounded-lg" role="alert">
        Registration successful!
      </div>
    {/if}
    {#if form?.error && !form?.field}
      <div class="p-4 mb-4 text-sm text-red-400 bg-red-800 rounded-lg" role="alert">
        {form.error}
      </div>
    {/if}

    <!-- Always-visible countdown (moved outside conditional) -->
    <div class="bg-gray-800 rounded-lg p-6 text-center border border-amber-400/30 mb-6">
      <h2 class="text-2xl mb-4 text-white">Registration Countdown</h2>
      <RegistrationCountdown />
    </div>

    <div class="bg-gray-900 rounded-lg p-8 shadow-lg border border-amber-400/30">
      <div class="flex items-center justify-center mb-6">
        <div class="h-px w-16 bg-amber-400"></div>
        <h1 class="text-2xl font-bold text-center mx-4 text-white">Register on Dancepoint</h1>
        <div class="h-px w-16 bg-amber-400"></div>
      </div>

      <p class="text-white mb-4">
        Registration will take place on <a class="text-amber-300 underline" href="https://dancepoint.no" target="_blank" rel="noopener noreferrer">dancepoint.no</a>.
        You will need to create an account there and register for the event.
      </p>

      {#if today <= regOpenDate}
        <p class="text-white/80">Registration is not open yet; please visit Dancepoint when registration opens.</p>
      {:else}
        <p class="text-white/80">When registration opens, please use Dancepoint to complete your registration.</p>
      {/if}
    </div>
  </div>
</div>

<style global>
  h1, h2, h3 {
    font-family: 'NorseBold';
  }
</style>