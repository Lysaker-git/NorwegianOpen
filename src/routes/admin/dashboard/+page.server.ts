import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';

interface LevelBreakdown {
    total: number;
    leaders: number;
    followers: number;
    attending: number;
    waitingList: number;
    leadersWaiting: number;
    followersWaiting: number;
}

interface ChartData {
    error?: string;
    totalIncome: number;
    potentialIncome: number;
    totalNordicIncome: number;
    potentialNordicIncome: number;
    totalWorldIncome: number;
    potentialWorldIncome: number;
    nordicLevelCounts: Record<string, LevelBreakdown>;
    worldLevelCounts: Record<string, LevelBreakdown>;
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
    registrationsByRole: {
        Leader: { status: string }[];
        Follower: { status: string }[];
    };
    intensiveCounts: {
        total: number;
        approved: number;
        waiting: number;
        nordic: number;
        world: number;
    };
    plannedCompetitors: Record<string, { Leader: number; Follower: number }>;
    hotelStats: {
        optionCounts: Record<string, number>;
        totalAmount: number;
        totalNights: number;
        freeNights: number;
    };
}

export const load: PageServerLoad<ChartData> = async ({ locals }) => {
    // Fetch all registrations    
    const { data: registrations, error } = await supabaseAdmin
        .from('RegistrationDB')
        .select('AmountDue, Level, Region, Role, PassOption, PriceTier, RegistrationStatus, AddedIntensive');

    if (error) {
        return {
            error: 'Failed to fetch registrations',
            totalIncome: 0,
            potentialIncome: 0,
            totalNordicIncome: 0,
            potentialNordicIncome: 0,
            totalWorldIncome: 0,
            potentialWorldIncome: 0,
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
            worldRegionCounts: {},
            registrationsByRole: {
                Leader: [],
                Follower: []
            },
            intensiveCounts: {
                total: 0,
                approved: 0,
                waiting: 0,
                nordic: 0,
                world: 0
            },
            plannedCompetitors: {},
            hotelStats: {
                optionCounts: {},
                totalAmount: 0,
                totalNights: 0,
                freeNights: 0
            }
        };
    }
    console.log('[SERVER LOAD]' , registrations)

    const nordicRegs = registrations.filter(reg => reg.Region === 'Nordic');
    const worldRegs = registrations.filter(reg => reg.Region === 'World');

    console.log('[SERVER LOAD] Nordic Registrations:', nordicRegs.length);
    console.log('[SERVER LOAD] World Registrations:', worldRegs.length);


    // Helper function to determine attendance status
    function getAttendanceStatus(status: string) {
        if (['paymentReceived', 'checkedIn', 'approved'].includes(status)) return 'attending';
        if (['waitingList', 'pendingApproval'].includes(status)) return 'waitingList';
        return 'other';
    }

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

    // Initialize level breakdowns
    function createLevelBreakdown(): LevelBreakdown {
        return {
            total: 0,
            leaders: 0,
            followers: 0,
            attending: 0,
            waitingList: 0,
            leadersWaiting: 0,
            followersWaiting: 0
        };
    }

    // Calculate level breakdowns for Nordic registrations
    const nordicLevelCounts: Record<string, LevelBreakdown> = {};
    for (const reg of nordicRegs) {
        if (!reg.Level) continue;
        
        if (!nordicLevelCounts[reg.Level]) {
            nordicLevelCounts[reg.Level] = createLevelBreakdown();
        }
        
        nordicLevelCounts[reg.Level].total++;
        
        const status = getAttendanceStatus(reg.RegistrationStatus);
        
        if (reg.Role === 'Leader') {
            nordicLevelCounts[reg.Level].leaders++;
            if (status === 'attending') {
                nordicLevelCounts[reg.Level].attending++;
            } else if (status === 'waitingList') {
                nordicLevelCounts[reg.Level].waitingList++;
                nordicLevelCounts[reg.Level].leadersWaiting++;
            }
        } else if (reg.Role === 'Follower') {
            nordicLevelCounts[reg.Level].followers++;
            if (status === 'attending') {
                nordicLevelCounts[reg.Level].attending++;
            } else if (status === 'waitingList') {
                nordicLevelCounts[reg.Level].waitingList++;
                nordicLevelCounts[reg.Level].followersWaiting++;
            }
        }
    }

    // Calculate level breakdowns for World registrations
    const worldLevelCounts: Record<string, LevelBreakdown> = {};
    for (const reg of worldRegs) {
        if (!reg.Level) continue;
        
        if (!worldLevelCounts[reg.Level]) {
            worldLevelCounts[reg.Level] = createLevelBreakdown();
        }
        
        worldLevelCounts[reg.Level].total++;
        
        const status = getAttendanceStatus(reg.RegistrationStatus);
        
        if (reg.Role === 'Leader') {
            worldLevelCounts[reg.Level].leaders++;
            if (status === 'attending') {
                worldLevelCounts[reg.Level].attending++;
            } else if (status === 'waitingList') {
                worldLevelCounts[reg.Level].waitingList++;
                worldLevelCounts[reg.Level].leadersWaiting++;
            }
        } else if (reg.Role === 'Follower') {
            worldLevelCounts[reg.Level].followers++;
            if (status === 'attending') {
                worldLevelCounts[reg.Level].attending++;
            } else if (status === 'waitingList') {
                worldLevelCounts[reg.Level].waitingList++;
                worldLevelCounts[reg.Level].followersWaiting++;
            }
        }
    }

    // Helper function to check if status is confirmed
    function isConfirmedStatus(status: string) {
        return ['approved', 'checkedIn', 'paymentReceived'].includes(status);
    }

    // Calculate total income by region with confirmed/potential split
    const totalNordicIncome = nordicRegs.reduce((sum, reg) => {
        const amount = parseFloat(reg.AmountDue);
        if (isConfirmedStatus(reg.RegistrationStatus)) {
            return sum + (isNaN(amount) ? 0 : amount);
        }
        return sum;
    }, 0);

    const potentialNordicIncome = nordicRegs.reduce((sum, reg) => {
        const amount = parseFloat(reg.AmountDue);
        if (!isConfirmedStatus(reg.RegistrationStatus)) {
            return sum + (isNaN(amount) ? 0 : amount);
        }
        return sum;
    }, 0);

    const totalWorldIncome = worldRegs.reduce((sum, reg) => {
        const amount = parseFloat(reg.AmountDue);
        if (isConfirmedStatus(reg.RegistrationStatus)) {
            return sum + (isNaN(amount) ? 0 : amount);
        }
        return sum;
    }, 0);

    const potentialWorldIncome = worldRegs.reduce((sum, reg) => {
        const amount = parseFloat(reg.AmountDue);
        if (!isConfirmedStatus(reg.RegistrationStatus)) {
            return sum + (isNaN(amount) ? 0 : amount);
        }
        return sum;
    }, 0);

    // Calculate total confirmed and potential income
    const totalIncome = totalNordicIncome + totalWorldIncome;
    const potentialIncome = potentialNordicIncome + potentialWorldIncome;

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

    // Count per level
    const levelCounts: Record<string, number> = {};
    for (const reg of registrations) {
        if (reg.Level) {
            levelCounts[reg.Level] = (levelCounts[reg.Level] || 0) + 1;
        }
    }

    // Calculate role counts for Nordic registrations
    const nordicRoleCounts: Record<string, number> = {};
    for (const reg of nordicRegs) {
        if (reg.Role) {
            nordicRoleCounts[reg.Role] = (nordicRoleCounts[reg.Role] || 0) + 1;
        }
    }

    // Calculate role counts for World registrations
    const worldRoleCounts: Record<string, number> = {};
    for (const reg of worldRegs) {
        if (reg.Role) {
            worldRoleCounts[reg.Role] = (worldRoleCounts[reg.Role] || 0) + 1;
        }
    }

    // Calculate region counts for Nordic registrations
    const nordicRegionCounts: Record<string, number> = {};
    for (const reg of nordicRegs) {
        if (reg.Region) {
            nordicRegionCounts[reg.Region] = (nordicRegionCounts[reg.Region] || 0) + 1;
        }
    }

    // Calculate region counts for World registrations
    const worldRegionCounts: Record<string, number> = {};
    for (const reg of worldRegs) {
        if (reg.Region) {
            worldRegionCounts[reg.Region] = (worldRegionCounts[reg.Region] || 0) + 1;
        }
    }

    // Create registrationsByRole data structure
    const registrationsByRole = {
        Leader: [] as { status: string }[],
        Follower: [] as { status: string }[]
    };

    // Populate registrationsByRole from both Nordic and World registrations
    [...nordicRegs, ...worldRegs].forEach(reg => {
        if (reg.Role === 'Leader') {
            registrationsByRole.Leader.push({
                status: reg.RegistrationStatus
            });
        } else if (reg.Role === 'Follower') {
            registrationsByRole.Follower.push({
                status: reg.RegistrationStatus
            });
        }
    });

    // Calculate intensive registrations
    const intensiveCounts = {
        total: registrations.filter(reg => reg.AddedIntensive).length,
        approved: registrations.filter(reg => reg.AddedIntensive && ['approved', 'paymentReceived', 'checkedIn'].includes(reg.RegistrationStatus)).length,
        waiting: registrations.filter(reg => reg.AddedIntensive && ['waitingList', 'pendingApproval'].includes(reg.RegistrationStatus)).length,
        nordic: nordicRegs.filter(reg => reg.AddedIntensive).length,
        world: worldRegs.filter(reg => reg.AddedIntensive).length
    };

    // Calculate planned competitors by level and role (Competing=TRUE, confirmed statuses)
    // First, fetch Competing column for all registrations
    const { data: registrationsWithCompeting, error: competingError } = await supabaseAdmin
        .from('RegistrationDB')
        .select('Level, Role, RegistrationStatus, Competing');

    let plannedCompetitorsByLevel: Record<string, { Leader: number; Follower: number }> = {};
    if (!competingError && registrationsWithCompeting) {
        for (const reg of registrationsWithCompeting) {
            if (!reg.Level || !reg.Role) continue;
            if (!reg.Competing) continue;
            if (!isConfirmedStatus(reg.RegistrationStatus)) continue;
            if (!plannedCompetitorsByLevel[reg.Level]) {
                plannedCompetitorsByLevel[reg.Level] = { Leader: 0, Follower: 0 };
            }
            if (reg.Role === 'Leader') {
                plannedCompetitorsByLevel[reg.Level].Leader++;
            } else if (reg.Role === 'Follower') {
                plannedCompetitorsByLevel[reg.Level].Follower++;
            }
        }
    }

    // --- Hotel Registration Statistics ---
    const { data: hotelRegistrations, error: hotelError } = await supabaseAdmin
        .from('HotelRegistration')
        .select('hoteloption, amountdue, numberofnights');

    let hotelStats = {
        optionCounts: {} as Record<string, number>,
        totalAmount: 0,
        totalNights: 0,
        freeNights: 0
    };
    if (!hotelError && hotelRegistrations) {
        for (const reg of hotelRegistrations) {
            // Count hotel options
            if (reg.hoteloption) {
                hotelStats.optionCounts[reg.hoteloption] = (hotelStats.optionCounts[reg.hoteloption] || 0) + 1;
            }
            // Sum amount
            if (reg.amountdue) {
                hotelStats.totalAmount += Number(reg.amountdue) || 0;
            }
            // Sum nights
            if (reg.numberofnights) {
                hotelStats.totalNights += Number(reg.numberofnights) || 0;
            }
        }
        // Calculate free nights (1 per 20 booked)
        hotelStats.freeNights = Math.floor(hotelStats.totalNights / 20);
    }

    return {
        totalIncome,
        potentialIncome,
        totalNordicIncome,
        potentialNordicIncome,
        totalWorldIncome,
        potentialWorldIncome,
        nordicLevelCounts,
        worldLevelCounts,
        nordicRoleCounts,
        worldRoleCounts,
        nordicPassCounts,
        worldPassCounts,
        nordicPassIncome,
        worldPassIncome,
        nordicTierCounts,
        worldTierCounts,
        nordicTierIncome,
        worldTierIncome,
        nordicRegionCounts,
        worldRegionCounts,
        registrationsByRole,
        intensiveCounts,
        plannedCompetitors: plannedCompetitorsByLevel,
        hotelStats
    };
};