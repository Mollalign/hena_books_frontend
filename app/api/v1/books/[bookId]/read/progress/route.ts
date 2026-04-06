import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { jsonResponse, handleApiError } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { bookId } = await params;

    const lastSession = await prisma.readingSession.findFirst({
      where: { user_id: user.id, book_id: bookId },
      orderBy: { started_at: "desc" },
      select: { last_page_read: true },
    });

    return jsonResponse({
      last_page_read: lastSession?.last_page_read ?? 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
