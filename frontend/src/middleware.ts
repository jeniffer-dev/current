import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Everything requires a session except the routes named here.
//
// This used to be the other way round — a hand-maintained list of
// protected paths — and it drifted: /tests was never added, so the whole
// testing section rendered for anonymous visitors. Row-level security
// meant no data leaked, but the page should not have been reachable at
// all. An allowlist fails safe: a route added tomorrow is protected
// unless someone deliberately opens it.
const PUBLIC = ['/login', '/signup', '/terms', '/privacy', '/auth'];
const AUTH_ROUTES = ['/login', '/signup'];

// Supabase project origin, derived from the same env var the app already
// uses to talk to Supabase — kept out of the CSP as a hardcoded string so
// this works across environments (local, preview, prod) without edits.
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').origin;
  } catch {
    return 'https://*.supabase.co';
  }
})();

// Built per-request (nonce changes every time) rather than once at module
// scope. Next's App Router injects its own inline <script> tags for RSC
// streaming/hydration on every page — those only satisfy CSP via this
// nonce, not via 'self'. Set on both the outgoing request headers (so
// Next's renderer picks the nonce up for its own inline scripts) and the
// response headers (so the browser enforces it).
function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseOrigin}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isPublic    = PUBLIC.some(r => pathname === r || pathname.startsWith(r + '/'));
  const isProtected = !isPublic;
  const isAuthRoute = AUTH_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const response = NextResponse.redirect(url);
    response.headers.set('Content-Security-Policy', csp);
    return response;
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    const response = NextResponse.redirect(url);
    response.headers.set('Content-Security-Policy', csp);
    return response;
  }

  supabaseResponse.headers.set('Content-Security-Policy', csp);
  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
