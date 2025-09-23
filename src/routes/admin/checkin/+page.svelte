<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
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
  let showModal = false;
  let modalTimeout: any = null;
  let buttonsDisabled = false;
  let checkinClicked = false;
  let saveClicked = false;
  let showCommentsSaved = false;
  let commentsSavedTimeout: any = null;

  // Load all registrations for quick select
  export let data;
  registrations = data.registrations || [];
  console.log('[CLIENT PAGE] Checkin Registrations', registrations);

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
      editFields = { Comments: selectedReg.comments };
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
    editFields = { Comments: reg.comments };
  }

  async function checkin() {
    loading = true;
    buttonsDisabled = true;
    checkinClicked = true;
    const formData = new FormData();
    formData.append('userID', selectedReg.userID);
    const res = await fetch('?/checkin', { method: 'POST', body: formData });
    // Accept both json() and plain object responses
    let result;
    try {
      result = await res.json();
    } catch (e) {
      result = res;
    }
    if (result && (result.success === true || result.status === 200)) {
      selectedReg.RegistrationStatus = 'checkedIn';
      checkinSuccess = true;
      showModal = true;
      // Auto-close modal after 10s
      modalTimeout = setTimeout(() => closeModal(), 10000);
    }
    loading = false;
    setTimeout(() => { checkinClicked = false; }, 200);
  }

  function closeModal() {
    showModal = false;
    checkinSuccess = false;
    buttonsDisabled = false;
    // Reset for next check-in
    setTimeout(() => {
      searchName = '';
      searchUserID = '';
      selectedReg = null;
      editFields = {};
      // Focus name field
      const nameInput = document.getElementById('nameInput');
      if (nameInput) nameInput.focus();
    }, 500); // Wait for modal to finish transition
    if (modalTimeout) clearTimeout(modalTimeout);
  }

  async function saveComments() {
    loading = true;
    saveClicked = true;
    const formData = new FormData();
    formData.append('userID', selectedReg.userID);
    formData.append('updates', JSON.stringify({ comments: editFields.Comments }));
    const res = await fetch('?/update', { method: 'POST', body: formData });
    console.log('[SAVE COMMENTS] Response:', res);
    let result;
    try {
      result = await res.json();
      console.log('[SAVE COMMENTS] Parsed JSON:', result);
    } catch (e) {
      result = res;
    }
    if (result.status === 200) {
      selectedReg.comments = editFields.Comments;
      showCommentsSaved = true;
      if (commentsSavedTimeout) clearTimeout(commentsSavedTimeout);
      commentsSavedTimeout = setTimeout(() => { showCommentsSaved = false; }, 3000);
    }
    loading = false;
    setTimeout(() => { saveClicked = false; }, 200);
  }
</script>

<div class="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto my-8">
  <h1 class="text-3xl font-bold text-amber-400 mb-6 font-[NorseBold]">Participant Check-In</h1>

  <div class="mb-4 flex flex-col gap-2">
    <label for="" class="text-gray-200 font-semibold">Search by Full Name:</label>
    <input
      id="nameInput"
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
    <label for="" class="text-gray-200 font-semibold">Scan or Enter UserID:</label>
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
      <div class="mb-2 text-gray-200"><strong>Level:</strong> {selectedReg.Level}</div>
      <div class="mb-2 text-gray-200"><strong>Role:</strong> {selectedReg.Role}</div>
      <div class="mb-2 text-gray-200"><strong>Pass Type:</strong> {selectedReg.PassOption}</div>
      {#if selectedReg.AddedIntensive}
        <div class="mb-2 text-gray-200"><strong>Joel and Chantelle Blues Intensive:</strong> Yes </div>
      {/if}
      <div class="mb-2 text-gray-200"><strong>Status:</strong> 
        {#if selectedReg.RegistrationStatus === 'checkedIn'}
          <span class="text-green-400 font-semibold">Checked In</span>
        {:else if selectedReg.RegistrationStatus === 'paymentReceived'}
          <span class="text-blue-400 font-semibold">Paid (Not Checked In)</span>
        {:else if selectedReg.RegistrationStatus === 'approved'}
          <span class="text-yellow-400 font-semibold">Approved (Not Paid)</span>
        {:else if selectedReg.RegistrationStatus === 'pendingApproval'}
          <span class="text-orange-400 font-semibold">Pending Approval</span>
        {:else if selectedReg.RegistrationStatus === 'waitingList'}
          <span class="text-purple-400 font-semibold">Waiting List</span>
        {:else}
          <span class="text-gray-300 font-semibold">{selectedReg.RegistrationStatus}</span>
        {/if}
      </div>
      <!-- Comments field at the end, always editable -->
      <div class="mt-4">
        <label for="" class="text-gray-200 font-semibold">Comments:</label>
        <textarea class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 mb-2" bind:value={editFields.Comments} placeholder="Comments..." rows="3">{selectedReg.comments}</textarea>
        <div class="flex gap-2 mt-2">
          <button
            class="px-4 py-2 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition {saveClicked ? 'scale-95 ring-2 ring-green-400' : ''}"
            on:click={saveComments}
            style="transition: transform 0.15s, box-shadow 0.15s;"
          >Save Comments</button>
          <button
            class="px-4 py-2 rounded bg-amber-500 text-gray-900 font-semibold shadow hover:bg-amber-400 transition {checkinClicked ? 'scale-95 ring-2 ring-amber-400' : ''}"
            on:click={checkin}
            disabled={loading || selectedReg.RegistrationStatus === 'checkedIn'}
            style="transition: transform 0.15s, box-shadow 0.15s;"
          >Check In</button>
        </div>
        {#if showCommentsSaved}
          <div class="text-green-400 font-semibold mt-2">Comments updated!</div>
        {/if}
      </div>
    </div>
  {/if}

  {#if showModal}
    <!-- Overlay for dark blur effect -->
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"></div>
    <div
      class="fixed inset-0 flex items-center justify-center z-50"
    >
      <div
        class="bg-amber-500 text-gray-900 rounded-lg shadow-xl border-2 border-amber-700 px-8 py-6 text-center font-bold text-xl"
        in:fly={{ x: 500, duration: 400, easing: t => 1 - Math.pow(1-t, 2) }}
        out:fly={{ x: -500, duration: 600, easing: t => t*t }}
        style="min-width:320px; max-width:90vw;"
      >
        <div class="mb-4">{selectedReg?.FullName} is <span class="text-green-700">Checked In!</span></div>
        <button
          class="px-6 py-2 rounded bg-gray-900 text-amber-400 font-semibold shadow hover:bg-gray-800 transition"
          on:click={closeModal}
        >Continue</button>
        <div class="mt-2 text-xs text-gray-700">This will close automatically in 10 seconds.</div>
      </div>
    </div>
  {/if}
</div>
