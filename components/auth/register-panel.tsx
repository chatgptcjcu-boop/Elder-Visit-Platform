"use client";

import Link from "next/link";
import { ArrowRight, Camera, CheckCircle2, ClipboardCheck, LogIn, Mail } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { VisitorRegistrationForm } from "@/components/workspace/users-panel";
import { getCurrentWorkspace } from "@/lib/domain/mock-data";

export function RegisterPanel() {
  const workspace = getCurrentWorkspace();

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-5">
        <section className="rounded-lg border bg-card p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <BrandLogo variant="full" size="lg" className="h-24 w-full max-w-sm" />
              <div className="mt-3">
                <p className="text-sm font-medium text-primary">新訪員註冊入口</p>
                <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
                  訪查人員註冊申請
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  請依公所提報清冊填寫資料並上傳證件照。送出後不會立即取得系統權限，審核通過後將以信件通知啟用帳號。
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                已有帳號登入
              </Link>
            </Button>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="font-semibold">申請流程</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ProcessStep icon={ClipboardCheck} number="1" title="填寫資料" detail="依清冊填寫身分與聯絡資料" />
            <ProcessStep icon={Camera} number="2" title="提供照片" detail="拍攝或選擇清楚證件照" />
            <ProcessStep icon={CheckCircle2} number="3" title="等待審核" detail="承辦確認資格與申請內容" />
            <ProcessStep icon={Mail} number="4" title="收到通知" detail="核准後依信件啟用登入帳號" />
          </div>
        </section>

        <VisitorRegistrationForm
          workspace={workspace}
          onSubmitted={(_, message) => {
            window.alert(`${message}\n\n請等待承辦管理者審核，核准後將寄送登入啟用通知。`);
          }}
        />

        <p className="pb-3 text-center text-sm text-muted-foreground">
          已收到登入邀請或已有帳號？
          <Link href="/login" className="ml-1 inline-flex items-center gap-1 font-medium text-primary hover:underline">
            前往登入
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </p>
      </div>
    </main>
  );
}

function ProcessStep({
  icon: Icon,
  number,
  title,
  detail,
}: {
  icon: typeof Camera;
  number: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex gap-3 rounded-md border bg-background p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-primary">步驟 {number}</p>
        <p className="mt-1 text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
