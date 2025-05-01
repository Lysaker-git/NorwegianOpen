import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabaseAdminClient.js';

// Get details of a specific competition
export async function GET({ params }) {
    const { competitionId } = params;
    
    try {
        const { data, error } = await supabaseAdmin
            .from('competitions')
            .select('*')
            .eq('id', competitionId)
            .single();
            
        if (error) throw error;
        if (!data) {
            return json({ error: "Competition not found" }, { status: 404 });
        }
        
        return json(data);
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}