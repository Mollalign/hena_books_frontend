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

    console.log("[pdf-proxy] Fetching:", book.file_url);

    const rangeHeader = request.headers.get("range");
    const upstreamHeaders = new Headers();
    if (rangeHeader) {
      upstreamHeaders.set("Range", rangeHeader);
    }

    let response: Response;
    try {
      response = await fetch(book.file_url, {
        headers: upstreamHeaders,
        signal: AbortSignal.timeout(30000),
      });
    } catch (fetchErr) {
      console.error("[pdf-proxy] Fetch error:", fetchErr);
      return errorResponse(
        `Failed to connect to file server: ${fetchErr instanceof Error ? fetchErr.message : "unknown error"}`,
        502
      );
    }

    if (!response.ok) {
      console.error("[pdf-proxy] HTTP error:", response.status, response.statusText);
      return errorResponse(
        `File server returned ${response.status}: ${response.statusText}`,
        502
      );
    }

    const safeFilename = encodeURIComponent(`${book.title}.pdf`);
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "application/pdf");
    headers.set(
      "Content-Disposition",
      response.headers.get("Content-Disposition") ||
        `inline; filename="book.pdf"; filename*=UTF-8''${safeFilename}`
    );
    headers.set("Cache-Control", "private, max-age=86400, stale-while-revalidate=604800");

    const passthroughHeaders = [
      "Accept-Ranges",
      "Content-Length",
      "Content-Range",
      "ETag",
      "Last-Modified",
    ];

    passthroughHeaders.forEach((headerName) => {
      const value = response.headers.get(headerName);
      if (value) headers.set(headerName, value);
    });

    if (!headers.has("Accept-Ranges")) {
      headers.set("Accept-Ranges", "bytes");
    }

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
