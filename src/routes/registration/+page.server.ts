import { supabase } from "$lib/supaBaseClient";
import { supabaseAdmin } from "$lib/supabaseAdminClient";
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	register: async ({ request }) => {
		const formData = await request.formData();

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 14)

        const paymentDate = String(futureDate)


		// --- Get Data from Form ---
        // Use formData.get('nameAttribute') - names must match your svelte form
        const email = formData.get('Email') as string | null;
        const fullName = formData.get('FullName') as string | null;
        const wsdcId = formData.get('WSDCID') as string | null; // Or Number if applicable
        const passType = formData.get('Passtype') as string | null;
        const role = formData.get('Role') as string | null;
        const partnerName = formData.get('PartnerName') as string | null;
        const gender = formData.get('Gender') as string | null;
        const country = formData.get('Country') as string | null;
        const partnerId = formData.get('PartnerID') as string | null; // Or Number
        // Checkbox value is 'on' if checked, null otherwise. Convert to boolean.
        const competing = formData.get('Competing') === 'on';
        const paymentType = formData.get('PaymentType') as string | null;
        const acceptedRules = formData.get('AcceptedRules') === 'on';
        const acceptedToC = formData.get('AcceptedToC') === 'on';
        const hotelRoomType = formData.get('HotelRoomType') as string | null;
        const amountDue = formData.get('AmountDue') as string | null; // Or Number
        const paymentDeadline = paymentDate as string | null; // Date string

        // --- Basic Server-Side Validation (Example) ---
        if (!email || !email.includes('@')) {
            return fail(400, { field: 'Email', error: 'Valid email is required.', missing: true });
        }
        if (!fullName) {
            return fail(400, { field: 'FullName', error: 'Full Name is required.', missing: true });
        }
        if (!acceptedRules || !acceptedToC) {
             return fail(400, { field: 'Terms', error: 'You must accept the Rules and Terms & Conditions.', missing: true });
        }
        // Add more validation for other required fields...

        // --- Prepare Data for Supabase ---
        const registrationData = {
            Email: email,
            FullName: fullName,
            WSDCID: wsdcId, // Ensure type matches Supabase column (string or number)
            Passtype: passType,
            Role: role,
            PartnerName: partnerName,
            Gender: gender,
            Country: country,
            PartnerID: partnerId, // Ensure type matches
            Competing: competing, // Boolean
            PaymentType: paymentType,
            AcceptedRules: acceptedRules, // Boolean
            AcceptedToC: acceptedToC, // Boolean
            HotelRoomType: hotelRoomType,
            AmountDue: amountDue ? Number(amountDue) : null, // Convert to number if needed
            PaymentDeadline: paymentDeadline, // Ensure format matches Supabase date/timestamp
        };

        // --- Insert into Supabase ---
		const { data, error: dbError } = await supabaseAdmin
			.from('RegistrationDB')
			.insert([registrationData]) // Pass the prepared data object
			.select() // Select the inserted row(s)
            .maybeSingle(); // Expecting one row or null

        // --- Handle Response ---
		if (dbError) {
            console.error("Supabase Insert Error:", dbError);
			// You might want more specific error codes based on dbError.code
            return fail(500, { error: `Database error: ${dbError.message}` });
		}

        console.log("Inserted Data:", data);

		// Return success state, maybe with the inserted data
        // Redirecting after success is also common: throw redirect(303, '/thank-you');
		return { success: true, insertedId: data?.id /* or some other identifier if needed */ };
	}
};