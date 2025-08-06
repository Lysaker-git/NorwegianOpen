// src/routes/register/+page.server.ts

import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { GOOGLE_EMAIL } from '$env/static/private';
import transporter from '$lib/emailClient.server';

// --- Define Deadlines, Base Prices, Pass Options SERVER-SIDE ---
// (Your existing constants and helper functions remain the same)
const YMIR_DEADLINE_STRING_SERVER = '2025-05-29';
const MIDGARD_DEADLINE_STRING_SERVER = '2025-08-22';

const ymirDeadlineServer = new Date(YMIR_DEADLINE_STRING_SERVER + 'T23:59:59');
const midgardDeadlineServer = new Date(MIDGARD_DEADLINE_STRING_SERVER + 'T23:59:59');

const serverBasePrices = {
    Ymir: { Nordic: 1800, World: 1500 },
    Midgard: { Nordic: 2000, World: 1700 },
    Ragnarok: { Nordic: 2200, World: 1900 }
};

const serverPassOptionsByLevel = {
    'All-Star': ['Full Pass', 'Judge (Free Pass)', 'Party Pass'],
    'Advanced': ['Full Pass', 'Judge (20% Discount)', 'Party Pass'],
    'Other': ['Full Pass', 'Zero to Hero', 'Party Pass']
};

const SERVER_ZERO_TO_HERO = 1300;
const SERVER_INTENSIVE_PRICE = 1000;
const SERVER_PARTY_PASS = 1200;

// --- Helper Functions (No changes needed in these for this feature) ---
function getCurrentTierServer(): 'Ymir' | 'Midgard' | 'Ragnarok' {
    const todayServer = new Date();
    if (todayServer <= ymirDeadlineServer) return 'Ymir';
    if (todayServer <= midgardDeadlineServer) return 'Midgard';
    return 'Ragnarok';
}

function getBasePriceServer(tier: 'Ymir' | 'Midgard' | 'Ragnarok', region: 'Nordic' | 'World' | null): number | null {
    if (!region) return null;
    const tierPrices = serverBasePrices[tier];
    if (tierPrices && (region === 'Nordic' || region === 'World')) {
        return tierPrices[region];
    }
    return null;
}

function getLevelCategoryServer(level: string | null): 'All-Star' | 'Advanced' | 'Other' | null {
    if (!level) return null;
    if (level === 'All-Star') return 'All-Star';
    if (level === 'Advanced') return 'Advanced';
    if (['Intermediate', 'Novice', 'Newcomer'].includes(level)) return 'Other';
    return null;
}

function isValidPassOptionForLevelServer(level: string | null, passOption: string | null): boolean {
    if (!level || !passOption) return false;
    if (passOption === 'Zero to Hero') return true;
    const category = getLevelCategoryServer(level);
    if (!category) return false;
    const validOptionsForCategory = serverPassOptionsByLevel[category];
    if (!validOptionsForCategory) return false;
    return validOptionsForCategory.includes(passOption);
}

function calculatePassPriceServer(basePrice: number, level: string | null, passOption: string | null): number | null {
    if (passOption === null || level === null) return null;
    switch (passOption) {
        case 'Full Pass':
            return basePrice;
        case 'Judge (Free Pass)':
            return (getLevelCategoryServer(level) === 'All-Star') ? 0 : null;
        case 'Judge (20% Discount)':
            return (getLevelCategoryServer(level) === 'Advanced') ? Math.round(basePrice * 0.80) : null;
        case 'Zero to Hero':
            return SERVER_ZERO_TO_HERO;
        case 'Party Pass':
            return SERVER_PARTY_PASS;
        default:
            return null;
    }
}

function calculatePaymentDeadline(): string {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    return futureDate.toISOString().split('T')[0];
}

function formDataToPOJO(formData: FormData) {
    const object: Record<string, any> = {};
    formData.forEach((value, key) => {
        if (!object.hasOwnProperty(key)) {
            object[key] = value;
        } else {
            if (!Array.isArray(object[key])) {
                object[key] = [object[key]];
            }
            object[key].push(value);
        }
    });
    return object;
}

