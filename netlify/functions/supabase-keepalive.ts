type NetlifyGlobal = typeof globalThis & {
  Netlify?: {
    env?: {
      get(name: string): string | undefined;
    };
  };
};

function getEnv(name: string) {
  return (globalThis as NetlifyGlobal).Netlify?.env?.get(name) ?? process.env[name];
}

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export default async function supabaseKeepalive() {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase keep-alive skipped: missing environment variables.");
    return Response.json(
      {
        ok: false,
        reason: "missing_supabase_environment",
      },
      { status: 500 },
    );
  }

  const endpoint = new URL(
    "/rest/v1/platform_blueprints",
    `${normalizeSupabaseUrl(supabaseUrl)}/`,
  );
  endpoint.searchParams.set("select", "id");
  endpoint.searchParams.set("is_active", "eq.true");
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: supabaseAnonKey,
      authorization: `Bearer ${supabaseAnonKey}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Supabase keep-alive failed.", {
      status: response.status,
      body: errorText.slice(0, 500),
    });
    return Response.json(
      {
        ok: false,
        status: response.status,
      },
      { status: 502 },
    );
  }

  const rows = (await response.json()) as Array<{ id: string }>;
  console.log("Supabase keep-alive completed.", {
    checkedAt: new Date().toISOString(),
    rows: rows.length,
  });

  return Response.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    rows: rows.length,
  });
}

export const config = {
  schedule: "0 20 * * *",
};
