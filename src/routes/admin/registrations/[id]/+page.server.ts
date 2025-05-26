import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import type { Actions } from './$types';

export const actions: Actions = {
    update: async ({ request, params }) => {
        const { id } = params;
        const formData = await request.formData();
        // Convert formData to a plain object
        const updateData: Record<string, any> = {};
        for (const [key, value] of formData.entries()) {
            updateData[key] = value;
        }

        const { error } = await supabaseAdmin
            .from('RegistrationDB')
            .update(updateData)
            .eq('userID', id);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    }
};

export const load: PageServerLoad = async ({ params }) => {
    const { id } = params;
    console.log(`[LOAD REGISTRATION] Fetching registration for userId: ${id}`);



    // Example: fetch registration from your database
    const { data: registration, error } = await supabaseAdmin
        .from('RegistrationDB') // Your registrations table
        .select(`
            RegistrationStatus,
            FullName,
            Email,
            WSDCID,
            Level,
            Role,
            PassOption,
            AmountDue,
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

    console.log(`[LOAD REGISTRATION] Fetched data:`, registration);
    console.log(`[LOAD REGISTRATION] Error:`, error);


    if (error) {
        return { status: 404, error: 'Registration not found' };
    }
    console.log(`[LOAD REGISTRATION] Registration data:`, registration.Email);
    const { data: hotelData, error: hotelError } = await supabaseAdmin
        .from('HotelRegistration')
        .select('*')
        // .or(`email.eq.${registration.Email},roommates.in.${registration.FullName}`)
        .eq('email', registration.Email)
        .single();

    // console.log(`[LOAD HOTEL DATA] Fetched hotel data:`, hotelData);
    // console.log(`[LOAD HOTEL DATA] Hotel error:`, hotelError);

    // if (hotelError) {
    //     return { status: 404, hotelError: 'Hotel reg not found' };
    // }
    
    console.log(`[LOAD HOTEL DATA] Hotel data:`, hotelData.email);
    if (hotelData.email !== registration.Email) {
        console.warn(`[LOAD HOTEL DATA] Hotel email does not match registration email: ${hotelData.email} !== ${registration.Email}`);
    }
    if (hotelData.email === registration.Email) {
        console.error(`[LOAD HOTEL DATA] Registration Found!`);
    }
    console.log('Registration Email:', JSON.stringify(registration.Email));
    console.log('Hotel Email:', JSON.stringify(hotelData.email));
    return { registration, hotelData };
};