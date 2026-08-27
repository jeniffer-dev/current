import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

export const metadata: Metadata = {
  title: 'CURRENT',
  description: 'Calm elite athlete operating system',
};

// Every route renders per request, because the CSP carries a per-request
// nonce and Next only stamps that nonce onto its own inline bootstrap
// scripts while rendering dynamically.
//
// Without this, a statically prerendered page is built once, cached by the
// CDN, and served with inline scripts that carry no nonce at all — while
// the middleware attaches a fresh nonce to the response header on every
// request. The browser then blocks every one of those scripts, React never
// boots, and the page renders as blank HTML. That is exactly what happened
// to /login in production: a login form with no form in it.
//
// It lives in the root layout rather than on the four pages that were
// static, so a page added later cannot reintroduce the bug by being
// cacheable. The cost is near zero here: every authenticated page already
// reads cookies and was dynamic anyway.
//
// `next dev` always renders dynamically, which is why this could not be
// reproduced locally and needs a production build to verify.
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        <script src="/tz.js" />
        {children}
      </body>
    </html>
  );
}
