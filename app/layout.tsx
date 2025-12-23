import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "打工人发泄网页",
  description: "疯狂敲击键盘，打碎加班！",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
