import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages で使う静的出力
  output: "export",
  // 静的ファイルのパスを相対にする
  // → /_next/... ではなく ./_next/... になる
  assetPrefix: "./",
};

export default nextConfig;
