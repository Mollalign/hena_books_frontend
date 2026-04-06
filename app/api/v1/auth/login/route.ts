import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createTokens, setAuthCookies } from "@/lib/auth";
import { LoginSchema } from "@/lib/validations/auth";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.is_active) {
      return errorResponse("Invalid email or password", 401);
    }

    const valid = await verifyPassword(data.password, user.password_hash);
    if (!valid) {
      return errorResponse("Invalid email or password", 401);
    }

    const { accessToken, refreshToken } = await createTokens(user.id);

    const response = jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase(),
      },
      token_type: "bearer",
    });

    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
