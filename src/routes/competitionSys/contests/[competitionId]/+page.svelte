<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    
    let competitionId;
    let competition = null;
    let rounds = [];
    let loading = true;
    let error = null;
    
    $: {
      competitionId = $page.params.competitionId;
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
        
        // Fetch rounds for this competition
        const roundsResponse = await fetch(`/api/admin/competitions/${competitionId}/rounds`);
        if (!roundsResponse.ok) throw new Error('Failed to fetch rounds');
        rounds = await roundsResponse.json();
        
        loading = false;
      } catch (e) {
        error = e.message;
        loading = false;
      }
    }
    
    // Format date & time nicely
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
        <p class="text-gray-600">{competition?.date ? new Date(competition.date).toLocaleDateString() : 'Date TBA'}</p>
        
        {#if competition?.description}
          <div class="mt-4 text-gray-700">
            <p>{competition.description}</p>
          </div>
        {/if}
      </div>
      
      <h2 class="text-2xl font-bold mb-4">Rounds</h2>
      
      {#if rounds.length === 0}
        <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p>No rounds have been set up for this competition yet.</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each rounds as round}
            <a href="/competitionSys/contests/{competitionId}/{round.id}" class="block">
              <div class="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div class="p-6">
                  <h3 class="text-xl font-bold mb-2">{round.name}</h3>
                  
                  <div class="mt-4 text-sm text-gray-600">
                    <div class="flex justify-between mb-2">
                      <span>Scheduled:</span>
                      <span class="font-medium">{formatDateTime(round.scheduledTime)}</span>
                    </div>
                    
                    <div class="flex justify-between mb-2">
                      <span>Type:</span>
                      <span class="font-medium">{round.type || 'Standard'}</span>
                    </div>
                    
                    <div class="flex justify-between">
                      <span>Status:</span>
                      <span class={`font-medium ${round.status === 'Completed' ? 'text-green-600' : 'text-blue-600'}`}>
                        {round.status || 'Upcoming'}
                      </span>
                    </div>
                  </div>
                  
                  <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-500">
                        {round.contestantsCount || 0} Contestants
                      </span>
                      <span class="text-blue-600 text-sm">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    {/if}
    
    <div class="mt-6">
      <a href="/competitionSys/contests" class="text-blue-600 hover:text-blue-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Competitions
      </a>
    </div>
  </div>