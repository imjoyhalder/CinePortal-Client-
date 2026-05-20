import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const PROTECTED_ROUTES = ['/dashboard', '/admin', '/profile', '/watchlist'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

type SessionUser = { role?: string } | null;

async function getSession(token: string): Promise<SessionUser> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

// 1. The function MUST be named 'proxy' as per official docs
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (!isProtected && !isAuthRoute) return NextResponse.next();

  // auth_token is set on the frontend domain by <SessionSync> after login.
  // The backend's better-auth.session_token cookie lives on the backend domain
  // and is never visible here — we use Bearer auth instead.
  const token = request.cookies.get('auth_token')?.value;
  const user = token ? await getSession(token) : null;

  if (isProtected && !user) {
    const loginUrl = new URL('/sign-in', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') && (user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// 2. The config must be a constant for static analysis at build-time
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
