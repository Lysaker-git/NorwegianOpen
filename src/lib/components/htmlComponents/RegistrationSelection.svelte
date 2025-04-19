<script lang="ts">
    import type { Region } from '$lib/components/utils';
    export let selectedRegion: Region | null = null;
    export let formError: string | null = null;
</script>

<fieldset class="border border-gray-300 p-4 rounded-md">
    <legend class="text-base font-medium text-gray-900 px-2">1. Select Your Region *</legend>
    <div class="mt-2 flex flex-col sm:flex-row sm:gap-4 space-y-2 sm:space-y-0">
        <button 
            type="button"
            id="regionNordic"
            class="flex-grow py-2 px-4 border {selectedRegion === 'Nordic' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-gray-700 border-gray-300'} rounded-md text-sm font-medium transition-colors shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            on:click={() => selectedRegion = 'Nordic'}
        >
            Nordic (SE, NO, DK, FI, IS)
        </button>
        
        <button 
            type="button"
            id="regionWorld"
            class="flex-grow py-2 px-4 border {selectedRegion === 'World' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-gray-700 border-gray-300'} rounded-md text-sm font-medium transition-colors shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            on:click={() => selectedRegion = 'World'}
        >
            Rest of World
        </button>
    </div>
    
    <!-- Hidden radio inputs to maintain form submission behavior -->
    <div class="hidden">
        <input type="radio" name="Region" value="Nordic" checked={selectedRegion === 'Nordic'} required>
        <input type="radio" name="Region" value="World" checked={selectedRegion === 'World'} required>
    </div>
    
    {#if formError}
        <p class="text-red-600 text-sm mt-1">{formError}</p>
    {/if}
</fieldset>