// src/routes/register/+page.server.ts (or your actual path)

import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

// --- Define Deadlines, Base Prices, Pass Options, Hotel Prices SERVER-SIDE ---
// MUST MATCH THE CLIENT SIDE (or be the source of truth client fetches from)
const YMIR_DEADLINE_STRING_SERVER = '2025-05-31';
const MIDGARD_DEADLINE_STRING_SERVER = '2025-07-31';

const ymirDeadlineServer = new Date(YMIR_DEADLINE_STRING_SERVER + 'T23:59:59');
const midgardDeadlineServer = new Date(MIDGARD_DEADLINE_STRING_SERVER + 'T23:59:59');

const serverBasePrices = {
    Ymir: { Nordic: 1800, World: 1500 },
    Midgard: { Nordic: 2000, World: 1700 },
    Ragnarok: { Nordic: 2200, World: 1900 }
};

const serverPassOptionsByLevel = {
    'All-Star': ['Regular Pass', 'Judge (Free Pass)', 'Party Pass'], // Assuming Party Pass is not in your client-side options yet
    'Advanced': ['Regular Pass', 'Judge (20% Discount)', 'Party Pass'],
    'Other': ['Regular Pass', 'Party Pass', 'Zero to Hero']
};

// Add Party Pass Price if it's a standalone option
// const SERVER_PARTY_PASS_PRICE = 1300; // You have PARTY_PASS_PRICE in client constants
const SERVER_ZERO_TO_HERO = 1300; // Match client

// SERVER-SIDE HOTEL PRICES (per night) - Match client constants
const SERVER_HOTEL_PRICES: Record<string, number> = {
    HotelOptionOne: 1290,
    HotelOptionTwo: 1490,
    HotelOptionThree: 1690,
    HotelOptionFour: 1890,
};

const HOTEL_MIN_DATE_SERVER = '2025-10-02';
const HOTEL_MAX_DATE_SERVER = '2025-10-06';
const SERVER_INTENSIVE_PRICE = 1000;


// --- Helper Functions Server-Side ---

function getCurrentTierServer(): 'Ymir' | 'Midgard' | 'Ragnarok' {
    const todayServer = new Date();
    if (todayServer <= ymirDeadlineServer) return 'Ymir';
    if (todayServer <= midgardDeadlineServer) return 'Midgard';
    return 'Ragnarok';
}

function getBasePriceServer(tier: 'Ymir' | 'Midgard' | 'Ragnarok', region: 'Nordic' | 'World' | null): number | null {
    if (!region) return null;
    const tierPrices = serverBasePrices[tier];
    // Ensure region is a valid key for tierPrices
    if (tierPrices && (region === 'Nordic' || region === 'World')) {
        return tierPrices[region];
    }
    return null;
}


function getLevelCategoryServer(level: string | null): 'All-Star' | 'Advanced' | 'Other' | null {
    if (!level) return null;
    if (level === 'All-Star') return 'All-Star';
    if (level === 'Advanced') return 'Advanced';
    if (['Intermediate', 'Novice', 'Newcomer'].includes(level)) return 'Other';
    return null;
}

function isValidPassOptionForLevelServer(level: string | null, passOption: string | null): boolean {
    if (!level || !passOption) return false;
    const category = getLevelCategoryServer(level);
    if (!category) return false;

    // Handle cases where serverPassOptionsByLevel might not be perfectly synced or has extra options
    const validOptions = serverPassOptionsByLevel[category];
    if (!validOptions) return false; // Category not found in server options
    
    return validOptions.includes(passOption);
}


function calculatePassPriceServer(basePrice: number, level: string | null, passOption: string | null): number | null {
    if (passOption === null || level === null) return null;

    switch (passOption) {
        case 'Regular Pass':
            return basePrice;
        case 'Judge (Free Pass)':
            return (getLevelCategoryServer(level) === 'All-Star') ? 0 : null; // Invalid if not All-Star
        case 'Judge (20% Discount)':
            return (getLevelCategoryServer(level) === 'Advanced') ? Math.round(basePrice * 0.80) : null; // Invalid if not Advanced
        // case 'Party Pass': // If Party Pass is a direct option
        //     return SERVER_PARTY_PASS_PRICE; 
        case 'Zero to Hero':
            return SERVER_ZERO_TO_HERO;
        default:
            return null; // Invalid pass option
    }
}

