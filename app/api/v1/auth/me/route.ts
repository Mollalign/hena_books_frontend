import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { jsonResponse, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    return jsonResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase(),
      is_active: user.is_active,
      created_at: user.created_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
