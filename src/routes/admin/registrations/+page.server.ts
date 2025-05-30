// src/routes/admin/registrations/+page.server.ts
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import type { PageServerLoad } from './$types';
import { error as SvelteKitError } from '@sveltejs/kit'; // To throw errors
import transporter from '$lib/emailClient.server';
import { GOOGLE_EMAIL } from '$env/static/private';
import { paymentInfo } from '$lib/components/constants';
import { colorPalette } from '$lib/components/constants';

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
    const backgroundImageUrl = 'https://raw.githubusercontent.com/Lysaker-git/NorwegianOpen/refs/heads/main/src/lib/components/backdropHero.png'; // Ensure this URL is correct and public


    const primaryColor = '#0A2342';

    const styles = {
        body: `font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: ${colorPalette.textColor}; background-color: ${colorPalette.backgroundColor}; margin: 0; padding: 20px 0;`,
        container: `max-width: 600px; margin: 20px auto; background-color: #fff; border: 1px solid ${colorPalette.borderColor}; border-radius: 5px; overflow: hidden;`,
        header: `background-color: ${colorPalette.primaryColor}; color: #fff; padding: 25px 20px; text-align: center;`,
        headerH1: `margin: 0; font-size: 28px; color: #fff; font-weight: bold;`,
        content: `padding: 25px 30px;`,
        h2: `color: ${colorPalette.primaryColor}; font-size: 22px; margin-top: 25px; margin-bottom: 15px; border-bottom: 1px solid ${colorPalette.borderColor}; padding-bottom: 8px; font-weight: bold;`,
        p: `margin-bottom: 16px; font-size: 15px; color: ${colorPalette.textColor};`,
        th: `text-align: left; padding: 10px 8px; border-bottom: 1px solid ${colorPalette.borderColor}; color: #555; font-weight: normal; width: 35%; font-size: 14px;`,
        td: `text-align: left; padding: 10px 8px; border-bottom: 1px solid ${colorPalette.borderColor}; color: ${colorPalette.textColor}; font-size: 14px; font-weight: bold;`,
        paymentBox: `margin: 25px 0; padding: 20px; border: 1px solid ${colorPalette.primaryColor}; border-radius: 4px; background-color: #F0F5FA;`,
        paymentH3: `font-size: 20px; color: ${colorPalette.primaryColor}; margin-top: 0; margin-bottom: 15px; text-align: center; font-weight: bold;`,
        paymentItem: `font-size: 15px; margin-bottom: 6px;`,
        paymentTotal: `font-weight: bold; color: ${colorPalette.primaryColor}; font-size: 17px; margin-top: 10px;`,
        footer: `text-align: center; padding: 20px; font-size: 12px; color: #dddddd; background-color: rgba(10, 35, 66, 0.75);`
    };

    const paymentDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const formatPrice = (price: number | null | undefined) => price !== null && price !== undefined ? `${price.toLocaleString()} ${currencySymbol}` : 'N/A';


    const vmlBackground = `
        <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
            <v:fill type="tile" src="${backgroundImageUrl}"/>
        </v:background>
        <![endif]-->
    `;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Registration Approved - ${eventName}</title>
    </head>
    <body style="${styles.body}">
        ${vmlBackground}
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
                    Please complete your payment to secure your spot. Payment information and your registration details are below.
                </p>
                <div style="${styles.paymentBox}">
                    <h3 style="${styles.paymentH3}">Payment Information</h3>
                    <div style="${styles.paymentItem}"><strong>Amount Due:</strong> <span style="${styles.paymentTotal}">${formatPrice(details.AmountDue)}</span></div>
                    <div style="${styles.paymentItem}"><strong>Payment Deadline:</strong> ${paymentDeadline}</div>
                    <div style="${styles.paymentItem}"><strong>Account Name:</strong> ${paymentInfo.accountName}</div>
                    <div style="${styles.paymentItem}"><strong>Account Number:</strong> ${paymentInfo.accountNumber}</div>
                    <div style="${styles.paymentItem}"><strong>IBAN:</strong> ${paymentInfo.iban}</div>
                    <div style="${styles.paymentItem}"><strong>SWIFT/BIC:</strong> ${paymentInfo.swift}</div>
                    <div style="${styles.paymentItem}"><strong>Bank Name:</strong> ${paymentInfo.bankName}</div>
                    <div style="${styles.paymentItem}"><strong>Bank Address:</strong> ${paymentInfo.bankAddress}</div>
                    <div style="font-size:18px; color:#555; margin-top:10px;">
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
                        style="display: inline-block; background-color: ${colorPalette.primaryColor}; color: #FFFFFF; 
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
                        style="display: inline-block; background-color: ${colorPalette.primaryColor}; color: #FFFFFF; 
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

            <div style="${styles.paymentBox.replace('#F0F5FA', '#0A2342')}">
                <h3 style="${styles.paymentH3.replace(primaryColor, '#FFD700')}">Your place in Valhalla is secured – prepare for glory!</h3>
                <div style="color: #fff; line-height: 1.6;">
                    <p style="margin-bottom: 12px;">
                        Thursday - Preparty:
                        <br>
                        The journey begins on Thor's day, where dancers from all Nine Worlds can come together and share the joy of West Coast Swing.
                    </p>
                    <p style="margin-bottom: 12px;">
			            Friday - Blues Intensive and Strictly Competition:
                        <br>
                        As Frigg’s day dawns, we dive into the mystic arts of blues with our master warriors of swing. 
			            When night falls, witness warriors of the dance as they battle it out and forge legendary bonds. 
                    </p>
                    <p style="margin-bottom: 12px;">
			            Saturday - Jack and Jill Competitions (Novice to All-star) and Pro Show:
                        <br>
                        As Saturn’s day rises, the great battles of the Jack & Jill tournaments begins. 
			            Warriors of WCS will face off and fight for precious WSDC points under the watchful eyes of the gods.
                    </p>                        
                    <p style="margin-bottom: 12px;">
			            Sunday - Newcomer Jack and Jill and Social Gathering:
                        <br>
                        On Sun’s day in Valhalla our newest warriors battle in the Newcomer Jack & Jill. Later, we have opportunities to connect through a social gathering. 
                    </p>
                    <p style="margin-bottom: 12px; font-style: italic;">
			            And like in the eternal battle, we dance until Heimdall sounds the dawn on moon's day. 
                    </p>
                    <p style="color: #FFD700; font-weight: bold; margin-top: 20px; text-align: center;">
                        🌿⚔️✨ Valhalla is calling! 🌿⚔️✨
                    </p>
                </div>
            </div>
                <div style="${styles.footer}">
                <p style="color:#FFFFFF">© ${new Date().getFullYear()} ${eventName}. All rights reserved.</p>
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