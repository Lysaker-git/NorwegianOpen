<script lang="ts">
    // Constants for pricing table
    const currencySymbol = 'NOK'; // Or SEK, EUR, USD etc.

    // Pricing tiers with descriptions
    const tiers = [
        { name: 'Ymir', title: '❄️ Ymir', subtitle: 'Early Bird', deadline: 'Ends May 29th' },
        { name: 'Midgard', title: '🌍 Midgard', subtitle: 'Regular', deadline: 'Ends Aug 22nd' },
        { name: 'Ragnarok', title: '🔥 Ragnarok', subtitle: 'Late Bird', deadline: 'From 23rd Aug' }
    ];

    // Data structure for the pricing table rows
    interface PriceRow {
        level: string;
        levelRowSpan?: number;   // How many rows this level spans
        regions: RegionPrice[];  // One or more regions for this level
    }

    interface RegionPrice {
        region: string;
        prices: Price[];        // One price for each tier
    }

    interface Price {
        amount: number;
        note?: string;         // Optional note (e.g., judging discount)
    }

    // Table data structure based on the CSV
    const priceRows: PriceRow[] = [
        {
            level: 'Full Pass',
            levelRowSpan: 2,
            regions: [
                {
                    region: 'Nordic',
                    prices: [
                        { amount: 1800 },
                        { amount: 2000 },
                        { amount: 2200 }
                    ]
                },
                {
                    region: 'World',
                    prices: [
                        { amount: 1500 },
                        { amount: 1700 },
                        { amount: 1900 }
                    ]
                }
            ]
        },
        {
            level: 'Zero to Hero',
            levelRowSpan: 1,
            regions: [
                {
                    region: 'All Regions',
                    prices: [
                        { amount: 1300 },
                        { amount: 1300 },
                        { amount: 1300 }
                    ]
                }
            ]
        },
        {
            level: 'Party Pass',
            levelRowSpan: 1,
            regions: [
                {
                    region: 'All Regions',
                    prices: [
                        { amount: 1200, note: "First 50 passes" },
                        { amount: 1200 },
                        { amount: 1200 }
                    ]
                }
            ]
        },
        {
            level: 'Blues Intensive with Joel & Chantelle',
            levelRowSpan: 1,
            regions: [
                {
                    region: 'All Regions',
                    prices: [
                        { amount: 1000 },
                        { amount: 1000 },
                        { amount: 1000 }
                    ]
                }
            ]
        }
    ];

    const passDescriptions = {
        'Full Pass': 'You will get acces to all workshops, evening dances, and competitions.',
        'Zero to Hero': `A weekend-long, beginner-friendly track designed for brand-new or less experienced dancers. You'll get guided workshops, personal support, and encouragement to help you feel comfortable on the social floor and ready for the Newcomer Jack & Jill. The program includes fun, confidence-building sessions each day, with a focus on community and empowerment. You can register as a single follow/lead and will be partnered up or put on the waiting list.`,
        'Party Pass': 'Access to evening dances and competitions only.',
        'Blues Intensive': 'Focused blues workshop and events with Joel and Chantelle.'
    };
</script>

