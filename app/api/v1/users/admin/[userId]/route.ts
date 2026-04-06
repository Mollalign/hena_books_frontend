import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, handleApiError } from "@/lib/api-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    const { userId } = await params;

    if (userId === admin.id) {
      return errorResponse("Cannot delete your own account", 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errorResponse("User not found", 404);

    await prisma.user.delete({ where: { id: userId } });

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
