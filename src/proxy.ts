import { type NextRequest, NextResponse } from "next/server";

// Routes that require a logged-in session
const PROTECTED_PREFIXES = ["/profile", "/watchlist", "/subscription"];
// Routes that require admin role (checked server-side; proxy only checks session presence)
const ADMIN_PREFIXES = ["/admin"];
// Auth pages — redirect away if already signed in
const AUTH_PREFIXES = ["/sign-in", "/sign-up"];

// Better Auth stores the session in this cookie by default
const SESSION_COOKIE = "better-auth.session_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = !!request.cookies.get(SESSION_COOKIE)?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdminRoute = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  // Unauthenticated user trying to reach a protected or admin route → sign-in
  if ((isProtected || isAdminRoute) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Already signed in user hitting auth pages → home
  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and the API proxy route
    "/((?!api|_next/static|_next/image|favicon\\.ico).*)",
    
  ],
};
