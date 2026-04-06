import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const books = await prisma.book.findMany({
      include: {
        reading_sessions: {
          select: {
            user_id: true,
            total_time_seconds: true,
            last_page_read: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const stats = books.map((book) => {
      const sessions = book.reading_sessions;
      const uniqueReaders = new Set(sessions.map((s) => s.user_id)).size;
      const totalTime = sessions.reduce(
        (sum, s) => sum + s.total_time_seconds,
        0
      );
      const avgPages =
        sessions.length > 0
          ? sessions.reduce((sum, s) => sum + s.last_page_read, 0) /
            sessions.length
          : 0;

      return {
        book_id: book.id,
        title: book.title,
        cover_url: book.cover_url,
        total_readers: uniqueReaders,
        total_sessions: sessions.length,
        total_reading_time_hours: Math.round((totalTime / 3600) * 100) / 100,
        average_pages_read: Math.round(avgPages * 10) / 10,
      };
    });

    stats.sort((a, b) => b.total_readers - a.total_readers);

    return jsonResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
