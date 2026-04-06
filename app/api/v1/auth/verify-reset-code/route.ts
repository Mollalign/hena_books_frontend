import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { VerifyResetCodeSchema } from "@/lib/validations/auth";
import { jsonResponse, handleApiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = VerifyResetCodeSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      return jsonResponse({ valid: false, message: "Invalid email or code." });
    }

    const reset = await prisma.passwordReset.findFirst({
      where: {
        code: data.code,
        email: data.email,
        user_id: user.id,
        used_at: null,
        expires_at: { gt: new Date() },
      },
    });

    if (!reset) {
      return jsonResponse({
        valid: false,
        message: "Invalid or expired reset code.",
      });
    }

    return jsonResponse({ valid: true, message: "Reset code is valid." });
  } catch (error) {
    return handleApiError(error);
  }
}