// Define your possible registration statuses
type RegistrationStatusType = 'pendingApproval' | 'waitingList' | 'approved' | 'paymentReceived' | 'checkedIn';


// --- actions ---
export const actions: Actions = {
    register: async ({ request, url }) => {
        const formData = await request.formData();
        const formValues = formDataToPOJO(formData);

        const USER_ID_LENGTH = 6;
        const MAX_GENERATION_ATTEMPTS = 10; // To prevent infinite loops in unlikely scenarios
        
        /**
         * Generates a random alphanumeric string of a given length.
         * @param length The desired length of the string.
         * @returns A random alphanumeric string.
         */
        function generateRandomString(length: number): string {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }      
        
        /**
         * Checks if a given userID already exists in the Supabase RegistrationDB table.
         * @param userID The userID to check.
         * @param dbColumnName The name of the column in Supabase storing the userID (e.g., 'userID' or 'user_id').
         * @returns True if the userID exists, false otherwise.
         */
        async function checkIfUserIDExists(userID: string, dbColumnName: string = 'userID'): Promise<boolean> {
            try {
                const { data, error, count } = await supabaseAdmin
                    .from('RegistrationDB') // Your table name
                    .select(dbColumnName, { count: 'exact', head: true }) // Only fetch count, not the data
                    .eq(dbColumnName, userID); // Check for exact match

                if (error) {
                    console.error('Supabase error checking userID existence:', error);
                    // Consider this as "possibly exists" to be safe, or throw the error
                    // depending on how critical perfect uniqueness is vs. failing registration.
                    // For now, let's assume it might exist to trigger a regeneration.
                    return true;
                }
                return count !== null && count > 0;
            } catch (e) {
                console.error('Exception while checking userID existence:', e);
                return true; // Assume exists on unexpected error to be safe
            }
        }


        /**
         * Generates a unique 6-character alphanumeric userID.
         * It checks against the Supabase database to ensure uniqueness.
         * @param dbColumnName The name of the column in Supabase storing the userID (e.g., 'userID' or 'user_id').
         * @returns A unique userID string, or null if a unique ID couldn't be generated after several attempts.
         */
        async function generateUniqueUserID(dbColumnName: string = 'userID'): Promise<string | null> {
            let newUserID: string;
            let isUnique = false;
            let attempts = 0;

            do {
                newUserID = generateRandomString(USER_ID_LENGTH);
                isUnique = !(await checkIfUserIDExists(newUserID, dbColumnName));
                attempts++;
                if (attempts >= MAX_GENERATION_ATTEMPTS && !isUnique) {
                    console.warn(`Failed to generate a unique userID after ${MAX_GENERATION_ATTEMPTS} attempts.`);
                    return null; // Could not generate a unique ID
                }
            } while (!isUnique);

            return newUserID;
        }

        // --- Get Data ---
        const email = formData.get('Email') as string | null;
        const fullName = formData.get('FullName') as string | null;
        const wsdcId = formData.get('WSDCID') as string | null;
        const region = formData.get('Region') as 'Nordic' | 'World' | null;
        const level = formData.get('Level') as string | null;
        const passOption = formData.get('PassOption') as string | null;
        const addIntensiveServer = formData.get('AddIntensive') === 'on';
        const role = formData.get('Role') as string | null;
        const country = formData.get('Country') as string | null;
        const promoCode = formData.get('Promo') as string | null;
        const competing = formData.get('Competing') === 'on';

        const hasPartner = formData.get('HasPartner') === 'on'; // This is crucial for the new logic
        const partnerName = formData.get('PartnerName') as string | null;
        const partnerEmail = formData.get('PartnerEmail') as string | null;

        const acceptedRules = formData.get('AcceptedRules') === 'on';
        const acceptedToC = formData.get('AcceptedToC') === 'on';

        // --- Server-Side Validation (No changes here for this feature) ---
        const errors: Record<string, string> = {};
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.Email = 'A valid email is required.';
        if (!fullName || fullName.trim() === '') errors.FullName = 'Full name is required.';
        if (!region) errors.Region = 'Region selection is required.';
        if (!level) errors.Level = 'Level selection is required.';
        if (!passOption) errors.PassOption = 'Pass Option selection is required.';
        if (!role) errors.Role = 'Role selection is required.';
        if (!country || country.trim() === '') errors.Country = 'Country is required.';
        if (!acceptedRules || !acceptedToC) errors.Terms = 'You must accept the rules and terms.';
        if (hasPartner) {
            if (!partnerName || partnerName.trim() === '') errors.PartnerName = "Partner's name is required.";
            if (!partnerEmail || !/^\S+@\S+\.\S+$/.test(partnerEmail)) errors.PartnerEmail = "A valid partner's email is required.";
        }

        if (Object.keys(errors).length > 0) {
            const firstErrorField = Object.keys(errors)[0];
            return fail(400, { data: formValues, field: firstErrorField, error: errors[firstErrorField], errors });
        }

        if (!isValidPassOptionForLevelServer(level, passOption)) {
            return fail(400, { data: formValues, field: 'PassOption', error: `Selected pass option '${passOption}' is not valid for level '${level}'.`, errors });
        }

        // --- Calculate Price and Deadline (No changes here for this feature) ---
        const currentTierServer = getCurrentTierServer();
        let basePriceNumServer: number | null = null;
        if (passOption === 'Full Pass' || passOption === 'Judge (20% Discount)') {
            basePriceNumServer = getBasePriceServer(currentTierServer, region);
            if (basePriceNumServer === null) {
                console.error("Server Error: Could not determine base price for selected pass option.", { currentTierServer, region, passOption });
                return fail(500, { data: formValues, error: 'Server error: Could not determine base price.', errors });
            }
        } else if (passOption === 'Judge (Free Pass)') {
            basePriceNumServer = getBasePriceServer(currentTierServer, region) || 0;
        } else {
            basePriceNumServer = getBasePriceServer(currentTierServer, region);
        }
        const calculatedPassPriceServer = calculatePassPriceServer(basePriceNumServer || 0, level, passOption);
        if (calculatedPassPriceServer === null) {
            console.error("Server Error: Could not calculate pass price.", { basePriceNumServer, level, passOption });
            return fail(500, { data: formValues, error: 'Server error: Could not calculate pass price for your selection.', errors });
        }
        const intensiveCostServer = addIntensiveServer ? SERVER_INTENSIVE_PRICE : 0;
        const finalAmountDueServer = calculatedPassPriceServer + intensiveCostServer;
        const paymentDeadlineString = calculatePaymentDeadline();
        const uniqueUserID = await generateUniqueUserID('userID');
        if (!uniqueUserID) {
            // Handle the rare case where a unique ID couldn't be generated
            console.error("CRITICAL: Could not generate a unique userID for registration.");
            return fail(500, { data: formValues, error: 'Server error: Could not generate a unique user identifier. Please try again.' });
            // Removed `errors` from here as it's a general server error, not specific field errors.
            // If you want to pass back `errors` from earlier validation, you can:
            // return fail(500, { data: formValues, error: '...', errors });
        }


        // --- Determine Registration Status ---
        let registrationStatus: RegistrationStatusType;
        if (hasPartner) {
            registrationStatus = 'pendingApproval';
        } else {
            registrationStatus = 'waitingList';
        }

        // --- Prepare Data for Supabase ---
        const registrationData = {
            Email: email,
            FullName: fullName,
            WSDCID: wsdcId || null,
            Region: region,
            Level: level,
            PassOption: passOption,
            AddedIntensive: addIntensiveServer,
            Role: role,
            Country: country,
            PromoCode: promoCode || null,
            Competing: competing,
            HasPartner: hasPartner,
            PartnerName: hasPartner ? partnerName : null,
            PartnerEmail: hasPartner ? partnerEmail : null,
            AcceptedRules: acceptedRules,
            AcceptedToC: acceptedToC,
            AmountDue: finalAmountDueServer,
            PaymentDeadline: paymentDeadlineString,
            PriceTier: currentTierServer,
            BasePriceAtRegistration: basePriceNumServer,
            userID: uniqueUserID, // Consider dynamic userID
            RegistrationStatus: registrationStatus // <--- ADDED NEW FIELD
        };

        // --- Insert into Supabase ---
        const { data: insertedData, error: dbError } = await supabaseAdmin
            .from('RegistrationDB')
            .insert([registrationData])
            .select()
            .maybeSingle();

        // --- Handle Response ---
        if (dbError) {
            console.error("Supabase Admin Insert Error:", dbError);
            if (dbError.code === '23505') {
                 return fail(409, { data: formValues, field: 'Email', error: 'This email address is already registered.', errors });
            }
            return fail(500, { data: formValues, error: `Database error: ${dbError.message}`, errors });
        }

        if (!insertedData) {
            console.error("Supabase Admin Insert Error: No data returned after insert.");
            return fail(500, { data: formValues, error: 'Database error: Failed to confirm registration.', errors });
        }

    // Add this function within your src/routes/register/+page.server.ts
    // (You can place it above or below your existing helper functions)

    interface RegistrationDetailsForEmail {
        Email: string | null;
        FullName: string | null;
        WSDCID?: string | null; // Optional
        Region: 'Nordic' | 'World' | null;
        Level: string | null;
        PassOption: string | null;
        AddedIntensive: boolean;
        Role: string | null;
        Country: string | null;
        Competing?: boolean; // Optional, depending if you always collect it
        HasPartner: boolean;
        PromoCode?: string | null;
        PartnerName?: string | null; // Optional
        PartnerEmail?: string | null; // Optional
        AmountDue: number;
        PaymentDeadline: string; // YYYY-MM-DD format
        PriceTier: 'Ymir' | 'Midgard' | 'Ragnarok';
        RegistrationStatus: 'pendingApproval' | 'waitingList' | 'approved' | 'paymentReceived' | 'checkedIn'; // Or your RegistrationStatusType
        PassPrice: number | null;
        IntensivePrice?: number | null;
        BasePriceAtRegistration?: number | null;
        // Add any other fields you want to display
    }


    function generateRegistrationReceivedEmailHtml(details: RegistrationDetailsForEmail): string {
        const eventName = "Norwegian Open WCS 2025";
        const currencySymbol = "NOK";
        const backgroundImageUrl = 'https://raw.githubusercontent.com/Lysaker-git/NorwegianOpen/refs/heads/main/src/lib/components/backdropHero.png'; // Ensure this URL is correct and public
    
        // --- Updated Color Palette ---
        const primaryColor = '#0A2342'; // Dark Blue (Brand Color)
        const accentColor = '#FFD700';  // Gold (Brand Accent)
        const textColor = '#333333';    // Main text
        const lightTextColor = '#555555';// Lighter text for less emphasis
        const backgroundColor = '#f4f4f7';// Light grey page background
        const containerBackgroundColorRgba = 'rgba(255, 255, 255, 0.92)'; // Slightly more opaque white for content
        const containerSolidBgForOutlook = '#FFFFFF'; // Solid white for Outlook
        const borderColor = '#ddddde';   // Borders
        const summaryBoxBgRgba = 'rgba(240, 245, 250, 0.9)'; // Lighter blueish, slightly transparent for summary
        const summaryBoxSolidBg = '#F0F5FA'; // Solid for Outlook summary
        const statusHighlightColor = '#D9534F'; // Reddish for status (kept for emphasis)
        const successColor = '#28a745';      // Green for success messages
    
        const styles = {
            body: `font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: ${textColor}; background-color: ${backgroundColor}; margin: 0; padding: 20px 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-image: url('${backgroundImageUrl}'); background-repeat: no-repeat; background-position: center top; background-size: cover;`,
            container: `max-width: 600px; margin: 20px auto; padding: 0; background-color: ${containerBackgroundColorRgba}; border: 1px solid ${borderColor}; border-radius: 5px; overflow: hidden;`,
            containerSolidBgForOutlook: `background-color: ${containerSolidBgForOutlook};`,
            header: `background-color: ${primaryColor}; color: #ffffff; padding: 25px 20px; text-align: center;`,
            headerH1: `margin: 0; font-size: 28px; color: #ffffff; font-weight: bold;`,
            content: `padding: 25px 30px;`,
            h2: `color: ${primaryColor}; font-size: 22px; margin-top: 25px; margin-bottom: 15px; border-bottom: 1px solid ${borderColor}; padding-bottom: 8px; font-weight: bold;`,
            p: `margin-bottom: 16px; font-size: 15px; color: ${textColor};`, // Explicitly set p color
            strong: `color: ${primaryColor}; font-weight: bold;`,
            highlight: `color: ${statusHighlightColor}; font-weight: bold;`, // Status highlight
            detailsTable: `width: 100%; border-collapse: collapse; margin-bottom: 20px;`,
            th: `text-align: left; padding: 10px 8px; border-bottom: 1px solid ${borderColor}; color: ${lightTextColor}; font-weight: normal; vertical-align: top; width: 35%; font-size: 14px;`,
            td: `text-align: left; padding: 10px 8px; border-bottom: 1px solid ${borderColor}; color: ${textColor}; vertical-align: top; font-size: 14px; font-weight: bold;`, // Main text color for td
            summaryBox: `margin: 25px 0; padding: 20px; border: 1px solid ${primaryColor}; border-radius: 4px; background-color: ${summaryBoxBgRgba};`,
            summaryBoxSolidBgForOutlook: `background-color: ${summaryBoxSolidBg};`, // Solid for Outlook summary
            summaryH3: `font-size: 20px; color: ${primaryColor}; margin-top: 0; margin-bottom: 15px; text-align: center; font-weight: bold;`,
            summaryItem: `display: flex; justify-content: space-between; padding: 6px 0; font-size: 15px;`,
            summaryItemLabel: `color: ${textColor};`,
            summaryItemValue: `font-weight: bold; color: ${primaryColor};`,
            summaryTotal: `display: flex; justify-content: space-between; padding: 10px 0; font-size: 17px; border-top: 1px solid ${primaryColor}; margin-top: 10px;`,
            summaryTotalLabel: `font-weight: bold; color: ${primaryColor};`,
            summaryTotalValue: `font-weight: bold; color: ${statusHighlightColor};`, // Total price can also use statusHighlightColor or primaryColor
            summaryContext: `font-size: 13px; text-align: center; color: ${lightTextColor}; margin-top: 8px;`,
            footer: `text-align: center; padding: 20px; font-size: 12px; color: #dddddd; background-color: rgba(10, 35, 66, 0.75);`, // primaryColor with alpha for footer bg
            footerLink: `color: ${accentColor}; text-decoration: none;`
        };
    
        const formatBoolean = (value: boolean | undefined) => (value === undefined ? 'N/A' : value ? 'Yes' : 'No');
        const formatPrice = (price: number | null | undefined) => price !== null && price !== undefined ? `${price.toLocaleString()} ${currencySymbol}` : 'N/A';
    
        let orderSummaryHtml = '';
        if (details.PassPrice !== null && details.PassOption) {
            orderSummaryHtml += `
                <div style="${styles.summaryItem}">
                    <span style="${styles.summaryItemLabel}">${details.PassOption}: </span>
                    <span style="${styles.summaryItemValue}">${formatPrice(details.PassPrice)}</span>
                </div>
            `;
            if (details.AddedIntensive && details.IntensivePrice !== undefined) {
                orderSummaryHtml += `
                    <div style="${styles.summaryItem}">
                        <span style="${styles.summaryItemLabel}">Intensive Workshop: </span>
                        <span style="${styles.summaryItemValue}">${formatPrice(details.IntensivePrice)}</span>
                    </div>
                `;
            }
            orderSummaryHtml += `
                <div style="${styles.summaryTotal}">
                    <span style="${styles.summaryTotalLabel}">Total Price: </span>
                    <span style="${styles.summaryTotalValue}">${formatPrice(details.AmountDue)}</span>
                </div>
            `;
    
            let contextInfo = '';
            if (!details.PassOption.toLowerCase().includes('party')) {
                contextInfo += `(Pricing Tier: ${details.PriceTier})`;
            }
            if (details.PassOption.includes('Discount') && details.BasePriceAtRegistration) {
                contextInfo += ` (Base: ${formatPrice(details.BasePriceAtRegistration)}, 20% off)`;
            } else if (details.PassOption.includes('Free') && details.BasePriceAtRegistration) {
                contextInfo += ` (Base: ${formatPrice(details.BasePriceAtRegistration)}, Free for Judging)`;
            }
            if (contextInfo) {
                orderSummaryHtml += `<div style="${styles.summaryContext}">${contextInfo}</div>`;
            }
        }
        
        // VML for Outlook background (remains the same)
        const vmlBackground = `
            <!--[if gte mso 9]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                <v:fill type="tile" src="${backgroundImageUrl}" color="${backgroundColor}" />
            </v:background>
            <![endif]-->
        `;
    
        const htmlBody = `
        <!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="x-apple-disable-message-reformatting">
            <title>Registration Received - ${eventName}</title>
            <!--[if mso]>
            <style>
                table, td, th, div, p, h1, h2, h3 {font-family: Arial, sans-serif !important;}
                .container-outlook-bg { ${styles.containerSolidBgForOutlook} }
                .summaryBox-outlook-bg { ${styles.summaryBoxSolidBgForOutlook} }
            </style>
            <![endif]-->
        </head>
        <body style="${styles.body}">
            ${vmlBackground}
            <center style="width: 100%; background-color: transparent;">
                <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
                <tr>
                <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                <![endif]-->
                <div style="${styles.container}" class="container-outlook-bg">
                    <div style="${styles.header}">
                        <h1 style="${styles.headerH1}">${eventName}</h1>
                    </div>
                    <div style="${styles.content}">
                        <h2 style="${styles.h2.replace('margin-top: 25px;', 'margin-top: 0;')}">Welcome, ${details.FullName || 'Dancer'}!</h2>
                        <p style="${styles.p}">Thank you for registering for the ${eventName}! We're thrilled to have you join us.</p>
                        
                        <p style="${styles.p}">Your registration has been <strong style="color: ${successColor};">successfully received</strong>.</p>
                        <p style="${styles.p}">
                            <strong>Current Status:</strong> <span style="${styles.highlight}">${details.RegistrationStatus === 'pendingApproval' ? 'Pending Approval' : 'On Waiting List (Awaiting Spot Confirmation)'}</span>.
                        </p>
                        <p style="${styles.p}">
                            ${details.RegistrationStatus === 'pendingApproval' ? 
                                'If you registered with a partner, we will process your registration once your partner also registers and confirms you, or after our manual review. You will receive another email once your registration is fully approved and payment details are provided.' :
                                'You have been placed on the waiting list. We will notify you as soon as a spot becomes available. You will then receive an email with payment details.'
                            }
                        </p>
        
                        ${orderSummaryHtml ? `
                            <div style="${styles.summaryBox}" class="summaryBox-outlook-bg">
                                <h3 style="${styles.summaryH3}">Order Summary</h3>
                                ${orderSummaryHtml}
                            </div>
                        ` : ''}
        
                        <h2 style="${styles.h2}">Your Registration Details:</h2>
                        <table style="${styles.detailsTable}" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr><th style="${styles.th}">Full Name:</th><td style="${styles.td}">${details.FullName || 'N/A'}</td></tr>
                            <tr><th style="${styles.th}">Email:</th><td style="${styles.td}">${details.Email || 'N/A'}</td></tr>
                            ${details.WSDCID ? `<tr><th style="${styles.th}">WSDC ID:</th><td style="${styles.td}">${details.WSDCID}</td></tr>` : ''}
                            <tr><th style="${styles.th}">Region:</th><td style="${styles.td}">${details.Region || 'N/A'}</td></tr>
                            <tr><th style="${styles.th}">Level:</th><td style="${styles.td}">${details.Level || 'N/A'}</td></tr>
                            <tr><th style="${styles.th}">Pass Option:</th><td style="${styles.td}">${details.PassOption || 'N/A'}</td></tr>
                            <tr><th style="${styles.th}">Role:</th><td style="${styles.td}">${details.Role || 'N/A'}</td></tr>
                            <tr><th style="${styles.th}">Country:</th><td style="${styles.td}">${details.Country || 'N/A'}</td></tr>
                            ${details.PromoCode ? `<tr><th style="${styles.th}">Promo Code:</th><td style="${styles.td}">${details.PromoCode}</td></tr>` : ''}
                            <tr><th style="${styles.th}">Competing:</th><td style="${styles.td}">${formatBoolean(details.Competing)}</td></tr>
                            ${details.HasPartner && details.PartnerName ? `<tr><th style="${styles.th}">Partner's Name:</th><td style="${styles.td}">${details.PartnerName}</td></tr>` : ''}
                            ${details.HasPartner && details.PartnerEmail ? `<tr><th style="${styles.th}">Partner's Email:</th><td style="${styles.td}">${details.PartnerEmail}</td></tr>` : ''}
                        </table>
        
                        <p style="${styles.p}">Please keep an eye on your email for further updates regarding your registration status and payment instructions.</p>
                        <p style="${styles.p}">If you have any urgent questions, please don't hesitate to contact us. (Your Contact Email/Link Here)</p>
                        
                        <p style="${styles.p}">We can't wait to dance with you!</p>
                        <p style="${styles.p}">Warm regards,<br>The ${eventName} Team</p>
                    </div>
                    <div style="${styles.footer}">
                        <p style="color="#FFFFFF">© ${new Date().getFullYear()} ${eventName}. All rights reserved.</p>
                    </div>
                </div>
                <!--[if mso | IE]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </center>
        </body>
        </html>
        `;
        return htmlBody;
    }

    const emailHtmlBody = generateRegistrationReceivedEmailHtml({
        Email: registrationData.Email,
        FullName: registrationData.FullName,
        WSDCID: registrationData.WSDCID,
        Region: registrationData.Region,
        Level: registrationData.Level,
        PassOption: registrationData.PassOption,
        AddedIntensive: registrationData.AddedIntensive,
        Role: registrationData.Role,
        Country: registrationData.Country,
        Competing: registrationData.Competing,
        HasPartner: registrationData.HasPartner,
        PromoCode: registrationData.PromoCode,
        PartnerName: registrationData.PartnerName,
        PartnerEmail: registrationData.PartnerEmail,
        AmountDue: registrationData.AmountDue,
        PaymentDeadline: registrationData.PaymentDeadline,
        PriceTier: registrationData.PriceTier,
        RegistrationStatus: registrationData.RegistrationStatus,
        PassPrice: calculatedPassPriceServer,
        IntensivePrice: addIntensiveServer ? SERVER_INTENSIVE_PRICE : undefined,
        BasePriceAtRegistration: basePriceNumServer
    });

    const recipientEmail = registrationData.Email; // Should be non-null after validation
    const emailSubject = `Registration Received - Norwegian Open WCS 2025`;

    if (recipientEmail) {

        const message = {
            from: GOOGLE_EMAIL,
            to: recipientEmail,
            subject: emailSubject,
            text: emailHtmlBody,
            html: emailHtmlBody
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
    } else {
        console.error("Recipient email is null, cannot send confirmation.");
    }
        // email
        // Potentially send a confirmation email here
        throw redirect(303, `${url.origin}/register/success`);
    }
};