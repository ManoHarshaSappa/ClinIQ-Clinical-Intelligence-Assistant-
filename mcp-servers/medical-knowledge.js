#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Medical knowledge database
const DRUG_INTERACTIONS = {
  'warfarin': {
    interactions: ['aspirin', 'ibuprofen', 'acetaminophen'],
    severity: ['high', 'moderate', 'low'],
    contraindications: ['active bleeding', 'severe liver disease']
  },
  'metformin': {
    interactions: ['contrast dye', 'alcohol'],
    severity: ['high', 'moderate'],
    contraindications: ['kidney disease', 'heart failure']
  },
  'lisinopril': {
    interactions: ['potassium supplements', 'nsaids'],
    severity: ['moderate', 'moderate'],
    contraindications: ['pregnancy', 'angioedema history']
  }
};

const CLINICAL_GUIDELINES = {
  'diabetes': {
    title: 'Diabetes Management Guidelines',
    summary: 'Evidence-based approach to Type 2 diabetes management',
    recommendations: [
      'Metformin as first-line therapy',
      'HbA1c target <7% for most adults',
      'Blood pressure target <130/80 mmHg',
      'Statin therapy for cardiovascular protection'
    ],
    evidence_level: 'high'
  },
  'hypertension': {
    title: 'Hypertension Clinical Guidelines',
    summary: 'Comprehensive blood pressure management strategy',
    recommendations: [
      'Lifestyle modifications first',
      'ACE inhibitor or ARB as first-line',
      'Target BP <130/80 mmHg for most adults',
      'Combination therapy often needed'
    ],
    evidence_level: 'high'
  },
  'stroke': {
    title: 'Acute Stroke Management',
    summary: 'Emergency stroke care protocols',
    recommendations: [
      'BEFAST assessment within 10 minutes',
      'CT scan within 25 minutes of arrival',
      'tPA administration within 3-4.5 hours',
      'Thrombectomy evaluation for large vessel occlusion'
    ],
    evidence_level: 'high'
  }
};

const EMERGENCY_PROTOCOLS = {
  'stroke': {
    befast: {
      balance: 'Sudden loss of balance, coordination, or dizziness',
      eyes: 'Sudden vision loss or changes',
      face: 'Facial drooping - ask patient to smile',
      arms: 'Arm weakness - ask patient to raise both arms',
      speech: 'Speech difficulty - ask patient to repeat phrase',
      time: 'Time is critical - call 911 immediately'
    },
    timeline: {
      'golden_hour': 'First 60 minutes critical',
      'tpa_window': '3-4.5 hours for thrombolytic therapy',
      'thrombectomy_window': '6-24 hours for mechanical thrombectomy'
    }
  }
};