<div class="container mx-auto px-4 py-12">
    <h1 class="text-3xl sm:text-4xl font-bold text-center mb-10 text-gray-100 font-[NorseBold]">
        Pricing Tiers - Norwegian Open 2025
    </h1>

    <div class="max-w-4xl mx-auto overflow-x-auto bg-gray-800 shadow-lg rounded-lg border border-gray-700">
        <table class="w-full min-w-[700px] text-sm text-left text-gray-300">
            <!-- Table Header -->
            <thead class="text-xs text-gray-300 uppercase bg-gray-900 sticky top-0 z-10">
                <tr>
                    <th scope="col" class="px-4 py-4 font-semibold">Dancer Level</th>
                    <th scope="col" class="px-4 py-4 font-semibold">Region</th>
                    {#each tiers as tier}
                        <th scope="col" class="px-4 py-4 text-center font-semibold">
                            <div class="flex flex-col items-center">
                                <span>{tier.title}</span>
                                <span class="text-xs font-normal normal-case text-gray-400">{tier.subtitle}</span>
                                <span class="text-xs font-normal normal-case text-gray-400">{tier.deadline}</span>
                            </div>
                        </th>
                    {/each}
                </tr>
            </thead>
            
            <!-- Table Body -->
            <tbody class="divide-y divide-gray-700">
                {#each priceRows as priceRow, rowIndex}
                    {#each priceRow.regions as regionData, regionIndex}
                        <!-- MODIFICATION: Moved @const here -->
                        {@const pricesAreUniform = regionData.prices.length > 0 && regionData.prices.every(p => p.amount === regionData.prices[0].amount)}
                        
                        <tr class={regionIndex % 2 === 1 ? "bg-gray-800/70" : "bg-gray-800"} 
                            class:border-t-2={rowIndex > 0 && regionIndex === 0 && rowIndex < priceRows.length - 1}
                            class:border-gray-600={rowIndex > 0 && regionIndex === 0 && rowIndex < priceRows.length - 1}
                            class:bg-gray-900={(rowIndex === priceRows.length - 1) || pricesAreUniform }>
                            
                            {#if regionIndex === 0}
                                <td class="px-4 py-3 font-medium text-gray-100 border-r border-gray-700" 
                                    rowspan={priceRow.levelRowSpan}>
                                    <div class="font-semibold">{priceRow.level}</div>
                                    {#if priceRow.level === 'Party Pass'}
                                        <div class="text-xs text-gray-400 mt-1">Access to evening dances and competitions</div>
                                    {/if}
                                </td>
                            {/if}
                            
                            <td class="px-4 py-3 font-medium text-gray-200 border-r border-gray-700">
                                {#if regionData.region === 'Nordic'}
                                    <div class="flex items-center">
                                        <span class="mr-1">🏔️</span> {regionData.region}
                                    </div>
                                {:else if regionData.region === 'World'}
                                    <div class="flex items-center">
                                        <span class="mr-1">🌎</span> {regionData.region}
                                    </div>
                                {:else}
                                    <div class="flex items-center">
                                        <span class="mr-1">🌐</span> {regionData.region}
                                    </div>
                                {/if}
                            </td>
                            
                            {#if pricesAreUniform}
                                <!-- If prices are uniform, render one cell spanning all tier columns -->
                                <td class="px-4 py-3 text-center" colspan={tiers.length}>
                                    <span class="text-lg font-semibold text-gray-100">
                                        {regionData.prices[0].amount.toLocaleString()}
                                    </span>
                                    <span class="text-xs text-gray-400">{currencySymbol}</span>
                                    
                                    {#if regionData.prices[0].note}
                                        <div class="text-xs text-blue-300 mt-0.5">{regionData.prices[0].note}</div>
                                    {/if}
                                </td>
                            {:else}
                                <!-- Otherwise, render each price cell individually -->
                                {#each regionData.prices as price, tierIndex}
                                    <td class="px-4 py-3 text-center">
                                        <span class="text-lg font-semibold text-gray-100">
                                            {price.amount.toLocaleString()}
                                        </span>
                                        <span class="text-xs text-gray-400">{currencySymbol}</span>
                                        
                                        {#if price.note}
                                            <div class="text-xs text-blue-300 mt-0.5">{price.note}</div>
                                        {/if}
                                    </td>
                                {/each}
                            {/if}
                        </tr>
                    {/each}
                {/each}
            </tbody>
        </table>
    </div>

    <div class="text-center mt-6 text-xs text-gray-400 max-w-2xl mx-auto">
        <p class="mb-2">All star gets free pass if they judge during the event, Advanced get 20% discount for judging services</p>
        <p>Prices are shown in {currencySymbol}. Judge options require registration and approval from Event Director.</p>
    </div>
</div>
<div class="max-w-3xl mx-auto mt-10 space-y-8">
    {#each Object.keys(passDescriptions) as passName}
        <section class="bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-bold text-amber-300 mb-2 font-[NorseBold]">{passName}</h2>
            <p class="text-gray-300">
                {passDescriptions[passName]}
            </p>
        </section>
    {/each}
</div>