export type SystemStatus = {
  supabaseUrlConfigured: boolean;
  supabaseAnonKeyConfigured: boolean;
  dataMode: "mock" | "supabase_ready";
  missing: string[];
};

export function getSystemStatus(): SystemStatus {
  const supabaseUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKeyConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const missing = [
    !supabaseUrlConfigured ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !supabaseAnonKeyConfigured ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
  ].filter((item): item is string => Boolean(item));

  return {
    supabaseUrlConfigured,
    supabaseAnonKeyConfigured,
    dataMode: missing.length === 0 ? "supabase_ready" : "mock",
    missing,
  };
}
