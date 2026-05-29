import { proxyToBackend } from "@/lib/backend";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyToBackend(`/insights/${params.id}`, {
    method: "POST",
  });
}
