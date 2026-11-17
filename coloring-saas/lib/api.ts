import "server-only";

import { NextResponse } from "next/server";
import { GENERIC_ERROR_MESSAGE, UserFacingError, type ApiErrorBody } from "@/lib/errors";

export function apiError(code: string, message: string, status = 400) {
  return NextResponse.json<ApiErrorBody>({ error: { code, message } }, { status });
}

/** Converts any thrown error into a safe JSON response. Never leaks internals. */
export function handleApiError(err: unknown, context: string) {
  if (err instanceof UserFacingError) return apiError(err.code, err.message, err.status);
  console.error(`[${context}]`, err instanceof Error ? err.message : "unknown error");
  return apiError("server_error", GENERIC_ERROR_MESSAGE, 500);
}
