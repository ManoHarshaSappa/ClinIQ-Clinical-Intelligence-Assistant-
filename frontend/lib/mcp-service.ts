// MCP Service for ClinIQ Clinical Intelligence
// Simplified integration for medical knowledge and drug information

export interface DrugInteractionResult {
  drug_name: string;
  interactions: Array<{
    medication: string;
    severity: 'high' | 'moderate' | 'low';
    description: string;
  }>;
  contraindications: string[];
  safety_status: 'safe' | 'caution' | 'danger';
  recommendations: string[];
}

export interface ClinicalGuideline {
  condition: string;
  title: string;
  summary: string;
  recommendations: string[];
  evidence_level: 'high' | 'moderate' | 'low';
  last_updated: string;
}

export interface EmergencyProtocol {
  emergency_type: string;
  protocol: {
    assessment: any;
    timeline: any;
    critical_actions: string[];
  };
  urgency: 'high' | 'medium' | 'low';
}

// In-memory medical knowledge database (simulating MCP server responses)
class ClinIQMedicalKnowledge {
  private drugInteractions = new Map([
    ['warfarin', {
      interactions: [
        { medication: 'aspirin', severity: 'high' as const, description: 'Increased bleeding risk' },
        { medication: 'ibuprofen', severity: 'high' as const, description: 'Increased bleeding risk' },
        { medication: 'acetaminophen', severity: 'low' as const, description: 'Monitor INR levels' }
      ],
      contraindications: ['active bleeding', 'severe liver disease', 'pregnancy'],
      safety_recommendations: [
        'Monitor INR levels regularly',
        'Avoid vitamin K-rich foods in large amounts',
        'Watch for signs of bleeding'
      ]
    }],
    ['metformin', {
      interactions: [
        { medication: 'contrast dye', severity: 'high' as const, description: 'Risk of lactic acidosis' },
        { medication: 'alcohol', severity: 'moderate' as const, description: 'Increased hypoglycemia risk' }
      ],
      contraindications: ['severe kidney disease', 'heart failure', 'liver disease'],
      safety_recommendations: [
        'Monitor kidney function',
        'Hold before contrast procedures',
        'Monitor for lactic acidosis symptoms'
      ]
    }],
    ['lisinopril', {
      interactions: [
        { medication: 'potassium supplements', severity: 'moderate' as const, description: 'Risk of hyperkalemia' },
        { medication: 'nsaids', severity: 'moderate' as const, description: 'Reduced effectiveness, kidney effects' }
      ],
      contraindications: ['pregnancy', 'angioedema history', 'bilateral renal artery stenosis'],
      safety_recommendations: [
        'Monitor potassium levels',
        'Check kidney function',
        'Monitor blood pressure response'
      ]
    }]
  ]);

  private clinicalGuidelines = new Map([
    ['diabetes', {
      title: 'Type 2 Diabetes Management Guidelines',
      summary: 'Comprehensive evidence-based approach to diabetes care',
      recommendations: [
        'Metformin as first-line therapy unless contraindicated',
        'HbA1c target <7% for most adults, individualize based on patient factors',
        'Blood pressure target <130/80 mmHg',
        'LDL cholesterol <100 mg/dL (<70 mg/dL for very high risk)',
        'Statin therapy for cardiovascular protection',
        'Annual eye and foot exams',
        'Lifestyle modifications including diet and exercise'
      ],
      evidence_level: 'high' as const,
      specialty: 'Endocrinology'
    }],
    ['hypertension', {
      title: 'Clinical Practice Guidelines for High Blood Pressure',
      summary: 'Evidence-based recommendations for hypertension management',
      recommendations: [
        'Lifestyle modifications for all patients',
        'ACE inhibitor or ARB as first-line therapy',
        'Target BP <130/80 mmHg for most adults',
        'Thiazide diuretic or calcium channel blocker as alternatives',
        'Combination therapy often required',
        'Home blood pressure monitoring',
        'Regular follow-up and medication adjustment'
      ],
      evidence_level: 'high' as const,
      specialty: 'Cardiology'
    }],
    ['stroke', {
      title: 'Acute Stroke Management Protocol',
      summary: 'Time-critical emergency stroke care guidelines',
      recommendations: [
        'BEFAST assessment within 10 minutes of arrival',
        'Non-contrast CT within 25 minutes',
        'IV tPA within 3-4.5 hours if eligible',
        'Mechanical thrombectomy evaluation for large vessel occlusion',
        'Blood pressure management',
        'Aspirin within 24-48 hours unless contraindicated',
        'Early mobilization and rehabilitation'
      ],
      evidence_level: 'high' as const,
      specialty: 'Neurology'
    }]
  ]);

