<script>
    import { goto } from '$app/navigation';
 
    // 1. Define local judge data (replace with your actual judges)
    const judges = [
      { id: 'Rolf Erik', name: 'Rolf Erik' },
      { id: 'Tom-Elbin', name: 'Tom-Elbin' },
      { id: 'Veronika', name: 'Veronika' },
      { id: 'Robin', name: 'Robin' },
    ];
 
    // 3. Function to handle judge selection
    function selectJudge(judgeId) {
      // 4. Navigate to the specific judge's page
      // We'll use the 'id' for the URL parameter as it's cleaner
      console.log(judgeId)
      goto(`/competitionSys/judge/${encodeURIComponent(judgeId)}`);
    }
</script>
 
<svelte:head>
  <title>Select Judge</title>
</svelte:head>
 
<div class="max-w-xl mx-auto my-8 px-4 text-center">
  <h1 class="text-2xl font-bold mb-6">Select Your Judge Name</h1>
 
  <div class="mt-8 flex flex-col items-center space-y-4">
    {#each judges as judge (judge.id)}
      <button 
        class="py-3 px-6 text-lg min-w-[200px] bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow transition-colors duration-200" 
        on:click={() => selectJudge(judge.id)}
      >
        {judge.name}
      </button>
    {/each}
  </div>
</div>