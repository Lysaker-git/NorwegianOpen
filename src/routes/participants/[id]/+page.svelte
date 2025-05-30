<script lang="ts">
    import { page } from '$app/stores';
    
    export let data;
    const { registration, hotelData } = data;

    // Registration status map
    const statusLabels = {
        'pendingApproval': 'Pending approval',
        'approved': 'Approved',
        'waitingList': 'Waiting list',
        'cancelled': 'Cancelled'
    };
</script>

{#if registration}
    <div class="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8 mt-8">
        <h1 class="text-3xl font-bold text-amber-400 mb-6 font-[NorseBold]">Registration Details</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-400">Name:</span>
                <span class="text-lg text-gray-200">{registration.FullName}</span>
            </div>
            <!-- Email -->
            <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-400">Email:</span>
                <span class="text-gray-300">{registration.Email}</span>
            </div>
            <!-- Pass Option -->
            <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-400">Pass Option:</span>
                <span class="text-gray-300">{registration.PassOption}</span>
            </div>
            <!-- Registration Status -->
            <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-400">Status:</span>
                <span class="text-gray-300">
                    {statusLabels[registration.RegistrationStatus] || registration.RegistrationStatus}
                </span>
            </div>
            <!-- Amount Due -->
            <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-400">Amount Due:</span>
                <span class="text-gray-300">{registration.AmountDue?.toLocaleString()} NOK</span>
            </div>
            <!-- User ID -->
            <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-400">User ID:</span>
                <span class="text-gray-300">{registration.userID}</span>
            </div>
        </div>
    </div>    {#if registration.HasPartner}
        <div class="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8 mt-8">
            <h2 class="text-2xl font-bold text-amber-300 mb-4 font-[NorseBold]">Partner Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Partner Name -->
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-300">Name:</span>
                    <span class="text-gray-200">{registration.PartnerName || '—'}</span>
                </div>
                <!-- Partner Email -->
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-300">Email:</span>
                    <span class="text-gray-200">{registration.PartnerEmail || '—'}</span>
                </div>
            </div>
        </div>
    {/if}
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