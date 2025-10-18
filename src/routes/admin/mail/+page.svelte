<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { PageData } from '../$types';
  export let data: PageData & { registrations: Registration[], statuses: string[], levels: string[], passOptions: string[] };

  let selectedStatus: string | null = null;
  let selectedLevel: string | null = null;
  let emailHeader = '';
  let emailInfo1 = '';
  let emailInfo2 = '';
  let emailFooter = '';
  let showPreview = false;
  let showConfirm = false;
  let sending = false;
  let useTestMail = false;
  let selectedPassOption: string | null = null;
  let showRecipients = false;

  const TEST_EMAILS = [
    'roblysa@hotmail.com',
    'roblysa@gmail.com',
    'lysakerwcs@hotmail.com'
  ];

  interface Registration {
    id: any;
    FullName: string | null;
    Email: string | null;
    RegistrationStatus: string;
    Level?: string | null;
    PassOption?: string | null;
    // ...other fields as needed...
  }

  // Use statuses, levels, and passOptions from server
  const statuses = data.statuses || [];
  const levels = data.levels || [];
  const passOptions = data.passOptions || [];

  // Filtered recipients based on selection
  $: filtered = selectedStatus
    ? data.registrations.filter(r => r.RegistrationStatus === selectedStatus)
    : selectedLevel
      ? data.registrations.filter(r => r.Level === selectedLevel)
      : selectedPassOption
        ? data.registrations.filter(r => r.PassOption === selectedPassOption)
        : [];

  $: selectedEmails = filtered.map(r => r.Email).filter(Boolean);

  $: emailContent = `
  <div style="max-width:600px;margin:24px auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;line-height:1.6;color:#222;">
    <div style="background-color:#0A2342;color:#fff;padding:24px 20px;text-align:center;">
      <h1 style="margin:0;font-size:2em;font-weight:bold;letter-spacing:1px;">${emailHeader}</h1>
    </div>
    <div style="padding:24px 30px;">
      <p style="font-size:1.1em;margin-bottom:1.5em;">${emailInfo1}</p>
      <p style="font-size:1.1em;margin-bottom:1.5em;">${emailInfo2}</p>
      <p style="font-size:1em;color:#444;margin-top:2em;">${emailFooter}</p>
    </div>
    <div style="text-align:center;padding:16px 0;font-size:12px;color:#fff;background-color:rgba(10,35,66,0.85);border-bottom-left-radius:8px;border-bottom-right-radius:8px;">
      <span>© ${new Date().getFullYear()} Norwegian Open WCS. All rights reserved.</span>
    </div>
  </div>
  `;

  function selectStatus(status: string) {
    selectedStatus = status;
    selectedLevel = null;
    selectedPassOption = null;
  }
  function selectLevel(level: string) {
    selectedLevel = level;
    selectedStatus = null;
    selectedPassOption = null;
  }
  function selectPassOption(pass: string) {
    selectedPassOption = pass;
    selectedStatus = null;
    selectedLevel = null;
  }

  async function sendMail() {
    sending = true;
    const formData = new FormData();
    formData.append('selectedIDs', useTestMail ? JSON.stringify([]) : JSON.stringify(selectedEmails));
    formData.append('htmlContent', emailContent);
    formData.append('subject', emailHeader || 'Norwegian Open WCS 2025 Announcement');
    await fetch('?/sendMassEmail', {
      method: 'POST',
      body: formData
    });
    sending = false;
    showConfirm = false;
    emailHeader = '';
    emailInfo1 = '';
    emailInfo2 = '';
    emailFooter = '';
    useTestMail = false;
    location.reload();
  }
</script>

<svelte:head>
  <title>Send Mass Email - Norwegian Open WCS 2025</title>
</svelte:head>

