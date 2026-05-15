import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 1. The function MUST be named 'proxy' as per official docs
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Use the exact cookie name from your auth provider
  const SESSION_COOKIE = "better-auth.session_token";
  const hasSession = !!request.cookies.get(SESSION_COOKIE)?.value;

  const PROTECTED_ROUTES = ["/dashboard", "/admin", "/profile", "/settings", "/watchlist"];
  const AUTH_ROUTES = ["/sign-in", "/sign-up"];

  // Handle Protected Routes
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !hasSession) {
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle Auth Routes (Prevent logged-in users from seeing sign-in/up)
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Standard response to continue the request
  return NextResponse.next();
}

// 2. The config must be a constant for static analysis at build-time
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (e.g. .png, .jpg)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}