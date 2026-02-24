import { supabaseAdmin } from '$lib/supabaseAdminClient';
import type { PageServerLoad } from './$types';
import type { RequestEvent } from '@sveltejs/kit';
import { error as SvelteKitError } from '@sveltejs/kit';
import type { Actions } from './$types';
import transporter from '$lib/emailClient.server';

function generateHotelPaymentConfirmationEmail(hotel: any) {
    const eventName = 'Norwegian Open WCS 2026';
    const styles = {
        body: 'font-family: Arial, Helvetica, sans-serif; background: #f4f4f7; color: #333; padding: 0; margin: 0;',
        container: 'max-width: 600px; margin: 40px auto; background: #fff; border: 1px solid #ddd; border-radius: 5px; overflow: hidden;',
        header: 'background: #0A2342; color: #fff; padding: 20px; text-align: center;',
        content: 'padding: 24px;',
        h2: 'color: #0A2342; border-bottom: 2px solid #FFD700; padding-bottom: 10px; margin-bottom: 20px;',
        detail: 'margin: 10px 0;',
        highlight: 'color: #0A2342; font-weight: bold;',
        footer: 'text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f4f4f7;'
    };
    return `
    <html><body style="${styles.body}">
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1>Hotel Payment Confirmed</h1>
          <div>${eventName}</div>
        </div>
        <div style="${styles.content}">
          <h2 style="${styles.h2}">Your Hotel Payment is Confirmed!</h2>
          <p style="${styles.detail}">Dear ${hotel.fullname || 'guest'},</p>
          <p style="${styles.detail}">We have received your payment for your hotel booking at Norwegian Open WCS 2026.</p>
          <div style="${styles.detail}"><span style="${styles.highlight}">Room Type:</span> ${hotel.hoteloption || 'N/A'}</div>
          <div style="${styles.detail}"><span style="${styles.highlight}">Check-in:</span> ${hotel.checkindate || 'N/A'}</div>
          <div style="${styles.detail}"><span style="${styles.highlight}">Check-out:</span> ${hotel.checkoutdate || 'N/A'}</div>
          <div style="${styles.detail}"><span style="${styles.highlight}">Roommates:</span> ${hotel.roommates || 'N/A'}</div>
          <div style="${styles.detail}"><span style="${styles.highlight}">Amount Paid:</span> ${hotel.amountdue ? hotel.amountdue + ' NOK' : 'N/A'}</div>
          <p style="${styles.detail}">Thank you for your payment. Your room is now secured. If you have any questions, please reply to this email.</p>
        </div>
        <div style="${styles.footer}">
          <p>Thank you!<br/>The ${eventName} Team</p>
        </div>
      </div>
    </body></html>
    `;
}

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
            status,
            gotConfirmEmail
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
    },
    sendHotelPaymentConfirmation: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        console.log(`[SEND HOTEL PAYMENT CONFIRMATION] ID: ${id}`);
        if (!id) return { success: false, error: 'Missing hotel registration ID.' };
        const { data: hotel, error } = await supabaseAdmin
            .from('HotelRegistration')
            .select('*')
            .eq('id', id)
            .single();

        console.log(`[SEND HOTEL PAYMENT CONFIRMATION] Hotel data:`, hotel);
        console.log(`[SEND HOTEL PAYMENT CONFIRMATION] Error:`, error);
        if (error || !hotel) return { success: false, error: 'Hotel registration not found.' };
        if (!hotel.email) return { success: false, error: 'No email address on file.' };
        try {
            await transporter.sendMail({
                from: process.env.GOOGLE_EMAIL,
                to: hotel.email,
                subject: 'Hotel Payment Confirmation - Norwegian Open WCS 2026',
                html: generateHotelPaymentConfirmationEmail(hotel)
            });
            // Mark as confirmation sent
            await supabaseAdmin.from('HotelRegistration').update({ gotConfirmEmail: true }).eq('id', id);
            return { success: true };
        } catch (e) {
            return { success: false, error: 'Failed to send email.' };
        }
    }
};