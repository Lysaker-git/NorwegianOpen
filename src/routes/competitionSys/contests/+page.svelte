<script>
    import { onMount } from 'svelte';
    
    let competitions = [];
    let loading = true;
    let error = null;
    
    onMount(async () => {
      try {
        const response = await fetch('/api/admin/competitions');
        if (!response.ok) throw new Error('Failed to fetch competitions');
        competitions = await response.json();
        loading = false;
      } catch (e) {
        error = e.message;
        loading = false;
      }
    });
  </script>
  
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">Competitions</h1>
    
    {#if loading}
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else if error}
      <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p>Error: {error}</p>
      </div>
    {:else if competitions.length === 0}
      <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
        <p>No competitions available.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each competitions as competition}
          <a href="/competitionSys/contests/{competition.id}" class="block">
            <div class="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div class="p-6">
                <h2 class="text-xl font-bold mb-2">{competition.name}</h2>
                <p class="text-gray-600 mb-4">{competition.date ? new Date(competition.date).toLocaleDateString() : 'Date TBA'}</p>
                
                <div class="mt-4 flex justify-between items-center">
                  <span class="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {competition.status || 'Upcoming'}
                  </span>
                  <span class="text-sm text-gray-500">
                    {competition.contestantsCount || 0} Contestants
                  </span>
                </div>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>