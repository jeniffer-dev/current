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

// Records the athlete's IANA timezone in a cookie so Server Components can
// compute "today" the way the athlete sees it, not the server's UTC clock.
// Runs once per full page load; refreshes the cookie if it's stale (e.g.
// after travel). Can't affect the very request that rendered it — only ones
// after — so a first visit in a fresh browser still uses the server default.
const SET_TZ_COOKIE = `
(function () {
  try {
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var match = document.cookie.match(/(?:^|; )tz=([^;]*)/);
    if (!match || decodeURIComponent(match[1]) !== tz) {
      document.cookie = 'tz=' + encodeURIComponent(tz) + '; path=/; max-age=31536000; SameSite=Lax';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: SET_TZ_COOKIE }} />
        {children}
      </body>
    </html>
  );
}
