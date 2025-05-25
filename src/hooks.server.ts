// src/hooks.server.ts
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const { url } = event;
    const { pathname } = url;

    event.locals.supabase = createServerClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get: (key) => event.cookies.get(key),
                set: (key, value, options) => {
                    event.cookies.set(key, value, {
                        ...options,
                        path: '/',
                        sameSite: 'lax',
                        secure: process.env.NODE_ENV === 'production'
                    })
                },
                remove: (key, options) => {
                    event.cookies.delete(key, {
                        ...options,
                        path: '/'
                    })
                }
            }
        }
    );

    // Use getUser() instead of getSession() for better security
    const { data: { user }, error: userError } = await event.locals.supabase.auth.getUser();
    if (userError) {
        console.error("[HOOKS] Error getting user:", userError.message);
    }

    // Get session data if user exists (for session info like expires_at)
    let session = null;
    if (user) {
        const { data: { session: sessionData }, error: sessionError } = await event.locals.supabase.auth.getSession();
        if (!sessionError) {
            session = sessionData;
        }
    }

    event.locals.session = session;
    event.locals.user = user; // Also store user separately
    event.locals.isAdmin = false;


    if (pathname.startsWith('/admin')) {
        if (pathname === '/admin/login') {
            if (user) {
                const { data: adminUserRecord, error: lookupError } = await supabaseAdmin
                    .from('admin_users_lookup')
                    .select('user_id')
                    .eq('user_id', user.id)
                    .limit(1)
                    .maybeSingle();

                if (lookupError) {
                    console.error('[HOOKS] Error checking admin_users_lookup for /admin/login:', lookupError.message);
                }

                if (adminUserRecord) {
                    // console.log('[HOOKS] Logged-in admin is on /admin/login. Redirecting to /admin.');
                    return Response.redirect(`${url.origin}/admin`, 303);
                }
            }
            return resolve(event);
        }
        else {
            if (!user) {
                // console.log('[HOOKS] No user for protected admin route. Redirecting to /admin/login.');
                return Response.redirect(`${url.origin}/admin/login?redirectTo=${pathname}`, 303);
            }

            const { data: adminUserRecord, error: adminCheckError } = await supabaseAdmin
                .from('admin_users_lookup')
                .select('user_id')
                .eq('user_id', user.id)
                .limit(1)
                .maybeSingle();

            if (adminCheckError) {
                // console.error('[HOOKS] Admin check DB error for protected route:', adminCheckError.message);
                await event.locals.supabase.auth.signOut();
                event.locals.session = null;
                event.locals.user = null;
                event.locals.isAdmin = false;
                return Response.redirect(`${url.origin}/admin/login?message=server_error`, 303);
            }

            if (!adminUserRecord) {
                // console.log('[HOOKS] User authenticated but not in admin_users_lookup. Signing out & redirecting.');
                await event.locals.supabase.auth.signOut();
                event.locals.session = null;
                event.locals.user = null;
                event.locals.isAdmin = false;
                return Response.redirect(`${url.origin}/admin/login?message=not_authorized`, 303);
            }

            // console.log('[HOOKS] Admin verified for protected route. Setting locals.isAdmin = true.');
            event.locals.isAdmin = true;
        }
    }

    return resolve(event);
};