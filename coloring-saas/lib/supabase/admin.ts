import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

let admin: SupabaseClient | null = null;

// Service-role client. Bypasses Row Level Security: server code only, never import in the browser.
export function createAdminClient(): SupabaseClient {
  if (!admin) {
    admin = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return admin;
}

export const BUCKETS = {
  uploads: "uploads",
  outputs: "outputs",
} as const;
