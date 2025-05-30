<!-- src/routes/admin/registrations/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';

    let isSaving = false;

    export let data: PageData; // `registrations` will be in data.registrations

    let searchTerm = '';
    let filteredRegistrations = data.registrations;

    let editedStatuses: Record<string, string> = {};
    let showSave = false;
    let sendApprovedMail = true;

    const originalStatuses: Record<string, string> = {};
    data.registrations.forEach(reg => {
        originalStatuses[reg.userID] = reg.RegistrationStatus;
    });

    function handleStatusChange(userID: string, newStatus: string) {
        editedStatuses[userID] = newStatus;
        showSave = Object.keys(editedStatuses).length > 0;
    }

async function saveChanges() {
    const updates = Object.entries(editedStatuses).map(([userID, newStatus]) => ({ userID, newStatus }));

    try {
        const formData = new FormData();
        formData.append('updates', JSON.stringify(updates));
        formData.append('sendApprovedMail', sendApprovedMail.toString());

        console.log('[CLIENT]' ,formData.get('updates')); // Debugging line to check the updates being sent
        console.log('[CLIENT]' ,formData.get('sendApprovedMail')); // Debugging line to check the sendApprovedMail value

        const res = await fetch('?/updateStatus', {
            method: 'POST',
            body: formData
        });

        console.log('[CLIENT]' ,'Response status:', res.status); // Debugging line to check the response status
        const result = await res.json();
        
        console.log('[CLIENT]' ,'Response data:', result); // Debugging line to check the response data

        if (result.status === 200) {
            location.reload();
        } else {
            const errorMessage = result.error || 'Unknown error occurred';
            console.error('Save error:', errorMessage);
            alert(`[IF ERROR] Failed to save changes: ${errorMessage}`);
        }
    } catch (error) {
        console.error('Save error:', error);
        alert(`[CATCH ERROR]Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
        isSaving = false;
    }
}

    $: emailsToApprove = Object.entries(editedStatuses)
    .filter(([userID, newStatus]) =>
        newStatus === 'approved' &&
        originalStatuses[userID] !== 'approved' &&
        !!data.registrations.find(r => r.userID === userID && r.Email)
    )
    .map(([userID]) =>
        data.registrations.find(r => r.userID === userID)?.Email
    )
    .filter(Boolean);
    
    function normalize(str: string = '') {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    $: {
        if (searchTerm) {
            const normSearch = normalize(searchTerm);

            // Find all names that match the normalized search term
            const matchingNames = new Set(
                data.registrations
                    .flatMap(reg => [reg.FullName, reg.PartnerName])
                    .filter(name => name && normalize(name).includes(normSearch))
            );

            filteredRegistrations = data.registrations.filter(reg =>
                reg.FullName?.toLowerCase().includes(normSearch) ||
                reg.Email?.toLowerCase().includes(normSearch) ||
                reg.userID?.toLowerCase().includes(normSearch) ||
                reg.PassOption?.toLowerCase().includes(normSearch) ||
                reg.RegistrationStatus?.toLowerCase().includes(normSearch) ||
                reg.PartnerName?.toLowerCase().includes(normSearch) ||
                matchingNames.has(reg.FullName) ||
                matchingNames.has(reg.PartnerName)
            );
        } else {
            filteredRegistrations = data.registrations;
        }
    }
    function formatDate(dateString: string | null) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
</script>

<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h1 class="text-3xl font-bold text-amber-400 mb-6 font-[NorseBold]">Event Registrations</h1>

    <div class="mb-4">
        <input
            type="text"
            placeholder="Search by Name, Email, UserID, Pass, Status..."
            bind:value={searchTerm}
            class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-amber-500 focus:border-amber-500"
        />
    </div>

    {#if filteredRegistrations.length === 0}
        <p class="text-gray-400">No registrations found.</p>
    {:else}
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-700">
                <thead class="bg-gray-750">
                    <tr>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Partner Name</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pass Option</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount Due</th>
                    </tr>
                </thead>
                <tbody class="bg-gray-800 divide-y divide-gray-700">
                    {#each filteredRegistrations as reg (reg.id)}
                        <tr>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-amber-400">
                                    <a
                                        href={`/admin/registrations/${reg.userID}`}
                                        class="inline-block px-4 py-2 bg-amber-500 text-gray-900 font-semibold rounded hover:bg-amber-600 transition-colors duration-150"
                                    >
                                        View/Edit
                                    </a>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-200">{reg.FullName}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-200">{reg.PartnerName || ''}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{reg.Role}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{reg.PassOption}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm">
                                <select
                                    class="bg-gray-700 text-gray-100 rounded px-2 py-1"
                                    value={editedStatuses[reg.userID] ?? reg.RegistrationStatus}
                                    on:change={(e) => handleStatusChange(reg.userID, e.target?.value)}
                                >
                                    <option value="pendingApproval">Pending Approval</option>
                                    <option value="waitingList">Waiting List</option>
                                    <option value="approved">Approved</option>
                                    <option value="paymentReceived">Paid</option>
                                    <option value="checkedIn">Checked In</option>
                                </select>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{reg.AmountDue?.toLocaleString()} NOK</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
{#if showSave}
    <div class="flex items-center justify-end mt-4 gap-4">
        <label class="flex items-center gap-2 text-sm text-gray-200">
            <input type="checkbox" bind:checked={sendApprovedMail} class="accent-amber-500" />
            Send mail to newly approved registrations
        </label>
        <button
            class="px-6 py-2 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
            on:click={saveChanges}
            disabled={isSaving}
        >
            {isSaving ? 'Saving...' : 'Save'}
        </button>
    </div>
    {#if sendApprovedMail}
        {#if emailsToApprove.length > 0}
            <div class="mt-4 p-4 rounded bg-gray-700 text-gray-100 shadow">
                <div class="font-semibold mb-2 text-amber-300">
                    The following emails will receive an approval email:
                </div>
                <ul class="list-disc list-inside text-sm">
                    {#each emailsToApprove as email}
                        <li>{email}</li>
                    {/each}
                </ul>
            </div>
        {:else}
            <div class="mt-4 p-4 rounded bg-gray-700 text-gray-300 shadow text-sm">
                No new approved registrations will receive an email.
            </div>
        {/if}
    {/if}
{/if}

{#if isSaving}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-gray-800 rounded-lg p-6 shadow-xl border border-amber-500">
            <div class="flex items-center gap-3">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                <span class="text-amber-400 font-semibold">Saving changes...</span>
            </div>
        </div>
    </div>
{/if}