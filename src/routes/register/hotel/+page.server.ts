import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import transporter from '$lib/emailClient.server';
import { GOOGLE_EMAIL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

// Add this after your imports
interface HotelEmailDetails {
    fullname: string | null;
    email: string | null;
    hoteloption: string | null;
    checkindate: string | null;
    checkoutdate: string | null;
    roommates: string;
    specialrequests: string | null;
    amountdue: number | null;
    numberofnights: string | null;
}

function getHotelDisplayName(key: string | null): string {
    if (!key) return 'Unknown Hotel Option';

    switch(key) {
        case 'HotelOptionOne': return 'Single Room';
        case 'HotelOptionTwo': return 'Twin Room';
        case 'HotelOptionThree': return 'Triple Room';
        case 'HotelOptionFour': return 'Quatro Room';
        default: return key;
    }
}

interface EmailMessage {
    from: string;
    to: string | null;
    subject: string;
    html: string;
}

function generateHotelConfirmationEmail(details: HotelEmailDetails): string {
    const eventName = "Norwegian Open WCS 2025";
    const paymentDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const currencySymbol = "NOK";
    const paymentInfo = {
        accountName: "Norwegian Open WCS",
        iban: "NO74 4910 2039 490",
        swift: "SNOWNO22",
        bankName: "Sparebank 1 NordNorge",
        bankAddress: "Storgata 65, 9008 Tromsø, Norway"
    };

    const styles = {
        body: `font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;`,
        container: `max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 5px;`,
        header: `background: #0A2342; color: #fff; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;`,
        content: `padding: 20px;`,
        paymentBox: `background: #f5f5f5; border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 4px;`,
        h2: `color: #0A2342; border-bottom: 2px solid #FFD700; padding-bottom: 10px;`,
        detail: `margin: 10px 0;`,
        highlight: `color: #0A2342; font-weight: bold;`,
        footer: `text-align: center; padding: 20px; color: #666; font-size: 14px;`
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Hotel Booking Confirmation - ${eventName}</title>
    </head>
    <body style="${styles.body}">
        <div style="${styles.container}">
            <div style="${styles.header}">
                <h1>Hotel Booking Confirmation</h1>
                <div>${eventName}</div>
            </div>
            
            <div style="${styles.content}">
                <h2 style="${styles.h2}">Booking Details</h2>
                <div style="${styles.detail}"><span style="${styles.highlight}">Guest Name:</span> ${details.fullname}</div>
                <div style="${styles.detail}"><span style="${styles.highlight}">Hotel Option:</span> ${getHotelDisplayName(details.hoteloption)}</div>
                <div style="${styles.detail}"><span style="${styles.highlight}">Check-in:</span> ${details.checkindate}</div>
                <div style="${styles.detail}"><span style="${styles.highlight}">Check-out:</span> ${details.checkoutdate}</div>
                <div style="${styles.detail}"><span style="${styles.highlight}">Number of Nights:</span> ${details.numberofnights}</div>
                ${details.roommates ? `<div style="${styles.detail}"><span style="${styles.highlight}">Roommates:</span> ${details.roommates}</div>` : ''}
                ${details.specialrequests ? `<div style="${styles.detail}"><span style="${styles.highlight}">Special Requests:</span> ${details.specialrequests}</div>` : ''}

                <div style="${styles.paymentBox}">
                    <h3 style="${styles.h2}">Payment Information</h3>
                    <div style="${styles.detail}"><span style="${styles.highlight}">Amount Due:</span> ${details.amountdue} NOK</div>
                    <div style="${styles.detail}"><span style="${styles.highlight}">Payment Deadline:</span> ${paymentDeadline}</div>
                    <div style="${styles.detail}"><span style="${styles.highlight}">Account Name:</span> ${paymentInfo.accountName}</div>
                    <div style="${styles.detail}"><span style="${styles.highlight}">IBAN:</span> ${paymentInfo.iban}</div>
                    <div style="${styles.detail}"><span style="${styles.highlight}">SWIFT/BIC:</span> ${paymentInfo.swift}</div>
                    <div style="${styles.detail}"><span style="${styles.highlight}">Bank Name:</span> ${paymentInfo.bankName}</div>
                    <div style="${styles.detail}"><span style="${styles.highlight}">Bank Address:</span> ${paymentInfo.bankAddress}</div>
                    <p style="margin-top: 15px; font-size: 14px; color: #666;">
                        Please include your <strong>name</strong> and <strong>"NOWHOTEL"</strong> in the payment reference.
                    </p>
                </div>

                <p>If you have any questions about your booking, please don't hesitate to contact us.</p>
            </div>

            <div style="${styles.footer}">
                <p>© ${new Date().getFullYear()} ${eventName}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export const actions: Actions = {
    bookHotel: async ({ request, url }) => {
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
            fullname: formData.get('FullName')?.toString() || null,
            email: formData.get('Email')?.toString() || null,
            hoteloption: formData.get('HotelOption')?.toString() || null,
            checkindate: formData.get('CheckInDate')?.toString() || null,
            checkoutdate: formData.get('CheckOutDate')?.toString() || null,
            roommates: roommates,
            specialrequests: formData.get('SpecialRequests')?.toString() || null,
            amountdue: formData.get('CalculatedHotelPrice') ? Number(formData.get('CalculatedHotelPrice')) : null,
            numberofnights: formData.get('NumberOfNights')?.toString() || null,
        };

        // Insert into Supabase
        const { error } = await supabaseAdmin
            .from('HotelRegistration')
            .insert([data]);

        if (error) {
            return fail(400, { error: error.message });
        }

        // Send confirmation email
        const message = {
            from: GOOGLE_EMAIL,
            to: data.email,
            subject: 'Hotel Booking Confirmation - Norwegian Open WCS 2025',
            html: generateHotelConfirmationEmail(data)
        }

        const sendMail = async (message) =>  {
            return new Promise((resolve, reject) => {
                transporter.sendMail(message, (err, info) => {
                    if (err) {
                        console.error('Email error:', err);
                        reject(err);
                    } else {
                        resolve(info);
                    }
                })
            })
        }

        await sendMail(message);
        throw redirect(303, `${url.origin}/register/success`);
    }
};

export const load: PageServerLoad = async () => {
    return {};
};