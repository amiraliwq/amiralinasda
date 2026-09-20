import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zhexlpaugdnhnbylpoda.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
