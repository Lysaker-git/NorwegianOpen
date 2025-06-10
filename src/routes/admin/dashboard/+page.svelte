<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    export let data;

    const INCOME_GOAL = 380000; // NOK
    const calculateProgress = (amount: number) => (amount / INCOME_GOAL) * 100;
    const getProgressColor = (amount: number) => amount >= INCOME_GOAL ? 'bg-green-500' : 'bg-red-500';
    const getTextColor = (amount: number) => amount >= INCOME_GOAL ? 'text-green-400' : 'text-red-400';

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

    interface LevelBreakdown {
        total: number;
        leaders: number;
        followers: number;
        attending: number;
        waitingList: number;
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
    <!-- Income Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <!-- Total Income Card -->
        <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-amber-400 mb-2">Total Income</h3>
            <div class="text-2xl font-bold mb-2 {getTextColor(data.totalIncome)}">
                {data.totalIncome.toLocaleString('no-NO')} NOK
            </div>
            {#if data.potentialIncome > 0}
                <div class="text-sm text-gray-400 mb-4">
                    Potential: +{data.potentialIncome.toLocaleString('no-NO')} NOK
                </div>
            {/if}
            <div class="relative pt-1">
                <div class="flex mb-2 items-center justify-between">
                    <div>
                        <span class="text-xs font-semibold inline-block text-gray-400">
                            Progress to {INCOME_GOAL.toLocaleString('no-NO')} NOK
                        </span>
                    </div>
                    <div class="text-right">
                        <span class="text-xs font-semibold inline-block {getTextColor(data.totalIncome)}">
                            {Math.round(calculateProgress(data.totalIncome))}%
                        </span>
                    </div>
                </div>
                <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                    <div
                        class="transition-all duration-500 {getProgressColor(data.totalIncome)}"
                        style="width: {Math.min(calculateProgress(data.totalIncome), 100)}%"
                    ></div>
                </div>
            </div>
        </div>

        <!-- Nordic Income Card -->
        <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-amber-400 mb-2">Nordic Income</h3>
            <div class="text-2xl font-bold mb-2 text-gray-200">
                {data.totalNordicIncome.toLocaleString('no-NO')} NOK
            </div>
            {#if data.potentialNordicIncome > 0}
                <div class="text-sm text-gray-400 mb-2">
                    Potential: +{data.potentialNordicIncome.toLocaleString('no-NO')} NOK
                </div>
            {/if}
            <div class="text-sm text-gray-400">
                {Math.round((data.totalNordicIncome / data.totalIncome) * 100)}% of confirmed income
            </div>
        </div>

        <!-- World Income Card -->
        <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-amber-400 mb-2">World Income</h3>
            <div class="text-2xl font-bold mb-2 text-gray-200">
                {data.totalWorldIncome.toLocaleString('no-NO')} NOK
            </div>
            {#if data.potentialWorldIncome > 0}
                <div class="text-sm text-gray-400 mb-2">
                    Potential: +{data.potentialWorldIncome.toLocaleString('no-NO')} NOK
                </div>
            {/if}
            <div class="text-sm text-gray-400">
                {Math.round((data.totalWorldIncome / data.totalIncome) * 100)}% of confirmed income
            </div>
        </div>
    </div>

    <!-- Registrations by Level Cards -->
    <div class="mb-8">
        <h3 class="text-xl font-semibold text-amber-400 text-center py-4">
            Registrations by Level
        </h3>

        <!-- Role Balance Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Approved Registrations Balance -->
            <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 relative overflow-hidden">
                <div class="relative z-10">
                    <h4 class="text-lg font-semibold text-amber-400 mb-4">Approved Registrations</h4>
                    
                    {#if data.registrationsByRole}
                        {@const approvedStatuses = ['approved', 'paymentReceived', 'checkedIn']}
                        {@const totalApprovedLeaders = (data.registrationsByRole.Leader || [])
                            .filter(reg => approvedStatuses.includes(reg.status))
                            .length}
                        
                        {@const totalApprovedFollowers = (data.registrationsByRole.Follower || [])
                            .filter(reg => approvedStatuses.includes(reg.status))
                            .length}
                        
                        {@const totalApproved = totalApprovedLeaders + totalApprovedFollowers}
                        {@const leadersPercentage = (totalApprovedLeaders / totalApproved) * 100 || 0}
                          <div class="grid grid-cols-2 gap-4">
                            <div>
                                <div class="text-emerald-400 font-semibold mb-1">Leaders</div>
                                <div class="text-2xl font-bold text-emerald-400">{totalApprovedLeaders}</div>
                                <div class="text-sm text-emerald-400/80">{Math.round(leadersPercentage)}%</div>
                                <div class="text-xs text-emerald-400/60 mt-1">
                                    Paid: {data.registrationsByRole.Leader.filter(reg => ['paymentReceived', 'checkedIn'].includes(reg.status)).length}
                                </div>
                            </div>
                            <div>
                                <div class="text-sky-400 font-semibold mb-1">Followers</div>
                                <div class="text-2xl font-bold text-sky-400">{totalApprovedFollowers}</div>
                                <div class="text-sm text-sky-400/80">{Math.round(100 - leadersPercentage)}%</div>
                                <div class="text-xs text-sky-400/60 mt-1">
                                    Paid: {data.registrationsByRole.Follower.filter(reg => ['paymentReceived', 'checkedIn'].includes(reg.status)).length}
                                </div>
                            </div>
                        </div>
                        <div class="text-xs text-gray-400 mt-3 text-start">
                            Total Paid: {data.registrationsByRole.Leader.filter(reg => ['paymentReceived', 'checkedIn'].includes(reg.status)).length + 
                            data.registrationsByRole.Follower.filter(reg => ['paymentReceived', 'checkedIn'].includes(reg.status)).length} of {totalApproved}
                        </div>
                    {/if}
                </div>
                
                <!-- Background color bars -->
                <div class="absolute inset-0 z-0 flex">
                    {#if data.registrationsByRole}
                        {@const approvedStatuses = ['approved', 'paymentReceived', 'checkedIn']}
                        {@const totalApprovedLeaders = (data.registrationsByRole.Leader || [])
                            .filter(reg => approvedStatuses.includes(reg.status))
                            .length}
                        
                        {@const totalApprovedFollowers = (data.registrationsByRole.Follower || [])
                            .filter(reg => approvedStatuses.includes(reg.status))
                            .length}
                        
                        {@const totalApproved = totalApprovedLeaders + totalApprovedFollowers}
                        {@const leadersPercentage = (totalApprovedLeaders / totalApproved) * 100 || 0}
                        
                        <div class="h-full bg-emerald-500/10" style="width: {leadersPercentage}%"></div>
                        <div class="h-full bg-sky-500/10" style="width: {100 - leadersPercentage}%"></div>
                    {/if}
                </div>
            </div>

            <!-- Waiting List Balance -->
            <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 relative overflow-hidden">
                <div class="relative z-10">
                    <h4 class="text-lg font-semibold text-amber-400 mb-4">Waiting List</h4>
                    
                    {#if data.registrationsByRole}
                        {@const waitingStatuses = ['waitingList', 'pendingApproval']}
                        {@const totalWaitingLeaders = (data.registrationsByRole.Leader || [])
                            .filter(reg => waitingStatuses.includes(reg.status))
                            .length}
                        
                        {@const totalWaitingFollowers = (data.registrationsByRole.Follower || [])
                            .filter(reg => waitingStatuses.includes(reg.status))
                            .length}
                        
                        {@const totalWaiting = totalWaitingLeaders + totalWaitingFollowers}
                        {@const waitingLeadersPercentage = (totalWaitingLeaders / totalWaiting) * 100 || 0}
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <div class="text-emerald-400 font-semibold mb-1">Leaders</div>
                                <div class="text-2xl font-bold text-emerald-400">{totalWaitingLeaders}</div>
                                <div class="text-sm text-emerald-400/80">{Math.round(waitingLeadersPercentage)}%</div>
                            </div>
                            <div>
                                <div class="text-sky-400 font-semibold mb-1">Followers</div>
                                <div class="text-2xl font-bold text-sky-400">{totalWaitingFollowers}</div>
                                <div class="text-sm text-sky-400/80">{Math.round(100 - waitingLeadersPercentage)}%</div>
                            </div>
                        </div>
                    {/if}
                </div>
                
                <!-- Background color bars -->
                <div class="absolute inset-0 z-0 flex">
                    {#if data.registrationsByRole}
                        {@const waitingStatuses = ['waitingList', 'pendingApproval']}
                        {@const totalWaitingLeaders = (data.registrationsByRole.Leader || [])
                            .filter(reg => waitingStatuses.includes(reg.status))
                            .length}
                        
                        {@const totalWaitingFollowers = (data.registrationsByRole.Follower || [])
                            .filter(reg => waitingStatuses.includes(reg.status))
                            .length}
                        
                        {@const totalWaiting = totalWaitingLeaders + totalWaitingFollowers}
                        {@const waitingLeadersPercentage = (totalWaitingLeaders / totalWaiting) * 100 || 0}
                        
                        <div class="h-full bg-emerald-500/10" style="width: {waitingLeadersPercentage}%"></div>
                        <div class="h-full bg-sky-500/10" style="width: {100 - waitingLeadersPercentage}%"></div>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Intensive Registration Card -->
        <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mt-6">
            <h4 class="text-lg font-semibold text-amber-400 mb-4">Intensive Registrations</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                    <div class="text-emerald-400 font-semibold mb-1">Total</div>
                    <div class="text-2xl font-bold text-emerald-400">{data.intensiveCounts?.total || 0}</div>
                </div>
                <div>
                    <div class="text-sky-400 font-semibold mb-1">Approved</div>
                    <div class="text-2xl font-bold text-sky-400">{data.intensiveCounts?.approved || 0}</div>
                    <div class="text-xs text-sky-400/60">
                        {Math.round(((data.intensiveCounts?.approved || 0) / (data.intensiveCounts?.total || 1)) * 100)}% of total
                    </div>
                </div>
                <div>
                    <div class="text-yellow-400 font-semibold mb-1">Waiting</div>
                    <div class="text-2xl font-bold text-yellow-400">{data.intensiveCounts?.waiting || 0}</div>
                    <div class="text-xs text-yellow-400/60">
                        {Math.round(((data.intensiveCounts?.waiting || 0) / (data.intensiveCounts?.total || 1)) * 100)}% of total
                    </div>
                </div>
            </div>
        </div>

        <!-- Level Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-6">
            {#each levels as level}
                <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                    <h4 class="text-lg font-semibold text-amber-400 mb-4 text-center">{level}</h4>
                    
                    <!-- Roles Section with Status -->
                    <div class="mb-4">
                        <div class="text-sm font-semibold text-gray-400 mb-2">Roles</div>
                        <div class="space-y-3">
                            <!-- Leaders -->
                            <div>
                                <div class="text-emerald-400 font-semibold mb-1">Leaders</div>
                                <div class="ml-3 space-y-0.5">
                                    <div class="text-green-400 text-sm">
                                        Approved: <span class="font-bold">
                                            {(data.nordicLevelCounts[level]?.leaders || 0) + (data.worldLevelCounts[level]?.leaders || 0) -
                                            ((data.nordicLevelCounts[level]?.leadersWaiting || 0) + (data.worldLevelCounts[level]?.leadersWaiting || 0))}
                                        </span>
                                    </div>
                                    <div class="text-yellow-400 text-sm">
                                        Waiting: <span class="font-bold">
                                            {(data.nordicLevelCounts[level]?.leadersWaiting || 0) + (data.worldLevelCounts[level]?.leadersWaiting || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Followers -->
                            <div>
                                <div class="text-sky-400 font-semibold mb-1">Followers</div>
                                <div class="ml-3 space-y-0.5">
                                    <div class="text-green-400 text-sm">
                                        Approved: <span class="font-bold">
                                            {(data.nordicLevelCounts[level]?.followers || 0) + (data.worldLevelCounts[level]?.followers || 0) -
                                            ((data.nordicLevelCounts[level]?.followersWaiting || 0) + (data.worldLevelCounts[level]?.followersWaiting || 0))}
                                        </span>
                                    </div>
                                    <div class="text-yellow-400 text-sm">
                                        Waiting: <span class="font-bold">
                                            {(data.nordicLevelCounts[level]?.followersWaiting || 0) + (data.worldLevelCounts[level]?.followersWaiting || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Total Section -->
                    <div class="pt-3 border-t border-gray-700">
                        <div class="text-sm font-semibold text-gray-400 mb-1">Total Registrations</div>
                        <div class="text-xl font-bold text-gray-200">
                            {((data.nordicLevelCounts[level]?.total || 0) + (data.worldLevelCounts[level]?.total || 0)).toLocaleString()}
                        </div>
                    </div>
                </div>
            {/each}
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