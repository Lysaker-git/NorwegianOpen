<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    
    let competitionId;
    let roundId;
    let competition = null;
    let round = null;
    let contestants = [];
    let loading = true;
    let error = null;
    
    $: {
      competitionId = $page.params.competitionId;
      roundId = $page.params.roundId;
      loadData();
    }
    
    async function loadData() {
      loading = true;
      error = null;
      
      try {
        // Fetch competition details
        const compResponse = await fetch(`/api/admin/competitions/${competitionId}`);
        if (!compResponse.ok) throw new Error('Failed to fetch competition');
        competition = await compResponse.json();
        
        // Fetch round details
        const roundResponse = await fetch(`/api/admin/competitions/${competitionId}/rounds/${roundId}`);
        if (!roundResponse.ok) throw new Error('Failed to fetch round');
        round = await roundResponse.json();
        
        // Fetch contestants for this round
        const contResponse = await fetch(`/api/admin/competitions/${competitionId}/rounds/${roundId}/contestants`);
        if (!contResponse.ok) throw new Error('Failed to fetch contestants');
        contestants = await contResponse.json();
        
        loading = false;
      } catch (e) {
        error = e.message;
        loading = false;
      }
    }
    
    // Separate contestants by role
    $: leads = contestants.filter(contestant => contestant.role === 'lead');
    $: follows = contestants.filter(contestant => contestant.role === 'follow');
    
    // Sort contestants by bib number
    $: sortedLeads = leads.sort((a, b) => a.bibNumber - b.bibNumber);
    $: sortedFollows = follows.sort((a, b) => a.bibNumber - b.bibNumber);
    
    // Format date nicely
    function formatDateTime(dateString) {
      if (!dateString) return 'TBD';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    }
  </script>
  
  <div class="container mx-auto p-4">
    {#if loading}
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else if error}
      <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p>Error: {error}</p>
      </div>
    {:else}
      <div class="mb-6">
        <h1 class="text-3xl font-bold">{competition?.name || 'Competition'}</h1>
        <h2 class="text-xl font-medium text-gray-600 mt-2">{round?.name || 'Round'}</h2>
        
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {#if round?.scheduledTime}
            <div>
              <span class="text-gray-500 block text-sm">Scheduled Time:</span>
              <span class="font-medium">{formatDateTime(round.scheduledTime)}</span>
            </div>
          {/if}
          
          {#if round?.type}
            <div>
              <span class="text-gray-500 block text-sm">Round Type:</span>
              <span class="font-medium">{round.type}</span>
            </div>
          {/if}
          
          {#if round?.status}
            <div>
              <span class="text-gray-500 block text-sm">Status:</span>
              <span class={`font-medium ${round.status === 'Completed' ? 'text-green-600' : 'text-blue-600'}`}>
                {round.status}
              </span>
            </div>
          {/if}
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Leads Table -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <h2 class="bg-blue-600 text-white py-3 px-4 text-lg font-semibold">Leads</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bib #</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heat</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each sortedLeads as contestant}
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap font-bold">{contestant.bibNumber}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{contestant.firstName} {contestant.lastName}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{contestant.division || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{contestant.heat || 'TBD'}</td>
                  </tr>
                {:else}
                  <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No leads in this round</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Follows Table -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <h2 class="bg-pink-600 text-white py-3 px-4 text-lg font-semibold">Follows</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bib #</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heat</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each sortedFollows as contestant}
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap font-bold">{contestant.bibNumber}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{contestant.firstName} {contestant.lastName}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{contestant.division || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{contestant.heat || 'TBD'}</td>
                  </tr>
                {:else}
                  <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No follows in this round</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="mt-8">
        <h3 class="text-lg font-medium mb-4">Round Statistics</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white shadow rounded-lg p-4">
            <div class="text-sm text-gray-500">Total Contestants</div>
            <div class="text-2xl font-bold">{contestants.length}</div>
          </div>
          <div class="bg-white shadow rounded-lg p-4">
            <div class="text-sm text-gray-500">Leads</div>
            <div class="text-2xl font-bold">{leads.length}</div>
          </div>
          <div class="bg-white shadow rounded-lg p-4">
            <div class="text-sm text-gray-500">Follows</div>
            <div class="text-2xl font-bold">{follows.length}</div>
          </div>
          <div class="bg-white shadow rounded-lg p-4">
            <div class="text-sm text-gray-500">Heats</div>
            <div class="text-2xl font-bold">{new Set(contestants.map(c => c.heat).filter(Boolean)).size || 'N/A'}</div>
          </div>
        </div>
      </div>
    {/if}
    
    <div class="mt-6 flex space-x-4">
      <a href="/competitionSys/contests" class="text-blue-600 hover:text-blue-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        All Competitions
      </a>
      <a href="/competitionSys/contests/{competitionId}" class="text-blue-600 hover:text-blue-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to {competition?.name || 'Competition'} Rounds
      </a>
    </div>
  </div>