import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  const res = NextResponse.redirect(url);
  if (request.cookies.has(SESSION_COOKIE)) res.cookies.delete(SESSION_COOKIE);
  return res;
}

// Matchers must be static literals so Next.js can analyze them at build time.
export const config = {
  matcher: [
    "/profile/:path*",
    "/matches/:path*",
    "/rehome/:path*",
    "/dashboard/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/messages/:path*",
    "/favorites/:path*",
    "/pets/:path*/apply",
    "/pets/:path*/appointment",
  ],
};
