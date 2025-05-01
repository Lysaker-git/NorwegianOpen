import { createClient } from '@supabase/supabase-js';
// Import from $env/static/private for server-only variables
import { SUPABASE_SERVICE_KEY } from '$env/static/private';
// Note: We still need the URL, which can also be private or public.
// Using PUBLIC_SUPABASE_URL here is fine if you have it, or define SUPABASE_URL privately.

const supabaseUrl = "https://svzxjidlvxmbxizhoqnb.supabase.co"; // Use public or private URL var

if (!supabaseUrl) {
  throw new Error("Supabase URL is required. Set PUBLIC_SUPABASE_URL or SUPABASE_URL in .env");
}
if (!SUPABASE_SERVICE_KEY) {
  throw new Error("Supabase Service Key is required. Set SUPABASE_SERVICE_KEY in .env");
}

// Create a separate client instance configured for admin operations
export const supabaseAdmin = createClient(supabaseUrl, SUPABASE_SERVICE_KEY, {
  auth: {
    // Explicitly prevent saving sessions for the service key
    persistSession: false,
    // Avoid detecting sessions from the URL - this client isn't for user auth
    detectSessionInUrl: false
  }
});