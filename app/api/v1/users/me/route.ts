import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, hashPassword } from "@/lib/auth";
import { UserUpdateSchema } from "@/lib/validations/user";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

function userResponse(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.toLowerCase(),
    is_active: user.is_active,
    created_at: user.created_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    return jsonResponse(userResponse(user));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request);
    const body = await request.json();
    const data = UserUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.password) updateData.password_hash = await hashPassword(data.password);

    if (Object.keys(updateData).length === 0) {
      return jsonResponse(userResponse(currentUser));
    }

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });

    if (!updated) return errorResponse("User not found", 404);

    return jsonResponse(userResponse(updated));
  } catch (error) {
    return handleApiError(error);
  }
}
