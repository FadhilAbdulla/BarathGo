import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Static export: `next build` writes plain HTML/CSS/JS to out/, served by the Cloudflare Worker (see wrangler.jsonc).
// In `next dev`, /api/* is proxied to the local Worker (`npm run dev:api`, port 8787).
const nextConfig: NextConfig = {
  output: isDev ? undefined : "export",
  trailingSlash: false,
  images: { unoptimized: true },
  poweredByHeader: false,
  ...(isDev ? { rewrites: async () => [{ source: "/api/:path*", destination: "http://localhost:8787/api/:path*" }] } : {}),
};

export default nextConfig;
