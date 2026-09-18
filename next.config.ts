import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://tile.openstreetmap.org https://server.arcgisonline.com",
      "connect-src 'self' https://tile.openstreetmap.org https://server.arcgisonline.com",
      "font-src 'self'",
      "media-src 'self'",
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://buy.stripe.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  /** Allow phone testing via LAN IP in `next dev` (e.g. http://192.168.x.x:3000). */
  // Add your phone/LAN IP when testing via http://192.168.x.x:3000 in dev
  allowedDevOrigins: ["169.254.83.107"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/maps/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400, immutable",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/sounds/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, immutable" }],
      },
      {
        source: "/games/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
      {
        source: "/manifest.json",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
