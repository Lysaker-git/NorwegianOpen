import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {


    // Fetch all registrations
    const { data: registrations, error } = await supabaseAdmin
        .from('RegistrationDB')
        .select('AmountDue, Level, Region, Role');

    if (error) {
        return { error: 'Failed to fetch registrations' };
    }

    const nordicRegs = registrations.filter(reg => reg.Region === 'Nordic');
    const worldRegs = registrations.filter(reg => reg.Region === 'World');

    const totalNordicIncome = nordicRegs.reduce((sum, reg) => {
        const amount = parseFloat(reg.AmountDue);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const totalWorldIncome = worldRegs.reduce((sum, reg) => {
        const amount = parseFloat(reg.AmountDue);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const nordicLevelCounts: Record<string, number> = {};
    for (const reg of nordicRegs) {
        if (reg.Level) {
            nordicLevelCounts[reg.Level] = (nordicLevelCounts[reg.Level] || 0) + 1;
        }
    }
    const worldLevelCounts: Record<string, number> = {};
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
        levelCounts,
        roleCounts,
        regionCounts
    };
};