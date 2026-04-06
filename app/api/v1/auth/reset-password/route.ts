import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { ResetPasswordSchema } from "@/lib/validations/auth";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = ResetPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      return errorResponse("Invalid email or code", 400);
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
      return errorResponse("Invalid or expired reset code", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: await hashPassword(data.new_password) },
    });

    // Mark code as used and invalidate others
    await prisma.passwordReset.update({
      where: { id: reset.id },
      data: { used_at: new Date() },
    });
    await prisma.passwordReset.updateMany({
      where: { user_id: user.id, used_at: null },
      data: { used_at: new Date() },
    });

    return jsonResponse({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role.toLowerCase(),
      is_active: updatedUser.is_active,
      created_at: updatedUser.created_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
