import { getSystemStatus } from "@/lib/system/env";
import { mockRepository } from "@/lib/repositories/mock";
import { supabaseRepository } from "@/lib/repositories/supabase";

export function getRepository() {
  const status = getSystemStatus();

  if (status.dataMode === "supabase_ready") {
    return supabaseRepository;
  }

  return mockRepository;
}
