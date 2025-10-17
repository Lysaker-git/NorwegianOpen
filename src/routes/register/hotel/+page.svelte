<script lang="ts">
    import type { ActionData } from './$types';
    import type { PageData } from '../$types';
    import { regOpenDate, today } from '$lib/components/constants';
    import RegistrationForm from '$lib/components/htmlComponents/RegistrationForm.svelte';
    import HotelRegistration from '$lib/components/htmlComponents/hotelRegistration.svelte';
    import { onMount } from 'svelte';
    import MailList from '$lib/components/htmlComponents/MailList.svelte';
    export let form: ActionData;
    export let data: PageData;
    
    let isVisible = false;
  
    onMount(() => {
      setTimeout(() => {
        isVisible = true;
      }, 100);
    });
  </script>  <div class="mx-2 sm:mx-4 md:mx-6">
      <div class={`max-w-3xl mx-auto p-3 sm:p-4 md:p-6 rounded-lg transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
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
    
          <div class="bg-gray-900 rounded-lg p-4 sm:p-6 md:p-8 shadow-lg border border-amber-400/30">
            <div class="flex items-center justify-center mb-6">
              <div class="h-px w-16 bg-amber-400"></div>
              <h1 class="text-2xl font-bold text-center mx-4 text-white">Hotel Registration</h1>
              <div class="h-px w-16 bg-amber-400"></div>
            </div>
            <div class="p-4 mb-4 text-sm text-yellow-300 bg-yellow-900 rounded-lg text-center" role="alert">
              Hotel booking through our page is now closed. <br>
              If you still need a room, please contact <a href="https://www.scandichotels.no/hamar" target="_blank" rel="noopener noreferrer" class="underline text-amber-300 hover:text-amber-400">Scandic Hamar</a> directly.
            </div>
            <!-- <HotelRegistration {form} {data} /> -->
          </div>
      </div>
  </div>
  
  <style global>
    h1 {
      font-family: 'NorseBold';
    }
  </style>