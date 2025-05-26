<script lang="ts">
    export let selectedHotel: string;
    export let getHotelDisplayName: (key: string) => string;
    export let numberOfNights: number;
    export let calculatedHotelPrice: number | string;
    export let HOTEL_PRICES: Record<string, number>;
    export let personRoomIsRegisteredOn: string;
</script>

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
            {:else}
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