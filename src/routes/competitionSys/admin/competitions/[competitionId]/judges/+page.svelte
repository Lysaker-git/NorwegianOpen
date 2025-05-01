<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    
    // Get competition ID from route params
    const competitionId = $page.params.competitionId;
    
    // Form data for new judge
    let newJudge = {
        name: '',
        role: 'Judge', // Default role
        competitionId: competitionId
    };
    
    // List of judges for this competition
    let judges = [];
    let loading = true;
    let error = null;
    let success = null;
    
    // Fetch existing judges for this competition
    onMount(async () => {
        await fetchJudges();
        await fetchCompetitionDetails();
    });
    
    // Competition details
    let competition = null;
    
    async function fetchCompetitionDetails() {
        try {
            const response = await fetch(`/api/admin/competitions/${competitionId}`);
            console.log(response)
            if (!response.ok) throw new Error('Failed to fetch competition details');
            
            competition = await response.json();
        } catch (e) {
            error = e.message;
            console.error('Error fetching competition details:', e);
        }
    }
    
    async function fetchJudges() {
        try {
            const response = await fetch(`/api/admin/competitions/${competitionId}/judges`);
            if (!response.ok) throw new Error('Failed to fetch judges');
            
            judges = await response.json();
        } catch (e) {
            error = e.message;
            console.error('Error fetching judges:', e);
        } finally {
            loading = false;
        }
    }
    
    // Add new judge
    async function addJudge() {
        if (!newJudge.name) {
            error = "Judge name is required";
            success = null;
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/competitions/${competitionId}/judges`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newJudge)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add judge');
            }
            
            const addedJudge = await response.json();
            
            // Add the new judge to the list
            judges = [...judges, addedJudge];
            
            // Reset form
            newJudge = {
                name: '',
                role: 'Judge',
                competitionId: competitionId
            };
            
            success = "Judge added successfully";
            error = null;
        } catch (e) {
            error = e.message;
            success = null;
            console.error('Error adding judge:', e);
        }
    }
    
    // Remove judge
    async function removeJudge(judgeId) {
        if (!confirm('Are you sure you want to remove this judge?')) return;
        
        try {
            const response = await fetch(`/api/admin/competitions/${competitionId}/judges/${judgeId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove judge');
            }
            
            // Remove judge from list
            judges = judges.filter(j => j.id !== judgeId);
            
            success = "Judge removed successfully";
            error = null;
        } catch (e) {
            error = e.message;
            success = null;
            console.error('Error removing judge:', e);
        }
    }
</script>

<svelte:head>
    <title>Manage Judges | {competition ? competition.name : 'Competition'}</title>
</svelte:head>

<div class="max-w-4xl mx-auto my-8 px-4">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-2xl font-bold">Manage Judges</h1>
            {#if competition}
                <p class="text-gray-600">Competition: {competition.name}</p>
            {/if}
        </div>
        <a href="/competitionSys/admin/competitions/{competitionId}" class="text-blue-600 hover:underline">
            Back to Competition
        </a>
    </div>
    
    <!-- Error and Success Messages -->
    {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
        </div>
    {/if}
    
    {#if success}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
        </div>
    {/if}
    
    <!-- Add Judge Form -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 class="text-lg font-semibold mb-4">Add New Judge</h2>
        
        <form class="space-y-4" on:submit|preventDefault={addJudge}>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Judge Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        bind:value={newJudge.name} 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter judge name"
                        required
                    />
                </div>
                
                <div>
                    <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select 
                        id="role" 
                        bind:value={newJudge.role} 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="Judge">Judge</option>
                        <option value="Head Judge">Chief Judge</option>
                    </select>
                </div>
            </div>
            
            <button 
                type="submit" 
                class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
                Add Judge
            </button>
        </form>
    </div>
    
    <!-- Judges List -->
    <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">Current Judges</h2>
        
        {#if loading}
            <p class="text-gray-500">Loading judges...</p>
        {:else if judges.length === 0}
            <p class="text-gray-500">No judges added yet. Add one using the form above.</p>
        {:else}
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        {#each judges as judge (judge.id)}
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap">{judge.name}</td>
                                <td class="px-6 py-4 whitespace-nowrap">{judge.role}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <a href="/competitionSys/judge/{judge.id}" target="_blank" class="text-blue-600 hover:underline mr-4">
                                        View Judge Panel
                                    </a>
                                    <button 
                                        on:click={() => removeJudge(judge.id)} 
                                        class="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>