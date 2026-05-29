import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = getSupabase();

    const { data: document, error } = await supabase
      .from("documents")
      .select("file_name, raw_text, uploaded_at")
      .eq("id", params.id)
      .single();

    if (error || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Document text API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch document text" },
      { status: 500 },
    );
  }
}
