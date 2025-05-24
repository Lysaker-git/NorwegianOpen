// src/routes/admin/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';

export const actions: Actions = {
    login: async ({ request, locals, url }) => {
        console.log('[LOGIN ACTION] Started.');
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        console.log(`[LOGIN ACTION] Email: ${email}`);

        if (!email || !password) {
            console.log('[LOGIN ACTION] Validation failed: Email or password missing.');
            return fail(400, { error: 'Email and password are required.', values: { email } });
        }

        // Use the supabase client from locals (created by the hook)
        const { data: authData, error: authError } = await locals.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError || !authData.session || !authData.user) {
            console.error('Login auth error:', authError?.message || 'No session/user data returned');
            return fail(401, { error: 'Invalid login credentials.', values: { email } });
        }
        console.log('[LOGIN ACTION] Supabase Auth successful. User ID:', authData.user.id);

        console.log('[LOGIN ACTION] Checking admin_users_lookup table...');
        // Step 2: Verify if the authenticated user is in the admin_users_lookup table
        const { data: adminUserRecord, error: adminCheckError } = await supabaseAdmin
            .from('admin_users_lookup')
            .select('user_id')
            .eq('user_id', authData.user.id)
            .limit(1)
            .maybeSingle();

        if (adminCheckError) {
            console.error('Admin lookup check error after login:', adminCheckError.message);
            await locals.supabase.auth.signOut();
            return fail(500, { error: 'Server error during admin verification. Please try again.', values: { email } });
        }

        if (!adminUserRecord) {
            console.log('[LOGIN ACTION] User authenticated but NOT in admin_users_lookup.');
            console.log(`User ${email} authenticated but not found in admin_users_lookup.`);
            await locals.supabase.auth.signOut();
            return fail(403, { error: 'Access Denied. You are not an authorized administrator.', values: { email } });
        }
        console.log('[LOGIN ACTION] Admin user verified in admin_users_lookup.');

        // DO NOT manually set cookies - let @supabase/ssr handle this
        // The cookies will be automatically set by the supabase client in the hook

        const redirectTo = url.searchParams.get('redirectTo');
        let finalRedirectPath = '/admin';
        if (redirectTo && redirectTo.startsWith('/admin') && redirectTo !== '/admin/login') {
             finalRedirectPath = redirectTo;
        }
        console.log(`[LOGIN ACTION] Preparing to redirect to: ${finalRedirectPath}`);
        throw redirect(303, finalRedirectPath);
    },

    logout: async ({ locals }) => {
        console.log('[LOGOUT ACTION] Started.');
        
        try {
            if (locals.supabase) {
                const { error } = await locals.supabase.auth.signOut();
                if (error) {
                    console.error('Supabase sign out error:', error.message);
                    // Continue with logout even if signOut fails
                }
            }
            
            // Clear locals
            locals.session = null;
            locals.user = null;
            locals.isAdmin = false;
            
            console.log('[LOGOUT ACTION] Signed out successfully. Redirecting to /admin/login.');
        } catch (error) {
            console.error('[LOGOUT ACTION] Error during logout:', error);
            // Still redirect even if there's an error
        }
        
        throw redirect(303, '/admin/login');
    }
};