// src/routes/api/admin/competitions/[competitionId]/contestants/+server.js
import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabaseAdminClient.js';

// Get all contestants for a specific competition
export async function GET({ params }) {
    const { competitionId } = params;
    
    try {
        const { data, error } = await supabaseAdmin
            .from('contestants')
            .select('*')
            .eq('competitionId', competitionId)
            .order('bibNumber');
            
        if (error) throw error;
        return json(data);
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}

// Add a new contestant to a competition
export async function POST({ request, params }) {
    const { competitionId } = params;
    const contestantData = await request.json();
    
    // Ensure the contestant is associated with this competition
    contestantData.competitionId = competitionId;
    
    try {
        // Check if bib number is already in use
        const { data: existingBib, error: checkError } = await supabaseAdmin
            .from('contestants')
            .select('id')
            .eq('competitionId', competitionId)
            .eq('bibNumber', contestantData.bibNumber)
            .maybeSingle();
            
        if (checkError) throw checkError;
        
        if (existingBib) {
            return json({ error: "Bib number is already in use" }, { status: 400 });
        }
        
        // Add contestant
        const { data, error } = await supabaseAdmin
            .from('contestants')
            .insert([contestantData])
            .select();
            
        if (error) throw error;
        return json(data[0]);
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}