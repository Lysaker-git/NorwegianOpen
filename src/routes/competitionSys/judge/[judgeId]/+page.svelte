<script>
    import { page } from '$app/stores';
 
    // Get the judgeId from the URL parameter
    $: judgeId = $page.params.judgeId;
 
    console.log(judgeId)
    // TODO: Fetch actual competitors based on the event/division later
    // For now, hardcode some sample competitors
    const competitors = [
      { bib: 101, name: 'Alex Lead', role: 'Lead' },
      { bib: 102, name: 'Brenda Follow', role: 'Follow' },
      { bib: 103, name: 'Casey Lead', role: 'Lead' },
      { bib: 104, name: 'Dana Follow', role: 'Follow' },
      { bib: 105, name: 'Eddie Lead', role: 'Lead' },
    ];
 
    // Sort competitors by bib number (assuming they aren't already)
    competitors.sort((a, b) => a.bib - b.bib);
 
    // TODO: Implement scoring logic (e.g., Yes/No/Maybe)
    // For now, just display them
</script>
 
<svelte:head>
  <title>Judging - {judgeId}</title>
</svelte:head>
 
<div class="max-w-3xl mx-auto my-8 px-4">
  <h1 class="text-2xl font-bold text-center">Prelims Judging</h1>
  <h2 class="text-xl text-center mt-2 mb-4">Judge: {judgeId}</h2>
 
  <p class="text-lg mb-4">Score the following competitors:</p>
 
  <ul class="mt-8 space-y-2">
    {#each competitors as competitor (competitor.bib)}
      <li class="border border-gray-300 p-3 flex justify-between items-center rounded">
        <div class="flex items-center space-x-3">
          <span class="font-bold">Bib: {competitor.bib}</span>
          <span class="text-gray-600">({competitor.role})</span>
        </div>
        <div class="flex space-x-2">
          <button class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded">Yes</button>
          <button class="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded">Maybe</button>
          <button class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded">No</button>
        </div>
      </li>
    {/each}
  </ul>
 
  <!-- Add Submit button here later -->
 
</div>