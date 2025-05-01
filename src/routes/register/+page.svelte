<script lang="ts">
    import type { ActionData } from './$types';
    import { REG_OPEN_STRING } from '$lib/components/constants';
    import RegistrationCountdown from '$lib/components/htmlComponents/RegistrationCountdown.svelte';
    import RegistrationForm from '$lib/components/htmlComponents/RegistrationForm.svelte';
    import { onMount } from 'svelte';
  
    export let form: ActionData;
  
    const regOpenDate = new Date(REG_OPEN_STRING + 'T17:00:00');
    const today = new Date();
    let isVisible = false;
  
    onMount(() => {
      setTimeout(() => {
        isVisible = true;
      }, 100);
    });
  </script>
  
  <div class={`max-w-2xl mx-auto p-6 rounded-lg shadow-md transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style="background-color: #1e293b;">
    {#if form?.success}
      <div class="p-4 mb-4 text-sm text-green-400 bg-green-800 rounded-lg" role="alert">
        Registration successful! Please check your email for confirmation.
      </div>
    {/if}
    {#if form?.error && !form?.field}
      <div class="p-4 mb-4 text-sm text-red-400 bg-red-800 rounded-lg" role="alert">
        {form.error}
      </div>
    {/if}
  
    {#if today <= regOpenDate}
      <div class="bg-gray-900 rounded-lg p-6 text-center border border-amber-400/30">
        <h1 class="text-4xl mb-4">Registration Not Open Yet</h1>
        <!-- <p class="text-lg text-gray-300">
          Registration will open on {regOpenDate.toLocaleDateString()} at {regOpenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} CEST.
          Stay tuned for the saga to begin!
        </p> -->
      </div>
    {:else}
      <div class="bg-gray-900 rounded-lg p-8 shadow-lg border border-amber-400/30">
        <div class="flex items-center justify-center mb-6">
          <div class="h-px w-16 bg-amber-400"></div>
          <h1 class="text-2xl font-bold text-center mx-4">Registration Form</h1>
          <div class="h-px w-16 bg-amber-400"></div>
        </div>
        <RegistrationForm {form} />
      </div>
    {/if}
  </div>
  
  <style global>
    h1, h2, h3 {
      font-family: 'NorseBold';
    }
  </style>