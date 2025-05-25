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
    const { data, error } = await supabaseAdmin
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

    if (error) {
        return { status: 404, error: 'Registration not found' };
    }

    return { registration: data };
};