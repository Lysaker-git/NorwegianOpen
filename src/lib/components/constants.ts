// Registration dates
export const REG_OPEN_STRING = '2025-05-22';
export const YMIR_DEADLINE_STRING = '2025-05-29'; 
export const MIDGARD_DEADLINE_STRING = '2025-08-22';

// Pricing tiers
export const basePrices = {
    Ymir: { Nordic: 1800, World: 1500 },      // Early Bird prices
    Midgard: { Nordic: 2000, World: 1700 },   // Full prices
    Ragnarok: { Nordic: 2200, World: 1900 }   // Late Bird prices
};

// Pass options by level
export const passOptionsByLevel = {
    'All-Star': ['Full Pass', 'Judge (Free Pass)', 'Party Pass'],
    'Advanced': ['Full Pass', 'Judge (20% Discount)', 'Party Pass'],
    'Other': ['Zero to Hero', 'Full Pass', 'Party Pass']
};

// Party pass price
export const PARTY_PASS_PRICE = 1200;
export const ZERO_TO_HERO = 1300;
export const INTENSIVE = 1000;

// Level options
export const LEVEL_OPTIONS = ['All-Star', 'Advanced', 'Intermediate', 'Novice', 'Newcomer'];

export const HOTEL_PRICES = {
    HotelOptionOne: 1290, // Single Room
    HotelOptionTwo: 1490, // Twin Room
    HotelOptionThree: 1690, // Triple Room
    HotelOptionFour: 1890, // Quatro Room
};

export const paymentInfo = {
    accountName: "Norwegian Open WCS",
    accountNumber: "4910.20.39490",
    iban: "NO74 4910 2039 490",
    swift: "SNOWNO22",
    bankName: "Sparebank 1 NordNorge",
    bankAddress: "Storgata 65, 9008 Tromsø, Norway"
};

export const colorPalette = {
    primaryColor: '#0A2342', // Dark Blue (Brand Color)
    accentColor: '#FFD700',  // Gold (Brand Accent)
    textColor: '#333333',    // Main text
    lightTextColor: '#555555',// Lighter text for less emphasis
    backgroundColor: '#f4f4f7',// Light grey page background
    containerBackgroundColorRgba: 'rgba(255, 255, 255, 0.92)', // Slightly more opaque white for content
    containerSolidBgForOutlook: '#FFFFFF', // Solid white for Outlook
    borderColor: '#ddddde',   // Borders
    summaryBoxBgRgba: 'rgba(240, 245, 250, 0.9)', // Lighter blueish, slightly transparent for summary
    summaryBoxSolidBg: '#F0F5FA', // Solid for Outlook summary
    statusHighlightColor: '#D9534F', // Reddish for status (kept for emphasis)
    successColor: '#28a745',      // Green for success messages
}