class MedicalKnowledgeServer {
  constructor() {
    this.server = new Server(
      {
        name: 'medical-knowledge-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
  }

  setupToolHandlers() {
    // Drug interaction checker
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'drug_interaction':
          return this.checkDrugInteraction(args);
        case 'get_guidelines':
          return this.getClinicalGuidelines(args);
        case 'emergency_protocol':
          return this.getEmergencyProtocol(args);
        case 'medication_safety':
          return this.checkMedicationSafety(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    // List available tools
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'drug_interaction',
            description: 'Check drug interactions and contraindications',
            inputSchema: {
              type: 'object',
              properties: {
                drug_name: { type: 'string' },
                patient_medications: { type: 'array', items: { type: 'string' } },
                include_contraindications: { type: 'boolean' }
              },
              required: ['drug_name']
            }
          },
          {
            name: 'get_guidelines',
            description: 'Get clinical guidelines for specific conditions',
            inputSchema: {
              type: 'object',
              properties: {
                condition: { type: 'string' },
                specialty: { type: 'string' }
              },
              required: ['condition']
            }
          },
          {
            name: 'emergency_protocol',
            description: 'Get emergency assessment protocols',
            inputSchema: {
              type: 'object',
              properties: {
                emergency_type: { type: 'string' },
                assessment_needed: { type: 'boolean' }
              },
              required: ['emergency_type']
            }
          },
          {
            name: 'medication_safety',
            description: 'Comprehensive medication safety check',
            inputSchema: {
              type: 'object',
              properties: {
                medications: { type: 'array', items: { type: 'string' } },
                patient_allergies: { type: 'array', items: { type: 'string' } },
                patient_conditions: { type: 'array', items: { type: 'string' } }
              },
              required: ['medications']
            }
          }
        ]
      };
    });
  }

  setupResourceHandlers() {
    this.server.setRequestHandler('resources/list', async () => {
      return {
        resources: [
          {
            uri: 'medical://guidelines/diabetes',
            name: 'Diabetes Guidelines',
            mimeType: 'application/json'
          },
          {
            uri: 'medical://protocols/stroke',
            name: 'Stroke Emergency Protocol',
            mimeType: 'application/json'
          },
          {
            uri: 'medical://interactions/database',
            name: 'Drug Interactions Database',
            mimeType: 'application/json'
          }
        ]
      };
    });

    this.server.setRequestHandler('resources/read', async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'medical://guidelines/diabetes':
          return { contents: [{ type: 'text', text: JSON.stringify(CLINICAL_GUIDELINES.diabetes) }] };
        case 'medical://protocols/stroke':
          return { contents: [{ type: 'text', text: JSON.stringify(EMERGENCY_PROTOCOLS.stroke) }] };
        case 'medical://interactions/database':
          return { contents: [{ type: 'text', text: JSON.stringify(DRUG_INTERACTIONS) }] };
        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  async checkDrugInteraction(args) {
    const { drug_name, patient_medications = [], include_contraindications = true } = args;
    const drugLower = drug_name.toLowerCase();
    const drugInfo = DRUG_INTERACTIONS[drugLower];

    if (!drugInfo) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            drug: drug_name,
            interactions: [],
            contraindications: [],
            safety_status: 'unknown',
            message: 'Drug not found in database'
          })
        }]
      };
    }

    // Check for interactions with patient's current medications
    const foundInteractions = [];
    for (const med of patient_medications) {
      const medLower = med.toLowerCase();
      if (drugInfo.interactions.includes(medLower)) {
        const index = drugInfo.interactions.indexOf(medLower);
        foundInteractions.push({
          medication: med,
          severity: drugInfo.severity[index] || 'moderate',
          interaction: true
        });
      }
    }

    const result = {
      drug: drug_name,
      interactions: foundInteractions,
      contraindications: include_contraindications ? drugInfo.contraindications : [],
      safety_status: foundInteractions.length > 0 ? 'caution' : 'safe',
      recommendations: this.generateSafetyRecommendations(foundInteractions, drugInfo)
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result)
      }]
    };
  }

  async getClinicalGuidelines(args) {
    const { condition, specialty } = args;
    const conditionLower = condition.toLowerCase();
    const guideline = CLINICAL_GUIDELINES[conditionLower];

    if (!guideline) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            condition: condition,
            guidelines: [],
            message: 'No specific guidelines found for this condition'
          })
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          condition: condition,
          specialty: specialty,
          guideline: guideline,
          last_updated: new Date().toISOString()
        })
      }]
    };
  }

  async getEmergencyProtocol(args) {
    const { emergency_type, assessment_needed = true } = args;
    const emergencyLower = emergency_type.toLowerCase();
    const protocol = EMERGENCY_PROTOCOLS[emergencyLower];

    if (!protocol) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            emergency_type: emergency_type,
            protocol: null,
            message: 'Emergency protocol not found'
          })
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          emergency_type: emergency_type,
          protocol: protocol,
          assessment_tools: assessment_needed ? this.getAssessmentTools(emergency_type) : null,
          urgency: 'high'
        })
      }]
    };
  }

  async checkMedicationSafety(args) {
    const { medications, patient_allergies = [], patient_conditions = [] } = args;

    const safetyReport = {
      medications_checked: medications,
      interactions: [],
      allergy_alerts: [],
      condition_alerts: [],
      overall_safety: 'safe',
      recommendations: []
    };

    // Check each medication for interactions
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const interaction = this.checkMedicationPair(medications[i], medications[j]);
        if (interaction) {
          safetyReport.interactions.push(interaction);
        }
      }
    }

    // Check for allergy conflicts
    for (const med of medications) {
      for (const allergy of patient_allergies) {
        if (this.isAllergyConflict(med, allergy)) {
          safetyReport.allergy_alerts.push({
            medication: med,
            allergy: allergy,
            severity: 'high'
          });
        }
      }
    }

    // Determine overall safety
    if (safetyReport.allergy_alerts.length > 0) {
      safetyReport.overall_safety = 'danger';
    } else if (safetyReport.interactions.length > 0) {
      safetyReport.overall_safety = 'caution';
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(safetyReport)
      }]
    };
  }

  generateSafetyRecommendations(interactions, drugInfo) {
    const recommendations = [];

    if (interactions.length === 0) {
      recommendations.push('No significant interactions detected with current medications');
    } else {
      recommendations.push('Monitor for interaction effects');
      interactions.forEach(interaction => {
        if (interaction.severity === 'high') {
          recommendations.push(`Avoid concurrent use with ${interaction.medication} or use with extreme caution`);
        }
      });
    }

    if (drugInfo.contraindications.length > 0) {
      recommendations.push('Check for contraindications before prescribing');
    }

    return recommendations;
  }

  checkMedicationPair(med1, med2) {
    // Simplified interaction checking
    const interactions = [
      { pair: ['warfarin', 'aspirin'], severity: 'high' },
      { pair: ['warfarin', 'ibuprofen'], severity: 'high' },
      { pair: ['lisinopril', 'potassium'], severity: 'moderate' }
    ];

    const med1Lower = med1.toLowerCase();
    const med2Lower = med2.toLowerCase();

    for (const interaction of interactions) {
      if ((interaction.pair.includes(med1Lower) && interaction.pair.includes(med2Lower))) {
        return {
          medication1: med1,
          medication2: med2,
          severity: interaction.severity,
          type: 'drug-drug interaction'
        };
      }
    }

    return null;
  }

  isAllergyConflict(medication, allergy) {
    const allergyConflicts = {
      'penicillin': ['amoxicillin', 'ampicillin'],
      'sulfa': ['sulfamethoxazole', 'trimethoprim-sulfamethoxazole'],
      'nsaid': ['ibuprofen', 'naproxen', 'diclofenac']
    };

    const allergyLower = allergy.toLowerCase();
    const medicationLower = medication.toLowerCase();

    if (allergyConflicts[allergyLower]) {
      return allergyConflicts[allergyLower].some(conflict =>
        medicationLower.includes(conflict)
      );
    }

    return false;
  }

  getAssessmentTools(emergencyType) {
    switch (emergencyType.toLowerCase()) {
      case 'stroke':
        return {
          primary: 'BEFAST Assessment',
          secondary: ['NIHSS Scale', 'Glasgow Coma Scale'],
          imaging: ['CT scan', 'CT Angiography', 'MRI if indicated']
        };
      default:
        return null;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Medical Knowledge MCP Server running on stdio');
  }
}

const server = new MedicalKnowledgeServer();
server.run().catch(console.error);