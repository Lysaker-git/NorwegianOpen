// src/routes/admin/registrations/+page.server.ts
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import type { PageServerLoad } from './$types';
import { error as SvelteKitError } from '@sveltejs/kit'; // To throw errors

export const load: PageServerLoad = async ({ locals }) => {
    // The layout.server.ts should already protect this, but double-check
    if (!locals.isAdmin) {
        throw SvelteKitError(403, 'Forbidden: You do not have access to this page.');
    }

    const { data: registrations, error } = await supabaseAdmin
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
        .order('created_at', { ascending: false }); // Show newest first

    if (error) {
        console.error('Error fetching registrations:', error);
        throw SvelteKitError(500, 'Failed to load registrations.');
    }

    return {
        registrations: registrations || []
    };
};