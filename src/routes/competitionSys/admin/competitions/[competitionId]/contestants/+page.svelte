<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    
    // Get competition ID from route params
    const competitionId = $page.params.competitionId;
    
    // Form data for new contestant
    let newContestant = {
        bibNumber: '',
        name: '',
        role: 'Lead', // Default role
        division: 'Fun Jack and Jill', // Default division
        competitionId: competitionId
    };
    
    // List of contestants for this competition
    let contestants = [];
    let loading = true;
    let error = null;
    let success = null;
    
    // Possible roles and divisions (can be expanded)
    const roles = ['Lead', 'Follow'];
    const divisions = ['Newcomer', 'Intermediate', 'Advanced', 'Open', 'Fun Jack and Jill'];
    
    // Competition details
    let competition = null;
    
    // Fetch data on mount
    onMount(async () => {
        await fetchCompetitionDetails();
        await fetchContestants();
    });
    
    async function fetchCompetitionDetails() {
        try {
            const response = await fetch(`/api/admin/competitions/${competitionId}`);
            if (!response.ok) throw new Error('Failed to fetch competition details');
            
            competition = await response.json();
        } catch (e) {
            error = e.message;
            console.error('Error fetching competition details:', e);
        }
    }
    
    async function fetchContestants() {
        try {
            const response = await fetch(`/api/admin/competitions/${competitionId}/contestants`);
            if (!response.ok) throw new Error('Failed to fetch contestants');
            
            contestants = await response.json();
        } catch (e) {
            error = e.message;
            console.error('Error fetching contestants:', e);
        } finally {
            loading = false;
        }
    }
    
    // Add new contestant
    async function addContestant() {
        if (!newContestant.name || !newContestant.bibNumber) {
            error = "Name and Bib Number are required";
            success = null;
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/competitions/${competitionId}/contestants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newContestant)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add contestant');
            }
            
            const addedContestant = await response.json();
            
            // Add the new contestant to the list
            contestants = [...contestants, addedContestant];
            
            // Reset form (keep role and division for convenience)
            newContestant = {
                bibNumber: '',
                name: '',
                role: newContestant.role,
                division: newContestant.division,
                competitionId: competitionId
            };
            
            success = "Contestant added successfully";
            error = null;
        } catch (e) {
            error = e.message;
            success = null;
            console.error('Error adding contestant:', e);
        }
    }
    
    // Remove contestant
    async function removeContestant(contestantId) {
        if (!confirm('Are you sure you want to remove this contestant?')) return;
        
        try {
            const response = await fetch(`/api/admin/competitions/${competitionId}/contestants/${contestantId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove contestant');
            }
            
            // Remove contestant from list
            contestants = contestants.filter(c => c.id !== contestantId);
            
            success = "Contestant removed successfully";
            error = null;
        } catch (e) {
            error = e.message;
            success = null;
            console.error('Error removing contestant:', e);
        }
    }

    // Generate next bib number
    function generateNextBib() {
        if (contestants.length === 0) {
            newContestant.bibNumber = "1";
            return;
        }
        
        // Find highest bib number and increment by 1
        const highestBib = Math.max(...contestants.map(c => parseInt(c.bibNumber)));
        newContestant.bibNumber = (highestBib + 1).toString();
    }
</script>

<svelte:head>
    <title>Manage Contestants | {competition ? competition.name : 'Competition'}</title>
</svelte:head>

<div class="max-w-4xl mx-auto my-8 px-4">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-2xl font-bold">Manage Contestants</h1>
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
    
    <!-- Add Contestant Form -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 class="text-lg font-semibold mb-4">Add New Contestant</h2>
        
        <form class="space-y-4" on:submit|preventDefault={addContestant}>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        bind:value={newContestant.name} 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter contestant name"
                        required
                    />
                </div>
                
                <div>
                    <label for="bibNumber" class="block text-sm font-medium text-gray-700 mb-1">
                        Bib Number
                        <button 
                            type="button" 
                            on:click={generateNextBib}
                            class="ml-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                            Generate Next
                        </button>
                    </label>
                    <input 
                        type="text" 
                        id="bibNumber" 
                        bind:value={newContestant.bibNumber} 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter bib number"
                        required
                    />
                </div>
                
                <div>
                    <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select 
                        id="role" 
                        bind:value={newContestant.role} 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        {#each roles as role}
                            <option value={role}>{role}</option>
                        {/each}
                    </select>
                </div>
                
                <div>
                    <label for="division" class="block text-sm font-medium text-gray-700 mb-1">Division</label>
                    <select 
                        id="division" 
                        bind:value={newContestant.division} 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        {#each divisions as division}
                            <option value={division}>{division}</option>
                        {/each}
                    </select>
                </div>
            </div>
            
            <button 
                type="submit" 
                class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
                Add Contestant
            </button>
        </form>
    </div>
    
    <!-- Contestants List -->
    <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">Current Contestants</h2>
        
        {#if loading}
            <p class="text-gray-500">Loading contestants...</p>
        {:else if contestants.length === 0}
            <p class="text-gray-500">No contestants added yet. Add one using the form above.</p>
        {:else}
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bib #</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        {#each contestants as contestant (contestant.id)}
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap">{contestant.bibNumber}</td>
                                <td class="px-6 py-4 whitespace-nowrap">{contestant.name}</td>
                                <td class="px-6 py-4 whitespace-nowrap">{contestant.role}</td>
                                <td class="px-6 py-4 whitespace-nowrap">{contestant.division}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <button 
                                        on:click={() => removeContestant(contestant.id)} 
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