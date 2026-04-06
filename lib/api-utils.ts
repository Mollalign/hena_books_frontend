import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ detail: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return errorResponse(error.message, error.statusCode);
  }
  if (
    error &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown[] }).issues)
  ) {
    const issues = (error as { issues: { message: string }[] }).issues;
    const message = issues.map((i) => i.message).join(", ");
    return errorResponse(message, 422);
  }
  console.error("API Error:", error);
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";
  return errorResponse(message, 500);
}
