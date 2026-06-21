import crypto from "node:crypto";
import QRCode from "qrcode";
import { getRuntimeEnvValue } from "@/lib/runtime/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getHeadshotPreviewUrl } from "@/lib/domain/visitor-headshots";

export type VisitorBadgeStatus = "active" | "revoked" | "expired";

export type VisitorBadgeSnapshot = {
  fullName: string;
  displayName: string;
  rootUnitName: string | null;
  departmentName: string | null;
  jobTitle: string | null;
  workerType: string | null;
  phone: string | null;
  officialEmail: string | null;
  headshotUrl: string | null;
  validYearLabel: string;
};

export type VisitorBadge = {
  id: string;
  visitorProfileId: string;
  visitorCode: string;
  badgeNumber: string;
  badgeSerial: string;
  status: VisitorBadgeStatus;
  validFrom: string;
  validUntil: string | null;
  issuedAt: string;
  printedAt: string | null;
  claimedAt: string | null;
  qrCodePayload: string;
  claimUrl: string;
  snapshot: VisitorBadgeSnapshot;
  qrSvg: string;
};

type VisitorProfileForBadge = {
  id: string;
  workspace_id: string;
  account_id: string | null;
  full_name: string;
  display_name: string | null;
  visitor_code: string | null;
  worker_type: string | null;
  status: string | null;
  is_assignable: boolean | null;
  root_unit_name: string | null;
  department_name: string | null;
  job_title: string | null;
  phone: string | null;
  official_email: string | null;
  headshot_processed_url: string | null;
};

type VisitorBadgeRow = {
  id: string;
  visitor_profile_id: string;
  visitor_code: string;
  badge_number: string;
  badge_serial: string;
  status: string;
  valid_from: string;
  valid_until: string | null;
  issued_at: string;
  printed_at: string | null;
  claimed_at: string | null;
  qr_code_payload: string;
  badge_snapshot: VisitorBadgeSnapshot;
};

type RegistrationRequestBadgeRow = {
  id: string;
  account_id: string | null;
  requested_workspace_id: string | null;
};

type BadgeClient = {
  from(table: "workspace_registration_requests"): {
    select(query: string): {
      in(column: string, values: string[]): Promise<{ data: RegistrationRequestBadgeRow[] | null; error: unknown }>;
    };
  };
  from(table: "visitor_profiles"): {
    select(query: string): BadgeProfileQuery;
  };
  from(table: "visitor_badges"): {
    select(query: string): BadgeQuery;
    insert(row: Record<string, unknown>): {
      select(query: string): {
        single(): Promise<{ data: VisitorBadgeRow | null; error: unknown }>;
      };
    };
    update(row: Record<string, unknown>): BadgeUpdateQuery;
  };
};

type BadgeProfileQuery = {
  in(column: string, values: string[]): BadgeProfileQuery;
  eq(column: string, value: string): BadgeProfileQuery;
  limit(count: number): BadgeProfileQuery;
  single(): Promise<{ data: VisitorProfileForBadge | null; error: unknown }>;
  maybeSingle(): Promise<{ data: VisitorProfileForBadge | null; error: unknown }>;
  then: Promise<{ data: VisitorProfileForBadge[] | null; error: unknown }>["then"];
};

type BadgeQuery = {
  in(column: string, values: string[]): Promise<{ data: VisitorBadgeRow[] | null; error: unknown }>;
  eq(column: string, value: string): BadgeQuery;
  order(column: string, options: { ascending: boolean }): BadgeQuery;
  limit(count: number): BadgeQuery;
  single(): Promise<{ data: VisitorBadgeRow | null; error: unknown }>;
  maybeSingle(): Promise<{ data: VisitorBadgeRow | null; error: unknown }>;
};

type BadgeUpdateQuery = {
  eq(column: string, value: string): {
    select(query: string): {
      single(): Promise<{ data: VisitorBadgeRow | null; error: unknown }>;
    };
  };
};

const badgeSelect =
  "id, visitor_profile_id, visitor_code, badge_number, badge_serial, status, valid_from, valid_until, issued_at, printed_at, claimed_at, qr_code_payload, badge_snapshot";

export async function issueVisitorBadges(requestIds: string[]) {
  const uniqueRequestIds = Array.from(new Set(requestIds.filter(Boolean)));
  if (uniqueRequestIds.length === 0) {
    throw new Error("沒有可發證的訪員。");
  }

  const supabase = createAdminClient() as unknown as BadgeClient;
  const { data: requests, error: requestError } = await supabase
    .from("workspace_registration_requests")
    .select("id, account_id, requested_workspace_id")
    .in("id", uniqueRequestIds);

  if (requestError || !requests) {
    throw new Error("無法讀取訪員註冊資料。");
  }

  const accountIds = requests.map((request) => request.account_id).filter((id): id is string => Boolean(id));
  if (accountIds.length === 0) {
    throw new Error("選取的人員尚未建立訪員帳號，無法發證。");
  }

  const { data: profiles, error: profileError } = await supabase
    .from("visitor_profiles")
    .select(
      "id, workspace_id, account_id, full_name, display_name, visitor_code, worker_type, status, is_assignable, root_unit_name, department_name, job_title, phone, official_email, headshot_processed_url",
    )
    .in("account_id", accountIds);

  if (profileError || !profiles) {
    throw new Error("無法讀取正式訪員名冊。");
  }

  const badges: VisitorBadge[] = [];
  const skipped: string[] = [];

  for (const profile of profiles) {
    if (!profile.visitor_code) {
      skipped.push(profile.full_name);
      continue;
    }

    const existing = await getActiveBadgeByProfile(supabase, profile.id);
    const row = existing ?? (await createBadgeRow(supabase, profile));
    badges.push(await mapBadgeRow(row));
  }

  return {
    issued: badges.length,
    skipped,
    badges,
  };
}

