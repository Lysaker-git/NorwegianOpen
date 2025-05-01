// src/routes/api/admin/competitions/[competitionId]/judges/[judgeId]/+server.js
import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabaseAdminClient.js';

// Delete a specific judge
export async function DELETE({ params }) {
    const { judgeId, competitionId } = params;
    
    try {
        // Verify the judge belongs to this competition before deletion
        const { data: verifyData, error: verifyError } = await supabaseAdmin
            .from('judges')
            .select('id')
            .eq('id', judgeId)
            .eq('competitionId', competitionId)
            .single();
            
        if (verifyError || !verifyData) {
            return json(
                { error: "Judge not found or doesn't belong to this competition" }, 
                { status: 404 }
            );
        }
        
        // Delete the judge
        const { error } = await supabaseAdmin
            .from('judges')
            .delete()
            .eq('id', judgeId);
            
        if (error) throw error;
        
        return json({ success: true });
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}