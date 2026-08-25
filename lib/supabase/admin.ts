import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client. Bypasses Row Level Security entirely.
 *
 * ONLY use this inside Server Actions / Route Handlers that have already:
 *   1. authenticated the caller via lib/supabase/server.ts, and
 *   2. verified the caller's role is "admin" (see lib/auth/require-role.ts).
 *
 * This is what lets an admin create a driver's auth account + temporary
 * password without the driver ever signing themselves up — drivers can
 * never call this path directly.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
