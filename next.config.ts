import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 새로운 App Router의 정적 생성 오류 방지
    forceSwcTransforms: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
