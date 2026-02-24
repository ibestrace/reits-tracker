import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "中国公募REITs行情跟踪",
  description: "实时跟踪深圳(180xxx) & 上海(508xxx) 交易所上市的公募REITs产品",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
