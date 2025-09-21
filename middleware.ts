import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const isLoggedIn = !!req.cookies.get("access");
  if (!isLoggedIn && req.nextUrl.pathname.startsWith("/profile")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}