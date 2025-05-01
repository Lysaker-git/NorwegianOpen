<script>
    import { onMount } from 'svelte';
    
    // Form data for new competition
    let newCompetition = {
        name: '',
        date: new Date().toISOString().split('T')[0], // Default to today
        status: 'Setup'
    };
    
    // List of existing competitions
    let competitions = [];
    let loading = true;
    let error = null;
    
    // Fetch existing competitions on mount
    onMount(async () => {
        try {
            const response = await fetch('/api/admin/competitions');
            console.log(response)
            if (!response.ok) throw new Error('Failed to fetch competitions');
            
            competitions = await response.json();
        } catch (e) {
            error = e.message;
            console.error('Error fetching competitions:', e);
        } finally {
            loading = false;
        }
    });
    
    // Create new competition
    async function createCompetition() {
        if (!newCompetition.name || !newCompetition.date) {
            error = "Please fill out all required fields";
            return;
        }
        
        try {
            const response = await fetch('/api/admin/competitions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCompetition)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create competition');
            }
            
            const newComp = await response.json();
            
            // Add the new competition to the list
            competitions = [...competitions, newComp];
            
            // Reset form
            newCompetition = {
                name: '',
                date: new Date().toISOString().split('T')[0],
                status: 'Setup'
            };
            
            error = null;
        } catch (e) {
            error = e.message;
            console.error('Error creating competition:', e);
        }
    }
</script>

<svelte:head>
    <title>Competition System Admin</title>
</svelte:head>

<div class="max-w-4xl mx-auto my-8 px-4">
    <h1 class="text-3xl font-bold text-center mb-8">Competition System Admin</h1>
    
    <!-- Create New Competition Form -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 class="text-xl font-semibold mb-4">Create New Competition</h2>
        
        {#if error}
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
            </div>
        {/if}
        
        <form class="space-y-4" on:submit|preventDefault={createCompetition}>
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Competition Name</label>
                <input 
                    type="text" 
                    id="name" 
                    bind:value={newCompetition.name} 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter competition name"
                    required
                />
            </div>
            
            <div>
                <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                    type="date" 
                    id="date" 
                    bind:value={newCompetition.date} 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>
            
            <div>
                <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                    id="status" 
                    bind:value={newCompetition.status} 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="Setup">Setup</option>
                    <option value="Prelims">Prelims</option>
                    <option value="Finals">Finals</option>
                    <option value="Complete">Complete</option>
                </select>
            </div>
            
            <button 
                type="submit" 
                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
                Create Competition
            </button>
        </form>
    </div>
    
    <!-- List of Competitions -->
    <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Existing Competitions</h2>
        
        {#if loading}
            <p class="text-gray-500">Loading competitions...</p>
        {:else if competitions.length === 0}
            <p class="text-gray-500">No competitions found. Create one above.</p>
        {:else}
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        {#each competitions as competition (competition.id)}
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap">{competition.name}</td>
                                <td class="px-6 py-4 whitespace-nowrap">{new Date(competition.date).toLocaleDateString()}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class={`px-2 py-1 text-xs rounded-full ${
                                        competition.status === 'Setup' ? 'bg-gray-100 text-gray-800' :
                                        competition.status === 'Prelims' ? 'bg-blue-100 text-blue-800' :
                                        competition.status === 'Finals' ? 'bg-purple-100 text-purple-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {competition.status}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <a href={`/competitionSys/admin/competitions/${competition.id}`} class="text-blue-600 hover:underline mr-4">
                                        Manage
                                    </a>
                                    <a href={`/competitionSys/admin/competitions/${competition.id}/contestants`} class="text-blue-600 hover:underline mr-4">
                                        Contestants
                                    </a>
                                    <a href={`/competitionSys/admin/competitions/${competition.id}/judges`} class="text-blue-600 hover:underline">
                                        Judges
                                    </a>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>