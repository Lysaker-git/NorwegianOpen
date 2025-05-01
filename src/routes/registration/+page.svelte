<!-- src/routes/+page.svelte (Or relevant route) -->
<script lang="ts">
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';
    import { tick } from 'svelte'; // Import tick for resetting radio group
    import { onMount, onDestroy } from 'svelte';


	export let form: ActionData;

	// --- State Variables ---
	let selectedRegion: 'Nordic' | 'World' | null = null;
	let selectedLevel: 'All-Star' | 'Advanced' | 'Intermediate' | 'Novice' | 'Newcomer' | null = null;
    let selectedPassOption: string | null = null; // Will hold the chosen pass type (e.g., 'Regular Pass', 'Judge (Free)')

	// --- Define Pricing Tiers and Deadlines ---
    // (Use Norse names as requested)
	const YMIR_DEADLINE_STRING = '2025-05-31'; // End of Early Bird - SET YOUR DATE
	const MIDGARD_DEADLINE_STRING = '2025-07-31'; // End of Regular - SET YOUR DATE

    
	const ymirDeadline = new Date(YMIR_DEADLINE_STRING + 'T23:59:59');
	const midgardDeadline = new Date(MIDGARD_DEADLINE_STRING + 'T23:59:59');
    const REG_OPEN_STRING = '2025-05-01';
    const regOpenVar = new Date(REG_OPEN_STRING + 'T17:00:00');

    const TodaysDate = new Date();

    let timeRemaining = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    }

    let countdownInterval; 

    function calculateTimeRemaining() {
        const difference = regOpenVar - new Date();

        if (difference > 0) {
            timeRemaining = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
        } else {
            // Registration is open, clear interval
            if (countdownInterval) clearInterval(countdownInterval);
            timeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
    }

    // --- Base Price Structure (Based on Tier and Region ONLY) ---
	const basePrices = {
		Ymir: { Nordic: 1700, World: 1900 },      // Early Bird prices
		Midgard: { Nordic: 1900, World: 2100 },   // Regular prices
		Ragnarok: { Nordic: 2100, World: 2300 }   // Late Bird prices
	};

    // --- Define Pass Options by Level ---
    const passOptionsByLevel = {
        'All-Star': ['Regular Pass', 'Judge (Free Pass)', 'Party Pass'],
        'Advanced': ['Regular Pass', 'Judge (20% Discount)', 'Party Pass'],
        // Group Intermediate, Novice, Newcomer
        'Other': ['Regular Pass', 'Party Pass']
    };

    // --- Fixed Price for Party Pass (Example) ---
    const PARTY_PASS_PRICE = 1200; // Set your party pass price


	// --- Reactive Calculations ---
	let currentTier: 'Ymir' | 'Midgard' | 'Ragnarok' | null = null;
    let basePrice: number | string = 'Select Region';
    let availablePassOptions: string[] = [];
    let finalPrice: number | string = 'Select Region, Level, and Pass Option';
	let calculatedAmountDue: number | null = null;

    // Helper function to get level category
    function getLevelCategory(level: string | null): 'All-Star' | 'Advanced' | 'Other' | null {
        if (!level) return null;
        if (level === 'All-Star') return 'All-Star';
        if (level === 'Advanced') return 'Advanced';
        if (['Intermediate', 'Novice', 'Newcomer'].includes(level)) return 'Other';
        return null;
    }

    // Reset pass option when level changes
    $: if (selectedLevel) {
        selectedPassOption = null; // Reset when level changes to force re-selection
        // Use tick to ensure DOM updates before radio buttons might try to bind
        // tick().then(() => { selectedPassOption = null; });
    }


	$: {
		// 1. Determine Current Tier
		const today = new Date();
		if (today <= ymirDeadline) {
			currentTier = 'Ymir';
		} else if (today <= midgardDeadline) {
			currentTier = 'Midgard';
		} else {
			currentTier = 'Ragnarok';
		}

        // 2. Determine Base Price (depends on Tier and Region)
        if (currentTier && selectedRegion) {
             const tierPrices = basePrices[currentTier];
             basePrice = tierPrices ? tierPrices[selectedRegion] : 'Invalid Region';
        } else {
            basePrice = 'Select Region';
        }

        // 3. Determine Available Pass Options (depends on Level)
        const levelCategory = getLevelCategory(selectedLevel);
        availablePassOptions = levelCategory ? passOptionsByLevel[levelCategory] : [];

        // 4. Calculate Final Price (depends on Base Price and Selected Pass Option)
        if (typeof basePrice === 'number' && selectedPassOption) {
            switch (selectedPassOption) {
                case 'Regular Pass':
                    finalPrice = basePrice;
                    break;
                case 'Judge (Free Pass)':
                    finalPrice = 0;
                    break;
                case 'Judge (20% Discount)':
                    finalPrice = Math.round(basePrice * 0.80); // Apply 20% discount
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

        // 5. Set numeric amount due
        calculatedAmountDue = (typeof finalPrice === 'number') ? finalPrice : null;

	}

    onMount(() => {
        // Calculate initial time
        calculateTimeRemaining();
        
        // Update every second
        countdownInterval = setInterval(calculateTimeRemaining, 1000);
    });
    
    onDestroy(() => {
        // Clean up interval when component is destroyed
        if (countdownInterval) clearInterval(countdownInterval);
  });

</script>


<div class="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
	



    <!-- Success/Error Messages -->
	{#if form?.success}
        <!-- ... success message ... -->
	{/if}
	{#if form?.error && !form?.field}
        <!-- ... general error message ... -->
	{/if}

    {#if TodaysDate <= regOpenVar}
    <h1 class="text-4xl text-center">Registration not open yet</h1>
    <div class="countdown">
        <p>Registration opens in:</p>
        <div class="countdown-timer">
            <div class="time-section">
            <span class="time">{timeRemaining.days}</span>
            <span class="label">days</span>
            </div>
            <div class="time-section">
            <span class="time">{timeRemaining.hours}</span>
            <span class="label">hours</span>
            </div>
            <div class="time-section">
            <span class="time">{timeRemaining.minutes}</span>
            <span class="label">minutes</span>
            </div>
            <div class="time-section">
            <span class="time">{timeRemaining.seconds}</span>
            <span class="label">seconds</span>
            </div>
        </div>
    </div>
    {:else}

        <h1 class="text-2xl font-bold mb-6 text-center">Registration Form</h1>

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
            {#if form?.field === 'Email'} <p class="text-red-600 text-sm -mt-4 mb-2">{form.error}</p> {/if}
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
                <input type="email" id="email" name="Email" required
                       class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                       aria-invalid={form?.field === 'Email'} />
            </div>
    
            <!-- Full Name -->
            {#if form?.field === 'FullName'} <p class="text-red-600 text-sm -mt-4 mb-2">{form.error}</p> {/if}
            <div>
                <label for="fullname" class="block text-sm font-medium text-gray-700">Full Name *</label>
                <input type="text" id="fullname" name="FullName" required
                       class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                       aria-invalid={form?.field === 'FullName'} />
            </div>
    
            <!-- WSDC ID -->
            <div>
                <label for="wsdcid" class="block text-sm font-medium text-gray-700">WSDC ID (Optional)</label>
                <input type="text" id="wsdcid" name="WSDCID"
                       class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            </div>
            <!-- /* --- START SELECTION FLOW --- */ -->
    
            <!-- 1. Region Selection -->
            <fieldset class="border border-gray-300 p-4 rounded-md">
                <legend class="text-base font-medium text-gray-900 px-2">1. Select Your Region *</legend>
                 <div class="mt-2 flex flex-col sm:flex-row sm:gap-6 space-y-2 sm:space-y-0">
                     <div class="flex items-center gap-2">
                         <input type="radio" id="regionNordic" name="Region" value="Nordic" required bind:group={selectedRegion} class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                         <label for="regionNordic" class="text-sm font-medium text-gray-700">Nordic (SE, NO, DK, FI, IS)</label>
                     </div>
                     <div class="flex items-center gap-2">
                         <input type="radio" id="regionWorld" name="Region" value="World" required bind:group={selectedRegion} class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                         <label for="regionWorld" class="text-sm font-medium text-gray-700">Rest of World</label>
                     </div>
                 </div>
                 {#if form?.field === 'Region'} <p class="text-red-600 text-sm mt-1">{form.error}</p> {/if}
            </fieldset>
    
            <!-- 2. Level Selection (Conditional on Region) -->
            {#if selectedRegion}
                <fieldset class="border border-gray-300 p-4 rounded-md">
                    <legend class="text-base font-medium text-gray-900 px-2">2. Select Your Level *</legend>
                    <p class="text-xs text-gray-500 mb-2">Based on your highest WSDC points role.</p>
                    <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                        {#each ['All-Star', 'Advanced', 'Intermediate', 'Novice', 'Newcomer'] as levelValue}
                            <div class="flex items-center gap-2">
                                <input type="radio" id="level{levelValue}" name="Level" value={levelValue} required bind:group={selectedLevel} class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                                <label for="level{levelValue}" class="text-sm font-medium text-gray-700">{levelValue}</label>
                            </div>
                        {/each}
                    </div>
                     {#if form?.field === 'Level'} <p class="text-red-600 text-sm mt-1">{form.error}</p> {/if}
                </fieldset>
            {/if}
    
            <!-- 3. Pass Option Selection (Conditional on Level) -->
            {#if selectedLevel && availablePassOptions.length > 0}
                <fieldset class="border border-gray-300 p-4 rounded-md">
                     <legend class="text-base font-medium text-gray-900 px-2">3. Choose Your Pass Option *</legend>
                     <div class="mt-2 space-y-2">
                         {#each availablePassOptions as option (option)} <!-- Keying the loop helps Svelte manage updates -->
                             <div class="flex items-center gap-2">
                                 <input type="radio" id="passOpt{option.replace(/[^a-zA-Z0-9]/g, '')}" name="PassOption" value={option} required
                                        bind:group={selectedPassOption}
                                        class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                                 <label for="passOpt{option.replace(/[^a-zA-Z0-9]/g, '')}" class="text-sm font-medium text-gray-700">{option}</label>
                             </div>
                         {/each}
                     </div>
                     {#if form?.field === 'PassOption'} <p class="text-red-600 text-sm mt-1">{form.error}</p> {/if}
    
                     <!-- Price Display (Conditional on Pass Option) -->
                     {#if selectedPassOption}
                         <div class="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                             <p class="text-center text-gray-800">
                                 Final Price ({currentTier} {selectedPassOption.includes('Party') ? '' : 'Tier'}):
                                 <span class="font-bold text-lg text-indigo-700">
                                     {typeof finalPrice === 'number' ? finalPrice.toLocaleString('en-US') + ' [CURRENCY]' : finalPrice}
                                 </span>
                                 {#if selectedPassOption.includes('Discount')}
                                     <span class="text-xs block text-gray-600">(Base Price: {basePrice} [CURRENCY], 20% off applied)</span>
                                 {:else if selectedPassOption.includes('Free')}
                                     <span class="text-xs block text-gray-600">(Base Price: {basePrice} [CURRENCY], Free for Judging)</span>
                                 {/if}
                             </p>
                         </div>
                     {/if}
                </fieldset>
            {/if}
            <!-- /* --- END SELECTION FLOW --- */ -->
    
    
            <!-- Role -->
            <div>
                <label for="role" class="block text-sm font-medium text-gray-700">Preferred Role *</label>
                <select id="role" name="Role" required
                        class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select Role</option>
                    <option value="Leader">Leader</option>
                    <option value="Follower">Follower</option>
                </select>
                 {#if form?.field === 'Role'} <p class="text-red-600 text-sm mt-1">{form.error}</p> {/if}
            </div>
    
            <!-- Partner Name -->
            <div>
                <label for="partnerName" class="block text-sm font-medium text-gray-700">Partner Name (If applicable for Strictly/Couple Pass)</label>
                <input type="text" id="partnerName" name="PartnerName"
                       class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            </div>
    
            <!-- Country -->
            <div>
                <label for="country" class="block text-sm font-medium text-gray-700">Country *</label>
                <input type="text" id="country" name="Country" required
                       class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                 {#if form?.field === 'Country'} <p class="text-red-600 text-sm mt-1">{form.error}</p> {/if}
            </div>
    
            <!-- Competing Checkbox -->
            <div class="flex items-center">
                <input id="competing" name="Competing" type="checkbox"
                       class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                <label for="competing" class="ml-2 block text-sm text-gray-900"> Are you planning to compete? </label>
            </div>
    
            <!-- Payment Deadline (Server Calculated) -->
            <div>
                <label for="paymentDeadlineDisplay" class="block text-sm font-medium text-gray-700">Payment Deadline</label>
                <input type="date" id="paymentDeadlineDisplay" name="PaymentDeadlineDisplay" readonly
                       class="mt-1 block w-full px-3 py-2 border bg-gray-100 rounded-md shadow-sm sm:text-sm"/>
                <!-- Note: Real deadline calculated and saved server-side -->
            </div>
    
            <!-- Acceptance Checkboxes -->
            {#if form?.field === 'Terms'}
                 <p class="text-red-600 text-sm -mt-4 mb-2">{form.error}</p>
            {/if}
            <div class="space-y-2">
                 <!-- ... acceptedRules checkbox ... -->
                 <div class="flex items-center">
                    <input id="acceptedRules" name="AcceptedRules" type="checkbox" required class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" aria-invalid={form?.field === 'Terms'} />
                    <label for="acceptedRules" class="ml-2 block text-sm text-gray-900"> I have read and accept the Competition Rules *</label>
                 </div>
                 <!-- ... acceptedToC checkbox ... -->
                  <div class="flex items-center">
                    <input id="acceptedToC" name="AcceptedToC" type="checkbox" required class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" aria-invalid={form?.field === 'Terms'} />
                    <label for="acceptedToC" class="ml-2 block text-sm text-gray-900"> I have read and accept the Terms & Conditions / Code of Conduct *</label>
                 </div>
            </div>
    
            <!-- Hidden input for AmountDue -->
            <input type="hidden" name="CalculatedAmountDue" value={calculatedAmountDue} />
            <!-- Hidden input for PassOption -->
            <input type="hidden" name="PassOption" value={selectedPassOption} />
    
    
            <!-- Submit Button -->
            <div>
                <button type="submit"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        disabled={!selectedPassOption || typeof finalPrice !== 'number'} >
                            {#if typeof finalPrice !== 'number'}
                                Complete Selections Above
                            {:else}
                                Register (Final Price: {finalPrice} [CURRENCY])
                            {/if}
                </button>
            </div>
        </form>
    {/if}
</div>

<!-- Styles remain the same -->
<style global>
    h1 {
        font-family: 'NorseBold';
    }



    .countdown {
    margin-top: 1rem;
    text-align: center;
  }
  
  .countdown-timer {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 0.5rem;
  }
  
  .time-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .time {
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .label {
    font-size: 0.8rem;
    text-transform: uppercase;
  }

  span {
        font-family: 'Norse';
    }
</style>