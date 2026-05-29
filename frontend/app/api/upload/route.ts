import { proxyToBackend } from "@/lib/backend";

export async function POST(request: Request) {
  const formData = await request.formData();
  const backendFormData = new FormData();

  formData.forEach((value, key) => {
    backendFormData.append(key, value);
  });

  return proxyToBackend("/upload", {
    method: "POST",
    body: backendFormData,
  });
}
