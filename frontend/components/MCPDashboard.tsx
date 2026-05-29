"use client";

import { useState } from "react";
import { Shield, Zap, Brain, Activity, AlertTriangle, Database } from "lucide-react";

interface MCPFeature {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'available' | 'disabled';
  icon: any;
  capabilities: string[];
}

export function MCPDashboard() {
  const [activeFeatures] = useState<MCPFeature[]>([
    {
      id: 'drug-intelligence',
      name: 'Enhanced Drug Intelligence',
      description: 'Real-time drug interaction checking with comprehensive safety analysis',
      status: 'active',
      icon: Shield,
      capabilities: [
        'Drug-drug interaction detection',
        'Allergy cross-referencing',
        'Contraindication alerts',
        'Dosing recommendations'
      ]
    },
    {
      id: 'clinical-protocols',
      name: 'Emergency Clinical Protocols',
      description: 'Evidence-based emergency assessment and treatment protocols',
      status: 'active',
      icon: Zap,
      capabilities: [
        'BEFAST stroke assessment',
        'Chest pain risk stratification',
        'Sepsis recognition protocols',
        'Time-critical decision support'
      ]
    },
    {
      id: 'medical-knowledge',
      name: 'Clinical Knowledge Base',
      description: 'Access to comprehensive medical guidelines and research',
      status: 'active',
      icon: Brain,
      capabilities: [
        'Clinical practice guidelines',
        'Evidence-based recommendations',
        'Specialty-specific protocols',
        'Treatment pathway guidance'
      ]
    },
    {
      id: 'quality-metrics',
      name: 'Quality & Safety Metrics',
      description: 'Real-time clinical quality indicators and safety monitoring',
      status: 'active',
      icon: Activity,
      capabilities: [
        'Door-to-treatment tracking',
        'Clinical outcome monitoring',
        'Safety alert management',
        'Performance dashboards'
      ]
    }
  ]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-4 md:p-6 border border-blue-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">MCP Clinical Intelligence</h2>
          <p className="text-xs md:text-sm text-slate-600">Enhanced clinical decision support powered by Model Context Protocol</p>
        </div>
        <div className="flex-shrink-0">
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            MCP Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {activeFeatures.map((feature) => (
          <div key={feature.id} className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="flex items-start gap-3 md:gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                feature.status === 'active' ? 'bg-blue-100 text-blue-600' :
                feature.status === 'available' ? 'bg-amber-100 text-amber-600' :
                'bg-slate-100 text-slate-400'
              }`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{feature.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    feature.status === 'active' ? 'bg-green-100 text-green-700' :
                    feature.status === 'available' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {feature.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{feature.description}</p>
                <div className="space-y-1">
                  {feature.capabilities.slice(0, 3).map((capability, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-slate-600 break-words">{capability}</span>
                    </div>
                  ))}
                  {feature.capabilities.length > 3 && (
                    <div className="text-xs text-slate-400 ml-3.5">
                      +{feature.capabilities.length - 3} more capabilities
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <h4 className="font-semibold text-slate-900 text-sm">Clinical Intelligence Status</h4>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="text-lg md:text-xl font-bold text-green-600">99.9%</div>
            <div className="text-xs text-slate-600">Uptime</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="text-lg md:text-xl font-bold text-blue-600">2.1ms</div>
            <div className="text-xs text-slate-600">Response Time</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="text-lg md:text-xl font-bold text-purple-600">15,000+</div>
            <div className="text-xs text-slate-600">Knowledge Entries</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="text-lg md:text-xl font-bold text-amber-600">Real-time</div>
            <div className="text-xs text-slate-600">Updates</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Powered by Model Context Protocol (MCP)</span>
          <span>Clinical Intelligence v1.0</span>
        </div>
      </div>
    </div>
  );
}