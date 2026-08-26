// Records the athlete's IANA timezone in a cookie so Server Components can
// compute "today" the way the athlete sees it, not the server's UTC clock.
// Runs once per full page load; refreshes the cookie if it's stale (e.g.
// after travel). Can't affect the very request that rendered it — only ones
// after — so a first visit in a fresh browser still uses the server default.
//
// Lives as an external file (rather than an inline script) so the app's
// Content-Security-Policy doesn't need 'unsafe-inline' for script-src.
(function () {
  try {
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var match = document.cookie.match(/(?:^|; )tz=([^;]*)/);
    if (!match || decodeURIComponent(match[1]) !== tz) {
      document.cookie = 'tz=' + encodeURIComponent(tz) + '; path=/; max-age=31536000; SameSite=Lax';
    }
  } catch (e) {}
})();
