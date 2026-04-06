import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { BookFilterSchema } from "@/lib/validations/book";
import { jsonResponse, handleApiError } from "@/lib/api-utils";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const filters = BookFilterSchema.parse(params);

    const where: Prisma.BookWhereInput = { is_published: true };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { author: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.featured_only) {
      where.is_featured = true;
    }

    const skip = (filters.page - 1) * filters.per_page;

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy: [{ is_featured: "desc" }, { created_at: "desc" }],
        skip,
        take: filters.per_page,
      }),
      prisma.book.count({ where }),
    ]);

    const response = jsonResponse({
      books,
      total,
      page: filters.page,
      per_page: filters.per_page,
    });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
