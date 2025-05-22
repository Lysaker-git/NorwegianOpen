// Registration dates
export const REG_OPEN_STRING = '2025-05-22';
export const YMIR_DEADLINE_STRING = '2025-05-29'; 
export const MIDGARD_DEADLINE_STRING = '2025-08-22';

// Pricing tiers
export const basePrices = {
    Ymir: { Nordic: 1800, World: 1500 },      // Early Bird prices
    Midgard: { Nordic: 2000, World: 1700 },   // Regular prices
    Ragnarok: { Nordic: 2200, World: 1900 }   // Late Bird prices
};

// Pass options by level
export const passOptionsByLevel = {
    'All-Star': ['Regular Pass', 'Judge (Free Pass)', 'Party Pass'],
    'Advanced': ['Regular Pass', 'Judge (20% Discount)', 'Party Pass'],
    'Other': ['Zero to Hero', 'Regular Pass', 'Party Pass']
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
    None: 0, // No hotel
    HotelOptionNo: 0 // Selected "No"
};