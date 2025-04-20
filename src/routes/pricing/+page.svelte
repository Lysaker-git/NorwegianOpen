
<script lang="ts">
	// --- Pricing Data (Copied from your structure) ---
	const basePrices = {
		Ymir: { Nordic: 1700, World: 1900 },      // Early Bird
		Midgard: { Nordic: 1900, World: 2100 },   // Regular
		Ragnarok: { Nordic: 2100, World: 2300 }   // Late Bird
	};

	const passOptionsByLevel = {
		'All-Star': ['Regular Pass', 'Judge (Free Pass)', 'Party Pass'],
		'Advanced': ['Regular Pass', 'Judge (20% Discount)', 'Party Pass'],
		'Other': ['Regular Pass', 'Party Pass'] // For Intermediate/Novice/Newcomer
	};

	const partyPassPrice = 1200; // Party pass price is fixed
    const currencySymbol = 'NOK'; // Or SEK, EUR, USD etc. - Change as needed

    // --- Data structure for easier iteration ---
    const tiers = [
        { name: 'Ymir', title: '❄️ Ymir (Early Bird)', deadline: 'Ends Oct 31st' }, // Add deadlines for clarity
        { name: 'Midgard', title: '🌍 Midgard (Regular)', deadline: 'Ends Dec 31st' },
        { name: 'Ragnarok', title: '🔥 Ragnarok (Late Bird)', deadline: 'From Jan 1st' }
    ];

    const levels = [
        { name: 'All-Star', title: 'All-Star' },
        { name: 'Advanced', title: 'Advanced' },
        { name: 'Other', title: 'Other' } // Use descriptive title
    ];

    // --- Helper to calculate final price display ---
    function getPriceDetails(levelName: 'All-Star' | 'Advanced' | 'Other', region: 'Nordic' | 'World', tierName: 'Ymir' | 'Midgard' | 'Ragnarok'): { price: number | string; note?: string } {
        const base = basePrices[tierName]?.[region];
        if (base === undefined) return { price: 'N/A' }; // Should not happen

        const options = passOptionsByLevel[levelName];
        let regularPrice = base;
        let judgePrice: number | string | null = null;
        let judgeNote: string | undefined = undefined;

        if (options.includes('Judge (Free Pass)')) {
            judgePrice = 0;
            judgeNote = "Free for Judging";
        } else if (options.includes('Judge (20% Discount)')) {
            judgePrice = Math.round(base * 0.80);
             judgeNote = `20% off for Judging (Reg: ${base.toLocaleString()})`;
        }

        // Construct the display. Prioritize Judge price if available
        if (judgePrice !== null) {
            return { price: judgePrice, note: judgeNote };
        } else {
            return { price: regularPrice }; // Only Regular Pass available (for 'Other')
        }
    }

</script>

<div class="container mx-auto px-4 py-12">

    <h1 class="text-3xl sm:text-4xl font-bold text-center mb-10 text-gray-100 font-[NorseBold]">
        Pricing Tiers - [Event Name]
    </h1>

    <div class="max-w-4xl mx-auto overflow-x-auto bg-gray-800 shadow-lg rounded-lg border border-gray-700">
        <table class="w-full min-w-[700px] text-sm text-left text-gray-300 table-fixed">
            <thead class="text-xs text-gray-300 uppercase bg-gray-900 sticky top-0 z-10">
                <tr>
                    <th scope="col" class="px-4 py-4 w-1/4 font-semibold">Level / Region</th>
                    {#each tiers as tier}
                        <th scope="col" class="px-4 py-4 w-1/4 text-center font-semibold">
                            <div class="flex flex-col items-center">
                                <span>{tier.title}</span>
                                <span class="text-xs font-normal normal-case text-gray-400">{tier.deadline}</span>
                            </div>
                        </th>
                    {/each}
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
                {#each levels as level}
                    <!-- Nordic Row for the Level -->
                    <tr class="bg-gray-800 hover:bg-gray-700/50 transition-colors duration-150">
                        <td class="px-4 py-3 font-medium text-gray-100 whitespace-nowrap align-top row-span-2 border-r border-gray-700" rowspan="2">
                           <div class="font-semibold">{level.title}</div>
                           {#if level.name !== 'Other'}
                             <div class="text-xs text-gray-400 mt-1">Includes Judge Option</div>
                           {:else}
                              <div class="text-xs text-gray-400 mt-1">Regular / Party Pass</div>
                           {/if}
                        </td>
                        <td class="px-4 py-3 text-gray-400 font-medium border-r border-gray-700">Nordic</td>
                        {#each tiers as tier}
                            {@const details = getPriceDetails(level.name, 'Nordic', tier.name)}
                            <td class="px-4 py-3 text-center">
                                <span class="text-lg font-semibold text-gray-100">
                                    {typeof details.price === 'number' ? details.price.toLocaleString() : details.price}
                                </span>
                                {#if typeof details.price === 'number'} <span class="text-xs text-gray-400">{currencySymbol}</span> {/if}
                                {#if details.note}
                                    <div class="text-xs text-blue-300 mt-0.5">{details.note}</div>
                                {/if}
                            </td>
                        {/each}
                    </tr>
                    <!-- World Row for the Level -->
                     <tr class="bg-gray-800/70 hover:bg-gray-700/50 transition-colors duration-150">
                        <td class="px-4 py-3 text-gray-400 font-medium border-r border-gray-700">World</td>
                         {#each tiers as tier}
                            {@const details = getPriceDetails(level.name, 'World', tier.name)}
                            <td class="px-4 py-3 text-center">
                                <span class="text-lg font-semibold text-gray-100">
                                    {typeof details.price === 'number' ? details.price.toLocaleString() : details.price}
                                </span>
                                {#if typeof details.price === 'number'} <span class="text-xs text-gray-400">{currencySymbol}</span> {/if}
                                {#if details.note}
                                    <div class="text-xs text-blue-300 mt-0.5">{details.note}</div>
                                {/if}
                            </td>
                        {/each}
                    </tr>
                {/each}

                <!-- Party Pass Row -->
                <tr class="bg-gray-900 border-t-2 border-gray-600">
                    <td class="px-4 py-3 font-semibold text-gray-100 whitespace-nowrap" colspan="2"> <!-- Span Level and Region columns -->
                        Party Pass
                        <div class="text-xs text-gray-400 font-normal">Access to evening dances</div>
                    </td>
                    <td class="px-4 py-3 text-center font-semibold text-gray-100" colspan="3"> <!-- Span all Tier columns -->
                         <span class="text-lg">{partyPassPrice.toLocaleString()}</span>
                         <span class="text-xs text-gray-400">{currencySymbol}</span>
                         <div class="text-xs text-gray-400 font-normal">(Price same for all tiers & regions)</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="text-center mt-6 text-xs text-gray-400 max-w-2xl mx-auto">
        <p>Prices are shown in {currencySymbol}. Judge options require application and approval (details on registration form).</p>
        <p>"Other" category includes Intermediate, Novice, and Newcomer levels.</p>
    </div>

</div>