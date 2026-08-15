import type { NextConfig } from "next";

import { defaultLocale } from "./src/i18n/config";

/**
 * Applied to every response. These are the headers that are unambiguously
 * safe for this app; a nonce-based script CSP would additionally require a
 * proxy, which is not worth the complexity for a static brand site.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob: https://*.google.com https://*.gstatic.com https://*.googleapis.com https://images.xn--va-bja.net",
      // Next injects inline bootstrap scripts and Tailwind emits inline styles.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      // The footer map is the only third-party frame we embed.
      "frame-src https://*.google.com https://maps.google.com",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Image uploads are limited to 5MB in the server code. Allow multipart
  // overhead so valid files are not rejected by Server Actions' 1MB default.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },

  images: {
    /**
     * The placeholder banners/products are SVGs we author ourselves. The
     * optimizer refuses SVG unless explicitly allowed, so it is enabled with
     * the sandboxing CSP Next recommends. Uploaded photos (jpg/png/webp/avif)
     * are optimized normally.
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.xn--va-bja.net",
      },
    ],
  },

  /** `/` serves the French site; `/fr`, `/ar` and `/en` are the real routes. */
  async redirects() {
    return [{ source: "/", destination: `/${defaultLocale}`, permanent: false }];
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Belt and braces alongside the layout's noindex metadata.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
};

export default nextConfig;