function calculateHotelPriceServer(
    hotelOption: string | null,
    checkIn: string | null,
    checkOut: string | null
): { price: number; nights: number } {
    let price = 0;
    let nights = 0;

    if (hotelOption && hotelOption !== 'None' && hotelOption !== 'HotelOptionNo' &&
        SERVER_HOTEL_PRICES[hotelOption] !== undefined &&
        checkIn && checkOut) {

        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);

        // Validate dates are within allowed range and checkout is after checkin
        const minAllowedDate = new Date(HOTEL_MIN_DATE_SERVER);
        const maxAllowedDate = new Date(HOTEL_MAX_DATE_SERVER);

        if (startDate >= minAllowedDate && endDate <= maxAllowedDate && endDate > startDate) {
            const timeDiff = endDate.getTime() - startDate.getTime();
            nights = Math.round(timeDiff / (1000 * 3600 * 24));
            if (nights > 0) {
                price = SERVER_HOTEL_PRICES[hotelOption] * nights;
            } else {
                nights = 0; // Safety, should be caught by endDate > startDate
            }
        } else {
            // Dates are invalid (out of range or checkout not after checkin)
            // Consider returning an error or just 0 price/nights
            nights = 0;
            price = 0;
        }
    }
    return { price, nights };
}


function calculatePaymentDeadline(): string {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14); // 14 days from now
    return futureDate.toISOString().split('T')[0]; // YYYY-MM-DD format
}

function formDataToPOJO(formData: FormData) {
    const object: Record<string, any> = {};
    formData.forEach((value, key) => {
        // Handle multiple values for the same key (e.g., checkboxes) if necessary
        if (!object.hasOwnProperty(key)) {
            object[key] = value;
        } else {
            if (!Array.isArray(object[key])) {
                object[key] = [object[key]];
            }
            object[key].push(value);
        }
    });
    return object;
}


// --- load function ---
// export async function load() { return {}; } // Not needed for a form-only page usually

