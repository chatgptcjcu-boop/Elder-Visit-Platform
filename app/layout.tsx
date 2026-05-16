import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ServiceWorkerRegister } from "@/components/system/service-worker-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elder Visit Platform",
  description: "公益治理 SaaS 平台：獨居長者訪查第一市場版本",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#4FA878",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