  private emergencyProtocols = new Map([
    ['stroke', {
      assessment: {
        befast: {
          balance: 'Sudden loss of balance, coordination, or dizziness',
          eyes: 'Sudden vision loss or changes',
          face: 'Facial drooping - ask patient to smile',
          arms: 'Arm weakness - ask patient to raise both arms',
          speech: 'Speech difficulty - ask patient to repeat simple phrase',
          time: 'Time is critical - note symptom onset time'
        },
        nihss: 'National Institutes of Health Stroke Scale',
        imaging: ['Non-contrast CT', 'CT Angiography if thrombectomy candidate']
      },
      timeline: {
        door_to_ct: '25 minutes',
        door_to_needle: '60 minutes for tPA',
        door_to_groin: '90 minutes for thrombectomy',
        golden_hour: 'First 60 minutes most critical'
      },
      critical_actions: [
        'Activate stroke team',
        'Establish IV access',
        'Check blood glucose',
        'Obtain CT scan STAT',
        'Assess for tPA eligibility',
        'Consider thrombectomy candidacy'
      ]
    }]
  ]);

  async checkDrugInteraction(drugName: string, patientMedications: string[] = []): Promise<DrugInteractionResult> {
    const drugKey = drugName.toLowerCase();
    const drugData = this.drugInteractions.get(drugKey);

    if (!drugData) {
      return {
        drug_name: drugName,
        interactions: [],
        contraindications: [],
        safety_status: 'safe',
        recommendations: ['Drug not found in knowledge base - consult clinical pharmacist']
      };
    }

    // Check for interactions with patient's current medications
    const foundInteractions = drugData.interactions.filter(interaction =>
      patientMedications.some(med =>
        med.toLowerCase().includes(interaction.medication) ||
        interaction.medication.includes(med.toLowerCase())
      )
    );

    const maxSeverity = foundInteractions.reduce((max, interaction) => {
      if (interaction.severity === 'high') return 'high';
      if (interaction.severity === 'moderate' && max !== 'high') return 'moderate';
      return max;
    }, 'low' as 'high' | 'moderate' | 'low');

    const safetyStatus = foundInteractions.length === 0 ? 'safe' :
                        maxSeverity === 'high' ? 'danger' : 'caution';

    return {
      drug_name: drugName,
      interactions: foundInteractions,
      contraindications: drugData.contraindications,
      safety_status: safetyStatus,
      recommendations: [
        ...drugData.safety_recommendations,
        ...(foundInteractions.length > 0 ? ['Monitor closely for interaction effects'] : [])
      ]
    };
  }

  async getClinicalGuidelines(condition: string): Promise<ClinicalGuideline | null> {
    const conditionKey = condition.toLowerCase();
    const guideline = this.clinicalGuidelines.get(conditionKey);

    if (!guideline) {
      return null;
    }

    return {
      condition: condition,
      title: guideline.title,
      summary: guideline.summary,
      recommendations: guideline.recommendations,
      evidence_level: guideline.evidence_level,
      last_updated: new Date().toISOString()
    };
  }

