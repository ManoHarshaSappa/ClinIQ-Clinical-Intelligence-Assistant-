import { NextRequest, NextResponse } from 'next/server'
import { getMCPClinicalGuidelines } from '@/lib/mcp-service'

export async function POST(req: NextRequest) {
  try {
    const { query, specialty, patientConditions } = await req.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Research query is required' },
        { status: 400 }
      )
    }

    // Get clinical guidelines using MCP service
    const guidelineResult = await getMCPClinicalGuidelines(query)

    // Enhanced response with MCP data
    const response = {
      query,
      specialty,
      mcp_enhanced: true,
      clinical_guidelines: guidelineResult.data,
      evidence_level: guidelineResult.data?.evidence_level || 'moderate',
      search_timestamp: new Date().toISOString(),
      recommendations: await generateClinicalRecommendations(
        query,
        [],
        guidelineResult.data ? [guidelineResult.data] : [],
        patientConditions
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('MCP clinical research error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch MCP clinical research' },
      { status: 500 }
    )
  }
}

async function generateClinicalRecommendations(
  query: string,
  pubmedResults: any[],
  guidelines: any[],
  patientConditions: string[]
) {
  // Generate AI-powered recommendations based on MCP data
  const recommendations = {
    evidence_based: [] as any[],
    clinical_trials: [] as any[],
    treatment_options: [] as any[],
    contraindications: [] as any[],
    follow_up: [] as any[]
  }

  // Process PubMed results for evidence-based recommendations
  if (pubmedResults.length > 0) {
    recommendations.evidence_based = pubmedResults.slice(0, 3).map(article => ({
      title: article.title,
      summary: article.abstract?.substring(0, 200) + '...',
      pmid: article.pmid,
      relevance_score: article.relevance || 0.8
    }))
  }

  // Process guidelines for treatment recommendations
  if (guidelines.length > 0) {
    recommendations.treatment_options = guidelines.map(guideline => ({
      guideline: guideline.title,
      recommendation: guideline.summary,
      strength: guideline.evidence_level || 'moderate'
    }))
  }

  return recommendations
}