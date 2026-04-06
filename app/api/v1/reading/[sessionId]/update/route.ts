import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { ReadingSessionUpdateSchema } from "@/lib/validations/analytics";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { sessionId } = await params;
    const body = await request.json();
    const data = ReadingSessionUpdateSchema.parse(body);

    const id = parseInt(sessionId, 10);
    if (isNaN(id)) return errorResponse("Invalid session ID", 400);

    const session = await prisma.readingSession.findUnique({
      where: { id },
    });

    if (!session || session.user_id !== user.id) {
      return errorResponse("Reading session not found", 404);
    }

    const updated = await prisma.readingSession.update({
      where: { id },
      data: {
        last_page_read: data.last_page_read,
        total_time_seconds: {
          increment: data.time_spent_seconds,
        },
      },
    });

    return jsonResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
