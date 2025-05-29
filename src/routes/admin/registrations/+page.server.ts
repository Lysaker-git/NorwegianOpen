// src/routes/admin/registrations/+page.server.ts
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import type { PageServerLoad } from './$types';
import { error as SvelteKitError } from '@sveltejs/kit'; // To throw errors
import transporter from '$lib/emailClient.server';
import { GOOGLE_EMAIL } from '$env/static/private';

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

interface RegistrationDetailsForEmail {
    Email: string | null;
    FullName: string | null;
    WSDCID?: string | null;
    Region: 'Nordic' | 'World' | null;
    Level: string | null;
    PassOption: string | null;
    AddedIntensive: boolean;
    Role: string | null;
    Country: string | null;
    Competing?: boolean;
    HasPartner: boolean;
    PromoCode?: string | null;
    PartnerName?: string | null;
    PartnerEmail?: string | null;
    AmountDue: number;
    PaymentDeadline: string;
    PriceTier: 'Ymir' | 'Midgard' | 'Ragnarok';
    RegistrationStatus: 'pendingApproval' | 'waitingList' | 'approved' | 'paymentReceived' | 'checkedIn';
    PassPrice: number | null;
    IntensivePrice?: number | null;
    BasePriceAtRegistration?: number | null;
}

function generateRegistrationApprovedEmailHtml(details: RegistrationDetailsForEmail): string {
    const eventName = "Norwegian Open WCS 2025";
    const currencySymbol = "NOK";
    const paymentInfo = {
        accountName: "Norwegian Open Dance Org",
        iban: "NO93 8601 1117 947",
        swift: "DNBANOKKXXX",
        bankName: "DNB Bank ASA",
        bankAddress: "Dronning Eufemias gate 30, 0191 Oslo, Norway"
    };

    const primaryColor = '#0A2342';
    const accentColor = '#FFD700';
    const textColor = '#333333';
    const backgroundColor = '#f4f4f7';
    const borderColor = '#ddddde';

    const styles = {
        body: `font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: ${textColor}; background-color: ${backgroundColor}; margin: 0; padding: 20px 0;`,
        container: `max-width: 600px; margin: 20px auto; background-color: #fff; border: 1px solid ${borderColor}; border-radius: 5px; overflow: hidden;`,
        header: `background-color: ${primaryColor}; color: #fff; padding: 25px 20px; text-align: center;`,
        headerH1: `margin: 0; font-size: 28px; color: #fff; font-weight: bold;`,
        content: `padding: 25px 30px;`,
        h2: `color: ${primaryColor}; font-size: 22px; margin-top: 25px; margin-bottom: 15px; border-bottom: 1px solid ${borderColor}; padding-bottom: 8px; font-weight: bold;`,
        p: `margin-bottom: 16px; font-size: 15px; color: ${textColor};`,
        th: `text-align: left; padding: 10px 8px; border-bottom: 1px solid ${borderColor}; color: #555; font-weight: normal; width: 35%; font-size: 14px;`,
        td: `text-align: left; padding: 10px 8px; border-bottom: 1px solid ${borderColor}; color: ${textColor}; font-size: 14px; font-weight: bold;`,
        paymentBox: `margin: 25px 0; padding: 20px; border: 1px solid ${primaryColor}; border-radius: 4px; background-color: #F0F5FA;`,
        paymentH3: `font-size: 20px; color: ${primaryColor}; margin-top: 0; margin-bottom: 15px; text-align: center; font-weight: bold;`,
        paymentItem: `font-size: 15px; margin-bottom: 6px;`,
        paymentTotal: `font-weight: bold; color: ${primaryColor}; font-size: 17px; margin-top: 10px;`,
        footer: `text-align: center; padding: 20px; font-size: 12px; color: #dddddd; background-color: rgba(10, 35, 66, 0.75);`
    };

const formatPrice = (price: number | null | undefined) => price !== null && price !== undefined ? `${price.toLocaleString()} ${currencySymbol}` : 'N/A';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Registration Approved - ${eventName}</title>
    </head>
    <body style="${styles.body}">
        <div style="${styles.container}">
            <div style="${styles.header}">
                <h1 style="${styles.headerH1}">${eventName}</h1>
            </div>
            <div style="${styles.content}">
                <h2 style="${styles.h2.replace('margin-top: 25px;', 'margin-top: 0;')}">Congratulations, ${details.FullName || 'Dancer'}!</h2>
                <p style="${styles.p}">
                    Your registration for <strong>${eventName}</strong> has been <span style="color: #28a745; font-weight: bold;">APPROVED</span>!
                </p>
                <p style="${styles.p}">
                    Please complete your payment to secure your spot. Your registration details are below.
                </p>
                <div style="${styles.paymentBox}">
                    <h3 style="${styles.paymentH3}">Payment Information</h3>
                    <div style="${styles.paymentItem}"><strong>Amount Due:</strong> <span style="${styles.paymentTotal}">${formatPrice(details.AmountDue)}</span></div>
                    <div style="${styles.paymentItem}"><strong>Payment Deadline:</strong> ${details.PaymentDeadline}</div>
                    <div style="${styles.paymentItem}"><strong>Account Name:</strong> ${paymentInfo.accountName}</div>
                    <div style="${styles.paymentItem}"><strong>IBAN:</strong> ${paymentInfo.iban}</div>
                    <div style="${styles.paymentItem}"><strong>SWIFT/BIC:</strong> ${paymentInfo.swift}</div>
                    <div style="${styles.paymentItem}"><strong>Bank Name:</strong> ${paymentInfo.bankName}</div>
                    <div style="${styles.paymentItem}"><strong>Bank Address:</strong> ${paymentInfo.bankAddress}</div>
                    <div style="font-size:13px; color:#555; margin-top:10px;">
                        Please include your <strong>name</strong> and <strong>user ID</strong> in the payment reference.
                    </div>
                </div>
                        <h2 style="${styles.h2}">Your Registration Details:</h2>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr><th style="${styles.th}">Full Name:</th><td style="${styles.td}">${details.FullName || 'N/A'}</td></tr>
                    <tr><th style="${styles.th}">Email:</th><td style="${styles.td}">${details.Email || 'N/A'}</td></tr>
                    ${details.WSDCID ? `<tr><th style="${styles.th}">WSDC ID:</th><td style="${styles.td}">${details.WSDCID}</td></tr>` : ''}
                    <tr><th style="${styles.th}">Region:</th><td style="${styles.td}">${details.Region || 'N/A'}</td></tr>
                    <tr><th style="${styles.th}">Level:</th><td style="${styles.td}">${details.Level || 'N/A'}</td></tr>
                    <tr><th style="${styles.th}">Pass Option:</th><td style="${styles.td}">${details.PassOption || 'N/A'}</td></tr>
                    <tr><th style="${styles.th}">Role:</th><td style="${styles.td}">${details.Role || 'N/A'}</td></tr>
                    <tr><th style="${styles.th}">Country:</th><td style="${styles.td}">${details.Country || 'N/A'}</td></tr>
                    ${details.PromoCode ? `<tr><th style="${styles.th}">Promo Code:</th><td style="${styles.td}">${details.PromoCode}</td></tr>` : ''}
                    <tr><th style="${styles.th}">Competing:</th><td style="${styles.td}">${details.Competing ? 'Yes' : 'No'}</td></tr>
                    ${details.HasPartner && details.PartnerName ? `<tr><th style="${styles.th}">Partner's Name:</th><td style="${styles.td}">${details.PartnerName}</td></tr>` : ''}
                    ${details.HasPartner && details.PartnerEmail ? `<tr><th style="${styles.th}">Partner's Email:</th><td style="${styles.td}">${details.PartnerEmail}</td></tr>` : ''}
                </table>
                <p style="${styles.p}">If you have any questions, please reply to this email.</p>
                <p style="${styles.p}">We look forward to seeing you at the event!</p>
                <p style="${styles.p}">Warm regards,<br>The ${eventName} Team</p>
            </div>
            <div style="${styles.footer}">
                <p style="color:#FFFFFF">© ${new Date().getFullYear()} ${eventName}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
}


