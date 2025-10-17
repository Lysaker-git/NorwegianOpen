export interface PriceRow {
        level: string;
        levelRowSpan?: number;   // How many rows this level spans
        regions: RegionPrice[];  // One or more regions for this level
    }

export interface RegionPrice {
        region: string;
        prices: Price[];        // One price for each tier
    }

export interface Price {
        amount: number;
        note?: string;         // Optional note (e.g., judging discount)
    }