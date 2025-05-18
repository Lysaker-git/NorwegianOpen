<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from '../../../routes/register/$types';
    import { 
        YMIR_DEADLINE_STRING, 
        MIDGARD_DEADLINE_STRING,
        PARTY_PASS_PRICE,
        passOptionsByLevel,
        LEVEL_OPTIONS,
        HOTEL_PRICES,
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
    let selectedHotel: string = '';
    let finalHotel: string = '';
    let partner: boolean = false;
    let checkInDate: string = '';
    let checkOutDate: string = '';
    let addIntensive: boolean = false;
    
    // Reset pass option when level changes
    $: if (selectedLevel) {
        selectedPassOption = null;
    }
    
    const hotelMinDate= '2025-10-02';
    const hotelMaxDate = '2025-10-06';

    function handleHotelChange() {
        finalHotel = selectedHotel;
        console.log("Selected hotel:", selectedHotel);
        console.log("Final hotel:", finalHotel);
    }

    let numberOfNights: number = 0;
    let intensivePrice: number = 0

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
                default:
                    passPrice = 'Invalid Pass Option';
            }
        } else {
            passPrice = 'Select Pass Option';
            if (typeof basePrice !== 'number') passPrice = 'Select Region & Level first';
        }
        
        // 5. Calculate Number of Nights and Hotel Price
        if (checkInDate && checkOutDate && new Date(checkOutDate) > new Date(checkInDate)) {
            const start = new Date(checkInDate);
            const end = new Date(checkOutDate);
            // Calculate difference in time
            const timeDiff = end.getTime() - start.getTime();
            // Calculate difference in days
            numberOfNights = Math.round(timeDiff / (1000 * 3600 * 24));
        } else {
            numberOfNights = 0;
        }

        let hotelNightlyRate = 0;
        if (selectedHotel && HOTEL_PRICES[selectedHotel] !== undefined) {
            hotelNightlyRate = HOTEL_PRICES[selectedHotel];
        }
        
        let calculatedHotelPrice = 0;
        if (hotelNightlyRate > 0 && numberOfNights > 0 && selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo') {
            calculatedHotelPrice = hotelNightlyRate * numberOfNights;
        } else {
            // If dates not selected, or hotel is 'None'/'No', hotel price is 0
            // Reset numberOfNights if it's not a valid booking scenario for price calculation
            if (!(selectedHotel && selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo')) {
                numberOfNights = 0; 
            }
        }
        
            // NEW 5.5. Calculate Intensive Price
            intensivePrice = addIntensive ? INTENSIVE : 0;

        // 6. Calculate final total price (pass + hotel)
        if (typeof passPrice === 'number') {
            finalPrice = passPrice + calculatedHotelPrice + intensivePrice;
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
    <form method="POST" action="?/register" use:enhance class="space-y-6">
        <!-- Email -->
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
    
                 <!-- Price Display -->
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
                        {#if selectedHotel && selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo' && numberOfNights > 0 && HOTEL_PRICES[selectedHotel]}
                            <p class="text-center text-sm text-gray-700">
                                + Hotel: {HOTEL_PRICES[selectedHotel]} NOK/night x {numberOfNights} night{numberOfNights > 1 ? 's' : ''} = 
                                <span class="font-semibold">{(HOTEL_PRICES[selectedHotel] * numberOfNights).toLocaleString('en-US')} NOK</span>
                            </p>
                        {/if}
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
                    Add Intensive Workshop with Joel and Chantelle (+{INTENSIVE.toLocaleString('en-US')} NOK)
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
            <label for="hasPartner" class="ml-2 block text-sm text-white"> I am registreing with a partner </label>
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

        <div class="">
            <label for="hotel" class="block text-sm font-medium text-white">Will you book your hotel with us? (Prices per night)</label>
            <select 
                bind:value={selectedHotel} 
                on:change={handleHotelChange} 
                id="hotel" 
                name="Hotel" 
                required
                class="mt-1 block w-full px-3 py-2 border text-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                <option class="text-black" value="" selected>Select Hotel Option</option>
                <option class="text-black" value="None">Will stay with someone else</option>
                <option class="text-black" value="HotelOptionOne">Single Room (1290 NOK)</option>
                <option class="text-black" value="HotelOptionTwo">Twin Room (1490 NOK)</option>
                <option class="text-black" value="HotelOptionThree">Tripple Room (1690 NOK)</option>
                <option class="text-black" value="HotelOptionFour">Quatro Room (1890 NOK)</option>
                <option class="text-black" value="HotelOptionNo">No</option>
            </select>
            {#if form?.field === 'Hotel'}
                <p class="text-red-600 text-sm mt-1">{form.error}</p>
            {/if}
        </div>

        {#if selectedHotel && selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo'}
            <div class="mt-4 p-4 border border-gray600 rounded-md space-y-4">
                <h4 class="text-md font-medium text-white mb-2">Select dates:</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="checkInDate" class="block text-sm font-medium text-white">Check-In Date *</label>
                        <input type="date" id="checkInDate" name="CheckInDate"
                               bind:value={checkInDate}
                               min={hotelMinDate}
                               max={hotelMaxDate}
                               required
                               on:change={() => {
                                   // Optional: Ensure checkout is not before check-in
                                   if (checkOutDate && checkInDate > checkOutDate) {
                                       checkOutDate = checkInDate;
                                   }
                               }}
                               class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                               aria-invalid={form?.field === 'CheckInDate'} />
                        {#if form?.field === 'CheckInDate'}
                            <p class="text-red-600 text-sm mt-1">{form.error}</p>
                        {/if}
                    </div>
                    <div>
                        <label for="checkOutDate" class="block text-sm font-medium text-white">Check-out Date *</label>
                        <input type="date" id="checkOutDate" name="CheckOutDate"
                               bind:value={checkOutDate}
                               min={checkInDate || hotelMinDate} 
                               max={hotelMaxDate}
                               required
                               class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                               aria-invalid={form?.field === 'CheckOutDate'} />
                        {#if form?.field === 'CheckOutDate'}
                            <p class="text-red-600 text-sm mt-1">{form.error}</p>
                        {/if}
                    </div>
                </div>
                 <p class="text-xs text-gray-400 mt-1">
                    Hotel stays are available between Thursday, October 2nd, 2025 and Monday, October 6th, 2025.
                </p>
            </div>
        {/if}
    
        <!-- Only show this section if selectedHotel is not 'HotelOptionOne' or empty -->
        {#if selectedHotel !== '' && selectedHotel !== 'HotelOptionOne' && selectedHotel !== 'HotelOptionNo'}
            <div class="mt-4">
                <label for="choice" class="block text-sm font-medium text-white">{#if selectedHotel === 'None'}Name of the person the room is registered on * {:else} Who will stay in your room? *{/if}</label>
                
                {#if selectedHotel === 'HotelOptionTwo' || selectedHotel === 'None'}
                    <input required type="text" id="twinRoom" name="twinRoom" placeholder="Roommate name" class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                {:else if selectedHotel === 'HotelOptionThree'}
                    <div class="space-y-2">
                        <input required type="text" id="tripleRoomOne" name="tripleRoomOne" placeholder="Roommate 1 name" class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        <input required type="text" id="tripleRoomTwo" name="tripleRoomTwo" placeholder="Roommate 2 name" class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                {:else if selectedHotel === 'HotelOptionFour'}
                    <div class="space-y-2">
                        <input required type="text" id="quatroOne" name="quatroOne" placeholder="Roommate 1 name" class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        <input required type="text" id="quatroTwo" name="quatroTwo" placeholder="Roommate 2 name" class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        <input required type="text" id="quatroThree" name="quatroThree" placeholder="Roommate 3 name" class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                {/if}
                
                {#if form?.field === 'Roommates'}
                    <p class="text-red-600 text-sm mt-1">{form.error}</p>
                {/if}
            </div>
        {/if}
    
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
    
        <!-- Update the Price Display section with breakdown -->
        <!-- {#if selectedPassOption}
            <div class="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                <div class="text-center text-gray-800">
                    Pass Price ({currentTier} {selectedPassOption.includes('Party') ? '' : 'Tier'}):
                    <span class="font-bold text-indigo-700">
                        {typeof passPrice === 'number' ? passPrice.toLocaleString('en-US') + ' NOK' : passPrice}
                    </span>
                    {#if selectedPassOption.includes('Discount')}
                        <span class="text-xs block text-gray-600">(Base Price: {basePrice} NOK, 20% off applied)</span>
                    {:else if selectedPassOption.includes('Free')}
                        <span class="text-xs block text-gray-600">(Base Price: {basePrice} NOK, Free for Judging)</span>
                    {/if}
                    
                    {#if selectedHotel && selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo'}
                        <div class="mt-2 pt-2 border-t border-gray-200">
                            <span class="text-gray-800">
                                Hotel: <span class="font-semibold">
                                    {HOTEL_PRICES[selectedHotel].toLocaleString('en-US')} NOK
                                </span>
                                <span class="text-xs block text-gray-600">
                                    {#if selectedHotel === 'HotelOptionOne'}
                                        Single Room
                                    {:else if selectedHotel === 'HotelOptionTwo'}
                                        Twin Room 
                                    {:else if selectedHotel === 'HotelOptionThree'}
                                        Triple Room
                                    {:else if selectedHotel === 'HotelOptionFour'}
                                        Quatro Room
                                    {/if}
                                </span>
                            </span>
                        </div>
                    {/if}
                    
                    <div class="mt-2 pt-2 border-t border-gray-200 font-bold text-lg text-indigo-700">
                        Total: {typeof finalPrice === 'number' ? finalPrice.toLocaleString('en-US') + ' NOK' : finalPrice}
                    </div>
                </div>
            </div>
        {/if} -->
    <!-- Submit Button -->
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

                <!-- Hotel Details (Conditional) -->
                {#if selectedHotel && selectedHotel !== 'None' && selectedHotel !== 'HotelOptionNo' && HOTEL_PRICES[selectedHotel] !== undefined && numberOfNights > 0}
                    <div class="flex justify-between items-center py-1">
                        <span class="text-gray-700">
                            {#if selectedHotel === 'HotelOptionOne'}Single Room
                            {:else if selectedHotel === 'HotelOptionTwo'}Twin Room
                            {:else if selectedHotel === 'HotelOptionThree'}Triple Room
                            {:else if selectedHotel === 'HotelOptionFour'}Quatro Room
                            {/if}
                            (Hotel - {numberOfNights} night{numberOfNights > 1 ? 's' : ''})
                        </span>
                        <span class="font-medium">
                            {(HOTEL_PRICES[selectedHotel] * numberOfNights).toLocaleString('en-US')} NOK 
                            <span class="text-xs text-gray-500">({HOTEL_PRICES[selectedHotel]}/night)</span>
                        </span>
                    </div>
                {/if}
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
        <button type="submit"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={!selectedPassOption || typeof finalPrice !== 'number'} >
            {#if typeof finalPrice !== 'number'}
                Complete Selections Above
            {:else}
                Register (Total: {finalPrice.toLocaleString('en-US')} NOK)
            {/if}
        </button>
    </div>
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