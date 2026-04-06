import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const books = await prisma.book.findMany({
      orderBy: { created_at: "desc" },
    });

    return jsonResponse(books);
  } catch (error) {
    return handleApiError(error);
  }
}
