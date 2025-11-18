import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "天気 x 農業支援ダッシュボード",
  description: "南伊豆の天気をもとに農作業をサポートするアプリ（学習用）"
};

export default function RouteLayout({
  children,
}: {
    children: React.ReactNode;
  }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-100 text-slate-900">
        <header className="sticky top-0 z-10 border-b border-slate-200bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <h1 className="text-base font-semibold md:text-lg">
              天気 x 農業支援ダッシュボード（学習用）
            </h1>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              南伊豆モデル
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-6 md:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}