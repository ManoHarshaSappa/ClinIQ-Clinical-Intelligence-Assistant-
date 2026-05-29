import { Stethoscope, Brain, Pill, Search, Users, Upload, AlertTriangle, Globe, Mail, GraduationCap, Heart, Database, Cpu, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Stethoscope className="w-12 h-12 text-blue-600" />
          <h1 className="text-4xl font-bold text-slate-900">About ClinIQ</h1>
        </div>
        <p className="text-xl text-slate-600">
          AI-powered Clinical Intelligence Assistant that reduces manual work and speeds up healthcare decisions.
        </p>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-12"></div>

      {/* What Problem We Solve */}
      <div className="mb-12">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">❌ The Problem</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">⏰</div>
              <h3 className="font-semibold text-slate-900">Hours of Manual Work</h3>
              <p className="text-sm text-slate-600">Doctors spend hours reading patient records manually</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🐌</div>
              <h3 className="font-semibold text-slate-900">Slow Decisions</h3>
              <p className="text-sm text-slate-600">Patient care gets delayed due to information search</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-semibold text-slate-900">Hard to Find Info</h3>
              <p className="text-sm text-slate-600">Critical patient data is buried in documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-12"></div>

      {/* How We Solve It */}
      <div className="mb-12">
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">✅ Our Solution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="font-semibold text-slate-900">AI Does the Work</h3>
              <p className="text-sm text-slate-600">Automatically reads and extracts all medical data</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-slate-900">Instant Answers</h3>
              <p className="text-sm text-slate-600">Chat with patient records for quick answers</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold text-slate-900">Smart Search</h3>
              <p className="text-sm text-slate-600">Find any patient info in seconds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-12"></div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">How ClinIQ Works</h2>
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-center text-center space-x-8">
            <div className="flex-1">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">1. Upload</h3>
              <p className="text-sm text-slate-600">Drop PDF, TXT, or CSV medical files</p>
            </div>

            <div className="text-2xl text-slate-400">→</div>

            <div className="flex-1">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">2. AI Reads</h3>
              <p className="text-sm text-slate-600">GPT-4o extracts all medical data</p>
            </div>

            <div className="text-2xl text-slate-400">→</div>

            <div className="flex-1">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">3. Ask Questions</h3>
              <p className="text-sm text-slate-600">Chat with records, search, check drugs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-12"></div>

      {/* Key Features */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">What You Can Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-semibold">Manage Patients</h3>
            </div>
            <p className="text-slate-600">Upload records and AI organizes all patient information automatically.</p>
          </div>

          <div className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-8 h-8 text-purple-600" />
              <h3 className="text-xl font-semibold">Ask Questions</h3>
            </div>
            <p className="text-slate-600">Chat with patient records to get instant answers about medications and more.</p>
          </div>

          <div className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-semibold">Check Drug Safety</h3>
            </div>
            <p className="text-slate-600">Instantly check if drugs are safe to prescribe together.</p>
          </div>

          <div className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <h3 className="text-xl font-semibold">Emergency Tools</h3>
            </div>
            <p className="text-slate-600">Fast stroke assessment using BEFAST protocol for emergency situations.</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-12"></div>

      {/* About the Creator */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">About the Creator</h2>

        <div className="bg-white border border-slate-200 rounded-lg p-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              MS
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Manoharsha Sappa</h3>
              <p className="text-slate-600 mb-4">Student, George Mason University</p>

              <p className="text-slate-700 leading-relaxed mb-6">
                Building AI tools to help doctors work faster and provide better patient care.
                Focused on reducing manual work in healthcare and making expert medical knowledge accessible everywhere.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.linkedin.com/in/manoharshasappa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Users className="w-4 h-4" />
                  LinkedIn
                </a>
                <a
                  href="https://github.com/ManoHarshaSappa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors"
                >
                  <Database className="w-4 h-4" />
                  GitHub
                </a>
                <a
                  href="https://manoharshasappa.github.io/portfolio_ManoHarshaSappa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Portfolio
                </a>
                <a
                  href="mailto:sappamanoharsha@gmail.com?subject=ClinIQ%20Inquiry&body=Hi%20Manoharsha,%0A%0AI'm%20interested%20in%20learning%20more%20about%20ClinIQ.%0A%0AThank%20you!"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-slate-200">
        <p className="text-slate-500 mb-2">
          <strong>ClinIQ Clinical Intelligence Assistant</strong>
        </p>
        <p className="text-slate-400 text-sm">
          Making healthcare smarter, one patient at a time.
        </p>
      </div>
    </div>
  );
}