// --- actions ---
export const actions: Actions = {
    // mailList action seems fine, omitting for brevity unless changes are needed

    register: async ({ request }) => {
        const formData = await request.formData();
        const formValues = formDataToPOJO(formData); // Helper to pass back all values on error

        // --- Get Data ---
        const email = formData.get('Email') as string | null;
        const fullName = formData.get('FullName') as string | null;
        const wsdcId = formData.get('WSDCID') as string | null; // Optional
        const region = formData.get('Region') as 'Nordic' | 'World' | null; // Assuming these are the values
        const level = formData.get('Level') as string | null;
        const passOption = formData.get('PassOption') as string | null;
        const addIntensiveServer = formData.get('AddIntensive') === 'on';
        const role = formData.get('Role') as string | null;
        const country = formData.get('Country') as string | null;
        const promoCode = formData.get('Promo') as string | null; // Optional
        const competing = formData.get('Competing') === 'on'; // Checkbox

        const hasPartner = formData.get('HasPartner') === 'on'; // Checkbox
        const partnerName = formData.get('PartnerName') as string | null; // Conditional
        const partnerEmail = formData.get('PartnerEmail') as string | null; // Conditional

        const hotelOption = formData.get('Hotel') as string | null;
        const checkInDate = formData.get('CheckInDate') as string | null; // YYYY-MM-DD
        const checkOutDate = formData.get('CheckOutDate') as string | null; // YYYY-MM-DD

        const roommateTwin = formData.get('twinRoom') as string | null;
        const roommateTripleOne = formData.get('tripleRoomOne') as string | null;
        const roommateTripleTwo = formData.get('tripleRoomTwo') as string | null;
        const roommateQuatroOne = formData.get('quatroOne') as string | null;
        const roommateQuatroTwo = formData.get('quatroTwo') as string | null;
        const roommateQuatroThree = formData.get('quatroThree') as string | null;

        const acceptedRules = formData.get('AcceptedRules') === 'on';
        const acceptedToC = formData.get('AcceptedToC') === 'on';

        // --- Server-Side Validation ---
        const errors: Record<string, string> = {};
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.Email = 'A valid email is required.';
        if (!fullName || fullName.trim() === '') errors.FullName = 'Full name is required.';
        if (!region) errors.Region = 'Region selection is required.';
        if (!level) errors.Level = 'Level selection is required.';
        if (!passOption) errors.PassOption = 'Pass Option selection is required.';
        if (!role) errors.Role = 'Role selection is required.';
        if (!country || country.trim() === '') errors.Country = 'Country is required.';
        if (!acceptedRules || !acceptedToC) errors.Terms = 'You must accept the rules and terms.';
        if (!hotelOption) errors.Hotel = 'Please select a hotel option (or "No" / "Will stay with someone else").';


        if (hasPartner) {
            if (!partnerName || partnerName.trim() === '') errors.PartnerName = "Partner's name is required.";
            if (!partnerEmail || !/^\S+@\S+\.\S+$/.test(partnerEmail)) errors.PartnerEmail = "A valid partner's email is required.";
        }

        // Validate hotel dates if a bookable hotel option is selected
        let hotelNights = 0;
        if (hotelOption && hotelOption !== 'None' && hotelOption !== 'HotelOptionNo') {
            if (!checkInDate) errors.CheckInDate = 'Check-in date is required for hotel booking.';
            if (!checkOutDate) errors.CheckOutDate = 'Check-out date is required for hotel booking.';
            if (checkInDate && checkOutDate) {
                const startDate = new Date(checkInDate);
                const endDate = new Date(checkOutDate);
                const minD = new Date(HOTEL_MIN_DATE_SERVER);
                const maxD = new Date(HOTEL_MAX_DATE_SERVER);
                if (startDate < minD || startDate > maxD) errors.CheckInDate = 'Check-in date is outside the allowed range.';
                if (endDate < minD || endDate > maxD) errors.CheckOutDate = 'Check-out date is outside the allowed range.';
                if (endDate <= startDate) errors.CheckOutDate = 'Check-out date must be after check-in date.';
                if (Object.keys(errors).length === 0) { // Only calculate nights if dates are valid so far
                     const timeDiff = endDate.getTime() - startDate.getTime();
                     hotelNights = Math.round(timeDiff / (1000 * 3600 * 24));
                     if (hotelNights <= 0) {
                        errors.CheckOutDate = 'Invalid date range for hotel stay (must be at least 1 night).';
                        hotelNights = 0; // Reset if invalid
                     }
                }
            }
            // Validate roommate fields based on hotelOption
            if (hotelOption === 'HotelOptionTwo' && (!roommateTwin || roommateTwin.trim() === '')) {
                 errors.Roommates = "Roommate name is required for a Twin Room.";
            } else if (hotelOption === 'HotelOptionThree') {
                if ((!roommateTripleOne || roommateTripleOne.trim() === '') || (!roommateTripleTwo || roommateTripleTwo.trim() === '')) {
                    errors.Roommates = "Both roommate names are required for a Triple Room.";
                }
            } else if (hotelOption === 'HotelOptionFour') {
                 if ((!roommateQuatroOne || roommateQuatroOne.trim() === '') || 
                     (!roommateQuatroTwo || roommateQuatroTwo.trim() === '') || 
                     (!roommateQuatroThree || roommateQuatroThree.trim() === '')) {
                    errors.Roommates = "All three roommate names are required for a Quatro Room.";
                }
            }
        }
        if (hotelOption === 'None' && (!roommateTwin || roommateTwin.trim() === '')) { // 'None' reuses twinRoom field for main guest name
            errors.Roommates = "Please specify the main guest for the room booking.";
        }


        if (Object.keys(errors).length > 0) {
            // Find the first field with an error to set `form.field`
            const firstErrorField = Object.keys(errors)[0];
            return fail(400, { data: formValues, field: firstErrorField, error: errors[firstErrorField], errors });
        }

        // *** CRITICAL: Validate Pass Option against Level SERVER-SIDE ***
        if (!isValidPassOptionForLevelServer(level, passOption)) {
            return fail(400, { data: formValues, field: 'PassOption', error: `Selected pass option '${passOption}' is not valid for level '${level}'.`, errors });
        }

        // --- Calculate Price and Deadline SERVER-SIDE ---
        const currentTierServer = getCurrentTierServer();
        const basePriceNumServer = getBasePriceServer(currentTierServer, region); // region should be validated by now

        if (basePriceNumServer === null) {
            console.error("Server Error: Could not determine base price even after validation.", { currentTierServer, region });
            return fail(500, { data: formValues, error: 'Server error: Could not determine base price.', errors });
        }

        const calculatedPassPriceServer = calculatePassPriceServer(basePriceNumServer, level, passOption);

        if (calculatedPassPriceServer === null) {
            console.error("Server Error: Could not calculate pass price.", { basePriceNumServer, level, passOption });
            return fail(500, { data: formValues, error: 'Server error: Could not calculate pass price for your selection.', errors });
        }

        const { price: calculatedHotelPriceServer, nights: serverNumberOfNights } = calculateHotelPriceServer(
            hotelOption,
            checkInDate,
            checkOutDate
        );
        
        let intensiveCostServer = addIntensiveServer ? SERVER_INTENSIVE_PRICE : 0;

        // Re-check hotelNights from form if it was validated earlier, or use serverNumberOfNights
        const finalNumberOfNights = (hotelOption && hotelOption !== 'None' && hotelOption !== 'HotelOptionNo') ? serverNumberOfNights : 0;


        const finalAmountDueServer = calculatedPassPriceServer + calculatedHotelPriceServer + intensiveCostServer;
        const paymentDeadlineString = calculatePaymentDeadline();

        // --- Prepare Data for Supabase ---
        const registrationData = {
            Email: email,
            FullName: fullName,
            WSDCID: wsdcId || null,
            Region: region,
            Level: level,
            PassOption: passOption,
            AddedIntensive: addIntensiveServer,
            Role: role,
            Country: country,
            PromoCode: promoCode || null,
            Competing: competing,
            HasPartner: hasPartner,
            PartnerName: hasPartner ? partnerName : null,
            PartnerEmail: hasPartner ? partnerEmail : null,
            HotelOption: hotelOption, // Renamed from HotelRoomType for consistency with form's selectedHotel
            CheckInDate: (hotelOption && hotelOption !== 'None' && hotelOption !== 'HotelOptionNo' && checkInDate) ? checkInDate : null,
            CheckOutDate: (hotelOption && hotelOption !== 'None' && hotelOption !== 'HotelOptionNo' && checkOutDate) ? checkOutDate : null,
            NumberOfNights: finalNumberOfNights > 0 ? finalNumberOfNights : null,
            
            // Roommate fields - ensure these align with your DB column names
            RoommateTwin: (hotelOption === 'HotelOptionTwo' || hotelOption === 'None') ? roommateTwin : null,
            RoommateTripleOne: hotelOption === 'HotelOptionThree' ? roommateTripleOne : null,
            RoommateTripleTwo: hotelOption === 'HotelOptionThree' ? roommateTripleTwo : null,
            RoommateQuatroOne: hotelOption === 'HotelOptionFour' ? roommateQuatroOne : null,
            RoommateQuatroTwo: hotelOption === 'HotelOptionFour' ? roommateQuatroTwo : null,
            RoommateQuatroThree: hotelOption === 'HotelOptionFour' ? roommateQuatroThree : null,
            
            AcceptedRules: acceptedRules,
            AcceptedToC: acceptedToC,
            AmountDue: finalAmountDueServer,
            PaymentDeadline: paymentDeadlineString,
            PriceTier: currentTierServer,
            // Gender: null, // You had Gender in schema, but not in form. Add if needed.
            // PartnerID: null, // You had PartnerID. If this is for linking, logic will be more complex.
        };

        // --- Insert into Supabase ---
        const { data: insertedData, error: dbError } = await supabaseAdmin
            .from('RegistrationDB') // Ensure this is your exact table name
            .insert([registrationData])
            .select()
            .maybeSingle();

        // --- Handle Response ---
        if (dbError) {
            console.error("Supabase Admin Insert Error:", dbError);
            // Check for specific errors, e.g., unique constraint violation on Email if it should be unique
            if (dbError.code === '23505') { // PostgreSQL unique violation
                 return fail(409, { data: formValues, field: 'Email', error: 'This email address is already registered.', errors });
            }
            return fail(500, { data: formValues, error: `Database error: ${dbError.message}`, errors });
        }

        return { success: true, insertedId: insertedData?.id };
    }
};