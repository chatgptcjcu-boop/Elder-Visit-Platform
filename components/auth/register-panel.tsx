"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
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
                  申請加入訪查工作空間
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  請依公所提報清冊填寫資料。送出後不會立即取得系統權限，需由承辦管理者與社會局覆核後才會開通。
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/login">
                <ArrowLeft className="h-4 w-4" />
                返回登入
              </Link>
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-primary">送出後會進入審核清單</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                承辦管理者可在「治理與權限 → 使用者管理」看到這筆申請，確認教育訓練、訪員證與社會局覆核狀態。
              </p>
            </div>
          </div>
        </section>

        <VisitorRegistrationForm
          workspace={workspace}
          onSubmitted={(_, message) => {
            window.alert(`${message}\n\n請等待承辦管理者審核，審核通過後即可登入系統。`);
          }}
        />
      </div>
    </main>
  );
}
