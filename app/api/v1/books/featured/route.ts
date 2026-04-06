import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { jsonResponse, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(
      Math.max(
        Number(request.nextUrl.searchParams.get("limit") || "6"),
        1
      ),
      12
    );

    const books = await prisma.book.findMany({
      where: { is_published: true, is_featured: true },
      orderBy: { created_at: "desc" },
      take: limit,
    });

    const response = jsonResponse(books);
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
