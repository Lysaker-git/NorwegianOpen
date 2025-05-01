// Registration dates
export const REG_OPEN_STRING = '2025-06-01';
export const YMIR_DEADLINE_STRING = '2025-05-31'; 
export const MIDGARD_DEADLINE_STRING = '2025-07-31';

// Pricing tiers
export const basePrices = {
    Ymir: { Nordic: 1700, World: 1900 },      // Early Bird prices
    Midgard: { Nordic: 1900, World: 2100 },   // Regular prices
    Ragnarok: { Nordic: 2100, World: 2300 }   // Late Bird prices
};

// Pass options by level
export const passOptionsByLevel = {
    'All-Star': ['Regular Pass', 'Judge (Free Pass)', 'Party Pass'],
    'Advanced': ['Regular Pass', 'Judge (20% Discount)', 'Party Pass'],
    'Other': ['Regular Pass', 'Party Pass']
};

// Party pass price
export const PARTY_PASS_PRICE = 1200;

// Level options
export const LEVEL_OPTIONS = ['All-Star', 'Advanced', 'Intermediate', 'Novice', 'Newcomer'];