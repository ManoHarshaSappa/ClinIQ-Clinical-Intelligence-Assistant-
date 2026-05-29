import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabase()

    // Get all patients ordered by created_at desc
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })

    if (patientsError) throw patientsError

    // Enrich with allergy count from extracted_info
    if (patients && patients.length > 0) {
      const patientIds = patients.map(p => p.id)

      const { data: extractedInfo, error: extractedError } = await supabase
        .from('extracted_info')
        .select('patient_id, allergies')
        .in('patient_id', patientIds)

      if (extractedError) throw extractedError

      // Create allergy count map
      const allergyMap: Record<string, number> = {}
      extractedInfo?.forEach(info => {
        allergyMap[info.patient_id] = (info.allergies as any[])?.length || 0
      })

      // Add allergy count to each patient
      patients.forEach(patient => {
        patient.allergy_count = allergyMap[patient.id] || 0
      })
    }

    return NextResponse.json(patients || [])
  } catch (error) {
    console.error('Patients API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    )
  }
}