import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pagesで/weather-farm-appは以下に出す想定
  basePath: isProd ? "/weather-farm-app" : "",
  assetPrefix: isProd ? "/weather-farm-app" : "",
};

export default nextConfig;
