import type { Metadata } from "next";
import "./globals.css";
import "./design-system/axis.css";
import "./design-system/platform.css";

export const metadata: Metadata = {
  title: "RobotOps · 实验运营控制台",
  description: "统一管理实验需求、Robot 排期、Tester 执行与资源可用性的实验运营平台。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
