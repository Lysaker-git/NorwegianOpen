<script lang="ts">
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import { tick } from 'svelte';
    import { page } from '$app/stores';
    import { invalidate } from '$app/navigation';

    export let data;
    const dispatch = createEventDispatcher();
    console.log('Registration data:', data.hotelData);

    // Clone registration to allow editing without mutating original
    let registration = { ...data.registration };
    let original = { ...data.registration };
    let hotelData = data.hotelData || [];


    // Track which field is being edited
    let editingField: string | null = null;

    // Track if any changes have been made
    $: isDirty = JSON.stringify(registration) !== JSON.stringify(original);

    // Registration status options
    const statusOptions = [
        { value: 'pendingApproval', label: 'Pending approval' },
        { value: 'approved', label: 'Approved' },
        { value: 'waitingList', label: 'Waiting list' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    function startEdit(field: string) {
        editingField = field;
        tick().then(() => {
            const input = document.getElementById(`input-${field}`);
            if (input) input.focus();
        });
    }

    function saveEdit(field: string) {
        editingField = null;
    }

    function cancelEdit(field: string) {
        registration[field] = original[field];
        editingField = null;
    }

    function handleInput(field: string, value: any) {
        registration[field] = value;
    }

    function goBack() {
        window.history.back();
    }

    async function saveAndGoBack() {
        const formData = new FormData();
        for (const key in registration) {
            if (registration[key] !== undefined) {
                formData.append(key, registration[key]);
            }
        }

        const res = await fetch('?/' + 'update', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            // Optionally, you can show a toast or notification here
            original = { ...registration };
            await invalidate(''); // Invalidate the page data
            goBack();
        } else {
            // Optionally, handle error
            alert('Failed to update registration');
        }
    }

    let showReminderConfirm = false;
    let reminderStatus: 'idle' | 'sending' | 'sent' | 'error' = 'idle';
    let reminderError = '';

    async function sendPaymentReminder() {
        const formData = new FormData();
        reminderStatus = 'sending';
        reminderError = '';
        const res = await fetch('?/' + 'sendPaymentReminder', {
            method: 'POST',
            body: formData
        });
        console.log('Payment reminder response:', res);
        if (res.ok) {
            reminderStatus = 'sent';
            await invalidate('registration');
        } else {
            reminderStatus = 'error';
            reminderError = 'Failed to send payment reminder.';
        }
        showReminderConfirm = false;
    }
</script>

{#if registration}
    <div class="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8 mt-8 relative">
        <h1 class="text-3xl font-bold text-amber-400 mb-6 font-[NorseBold]">Registration Details</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div class="flex items-center gap-2">
                    <span class="text-lg text-gray-200 font-semibold">{registration.FullName}</span>
            </div>
            <!-- Email -->
            <div class="flex items-center gap-2">
                {#if editingField === 'Email'}
                    <input
                        id="input-Email"
                        class="p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 flex-1"
                        bind:value={registration.Email}
                        on:blur={() => saveEdit('Email')}
                        on:keydown={(e) => e.key === 'Enter' && saveEdit('Email')}
                    />
                    <button aria-label="email change button" class="ml-1 text-gray-400 hover:text-green-400" on:click={() => saveEdit('Email')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button aria-label="email change button" class="ml-1 text-gray-400 hover:text-red-400" on:click={() => cancelEdit('Email')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                {:else}
                    <span class="text-gray-300">{registration.Email}</span>
                    <button aria-label="email change button" class="ml-2 text-gray-400 hover:text-amber-400" on:click={() => startEdit('Email')} title="Edit Email">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2-2l-6 6" /></svg>
                    </button>
                {/if}
            </div>
            <!-- Pass Option -->
            <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-400">Pass Option:</span>
                {#if editingField === 'PassOption'}
                    <input
                        id="input-PassOption"
                        class="p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 flex-1"
                        bind:value={registration.PassOption}
                        on:blur={() => saveEdit('PassOption')}
                        on:keydown={(e) => e.key === 'Enter' && saveEdit('PassOption')}
                    />
                    <button aria-label="Pass change button" class="ml-1 text-gray-400 hover:text-green-400" on:click={() => saveEdit('PassOption')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button aria-label="Pass change button" class="ml-1 text-gray-400 hover:text-red-400" on:click={() => cancelEdit('PassOption')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                {:else}
                    <span class="text-gray-300">{registration.PassOption}</span>
                    <button aria-label="Pass change button" class="ml-2 text-gray-400 hover:text-amber-400" on:click={() => startEdit('PassOption')} title="Edit Pass Option">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2-2l-6 6" /></svg>
                    </button>
                {/if}
            </div>
            <!-- Registration Status -->
            <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-400">Status:</span>
                {#if editingField === 'RegistrationStatus'}
                    <select
                        id="input-RegistrationStatus"
                        class="p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 flex-1"
                        bind:value={registration.RegistrationStatus}
                        on:blur={() => saveEdit('RegistrationStatus')}
                    >
                        {#each statusOptions as opt}
                            <option value={opt.value}>{opt.label}</option>
                        {/each}
                    </select>
                    <button aria-label="Status change button" class="ml-1 text-gray-400 hover:text-green-400" on:click={() => saveEdit('RegistrationStatus')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button aria-label="Status change button" class="ml-1 text-gray-400 hover:text-red-400" on:click={() => cancelEdit('RegistrationStatus')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                {:else}
                    <span class="text-gray-300">
                        {statusOptions.find(opt => opt.value === registration.RegistrationStatus)?.label || registration.RegistrationStatus}
                    </span>
                    <button aria-label="Status change button" class="ml-2 text-gray-400 hover:text-amber-400" on:click={() => startEdit('RegistrationStatus')} title="Edit Status">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2-2l-6 6" /></svg>
                    </button>
                {/if}
            </div>
            <!-- Amount Due -->
            <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-400">Amount Due:</span>
                {#if editingField === 'AmountDue'}
                    <input
                        id="input-AmountDue"
                        type="number"
                        class="p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 flex-1"
                        bind:value={registration.AmountDue}
                        on:blur={() => saveEdit('AmountDue')}
                        on:keydown={(e) => e.key === 'Enter' && saveEdit('AmountDue')}
                    />
                    <button aria-label="amount due change button" class="ml-1 text-gray-400 hover:text-green-400" on:click={() => saveEdit('AmountDue')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button aria-label="amount due change button" class="ml-1 text-gray-400 hover:text-red-400" on:click={() => cancelEdit('AmountDue')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                {:else}
                    <span class="text-gray-300">{registration.AmountDue?.toLocaleString()} NOK</span>
                    <button aria-label="amount due change button" class="ml-2 text-gray-400 hover:text-amber-400" on:click={() => startEdit('AmountDue')} title="Edit Amount Due">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2-2l-6 6" /></svg>
                    </button>
                {/if}
            </div>
            <!-- Comments -->
            <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-400">Comments:</span>
                {#if editingField === 'Comments'}
                    <input
                        id="input-Comments"
                        type="text"
                        class="p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 flex-1"
                        bind:value={registration.comments}
                        on:blur={() => saveEdit('Comments')}
                        on:keydown={(e) => e.key === 'Enter' && saveEdit('Comments')}
                    />
                    <button aria-label="comments change button" class="ml-1 text-gray-400 hover:text-green-400" on:click={() => saveEdit('Comments')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button aria-label="comments change button" class="ml-1 text-gray-400 hover:text-red-400" on:click={() => cancelEdit('Comments')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                {:else}
                    <span class="text-gray-300">{registration.comments?.toLocaleString()}</span>
                    <button aria-label="Comments change button" class="ml-2 text-gray-400 hover:text-amber-400" on:click={() => startEdit('Comments')} title="Edit Comments">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2-2l-6 6" /></svg>
                    </button>
                {/if}
            </div>
            <!-- User ID -->
            <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-400">User ID:</span>
                <span class="text-gray-400">{registration.userID}</span>
            </div>
            <!-- Promo Code -->
            <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-400">Promo Code:</span>
                {#if editingField === 'PromoCode'}
                    <input
                        id="input-PromoCode"
                        class="p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 flex-1"
                        bind:value={registration.PromoCode}
                        on:blur={() => saveEdit('PromoCode')}
                        on:keydown={(e) => e.key === 'Enter' && saveEdit('PromoCode')}
                    />
                    <button aria-label="promo code change button" class="ml-1 text-gray-400 hover:text-green-400" on:click={() => saveEdit('PromoCode')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button aria-label="promo code change button" class="ml-1 text-gray-400 hover:text-red-400" on:click={() => cancelEdit('PromoCode')}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                {:else}
                    <span class="text-gray-300">{registration.PromoCode || '—'}</span>
                    <button aria-label="promo code change button" class="ml-2 text-gray-400 hover:text-amber-400" on:click={() => startEdit('PromoCode')} title="Edit Promo Code">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2-2l-6 6" /></svg>
                    </button>
                {/if}
            </div>
            <!-- Add more fields as needed, following the same pattern -->
        </div>
        <div class="absolute top-4 right-4">
            {#if isDirty}
                <button
                    class="px-6 py-2 bg-amber-500 text-gray-900 font-semibold rounded hover:bg-amber-600 transition-colors duration-150"
                    on:click={saveAndGoBack}
                >
                    Save and Go Back
                </button>
            {:else}
                <button
                    class="px-6 py-2 bg-gray-700 text-gray-300 font-semibold rounded hover:bg-gray-600 transition-colors duration-150"
                    on:click={goBack}
                >
                    Go Back
                </button>
            {/if}
        </div>
    </div>
    <div class="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8 mt-8 relative">
            <h2 class="text-2xl font-bold text-amber-300 mb-4 font-[NorseBold]">Partner Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Partner Name -->
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-300">Name:</span>
                    {#if editingField === 'PartnerName'}
                        <input
                            id="input-PartnerName"
                            class="p-2 rounded bg-gray-800 border border-gray-600 text-gray-200 flex-1"
                            bind:value={registration.PartnerName}
                            on:blur={() => saveEdit('PartnerName')}
                            on:keydown={(e) => e.key === 'Enter' && saveEdit('PartnerName')}
                        />
                        <button aria-label="partner name change button" class="ml-1 text-gray-400 hover:text-green-400" on:click={() => saveEdit('PartnerName')}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        </button>
                        <button aria-label="partner name change button" class="ml-1 text-gray-400 hover:text-red-400" on:click={() => cancelEdit('PartnerName')}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    {:else}
                        <span class="text-gray-200">{registration.PartnerName || '—'}</span>
                        <button aria-label="partner name change button" class="ml-2 text-gray-400 hover:text-amber-400" on:click={() => startEdit('PartnerName')} title="Edit Partner Name">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2-2l-6 6" /></svg>
                        </button>
                    {/if}
                </div>
                <!-- Partner Email -->
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-300">Email:</span>
                    {#if editingField === 'PartnerEmail'}
                        <input
                            id="input-PartnerEmail"
                            class="p-2 rounded bg-gray-800 border border-gray-600 text-gray-200 flex-1"
                            bind:value={registration.PartnerEmail}
                            on:blur={() => saveEdit('PartnerEmail')}
                            on:keydown={(e) => e.key === 'Enter' && saveEdit('PartnerEmail')}
                        />
                        <button aria-label="partner email change button" class="ml-1 text-gray-400 hover:text-green-400" on:click={() => saveEdit('PartnerEmail')}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        </button>
                        <button aria-label="partner email change button" class="ml-1 text-gray-400 hover:text-red-400" on:click={() => cancelEdit('PartnerEmail')}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    {:else}
                        <span class="text-gray-200">{registration.PartnerEmail || '—'}</span>
                        <button aria-label="partner email change button" class="ml-2 text-gray-400 hover:text-amber-400" on:click={() => startEdit('PartnerEmail')} title="Edit Partner Email">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2-2l-6 6" /></svg>
                        </button>
                    {/if}
                </div>
            </div>
        </div>
        <!-- End Partner Details Card -->
        {#if hotelData && Object.keys(hotelData).length > 0}
            <div class="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8 mt-8 relative">
                <h2 class="text-2xl font-bold text-amber-300 mb-4 font-[NorseBold]">Hotel Registration</h2>
                    <div class="mb-4 border-b border-gray-700 pb-4">
                        <div class="flex flex-col md:flex-row md:gap-8">
                            <div class="flex-1">
                                <p><span class="font-semibold text-gray-300">Full Name:</span> <span class="text-gray-200">{hotelData.fullname}</span></p>
                                <p><span class="font-semibold text-gray-300">Email:</span> <span class="text-gray-200">{hotelData.email}</span></p>
                                <p><span class="font-semibold text-gray-300">Hotel Option:</span> <span class="text-gray-200">{hotelData.hoteloption}</span></p>
                                <p><span class="font-semibold text-gray-300">Check-in:</span> <span class="text-gray-200">{hotelData.checkindate}</span></p>
                                <p><span class="font-semibold text-gray-300">Check-out:</span> <span class="text-gray-200">{hotelData.checkoutdate}</span></p>
                                <p><span class="font-semibold text-gray-300">Roommates:</span> <span class="text-gray-200">{hotelData.roommates}</span></p>
                                <p><span class="font-semibold text-gray-300">Special Requests:</span> <span class="text-gray-200">{hotelData.specialrequests}</span></p>
                                <p><span class="font-semibold text-gray-300">Amount Due:</span> <span class="text-gray-200">{hotelData.amountdue} NOK</span></p>
                                <p><span class="font-semibold text-gray-300">Number of Nights:</span> <span class="text-gray-200">{hotelData.numberofnights}</span></p>
                            </div>
                        </div>
                    </div>
            </div>
        {:else}
            <div class="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8 mt-8 text-gray-400 text-center">
                No hotel registration found for this user.
            </div>
        {/if}
{:else}
    <p class="text-gray-400 text-center mt-8">Registration not found.</p>
{/if}

{#if registration && registration.RegistrationStatus === 'approved'}
    <div class="mt-6 flex items-center gap-4">
        <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" on:click={() => showReminderConfirm = true}>
            Send Payment Reminder
        </button>
        {#if reminderStatus === 'sent'}
            <span class="text-green-400 ml-2">Reminder sent!</span>
        {:else if reminderStatus === 'error'}
            <span class="text-red-400 ml-2">{reminderError}</span>
        {/if}
    </div>
    {#if showReminderConfirm}
        <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-gray-800 p-6 rounded shadow-lg border border-gray-600 max-w-sm w-full">
                <h2 class="text-lg font-bold mb-4 text-white">Send Payment Reminder?</h2>
                <p class="mb-4 text-gray-300">Are you sure you want to send a payment reminder to <span class="font-semibold">{registration.Email}</span>?</p>
                <div class="flex gap-4 justify-end">
                    <button class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" on:click={() => showReminderConfirm = false}>Cancel</button>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" on:click={sendPaymentReminder} disabled={reminderStatus === 'sending'}>
                        {reminderStatus === 'sending' ? 'Sending...' : 'Send Reminder'}
                    </button>
                </div>
            </div>
        </div>
    {/if}
{/if}