import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { BookCategory } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;

    if (!Object.values(BookCategory).includes(category as BookCategory)) {
      return errorResponse("Invalid category", 400);
    }

    const limit = Math.min(
      Math.max(
        Number(request.nextUrl.searchParams.get("limit") || "10"),
        1
      ),
      50
    );

    const books = await prisma.book.findMany({
      where: {
        is_published: true,
        category: category as BookCategory,
      },
      orderBy: { created_at: "desc" },
      take: limit,
    });

    return jsonResponse(books);
  } catch (error) {
    return handleApiError(error);
  }
}
