import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getDownloadUrl } from "@/lib/cloudinary";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    await requireAdmin(request);
    const { bookId } = await params;

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return errorResponse("Book not found", 404);

    const downloadUrl = getDownloadUrl(book.file_public_id);
    if (!downloadUrl) {
      return errorResponse("Failed to generate download URL", 500);
    }

    return jsonResponse({
      title: book.title,
      download_url: downloadUrl,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
