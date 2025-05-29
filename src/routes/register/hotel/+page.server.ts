import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabaseAdminClient';

export const actions: Actions = {
    bookHotel: async ({ request }) => {
        const formData = await request.formData();

        // Gather roommate fields (adjust names as per your form)
        const roommates = [
            formData.get('Roommate1'),
            formData.get('Roommate2'),
            formData.get('Roommate3')
        ]
        .filter(Boolean) // Remove empty/null
        .join(', '); // Or use JSON.stringify([...]) for array storage


        // Collect all fields from the form
        const data = {
            fullname: formData.get('FullName'),
            email: formData.get('Email'),
            hoteloption: formData.get('HotelOption'),
            checkindate: formData.get('CheckInDate'),
            checkoutdate: formData.get('CheckOutDate'),
            roommates: roommates,
            specialrequests: formData.get('SpecialRequests'),
            amountdue: formData.get('CalculatedHotelPrice') ? Number(formData.get('CalculatedHotelPrice')) : null,
            numberofnights: formData.get('NumberOfNights'),
        };

        // Insert into Supabase
        const { error } = await supabaseAdmin
            .from('HotelRegistration')
            .insert([data]);

        if (error) {
            return fail(400, { error: error.message });
        }

        return { success: true };
    }
};

export const load: PageServerLoad = async () => {
    return {};
};