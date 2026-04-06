import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

const ALGORITHM = "HS256";
const ACCESS_TOKEN_EXPIRE_MINUTES = 60;
const REFRESH_TOKEN_EXPIRE_DAYS = 7;

function getSecretKey(): Uint8Array {
  const key = process.env.SECRET_KEY;
  if (!key) throw new Error("SECRET_KEY environment variable is not set");
  return new TextEncoder().encode(key);
}

// ─── Password Hashing ───────────────────────────────────────────────────────

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

// ─── JWT Token Creation ─────────────────────────────────────────────────────

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

// ─── JWT Token Decoding ─────────────────────────────────────────────────────

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

// ─── Request Auth Helpers ───────────────────────────────────────────────────

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export async function getCurrentUser(
  request: Request
): Promise<User | null> {
  const token = extractBearerToken(request);
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

// ─── Auth Error ─────────────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}
