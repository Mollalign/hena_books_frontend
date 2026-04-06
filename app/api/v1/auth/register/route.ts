import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { RegisterSchema } from "@/lib/validations/auth";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = RegisterSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return errorResponse("A user with this email already exists", 409);
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password_hash: await hashPassword(data.password),
        name: data.name,
      },
    });

    return jsonResponse(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase(),
        is_active: user.is_active,
        created_at: user.created_at,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
