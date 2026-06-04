import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "자격증공장 사원업무현황",
  description: "업무 지시와 진행상황 피드백을 관리하는 모바일 업무 앱"
};

export const viewport: Viewport = {
  themeColor: "#EF7890",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
