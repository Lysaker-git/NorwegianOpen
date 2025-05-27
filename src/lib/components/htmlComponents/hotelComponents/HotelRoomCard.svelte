<script lang="ts">
    export let option: {
        key: string;
        label: string;
        description: string;
        price: number;
        image?: string;
        features?: string[];
    };
    export let selected: boolean = false;
    export let onSelect: (key: string) => void;
</script>

<button
    class={`rounded-lg shadow-md border-2 transition-all duration-150 cursor-pointer
        ${selected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-700 bg-gray-900 hover:border-indigo-400'}`}
    on:click={() => onSelect(option.key)}
    tabindex="0"
    aria-pressed={selected}
>
    {#if option.image}
        <img src={option.image} alt={option.label} class="w-full h-40 object-cover rounded-t-lg" />
    {/if}
    <div class="p-4">
        <h4 class="text-lg font-semibold mb-1">{option.label}</h4>
        <p class="text-sm text-gray-300 mb-2">{option.description}</p>
        <div class="text-indigo-500 font-bold mb-2">{option.price.toLocaleString()} NOK/night</div>
        {#if option.features}
            <ul class="text-xs text-gray-400 list-disc list-inside mb-2">
                {#each option.features as feature}
                    <li>{feature}</li>
                {/each}
            </ul>
        {/if}
        {#if selected}
            <span class="inline-block px-2 py-1 text-xs bg-indigo-600 text-white rounded">Selected</span>
        {/if}
    </div>
</button>