<div class="bg-gray-800 p-6 rounded-lg shadow-lg max-w-3xl mx-auto my-8">
  <h1 class="text-3xl font-bold text-amber-400 mb-6 font-[NorseBold]">Send Mass Email</h1>

  <div class="mb-6 flex flex-wrap gap-8">
    <!-- Status column -->
    <div>
      <div class="text-gray-200 font-semibold mb-2">Filter by status:</div>
      <div class="flex flex-col gap-2">
        {#each statuses as status}
          <button
            class="px-3 py-1 rounded font-semibold shadow transition border-2"
            class:bg-amber-500={selectedStatus === status}
            class:bg-gray-700={selectedStatus !== status}
            class:text-gray-900={selectedStatus === status}
            class:text-gray-200={selectedStatus !== status}
            class:border-amber-400={selectedStatus === status}
            class:border-gray-600={selectedStatus !== status}
            on:click={() => selectStatus(status)}
            aria-pressed={selectedStatus === status}
            disabled={useTestMail}
          >
            {status}
          </button>
        {/each}
      </div>
    </div>
    <!-- Level column -->
    <div>
      <div class="text-gray-200 font-semibold mb-2">Filter by level:</div>
      <div class="flex flex-col gap-2">
        {#each levels as level}
          <button
            class="px-3 py-1 rounded font-semibold shadow transition border-2"
            class:bg-amber-500={selectedLevel === level}
            class:bg-gray-700={selectedLevel !== level}
            class:text-gray-900={selectedLevel === level}
            class:text-gray-200={selectedLevel !== level}
            class:border-amber-400={selectedLevel === level}
            class:border-gray-600={selectedLevel !== level}
            on:click={() => selectLevel(level)}
            aria-pressed={selectedLevel === level}
            disabled={useTestMail}
          >
            {level}
          </button>
        {/each}
      </div>
    </div>
    <!-- PassOption column (Zero to Hero, dummyReg, etc) -->
    {#if passOptions.length > 0}
    <div>
      <div class="text-gray-200 font-semibold mb-2">Filter by pass type:</div>
      <div class="flex flex-col gap-2">
        {#each passOptions as pass}
          <button
            class="px-3 py-1 rounded font-semibold shadow transition border-2"
            class:bg-amber-500={selectedPassOption === pass}
            class:bg-gray-700={selectedPassOption !== pass}
            class:text-gray-900={selectedPassOption === pass}
            class:text-gray-200={selectedPassOption !== pass}
            class:border-amber-400={selectedPassOption === pass}
            class:border-gray-600={selectedPassOption !== pass}
            on:click={() => selectPassOption(pass)}
            aria-pressed={selectedPassOption === pass}
            disabled={useTestMail}
          >
            {pass}
          </button>
        {/each}
      </div>
    </div>
    {/if}
  </div>

  <!-- Preview Table -->
  <div class="mb-6">
    <div class="flex items-center justify-between mb-2">
      <div class="text-gray-200 font-semibold">Recipients Preview:</div>
      {#if filtered.length > 0}
        <button
          class="text-amber-400 hover:underline text-sm font-semibold focus:outline-none"
          on:click={() => showRecipients = !showRecipients}
        >
          {showRecipients ? 'Hide' : 'Show'} recipients ({filtered.length})
        </button>
      {/if}
    </div>
    {#if filtered.length > 0 && showRecipients}
      <div class="overflow-x-auto rounded border border-gray-700 bg-gray-900 mb-0">
        <table class="min-w-full text-sm text-left">
          <thead>
            <tr class="bg-gray-800 text-amber-300">
              <th class="px-4 py-2">Full Name</th>
              <th class="px-4 py-2">Email</th>
              <th class="px-4 py-2">Level</th>
              <th class="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {#each filtered as reg}
              <tr class="border-t border-gray-700 hover:bg-gray-800">
                <td class="px-4 py-2">{reg.FullName}</td>
                <td class="px-4 py-2">{reg.Email}</td>
                <td class="px-4 py-2">{reg.Level}</td>
                <td class="px-4 py-2">{reg.RegistrationStatus}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
    {#if filtered.length > 0}
      <div class="flex justify-end bg-gray-900 border-x border-b border-gray-700 rounded-b px-4 py-2 text-amber-300 font-semibold text-sm">
        Total recipients: {filtered.length}
      </div>
    {:else}
      <div class="text-gray-400 italic">No recipients selected.</div>
    {/if}
  </div>

  <!-- Email content fields (unchanged) -->
  <div class="mb-4">
    <label for="emailHeader" class="text-gray-200 font-semibold mb-2 block">Email Header:</label>
    <input
      class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-amber-500 focus:border-amber-500 mb-2"
      type="text"
      bind:value={emailHeader}
      placeholder="Enter email header/title here"
    />
  </div>
  <div class="mb-4">
    <label for="firstParagraf" class="text-gray-200 font-semibold mb-2 block">Info Section 1:</label>
    <textarea
      class="w-full min-h-[80px] p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-amber-500 focus:border-amber-500 mb-2"
      bind:value={emailInfo1}
      placeholder="First info paragraph (HTML allowed)"
      on:input={() => showPreview = true}
    ></textarea>
  </div>
  <div class="mb-4">
    <label for="secondParagraf" class="text-gray-200 font-semibold mb-2 block">Info Section 2:</label>
    <textarea
      class="w-full min-h-[80px] p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-amber-500 focus:border-amber-500 mb-2"
      bind:value={emailInfo2}
      placeholder="Second info paragraph (HTML allowed)"
      on:input={() => showPreview = true}
    ></textarea>
  </div>
  <div class="mb-4">
    <label for="lastWords" class="text-gray-200 font-semibold mb-2 block">Email Footer:</label>
    <input
      class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-amber-500 focus:border-amber-500 mb-2"
      type="text"
      bind:value={emailFooter}
      placeholder="E.g. Regards, The Norwegian Open Team"
      on:input={() => showPreview = true}
    />
  </div>

  {#if showPreview && emailContent}
    <div class="mb-4 bg-gray-900 rounded p-4 border border-gray-700">
      <label for="emailPreview" class="text-gray-200 font-semibold mb-2 block">Preview:</label>
      <iframe
        class="w-full bg-gray-900 border-none rounded"
        style="color: #fff; background: transparent; display: block; width: 100%;" 
        srcdoc={emailContent}
        title="Email Preview"
        on:load={(e) => {
          const iframe = e.target;
          if (iframe && iframe.contentWindow && iframe.contentDocument) {
            // Wait for content to render
            setTimeout(() => {
              iframe.style.height = iframe.contentDocument.body.scrollHeight + 'px';
            }, 50);
          }
        }}
      ></iframe>
    </div>
  {/if}

  <div class="mb-4 flex items-center gap-4">
    <label class="flex items-center gap-2 text-sm text-gray-200">
      <input type="checkbox" bind:checked={useTestMail} class="accent-amber-500" />
      Send as test mail (uses test emails)
    </label>
    {#if useTestMail}
      <div class="text-xs text-amber-400 font-semibold">
        Test emails:
        <ul class="list-disc list-inside">
          {#each TEST_EMAILS as email}
            <li>{email}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>

  <button
    class="px-6 py-2 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
    on:click={() => showConfirm = true}
    disabled={sending || !emailContent || (!selectedStatus && !selectedLevel && !selectedPassOption)}
  >
    Send Email
  </button>

  {#if showConfirm}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 shadow-xl border border-amber-500 max-w-md w-full">
        <h2 class="text-xl font-bold text-amber-400 mb-4">Confirm Send</h2>
        <p class="text-gray-200 mb-4">
          Are you sure you want to send this email to {selectedEmails.length} recipients?
        </p>
        <div class="flex gap-4 justify-end">
          <button
            class="px-4 py-2 rounded bg-gray-700 text-gray-200 font-semibold shadow hover:bg-gray-600 transition"
            on:click={() => showConfirm = false}
            disabled={sending}
          >Cancel</button>
          <button
            class="px-4 py-2 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
            on:click={sendMail}
            disabled={sending}
          >{sending ? 'Sending...' : 'Confirm & Send'}</button>
        </div>
      </div>
    </div>
  {/if}
</div>