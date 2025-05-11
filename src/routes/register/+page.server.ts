// src/routes/+page.server.ts (adjust path)

import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

// --- Define Deadlines, Base Prices, Pass Options, Party Price SERVER-SIDE ---
// MUST MATCH THE CLIENT SIDE
const YMIR_DEADLINE_STRING_SERVER = '2025-05-31'; // End of Early Bird - SET YOUR DATE
const MIDGARD_DEADLINE_STRING_SERVER = '2025-07-31'; // End of Regular - SET YOUR DATE

const ymirDeadlineServer = new Date(YMIR_DEADLINE_STRING_SERVER + 'T23:59:59');
const midgardDeadlineServer = new Date(MIDGARD_DEADLINE_STRING_SERVER + 'T23:59:59');

const serverBasePrices = {
    Ymir: { Nordic: 1800, World: 1500 },
    Midgard: { Nordic: 2000, World: 1700 },
    Ragnarok: { Nordic: 2200, World: 1900 }
};

const serverPassOptionsByLevel = {
    'All-Star': ['Regular Pass', 'Judge (Free Pass)', 'Party Pass'],
    'Advanced': ['Regular Pass', 'Judge (20% Discount)', 'Party Pass'],
    'Other': ['Regular Pass', 'Party Pass'] // For Intermediate/Novice/Newcomer
};

const SERVER_PARTY_PASS_PRICE = 1300; // Set your party pass price


// --- Helper Functions Server-Side ---

function getCurrentTierServer(): 'Ymir' | 'Midgard' | 'Ragnarok' {
    const todayServer = new Date();
	if (todayServer <= ymirDeadlineServer) return 'Ymir';
	if (todayServer <= midgardDeadlineServer) return 'Midgard';
	return 'Ragnarok';
}

function getBasePriceServer(tier: 'Ymir' | 'Midgard' | 'Ragnarok', region: 'Nordic' | 'World'): number | null {
    const tierPrices = serverBasePrices[tier];
    return tierPrices ? tierPrices[region] : null;
}

function getLevelCategoryServer(level: string | null): 'All-Star' | 'Advanced' | 'Other' | null {
    if (!level) return null;
    if (level === 'All-Star') return 'All-Star';
    if (level === 'Advanced') return 'Advanced';
    if (['Intermediate', 'Novice', 'Newcomer'].includes(level)) return 'Other';
    return null;
}

function isValidPassOptionForLevel(level: string | null, passOption: string | null): boolean {
     if (!level || !passOption) return false;
     const category = getLevelCategoryServer(level);
     if (!category) return false;
     const validOptions = serverPassOptionsByLevel[category];
     return validOptions.includes(passOption);
}

function calculateFinalAmountDueServer(basePrice: number, level: string | null, passOption: string | null): number | null {
    if (passOption === null || level === null) return null; // Need these

    switch (passOption) {
        case 'Regular Pass':
            return basePrice;
        case 'Judge (Free Pass)':
             // Add extra check - only All-Stars should have this option
             return (getLevelCategoryServer(level) === 'All-Star') ? 0 : null;
        case 'Judge (20% Discount)':
             // Add extra check - only Advanced should have this option
            return (getLevelCategoryServer(level) === 'Advanced') ? Math.round(basePrice * 0.80) : null;
        case 'Party Pass':
            return SERVER_PARTY_PASS_PRICE;
        default:
            return null; // Invalid option
    }
}

