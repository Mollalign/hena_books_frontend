import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { ReadingSessionCreateSchema } from "@/lib/validations/analytics";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const data = ReadingSessionCreateSchema.parse(body);

    const book = await prisma.book.findFirst({
      where: { id: data.book_id, is_published: true },
    });
    if (!book) return errorResponse("Book not found", 404);

    // Check for existing active session
    const active = await prisma.readingSession.findFirst({
      where: {
        user_id: user.id,
        book_id: data.book_id,
        ended_at: null,
      },
      orderBy: { started_at: "desc" },
    });

    if (active) return jsonResponse(active);

    const session = await prisma.readingSession.create({
      data: {
        user_id: user.id,
        book_id: data.book_id,
      },
    });

    return jsonResponse(session);
  } catch (error) {
    return handleApiError(error);
  }
}
