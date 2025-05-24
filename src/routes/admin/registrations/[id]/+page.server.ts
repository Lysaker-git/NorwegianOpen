import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';

export const load: PageServerLoad = async ({ params }) => {
    const { id } = params;
    console.log(`[LOAD REGISTRATION] Fetching registration for userId: ${id}`);
    // Example: fetch registration from your database
    const { data, error } = await supabaseAdmin
        .from('RegistrationDB') // Your registrations table
        .select(`
            id,
            FullName,
            Email,
            Level,
            PassOption,
            AmountDue,
            RegistrationStatus,
            PaymentDeadline,
            HasPartner,
            PartnerName,
            userID,
            created_at
        `)
        .eq('userID', id)
        .single();

    if (error) {
        return { status: 404, error: 'Registration not found' };
    }

    return { registration: data };
};