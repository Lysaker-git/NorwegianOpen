import { basePrices } from './constants';

export type Tier = 'Ymir' | 'Midgard' | 'Ragnarok';
export type Region = 'Nordic' | 'World';
export type Level = 'All-Star' | 'Advanced' | 'Intermediate' | 'Novice' | 'Newcomer';
export type LevelCategory = 'All-Star' | 'Advanced' | 'Other';

// Determine current pricing tier based on date
export function getCurrentTier(
    currentDate: Date, 
    ymirDeadline: Date, 
    midgardDeadline: Date
): Tier {
    if (currentDate <= ymirDeadline) {
        return 'Ymir';
    } else if (currentDate <= midgardDeadline) {
        return 'Midgard';
    } else {
        return 'Ragnarok';
    }
}

// Get level category for pass options
export function getLevelCategory(level: Level | null): LevelCategory | null {
    if (!level) return null;
    if (level === 'All-Star') return 'All-Star';
    if (level === 'Advanced') return 'Advanced';
    if (['Intermediate', 'Novice', 'Newcomer'].includes(level)) return 'Other';
    return null;
}

// Calculate base price
export function calculateBasePrice(tier: Tier | null, region: Region | null): number | string {
    if (tier && region) {
        const tierPrices = basePrices[tier];
        return tierPrices ? tierPrices[region] : 'Invalid Region';
    }
    return 'Select Region';
}

// Calculate time remaining
export function calculateTimeRemaining(targetDate: Date) {
    const difference = targetDate.getTime() - new Date().getTime();
    
    if (difference > 0) {
        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
}