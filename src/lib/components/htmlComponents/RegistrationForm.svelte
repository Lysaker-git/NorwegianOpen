<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from '../../../routes/register/$types'; // Adjust path if needed
    import {
        YMIR_DEADLINE_STRING,
        MIDGARD_DEADLINE_STRING,
        PARTY_PASS_PRICE,
        passOptionsByLevel,
        LEVEL_OPTIONS,
        // HOTEL_PRICES, // Removed
		ZERO_TO_HERO,
        INTENSIVE
    } from '$lib/components/constants';
    import {
        getCurrentTier,
        getLevelCategory,
        calculateBasePrice,
        type Region,
        type Level,
        type Tier
    } from '$lib/components/utils';
    import RegionSelection from '$lib/components/htmlComponents/RegistrationSelection.svelte';

    export let form: ActionData;

    // --- State Variables ---
    let selectedRegion: Region | null = null;
    let selectedLevel: Level | null = null;
    let selectedPassOption: string | null = null;

    let isLoading = false;

    // --- Define Pricing Tiers and Deadlines ---
    const ymirDeadline = new Date(YMIR_DEADLINE_STRING + 'T23:59:59');
    const midgardDeadline = new Date(MIDGARD_DEADLINE_STRING + 'T23:59:59');

    // --- Reactive Calculations ---
    let currentTier: Tier = getCurrentTier(new Date(), ymirDeadline, midgardDeadline);
    let basePrice: number | string = 'Select Region';
    let availablePassOptions: string[] = [];
    let passPrice: number | string;
    let finalPrice: number | string = 'Select Region, Level, and Pass Option';
    let calculatedAmountDue: number | null = null;
    // Removed hotel-related state: selectedHotel, finalHotel, checkInDate, checkOutDate, hotelMinDate, hotelMaxDate, handleHotelChange, numberOfNights

    let partner: boolean = false;
    let addIntensive: boolean = false;
    let intensivePrice: number = 0;


    // Reset pass option when level changes
    $: if (selectedLevel) {
        selectedPassOption = null;
    }

    $: {
        // 1. Determine Current Tier
        currentTier = getCurrentTier(new Date(), ymirDeadline, midgardDeadline);

        // 2. Determine Base Price
        basePrice = calculateBasePrice(currentTier, selectedRegion);

        // 3. Determine Available Pass Options
        const levelCategory = getLevelCategory(selectedLevel);
        availablePassOptions = levelCategory ? passOptionsByLevel[levelCategory] : [];

        // 4. Calculate Pass Price
        if (typeof basePrice === 'number' && selectedPassOption) {
            switch (selectedPassOption) {
                case 'Zero to Hero':
                    passPrice = ZERO_TO_HERO;
                    break;
                case 'Regular Pass':
                    passPrice = basePrice;
                    break;
                case 'Judge (Free Pass)':
                    passPrice = 0;
                    break;
                case 'Judge (20% Discount)':
                    passPrice = Math.round(basePrice * 0.80);
                    break;
                case 'Party Pass':
                    passPrice = PARTY_PASS_PRICE;
                    break;
                default:
                    passPrice = 'Invalid Pass Option';
            }
        } else {
            passPrice = 'Select Pass Option';
            if (typeof basePrice !== 'number') passPrice = 'Select Region & Level first';
        }

        // 5. Calculate Intensive Price
        intensivePrice = addIntensive ? INTENSIVE : 0;

        // 6. Calculate final total price (pass + intensive)
        if (typeof passPrice === 'number') {
            finalPrice = passPrice + intensivePrice;
        } else {
            finalPrice = passPrice; // Keep the message if passPrice is not a number
        }

        // 7. Set amount due
        calculatedAmountDue = (typeof finalPrice === 'number') ? finalPrice : null;
    }
</script>

