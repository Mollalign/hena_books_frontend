import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { uploadBookFile, uploadCoverImage } from "@/lib/cloudinary";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { BookCategory } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const formData = await request.formData();

    const title = formData.get("title") as string;
    if (!title) return errorResponse("Title is required", 400);

    const bookFile = formData.get("book_file") as File | null;
    if (!bookFile) return errorResponse("PDF file is required", 400);

    const author = (formData.get("author") as string) || null;
    const description = (formData.get("description") as string) || null;
    const categoryStr = (formData.get("category") as string) || "OTHER";
    const scriptureFocus =
      (formData.get("scripture_focus") as string) || null;
    const pageCountStr = formData.get("page_count") as string;
    const pageCount = pageCountStr ? parseInt(pageCountStr, 10) : null;
    const publishedDateStr = formData.get("published_date") as string;
    const publishedDate = publishedDateStr
      ? new Date(publishedDateStr)
      : null;
    const isFeatured = formData.get("is_featured") === "true";
    const isPublished = formData.get("is_published") !== "false";
    const coverFile = formData.get("cover_file") as File | null;

    // Resolve category enum
    let category: BookCategory = BookCategory.OTHER;
    if (Object.values(BookCategory).includes(categoryStr as BookCategory)) {
      category = categoryStr as BookCategory;
    }

    // Upload PDF
    const bookBuffer = Buffer.from(await bookFile.arrayBuffer());
    const { url: fileUrl, publicId: filePublicId } =
      await uploadBookFile(bookBuffer);

    // Upload cover if provided
    let coverUrl: string | null = null;
    let coverPublicId: string | null = null;
    if (coverFile && coverFile.size > 0) {
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      const result = await uploadCoverImage(coverBuffer);
      coverUrl = result.url;
      coverPublicId = result.publicId;
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        category,
        scripture_focus: scriptureFocus,
        cover_url: coverUrl,
        cover_public_id: coverPublicId,
        file_url: fileUrl,
        file_public_id: filePublicId,
        page_count: pageCount,
        published_date: publishedDate,
        is_featured: isFeatured,
        is_published: isPublished,
      },
    });

    return jsonResponse(book, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
