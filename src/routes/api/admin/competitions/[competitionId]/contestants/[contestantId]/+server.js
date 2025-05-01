// src/routes/api/admin/competitions/[competitionId]/contestants/[contestantId]/+server.js
import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabaseAdminClient.js';

// Delete a specific contestant
export async function DELETE({ params }) {
    const { contestantId, competitionId } = params;
    
    try {
        // Verify the contestant belongs to this competition before deletion
        const { data: verifyData, error: verifyError } = await supabaseAdmin
            .from('contestants')
            .select('id')
            .eq('id', contestantId)
            .eq('competitionId', competitionId)
            .single();
            
        if (verifyError || !verifyData) {
            return json(
                { error: "Contestant not found or doesn't belong to this competition" }, 
                { status: 404 }
            );
        }
        
        // Check if contestant has scores
        const { data: scores, error: scoresError } = await supabaseAdmin
            .from('scores')
            .select('id')
            .eq('contestantId', contestantId)
            .limit(1);
            
        if (scoresError) throw scoresError;
        
        if (scores && scores.length > 0) {
            return json(
                { error: "Cannot remove contestant who already has scores. Please remove scores first." }, 
                { status: 400 }
            );
        }
        
        // Delete the contestant
        const { error } = await supabaseAdmin
            .from('contestants')
            .delete()
            .eq('id', contestantId);
            
        if (error) throw error;
        
        return json({ success: true });
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}