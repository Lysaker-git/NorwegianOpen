import { supabaseAdmin } from '$lib/supabaseAdminClient';
import type { Actions, PageServerLoad } from './$types';
import { json } from '@sveltejs/kit';

interface Registration {
  id: any;
  FullName: string | null;
  Email: string | null;
  RegistrationStatus: string;
  userID: string;
  // ...other fields as needed...
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.isAdmin) {
    return json({ status: 403, error: 'Unauthorized' });
  }
  // Load all registrations for quick select
  const { data: registrations, error } = await supabaseAdmin
    .from('RegistrationDB')
    .select('*')
    .order('FullName', { ascending: true });
  if (error) {
    return json({ status: 500, error: error.message });
  }
  return { registrations };
};

export const actions: Actions = {
  search: async ({ request }) => {
    const formData = await request.formData();
    const searchType = formData.get('type'); // 'name' or 'userID'
    const value = formData.get('value');
    let result = null;
    if (searchType === 'name') {
      const { data } = await supabaseAdmin
        .from('RegistrationDB')
        .select('*')
        .ilike('FullName', `%${value}%`);
      result = data;
    } else if (searchType === 'userID') {
      const { data } = await supabaseAdmin
        .from('RegistrationDB')
        .select('*')
        .eq('userID', value);
      result = data;
    }
    return json({ result });
  },
  checkin: async ({ request }) => {
    const formData = await request.formData();
    const userID = formData.get('userID');
    const { error } = await supabaseAdmin
      .from('RegistrationDB')
      .update({ RegistrationStatus: 'checkedIn' })
      .eq('userID', userID);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  },
  update: async ({ request }) => {
    const formData = await request.formData();
    const userID = formData.get('userID');
    const updates = JSON.parse(formData.get('updates') as string);
    const { error } = await supabaseAdmin
      .from('RegistrationDB')
      .update(updates)
      .eq('userID', userID);
    if (error) {
      return json({ success: false, error: error.message });
    }
    return json({ success: true });
  }
};
