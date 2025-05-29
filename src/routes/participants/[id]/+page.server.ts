import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';

export const load: PageServerLoad = async ({ params }) => {
    const { id } = params;

    // Fetch registration
    const { data: registration, error: regError } = await supabaseAdmin
        .from('RegistrationDB')
        .select(`
            RegistrationStatus,
            FullName,
            Email,
            WSDCID,
            Level,
            Role,
            PassOption,
            AmountDue,
            RegistrationStatus,
            PaymentDeadline,
            HasPartner,
            PartnerName,
            PartnerEmail,
            Competing,
            PromoCode,
            AddedIntensive,
            userID
        `)
        .eq('userID', id)
        .single();

    if (regError || !registration) {
        console.error('[LOAD REGISTRATION] Error:', regError?.message || 'No registration found');
        return { status: 404, error: 'Registration not found', registration: null, hotelData: null };
    }

    // Fetch hotel registration (may be null)
    let hotelData = null;
    let hotelError = null;
    if (registration.Email) {
        const hotelResult = await supabaseAdmin
            .from('HotelRegistration')
            .select('*')
            .eq('email', registration.Email)
            .single();

        hotelData = hotelResult.data ?? null;
        hotelError = hotelResult.error ?? null;

        if (hotelError) {
            console.warn('[LOAD HOTEL DATA] Error:', hotelError.message);
        }
    } else {
        console.warn('[LOAD HOTEL DATA] No registration email to search for hotel data.');
    }

    return { registration, hotelData, error: null };
};