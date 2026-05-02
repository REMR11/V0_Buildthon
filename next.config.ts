import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// Security headers applied to every response
// ---------------------------------------------------------------------------
const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block framing from external origins (clickjacking protection)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Disable legacy XSS filter (modern browsers ignore it; it can cause issues)
  { key: "X-XSS-Protection", value: "0" },
  // Enforce HTTPS for 1 year, include subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // Control referrer information on cross-origin requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser features not needed by the app
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=(self), payment=()",
  },
  // Content-Security-Policy — strict baseline
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline scripts + Turbopack HMR require unsafe-inline in dev
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Tile servers for react-leaflet
      "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://api.edenai.run",
      // API calls made from the browser
      "connect-src 'self' https://api.edenai.run https://*.upstash.io https://*.amazonaws.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // ---------------------------------------------------------------------------
  // Opt out of anonymous telemetry at the framework level
  // (also set via NEXT_TELEMETRY_DISABLED=1 in npm scripts for belt-and-braces)
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Image optimisation — declare every external hostname used in <Image />
  // ---------------------------------------------------------------------------
  images: {
    remotePatterns: [
      // OpenStreetMap tile layers (Leaflet)
      { protocol: "https", hostname: "*.tile.openstreetmap.org" },
      // Eden AI CDN (if document thumbnails are ever returned)
      { protocol: "https", hostname: "api.edenai.run" },
    ],
  },

  // ---------------------------------------------------------------------------
  // Security headers on every route
  // ---------------------------------------------------------------------------
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

};

export default nextConfig;
