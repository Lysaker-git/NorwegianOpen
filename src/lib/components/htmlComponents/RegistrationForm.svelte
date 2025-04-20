<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from '../../../routes/register/$types';
    import { 
        YMIR_DEADLINE_STRING, 
        MIDGARD_DEADLINE_STRING,
        PARTY_PASS_PRICE,
        passOptionsByLevel,
        LEVEL_OPTIONS
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
    let finalPrice: number | string = 'Select Region, Level, and Pass Option';
    let calculatedAmountDue: number | null = null;
    
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
        
        // 4. Calculate Final Price
        if (typeof basePrice === 'number' && selectedPassOption) {
            switch (selectedPassOption) {
                case 'Regular Pass':
                    finalPrice = basePrice;
                    break;
                case 'Judge (Free Pass)':
                    finalPrice = 0;
                    break;
                case 'Judge (20% Discount)':
                    finalPrice = Math.round(basePrice * 0.80);
                    break;
                case 'Party Pass':
                    finalPrice = PARTY_PASS_PRICE;
                    break;
                default:
                    finalPrice = 'Invalid Pass Option';
            }
        } else {
            finalPrice = 'Select Pass Option';
            if (typeof basePrice !== 'number') finalPrice = 'Select Region & Level first';
        }
        
        // 5. Set amount due
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

<form method="POST" action="?/register" use:enhance class="space-y-6">
    <!-- Email -->
    <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
        <input type="email" id="email" name="Email" required
               class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
               aria-invalid={form?.field === 'Email'} />
        {#if form?.field === 'Email'} 
            <p class="text-red-600 text-sm mt-1">{form.error}</p> 
        {/if}
    </div>

    <!-- Full Name -->
    <div>
        <label for="fullname" class="block text-sm font-medium text-gray-700">Full Name *</label>
        <input type="text" id="fullname" name="FullName" required
               class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
               aria-invalid={form?.field === 'FullName'} />
        {#if form?.field === 'FullName'} 
            <p class="text-red-600 text-sm mt-1">{form.error}</p> 
        {/if}
    </div>

    <!-- WSDC ID -->
    <div>
        <label for="wsdcid" class="block text-sm font-medium text-gray-700">WSDC ID (Optional)</label>
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
            <legend class="text-base font-medium text-gray-900 px-2">2. Select Your Level *</legend>
            <p class="text-xs text-gray-500 mb-2">Based on your highest WSDC points role.</p>
            <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2">
                {#each LEVEL_OPTIONS as levelValue}
                    <button 
                        type="button"
                        id="level{levelValue}"
                        class="flex-grow py-2 px-3 border {selectedLevel === levelValue ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-gray-700 border-gray-300'} rounded-md text-sm font-medium transition-colors shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 montserrat-regular"
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
             <legend class="text-base font-medium text-gray-900 px-2">3. Choose Your Pass Option *</legend>
             <div class="mt-2 space-y-2">
                 {#each availablePassOptions as option (option)}
                     <div class="flex items-center gap-2">
                         <input type="radio" id="passOpt{option.replace(/[^a-zA-Z0-9]/g, '')}" 
                                name="PassOption" value={option} required
                                bind:group={selectedPassOption}
                                class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                         <label for="passOpt{option.replace(/[^a-zA-Z0-9]/g, '')}" 
                                class="text-sm font-medium text-gray-700">{option}</label>
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
                         Final Price ({currentTier} {selectedPassOption.includes('Party') ? '' : 'Tier'}):
                         <span class="font-bold text-lg text-indigo-700">
                             {typeof finalPrice === 'number' ? finalPrice.toLocaleString('en-US') + ' NOK' : finalPrice}
                         </span>
                         {#if selectedPassOption.includes('Discount')}
                             <span class="text-xs block text-gray-600">(Base Price: {basePrice} NOK, 20% off applied)</span>
                         {:else if selectedPassOption.includes('Free')}
                             <span class="text-xs block text-gray-600">(Base Price: {basePrice} NOK, Free for Judging)</span>
                         {/if}
                     </p>
                 </div>
             {/if}
        </fieldset>
    {/if}

    <!-- Role -->
    <div>
        <label for="role" class="block text-sm font-medium text-gray-700">Preferred Role *</label>
        <select id="role" name="Role" required
                class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="">Select Role</option>
            <option value="Leader">Leader</option>
            <option value="Follower">Follower</option>
        </select>
        {#if form?.field === 'Role'} 
            <p class="text-red-600 text-sm mt-1">{form.error}</p> 
        {/if}
    </div>

    <!-- Partner Name -->
    <div>
        <label for="partnerName" class="block text-sm font-medium text-gray-700">Partner Name</label>
        <input type="text" id="partnerName" name="PartnerName"
               class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
    </div>

    <!-- Country -->
    <div>
        <label for="country" class="block text-sm font-medium text-gray-700">Country *</label>
        <input type="text" id="country" name="Country" required
               class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
        {#if form?.field === 'Country'} 
            <p class="text-red-600 text-sm mt-1">{form.error}</p> 
        {/if}
    </div>

    <!-- Competing Checkbox -->
    <div class="flex items-center">
        <input id="competing" name="Competing" type="checkbox"
               class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
        <label for="competing" class="ml-2 block text-sm text-gray-900"> Are you planning to compete? </label>
    </div>

    <div class="">
        <label for="hotel" class="block text-sm font-medium text-gray-700">Will you book your hotel with us?</label>
        <select id="hotel" name="Hotel" required
                class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="">Select Hotel Option</option>
            <option value="None">Will stay with someone else / already booked</option>
            <option value="HotelOptionOne">Twin Room (1490 NOK)</option>
            <option value="HotelOptionTwo">Tripple Room (1690 NOK)</option>
            <option value="HotelOptionThree">Quatro Room (2140 NOK)</option>
        </select>
        {#if form?.field === 'Role'} 
            <p class="text-red-600 text-sm mt-1">{form.error}</p> 
        {/if}
    </div>

    <!-- Acceptance Checkboxes -->
    <div class="space-y-2">
        <div class="flex items-center">
            <input id="acceptedRules" name="AcceptedRules" type="checkbox" required 
                   class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
                   aria-invalid={form?.field === 'Terms'} />
            <label for="acceptedRules" class="ml-2 block text-sm text-gray-900"> 
                I have read and accept the Competition Rules *
            </label>
        </div>
        <div class="flex items-center">
            <input id="acceptedToC" name="AcceptedToC" type="checkbox" required 
                   class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
                   aria-invalid={form?.field === 'Terms'} />
            <label for="acceptedToC" class="ml-2 block text-sm text-gray-900"> 
                I have read and accept the Terms & Conditions / Code of Conduct *
            </label>
        </div>
        {#if form?.field === 'Terms'} 
            <p class="text-red-600 text-sm mt-1">{form.error}</p> 
        {/if}
    </div>

    <!-- Hidden input for AmountDue -->
    <input type="hidden" name="CalculatedAmountDue" value={calculatedAmountDue} />

    <!-- Submit Button -->
    <div>
        <button type="submit"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={!selectedPassOption || typeof finalPrice !== 'number'} >
            {#if typeof finalPrice !== 'number'}
                Complete Selections Above
            {:else}
                Register (Final Price: {finalPrice} NOK)
            {/if}
        </button>
    </div>
</form>

<style>
    span {
        font-family: 'Norse';
    }
</style>