<!-- e.g., src/lib/components/HotelRegistrationForm.svelte -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types'; // Adjust if this form has its own +page.server.ts action
    import { HOTEL_PRICES } from '$lib/components/constants'; // Ensure HOTEL_PRICES is exported from here

    // Props for form feedback (if used as a component in a page with a server action)
    // export let form: ActionData | null = null;

    // --- Constants ---
    const hotelMinDate = '2025-10-02';
    const hotelMaxDate = '2025-10-06';

    // --- State Variables ---
    let email: string = ''; // To associate with the main registration
    let fullName: string = ''; // For identification with the hotel booking
    let selectedHotel: string = '';
    let checkInDate: string = '';
    let checkOutDate: string = '';

    let personRoomIsRegisteredOn: string = ''; // For "None" option where user stays with someone else
    let twinRoomMate: string = '';
    let tripleRoomMate1: string = '';
    let tripleRoomMate2: string = '';
    let quatroRoomMate1: string = '';
    let quatroRoomMate2: string = '';
    let quatroRoomMate3: string = '';

    let numberOfNights: number = 0;
    let calculatedHotelPrice: number | string = 'Select hotel and dates';
    let finalCalculatedHotelPrice: number | null = null; // For hidden input

    // --- Reactive Calculations ---
    $: {
        // 1. Calculate Number of Nights
        if (selectedHotel && selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo' && checkInDate && checkOutDate && new Date(checkOutDate) > new Date(checkInDate)) {
            const start = new Date(checkInDate);
            const end = new Date(checkOutDate);
            const timeDiff = end.getTime() - start.getTime();
            numberOfNights = Math.max(0, Math.round(timeDiff / (1000 * 3600 * 24))); // Ensure non-negative
        } else {
            numberOfNights = 0;
        }

        // 2. Calculate Hotel Price
        let hotelNightlyRate = 0;
        if (selectedHotel && HOTEL_PRICES[selectedHotel] !== undefined) {
            hotelNightlyRate = HOTEL_PRICES[selectedHotel];
        }

        if (hotelNightlyRate > 0 && numberOfNights > 0 && selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo') {
            calculatedHotelPrice = hotelNightlyRate * numberOfNights;
        } else if (selectedHotel && (selectedHotel === 'None' || selectedHotel === 'HotelOptionNo')) {
            calculatedHotelPrice = 0; // No cost for these options
        } else {
            calculatedHotelPrice = 'Select hotel and valid dates';
        }
        finalCalculatedHotelPrice = (typeof calculatedHotelPrice === 'number') ? calculatedHotelPrice : null;
    }

    function getHotelDisplayName(key: string): string {
        switch(key) {
            case 'HotelOptionOne': return 'Single Room';
            case 'HotelOptionTwo': return 'Twin Room';
            case 'HotelOptionThree': return 'Triple Room';
            case 'HotelOptionFour': return 'Quatro Room';
            case 'None': return 'Staying with someone else / Arranged own';
            case 'HotelOptionNo': return 'No hotel needed';
            default: return 'Selected Hotel';
        }
    }
</script>

