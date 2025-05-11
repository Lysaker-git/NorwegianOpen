// Registration dates
export const REG_OPEN_STRING = '2025-05-22';
export const YMIR_DEADLINE_STRING = '2025-05-29'; 
export const MIDGARD_DEADLINE_STRING = '2025-08-22';

// Pricing tiers
export const basePrices = {
    Ymir: { Nordic: 1500, World: 1800 },      // Early Bird prices
    Midgard: { Nordic: 1700, World: 2000 },   // Regular prices
    Ragnarok: { Nordic: 1900, World: 2200 }   // Late Bird prices
};

// Pass options by level
export const passOptionsByLevel = {
    'All-Star': ['Regular Pass', 'Judge (Free Pass)'],
    'Advanced': ['Regular Pass', 'Judge (20% Discount)'],
    'Other': ['Regular Pass']
};

// Party pass price
export const PARTY_PASS_PRICE = 1200;

// Level options
export const LEVEL_OPTIONS = ['All-Star', 'Advanced', 'Intermediate', 'Novice', 'Newcomer'];