import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    await requireAdmin(request);
    const { bookId } = await params;

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return errorResponse("Book not found", 404);

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: { is_published: !book.is_published },
    });

    return jsonResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
