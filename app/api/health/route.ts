import { prisma } from "@/lib/db";
import { jsonResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return jsonResponse({
      status: "healthy",
      database: "connected",
      version: "1.0.0",
    });
  } catch {
    return jsonResponse(
      {
        status: "unhealthy",
        database: "disconnected",
        version: "1.0.0",
      },
      503
    );
  }
}
