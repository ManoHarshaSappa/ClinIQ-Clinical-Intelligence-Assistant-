import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question?.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Get OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      return NextResponse.json({
        answer: 'Unable to retrieve drug information at this time. Please consult a clinical pharmacist or drug reference database such as:\n\n• Lexicomp\n• Micromedex\n• Package insert/prescribing information\n• Clinical pharmacist consultation\n\nAlways verify medication information with authoritative clinical sources.',
        sources: ['AI service not configured - consult clinical references']
      });
    }

    // Create OpenAI chat completion for drug information
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
            content: `You are a clinical pharmacist AI providing drug information. Provide accurate, evidence-based information about medications including:

- Mechanism of action
- Indications and contraindications
- Dosing and administration
- Side effects and warnings
- Drug interactions
- Clinical considerations

Guidelines:
- Provide comprehensive but concise information
- Include relevant clinical details
- Mention important safety warnings
- Always emphasize verification with authoritative sources
- Use professional medical terminology appropriately
- Include brand names when relevant
- Mention pregnancy/lactation categories when applicable

Always end responses with a reminder to verify information with clinical references and consult healthcare professionals for patient-specific guidance.`
          },
          {
            role: 'user',
            content: question.trim()
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      })
    });

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text());
      return NextResponse.json({
        answer: 'Unable to retrieve drug information at this time. Please consult a clinical pharmacist or drug reference database such as:\n\n• Lexicomp\n• Micromedx\n• Package insert/prescribing information\n• Clinical pharmacist consultation\n\nAlways verify medication information with authoritative clinical sources.',
        sources: ['AI service temporarily unavailable - consult clinical references']
      });
    }

    const openaiData = await openaiResponse.json();
    const answer = openaiData.choices?.[0]?.message?.content || 'Unable to generate response';

    return NextResponse.json({
      answer: answer,
      sources: ['GPT-4 Clinical Pharmacist AI - Always verify with authoritative clinical references']
    });

  } catch (error) {
    console.error('Drug info API error:', error);

    // Return fallback response
    return NextResponse.json({
      answer: 'Unable to retrieve drug information at this time. Please consult a clinical pharmacist or drug reference database such as:\n\n• Lexicomp\n• Micromedx\n• Package insert/prescribing information\n• Clinical pharmacist consultation\n\nAlways verify medication information with authoritative clinical sources.',
      sources: ['Error occurred - consult clinical references']
    });
  }
}