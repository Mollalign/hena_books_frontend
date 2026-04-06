import { NextRequest } from "next/server";
import { decodeToken, createTokens } from "@/lib/auth";
import { RefreshTokenSchema } from "@/lib/validations/auth";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = RefreshTokenSchema.parse(body);

    const payload = await decodeToken(data.refresh_token);
    if (!payload || payload.type !== "refresh") {
      return errorResponse("Invalid refresh token", 401);
    }

    const { accessToken, refreshToken } = await createTokens(payload.sub);

    return jsonResponse({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "bearer",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