<!-- Pricing Tier Notice -->
<div class="mb-6 text-center text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
    {#if currentTier === 'Ymir'}
        <p>❄️ Pricing Tier: <strong class="font-semibold text-yellow-800">Ymir (Early Bird)</strong>! (Ends {YMIR_DEADLINE_STRING})</p>
    {:else if currentTier === 'Midgard'}
        <p>🌍 Pricing Tier: <strong class="font-semibold text-yellow-800">Midgard (Regular)</strong> (Ends {MIDGARD_DEADLINE_STRING})</p>
    {:else if currentTier === 'Ragnarok'}
        <p>🔥 Pricing Tier: <strong class="font-semibold text-gray-800">Ragnarok (Late Bird)</strong></p>
    {/if}
</div>
<div class="text-white">
    <form
    method="POST"
    action="?/register"
    use:enhance={() => {
        isLoading = true; // Set loading true on submission start
        return async ({ result, update }) => {
            await update(); // Update `form` prop from server
            isLoading = false; // Set loading false when server responds
            // If successful, the page will redirect via server-side `throw redirect(...)`
            // so no client-side form clearing is strictly needed here.
            // If there's an error, the `form` prop will be updated,
            // and your UI will show form.error and form.field.
        };
    }}
    class="space-y-6"
    >
        <div>
            <label for="email" class="block text-sm font-medium text-white">Email *</label>
            <input type="email" id="email" name="Email" required
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   aria-invalid={form?.field === 'Email'} />
            {#if form?.field === 'Email'}
                <p class="text-red-600 text-sm mt-1">{form.error}</p>
            {/if}
        </div>

        <!-- Full Name -->
        <div>
            <label for="fullname" class="block text-sm font-medium text-white">Full Name *</label>
            <input type="text" id="fullname" name="FullName" required
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   aria-invalid={form?.field === 'FullName'} />
            {#if form?.field === 'FullName'}
                <p class="text-red-600 text-sm mt-1">{form.error}</p>
            {/if}
        </div>

        <!-- WSDC ID -->
        <div>
            <label for="wsdcid" class="block text-sm font-medium text-white">WSDC ID (Optional)</label>
            <input type="text" id="wsdcid" name="WSDCID"
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
        </div>

        <!-- 1. Region Selection -->
        <RegionSelection
            bind:selectedRegion={selectedRegion}
            formError={form?.field === 'Region' ? form.error : null}
        />

        <!-- 2. Level Selection (Conditional on Region) -->
        {#if selectedRegion}
            <fieldset class="border border-gray-300 p-4 rounded-md">
                <legend class="text-base font-medium text-white px-2">2. Select Your Level *</legend>
                <p class="text-xs text-gray-500 mb-2">Based on your highest WSDC points role.</p>
                <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                    {#each LEVEL_OPTIONS as levelValue}
                        <button
                            type="button"
                            id="level{levelValue}"
                            class="flex-grow py-2 px-3 border {selectedLevel === levelValue ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-black border-gray-300'} rounded-md text-sm font-medium transition-colors shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 montserrat-regular"
                            on:click={() => selectedLevel = levelValue}
                        >
                            {levelValue}
                        </button>
                    {/each}
                </div>

                <!-- Hidden radio inputs to maintain form submission behavior -->
                <div class="hidden">
                    {#each LEVEL_OPTIONS as levelValue}
                        <input type="radio" name="Level" value={levelValue} checked={selectedLevel === levelValue} required>
                    {/each}
                </div>

                {#if form?.field === 'Level'}
                    <p class="text-red-600 text-sm mt-1">{form.error}</p>
                {/if}
            </fieldset>
        {/if}

        <!-- 3. Pass Option Selection -->
        {#if selectedLevel && availablePassOptions.length > 0}
            <fieldset class="border border-gray-300 p-4 rounded-md">
                 <legend class="text-base font-medium text-white px-2">3. Choose Your Pass Option *</legend>
                 <div class="mt-2 space-y-2">
                     {#each availablePassOptions as option (option)}
                         <div class="flex items-center gap-2">
                             <input type="radio" id="passOpt{option.replace(/[^a-zA-Z0-9]/g, '')}"
                                    name="PassOption" value={option} required
                                    bind:group={selectedPassOption}
                                    class="focus:ring-indigo-500 h-4 w-4 text-white border-gray-300">
                             <label for="passOpt{option.replace(/[^a-zA-Z0-9]/g, '')}"
                                    class="text-sm font-medium text-white">{option}</label>
                         </div>
                     {/each}
                 </div>
                 {#if form?.field === 'PassOption'}
                    <p class="text-red-600 text-sm mt-1">{form.error}</p>
                 {/if}

                 <!-- Price Display (Hotel part removed) -->
                {#if selectedPassOption}
                    <div class="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                        <p class="text-center text-gray-800">
                            Pass: {selectedPassOption}
                            <span class="font-semibold">
                                {typeof passPrice === 'number' ? passPrice.toLocaleString('en-US') + ' NOK' : passPrice}
                            </span>
                        </p>
                        {#if addIntensive}
                            <p class="text-center text-sm text-gray-700">
                                + Intensive: <span class="font-semibold">{INTENSIVE.toLocaleString('en-US')} NOK</span>
                            </p>
                        {/if}
                        <!-- Hotel price display removed -->
                        <p class="text-center text-gray-800 font-semibold mt-2">
                            Total Estimate ({currentTier} Tier):
                            <span class="font-bold text-lg text-indigo-700">
                                {typeof finalPrice === 'number' ? finalPrice.toLocaleString('en-US') + ' NOK' : finalPrice}
                            </span>
                        </p>
                        {#if selectedPassOption.includes('Discount')}
                            <span class="text-xs block text-center text-gray-600">(Base Pass Price: {basePrice} NOK, 20% off applied)</span>
                        {:else if selectedPassOption.includes('Free')}
                            <span class="text-xs block text-center text-gray-600">(Base Pass Price: {basePrice} NOK, Free for Judging)</span>
                        {/if}
                    </div>
                {/if}
            </fieldset>
        {/if}

        <!-- Intensive Add-on Checkbox -->
        <div class="mt-4 p-4 border border-gray-300 rounded-md">
            <div class="flex items-center">
                <input id="addIntensive" name="AddIntensive" type="checkbox"
                        bind:checked={addIntensive}
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                <label for="addIntensive" class="ml-3 block text-sm font-medium text-white">
                    Add the Blues Intensive with Joel and Chantelle (+{INTENSIVE.toLocaleString('en-US')} NOK)
                </label>
            </div>
            {#if form?.field === 'AddIntensive'}
                <p class="text-red-600 text-sm mt-1">{form.error}</p>
            {/if}
        </div>

        <!-- Role -->
        <div>
            <label for="role" class="block text-sm font-medium text-white">Your Role *</label>
            <select id="role" name="Role" required
                    class="mt-1 block w-full px-3 py-2 border text-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Select Role</option>
                <option value="Leader">Leader</option>
                <option value="Follower">Follower</option>
            </select>
            {#if form?.field === 'Role'}
                <p class="text-red-600 text-sm mt-1">{form.error}</p>
            {/if}
        </div>

        <!-- Country -->
        <div>
            <label for="country" class="block text-sm font-medium text-white">Country *</label>
            <input type="text" id="country" name="Country" required
                   class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            {#if form?.field === 'Country'}
                <p class="text-red-600 text-sm mt-1">{form.error}</p>
            {/if}
        </div>

        <!-- Promo -->
        <div>
            <label for="promo" class="block text-sm font-medium text-white">Promo Code</label>
            <input type="text" id="promo" name="Promo" class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            {#if form?.field === 'Promo'}
                <p class="text-red-600 text-sm mt-1">{form.error}</p>
            {/if}
        </div>

        <!-- Competing Checkbox -->
        <div class="flex items-center">
            <input id="competing" name="Competing" type="checkbox"
                   class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="competing" class="ml-2 block text-sm text-white"> I am planning on competing </label>
        </div>


        <!-- Registering with a Partner Checkbox -->
        <div class="flex items-center mt-4">
            <input id="hasPartner" name="HasPartner" type="checkbox"
                   bind:checked={partner}
                   class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="hasPartner" class="ml-2 block text-sm text-white"> I am registering with a partner </label>
        </div>

        <!-- Conditional Partner Details -->
        {#if partner}
            <div class="mt-1 space-y-4 p-4 border border-gray-600 rounded-md">
                <div>
                    <label for="partnerName" class="block text-sm font-medium text-white">Partner's Full Name *</label>
                    <input type="text" id="partnerName" name="PartnerName" required
                           class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                           aria-invalid={form?.field === 'PartnerName'} />
                    {#if form?.field === 'PartnerName'}
                        <p class="text-red-600 text-sm mt-1">{form.error}</p>
                    {/if}
                </div>
                <div>
                    <label for="partnerEmail" class="block text-sm font-medium text-white">Partner's Email *</label>
                    <input type="email" id="partnerEmail" name="PartnerEmail" required
                           class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                           aria-invalid={form?.field === 'PartnerEmail'} />
                    {#if form?.field === 'PartnerEmail'}
                        <p class="text-red-600 text-sm mt-1">{form.error}</p>
                    {/if}
                </div>
            </div>
        {/if}

        <!-- Hotel selection, dates, and roommate sections REMOVED -->

        <!-- Acceptance Checkboxes -->
        <div class="space-y-2">
            <div class="flex items-center">
                <input id="acceptedRules" name="AcceptedRules" type="checkbox" required
                       class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                       aria-invalid={form?.field === 'Terms'} />
                <label for="acceptedRules" class="ml-2 block text-sm text-white">
                    I have read and accept the Competition Rules *
                </label>
            </div>
            <div class="flex items-center">
                <input id="acceptedToC" name="AcceptedToC" type="checkbox" required
                       class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                       aria-invalid={form?.field === 'Terms'} />
                <label for="acceptedToC" class="ml-2 block text-sm text-white">
                    I have read and accept the Terms & Conditions / Code of Conduct *
                </label>
            </div>
            {#if form?.field === 'Terms'}
                <p class="text-red-600 text-sm mt-1">{form.error}</p>
            {/if}
        </div>

        <!-- Hidden input for AmountDue -->
        <input type="hidden" name="CalculatedAmountDue" value={calculatedAmountDue} />

        <!-- Order Summary (Hotel part removed) -->
        {#if typeof finalPrice === 'number' && selectedPassOption}
            <div class="my-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50 text-gray-800 shadow-md">
                <h3 class="text-lg font-semibold mb-3 text-center text-indigo-700">Order Summary</h3>

                <div class="space-y-1">
                    <!-- Pass Details -->
                    <div class="flex justify-between items-center py-1">
                        <span class="text-gray-700">{selectedPassOption}</span>
                        <span class="font-medium">
                            {typeof passPrice === 'number' ? passPrice.toLocaleString('en-US') + ' NOK' : 'N/A'}
                        </span>
                    </div>

                    <!-- Intensive Details (Conditional) -->
                    {#if addIntensive}
                        <div class="flex justify-between items-center py-1">
                            <span class="text-gray-700">Intensive Workshop</span>
                            <span class="font-medium">
                                {INTENSIVE.toLocaleString('en-US')} NOK
                            </span>
                        </div>
                    {/if}

                    <!-- Hotel Details (Conditional) REMOVED -->
                </div>

                <hr class="my-3 border-indigo-300">

                <!-- Total Price -->
                <div class="flex justify-between items-center text-lg">
                    <span class="font-bold text-gray-800">Total Price</span>
                    <span class="font-bold text-indigo-700">
                        {finalPrice.toLocaleString('en-US')} NOK
                    </span>
                </div>

                <!-- Optional: Contextual pricing info -->
                <div class="text-xs text-center text-indigo-600 mt-2">
                    {#if !selectedPassOption.includes('Party')}
                        (Pricing Tier: {currentTier})
                    {/if}
                    {#if selectedPassOption.includes('Discount')}
                        (Base: {typeof basePrice === 'number' ? basePrice.toLocaleString('en-US') : basePrice} NOK, 20% off)
                    {:else if selectedPassOption.includes('Free')}
                        (Base: {typeof basePrice === 'number' ? basePrice.toLocaleString('en-US') : basePrice} NOK, Free for Judging)
                    {/if}
                </div>
            </div>
        {/if}
      
        <div>
            <button
                type="submit"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50"
                disabled={!selectedPassOption || typeof finalPrice !== 'number' || isLoading}
            >
                {#if isLoading}
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                {:else if typeof finalPrice !== 'number'}
                    Complete Selections Above
                {:else}
                    Register (Total: {finalPrice.toLocaleString('en-US')} NOK)
                {/if}
            </button>
        </div>
        <p class="mt-6 text-center text-sm text-gray-400">
            Once your registration is approved, you will receive a link to book your hotel room.
        </p>        
    </form>
</div>

<style>
    span {
        font-family: 'Norse';
    }
    input {
        color: black;
    }
</style>