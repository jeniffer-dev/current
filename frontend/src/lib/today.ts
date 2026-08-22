// "Today" as the athlete experiences it, not as the server's clock reads it.
//
// Server Components run on Vercel, in UTC. An athlete's local date and the
// server's UTC date disagree for part of every day — usually harmless, but
// right at a week or phase boundary it silently picks the wrong bucket
// (see the `tz` cookie set in app/layout.tsx). Falls back to the server's
// own UTC date when no timezone cookie is available yet (first visit in a
// fresh browser session, before the client has had a chance to set it).

export function todayInTimezone(timeZone: string | undefined): string {
  if (timeZone) {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date());
    } catch {
      // Unknown/invalid IANA name — fall through to the server default.
    }
  }
  return new Date().toISOString().split('T')[0];
}
