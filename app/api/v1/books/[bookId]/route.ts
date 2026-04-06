import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;

    const book = await prisma.book.findFirst({
      where: { id: bookId, is_published: true },
    });

    if (!book) {
      return errorResponse("Book not found", 404);
    }

    // Get reading stats
    const stats = await prisma.readingSession.aggregate({
      where: { book_id: bookId },
      _count: { id: true },
      _sum: { total_time_seconds: true },
    });

    const totalReaders = await prisma.readingSession.groupBy({
      by: ["user_id"],
      where: { book_id: bookId },
    });

    return jsonResponse({
      ...book,
      total_readers: totalReaders.length,
      total_reading_time_hours: Math.round(
        ((stats._sum.total_time_seconds || 0) / 3600) * 100
      ) / 100,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
