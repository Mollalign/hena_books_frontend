import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { BookUpdateSchema } from "@/lib/validations/book";
import { deleteFile } from "@/lib/cloudinary";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    await requireAdmin(request);
    const { bookId } = await params;
    const body = await request.json();
    const data = BookUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (key === "published_date" && typeof value === "string") {
          updateData[key] = new Date(value);
        } else {
          updateData[key] = value;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      const book = await prisma.book.findUnique({ where: { id: bookId } });
      if (!book) return errorResponse("Book not found", 404);
      return jsonResponse(book);
    }

    const book = await prisma.book.update({
      where: { id: bookId },
      data: updateData,
    });

    return jsonResponse(book);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return errorResponse("Book not found", 404);
    }
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    await requireAdmin(request);
    const { bookId } = await params;

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return errorResponse("Book not found", 404);

    // Delete files from Cloudinary (best-effort)
    try {
      await deleteFile(book.file_public_id, "raw");
      if (book.cover_public_id) {
        await deleteFile(book.cover_public_id, "image");
      }
    } catch (e) {
      console.warn(`Failed to delete Cloudinary files for book ${bookId}:`, e);
    }

    await prisma.book.delete({ where: { id: bookId } });

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
