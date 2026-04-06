import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { errorResponse, handleApiError } from "@/lib/api-utils";

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

    const response = await fetch(book.file_url);
    if (!response.ok) {
      return errorResponse("Failed to fetch PDF", 502);
    }

    const safeFilename = encodeURIComponent(`${book.title}.pdf`);

    return new Response(response.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="book.pdf"; filename*=UTF-8''${safeFilename}`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
