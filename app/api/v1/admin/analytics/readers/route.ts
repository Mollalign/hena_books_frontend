import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const limit = Math.min(
      Math.max(
        Number(request.nextUrl.searchParams.get("limit") || "20"),
        1
      ),
      100
    );

    const users = await prisma.user.findMany({
      where: {
        reading_sessions: { some: {} },
      },
      include: {
        reading_sessions: {
          select: {
            book_id: true,
            total_time_seconds: true,
            started_at: true,
          },
        },
      },
      take: limit,
    });

    const activity = users
      .map((user) => {
        const sessions = user.reading_sessions;
        const uniqueBooks = new Set(sessions.map((s) => s.book_id)).size;
        const totalTime = sessions.reduce(
          (sum, s) => sum + s.total_time_seconds,
          0
        );
        const lastActive = sessions.reduce(
          (latest, s) =>
            s.started_at > latest ? s.started_at : latest,
          new Date(0)
        );

        return {
          user_id: user.id,
          user_name: user.name,
          email: user.email,
          books_read: uniqueBooks,
          total_reading_time_hours:
            Math.round((totalTime / 3600) * 100) / 100,
          last_active: lastActive,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.last_active).getTime() -
          new Date(a.last_active).getTime()
      );

    return jsonResponse(activity);
  } catch (error) {
    return handleApiError(error);
  }
}
