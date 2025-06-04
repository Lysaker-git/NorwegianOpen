<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    export let data;

    let nordicChartContainer: HTMLDivElement;
    let worldChartContainer: HTMLDivElement;
    let nordicPassChartContainer: HTMLDivElement;
    let worldPassChartContainer: HTMLDivElement;
    let nordicTierChartContainer: HTMLDivElement;
    let worldTierChartContainer: HTMLDivElement;

    const levels = ['Newcomer', 'Novice', 'Intermediate', 'Advanced', 'All-Star'];
    const colors = d3.scaleOrdinal()
        .domain(levels)
        .range(['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f']);
    
    const formatCurrency = (value: number) => `${value.toLocaleString('no-NO')} NOK`;

    type ChartType = 'level' | 'pass' | 'tier';
    
    interface ChartData {
        key: string;
        count: number;
        income?: number;
    }

    interface ChartOptions {
        data: ChartData[];
        title: string;
        type: ChartType;
        container: HTMLDivElement;
    }

    onMount(() => {
        if (browser) {
            // Level distribution charts
            drawChart({
                container: nordicChartContainer,
                data: levels.map(level => ({
                    key: level,
                    count: data.nordicLevelCounts[level] || 0
                })),
                title: 'Nordic Level Distribution',
                type: 'level'
            });

            drawChart({
                container: worldChartContainer,
                data: levels.map(level => ({
                    key: level,
                    count: data.worldLevelCounts[level] || 0
                })),
                title: 'World Level Distribution',
                type: 'level'
            });

            // Pass distribution charts
            drawChart({
                container: nordicPassChartContainer,
                data: Object.entries(data.nordicPassCounts).map(([pass, count]) => ({
                    key: pass,
                    count,
                    income: data.nordicPassIncome[pass]
                })),
                title: 'Nordic Pass Distribution',
                type: 'pass'
            });

            drawChart({
                container: worldPassChartContainer,
                data: Object.entries(data.worldPassCounts).map(([pass, count]) => ({
                    key: pass,
                    count,
                    income: data.worldPassIncome[pass]
                })),
                title: 'World Pass Distribution',
                type: 'pass'
            });

            // Price tier charts
            drawChart({
                container: nordicTierChartContainer,
                data: Object.entries(data.nordicTierCounts).map(([tier, count]) => ({
                    key: tier,
                    count,
                    income: data.nordicTierIncome[tier]
                })),
                title: 'Nordic Price Tiers',
                type: 'tier'
            });

            drawChart({
                container: worldTierChartContainer,
                data: Object.entries(data.worldTierCounts).map(([tier, count]) => ({
                    key: tier,
                    count,
                    income: data.worldTierIncome[tier]
                })),
                title: 'World Price Tiers',
                type: 'tier'
            });
        }
    });

    function drawChart(options: ChartOptions) {
        const { container, data, title, type } = options;
        if (!container || !data.length) return;

        // Clear container
        d3.select(container).selectAll("*").remove();

        // Set dimensions
        const margin = { top: 40, right: 20, bottom: type === 'level' ? 40 : 60, left: 60 };
        const width = container.clientWidth - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(container)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "#f59e0b")
            .text(title);

        // Create scales
        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(d => d.key))
            .padding(0.1);

        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, d => d.count) || 0]).nice();

        // Create color scale
        const colorScale = type === 'level'
            ? colors
            : d3.scaleOrdinal()
                .domain(data.map(d => d.key))
                .range(['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24']);

        // Add bars
        svg.selectAll(".bar")
            .data(data)
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.key)!)
            .attr("width", x.bandwidth())
            .attr("y", d => y(d.count))
            .attr("height", d => height - y(d.count))
            .attr("fill", d => colorScale(d.key))
            .on("mouseover", function(event, d) {
                d3.select(this).attr("opacity", 0.8);
                
                // Show tooltip
                const tooltip = svg.append("g")
                    .attr("class", "tooltip")
                    .attr("transform", `translate(${x(d.key)! + x.bandwidth() / 2},${y(d.count) - 10})`);

                if (d.income !== undefined) {
                    // Show both count and income
                    tooltip.append("text")
                        .attr("text-anchor", "middle")
                        .attr("dy", "-1.2em")
                        .style("fill", "#f59e0b")
                        .text(`Count: ${d.count}`);
                    
                    tooltip.append("text")
                        .attr("text-anchor", "middle")
                        .attr("dy", "0em")
                        .style("fill", "#f59e0b")
                        .text(`Income: ${formatCurrency(d.income)}`);
                } else {
                    // Show only count
                    tooltip.append("text")
                        .attr("text-anchor", "middle")
                        .style("fill", "#f59e0b")
                        .text(`Count: ${d.count}`);
                }
            })
            .on("mouseout", function() {
                d3.select(this).attr("opacity", 1);
                svg.selectAll(".tooltip").remove();
            });

        // Add X axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("fill", "#9ca3af")
            .style("font-size", "12px")
            .attr("transform", type === 'level' ? undefined : "rotate(-45)")
            .style("text-anchor", type === 'level' ? "middle" : "end");

        // Add Y axis
        svg.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .selectAll("text")
            .style("fill", "#9ca3af")
            .style("font-size", "12px");

        // Add grid lines
        svg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-width)
                .tickFormat(() => '')
            )
            .style("stroke", "#374151")
            .style("stroke-opacity", "0.1");

        // Add Y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left)
            .attr("x", -height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "#9ca3af")
            .style("font-size", "12px")
            .text(type === 'level' ? "Number of Registrations" : "Count / Income (NOK)");
    }
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
                <td class="px-4 py-3">{data.totalIncome.toLocaleString('no-NO')}</td>
                <td class="px-4 py-3">{data.totalNordicIncome.toLocaleString('no-NO')}</td>
                <td class="px-4 py-3">{data.totalWorldIncome.toLocaleString('no-NO')}</td>
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

    <div class="grid gap-8 mb-8">
        <!-- Nordic charts -->
        <div class="space-y-8">
            <div class="bg-gray-800 p-6 rounded-lg shadow">
                <div bind:this={nordicChartContainer} class="w-full"></div>
            </div>
            <div class="bg-gray-800 p-6 rounded-lg shadow">
                <div bind:this={nordicPassChartContainer} class="w-full"></div>
            </div>
            <div class="bg-gray-800 p-6 rounded-lg shadow">
                <div bind:this={nordicTierChartContainer} class="w-full"></div>
            </div>
        </div>
        
        <!-- World charts -->
        <div class="space-y-8">
            <div class="bg-gray-800 p-6 rounded-lg shadow">
                <div bind:this={worldChartContainer} class="w-full"></div>
            </div>
            <div class="bg-gray-800 p-6 rounded-lg shadow">
                <div bind:this={worldPassChartContainer} class="w-full"></div>
            </div>
            <div class="bg-gray-800 p-6 rounded-lg shadow">
                <div bind:this={worldTierChartContainer} class="w-full"></div>
            </div>
        </div>
    </div>
{/if}

<style>
    :global(.bar:hover) {
        cursor: pointer;
    }
    
    :global(.grid line) {
        stroke-dasharray: 2,2;
    }
    
    :global(.grid path) {
        stroke-width: 0;
    }
</style>