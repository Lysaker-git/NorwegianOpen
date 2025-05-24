// src/app.d.ts
import type { SupabaseClient, Session } from '@supabase/supabase-js';

declare global {
    namespace App {
        interface Locals {
            supabase: SupabaseClient;
            session: Session | null;
            isAdmin?: boolean; // Optional: true if user is an admin
        }
        interface PageData {
            session: Session | null;
        }
        // interface Error {}
        // interface Platform {}
    }
}
export {};