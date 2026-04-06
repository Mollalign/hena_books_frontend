import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";
import { cookies } from "next/headers";

const ALGORITHM = "HS256";
const ACCESS_TOKEN_EXPIRE_MINUTES = 60;
const REFRESH_TOKEN_EXPIRE_DAYS = 7;

function getSecretKey(): Uint8Array {
  const key = process.env.SECRET_KEY;
  if (!key) throw new Error("SECRET_KEY environment variable is not set");
  return new TextEncoder().encode(key);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password.slice(0, 72), 12);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword.slice(0, 72), hashedPassword);
  } catch {
    return false;
  }
}

export interface TokenPayload extends JWTPayload {
  sub: string;
  type: "access" | "refresh";
}

export async function createAccessToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, type: "access" })
    .setProtectedHeader({ alg: ALGORITHM })
    .setExpirationTime(`${ACCESS_TOKEN_EXPIRE_MINUTES}m`)
    .sign(getSecretKey());
}

export async function createRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, type: "refresh" })
    .setProtectedHeader({ alg: ALGORITHM })
    .setExpirationTime(`${REFRESH_TOKEN_EXPIRE_DAYS}d`)
    .sign(getSecretKey());
}

export async function createTokens(
  userId: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(userId),
    createRefreshToken(userId),
  ]);
  return { accessToken, refreshToken };
}

export async function decodeToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: [ALGORITHM],
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

function extractCookieToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : null;
}

export async function getCurrentUser(
  request: Request
): Promise<User | null> {
  const token = extractBearerToken(request) || extractCookieToken(request);
  if (!token) return null;

  const payload = await decodeToken(token);
  if (!payload || payload.type !== "access") return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user || !user.is_active) return null;
  return user;
}

export async function requireAuth(request: Request): Promise<User> {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new AuthError("Authentication required", 401);
  }
  return user;
}

export async function requireAdmin(request: Request): Promise<User> {
  const user = await requireAuth(request);
  if (user.role !== "ADMIN") {
    throw new AuthError("Admin access required", 403);
  }
  return user;
}

export function setAuthCookies(
  response: Response,
  accessToken: string,
  refreshToken: string
): void {
  const isProduction = process.env.NODE_ENV === "production";

  const accessCookie = [
    `token=${accessToken}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${ACCESS_TOKEN_EXPIRE_MINUTES * 60}`,
    isProduction ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  const refreshCookie = [
    `refresh_token=${refreshToken}`,
    `Path=/api/v1/auth/refresh`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60}`,
    isProduction ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  response.headers.append("Set-Cookie", accessCookie);
  response.headers.append("Set-Cookie", refreshCookie);
}

export function clearAuthCookies(response: Response): void {
  response.headers.append(
    "Set-Cookie",
    "token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
  );
  response.headers.append(
    "Set-Cookie",
    "refresh_token=; Path=/api/v1/auth/refresh; HttpOnly; SameSite=Lax; Max-Age=0"
  );
}

export async function getServerUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const payload = await decodeToken(token);
    if (!payload || payload.type !== "access") return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.is_active) return null;
    return user;
  } catch {
    return null;
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}
