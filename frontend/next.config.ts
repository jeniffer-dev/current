import type { NextConfig } from 'next';
import path from 'path';

// Content-Security-Policy is set per-request in middleware.ts, not here —
// Next's App Router needs a per-request nonce on script-src for its own
// inline hydration/streaming scripts, and next.config.ts's headers() can
// only emit a static value. A second static CSP here would also fight the
// nonce'd one: browsers enforce the intersection of multiple CSP headers,
// so a nonce-less "script-src 'self'" from this file would block Next's
// nonced scripts right back out. The rest of the security headers are
// static, so they stay here.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
