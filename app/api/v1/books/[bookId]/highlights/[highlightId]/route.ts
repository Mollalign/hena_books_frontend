import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

function isMissingHighlightsTable(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    ((error as { code?: string }).code === "P2021" ||
      (error as { code?: string }).code === "P2022")
  ) {
    return true;
  }

  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021"
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string; highlightId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { bookId, highlightId } = await params;

    let highlight;
    try {
      highlight = await prisma.pdfHighlight.findUnique({
        where: { id: highlightId },
        select: { id: true, user_id: true, book_id: true },
      });
    } catch (error) {
      if (isMissingHighlightsTable(error)) {
        return errorResponse("Highlights are not ready until the database schema is applied", 503);
      }
      throw error;
    }

    if (!highlight || highlight.book_id !== bookId || highlight.user_id !== user.id) {
      return errorResponse("Highlight not found", 404);
    }

    try {
      await prisma.pdfHighlight.delete({
        where: { id: highlightId },
      });
    } catch (error) {
      if (isMissingHighlightsTable(error)) {
        return errorResponse("Highlights are not ready until the database schema is applied", 503);
      }
      throw error;
    }

    return jsonResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
