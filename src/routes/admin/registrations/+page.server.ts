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
            Role,
            PassOption,
            AmountDue,
            RegistrationStatus,
            PaymentDeadline,
            HasPartner,
            PartnerName,
            userID,
            created_at
        `)
        .order('created_at', { ascending: true }); // Show newest first

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
    userID: string | null;
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
        accountName: "Norwegian Open WCS",
        iban: "NO74 4910 2039 490",
        swift: "SNOWNO22",
        bankName: "Sparebank 1 NordNorge",
        bankAddress: "Storgata 65, 9008 Tromsø, Norway"
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

const paymentDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
                    <div style="${styles.paymentItem}"><strong>Payment Deadline:</strong> ${paymentDeadline}</div>
                    <div style="${styles.paymentItem}"><strong>Account Name:</strong> ${paymentInfo.accountName}</div>
                    <div style="${styles.paymentItem}"><strong>IBAN:</strong> ${paymentInfo.iban}</div>
                    <div style="${styles.paymentItem}"><strong>SWIFT/BIC:</strong> ${paymentInfo.swift}</div>
                    <div style="${styles.paymentItem}"><strong>Bank Name:</strong> ${paymentInfo.bankName}</div>
                    <div style="${styles.paymentItem}"><strong>Bank Address:</strong> ${paymentInfo.bankAddress}</div>
                    <div style="font-size:13px; color:#555; margin-top:10px;">
                        Please include your <strong>name</strong> like this: <strong>${details.FullName} NOW25</strong> in the payment reference.
                    </div>
                </div>
                        <h2 style="${styles.h2}">Your Registration Details:</h2>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr><th style="${styles.th}">Full Name:</th><td style="${styles.td}">${details.FullName || 'N/A'}</td></tr>
                    <tr><th style="${styles.th}">Email:</th><td style="${styles.td}">${details.Email || 'N/A'}</td></tr>
                    <tr><th style="${styles.th}">Region:</th><td style="${styles.td}">${details.Region || 'N/A'}</td></tr>
                    <tr><th style="${styles.th}">Level:</th><td style="${styles.td}">${details.Level || 'N/A'}</td></tr>
                    <tr><th style="${styles.th}">Pass Option:</th><td style="${styles.td}">${details.PassOption || 'N/A'}</td></tr>
                    <tr><th style="${styles.th}">Role:</th><td style="${styles.td}">${details.Role || 'N/A'}</td></tr>
                    <tr><th style="${styles.th}">Country:</th><td style="${styles.td}">${details.Country || 'N/A'}</td></tr>
                    <tr><th style="${styles.th}">Competing:</th><td style="${styles.td}">${details.Competing ? 'Yes' : 'No'}</td></tr>
                    ${details.HasPartner && details.PartnerName ? `<tr><th style="${styles.th}">Partner's Name:</th><td style="${styles.td}">${details.PartnerName}</td></tr>` : ''}
                    ${details.HasPartner && details.PartnerEmail ? `<tr><th style="${styles.th}">Partner's Email:</th><td style="${styles.td}">${details.PartnerEmail}</td></tr>` : ''}
                </table>                
                <div style="${styles.paymentBox.replace('#F0F5FA', '#f5f5f5')}">
                    <h3 style="${styles.paymentH3}">🏨 Book Your Stay!</h3>
                    <p style="margin: 15px 0; text-align: center; font-size: 15px;">
                        Don't forget to book your accommodation! We have secured special rates at our partner hotel.
                    </p>
                    <p style="text-align: center;">
                        <a href="https://norwegianopen.no/register/hotel" 
                        style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; 
                                padding: 12px 25px; text-decoration: none; border-radius: 5px; 
                                font-weight: bold; margin-top: 10px;">
                            Book Your Hotel Room
                        </a>
                    </p>
                </div>

                <div style="${styles.paymentBox.replace('#F0F5FA', '#f5f5f5')}">
                    <h3 style="${styles.paymentH3}">🎯 View Your Registration</h3>
                    <p style="margin: 15px 0; text-align: center; font-size: 15px;">
                        You can always check your registration details online.
                    </p>
                    <p style="text-align: center;">
                        <a href="https://norwegianopen.no/participants/${details.userID}" 
                        style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; 
                                padding: 12px 25px; text-decoration: none; border-radius: 5px; 
                                font-weight: bold; margin-top: 10px;">
                            View Registration Details
                        </a>
                    </p>
                </div>

                <p style="${styles.p}">If you have any questions, please reply to this email.</p>
                <p style="${styles.p}">We look forward to seeing you at the event!</p>
                <p style="${styles.p}">Warm regards,<br>The ${eventName} Team</p>
            </div>
            <div style="${styles.footer}">
                <p style="color:#FFFFFF">© ${new Date().getFullYear()} ${eventName}. All rights reserved.</p>
            </div>
            <div style="${styles.paymentBox.replace('#F0F5FA', '#0A2342')}">
                <h3 style="${styles.paymentH3.replace(primaryColor, '#FFD700')}">🎉 What's Coming Up! 🎉</h3>
                <div style="color: #fff; line-height: 1.6;">
                    <p style="margin-bottom: 12px;">
                        Get ready for an incredible extended weekend! We kick off with our amazing Thursday pre-party - 
                        the perfect way to start your Norwegian Open experience and meet dancers from around the world.
                    </p>
                    <p style="margin-bottom: 12px;">
                        Friday begins with our exclusive Blues Intensive - a unique opportunity to deepen your connection 
                        to the music with our world-class instructors. As the evening unfolds, witness the electricity of 
                        our Strictly Competition, where partnerships come alive under the spotlight!
                    </p>
                    <p style="margin-bottom: 12px;">
                        Sunday brings special moments with our Newcomer Jack & Jill - your chance to shine if you're just 
                        starting your competition journey! Then, join us for our cozy social gathering where stories 
                        are shared, friendships are forged, and memories are made.
                    </p>
                    <p style="margin-bottom: 12px; font-style: italic;">
                        And for those who can't get enough (we know who you are! 😉), the dancing continues until Monday 
                        morning. Because at Norwegian Open, we believe the best moments happen when the night meets the dawn...
                    </p>
                    <p style="color: #FFD700; font-weight: bold; margin-top: 20px; text-align: center;">
                        Your spot is secured - now it's time to get excited! 💃🕺
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>`;
}

import { json } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    updateStatus: async ({ request }) => {
        const formData = await request.formData();
        const updates = JSON.parse(formData.get('updates') as string);
        const sendApprovedMail = formData.get('sendApprovedMail') === 'true';

        try {
            // Process each update
            for (const { userID, newStatus } of updates) {
                // Update registration status
                const { error: updateError } = await supabaseAdmin
                    .from('RegistrationDB')
                    .update({ 
                        RegistrationStatus: newStatus,
                        ...(newStatus === 'approved' ? { approvedMailSent: sendApprovedMail } : {})
                    })
                    .eq('userID', userID);

                console.log(`Updating userID ${userID} to status ${newStatus} with sendApprovedMail=${sendApprovedMail}`);
                if (updateError) {
                    console.log(`Error updating userID ${userID}:`, updateError.message);
                    console.error('Update error:', updateError);
                    return { success: false, error: updateError.message };
                }


                console.log(`Successfully updated userID ${userID} to status ${newStatus}`);
                console.log(newStatus);
                console.log(`sendApprovedMail: ${sendApprovedMail}`);
                // If status changed to approved and sendApprovedMail is true, send email
                if (newStatus === 'approved' && sendApprovedMail) {
                    // Fetch the full registration details
                    const { data: registration, error: fetchError } = await supabaseAdmin
                        .from('RegistrationDB')
                        .select('*')
                        .eq('userID', userID)
                        .single();

                    if (fetchError || !registration) {
                        console.error('Error fetching registration:', fetchError);
                        continue;
                    }
                    console.log(`Fetched registration for userID ${userID}:`, registration);
                    console.log(`Registration status: ${registration.RegistrationStatus}`);
                    // Generate email HTML
                    const emailHtml = generateRegistrationApprovedEmailHtml({
                        Email: registration.Email,
                        FullName: registration.FullName,
                        WSDCID: registration.WSDCID,
                        Region: registration.Region,
                        Level: registration.Level,
                        PassOption: registration.PassOption,
                        AddedIntensive: registration.AddedIntensive,
                        Role: registration.Role,
                        userID: registration.userID,
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
                        PassPrice: registration.PassPrice,
                        IntensivePrice: registration.IntensivePrice,
                        BasePriceAtRegistration: registration.BasePriceAtRegistration
                    });

                    // Send the email
                    if (registration.Email) {
                        console.log(`Sending approval email to ${registration.Email}`);
                        const message = {
                            from: GOOGLE_EMAIL,
                            to: registration.Email,
                            subject: 'Registration Approved - Norwegian Open WCS 2025',
                            html: emailHtml
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
                        } catch (emailError) {
                            console.error('Failed to send approval email:', emailError);
                            // Continue with other updates even if email fails
                        }
                    }
                }
            }

            return {
                body: { 
                    success: true,
                    message: 'Updates completed successfully'
                }
            };
        } catch (error: any) {
            console.error('Update error:', error);
            return {
                body: {
                    success: false,
                    error: error.message || 'Unknown error occurred'
                }
            };
        }
    }
} satisfies Actions;