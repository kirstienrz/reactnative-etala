import React, { useState } from 'react';
import { X, Shield, FileText, CheckCircle, Info, Lock, AlertTriangle } from 'lucide-react';

const PolicyModal = ({ isOpen, onClose, initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  const TermsContent = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <section>
        <h4 className="flex items-center gap-2 text-violet-700 font-bold mb-3">
          <Info size={18} />
          1. System Purpose
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed">
          ETALA is the official reporting platform for Gender-Based Violence (GBV) and harassment within the campus community. Our purpose is to provide a safe, secure, and confidential space for survivors and witnesses to report incidents and seek support from the TUP Gender and Development (GAD) Office.
        </p>
      </section>

      <section>
        <h4 className="flex items-center gap-2 text-violet-700 font-bold mb-3">
          <AlertTriangle size={18} />
          2. User Responsibility & Integrity
        </h4>
        <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5">
          <li><strong>Accuracy:</strong> Users are strictly required to provide truthful and accurate information. Intentionally submitting false reports is a serious offense and may lead to disciplinary action under the Student Handbook or Employee Code of Conduct.</li>
          <li><strong>Lawful Use:</strong> The system must not be used for harassment, defamation, or malicious intent against any member of the community.</li>
          <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials.</li>
        </ul>
      </section>

      <section>
        <h4 className="flex items-center gap-2 text-violet-700 font-bold mb-3">
          <Shield size={18} />
          3. Confidentiality & Disclosure
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed">
          ETALA prioritizes your safety and confidentiality. Reports are handled exclusively by the TUPT GAD Office. Personal identifiers are protected under strict security protocols. Disclosure to external authorities only occurs with your explicit consent or in extreme circumstances where there is an immediate threat to life or a legal mandate for public safety.
        </p>
      </section>

      <section>
        <h4 className="flex items-center gap-2 text-violet-700 font-bold mb-3">
          <CheckCircle size={18} />
          4. Prohibited Acts
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed italic bg-red-50 p-3 rounded-lg border border-red-100">
          "Misuse of the ETALA system, including but not limited to spamming, hacking, or attempting to bypass security measures, will result in immediate suspension and administrative investigation."
        </p>
      </section>
    </div>
  );

  const PrivacyContent = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <section>
        <h4 className="flex items-center gap-2 text-blue-700 font-bold mb-3">
          <Lock size={18} />
          1. Data Collection
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          We collect information necessary to provide support and process your report safely:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-500">
          <div className="bg-blue-50 p-2 rounded-lg">TUP ID & Full Name</div>
          <div className="bg-blue-50 p-2 rounded-lg">Institutional Email</div>
          <div className="bg-blue-50 p-2 rounded-lg">Gender & Birthday</div>
          <div className="bg-blue-50 p-2 rounded-lg">Department/College</div>
        </div>
      </section>

      <section>
        <h4 className="flex items-center gap-2 text-blue-700 font-bold mb-3">
          <FileText size={18} />
          2. Use of Information
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed">
          Your data is used exclusively for:
        </p>
        <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5 mt-2">
          <li>Providing immediate support and guidance through the GAD Office.</li>
          <li>Coordinating with campus units (Guidance, Medical, Security) for holistic survivor care.</li>
          <li>Developing gender-responsive programs based on anonymized statistical data.</li>
          <li>Assisting in administrative or legal proceedings as requested by the survivor.</li>
        </ul>
      </section>

      <section>
        <h4 className="flex items-center gap-2 text-blue-700 font-bold mb-3">
          <Shield size={18} />
          3. Data Security & Retention
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed">
          We employ industry-standard encryption and secure database protocols to protect your information. Records are retained in accordance with the National Archives of the Philippines (NAP) guidelines and university policies.
        </p>
      </section>

      <section className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <h4 className="text-blue-800 font-bold text-sm mb-1">Your Rights</h4>
        <p className="text-blue-700 text-xs">
          Under the Data Privacy Act of 2012 (RA 10173), you have the right to access, correct, or request the deletion of your personal data, subject to university records retention policies.
        </p>
      </section>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col transform animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={28} className="text-violet-200" />
            <div>
              <h2 className="text-xl font-black tracking-tight">Policies & Guidelines</h2>
              <p className="text-violet-100 text-xs">Last updated: May 2026</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-gray-50 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'terms' 
                ? 'bg-white text-violet-600 shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <FileText size={18} />
            TERMS OF USE
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'privacy' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Shield size={18} />
            PRIVACY POLICY
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[10px] text-gray-400 font-medium max-w-[300px]">
            By continuing, you acknowledge that you have read and understood these policies.
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-100"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
