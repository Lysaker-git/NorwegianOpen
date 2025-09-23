import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import type { Actions } from './$types';
import transporter from '$lib/emailClient.server';

function generatePaymentReminderEmail(registration: any) {
    const eventName = 'Norwegian Open WCS 2025';
    const paymentDeadline = registration.PaymentDeadline || 'your payment deadline';
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
          <h1>Payment Reminder</h1>
          <div>${eventName}</div>
        </div>
        <div style="${styles.content}">
          <h2 style="${styles.h2}">Friendly Payment Reminder</h2>
          <p style="${styles.detail}">Dear ${registration.FullName || 'dancer'},</p>
          <p style="${styles.detail}">This is a friendly reminder that your payment for Norwegian Open WCS 2025 is still pending.</p>
          <div style="${styles.detail}"><span style="${styles.highlight}">Amount Due:</span> ${registration.AmountDue ? registration.AmountDue + ' NOK' : 'N/A'}</div>
          <p style="${styles.detail}">You can find payment information on your registration page through the button below.</p>
          <p style="${styles.detail}">Please complete your payment to secure your spot. If you have already paid, please disregard this message.</p>
          <div style="margin: 24px 0;">
            <a href="https://norwegianopen.no/participants/${registration.userID}" style="display:inline-block;padding:12px 24px;background:#0A2342;color:#fff;text-decoration:none;border-radius:5px;font-weight:bold;">View Your Registration</a>
          </div>
        </div>
        <div style="${styles.footer}">
          <p>Thank you!<br/>The ${eventName} Team</p>
        </div>
      </div>
    </body></html>
    `;
}

export const actions: Actions = {
    update: async ({ request, params }) => {
        const { id } = params;
        const formData = await request.formData();
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
    },
    sendPaymentReminder: async ({ params }) => {
        const { id } = params;
        // Fetch registration
        console.log(`[SEND PAYMENT REMINDER] Fetching registration for userID: ${id}`);
        const { data: registration, error } = await supabaseAdmin
            .from('RegistrationDB')
            .select('*')
            .eq('userID', id)
            .single();

        console.log(`[SEND PAYMENT REMINDER] Registration fetched:`, registration);
        if (error || !registration) {
            return { success: false, error: 'Registration not found.' };
        }
        if (!registration.Email) {
            return { success: false, error: 'No email address on file.' };
        }
        try {
            await transporter.sendMail({
                from: process.env.GOOGLE_EMAIL,
                to: registration.Email,
                // to: "lyskerwcs@hotmail.com",
                subject: 'Payment Reminder - Norwegian Open WCS 2025',
                html: generatePaymentReminderEmail(registration)
            });
            return { success: true };
        } catch (e) {
            return { success: false, error: 'Failed to send email.' };
        }
    },
    delete: async ({ params }) => {
        const { id } = params;
        console.log(`[SERVER] [DELETE REGISTRATION] Deleting registration for userID: ${id}`);
        const { error } = await supabaseAdmin
            .from('RegistrationDB')
            .delete()
            .eq('userID', id);
        if (error) {
            console.log('[SERVER] Delete error:', error.message);
            return { success: false, error: error.message };
        }
        console.log('[SERVER] Delete success for userID:', id);
        return { success: true };
    }
};

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
            userID,
            comments
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