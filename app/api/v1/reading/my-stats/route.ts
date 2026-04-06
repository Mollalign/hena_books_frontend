import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { jsonResponse, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const [aggregate, distinctBooks] = await Promise.all([
      prisma.readingSession.aggregate({
        where: { user_id: user.id },
        _count: { id: true },
        _sum: { total_time_seconds: true },
      }),
      prisma.readingSession.groupBy({
        by: ["book_id"],
        where: { user_id: user.id },
      }),
    ]);

    return jsonResponse({
      total_books_read: distinctBooks.length,
      total_reading_time_hours:
        Math.round(
          ((aggregate._sum.total_time_seconds || 0) / 3600) * 100
        ) / 100,
      total_sessions: aggregate._count.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
