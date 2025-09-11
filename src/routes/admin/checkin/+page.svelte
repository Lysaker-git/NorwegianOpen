<script lang="ts">
  import { onMount } from 'svelte';
  let registrations = [];
  let searchName = '';
  let searchUserID = '';
  let nameMatches: any[] = [];
  let selectedReg: any = null;
  let editMode = false;
  let editFields: Record<string, any> = {};
  let loading = false;
  let checkinSuccess = false;
  let userIDError = '';

  // Load all registrations for quick select
  export let data;
  registrations = data.registrations || [];

  $: nameMatches = searchName.length > 0
    ? registrations.filter(r => r.FullName && r.FullName.toLowerCase().includes(searchName.toLowerCase()))
    : [];

  async function searchByUserID() {
    if (!searchUserID) return;
    loading = true;
    userIDError = '';
    const formData = new FormData();
    formData.append('type', 'userID');
    formData.append('value', searchUserID);
    const res = await fetch('?/search', { method: 'POST', body: formData });
    const { result } = await res.json();
    if (result && result.length === 1) {
      selectedReg = result[0];
      userIDError = '';
    } else {
      selectedReg = null;
      userIDError = 'No match found for this UserID.';
    }
    loading = false;
  }

  function selectName(reg) {
    selectedReg = reg;
    searchName = reg.FullName;
    nameMatches = [];
    userIDError = '';
  }

  function startEdit() {
    editMode = true;
    editFields = { ...selectedReg };
  }

  async function saveEdit() {
    loading = true;
    const formData = new FormData();
    formData.append('userID', selectedReg.userID);
    formData.append('updates', JSON.stringify(editFields));
    const res = await fetch('?/update', { method: 'POST', body: formData });
    const { success } = await res.json();
    if (success) {
      Object.assign(selectedReg, editFields);
      editMode = false;
    }
    loading = false;
  }

  async function checkin() {
    loading = true;
    const formData = new FormData();
    formData.append('userID', selectedReg.userID);
    const res = await fetch('?/checkin', { method: 'POST', body: formData });
    const { success } = await res.json();
    if (success) {
      selectedReg.RegistrationStatus = 'checkedIn';
      checkinSuccess = true;
    }
    loading = false;
  }
</script>

<div class="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto my-8">
  <h1 class="text-3xl font-bold text-amber-400 mb-6 font-[NorseBold]">Participant Check-In</h1>

  <div class="mb-4 flex flex-col gap-2">
    <label class="text-gray-200 font-semibold">Search by Full Name:</label>
    <input
      class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400"
      type="text"
      bind:value={searchName}
      placeholder="Type name..."
      autocomplete="off"
    />
    {#if nameMatches.length > 0}
      <ul class="bg-gray-900 rounded shadow mt-1 max-h-40 overflow-y-auto">
        {#each nameMatches as reg}
          <li class="px-3 py-2 cursor-pointer hover:bg-amber-500 hover:text-gray-900" on:click={() => selectName(reg)}>{reg.FullName}</li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="mb-4 flex flex-col gap-2">
    <label class="text-gray-200 font-semibold">Scan or Enter UserID:</label>
    <div class="flex gap-2">
      <input
        class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400"
        type="text"
        bind:value={searchUserID}
        placeholder="Scan or type UserID..."
        autocomplete="off"
        on:keydown={(e) => { if (e.key === 'Enter') searchByUserID(); }}
      />
      <button
        class="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
        on:click={searchByUserID}
        disabled={loading || !searchUserID}
      >Search</button>
    </div>
    {#if userIDError}
      <div class="text-red-400 text-sm mt-2">{userIDError}</div>
    {/if}
  </div>

  {#if selectedReg}
    <div class="bg-gray-900 rounded p-4 border border-gray-700 mt-4">
      <h2 class="text-xl font-bold text-amber-400 mb-2">Registration Details</h2>
      <div class="mb-2 text-gray-200"><strong>Name:</strong> {selectedReg.FullName}</div>
      <div class="mb-2 text-gray-200"><strong>Email:</strong> {selectedReg.Email}</div>
      <div class="mb-2 text-gray-200"><strong>UserID:</strong> {selectedReg.userID}</div>
      <div class="mb-2 text-gray-200"><strong>Status:</strong> {selectedReg.RegistrationStatus}</div>
      <!-- Add more fields as needed -->
      {#if editMode}
        <div class="mt-2">
          <label class="text-gray-200 font-semibold">Edit Fields:</label>
          <input class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 mb-2" type="text" bind:value={editFields.FullName} placeholder="Full Name" />
          <input class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 mb-2" type="text" bind:value={editFields.Email} placeholder="Email" />
          <!-- Add more editable fields as needed -->
          <button class="px-4 py-2 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition mr-2" on:click={saveEdit} disabled={loading}>Save</button>
          <button class="px-4 py-2 rounded bg-gray-700 text-gray-200 font-semibold shadow hover:bg-gray-600 transition" on:click={() => editMode = false} disabled={loading}>Cancel</button>
        </div>
      {:else}
        <button class="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition mr-2" on:click={startEdit} disabled={loading}>Edit</button>
        <button class="px-4 py-2 rounded bg-amber-500 text-gray-900 font-semibold shadow hover:bg-amber-400 transition" on:click={checkin} disabled={loading || selectedReg.RegistrationStatus === 'checkedIn'}>Check In</button>
        {#if checkinSuccess}
          <span class="ml-2 text-green-400 font-semibold">Checked In!</span>
        {/if}
      {/if}
    </div>
  {/if}
</div>
