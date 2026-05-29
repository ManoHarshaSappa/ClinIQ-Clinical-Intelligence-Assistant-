import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { question, patient_id } = await request.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    let patientContext = ""
    let sources: string[] = []

    // Get patient data if patient_id is provided
    if (patient_id) {
      // Get patient info
      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patient_id)
        .single()

      // Get extracted medical info
      const { data: extractedInfo } = await supabase
        .from('extracted_info')
        .select('*')
        .eq('patient_id', patient_id)
        .single()

      // Get documents
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('patient_id', patient_id)

      if (patient) {
        patientContext = `
Patient Information:
- Name: ${patient.name}
- Age: ${patient.age || 'Unknown'}
- Gender: ${patient.gender || 'Unknown'}
- Medical Specialty: ${patient.medical_specialty || 'General'}

Medical History:
${extractedInfo ? `
- Medications: ${JSON.stringify(extractedInfo.medications || [])}
- Allergies: ${JSON.stringify(extractedInfo.allergies || [])}
- Diagnoses: ${JSON.stringify(extractedInfo.diagnoses || [])}
- Lab Results: ${JSON.stringify(extractedInfo.lab_results || [])}
- Summary: ${extractedInfo.summary_text || 'No summary available'}
` : 'No extracted medical information available.'}

Documents: ${documents?.map(d => d.file_name).join(', ') || 'No documents'}
        `

        sources = documents?.map(d => d.file_name) || []
      }
    }

    // Get OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    // Create OpenAI chat completion
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
            content: `You are a clinical AI assistant helping healthcare professionals analyze patient data.

IMPORTANT: Only provide responses based on the patient data provided. If you don't have specific information about the patient, clearly state that.

Guidelines:
- Provide accurate medical insights based on the patient data
- Highlight any concerning patterns or contraindications
- Suggest relevant follow-up questions or tests when appropriate
- Always emphasize that your responses should be verified by healthcare professionals
- Be concise but thorough in your explanations

${patientContext ? `Current Patient Context:\n${patientContext}` : 'No specific patient context provided.'}
            `
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
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
    const answer = openaiData.choices?.[0]?.message?.content || 'No response generated'

    return NextResponse.json({
      answer,
      sources
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
