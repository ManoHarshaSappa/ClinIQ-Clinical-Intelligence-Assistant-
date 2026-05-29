import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend } from "@/lib/backend";
import { getMCPDrugInformation, cliniqMedicalKnowledge } from '@/lib/mcp-service'
import { getSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { patient_id, drug_name } = await request.json();

    if (!drug_name) {
      return NextResponse.json(
        { error: 'Drug name is required' },
        { status: 400 }
      );
    }

    // Get patient information and medications from database
    const supabase = getSupabase();
    let patientMedications: string[] = [];
    let patientAllergies: string[] = [];

    if (patient_id) {
      const { data: extractedInfo } = await supabase
        .from('extracted_info')
        .select('medications, allergies')
        .eq('patient_id', patient_id)
        .single();

      if (extractedInfo) {
        patientMedications = Array.isArray(extractedInfo.medications) ? extractedInfo.medications : [];
        patientAllergies = Array.isArray(extractedInfo.allergies) ? extractedInfo.allergies : [];
      }
    }

    // Get MCP-enhanced drug information
    const mcpResult = await getMCPDrugInformation(drug_name, patientMedications);

    // Also get the original backend result for comparison
    let backendResult = null;
    try {
      const body = JSON.stringify({ patient_id, drug_name });
      const backendResponse = await proxyToBackend("/drug-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (backendResponse.ok) {
        backendResult = await backendResponse.json();
      }
    } catch (error) {
      console.warn('Backend drug-check failed:', error);
    }

    // Enhanced drug safety analysis
    const comprehensiveSafety = await cliniqMedicalKnowledge.enhancedDrugSafety(
      [...patientMedications, drug_name],
      patientAllergies,
      [] // Could add patient conditions here
    );

    // Combine all results
    const enhancedResponse = {
      drug_name,
      patient_id,
      mcp_enhanced: true,
      clinical_intelligence: {
        mcp_analysis: mcpResult.data,
        comprehensive_safety: comprehensiveSafety,
        backend_analysis: backendResult
      },
      status: mcpResult.data?.safety_status || 'unknown',
      summary: generateClinicalSummary(mcpResult.data, comprehensiveSafety, drug_name),
      interactions: mcpResult.data?.interactions || [],
      allergy_flags: patientAllergies,
      recommendation: generateClinicalRecommendation(mcpResult.data, comprehensiveSafety),
      sources: [
        'ClinIQ MCP Medical Knowledge',
        'Clinical Drug Interaction Database',
        ...(backendResult ? ['Backend Analysis'] : [])
      ],
      enhanced_features: [
        'Real-time drug interaction checking',
        'Allergy cross-referencing',
        'Clinical guideline integration',
        'Evidence-based recommendations'
      ],
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(enhancedResponse);

  } catch (error) {
    console.error('Enhanced drug-check error:', error);

    // Fallback to original backend proxy
    try {
      const body = await request.text();
      return proxyToBackend("/drug-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Drug check service unavailable' },
        { status: 500 }
      );
    }
  }
}

function generateClinicalSummary(mcpData: any, safetyData: any, drugName: string): string {
  if (!mcpData) {
    return `Safety information for ${drugName} could not be determined. Consult clinical pharmacist.`;
  }

  const { safety_status, interactions, contraindications } = mcpData;

  if (safety_status === 'danger' || safetyData?.overall_safety === 'danger') {
    return `⚠️ HIGH RISK: ${drugName} has significant safety concerns. ${interactions.length} interactions and ${contraindications.length} contraindications identified. Immediate clinical review required.`;
  }

  if (safety_status === 'caution' || safetyData?.overall_safety === 'caution') {
    return `⚠️ CAUTION: ${drugName} requires monitoring. ${interactions.length} potential interactions identified. Clinical oversight recommended.`;
  }

  return `✅ SAFE: ${drugName} appears safe with current medications. No significant interactions detected. Continue standard monitoring.`;
}

function generateClinicalRecommendation(mcpData: any, safetyData: any): string {
  if (!mcpData) {
    return 'Consult clinical pharmacist for detailed drug interaction analysis.';
  }

  const recommendations = [];

  if (safetyData?.allergy_alerts?.length > 0) {
    recommendations.push('⚠️ AVOID - Allergy conflict detected');
  }

  if (safetyData?.overall_safety === 'danger') {
    recommendations.push('Urgent clinical review required before administration');
  } else if (safetyData?.overall_safety === 'caution') {
    recommendations.push('Monitor closely for interaction effects');
  }

  if (mcpData.recommendations?.length > 0) {
    recommendations.push(...mcpData.recommendations);
  }

  if (recommendations.length === 0) {
    recommendations.push('Safe to proceed with standard clinical monitoring');
  }

  return recommendations.join('. ');
}
