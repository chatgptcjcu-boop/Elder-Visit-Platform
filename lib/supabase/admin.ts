import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getRuntimeEnvValue } from "@/lib/runtime/env";
import type { Database } from "@/lib/supabase/database.types";

export function createAdminClient() {
  const supabaseUrl = getRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRuntimeEnvValue("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