// Approve and notify function
async function approveAndNotify(userID: string): Promise<{ success: boolean; error?: string }> {
    // 1. Fetch registration by userID
    const { data: registration, error: fetchError } = await supabaseAdmin
        .from('RegistrationDB')
        .select('*')
        .eq('userID', userID)
        .single();

    if (fetchError || !registration) {
        return { success: false, error: fetchError?.message || 'Registration not found' };
    }

    // 2. Update status to 'approved'
    const { error: updateError } = await supabaseAdmin
        .from('RegistrationDB')
        .update({ RegistrationStatus: 'approved' })
        .eq('userID', userID);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    // 3. Prepare email details
    const details: RegistrationDetailsForEmail = {
        Email: registration.Email,
        FullName: registration.FullName,
        WSDCID: registration.WSDCID,
        Region: registration.Region,
        Level: registration.Level,
        PassOption: registration.PassOption,
        AddedIntensive: registration.AddedIntensive,
        Role: registration.Role,
        Country: registration.Country,
        Competing: registration.Competing,
        HasPartner: registration.HasPartner,
        PromoCode: registration.PromoCode,
        PartnerName: registration.PartnerName,
        PartnerEmail: registration.PartnerEmail,
        AmountDue: registration.AmountDue,
        PaymentDeadline: registration.PaymentDeadline,
        PriceTier: registration.PriceTier,
        RegistrationStatus: 'approved',
        PassPrice: registration.PassPrice ?? null,
        IntensivePrice: registration.IntensivePrice ?? undefined,
        BasePriceAtRegistration: registration.BasePriceAtRegistration ?? undefined
    };

    // 4. Generate email HTML
    const emailHtmlBody = generateRegistrationApprovedEmailHtml(details);

    // 5. Send email
    if (details.Email) {
        const message = {
            from: GOOGLE_EMAIL,
            to: details.Email,
            subject: `Registration Approved - Norwegian Open WCS 2025`,
            text: "Your registration has been approved! Please see the attached details and payment instructions.",
            html: emailHtmlBody
        };

        try {
            await new Promise((resolve, reject) => {
                transporter.sendMail(message, (err, info) => {
                    if (err) {
                        console.error('Email error:', err);
                        reject(err);
                    } else {
                        resolve(info);
                    }
                });
            });
        } catch (err) {
            return { success: false, error: 'Failed to send email: ' + (err as Error).message };
        }
    } else {
        return { success: false, error: 'No email address found for this registration.' };
    }

    return { success: true };
}