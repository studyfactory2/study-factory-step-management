import type { Metadata, Viewport } from "next";
import { AuthTokenRefreshProvider } from "@/components/auth-token-refresh-provider";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { PwaServiceWorkerRegister } from "@/components/pwa-service-worker-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "자격증공장 사원업무현황",
  description: "업무 지시와 진행상황 코멘트을 관리하는 모바일 업무 앱",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "업무현황",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F8FA",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AuthTokenRefreshProvider />
        <PwaServiceWorkerRegister />
        <PullToRefresh />
        {children}
      </body>
    </html>
  );
}
