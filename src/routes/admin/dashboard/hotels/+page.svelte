<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';

    interface HotelRegistration {
        id: number;
        fullname: string | null;
        email: string | null;
        hoteloption: string | null;
        checkindate: string | null;
        checkoutdate: string | null;
        numberofnights: string | null;
        roommates: string | null;
        specialrequests: string | null;
        amountdue: number | null;
        paymentdeadline: string | null;
        created_at: string;
        status: string | null;
    }

    export let data: PageData & { hotelRegistrations: HotelRegistration[] };

    let searchTerm = '';
    let filteredRegistrations = data.hotelRegistrations;
    let editedStatuses: Record<number, string> = {};
    let isSaving = false;
    let showSave = false;

    const statusOptions = [
        { value: 'pending', label: 'Pending Payment' },
        { value: 'paid', label: 'Paid in Full' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    function getHotelDisplayName(key: string | null): string {
        if (!key) return 'Unknown';
        switch(key) {
            case 'HotelOptionOne': return 'Single Room';
            case 'HotelOptionTwo': return 'Twin Room';
            case 'HotelOptionThree': return 'Triple Room';
            case 'HotelOptionFour': return 'Quatro Room';
            default: return key;
        }
    }

    function formatDate(dateString: string | null) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    }

    async function saveChanges() {
        isSaving = true;
        const updates = Object.entries(editedStatuses).map(([id, status]) => ({ id: parseInt(id), status }));

        try {
            const formData = new FormData();
            formData.append('updates', JSON.stringify(updates));

            const res = await fetch('?/updateStatus', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                location.reload();
            } else {
                const errorMessage = await res.text();
                alert(`Failed to save changes: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            isSaving = false;
        }
    }

    function handleStatusChange(id: number, newStatus: string) {
        editedStatuses[id] = newStatus;
        showSave = Object.keys(editedStatuses).length > 0;
    }

    $: {
        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            filteredRegistrations = data.hotelRegistrations.filter(reg =>
                reg.fullname?.toLowerCase().includes(searchTermLower) ||
                reg.email?.toLowerCase().includes(searchTermLower) ||
                reg.hoteloption?.toLowerCase().includes(searchTermLower) ||
                reg.roommates?.toLowerCase().includes(searchTermLower)
            );
        } else {
            filteredRegistrations = data.hotelRegistrations;
        }
    }
</script>

<div class="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h1 class="text-3xl font-bold text-amber-400 mb-6 font-[NorseBold]">Hotel Registrations</h1>

    <div class="mb-4">
        <input
            type="text"
            placeholder="Search by Name, Email, Room Type, Roommates..."
            bind:value={searchTerm}
            class="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-amber-500 focus:border-amber-500"
        />
    </div>

    {#if filteredRegistrations.length === 0}
        <p class="text-gray-400">No hotel registrations found.</p>
    {:else}
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-700">
                <thead class="bg-gray-750">
                    <tr>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Room Type</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Roommates</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Check-in</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Check-out</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nights</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount Due</th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody class="bg-gray-800 divide-y divide-gray-700">
                    {#each filteredRegistrations as reg (reg.id)}
                        <tr class="hover:bg-gray-700/30">
                            <td class="px-4 py-3 whitespace-nowrap">
                                <div>
                                    <div class="text-sm font-medium text-gray-200">{reg.fullname}</div>
                                    <div class="text-sm text-gray-400">{reg.email}</div>
                                </div>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                {getHotelDisplayName(reg.hoteloption)}
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-300">
                                {reg.roommates || '—'}
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                {formatDate(reg.checkindate)}
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                {formatDate(reg.checkoutdate)}
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-300">
                                {reg.numberofnights || '—'}
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                {reg.amountdue?.toLocaleString() || '—'} NOK
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm">
                                <select
                                    class="bg-gray-700 text-gray-100 rounded px-2 py-1"
                                    value={editedStatuses[reg.id] ?? reg.status ?? 'pending'}
                                    on:change={(e) => handleStatusChange(reg.id, e.target?.value)}
                                >
                                    {#each statusOptions as opt}
                                        <option value={opt.value}>{opt.label}</option>
                                    {/each}
                                </select>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        {#if showSave}
            <div class="flex justify-end mt-4">
                <button
                    class="px-6 py-2 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
                    on:click={saveChanges}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        {/if}

        <div class="mt-4 text-gray-400 text-sm">
            Total Registrations: {filteredRegistrations.length}
        </div>
    {/if}
</div>

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