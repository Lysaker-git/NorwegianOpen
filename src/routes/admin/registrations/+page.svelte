<!-- src/routes/admin/registrations/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';

    export let data: PageData; // `registrations` will be in data.registrations

    let searchTerm = '';
    let filteredRegistrations = data.registrations;

    $: {
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filteredRegistrations = data.registrations.filter(reg =>
                reg.FullName?.toLowerCase().includes(lowerSearchTerm) ||
                reg.Email?.toLowerCase().includes(lowerSearchTerm) ||
                reg.userID?.toLowerCase().includes(lowerSearchTerm) ||
                reg.PassOption?.toLowerCase().includes(lowerSearchTerm) ||
                reg.RegistrationStatus?.toLowerCase().includes(lowerSearchTerm)
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
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">UserID</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pass Option</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount Due</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Registered</th>
                    </tr>
                </thead>
                <tbody class="bg-gray-800 divide-y divide-gray-700">
                    {#each filteredRegistrations as reg (reg.id)}
                        <tr>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-amber-400">
                                <a href="/admin/registrations/{reg.id}" class="hover:text-amber-300">View/Edit</a>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-200">{reg.FullName}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{reg.Email}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{reg.userID}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{reg.PassOption}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm">
                                {#if reg.RegistrationStatus === 'pendingApproval'}
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-600 text-yellow-100">Pending Approval</span>
                                {:else if reg.RegistrationStatus === 'waitingList'}
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-600 text-blue-100">Waiting List</span>
                                {:else if reg.RegistrationStatus === 'approved'}
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-600 text-green-100">Approved</span>
                                {:else if reg.RegistrationStatus === 'paymentReceived'}
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-500 text-teal-100">Paid</span>
                                {:else if reg.RegistrationStatus === 'checkedIn'}
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-600 text-purple-100">Checked In</span>
                                {:else}
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-600 text-gray-100">{reg.RegistrationStatus || 'N/A'}</span>
                                {/if}
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{reg.AmountDue?.toLocaleString()} NOK</td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{formatDate(reg.created_at)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>