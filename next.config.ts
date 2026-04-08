import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.almostcrackd.ai",
      },
      {
        protocol: "https",
        hostname: "presigned-url-uploads.almostcrackd.ai",
      },
      {
        protocol: "https",
        hostname: "qihsgnfjqmkjmoowyfbn.supabase.co",
      },
    ],
  },
};

export default nextConfig;