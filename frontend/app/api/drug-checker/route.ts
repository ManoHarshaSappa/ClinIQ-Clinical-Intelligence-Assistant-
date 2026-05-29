import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { drug1, drug2 } = await request.json();

    if (!drug1?.trim() || !drug2?.trim()) {
      return NextResponse.json(
        { error: 'Both drug names are required' },
        { status: 400 }
      );
    }

    // Call backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/drug-interaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        drug1: drug1.trim(),
        drug2: drug2.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Drug checker API error:', error);

    // Return fallback response
    return NextResponse.json({
      severity: 'caution',
      title: 'Check Failed',
      description: 'Unable to check drug interaction at this time. Please consult a clinical pharmacist or drug interaction database.',
      recommendations: [
        'Consult Lexicomp or Micromedex database',
        'Review individual drug monographs',
        'Consider clinical pharmacist consultation',
        'Monitor patient closely for adverse effects',
        'Use lowest effective doses when combining medications'
      ]
    });
  }
}