// src/routes/api/admin/competitions/+server.js
import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabaseAdminClient';

// export async function GET({ request }) {
//   try {
//     const { data, error } = await supabaseAdmin
//       .from('competitions')
//       .select('*')
//       .order('date', { ascending: false });
      
//     if (error) throw error;
//     return json(data);
//   } catch (error) {
//     return json({ error: error.message }, { status: 500 });
//   }
// }

// export async function POST({ request }) {
//   try {
//     const competition = await request.json();
    
//     const { data, error } = await supabaseAdmin
//       .from('competitions')
//       .insert([competition])
//       .select();
      
//     if (error) throw error;
//     return json(data[0]);
//   } catch (error) {
//     return json({ error: error.message }, { status: 500 });
//   }
// }