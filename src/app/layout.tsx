import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "中国公募REITs行情跟踪 - 实时行情数据",
  description: "实时跟踪深圳(180xxx)和上海(508xxx)交易所上市的公募REITs产品行情，支持K线图表、自选管理、排行榜等功能。",
  keywords: "REITs, 公募REITs, 房地产投资信托, 产业园, 高速公路, 仓储物流, 保障房, K线图, 行情",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
