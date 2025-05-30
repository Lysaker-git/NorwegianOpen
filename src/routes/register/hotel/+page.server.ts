import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import transporter from '$lib/emailClient.server';
import { GOOGLE_EMAIL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import { paymentInfo } from '$lib/components/constants';


export const load: PageServerLoad = async () => {
    const { data: hotelRegistration, error } = await supabaseAdmin
        .from('HotelRegistration')
        .select('hoteloption');

    if (error) {
        console.error('Error fetching hotel options:', error);
        return { error: 'Failed to load hotel availability'};
    }

    const roomCounts = {
        total: hotelRegistration?.length || 0,
        largeRooms: hotelRegistration?.filter (reg => 
            reg.hoteloption === 'HotelOptionThree' || reg.hoteloption === 'HotelOptionFour'
        ).length || 0,
    }

    const availability = {
        hasRoomAvailable: roomCounts.total < 10,
        hasLargeRoomAvailable: roomCounts.largeRooms < 0,
    }
    console.log('[SERVER LOAD] Hotel Availability:', availability, roomCounts);

    return {
        availability,
        roomCounts
    };
}

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

    const backgroundImageUrl = 'https://raw.githubusercontent.com/Lysaker-git/NorwegianOpen/refs/heads/main/src/lib/components/backdropHero.png'; // Ensure this URL is correct and public


    const styles = {
        body: `font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: ${textColor}; background-color: ${backgroundColor}; margin: 0; padding: 20px 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-image: url('${backgroundImageUrl}'); background-repeat: no-repeat; background-position: center top; background-size: cover;`,
        container: `max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 5px;`,
        header: `background: #0A2342; color: #fff; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;`,
        content: `padding: 20px;`,
        paymentBox: `background: #f5f5f5; border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 4px;`,
        h2: `color: #0A2342; border-bottom: 2px solid #FFD700; padding-bottom: 10px;`,
        detail: `margin: 10px 0;`,
        highlight: `color: #0A2342; font-weight: bold;`,
        footer: `text-align: center; padding: 20px; color: #666; font-size: 14px;`
    };

    const vmlBackground = `
        <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
            <v:fill type="tile" src="${backgroundImageUrl}" color="${backgroundColor}" />
        </v:background>
        <![endif]-->
    `;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Hotel Booking Confirmation - ${eventName}</title>
    </head>
    <body style="${styles.body}">
        ${vmlBackground}
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
                    <div style="${styles.detail}"><span style="${styles.highlight}">Account Number:</span> ${paymentInfo.accountNumber}</div>
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
        const paymentDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const { data: hotelRegistrations } = await supabaseAdmin
            .from('HotelRegistration')
            .select('hoteloption');

        const totalRooms = hotelRegistrations?.length || 0;
        const largeRooms = hotelRegistrations?.filter(reg => 
            reg.hoteloption === 'HotelOptionThree' || 
            reg.hoteloption === 'HotelOptionFour'
        ).length || 0;

        // Check limits
        if (totalRooms >= 90) {
            return fail(400, { error: 'Sorry, all rooms are currently booked.' });
        }



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
            paymentdeadline: paymentDeadline,
            roommates: roommates,
            specialrequests: formData.get('SpecialRequests')?.toString() || null,
            amountdue: formData.get('CalculatedHotelPrice') ? Number(formData.get('CalculatedHotelPrice')) : null,
            numberofnights: formData.get('NumberOfNights')?.toString() || null,
        };

        if ((data.hoteloption === 'HotelOptionThree' || data.hoteloption === 'HotelOptionFour') && 
            largeRooms >= 70) {
            return fail(400, { 
                error: 'Sorry, all triple and quadro rooms are currently booked. Please select a different room type.' 
            });
        }

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