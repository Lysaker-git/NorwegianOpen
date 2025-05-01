// src/routes/api/admin/competitions/[competitionId]/judges/+server.js
import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabaseAdminClient.js';

// Get all judges for a specific competition
export async function GET({ params }) {
    const { competitionId } = params;
    
    try {
        const { data, error } = await supabaseAdmin
            .from('judges')
            .select('*')
            .eq('competitionId', competitionId)
            .order('name');
            
        if (error) throw error;
        return json(data);
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}

// Add a new judge to a competition
export async function POST({ request, params }) {
    const { competitionId } = params;
    const judgeData = await request.json();
    
    // Ensure the judge is associated with this competition
    judgeData.competitionId = competitionId;
    
    try {
        const { data, error } = await supabaseAdmin
            .from('judges')
            .insert([judgeData])
            .select();
            
        if (error) throw error;
        return json(data[0]);
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}