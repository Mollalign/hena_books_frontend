import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalBooks,
      sessionStats,
      activeTodayResult,
      activeWeekResult,
      popularBooks,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.book.count(),
      prisma.readingSession.aggregate({
        _count: { id: true },
        _sum: { total_time_seconds: true },
      }),
      prisma.readingSession.groupBy({
        by: ["user_id"],
        where: { started_at: { gte: todayStart } },
      }),
      prisma.readingSession.groupBy({
        by: ["user_id"],
        where: { started_at: { gte: weekAgo } },
      }),
      prisma.readingSession.groupBy({
        by: ["book_id"],
        _count: { id: true },
        _sum: { total_time_seconds: true },
        orderBy: { _count: { id: "desc" } },
        take: 1,
      }),
    ]);

    let mostPopularBook = null;
    if (popularBooks.length > 0) {
      const topBookId = popularBooks[0].book_id;
      const book = await prisma.book.findUnique({
        where: { id: topBookId },
      });
      const readerCount = await prisma.readingSession.groupBy({
        by: ["user_id"],
        where: { book_id: topBookId },
      });

      if (book && readerCount.length > 0) {
        mostPopularBook = {
          book_id: book.id,
          title: book.title,
          cover_url: book.cover_url,
          total_readers: readerCount.length,
          total_sessions: popularBooks[0]._count.id,
          total_reading_time_hours:
            Math.round(
              ((popularBooks[0]._sum.total_time_seconds || 0) / 3600) * 100
            ) / 100,
          average_pages_read: 0,
        };
      }
    }

    return jsonResponse({
      total_users: totalUsers,
      total_books: totalBooks,
      total_reading_sessions: sessionStats._count.id,
      total_reading_time_hours:
        Math.round(
          ((sessionStats._sum.total_time_seconds || 0) / 3600) * 100
        ) / 100,
      active_readers_today: activeTodayResult.length,
      active_readers_week: activeWeekResult.length,
      most_popular_book: mostPopularBook,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
