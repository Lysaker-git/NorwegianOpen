// src/routes/admin/+layout.server.ts
import { redirect, error as SvelteKitError } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Actions } from './$types';




export const load: LayoutServerLoad = async ({ locals, url }) => {
    const currentPath = url.pathname;
    // console.log(`[ADMIN LAYOUT LOAD] Path: ${currentPath}`);
    // console.log(`[ADMIN LAYOUT LOAD] locals.session:`, locals.session ? `User: ${locals.session.user.id}` : 'null');
    // console.log(`[ADMIN LAYOUT LOAD] locals.isAdmin: ${locals.isAdmin}`);

    if (currentPath === '/admin/login') {
        // If user is already an admin and somehow lands on /admin/login,
        // the hook should ideally redirect them to /admin.
        // This simply passes session data to the login page.
        // console.log('[ADMIN LAYOUT LOAD] On /admin/login path. Allowing pass-through.');
        return { session: locals.session };
    }

    // For all other /admin/* pages (e.g., /admin, /admin/registrations)
    if (!locals.session) {
        // This should have been caught by the hook.
        // console.log('[ADMIN LAYOUT LOAD] No session for protected admin page. Redirecting to /admin/login.');
        throw redirect(303, `/admin/login?redirectTo=${currentPath}`);
    }

    if (!locals.isAdmin) {
        // Session exists, but hook did not flag user as admin.
        // This means they are logged into Supabase Auth, but not in admin_users_lookup,
        // or there was an issue in the hook setting locals.isAdmin.
        // The hook should have signed them out and redirected. This is a final safeguard.
        // console.log('[ADMIN LAYOUT LOAD] Session exists but not admin. Throwing 403 Forbidden.');
        throw SvelteKitError(403, 'Forbidden: You do not have administrative privileges to access this page.');
    }

    // If we reach here, user has a session and is an admin.
    // console.log('[ADMIN LAYOUT LOAD] Admin access granted to protected page.');
    return {
        session: locals.session // Pass session to admin layout and pages
    };
};