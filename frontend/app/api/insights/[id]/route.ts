import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = getSupabase()
    const patientId = params.id

    // Get patient data
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()

    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Get extracted medical info
    const { data: extractedInfo } = await supabase
      .from('extracted_info')
      .select('*')
      .eq('patient_id', patientId)
      .single()

    // Get documents
    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('patient_id', patientId)

    // Get OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    // Prepare patient context
    const patientContext = `
Patient: ${patient.name}
Age: ${patient.age || 'Unknown'}
Gender: ${patient.gender || 'Unknown'}
Medical Specialty: ${patient.medical_specialty || 'General'}

Medical Information:
${extractedInfo ? `
Medications: ${JSON.stringify(extractedInfo.medications || [])}
Allergies: ${JSON.stringify(extractedInfo.allergies || [])}
Diagnoses: ${JSON.stringify(extractedInfo.diagnoses || [])}
Lab Results: ${JSON.stringify(extractedInfo.lab_results || [])}
Summary: ${extractedInfo.summary_text || 'No summary available'}
` : 'No extracted medical information available.'}

Documents Available: ${documents?.length || 0} files
    `

    // Generate insights using OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a clinical AI assistant providing medical insights. Based on the patient data provided, generate clinical insights in exactly this JSON format:

{
  "clinical_concerns": ["concern1", "concern2", "concern3"],
  "recommended_actions": ["action1", "action2", "action3"],
  "drug_safety_watch": "brief safety note about medications/interactions",
  "follow_up_priority": "Urgent" | "High" | "Normal" | "Low",
  "follow_up_rationale": "explanation for the priority level"
}

Guidelines:
- Focus on actionable insights based on the data
- Highlight any concerning patterns or drug interactions
- Consider allergies, current medications, and diagnoses
- Be specific but concise
- Always emphasize need for healthcare professional verification`
          },
          {
            role: 'user',
            content: `Analyze this patient and provide clinical insights:\n\n${patientContext}`
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      })
    })

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text())
      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: 502 }
      )
    }

    const openaiData = await openaiResponse.json()
    const rawContent = openaiData.choices?.[0]?.message?.content

    if (!rawContent) {
      return NextResponse.json(
        { error: 'No insights generated' },
        { status: 500 }
      )
    }

    try {
      // Try to parse the JSON response
      const insights = JSON.parse(rawContent)

      // Validate required fields
      const requiredFields = ['clinical_concerns', 'recommended_actions', 'drug_safety_watch', 'follow_up_priority', 'follow_up_rationale']
      const hasAllFields = requiredFields.every(field => insights.hasOwnProperty(field))

      if (!hasAllFields) {
        throw new Error('Invalid response format')
      }

      return NextResponse.json(insights)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)

      // Fallback response if parsing fails
      return NextResponse.json({
        clinical_concerns: [
          "Review current medications for potential interactions",
          "Monitor patient allergies during treatment",
          "Consider comprehensive health assessment"
        ],
        recommended_actions: [
          "Schedule follow-up appointment",
          "Review medication list with pharmacist",
          "Update allergy information if needed"
        ],
        drug_safety_watch: "Please verify all current medications and check for potential interactions, especially considering documented allergies.",
        follow_up_priority: "Normal",
        follow_up_rationale: "Standard follow-up recommended based on current patient profile and medical history."
      })
    }

  } catch (error) {
    console.error('Insights API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
