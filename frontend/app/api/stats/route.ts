import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabase()

    // Get patients with medical specialty
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, medical_specialty')

    if (patientsError) throw patientsError

    // Get document count
    const { count: documentsCount, error: docsError } = await supabase
      .from('documents')
      .select('id', { count: 'exact' })

    if (docsError) throw docsError

    // Get embeddings count
    const { count: embeddingsCount, error: embeddingsError } = await supabase
      .from('embeddings')
      .select('id', { count: 'exact' })

    if (embeddingsError) throw embeddingsError

    // Calculate specialty breakdown
    const specialtyBreakdown: Record<string, number> = {}
    patients?.forEach((patient) => {
      const specialty = patient.medical_specialty || 'Unknown'
      specialtyBreakdown[specialty] = (specialtyBreakdown[specialty] || 0) + 1
    })

    return NextResponse.json({
      total_patients: patients?.length || 0,
      total_documents: documentsCount || 0,
      total_embeddings: embeddingsCount || 0,
      specialty_breakdown: specialtyBreakdown,
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}