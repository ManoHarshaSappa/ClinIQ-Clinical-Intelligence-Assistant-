import { NextRequest, NextResponse } from 'next/server'
import { getMCPDrugInformation } from '@/lib/mcp-service'

export async function POST(req: NextRequest) {
  try {
    const { drugName, patientId } = await req.json()

    if (!drugName) {
      return NextResponse.json(
        { error: 'Drug name is required' },
        { status: 400 }
      )
    }

    // Get enhanced drug information using MCP service
    const mcpResult = await getMCPDrugInformation(drugName, [])

    // Combine MCP data with existing logic
    const response = {
      drug_name: drugName,
      patient_id: patientId,
      mcp_enhanced: true,
      clinical_intelligence: mcpResult.data,
      status: mcpResult.data?.safety_status || 'unknown',
      sources: ['ClinIQ MCP Medical Knowledge', 'Clinical Drug Database'],
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('MCP drug info error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch MCP drug information' },
      { status: 500 }
    )
  }
}