import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecretKey(): Uint8Array {
  const key = process.env.SECRET_KEY;
  if (!key) throw new Error("SECRET_KEY is not set");
  return new TextEncoder().encode(key);
}

interface TokenPayload {
  sub: string;
  type: string;
  exp?: number;
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password"].some(
    (p) => pathname === p
  );

  if (isAuthPage && token) {
    const payload = await verifyToken(token);
    if (payload && payload.type === "access") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const isProtected = pathname.startsWith("/admin") || pathname === "/profile";

  if (isProtected) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    const payload = await verifyToken(token);
    if (!payload || payload.type !== "access") {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      const response = NextResponse.redirect(url);
      response.cookies.delete("token");
      return response;
    }

    if (pathname.startsWith("/admin")) {
      const { prisma } = await import("@/lib/db");
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { role: true, is_active: true },
      });

      if (!user || !user.is_active || user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
