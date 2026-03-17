import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard"];

// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value ||
                request.headers.get("authorization")?.replace("Bearer ", "");

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute  = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // For now: allow all routes (token stored in localStorage, not cookies).
  // In production: move token to httpOnly cookie and enforce here.
  // This middleware is scaffolded and ready to activate.

  if (isProtected && !token) {
    // Uncomment to enforce auth:
    // return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && token) {
    // Uncomment to redirect logged-in users away from login:
    // return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.png$).*)",
  ],
};
