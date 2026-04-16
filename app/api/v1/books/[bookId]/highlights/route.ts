import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { HighlightCreateSchema } from "@/lib/validations/highlight";

async function ensureReadableBook(bookId: string) {
  return prisma.book.findFirst({
    where: { id: bookId, is_published: true },
    select: { id: true },
  });
}

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { bookId } = await params;

    const book = await ensureReadableBook(bookId);
    if (!book) return errorResponse("Book not found", 404);

    try {
      const highlights = await prisma.pdfHighlight.findMany({
        where: { user_id: user.id, book_id: bookId },
        orderBy: [{ page_index: "asc" }, { created_at: "asc" }],
      });

      return jsonResponse(highlights);
    } catch (error) {
      if (isMissingHighlightsTable(error)) {
        return jsonResponse([]);
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { bookId } = await params;
    const body = await request.json();
    const data = HighlightCreateSchema.parse(body);

    const book = await ensureReadableBook(bookId);
    if (!book) return errorResponse("Book not found", 404);

    try {
      const highlight = await prisma.pdfHighlight.create({
        data: {
          user_id: user.id,
          book_id: bookId,
          page_index: data.page_index,
          color: data.color,
          quote: data.quote,
          note: data.note?.trim() ? data.note.trim() : null,
          highlight_areas: data.highlight_areas as Prisma.InputJsonValue,
        },
      });

      return jsonResponse(highlight, 201);
    } catch (error) {
      if (isMissingHighlightsTable(error)) {
        return errorResponse("Highlights are not ready until the database schema is applied", 503);
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
