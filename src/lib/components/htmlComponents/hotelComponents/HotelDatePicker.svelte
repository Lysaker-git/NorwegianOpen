<script lang="ts">
    export let availableDates: string[];
    export let checkInDate: string;
    export let checkOutDate: string;
    export let selectDate: (date: string) => void;
    export let isInRange: (date: string) => boolean;
</script>

<div class="mb-4">
    <label class="block text-sm font-medium mb-2">Select your stay dates:</label>
    <div class="flex justify-center gap-0 flex-wrap mb-2">
        {#each availableDates as date, i (date)}
            <button
                type="button"
                class={`px-4 py-2 border border-indigo-200
                    ${i === 0 ? 'rounded-l-2xl' : ''}
                    ${i === availableDates.length - 1 ? 'rounded-r-2xl' : ''}
                    ${date === checkInDate || date === checkOutDate
                        ? 'bg-indigo-600 text-white font-bold'
                        : isInRange(date)
                            ? 'bg-indigo-200 text-indigo-800'
                            : 'bg-gray-200 text-gray-800 hover:bg-indigo-100'}
                    ${i !== 0 ? 'border-l-0' : ''}
                    transition-colors duration-150`}
                on:click={() => selectDate(date)}
                style="min-width: 90px"
            >
                {new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
            </button>
        {/each}
    </div>
    <div class="mt-2 text-sm text-gray-400">
        {#if checkInDate && checkOutDate}
            Selected: {new Date(checkInDate).toLocaleDateString()} – {new Date(checkOutDate).toLocaleDateString()}
        {:else if checkInDate}
            Selected: {new Date(checkInDate).toLocaleDateString()} (choose check-out)
        {/if}
    </div>
</div>