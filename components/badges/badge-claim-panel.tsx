"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { VisitorBadgeCard } from "@/components/badges/visitor-badge-card";
import type { VisitorBadge } from "@/lib/domain/visitor-badges";

export function BadgeClaimPanel({ token }: { token: string }) {
  const [serial, setSerial] = useState("");
  const [badge, setBadge] = useState<VisitorBadge | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  async function claimBadge() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/badges/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, serial }),
      });
      const json = (await response.json()) as { data?: VisitorBadge; error?: { message?: string } };
      if (!response.ok || !json.data) {
        setMessage(json.error?.message ?? "電子訪員證領取失敗。");
        return;
      }

      setBadge(json.data);
      setMessage("電子訪員證已領取完成。");
    } finally {
      setLoading(false);
    }
  }

  async function saveBadgeImage() {
    if (!cardRef.current || !badge) return;
    setMessage("正在產生電子訪員證圖片。");

    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `訪員證-${badge.visitorCode}.png`;
      link.href = dataUrl;
      link.click();
      setMessage("已產生電子訪員證圖片，可在手機下載紀錄或相簿中查看。");
    } catch {
      setMessage("圖片產生失敗，請先使用手機截圖保存，或稍後再試。");
    }
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-xl border bg-white p-4">
        <h1 className="text-2xl font-bold">領取電子訪員證</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          請輸入紙本訪員證上的領取序號。序號確認後，手機會顯示電子訪員證。
        </p>
        <label className="mt-4 block">
          <span className="text-sm font-medium">領取序號</span>
          <input
            className="mt-2 h-12 w-full rounded-md border px-3 text-lg font-semibold tracking-widest"
            value={serial}
            onChange={(event) => setSerial(event.target.value.toUpperCase())}
            placeholder="例如 A1B2C3D4"
          />
        </label>
        <button
          type="button"
          className="mt-4 h-12 w-full rounded-md bg-emerald-700 font-semibold text-white disabled:opacity-50"
          disabled={loading || serial.trim().length < 6}
          onClick={() => void claimBadge()}
        >
          {loading ? "確認中" : "確認領取"}
        </button>
        {message && <p className="mt-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}
      </section>

      {badge && (
        <section ref={cardRef} className="grid gap-3">
          <VisitorBadgeCard badge={badge} compact />
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border bg-white font-semibold text-slate-700"
            onClick={() => void saveBadgeImage()}
          >
            <Download className="h-4 w-4" />
            儲存到手機
          </button>
        </section>
      )}
    </div>
  );
}
