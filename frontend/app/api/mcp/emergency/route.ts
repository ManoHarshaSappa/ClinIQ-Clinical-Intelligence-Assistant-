import { NextRequest, NextResponse } from 'next/server'
import { getMCPEmergencyProtocol, getMCPClinicalGuidelines } from '@/lib/mcp-service'

export async function POST(req: NextRequest) {
  try {
    const { emergency_type, patient_data, assessment_scores } = await req.json()

    if (!emergency_type) {
      return NextResponse.json(
        { error: 'Emergency type is required' },
        { status: 400 }
      )
    }

    // Get MCP-enhanced emergency protocol
    const protocolResult = await getMCPEmergencyProtocol(emergency_type);
    const guidelineResult = await getMCPClinicalGuidelines(emergency_type);

    // Calculate risk scores based on assessment data
    const riskAssessment = calculateEmergencyRisk(emergency_type, assessment_scores);

    // Generate time-critical action plan
    const actionPlan = generateEmergencyActionPlan(
      emergency_type,
      protocolResult.data,
      riskAssessment,
      patient_data
    );

    const response = {
      emergency_type,
      mcp_enhanced: true,
      risk_assessment: riskAssessment,
      clinical_protocol: protocolResult.data,
      clinical_guidelines: guidelineResult.data,
      action_plan: actionPlan,
      time_critical: isTimeCritical(emergency_type, riskAssessment),
      next_steps: generateNextSteps(emergency_type, riskAssessment),
      quality_metrics: {
        door_to_assessment: calculateDoorToAssessment(emergency_type),
        door_to_treatment: calculateDoorToTreatment(emergency_type),
        golden_hour_status: isWithinGoldenHour(patient_data?.symptom_onset)
      },
      documentation: {
        assessment_tools_used: getAssessmentTools(emergency_type),
        clinical_decision_support: true,
        mcp_protocol_version: '1.0',
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('MCP emergency assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to process emergency assessment' },
      { status: 500 }
    )
  }
}

function calculateEmergencyRisk(emergencyType: string, assessmentScores: any) {
  switch (emergencyType.toLowerCase()) {
    case 'stroke':
      return calculateStrokeRisk(assessmentScores);
    case 'chest_pain':
      return calculateChestPainRisk(assessmentScores);
    case 'sepsis':
      return calculateSepsisRisk(assessmentScores);
    default:
      return {
        risk_level: 'moderate',
        risk_score: 50,
        confidence: 'low',
        factors: ['insufficient data for specific risk calculation']
      };
  }
}

function calculateStrokeRisk(scores: any) {
  const befastPositive = scores?.befast_positive_count || 0;
  const nihssScore = scores?.nihss || 0;
  const timeFromOnset = scores?.time_from_onset || 999; // minutes

  let riskScore = 0;
  const riskFactors = [];

  // BEFAST assessment
  if (befastPositive >= 3) {
    riskScore += 40;
    riskFactors.push('High BEFAST score - strong stroke indicators');
  } else if (befastPositive >= 1) {
    riskScore += 20;
    riskFactors.push('Positive BEFAST indicators present');
  }

  // NIHSS score
  if (nihssScore >= 15) {
    riskScore += 30;
    riskFactors.push('Severe stroke (NIHSS ≥15)');
  } else if (nihssScore >= 5) {
    riskScore += 15;
    riskFactors.push('Moderate stroke severity');
  }

  // Time factor
  if (timeFromOnset <= 180) { // 3 hours
    riskScore += 20;
    riskFactors.push('Within optimal treatment window');
  } else if (timeFromOnset <= 450) { // 7.5 hours
    riskScore += 10;
    riskFactors.push('Within extended treatment window');
  } else {
    riskFactors.push('Beyond typical treatment window');
  }

  const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'moderate' : 'low';

  return {
    risk_level: riskLevel,
    risk_score: Math.min(riskScore, 100),
    confidence: 'high',
    factors: riskFactors,
    befast_score: befastPositive,
    nihss_score: nihssScore,
    time_factor: timeFromOnset <= 180 ? 'optimal' : timeFromOnset <= 450 ? 'acceptable' : 'limited'
  };
}

function calculateChestPainRisk(scores: any) {
  // Simplified chest pain risk assessment
  const heartScore = scores?.heart_score || 0;
  const troponin = scores?.troponin_elevated || false;
  const ecgChanges = scores?.ecg_changes || false;

  let riskScore = heartScore * 10;
  const riskFactors = [];

  if (troponin) {
    riskScore += 30;
    riskFactors.push('Elevated cardiac biomarkers');
  }

  if (ecgChanges) {
    riskScore += 25;
    riskFactors.push('Abnormal ECG changes');
  }

  const riskLevel = riskScore >= 60 ? 'high' : riskScore >= 30 ? 'moderate' : 'low';

  return {
    risk_level: riskLevel,
    risk_score: Math.min(riskScore, 100),
    confidence: 'moderate',
    factors: riskFactors
  };
}

function calculateSepsisRisk(scores: any) {
  const qsofaScore = scores?.qsofa || 0;
  const lactate = scores?.lactate || 0;
  const wbc = scores?.wbc || 0;

  let riskScore = qsofaScore * 20;
  const riskFactors = [];

  if (lactate >= 4) {
    riskScore += 30;
    riskFactors.push('Elevated lactate (≥4 mmol/L)');
  } else if (lactate >= 2) {
    riskScore += 15;
    riskFactors.push('Moderately elevated lactate');
  }

  if (wbc >= 12000 || wbc <= 4000) {
    riskScore += 15;
    riskFactors.push('Abnormal white blood cell count');
  }

  const riskLevel = riskScore >= 65 ? 'high' : riskScore >= 35 ? 'moderate' : 'low';

  return {
    risk_level: riskLevel,
    risk_score: Math.min(riskScore, 100),
    confidence: 'moderate',
    factors: riskFactors
  };
}

function generateEmergencyActionPlan(emergencyType: string, protocol: any, riskAssessment: any, patientData: any) {
  if (!protocol) {
    return {
      immediate_actions: ['Complete clinical assessment', 'Consult emergency medicine'],
      next_60_minutes: ['Stabilize patient', 'Arrange appropriate care'],
      monitoring: ['Vital signs', 'Clinical response']
    };
  }

  switch (emergencyType.toLowerCase()) {
    case 'stroke':
      return generateStrokeActionPlan(protocol, riskAssessment, patientData);
    default:
      return {
        immediate_actions: protocol.critical_actions || ['Assess patient stability'],
        next_60_minutes: ['Continue monitoring', 'Follow clinical protocols'],
        monitoring: ['Patient response to interventions']
      };
  }
}

function generateStrokeActionPlan(protocol: any, riskAssessment: any, patientData: any) {
  const plan = {
    immediate_actions: [
      'Complete BEFAST assessment',
      'Establish IV access (18-gauge or larger)',
      'Check blood glucose - correct if <60 mg/dL',
      'Obtain STAT non-contrast head CT',
      'Check PT/INR, aPTT, platelet count'
    ],
    next_15_minutes: [
      'Review CT results',
      'Assess for tPA eligibility',
      'Activate stroke team if not already done',
      'Prepare for possible thrombectomy'
    ],
    next_60_minutes: [
      'Administer tPA if eligible and <4.5 hours from onset',
      'Transfer to stroke unit or neuro ICU',
      'Begin aspirin 81mg daily unless contraindicated',
      'Arrange thrombectomy if large vessel occlusion'
    ],
    monitoring: [
      'Neurological checks every 15 minutes x 2 hours',
      'Blood pressure monitoring - avoid aggressive reduction',
      'Monitor for bleeding complications if tPA given',
      'Continuous cardiac monitoring'
    ],
    contraindications_check: [
      'Recent surgery or trauma',
      'History of intracranial hemorrhage',
      'Current anticoagulation',
      'Blood pressure >185/110 mmHg'
    ]
  };

  // Modify plan based on risk assessment
  if (riskAssessment.risk_level === 'high') {
    plan.immediate_actions.unshift('⚠️ HIGH RISK - Expedite all assessments');
    plan.next_15_minutes.unshift('Consider direct admission to neuro ICU');
  }

  return plan;
}

function generateNextSteps(emergencyType: string, riskAssessment: any) {
  const baseSteps = [
    'Continue clinical monitoring',
    'Document all interventions',
    'Communicate with patient/family'
  ];

  if (riskAssessment.risk_level === 'high') {
    return [
      'Urgent specialist consultation',
      'Consider ICU admission',
      'Frequent reassessment',
      ...baseSteps
    ];
  }

  return baseSteps;
}

function isTimeCritical(emergencyType: string, riskAssessment: any): boolean {
  const timeCriticalEmergencies = ['stroke', 'stemi', 'sepsis', 'trauma'];
  return timeCriticalEmergencies.includes(emergencyType.toLowerCase()) ||
         riskAssessment.risk_level === 'high';
}

function calculateDoorToAssessment(emergencyType: string): string {
  const targets: { [key: string]: string } = {
    stroke: '10 minutes',
    chest_pain: '10 minutes',
    sepsis: '15 minutes',
    trauma: '5 minutes'
  };
  return targets[emergencyType.toLowerCase()] || '15 minutes';
}

function calculateDoorToTreatment(emergencyType: string): string {
  const targets: { [key: string]: string } = {
    stroke: '60 minutes (tPA), 90 minutes (thrombectomy)',
    stemi: '90 minutes (PCI)',
    sepsis: '60 minutes (antibiotics)',
    trauma: '60 minutes (OR if needed)'
  };
  return targets[emergencyType.toLowerCase()] || 'Variable based on condition';
}

function isWithinGoldenHour(symptomOnset: string): boolean {
  if (!symptomOnset) return false;

  const onsetTime = new Date(symptomOnset);
  const now = new Date();
  const diffMinutes = (now.getTime() - onsetTime.getTime()) / (1000 * 60);

  return diffMinutes <= 60;
}

function getAssessmentTools(emergencyType: string): string[] {
  const tools: { [key: string]: string[] } = {
    stroke: ['BEFAST', 'NIHSS', 'Modified Rankin Scale'],
    chest_pain: ['HEART Score', '12-lead ECG', 'Troponin'],
    sepsis: ['qSOFA', 'SIRS Criteria', 'SOFA Score'],
    trauma: ['GCS', 'Trauma Triage Protocol', 'FAST Exam']
  };
  return tools[emergencyType.toLowerCase()] || ['Standard clinical assessment'];
}