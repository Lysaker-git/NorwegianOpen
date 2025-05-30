<!-- e.g., src/lib/components/HotelRegistrationForm.svelte -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types'; // Adjust if this form has its own +page.server.ts action
    import { HOTEL_PRICES } from '$lib/components/constants'; // Ensure HOTEL_PRICES is exported from here
    import ImageCarousel from './ImageCarousel.svelte';
    import { fade, scale } from 'svelte/transition';

    import fourOne from '$lib/components/images/scandic/quatro/fourOne.webp';
    import connectingRoom from '$lib/components/images/scandic/single/connectingRoom.webp';
    import doublebeds from '$lib/components/images/scandic/single/doublebeds.webp';
    import triple from '$lib/components/images/scandic/triple/triple.webp';

    import HotelBookingSummary from './hotelComponents/HotelBookingSummary.svelte';
    import HotelDatePicker from './hotelComponents/HotelDatePicker.svelte';
    import HotelRoomCard from './hotelComponents/HotelRoomCard.svelte';

    import CardComponent from './cardComponent.svelte';

    export let data: PageData;
    const { availability } = data;

    console.log('[CLIENT SUBPAGE] Hotel Registration', availability);

    const imageModules = import.meta.glob('$lib/components/images/scandic/single/*.webp', { eager: true });
    const imageModulesTriple = import.meta.glob('$lib/components/images/scandic/triple/*.webp', { eager: true });
    const imageModulesQuatro = import.meta.glob('$lib/components/images/scandic/quatro/*.webp', { eager: true });

    const quatroImages = Object.values(imageModulesQuatro).map(module => module.default);
    const singleImages = Object.values(imageModules).map(module => module.default);
    const tripleImages = Object.values(imageModulesTriple).map(module => module.default);

    // Props for form feedback (if used as a component in a page with a server action)
    // export let form: ActionData | null = null;

    // --- Constants ---
    const hotelMinDate = '2025-10-02';
    const hotelMaxDate = '2025-10-06';

    // --- State Variables ---
    let email: string = ''; // To associate with the main registration
    let fullName: string = ''; // For identification with the hotel booking
    let number: string = '';
    let notes: string = '';
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
            default: return 'Selected Hotel';
        }
    }

    function formatPrice(price: number | undefined) {
        return price ? `${price.toLocaleString()} NOK` : '';
    }

    const availableDates = [
        '2025-10-02',
        '2025-10-03',
        '2025-10-04',
        '2025-10-05',
        '2025-10-06'
    ];

    function selectDate(date: string) {
        if (!checkInDate || (checkInDate && checkOutDate)) {
            checkInDate = date;
            checkOutDate = '';
        } else if (date > checkInDate) {
            checkOutDate = date;
        } else {
            checkInDate = date;
            checkOutDate = '';
        }
    }

    function isInRange(date: string): boolean {
        return !!(checkInDate && checkOutDate && date > checkInDate && date < checkOutDate);
    }
    
    const roomOptions = [
        {
            key: 'HotelOptionOne',
            label: 'Single Room',
            description: 'A private room for one person.',
            price: HOTEL_PRICES.HotelOptionOne,
            image: doublebeds,
            features: [
                'Bathroom with shower',
                'Bathroom with shower or bathtub',
                'Table',
                'Wooden floor',
                'Chair/chairs',
                'Free WiFi',
                'Non-smoking',
                'Bathroom amenities',
                'Connecting rooms (available in some rooms)',
                'Sofa bed (available in some rooms)',
                'Adjustable beds (available in some rooms)',
                'Bunk bed (available in some rooms)',
                'Iron and ironing board',
                'Desk and chair',
                'Hair dryer'
            ]
        },
        {
            key: 'HotelOptionTwo',
            label: 'Twin Room',
            description: 'A room for two people. You will need to specify your roommate.',
            price: HOTEL_PRICES.HotelOptionTwo,
            image: connectingRoom, 
            features: [
                'Bathroom with shower',
                'Bathroom with shower or bathtub',
                'Table',
                'Wooden floor',
                'Chair/chairs',
                'Free WiFi',
                'Non-smoking',
                'Bathroom amenities',
                'Connecting rooms (available in some rooms)',
                'Sofa bed (available in some rooms)',
                'Adjustable beds (available in some rooms)',
                'Bunk bed (available in some rooms)',
                'Iron and ironing board',
                'Desk and chair',
                'Hair dryer'
            ]
        },
        {
            key: 'HotelOptionThree',
            label: 'Triple Room',
            description: 'A room for three people. You will need to specify your roommates.',
            price: HOTEL_PRICES.HotelOptionThree,
            image: triple,
            features: [
                'Bathroom with shower',
                'Bathroom with shower or bathtub',
                'Table',
                'Wooden floor',
                'Free WiFi',
                'Chair/chairs',
                'Non-smoking',
                'Bathroom amenities',
                'Connecting rooms (available in some rooms)',
                'Sofa bed (available in some rooms)',
                'Adjustable beds (available in some rooms)',
                'Bunk bed (available in some rooms)',
                'Iron and ironing board',
                'Desk and chair',
                'Hair dryer'
            ]
        },
        {
            key: 'HotelOptionFour',
            label: 'Quatro Room',
            description: 'A room for four people. You will need to specify your roommates.',
            price: HOTEL_PRICES.HotelOptionFour,
            image: fourOne,
            features: [
                'Free WiFi',
                'Bathroom with shower',
                'Bathroom amenities',
                'Wooden floors',
                'Safe (available in some rooms)',
                'Refrigerator (available in some rooms)',
                'Table',
                'Chair(s)',
                'Non-smoking',
                'Upper floors',
                'Easy access',
                'Blackout curtains',
                'Bunk bed',
                'Iron and ironing board',
                'Desk and chair',
                'Hairdryer'
            ]
        }
    ];

    $: showLargeRoomWarning = !availability.hasLargeRoomsAvailable && 
        (selectedHotel === 'HotelOptionThree' || selectedHotel === 'HotelOptionFour');

    $: showNoRoomsWarning = !availability.hasRoomsAvailable;
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
            <label for="hotel-number" class="block text-sm font-medium">Telephone number *</label>
            <input type="text" id="hotel-number" name="number" bind:value={number} required
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                   />
        </div>
        <div>
            <label for="hotel-notes" class="block text-sm font-medium">Any remarks *</label>
            <textarea id="hotel-notes" name="notes" bind:value={notes} required
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                   ></textarea>
        </div>

        <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Hotel Option (Prices per night)</label>
            {#if !selectedHotel}
                {#key 'grid'}
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1"
                        transition:scale={{ duration: 400 }}>
                        {#each roomOptions as option (option.key)}
                            <button
                                type="button"
                                class="relative cursor-pointer bg-gray-900 border border-amber-400/40 shadow hover:shadow-lg transition-all duration-200 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                disabled={!availability.hasRoomAvailable || 
                                (!availability.hasLargeRoomAvailable && 
                                (selectedHotel === 'HotelOptionThree' || selectedHotel === 'HotelOptionFour'))}

                                on:click={() => selectedHotel = option.key}
                            >
                            <div class="card-content">
                                <CardComponent option={{
                                    cardLabel: option.label,
                                    description: option.description,
                                    price: option.price,
                                    image: option.key === 'HotelOptionFour' ? fourOne :
                                        option.key === 'HotelOptionThree' ? triple :
                                        option.key === 'HotelOptionTwo' ? connectingRoom :
                                        doublebeds
                                }}/>
                            </div>

                            {#if (!availability.hasRoomAvailable) || (!availability.hasLargeRoomAvailable && (option.key === 'HotelOptionThree' || option.key === 'HotelOptionFour'))}
                                <div class="sold-out-overlay">
                                    <span class="sold-out-text">Sold Out</span>
                                </div>
                            {/if}
                            </button>
                        {/each}
                    </div>
                {/key}
            {:else}
                {#key selectedHotel}
                    {#each roomOptions.filter(opt => opt.key === selectedHotel) as option}
                        <div class="relative bg-gray-900 border-2 border-amber-400 rounded-lg p-6 shadow-lg"
                            transition:scale={{ duration: 400, start: 0.8 }}>
                        <!-- X button to deselect -->
                        <button
                            type="button"
                            class="absolute top-2 right-2 text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-gray-800 transition"
                            aria-label="Deselect room"
                            on:click={() => {
                                selectedHotel = '';
                                // Clear roommate fields when deselecting
                                twinRoomMate = '';
                                tripleRoomMate1 = '';
                                tripleRoomMate2 = '';
                                quatroRoomMate1 = '';
                                quatroRoomMate2 = '';
                                quatroRoomMate3 = '';
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="11" stroke="currentColor" fill="none"/>
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8 8l8 8M16 8l-8 8" />
                            </svg>
                        </button>
                        <div class="text-lg font-bold text-amber-400 mb-2">{option.label}</div>
                        <div class="text-gray-200 mb-2">{option.description}</div>
                        <div class="text-amber-300 font-semibold mb-4">{formatPrice(option.price)}</div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    </div>
                        <!-- Roommate fields inside the card -->
                        {#if selectedHotel === 'HotelOptionOne'}
                            <div
                                class="absolute inset-0 rounded-lg overflow-hidden z-0"
                                style="pointer-events: none;"
                            >
                            </div>
                            <div class="relative z-10">
                                <div class="mb-4">
                                    <ul class="text-xs text-gray-400 list-disc list-inside mb-2">
                                        {#each option.features as feature}
                                            <li>{feature}</li>
                                        {/each}
                                    </ul>
                                </div>
                                
                                <!-- Carousel -->
                                <div class="mb-4">
                                    <ImageCarousel images={singleImages} altText="Single Room"/>
                                </div>
                            </div>
                        {/if}
                        {#if selectedHotel === 'HotelOptionTwo'}
                            <div
                                class="absolute inset-0 rounded-lg overflow-hidden z-0"
                                style="pointer-events: none;"
                            >
                            </div>
                            <div class="relative z-10">
                                <div class="mb-4">
                                    <p class="text-white text-base font-medium mb-2">
                                        Relax in peaceful surroundings in one of our standard rooms. This is a great place to retreat after an active day.
                                    </p>
                                    <ul class="text-white text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mb-2 list-disc list-inside">
                                        <li>Bathroom with shower</li>
                                        <li>Bathroom with shower or bathtub</li>
                                        <li>Table</li>
                                        <li>Wooden floor</li>
                                        <li>Bathroom with bathtub (available in some rooms)</li>
                                        <li>Bathroom with shower and bathtub (available in some rooms)</li>
                                        <li>Blackout curtains (available in some rooms)</li>
                                        <li>Chair/chairs</li>
                                        <li>Easy access</li>
                                        <li>Free WiFi</li>
                                        <li>Non-smoking</li>
                                        <li>Bathroom amenities</li>
                                        <li>Connecting rooms (available in some rooms)</li>
                                        <li>Sofa bed (available in some rooms)</li>
                                        <li>Adjustable beds (available in some rooms)</li>
                                        <li>Bunk bed (available in some rooms)</li>
                                        <li>Iron and ironing board</li>
                                        <li>Desk and chair</li>
                                        <li>Hair dryer</li>
                                    </ul>
                                </div>
                                
                                <!-- Carousel -->
                                <div class="mb-4">
                                    <ImageCarousel images={singleImages} altText="Quatro Room"/>
                                </div>
                            </div>
                            <div class="mt-2">
                                <label for="twinRoomMate" class="block text-sm font-medium">Name of your roommate *</label>
                                <input required type="text" id="twinRoomMate" name="Roommate1"
                                    bind:value={twinRoomMate}
                                    placeholder="Roommate name"
                                    class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
                            </div>
                        {/if}
                        {#if selectedHotel === 'HotelOptionThree'}
                            <div
                                class="absolute inset-0 rounded-lg overflow-hidden z-0"
                                style="pointer-events: none;"
                            >
                            </div>
                            <div class="relative z-10">
                                <div class="mb-4">
                                    <p class="text-white text-base font-medium mb-2">
                                        Relax in peaceful surroundings in one of our standard rooms. This is a great place to retreat after an active day.
                                    </p>
                                    <ul class="text-white text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mb-2 list-disc list-inside">
                                        <li>Bathroom with shower</li>
                                        <li>Bathroom with shower or bathtub</li>
                                        <li>Table</li>
                                        <li>Wooden floor</li>
                                        <li>Bathroom with bathtub (available in some rooms)</li>
                                        <li>Bathroom with shower and bathtub (available in some rooms)</li>
                                        <li>Blackout curtains (available in some rooms)</li>
                                        <li>Chair/chairs</li>
                                        <li>Easy access</li>
                                        <li>Free WiFi</li>
                                        <li>Non-smoking</li>
                                        <li>Bathroom amenities</li>
                                        <li>Connecting rooms (available in some rooms)</li>
                                        <li>Sofa bed (available in some rooms)</li>
                                        <li>Adjustable beds (available in some rooms)</li>
                                        <li>Bunk bed (available in some rooms)</li>
                                        <li>Iron and ironing board</li>
                                        <li>Desk and chair</li>
                                        <li>Hair dryer</li>
                                    </ul>
                                </div>
                                
                                <!-- Carousel -->
                                <div class="mb-4">
                                    <ImageCarousel images={tripleImages} altText="Quatro Room"/>
                                </div>
                            </div>
                            <fieldset class="mt-2 p-2 border border-gray-600 rounded-md space-y-2">
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
                            <div
                                class="absolute inset-0 rounded-lg overflow-hidden z-0"
                                style="pointer-events: none;"
                            >
                            </div>
                            <div class="relative z-10">
                                <div class="mb-4">
                                    <p class="text-white text-base font-medium mb-2">
                                        Staying with the family? In our family rooms, there is plenty of space and a pleasant atmosphere for both young and old.
                                    </p>
                                    <ul class="text-white text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mb-2 list-disc list-inside">
                                        <li>Free WiFi</li>
                                        <li>Bathroom with shower</li>
                                        <li>Bathroom amenities</li>
                                        <li>Wooden floors</li>
                                        <li>Safe (available in some rooms)</li>
                                        <li>Refrigerator (available in some rooms)</li>
                                        <li>Table</li>
                                        <li>Chair(s)</li>
                                        <li>Non-smoking</li>
                                        <li>Upper floors</li>
                                        <li>Easy access</li>
                                        <li>Blackout curtains</li>
                                        <li>Bunk bed</li>
                                        <li>Iron and ironing board</li>
                                        <li>Desk and chair</li>
                                        <li>Hairdryer</li>
                                    </ul>
                                </div>
                                
                                <!-- Carousel -->
                                <div class="mb-4">
                                    <ImageCarousel images={quatroImages} altText="Quatro Room"/>
                                </div>
                                <fieldset class="mt-2 p-2 border border-gray-600 rounded-md space-y-2">
                                    <legend class="text-md font-medium text-white px-1">Names of your roommates *</legend>
                                    <input required type="text" id="tripleRoomMate1" name="Roommate1"
                                        bind:value={quatroRoomMate1}
                                        placeholder="Roommate 1 name"
                                        class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
                                    <input required type="text" id="tripleRoomMate2" name="Roommate2"
                                        bind:value={quatroRoomMate2}
                                        placeholder="Roommate 2 name"
                                        class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
                                    <input required type="text" id="tripleRoomMate2" name="Roommate2"
                                        bind:value={quatroRoomMate3}
                                        placeholder="Roommate 3 name"
                                        class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
                                </fieldset>
                            </div>
                        {/if}
                    </div>
                {/each}
            {/key}
        {/if}
        {#if selectedHotel}
            <HotelDatePicker
                {availableDates}
                bind:checkInDate
                bind:checkOutDate
                {selectDate}
                {isInRange}
            />
        {/if}

        <!-- Hotel Order Summary -->
        {#if selectedHotel}
            <HotelBookingSummary     
                {selectedHotel}
                {getHotelDisplayName}
                {numberOfNights}
                {calculatedHotelPrice}
                {HOTEL_PRICES}
                {personRoomIsRegisteredOn}
            />
        {/if}

        <input type="hidden" name="CalculatedHotelPrice" value={finalCalculatedHotelPrice} />
        <input type="hidden" name="NumberOfNights" value={selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo' ? numberOfNights : 0} />
        <input type="hidden" name="HotelOption" value={selectedHotel} />
        <input type="hidden" name="CheckInDate" value={checkInDate} />
        <input type="hidden" name="CheckOutDate" value={checkOutDate} />

        <p class="text-sm text-gray-400 mb-2 mt-4">
            <strong>Cancellation Policy:</strong>
        </p>
        <p class="text-sm text-gray-400 mb-2">
            You may cancel your entire reservation free of charge until June 27, 2025.
        </p>
        <p class="text-sm text-gray-400 mb-2">
            If you cancel between June 27th and August 27th you will have to pay 50% of the full price. Cancellation after August 27th, 2025 will have to paid in full.
        </p>        
        <p class="text-sm text-gray-400 mb-6">
            The list of guest names and room assignments must be submitted no later than September 15, 2025. After this date the guest list will be final.
        </p>
        <div>
            <button type="submit"
                    class="w-full mt-4 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
    input[type="text"], input[type="email"] {
        color: #1f2937; /* Tailwind gray-800 for dark text */
    }
    ::placeholder {
        color: #6b7280; /* Tailwind gray-500 */
    }

    .card-content {
        position: relative;
        transition: filter 0.3s ease;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    /* Ensure the button takes full width and height */
    button[type="button"] {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .sold-out-overlay {
        position: absolute;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        overflow: hidden;
    }

    .sold-out .card-content {
        filter: blur(4px);
    }

    .sold-out-text {
        color: white;
        font-size: 2rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        transform: rotate(-30deg);
        padding: 0.5rem 3rem;
    }
</style>