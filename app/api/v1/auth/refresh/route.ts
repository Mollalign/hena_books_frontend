import { NextRequest } from "next/server";
import { decodeToken, createTokens, setAuthCookies } from "@/lib/auth";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

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
      const { accessToken, refreshToken } = await createTokens(payload.sub);
      const response = jsonResponse({ token_type: "bearer" });
      setAuthCookies(response, accessToken, refreshToken);
      return response;
    }

    const payload = await decodeToken(refreshTokenValue);
    if (!payload || payload.type !== "refresh") {
      return errorResponse("Invalid refresh token", 401);
    }

    const { accessToken, refreshToken } = await createTokens(payload.sub);
    const response = jsonResponse({ token_type: "bearer" });
    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