export async function getBadgesByIds(badgeIds: string[]) {
  const ids = Array.from(new Set(badgeIds.filter(Boolean)));
  if (ids.length === 0) return [];
  const supabase = createAdminClient() as unknown as BadgeClient;
  const { data, error } = await supabase.from("visitor_badges").select(badgeSelect).in("id", ids);
  if (error || !data) return [];
  return Promise.all(data.map(mapBadgeRow));
}

export async function getPublicVisitorBadge(visitorCode: string) {
  const supabase = createAdminClient() as unknown as BadgeClient;
  const { data, error } = await supabase
    .from("visitor_badges")
    .select(badgeSelect)
    .eq("visitor_code", visitorCode)
    .eq("status", "active")
    .order("issued_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapBadgeRow(data);
}

export async function claimVisitorBadge(token: string, serial: string) {
  const tokenHash = hashToken(token);
  const supabase = createAdminClient() as unknown as BadgeClient;
  const { data: badge, error } = await supabase
    .from("visitor_badges")
    .select(badgeSelect)
    .eq("claim_token_hash", tokenHash)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error || !badge) {
    throw new Error("找不到可領取的電子訪員證。");
  }

  if (badge.badge_serial !== serial.trim()) {
    throw new Error("序號不正確，請確認紙本訪員證上的序號。");
  }

  const { data: updated, error: updateError } = await supabase
    .from("visitor_badges")
    .update({ claimed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", badge.id)
    .select(badgeSelect)
    .single();

  if (updateError || !updated) {
    throw new Error("電子訪員證領取失敗，請稍後再試。");
  }

  return mapBadgeRow(updated);
}

export function createClaimUrl(token: string) {
  const siteUrl = getSiteUrl();
  return `${siteUrl}/badge/claim/${token}`;
}

export async function createQrSvg(payload: string) {
  return QRCode.toString(payload, {
    type: "svg",
    margin: 1,
    width: 180,
    color: {
      dark: "#0f3f34",
      light: "#ffffff",
    },
  });
}

async function getActiveBadgeByProfile(supabase: BadgeClient, visitorProfileId: string) {
  const { data } = await supabase
    .from("visitor_badges")
    .select(badgeSelect)
    .eq("visitor_profile_id", visitorProfileId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  return data;
}

async function createBadgeRow(supabase: BadgeClient, profile: VisitorProfileForBadge) {
  const token = crypto.randomBytes(24).toString("base64url");
  const badgeNumber = createBadgeNumber(profile.visitor_code ?? profile.id);
  const badgeSerial = createBadgeSerial();
  const qrCodePayload = `${getSiteUrl()}/verify/visitor/${encodeURIComponent(profile.visitor_code ?? badgeNumber)}`;
  const snapshot: VisitorBadgeSnapshot = {
    fullName: profile.full_name,
    displayName: profile.display_name ?? profile.full_name,
    rootUnitName: profile.root_unit_name,
    departmentName: profile.department_name,
    jobTitle: profile.job_title,
    workerType: profile.worker_type,
    phone: profile.phone,
    officialEmail: profile.official_email,
    headshotUrl: await getHeadshotPreviewUrl(profile.headshot_processed_url),
    validYearLabel: "115 年度",
  };

  const { data, error } = await supabase
    .from("visitor_badges")
    .insert({
      workspace_id: profile.workspace_id,
      visitor_profile_id: profile.id,
      visitor_code: profile.visitor_code,
      badge_number: badgeNumber,
      badge_serial: badgeSerial,
      claim_token_hash: hashToken(token),
      status: "active",
      valid_from: new Date().toISOString().slice(0, 10),
      valid_until: "2026-12-31",
      qr_code_payload: qrCodePayload,
      badge_snapshot: {
        ...snapshot,
        claimUrl: createClaimUrl(token),
      },
    })
    .select(badgeSelect)
    .single();

  if (error || !data) {
    throw new Error("訪員證發證失敗，請確認 0034 migration 已執行。");
  }

  return data;
}

async function mapBadgeRow(row: VisitorBadgeRow): Promise<VisitorBadge> {
  const snapshot = row.badge_snapshot ?? ({} as VisitorBadgeSnapshot);
  const claimUrl = getSnapshotClaimUrl(snapshot) ?? `${getSiteUrl()}/badge/claim/unavailable`;
  return {
    id: row.id,
    visitorProfileId: row.visitor_profile_id,
    visitorCode: row.visitor_code,
    badgeNumber: row.badge_number,
    badgeSerial: row.badge_serial,
    status: normalizeBadgeStatus(row.status),
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    issuedAt: row.issued_at,
    printedAt: row.printed_at,
    claimedAt: row.claimed_at,
    qrCodePayload: row.qr_code_payload,
    claimUrl,
    snapshot,
    qrSvg: await createQrSvg(row.qr_code_payload),
  };
}

function getSnapshotClaimUrl(snapshot: VisitorBadgeSnapshot & { claimUrl?: string }) {
  return snapshot.claimUrl;
}

function createBadgeNumber(visitorCode: string) {
  return `BADGE-${visitorCode}-${Date.now().toString(36).toUpperCase()}`;
}

function createBadgeSerial() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getSiteUrl() {
  return (getRuntimeEnvValue("NEXT_PUBLIC_APP_URL") ?? "https://elder-visit-platform.vercel.app").replace(/\/+$/, "");
}

function normalizeBadgeStatus(value: string): VisitorBadgeStatus {
  if (value === "revoked" || value === "expired") return value;
  return "active";
}
