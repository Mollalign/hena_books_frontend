import { clearAuthCookies } from "@/lib/auth";
import { jsonResponse } from "@/lib/api-utils";

export async function POST() {
  const response = jsonResponse({ message: "Logged out" });
  clearAuthCookies(response);
  return response;
}
