import { supabaseAdmin } from '$lib/supabaseAdminClient';
import type { PageServerLoad } from './$types';
import type { RequestEvent } from '@sveltejs/kit';
import { error as SvelteKitError } from '@sveltejs/kit';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // Check admin access 
    if (!locals.isAdmin) {
        throw SvelteKitError(403, 'Forbidden: You do not have access to this page.');
    }

    const { data: hotelRegistrations, error } = await supabaseAdmin
        .from('HotelRegistration')
        .select(`
            id,
            fullname,
            email,
            hoteloption,
            checkindate,
            checkoutdate,
            numberofnights,
            roommates,
            specialrequests,
            amountdue,
            paymentdeadline,
            created_at,
            status
        `)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching hotel registrations:', error);
        throw SvelteKitError(500, 'Failed to load hotel registrations.');
    }

    return {
        hotelRegistrations: hotelRegistrations || []
    };
};

export const actions = {
    updateStatus: async ({ request }: RequestEvent) => {
        const formData = await request.formData();
        const updates = JSON.parse(formData.get('updates') as string);

        try {
            // Process each update
            for (const { id, status } of updates) {
                const { error: updateError } = await supabaseAdmin
                    .from('HotelRegistration')
                    .update({ status })
                    .eq('id', id);

                if (updateError) {
                    console.error(`Error updating hotel registration ${id}:`, updateError);
                    return { success: false, error: updateError.message };
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Error processing updates:', error);
            return { success: false, error: 'Failed to process updates' };
        }
    }
};