<script lang="ts">
    export let data;
</script>

<h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>

{#if data.error}
    <p class="text-red-500">{data.error}</p>
{:else}
    <table class="min-w-full bg-gray-800 rounded shadow mb-8 border border-gray-700">
        <thead class="bg-gray-900">
            <tr>
                <th class="px-4 py-3 text-left font-semibold text-amber-400 border-b border-gray-700">Category</th>
                <th class="px-4 py-3 text-left font-semibold text-amber-400 border-b border-gray-700">Total</th>
                <th class="px-4 py-3 text-left font-semibold text-amber-400 border-b border-gray-700">Nordic</th>
                <th class="px-4 py-3 text-left font-semibold text-amber-400 border-b border-gray-700">World</th>
            </tr>
        </thead>
        <tbody>
            <tr class="border-t border-gray-700 hover:bg-gray-700/30">
                <td class="px-4 py-3 font-semibold">Income (NOK)</td>
                <td class="px-4 py-3">{data.totalIncome}</td>
                <td class="px-4 py-3">{data.totalNordicIncome}</td>
                <td class="px-4 py-3">{data.totalWorldIncome}</td>
            </tr>
            <tr class="border-t border-gray-700 align-top hover:bg-gray-700/30">
                <td class="px-4 py-3 font-semibold">Registrations per Level</td>
                <td class="px-4 py-3">
                    <ul>
                        {#each Object.entries(
                            Object.entries(data.nordicLevelCounts ?? {})
                                .concat(Object.entries(data.worldLevelCounts ?? {}))
                                .reduce((acc, [level, count]) => {
                                    acc[level] = (acc[level] || 0) + count;
                                    return acc;
                                }, {})
                        ) as [level, count]}
                            <li class="mb-1">{level}: <span class="font-bold">{count}</span></li>
                        {/each}
                    </ul>
                </td>
                <td class="px-4 py-3">
                    <ul>
                        {#each Object.entries(data.nordicLevelCounts ?? {}) as [level, count]}
                            <li class="mb-1">{level}: <span class="font-bold">{count}</span></li>
                        {/each}
                    </ul>
                </td>
                <td class="px-4 py-3">
                    <ul>
                        {#each Object.entries(data.worldLevelCounts ?? {}) as [level, count]}
                            <li class="mb-1">{level}: <span class="font-bold">{count}</span></li>
                        {/each}
                    </ul>
                </td>
            </tr>
            <tr class="border-t border-gray-700 align-top hover:bg-gray-700/30">
                <td class="px-4 py-3 font-semibold">Registrations per Region</td>
                <td class="px-4 py-3">
                    <ul>
                        {#each Object.entries(
                            Object.entries(data.nordicRegionCounts ?? {})
                                .concat(Object.entries(data.worldRegionCounts ?? {}))
                                .reduce((acc, [region, count]) => {
                                    acc[region] = (acc[region] || 0) + count;
                                    return acc;
                                }, {})
                        ) as [region, count]}
                            <li class="mb-1">{region}: <span class="font-bold">{count}</span></li>
                        {/each}
                    </ul>
                </td>
                <td class="px-4 py-3">
                    <ul>
                        {#each Object.entries(data.nordicRegionCounts ?? {}) as [region, count]}
                            <li class="mb-1">{region}: <span class="font-bold">{count}</span></li>
                        {/each}
                    </ul>
                </td>
                <td class="px-4 py-3">
                    <ul>
                        {#each Object.entries(data.worldRegionCounts ?? {}) as [region, count]}
                            <li class="mb-1">{region}: <span class="font-bold">{count}</span></li>
                        {/each}
                    </ul>
                </td>
            </tr>
            <tr class="border-t border-gray-700 align-top hover:bg-gray-700/30">
                <td class="px-4 py-3 font-semibold">Registrations per Role</td>
                <td class="px-4 py-3">
                    <ul>
                        {#each Object.entries(
                            Object.entries(data.nordicRoleCounts ?? {})
                                .concat(Object.entries(data.worldRoleCounts ?? {}))
                                .reduce((acc, [role, count]) => {
                                    acc[role] = (acc[role] || 0) + count;
                                    return acc;
                                }, {})
                        ) as [role, count]}
                            <li class="mb-1">{role}: <span class="font-bold">{count}</span></li>
                        {/each}
                    </ul>
                </td>
                <td class="px-4 py-3">
                    <ul>
                        {#each Object.entries(data.nordicRoleCounts ?? {}) as [role, count]}
                            <li class="mb-1">{role}: <span class="font-bold">{count}</span></li>
                        {/each}
                    </ul>
                </td>
                <td class="px-4 py-3">
                    <ul>
                        {#each Object.entries(data.worldRoleCounts ?? {}) as [role, count]}
                            <li class="mb-1">{role}: <span class="font-bold">{count}</span></li>
                        {/each}
                    </ul>
                </td>
            </tr>
        </tbody>
    </table>
{/if}