function calculatePaymentDeadline(): string {
    // ... same calculation as before ...
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const day = String(futureDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// --- load function ---
export async function load() { return {}; }

// --- actions ---
export const actions: Actions = {
    mailList: async ({ request }) => {
        const formData = await request.formData();

        const email = formData.get('Email') as string | null;
        if (!email /* ... */ ) { return fail(400, { data: Object.fromEntries(formData), field: 'Email', error: '...', missing: true }); }

        const registrationData = {
            mail: email
        }

                // --- Insert into Supabase ---
		const { data, error: dbError } = await supabaseAdmin
        .from('mailList')
        .insert([registrationData])
        .select()
        .maybeSingle();

        // --- Handle Response ---
        if (dbError) {
            console.error("Supabase Admin Insert Error:", dbError);
            return fail(500, { data: Object.fromEntries(formData), error: `Database error: ${dbError.message}` });
        }

        return { success: true, insertedId: data?.id };

    },


	register: async ({ request }) => {
		const formData = await request.formData();

        // --- Get Data ---
        const email = formData.get('Email') as string | null;
        const fullName = formData.get('FullName') as string | null;
        const wsdcId = formData.get('WSDCID') as string | null;
        const level = formData.get('Level') as string | null
        const role = formData.get('Role') as string | null;
        const partnerName = formData.get('PartnerName') as string | null;
        const country = formData.get('Country') as string | null;
        const competing = formData.get('Competing') === 'on';
        const acceptedRules = formData.get('AcceptedRules') === 'on';
        const acceptedToC = formData.get('AcceptedToC') === 'on';
        const hotel = formData.get('Hotel') as string | null;


        // --- Server-Side Validation ---
        // (Include checks for region, level, role, country, terms etc.)
        if (!email /* ... */ ) { return fail(400, { data: Object.fromEntries(formData), field: 'Email', error: '...', missing: true }); }
        if (!fullName) { return fail(400, { data: Object.fromEntries(formData), field: 'FullName', error: '...', missing: true }); }
        // if (!region) { return fail(400, { data: Object.fromEntries(formData), field: 'Region', error: 'Region selection is required.', missing: true }); }
        if (!level) { return fail(400, { data: Object.fromEntries(formData), field: 'Level', error: 'Level selection is required.', missing: true }); }
        if (!passOption) { return fail(400, { data: Object.fromEntries(formData), field: 'PassOption', error: 'Pass Option selection is required.', missing: true }); }
        if (!role) { return fail(400, { data: Object.fromEntries(formData), field: 'Role', error: 'Role selection is required.', missing: true }); }
        if (!country) { return fail(400, { data: Object.fromEntries(formData), field: 'Country', error: 'Country is required.', missing: true }); }
        if (!acceptedRules || !acceptedToC) { return fail(400, { data: Object.fromEntries(formData), field: 'Terms', error: '...', missing: true }); }

        // *** CRITICAL: Validate Pass Option against Level ***
        if (!isValidPassOptionForLevel(level, passOption)) {
            return fail(400, { data: Object.fromEntries(formData), field: 'PassOption', error: `Selected pass option '${passOption}' is not valid for level '${level}'.` });
        }

        // --- Calculate Price and Deadline SERVER-SIDE ---
        const currentTierServer = getCurrentTierServer();
        const basePriceServer = getBasePriceServer(currentTierServer, region);

        if (basePriceServer === null) { // Should not happen if region validation passed
             return fail(500, { data: Object.fromEntries(formData), error: 'Could not determine base price.' });
        }

        const finalAmountDueServer = calculateFinalAmountDueServer(basePriceServer, level, passOption);

        if (finalAmountDueServer === null) { // Should not happen if validation passed
            return fail(500, { data: Object.fromEntries(formData), error: 'Could not calculate final price.' });
        }

        const paymentDeadlineString = calculatePaymentDeadline();


        // --- Prepare Data for Supabase ---
        const registrationData = {
            Email: email,
            FullName: fullName,
            WSDCID: wsdcId,
            // Passtype: passType, // Maybe store the final chosen passOption here?
            Role: role,
            PartnerName: partnerName,
            Country: country,
            Region: region,
            Level: level,
            PassOption: passOption, // Store the selected pass option
            Competing: competing,
            AcceptedRules: acceptedRules,
            AcceptedToC: acceptedToC,
            AmountDue: finalAmountDueServer, // USE FINAL SERVER CALCULATED PRICE
            PaymentDeadline: paymentDeadlineString,
            PriceTier: currentTierServer // Store the tier they registered in
        };

        // --- Insert into Supabase ---
		const { data, error: dbError } = await supabaseAdmin
			.from('RegistrationDB')
			.insert([registrationData])
			.select()
            .maybeSingle();

        // --- Handle Response ---
		if (dbError) {
            console.error("Supabase Admin Insert Error:", dbError);
            return fail(500, { data: Object.fromEntries(formData), error: `Database error: ${dbError.message}` });
		}

		return { success: true, insertedId: data?.id };
	}
};