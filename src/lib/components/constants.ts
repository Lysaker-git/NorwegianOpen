import ardenaAndIbi from '$lib/components/images/imagesPros/ardenaAndIbi.jpg';
import igorAndFernanda from '$lib/components/images/imagesPros/igorAndFernanda.jpg';
import olivierAndVirginie from '$lib/components/images/imagesPros/olivierAndVirginie.jpg';
import hugoAndStacy from '$lib/components/images/imagesPros/hugoAndStacy.jpg';
import { pros } from '$lib/components/objects/pros';

import type { PriceRow } from '$lib/components/interface.ts';

export const REG_OPEN_STRING = '2026-02-24';
export const YMIR_DEADLINE_STRING = '2026-04-15'; 
export const MIDGARD_DEADLINE_STRING = '2026-05-31';

export const ymirDeadline = new Date(YMIR_DEADLINE_STRING + 'T23:59:59');
export const midgardDeadline = new Date(MIDGARD_DEADLINE_STRING + 'T23:59:59');

export const navEndDate = new Date('2026-10-05T23:59:59');
export const today = new Date();
export const regOpenDate = new Date(REG_OPEN_STRING + 'T20:00:00');
export const eventDate = new Date('2026-10-01T00:00:00');

export const proImages: Record<string, string> = {
    "OLIVIER & VIRGINIE MASSART": olivierAndVirginie,
    "HUGO MIGUEZ & STACY KAY": hugoAndStacy,
    "IGOR PITANGUI & FERNANDA DUBIEL": igorAndFernanda,
    "ARDENA GOJANI & MANUEL IBIROCAY ALSÉN": ardenaAndIbi,
};

