import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });

    const mapped = users.map((u) => ({ ...u, role: u.role.toLowerCase() }));
    return jsonResponse(mapped);
  } catch (error) {
    return handleApiError(error);
  }
}
