import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Uses the service role key so it can bypass RLS ONLY for the specific,
// verified action of approving a listing after the claim_token check.
// This file must never be imported into client components.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