<div class="container mx-auto px-4 py-12">
    <h2 class="text-3xl sm:text-4xl font-bold text-center mb-10 text-gray-100 font-[NorseBold]">
        Hotel Booking - Norwegian Open 2025
    </h2>

    <form method="POST" action="?/bookHotel" use:enhance class="space-y-6 max-w-xl mx-auto bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl border border-gray-700 text-white">
        <p class="text-sm text-gray-400 mb-6">
            If you wish to book a hotel room through us, please complete the form below.
            This can be done separately from your main event registration.
        </p>

        <div>
            <label for="hotel-email" class="block text-sm font-medium">Email (used for main registration) *</label>
            <input type="email" id="hotel-email" name="Email" bind:value={email} required
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                   />
            <!-- Add form error display if needed: {#if form?.field === 'Email'} ... {/if} -->
        </div>

        <div>
            <label for="hotel-fullname" class="block text-sm font-medium">Full Name *</label>
            <input type="text" id="hotel-fullname" name="FullName" bind:value={fullName} required
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                   />
        </div>

        <div>
            <label for="hotel-selection" class="block text-sm font-medium">Hotel Option (Prices per night)</label>
            <select
                bind:value={selectedHotel}
                id="hotel-selection"
                name="HotelSelection"
                required
                class="mt-1 block w-full px-3 py-2 border text-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                <option value="" selected disabled>Select Hotel Option</option>
                <option value="None">I will stay with someone else / Arrange my own</option>
                <option value="HotelOptionOne">Single Room ({HOTEL_PRICES.HotelOptionOne?.toLocaleString()} NOK)</option>
                <option value="HotelOptionTwo">Twin Room ({HOTEL_PRICES.HotelOptionTwo?.toLocaleString()} NOK)</option>
                <option value="HotelOptionThree">Triple Room ({HOTEL_PRICES.HotelOptionThree?.toLocaleString()} NOK)</option>
                <option value="HotelOptionFour">Quatro Room ({HOTEL_PRICES.HotelOptionFour?.toLocaleString()} NOK)</option>
                <option value="HotelOptionNo">No, I do not need a hotel room booked via the event</option>
            </select>
        </div>

        {#if selectedHotel && selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo'}
            <fieldset class="mt-4 p-4 border border-gray-600 rounded-md space-y-4">
                <legend class="text-md font-medium text-white px-1">Select Dates for Your Stay:</legend>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="hotel-checkInDate" class="block text-sm font-medium">Check-In Date *</label>
                        <input type="date" id="hotel-checkInDate" name="CheckInDate"
                               bind:value={checkInDate}
                               min={hotelMinDate}
                               max={hotelMaxDate}
                               required
                               on:change={() => {
                                   if (checkOutDate && new Date(checkInDate) > new Date(checkOutDate)) {
                                       checkOutDate = checkInDate;
                                   }
                               }}
                               class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                               />
                    </div>
                    <div>
                        <label for="hotel-checkOutDate" class="block text-sm font-medium">Check-Out Date *</label>
                        <input type="date" id="hotel-checkOutDate" name="CheckOutDate"
                               bind:value={checkOutDate}
                               min={checkInDate || hotelMinDate}
                               max={hotelMaxDate}
                               required
                               class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                               />
                    </div>
                </div>
                <p class="text-xs text-gray-400 mt-1">
                    Hotel stays are available between {new Date(hotelMinDate).toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })} and {new Date(hotelMaxDate).toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })}.
                </p>
            </fieldset>
        {/if}

        {#if selectedHotel === 'None'}
            <div class="mt-4">
                <label for="personRoomIsRegisteredOn" class="block text-sm font-medium">
                    If staying with someone who has booked, what is the name on their booking? (Optional)
                </label>
                <input type="text" id="personRoomIsRegisteredOn" name="PersonRoomIsRegisteredOn"
                       bind:value={personRoomIsRegisteredOn}
                       placeholder="e.g., Jane Doe"
                       class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
            </div>
        {/if}

        {#if selectedHotel === 'HotelOptionTwo'}
            <div class="mt-4">
                <label for="twinRoomMate" class="block text-sm font-medium">Name of your roommate *</label>
                <input required type="text" id="twinRoomMate" name="Roommate1"
                       bind:value={twinRoomMate}
                       placeholder="Roommate name"
                       class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
            </div>
        {/if}

        {#if selectedHotel === 'HotelOptionThree'}
            <fieldset class="mt-4 p-4 border border-gray-600 rounded-md space-y-2">
                <legend class="text-md font-medium text-white px-1">Names of your roommates *</legend>
                <input required type="text" id="tripleRoomMate1" name="Roommate1"
                       bind:value={tripleRoomMate1}
                       placeholder="Roommate 1 name"
                       class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
                <input required type="text" id="tripleRoomMate2" name="Roommate2"
                       bind:value={tripleRoomMate2}
                       placeholder="Roommate 2 name"
                       class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
            </fieldset>
        {/if}

        {#if selectedHotel === 'HotelOptionFour'}
             <fieldset class="mt-4 p-4 border border-gray-600 rounded-md space-y-2">
                <legend class="text-md font-medium text-white px-1">Names of your roommates *</legend>
                <input required type="text" id="quatroRoomMate1" name="Roommate1"
                       bind:value={quatroRoomMate1}
                       placeholder="Roommate 1 name"
                       class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
                <input required type="text" id="quatroRoomMate2" name="Roommate2"
                       bind:value={quatroRoomMate2}
                       placeholder="Roommate 2 name"
                       class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
                <input required type="text" id="quatroRoomMate3" name="Roommate3"
                       bind:value={quatroRoomMate3}
                       placeholder="Roommate 3 name"
                       class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
            </fieldset>
        {/if}

        <!-- Hotel Order Summary -->
        {#if selectedHotel}
            <div class="my-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50 text-gray-800 shadow-md">
                <h3 class="text-lg font-semibold mb-3 text-center text-indigo-700">Hotel Booking Summary</h3>
                <div class="flex justify-between items-center py-1">
                    <span class="text-gray-700">Selected Option:</span>
                    <span class="font-medium">{getHotelDisplayName(selectedHotel)}</span>
                </div>

                {#if selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo'}
                    {#if numberOfNights > 0 && typeof calculatedHotelPrice === 'number'}
                        <div class="flex justify-between items-center py-1 mt-1">
                            <span class="text-gray-700">Nights:</span>
                            <span class="font-medium">{numberOfNights} night{numberOfNights !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="flex justify-between items-center py-1">
                            <span class="text-gray-700">Price per night:</span>
                            <span class="font-medium">{HOTEL_PRICES[selectedHotel]?.toLocaleString()} NOK</span>
                        </div>
                        <hr class="my-2 border-indigo-300">
                        <div class="flex justify-between items-center text-lg">
                            <span class="font-bold text-gray-800">Hotel Total</span>
                            <span class="font-bold text-indigo-700">
                                {calculatedHotelPrice.toLocaleString('en-US')} NOK
                            </span>
                        </div>
                    {:else if selectedHotel}
                        <p class="text-center text-sm text-gray-600 mt-2">Please select valid check-in and check-out dates to see the price.</p>
                    {/if}
                {:else if selectedHotel === 'None'}
                     <p class="text-center text-sm text-gray-700 mt-2">No hotel cost through event booking.</p>
                     {#if personRoomIsRegisteredOn}
                        <p class="text-xs text-center text-gray-600">Staying with: {personRoomIsRegisteredOn}</p>
                     {/if}
                {:else if selectedHotel === 'HotelOptionNo'}
                    <p class="text-center text-sm text-gray-700 mt-2">You've indicated you do not need a hotel room booked via the event.</p>
                {/if}
            </div>
        {/if}

        <input type="hidden" name="CalculatedHotelPrice" value={finalCalculatedHotelPrice} />
        <input type="hidden" name="NumberOfNights" value={selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo' ? numberOfNights : 0} />

        <div>
            <button type="submit"
                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    disabled={!selectedHotel || (selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo' && (numberOfNights === 0 || typeof calculatedHotelPrice !== 'number'))}>
                {#if !selectedHotel}
                    Select Hotel Option
                {:else if selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo' && (numberOfNights === 0 || typeof calculatedHotelPrice !== 'number')}
                    Complete Date Selection
                {:else if typeof calculatedHotelPrice === 'number' && calculatedHotelPrice > 0}
                    Submit Hotel Booking Request (Total: {calculatedHotelPrice.toLocaleString('en-US')} NOK)
                {:else}
                    Confirm Hotel Choice
                {/if}
            </button>
        </div>
        <!-- {#if form?.message}
             <p class="text-green-600 text-sm mt-2 text-center">{form.message}</p>
        {/if}
        {#if form?.error && !form?.field}
             <p class="text-red-600 text-sm mt-2 text-center">{form.error}</p>
        {/if} -->
    </form>
</div>

<style>
    /* You can add specific styles for the hotel form here if needed */
    /* Ensure input text is visible */
    input[type="text"], input[type="email"], input[type="date"], select {
        color: #1f2937; /* Tailwind gray-800 for dark text */
    }
    ::placeholder {
        color: #6b7280; /* Tailwind gray-500 */
    }
</style>