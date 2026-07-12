import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for OakStone local preview (oakstonemortgage.local → same dev server as localhost).
  // Without this, Next.js blocks client JS/HMR and buttons appear dead on the custom host.
  allowedDevOrigins: ["oakstonemortgage.local"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    proxyClientMaxBodySize: "10mb",
  },
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/icon",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
