import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/history"];
const authRoutes = ["/auth"];

const redirectTo = (request: NextRequest, pathname: string) => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
};

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");
  const isAuthenticated = !!sessionCookie;
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && isAuthenticated) {
    return redirectTo(request, "/dashboard");
  }

  if (isProtectedRoute && !isAuthenticated) {
    return redirectTo(request, "/auth");
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/dashboard/:path*", "/history/:path*", "/auth/:path*"],
};
