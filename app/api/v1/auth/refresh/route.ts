import { NextRequest } from "next/server";
import { decodeToken, createTokens, setAuthCookies } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

async function refreshWithUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, is_active: true },
  });

  if (!user || !user.is_active) {
    return errorResponse("User not found or inactive", 401);
  }

  const { accessToken, refreshToken } = await createTokens(userId, user.role);
  const response = jsonResponse({ token_type: "bearer" });
  setAuthCookies(response, accessToken, refreshToken);
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)refresh_token=([^;]*)/);
    const refreshTokenValue = match ? match[1] : null;

    if (!refreshTokenValue) {
      const body = await request.json().catch(() => null);
      if (!body?.refresh_token) {
        return errorResponse("No refresh token provided", 401);
      }
      const payload = await decodeToken(body.refresh_token);
      if (!payload || payload.type !== "refresh") {
        return errorResponse("Invalid refresh token", 401);
      }
      return refreshWithUserId(payload.sub);
    }

    const payload = await decodeToken(refreshTokenValue);
    if (!payload || payload.type !== "refresh") {
      return errorResponse("Invalid refresh token", 401);
    }

    return refreshWithUserId(payload.sub);
  } catch (error) {
    return handleApiError(error);
  }
}
