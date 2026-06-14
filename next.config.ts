import type { NextConfig } from "next";

const r2Url = process.env.R2_PUBLIC_URL;
let r2Hostname = "";
if (r2Url) {
  try {
    const parsed = new URL(r2Url.startsWith("http") ? r2Url : `https://${r2Url}`);
    r2Hostname = parsed.hostname;
  } catch {
    // ignore
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "image.tmdb.org",
      },
      ...(r2Hostname
        ? [
            {
              protocol: "https" as const,
              hostname: r2Hostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