  async getEmergencyProtocol(emergencyType: string): Promise<EmergencyProtocol | null> {
    const emergencyKey = emergencyType.toLowerCase();
    const protocol = this.emergencyProtocols.get(emergencyKey);

    if (!protocol) {
      return null;
    }

    return {
      emergency_type: emergencyType,
      protocol: protocol,
      urgency: 'high'
    };
  }

  async enhancedDrugSafety(medications: string[], allergies: string[], conditions: string[]) {
    const safetyReport = {
      medications_checked: medications,
      interactions: [] as any[],
      allergy_alerts: [] as any[],
      condition_alerts: [] as any[],
      overall_safety: 'safe' as 'safe' | 'caution' | 'danger',
      clinical_recommendations: [] as string[]
    };

    // Check each medication for interactions
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drug1Result = await this.checkDrugInteraction(medications[i], [medications[j]]);
        if (drug1Result.interactions.length > 0) {
          safetyReport.interactions.push({
            drug1: medications[i],
            drug2: medications[j],
            interactions: drug1Result.interactions,
            severity: drug1Result.safety_status
          });
        }
      }
    }

    // Check for allergy conflicts (simplified)
    const knownAllergyDrugs = {
      'penicillin': ['amoxicillin', 'ampicillin', 'penicillin'],
      'sulfa': ['sulfamethoxazole', 'trimethoprim'],
      'nsaid': ['ibuprofen', 'naproxen', 'diclofenac']
    };

    for (const allergy of allergies) {
      const allergyKey = allergy.toLowerCase();
      const conflictDrugs = knownAllergyDrugs[allergyKey as keyof typeof knownAllergyDrugs];
      if (conflictDrugs) {
        for (const med of medications) {
          if (conflictDrugs.some(conflict => med.toLowerCase().includes(conflict))) {
            safetyReport.allergy_alerts.push({
              medication: med,
              allergy: allergy,
              severity: 'high',
              recommendation: 'AVOID - Known allergy conflict'
            });
          }
        }
      }
    }

    // Determine overall safety
    if (safetyReport.allergy_alerts.length > 0) {
      safetyReport.overall_safety = 'danger';
    } else if (safetyReport.interactions.some(i => i.severity === 'danger')) {
      safetyReport.overall_safety = 'danger';
    } else if (safetyReport.interactions.length > 0) {
      safetyReport.overall_safety = 'caution';
    }

    // Generate clinical recommendations
    if (safetyReport.overall_safety === 'danger') {
      safetyReport.clinical_recommendations.push('URGENT: Review medications for critical safety issues');
    }
    if (safetyReport.interactions.length > 0) {
      safetyReport.clinical_recommendations.push('Monitor for drug interaction effects');
    }
    if (safetyReport.allergy_alerts.length > 0) {
      safetyReport.clinical_recommendations.push('Review allergy history before prescribing');
    }

    return safetyReport;
  }
}

// Export singleton instance
export const cliniqMedicalKnowledge = new ClinIQMedicalKnowledge();

// Export clinical decision support functions
export async function getMCPDrugInformation(drugName: string, patientMedications: string[] = []) {
  try {
    const result = await cliniqMedicalKnowledge.checkDrugInteraction(drugName, patientMedications);
    return {
      success: true,
      data: result,
      source: 'ClinIQ Medical Knowledge (MCP-Enhanced)'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

export async function getMCPClinicalGuidelines(condition: string) {
  try {
    const result = await cliniqMedicalKnowledge.getClinicalGuidelines(condition);
    return {
      success: true,
      data: result,
      source: 'ClinIQ Clinical Guidelines (MCP-Enhanced)'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

export async function getMCPEmergencyProtocol(emergencyType: string) {
  try {
    const result = await cliniqMedicalKnowledge.getEmergencyProtocol(emergencyType);
    return {
      success: true,
      data: result,
      source: 'ClinIQ Emergency Protocols (MCP-Enhanced)'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}