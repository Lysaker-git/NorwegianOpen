<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { PageData } from '../$types';
  export let data: PageData & { registrations: Registration[] };

  let filtered = data.registrations;
  let selectedStatuses: string[] = [];
  let selectedEmails: string[] = [];
  let emailHeader = '';
  let emailInfo1 = '';
  let emailInfo2 = '';
  let emailFooter = '';
  let showPreview = false;
  let showConfirm = false;
  let sending = false;
  let useTestMail = false;

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
    // ...other fields as needed...
  }

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

  function filterByStatus(status: string) {
    if (selectedStatuses.includes(status)) {
      selectedStatuses = selectedStatuses.filter(s => s !== status);
    } else {
      selectedStatuses = [...selectedStatuses, status];
    }
    filtered = selectedStatuses.length > 0
      ? data.registrations.filter(r => selectedStatuses.includes(r.RegistrationStatus))
      : data.registrations;
    selectedEmails = filtered.map(r => r.Email).filter(Boolean);
  }

  function toggleEmail(email: string) {
    if (selectedEmails.includes(email)) {
      selectedEmails = selectedEmails.filter(e => e !== email);
    } else {
      selectedEmails = [...selectedEmails, email];
    }
  }

  async function sendMail() {
    sending = true;
    const formData = new FormData();
    // Force use of test emails for all sends
    formData.append('selectedIDs', JSON.stringify([]));
    formData.append('htmlContent', emailContent);
    formData.append('subject', emailHeader || 'Norwegian Open WCS 2025 Announcement');
    console.log('Form Data:', {
      selectedIDs: formData.get('selectedIDs'),
      htmlContent: formData.get('htmlContent'),
      subject: formData.get('subject')
    });
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
    selectedEmails = [];
    useTestMail = false;
    location.reload();
  }
</script>

<svelte:head>
  <title>Send Mass Email - Norwegian Open WCS 2025</title>
</svelte:head>

<div class="bg-gray-800 p-6 rounded-lg shadow-lg max-w-3xl mx-auto my-8">
  <h1 class="text-3xl font-bold text-amber-400 mb-6 font-[NorseBold]">Send Mass Email</h1>

  <div class="mb-4 flex flex-wrap gap-2">
    <label for="" class="text-gray-200 font-semibold">Filter by status:</label>
    {#each ['approved', 'pendingApproval', 'waitingList', 'paymentReceived', 'checkedIn'] as status}
      <button
        class="px-3 py-1 rounded font-semibold shadow transition border-2"
        class:bg-amber-500={selectedStatuses.includes(status)}
        class:bg-gray-700={!selectedStatuses.includes(status)}
        class:text-gray-900={selectedStatuses.includes(status)}
        class:text-gray-200={!selectedStatuses.includes(status)}
        class:border-amber-400={selectedStatuses.includes(status)}
        class:border-gray-600={!selectedStatuses.includes(status)}
        on:click={() => filterByStatus(status)}
        aria-pressed={selectedStatuses.includes(status)}
        disabled={useTestMail}
      >
        {status}
      </button>
    {/each}
    <button
      class="px-3 py-1 rounded bg-gray-700 text-gray-200 font-semibold shadow hover:bg-gray-600 transition border-2 border-gray-600"
      on:click={() => { selectedStatuses = []; filtered = data.registrations; selectedEmails = filtered.map(r => r.Email).filter(Boolean); }}
      disabled={useTestMail}
    >
      All
    </button>
  </div>

  <div class="mb-4">
    <label for="" class="text-gray-200 font-semibold mb-2 block">Select recipients:</label>
    <div class="max-h-40 overflow-y-auto bg-gray-900 rounded p-2 border border-gray-700">
      {#each filtered as reg}
        <label class="flex items-center gap-2 text-sm text-gray-200 mb-1">
          <input
            type="checkbox"
            checked={selectedEmails.includes(reg.Email)}
            on:change={() => toggleEmail(reg.Email)}
            class="accent-amber-500"
            disabled={useTestMail}
          />
          {reg.FullName} <span class="text-gray-400">({reg.Email})</span>
        </label>
      {/each}
    </div>
  </div>

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
        class="w-full min-h-[120px] bg-gray-900 border-none rounded"
        style="color: #fff; background: transparent;"
        srcdoc={emailContent}
        title="Email Preview"
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
    disabled={sending || !emailContent}
  >
    Send Email
  </button>

  {#if showConfirm}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 shadow-xl border border-amber-500 max-w-md w-full">
        <h2 class="text-xl font-bold text-amber-400 mb-4">Confirm Send</h2>
        <p class="text-gray-200 mb-4">Are you sure you want to send this email to {selectedEmails.length} recipients?</p>
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
