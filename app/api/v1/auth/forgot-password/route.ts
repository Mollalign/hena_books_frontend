import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendPasswordResetCode } from "@/lib/email";
import { ForgotPasswordSchema } from "@/lib/validations/auth";
import { jsonResponse, handleApiError } from "@/lib/api-utils";
import crypto from "crypto";

const PASSWORD_RESET_EXPIRE_MINUTES = 15;

function generateResetCode(): string {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = ForgotPasswordSchema.parse(body);

    const successResponse = jsonResponse({
      message:
        "If an account with that email exists, a reset code has been sent.",
      expires_in_minutes: PASSWORD_RESET_EXPIRE_MINUTES,
    });

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.is_active) {
      return successResponse;
    }

    // Invalidate existing unused codes
    await prisma.passwordReset.updateMany({
      where: { user_id: user.id, used_at: null },
      data: { used_at: new Date() },
    });

    const code = generateResetCode();

    await prisma.passwordReset.create({
      data: {
        user_id: user.id,
        email: user.email,
        code,
        expires_at: new Date(
          Date.now() + PASSWORD_RESET_EXPIRE_MINUTES * 60 * 1000
        ),
      },
    });

    await sendPasswordResetCode(
      user.email,
      code,
      PASSWORD_RESET_EXPIRE_MINUTES
    );

    return successResponse;
  } catch (error) {
    return handleApiError(error);
  }
}
