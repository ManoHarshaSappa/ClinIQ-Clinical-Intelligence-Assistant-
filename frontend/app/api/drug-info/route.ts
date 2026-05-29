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

    // Call backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/drug-information`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Drug info API error:', error);

    // Return fallback response
    return NextResponse.json({
      answer: 'Unable to retrieve drug information at this time. Please consult a clinical pharmacist or drug reference database such as:\n\n• Lexicomp\n• Micromedex\n• Package insert/prescribing information\n• Clinical pharmacist consultation\n\nAlways verify medication information with authoritative clinical sources.',
      sources: ['Error occurred - consult clinical references']
    });
  }
}