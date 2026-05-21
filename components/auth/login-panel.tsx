"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { demoLoginAccounts, getRoleByKey } from "@/lib/domain/permissions";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";

function getSafeNextPath(fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const nextPath = new URLSearchParams(window.location.search).get("next");
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallback;
  }

  return nextPath;
}

export function LoginPanel() {
  const [email, setEmail] = useState("manager@eldervisit.org");
  const [password, setPassword] = useState("manager123");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [inviteMode, setInviteMode] = useState(false);
  const [inviteReady, setInviteReady] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);
  const selectedAccount = demoLoginAccounts.find((account) => account.email === email);
  const selectedRole = selectedAccount ? getRoleByKey(selectedAccount.roleKey) : null;

  useEffect(() => {
    async function prepareInviteSession() {
      if (typeof window === "undefined") return;

      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const isInvite =
        searchParams.get("invited") === "1" ||
        hashParams.get("type") === "invite" ||
        hashParams.get("type") === "recovery";

      if (!isInvite) return;

      setInviteMode(true);
      setMessage("請先設定密碼，完成後再用 Email 與新密碼登入系統。");

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (!accessToken || !refreshToken) {
        setInviteReady(false);
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const { error, data } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error || !data.session) {
          setInviteReady(false);
          setMessage("邀請連結已失效或無法讀取，請請承辦管理者重寄登入邀請。");
          return;
        }

        setEmail(data.session.user.email ?? "");
        setPassword("");
        setInviteReady(true);
        window.history.replaceState(null, "", "/login?invited=1");
      } catch {
        setInviteReady(false);
        setMessage("目前無法啟用邀請連結，請稍後再試或請管理者重寄。");
      }
    }

    void prepareInviteSession();
  }, []);

  async function login() {
    setMessage(null);

    const fallbackAccount = demoLoginAccounts.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password,
    );
    const fallbackPath = fallbackAccount?.landingPath ?? "/dashboard";
    const nextPath = getSafeNextPath(fallbackPath);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        email,
        password,
        next: nextPath,
      }),
    });

    if (!response.ok) {
      setMessage("帳號或密碼錯誤，請確認 Supabase 使用者或示範帳號。");
      return;
    }

    const result = (await response.json()) as { data?: { nextPath?: string } };
    window.location.href = result.data?.nextPath ?? nextPath;
  }

  async function setupPassword() {
    setMessage(null);

    if (newPassword.length < 8) {
      setMessage("密碼至少需要 8 個字元。");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("兩次輸入的密碼不一致。");
      return;
    }

    setSettingPassword(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setMessage(error.message || "密碼設定失敗，請重新開啟邀請信連結。");
        return;
      }

      await supabase.auth.signOut();
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setInviteReady(false);
      setInviteMode(false);
      setMessage("密碼已設定完成，請用 Email 與新密碼登入系統。");
    } catch {
      setMessage("密碼設定失敗，請重新開啟邀請信連結。");
    } finally {
      setSettingPassword(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="order-1 overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="border-b bg-primary/5 p-5 lg:p-6">
            <div className="flex flex-col">
              <BrandLogo variant="full" size="lg" className="h-28 w-full max-w-md" />
              <div className="mt-2 min-w-0">
                <p className="text-base font-semibold">獨居長者訪查管理平台</p>
                <p className="text-sm text-muted-foreground">公益治理 SaaS 後台</p>
              </div>
            </div>
          </div>

          <div className="p-5 lg:p-6">
            <div>
              <p className="text-sm font-medium text-primary">使用者登入</p>
              <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">登入工作空間</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                依登入帳號自動切換角色、權限、首頁與可操作功能；正式版會接 Supabase Auth 與使用者審核。
              </p>
            </div>

            <div className="mt-6 grid gap-4">
              {inviteMode && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-sm font-semibold text-primary">訪員帳號啟用</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    請設定至少 8 個字元的新密碼。完成後回到登入畫面，用 Email 與新密碼登入。
                  </p>
                  <div className="mt-3 grid gap-3">
                    <input
                      className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="設定新密碼"
                      disabled={!inviteReady || settingPassword}
                    />
                    <input
                      className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus-within:ring-ring"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="再次輸入新密碼"
                      disabled={!inviteReady || settingPassword}
                    />
                    <Button
                      className="h-11 w-full"
                      onClick={setupPassword}
                      disabled={!inviteReady || settingPassword}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {settingPassword ? "設定中" : "完成密碼設定"}
                    </Button>
                    {!inviteReady && (
                      <p className="text-xs leading-5 text-muted-foreground">
                        如果按鈕不能使用，代表邀請連結缺少啟用資訊或已失效，請請承辦管理者重寄登入邀請。
                      </p>
                    )}
                  </div>
                </div>
              )}

              <label className="block text-sm font-medium">
                帳號 Email
                <input
                  className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="block text-sm font-medium">
                密碼
                <div className="mt-2 flex h-11 items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
                  <input
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {selectedRole && (
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs text-muted-foreground">目前選擇角色</p>
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{selectedRole.label}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {selectedRole.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {selectedAccount?.fullName}
                    </span>
                  </div>
                </div>
              )}

              <Button className="h-11 w-full" onClick={login}>
                <LogIn className="h-4 w-4" />
                登入系統
              </Button>

              <div className="rounded-lg border bg-primary/5 p-3">
                <p className="text-sm font-semibold text-primary">新訪員還沒有帳號？</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  先填寫註冊資料、自拍證件照與教育訓練資訊，送出後由承辦管理者審核。
                </p>
                <Button asChild variant="outline" className="mt-3 h-10 w-full bg-card">
                  <Link href="/register">
                    <UserPlusIcon />
                    前往新訪員註冊
                  </Link>
                </Button>
              </div>

              {message && (
                <p className="rounded-md bg-secondary p-3 text-sm text-muted-foreground">
                  {message}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="order-2 grid gap-4">
          <div className="rounded-lg border bg-card p-5 shadow-sm lg:p-6">
            <p className="text-sm font-medium text-primary">登入後會依權限分流</p>
            <h2 className="mt-2 text-xl font-semibold">不同角色看到不同畫面</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <FeatureCard icon={Building2} title="工作空間" detail="承辦與管理者可進入治理後台、設定與使用者管理。" />
              <FeatureCard icon={UsersRound} title="訪員任務" detail="訪員登入後直接看到個人任務、草稿與訪查表單。" />
              <FeatureCard icon={ShieldCheck} title="稽核權限" detail="督導與稽核人員只看到可處理的派案、核銷與稽核項目。" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">示範帳號</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  點選帳號會自動填入，方便測試不同權限。
                </p>
              </div>
              <LockKeyhole className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {demoLoginAccounts.map((account) => {
                const role = getRoleByKey(account.roleKey);
                const isActive = account.email === email;
                return (
                  <button
                    key={account.email}
                    type="button"
                    className={`rounded-md border p-3 text-left transition-colors ${
                      isActive ? "border-primary bg-primary/5" : "bg-background hover:bg-secondary"
                    }`}
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                      setMessage(null);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{account.fullName}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {account.email}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                        {role.label}
                      </span>
                      <span className="text-xs text-muted-foreground">密碼：{account.password}</span>
                      <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        點選後再按登入系統
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function UserPlusIcon() {
  return <UsersRound className="h-4 w-4" />;
}

function FeatureCard({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Building2;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}
