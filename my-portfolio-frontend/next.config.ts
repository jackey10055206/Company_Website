import type { NextConfig } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:1337';

const nextConfig: NextConfig = {
  images: {
    // Next 15 prefers remotePatterns over domains
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '1337',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/**',
      },
    ],
  },

  async rewrites() {
    // Proxy Strapi uploads so even "/uploads/..." works without crashing next/image
    return [
      {
        source: '/uploads/:path*',
        destination: `${API_BASE}/uploads/:path*`,
      },
      // Workaround: in some dev sessions, requesting layout.css WITHOUT a query string can 404.
      // Ensure both variants work.
      {
        source: '/_next/static/css/app/layout.css',
        destination: '/_next/static/css/app/layout.css?v=1',
      },
    ];
  },
};

export default nextConfig;