// Pricing tiers
export const basePrices = {
    Ymir: { Nordic: 2000, World: 1800 },      // Early Bird prices
    Midgard: { Nordic: 2200, World: 2000 },   // Full prices
    Ragnarok: { Nordic: 2400, World: 2200 }   // Late Bird prices
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

export const HOTEL_PRICES: { [key: string]: number } = {
    HotelOptionOne: 1390,
    HotelOptionTwo: 1590,
    HotelOptionThree: 1890,
    HotelOptionFour: 2090
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

export const tiers = [
    { name: 'Ymir', title: '❄️ Ymir', subtitle: 'Early Bird', deadline: 'First 100 Passes' },
    { name: 'Midgard', title: '🌍 Midgard', subtitle: 'Regular', deadline: 'Ends 1st of May' },
    { name: 'Ragnarok', title: '🔥 Ragnarok', subtitle: 'Late Bird', deadline: 'From 2nd og May' }
];

export const currencySymbol = 'NOK';
export const priceRows: PriceRow[] = [
        {
            level: 'Full Pass',
            levelRowSpan: 2,
            regions: [
                {
                    region: 'Nordic',
                    prices: [
                        { amount: 2000 },
                        { amount: 2200 },
                        { amount: 2400 }
                    ]
                },
                {
                    region: 'World',
                    prices: [
                        { amount: 1800 },
                        { amount: 1200 },
                        { amount: 2200 }
                    ]
                }
            ]
        },
        // {
        //     level: 'Zero to Hero',
        //     levelRowSpan: 1,
        //     regions: [
        //         {
        //             region: 'All Regions',
        //             prices: [
        //                 { amount: 1300 },
        //                 { amount: 1300 },
        //                 { amount: 1300 }
        //             ]
        //         }
        //     ]
        // },
        {
            level: 'Party Pass',
            levelRowSpan: 1,
            regions: [
                {
                    region: 'All Regions',
                    prices: [
                        { amount: 1500, note: "Only 50 passes" },
                        { amount: 1500 },
                        { amount: 1500 }
                    ]
                }
            ]
        }
        // {
        //     level: 'Choreo Intensive with Fernanda and Igor',
        //     levelRowSpan: 1,
        //     regions: [
        //         {
        //             region: 'All Regions',
        //             prices: [
        //                 { amount: 1000 },
        //                 { amount: 1000 },
        //                 { amount: 1000 }
        //             ]
        //         }
        //     ]
        // }
    ];

export const passDescriptions = {
        'Full Pass': 'You will get acces to all workshops, evening dances, and competitions.',
        'Party Pass': 'Access to evening dances and competitions only.',
        // 'Choreo Intensive with Fernanda and Igor': 'Focused choreography workshop and events with Fernanda and Igor.'
    };

export const statusLabels = {
    'pendingApproval': 'Pending approval',
    'approved': 'Approved',
    'waitingList': 'Waiting list',
    'cancelled': 'Cancelled'
};

// --- Hotel Registration Constants & Utilities ---
import fourOne from '$lib/components/images/scandic/quatro/fourOne.webp';
import connectingRoom from '$lib/components/images/scandic/single/connectingRoom.webp';
import doublebeds from '$lib/components/images/scandic/single/doublebeds.webp';
import triple from '$lib/components/images/scandic/triple/triple.webp';

export const hotelMinDate = '2025-10-02';
export const hotelMaxDate = '2025-10-06';

export const availableDates = [
    '2025-10-02',
    '2025-10-03',
    '2025-10-04',
    '2025-10-05',
    '2025-10-06'
];

export function getHotelDisplayName(key: string): string {
    switch(key) {
        case 'HotelOptionOne': return 'Single Room';
        case 'HotelOptionTwo': return 'Twin Room';
        case 'HotelOptionThree': return 'Triple Room';
        case 'HotelOptionFour': return 'Quatro Room';
        default: return 'Selected Hotel';
    }
}

export function formatPrice(price: number | undefined) {
    return price ? `${price.toLocaleString()} NOK` : '';
}

export const roomOptions = [
    {
        key: 'HotelOptionOne',
        label: 'Single Room',
        description: 'A private room for one person.',
        price: HOTEL_PRICES.HotelOptionOne,
        image: doublebeds,
        features: [
            'Bathroom with shower',
            'Bathroom with shower or bathtub',
            'Table',
            'Wooden floor',
            'Chair/chairs',
            'Free WiFi',
            'Non-smoking',
            'Bathroom amenities',
            'Connecting rooms (available in some rooms)',
            'Sofa bed (available in some rooms)',
            'Adjustable beds (available in some rooms)',
            'Bunk bed (available in some rooms)',
            'Iron and ironing board',
            'Desk and chair',
            'Hair dryer'
        ]
    },
    {
        key: 'HotelOptionTwo',
        label: 'Twin Room',
        description: 'A room for two people. You will need to specify your roommate.',
        price: HOTEL_PRICES.HotelOptionTwo,
        image: connectingRoom, 
        features: [
            'Bathroom with shower',
            'Bathroom with shower or bathtub',
            'Table',
            'Wooden floor',
            'Chair/chairs',
            'Free WiFi',
            'Non-smoking',
            'Bathroom amenities',
            'Connecting rooms (available in some rooms)',
            'Sofa bed (available in some rooms)',
            'Adjustable beds (available in some rooms)',
            'Bunk bed (available in some rooms)',
            'Iron and ironing board',
            'Desk and chair',
            'Hair dryer'
        ]
    },
    {
        key: 'HotelOptionThree',
        label: 'Triple Room',
        description: 'A room for three people. You will need to specify your roommates.',
        price: HOTEL_PRICES.HotelOptionThree,
        image: triple,
        features: [
            'Bathroom with shower',
            'Bathroom with shower or bathtub',
            'Table',
            'Wooden floor',
            'Free WiFi',
            'Chair/chairs',
            'Non-smoking',
            'Bathroom amenities',
            'Connecting rooms (available in some rooms)',
            'Sofa bed (available in some rooms)',
            'Adjustable beds (available in some rooms)',
            'Bunk bed (available in some rooms)',
            'Iron and ironing board',
            'Desk and chair',
            'Hair dryer'
        ]
    },
    {
        key: 'HotelOptionFour',
        label: 'Quatro Room',
        description: 'A room for four people. You will need to specify your roommates.',
        price: HOTEL_PRICES.HotelOptionFour,
        image: fourOne,
        features: [
            'Free WiFi',
            'Bathroom with shower',
            'Bathroom amenities',
            'Wooden floors',
            'Safe (available in some rooms)',
            'Refrigerator (available in some rooms)',
            'Table',
            'Chair(s)',
            'Non-smoking',
            'Upper floors',
            'Easy access',
            'Blackout curtains',
            'Bunk bed',
            'Iron and ironing board',
            'Desk and chair',
            'Hairdryer'
        ]
    }
];