import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';

interface ChartData {
    error?: string;
    totalIncome: number;
    totalNordicIncome: number;
    totalWorldIncome: number;
    nordicLevelCounts: Record<string, number>;
    worldLevelCounts: Record<string, number>;
    nordicRoleCounts: Record<string, number>;
    worldRoleCounts: Record<string, number>;
    nordicPassCounts: Record<string, number>;
    worldPassCounts: Record<string, number>;
    nordicPassIncome: Record<string, number>;
    worldPassIncome: Record<string, number>;
    nordicTierCounts: Record<string, number>;
    worldTierCounts: Record<string, number>;
    nordicTierIncome: Record<string, number>;
    worldTierIncome: Record<string, number>;
    nordicRegionCounts: Record<string, number>;
    worldRegionCounts: Record<string, number>;
}

export const load: PageServerLoad<ChartData> = async ({ locals }) => {
    // Fetch all registrations
    const { data: registrations, error } = await supabaseAdmin
        .from('RegistrationDB')
        .select('AmountDue, Level, Region, Role, PassOption, PriceTier');

    if (error) {
        return {
            error: 'Failed to fetch registrations',
            totalIncome: 0,
            totalNordicIncome: 0,
            totalWorldIncome: 0,
            nordicLevelCounts: {},
            worldLevelCounts: {},
            nordicRoleCounts: {},
            worldRoleCounts: {},
            nordicPassCounts: {},
            worldPassCounts: {},
            nordicPassIncome: {},
            worldPassIncome: {},
            nordicTierCounts: {},
            worldTierCounts: {},
            nordicTierIncome: {},
            worldTierIncome: {},
            nordicRegionCounts: {},
            worldRegionCounts: {}
        };
    }

    const nordicRegs = registrations.filter(reg => reg.Region === 'Nordic');
    const worldRegs = registrations.filter(reg => reg.Region === 'World');

    // Normalize pass names
    function normalizePassOption(pass: string) {
        if (!pass) return 'Unknown';
        const normalized = pass.trim();
        if (['Full pass', 'Full Pass', 'Regular pass', 'Regular Pass'].includes(normalized)) {
            return 'Full Pass';
        }
        if (normalized.includes('Judge') && normalized.includes('20%')) {
            return 'Judge (20% Discount)';
        }
        if (normalized.includes('Judge') && normalized.includes('Free')) {
            return 'Judge (Free Pass)';
        }
        return normalized;
    }

    // Calculate total income by region
    const totalNordicIncome = nordicRegs.reduce((sum, reg) => {
        const amount = parseFloat(reg.AmountDue);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const totalWorldIncome = worldRegs.reduce((sum, reg) => {
        const amount = parseFloat(reg.AmountDue);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Calculate income and counts by pass type
    const nordicPassCounts: Record<string, number> = {};
    const worldPassCounts: Record<string, number> = {};
    const nordicPassIncome: Record<string, number> = {};
    const worldPassIncome: Record<string, number> = {};

    for (const reg of nordicRegs) {
        const pass = normalizePassOption(reg.PassOption);
        const amount = parseFloat(reg.AmountDue);
        nordicPassCounts[pass] = (nordicPassCounts[pass] || 0) + 1;
        nordicPassIncome[pass] = (nordicPassIncome[pass] || 0) + (isNaN(amount) ? 0 : amount);
    }

    for (const reg of worldRegs) {
        const pass = normalizePassOption(reg.PassOption);
        const amount = parseFloat(reg.AmountDue);
        worldPassCounts[pass] = (worldPassCounts[pass] || 0) + 1;
        worldPassIncome[pass] = (worldPassIncome[pass] || 0) + (isNaN(amount) ? 0 : amount);
    }

    // Calculate counts and income by price tier
    const nordicTierCounts: Record<string, number> = {};
    const worldTierCounts: Record<string, number> = {};
    const nordicTierIncome: Record<string, number> = {};
    const worldTierIncome: Record<string, number> = {};

    for (const reg of nordicRegs) {
        if (reg.PriceTier) {
            nordicTierCounts[reg.PriceTier] = (nordicTierCounts[reg.PriceTier] || 0) + 1;
            const amount = parseFloat(reg.AmountDue);
            nordicTierIncome[reg.PriceTier] = (nordicTierIncome[reg.PriceTier] || 0) + (isNaN(amount) ? 0 : amount);
        }
    }

    for (const reg of worldRegs) {
        if (reg.PriceTier) {
            worldTierCounts[reg.PriceTier] = (worldTierCounts[reg.PriceTier] || 0) + 1;
            const amount = parseFloat(reg.AmountDue);
            worldTierIncome[reg.PriceTier] = (worldTierIncome[reg.PriceTier] || 0) + (isNaN(amount) ? 0 : amount);
        }
    }

    // Calculate level counts by region
    const nordicLevelCounts: Record<string, number> = {};
    const worldLevelCounts: Record<string, number> = {};

    for (const reg of nordicRegs) {
        if (reg.Level) {
            nordicLevelCounts[reg.Level] = (nordicLevelCounts[reg.Level] || 0) + 1;
        }
    }

    for (const reg of worldRegs) {
        if (reg.Level) {
            worldLevelCounts[reg.Level] = (worldLevelCounts[reg.Level] || 0) + 1;
        }
    }

    const nordicRoleCounts: Record<string, number> = {};
    for (const reg of nordicRegs) {
        if (reg.Role) {
            nordicRoleCounts[reg.Role] = (nordicRoleCounts[reg.Role] || 0) + 1;
        }
    }
    const worldRoleCounts: Record<string, number> = {};
    for (const reg of worldRegs) {
        if (reg.Role) {
            worldRoleCounts[reg.Role] = (worldRoleCounts[reg.Role] || 0) + 1;
        }
    }
    const nordicRegionCounts: Record<string, number> = {};
    for (const reg of nordicRegs) {
        if (reg.Region) {
            nordicRegionCounts[reg.Region] = (nordicRegionCounts[reg.Region] || 0) + 1;
        }
    }
    const worldRegionCounts: Record<string, number> = {};
    for (const reg of worldRegs) {
        if (reg.Region) {
            worldRegionCounts[reg.Region] = (worldRegionCounts[reg.Region] || 0) + 1;
        }
    }

    // Calculate total income
    const totalIncome = registrations.reduce((sum, reg) => {
        const amount = parseFloat(reg.AmountDue);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    // Count per level
    const levelCounts: Record<string, number> = {};
    for (const reg of registrations) {
        if (reg.Level) {
            levelCounts[reg.Level] = (levelCounts[reg.Level] || 0) + 1;
        }
    }

    const roleCounts: Record<string, number> = {};
    for (const reg of registrations) {
        if (reg.Role) {
            roleCounts[reg.Role] = (roleCounts[reg.Role] || 0) + 1;
        }
    }

    const regionCounts: Record<string, number> = {};
    for (const reg of registrations) {
        if (reg.Region) {
            regionCounts[reg.Region] = (regionCounts[reg.Region] || 0) + 1;
        }
    } 
    return {
        totalIncome,
        totalNordicIncome,
        totalWorldIncome,
        nordicLevelCounts,
        worldLevelCounts,
        nordicRoleCounts,
        worldRoleCounts,
        nordicRegionCounts,
        worldRegionCounts,
        nordicPassCounts,
        worldPassCounts,
        nordicPassIncome,
        worldPassIncome,
        nordicTierCounts,
        worldTierCounts,
        nordicTierIncome,
        worldTierIncome,
        levelCounts,
        roleCounts,
        regionCounts
    };
};