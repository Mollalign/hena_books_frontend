import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    await requireAuth(request);
    const { bookId } = await params;

    const book = await prisma.book.findFirst({
      where: { id: bookId, is_published: true },
    });

    if (!book) {
      return errorResponse("Book not found", 404);
    }

    return jsonResponse({
      book_id: book.id,
      title: book.title,
      author: book.author,
      file_url: book.file_url,
      page_count: book.page_count,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
