import { proxyToBackend } from "@/lib/backend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  return proxyToBackend(`/search?q=${encodeURIComponent(q)}`, {
    method: "GET",
  });
}
