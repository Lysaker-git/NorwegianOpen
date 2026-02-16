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
        hasRoomAvailable: roomCounts.total < 90,
        hasLargeRoomAvailable: roomCounts.largeRooms < 70,
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
    const eventName = "Norwegian Open WCS 2026";
    const paymentDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const currencySymbol = "NOK";
    const textColor = '#333333';    // Main text
    const lightTextColor = '#555555';// Lighter text for less emphasis
    const backgroundColor = '#f4f4f7';// Light grey page background


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
            <v:fill type="tile" src="${backgroundImageUrl}"/>
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
        console.log('[SERVER]', 'Starting hotel booking process');
        try {
            const formData = await request.formData();
            const paymentDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            console.log('[SERVER]', 'Form data received');

            // Validate required fields
            const requiredFields = ['FullName', 'Email', 'HotelOption', 'CheckInDate', 'CheckOutDate', 'NumberOfNights'];
            for (const field of requiredFields) {
                if (!formData.get(field)) {
                     return fail(400, { 
                        error: `Missing required field: ${field}`,
                        field: field.toLowerCase()
                    });
                }
            }

            // Check hotel availability
            const { data: hotelRegistrations, error: fetchError } = await supabaseAdmin
                .from('HotelRegistration')
                .select('hoteloption');

            if (fetchError) {
                console.error('Error fetching hotel registrations:', fetchError);
                return fail(500, { error: 'Failed to check hotel availability. Please try again.' });
            }

            const totalRooms = hotelRegistrations?.length || 0;
            const largeRooms = hotelRegistrations?.filter(reg => 
                reg.hoteloption === 'HotelOptionThree' || 
                reg.hoteloption === 'HotelOptionFour'
            ).length || 0;

            // Check room limits
            if (totalRooms >= 90) {
                return fail(400, { error: 'Sorry, all rooms are currently booked.' });
            }

            // Gather and validate roommate fields based on room type
            const hotelOption = formData.get('HotelOption')?.toString();
            const roommates = [];
            
            if (hotelOption === 'HotelOptionTwo') {
                if (!formData.get('Roommate1')) {
                    return fail(400, { error: 'Twin room requires one roommate name', field: 'roommate1' });
                }
                roommates.push(formData.get('Roommate1'));
            } else if (hotelOption === 'HotelOptionThree') {
                if (!formData.get('Roommate1') || !formData.get('Roommate2')) {
                    return fail(400, { error: 'Triple room requires two roommate names', field: 'roommate' });
                }
                roommates.push(formData.get('Roommate1'), formData.get('Roommate2'));
            } else if (hotelOption === 'HotelOptionFour') {
                if (!formData.get('Roommate1') || !formData.get('Roommate2') || !formData.get('Roommate3')) {
                    console.log('[SERVER]', formData.get('Roommate1'), formData.get('Roommate2'), formData.get('Roommate3'));
                    return fail(400, { error: 'Quatro room requires three roommate names', field: 'roommate' });
                }
                roommates.push(formData.get('Roommate1'), formData.get('Roommate2'), formData.get('Roommate3'));
            }

            // Prepare data for database
            const data = {
                fullname: formData.get('FullName')?.toString() || null,
                email: formData.get('Email')?.toString() || null,
                hoteloption: hotelOption || null,
                checkindate: formData.get('CheckInDate')?.toString() || null,
                checkoutdate: formData.get('CheckOutDate')?.toString() || null,
                paymentdeadline: paymentDeadline,
                roommates: roommates.filter(Boolean).join(', '),
                specialrequests: formData.get('SpecialRequests')?.toString() || null,
                amountdue: formData.get('CalculatedHotelPrice') ? Number(formData.get('CalculatedHotelPrice')) : null,
                numberofnights: formData.get('NumberOfNights')?.toString() || null,
            };

            // Check large room availability
            if ((data.hoteloption === 'HotelOptionThree' || data.hoteloption === 'HotelOptionFour') && 
                largeRooms >= 70) {
                return fail(400, { 
                    error: 'Sorry, all triple and quadro rooms are currently booked. Please select a different room type.' 
                });
            }            // Insert into Supabase
            console.log('[SERVER]', 'Attempting database insert');
            const { error: insertError } = await supabaseAdmin
                .from('HotelRegistration')
                .insert([data]);

            if (insertError) {
                console.error('[SERVER]', 'Database insert error:', insertError);
                return fail(400, { error: insertError.message });
            }
            console.log('[SERVER]', 'Database insert successful');
            
            // Send confirmation email            console.log('[SERVER]', 'Starting email process');
            let emailSuccess = true;
            
            if (!data.email) {
                console.error('[SERVER]', 'Missing email address for confirmation');
                emailSuccess = false;
            } else {
                console.log('[SERVER]', 'Preparing email message');
                const message = {
                    from: GOOGLE_EMAIL,
                    to: data.email,
                    subject: 'Hotel Booking Confirmation - Norwegian Open WCS 2026',
                    html: generateHotelConfirmationEmail(data)
                } as const;                try {
                    console.log('[SERVER]', 'Attempting to send email');
                    await new Promise((resolve, reject) => {
                        transporter.sendMail(message, (err, info) => {
                            if (err) {
                                console.error('[SERVER]', 'Email sending error:', err);
                                reject(err);
                            } else {
                                console.log('[SERVER]', 'Email sent successfully');
                                resolve(info);
                            }
                        });
                    });
                } catch (emailError) {
                    console.error('[SERVER]', 'Failed to send confirmation email:', emailError);
                    emailSuccess = false;
                }
            }

            console.log('[SERVER]', 'All operations complete, preparing redirect');            
            const redirectUrl = emailSuccess ? 
                `${url.origin}/register/success` : 
                `${url.origin}/register/success?email=failed`;
            console.log('[SERVER]', 'Redirecting to:', redirectUrl);
            throw redirect(303, redirectUrl);        } catch (error) {
            // Check if the error is a Redirect object (it has status and location properties)
            if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
                console.log('[SERVER]', 'Handling redirect response');
                throw error; // Re-throw redirect response
            }

            // Handle all other errors
            console.error('[SERVER]', 'Unexpected error in bookHotel:', error);
            return fail(500, { 
                error: 'An unexpected error occurred. Please try again or contact support.' 
            });
        }
    }
};