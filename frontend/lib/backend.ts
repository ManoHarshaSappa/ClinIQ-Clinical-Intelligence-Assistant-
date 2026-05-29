import { NextResponse } from "next/server";

const DEFAULT_BACKEND_URL = "http://localhost:8000";

export function getBackendUrl(): string {
  return (process.env.BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, "");
}

export async function proxyToBackend(
  path: string,
  init?: RequestInit,
): Promise<NextResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}${path}`, init);
    const body = await response.text();
    const contentType = response.headers.get("content-type") || "application/json";

    return new NextResponse(body, {
      status: response.status,
      headers: { "content-type": contentType },
    });
  } catch (error) {
    console.error(`Backend proxy failed for ${path}:`, error);

    return NextResponse.json(
      { error: "Backend service unavailable", path },
      { status: 502 },
    );
  }
}
