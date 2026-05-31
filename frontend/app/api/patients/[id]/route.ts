import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = getSupabase();

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", params.id)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 },
      );
    }

    const [{ data: extractedInfo, error: extractedError }, { data: documents, error: documentsError }] =
      await Promise.all([
        supabase
          .from("extracted_info")
          .select("*")
          .eq("patient_id", params.id)
          .maybeSingle(),
        supabase
          .from("documents")
          .select("id, file_name, uploaded_at")
          .eq("patient_id", params.id),
      ]);

    if (extractedError) throw extractedError;
    if (documentsError) throw documentsError;

    const response = NextResponse.json({
      patient,
      extracted_info: extractedInfo,
      documents: documents || [],
    });

    // Add cache control headers to prevent stale data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error("Patient detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient detail" },
      { status: 500 },
    );
  }
}
