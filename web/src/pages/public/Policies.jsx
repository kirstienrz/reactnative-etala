import React from 'react';
import { FileText, Download, Scale } from 'lucide-react';

const PoliciesPage = () => {
  const policies = [
    {
      title: 'Gender and Development Policy',
      description: 'Comprehensive policy framework for gender mainstreaming across all institutional operations and programs.',
      file: '/assets/policies/gad-policy.pdf'
    },
    {
      title: 'Anti-Sexual Harassment Policy',
      description: 'Guidelines and procedures for preventing and addressing sexual harassment in the workplace and academic environment.',
      file: '/assets/policies/anti-harassment.pdf'
    },
    {
      title: 'Safe Spaces Policy',
      description: 'Framework for creating and maintaining safe, respectful, and inclusive environments for all members of the university community.',
      file: '/assets/policies/safe-spaces.pdf'
    },
    {
      title: 'Gender-Fair Language Policy',
      description: 'Standards and guidelines for the use of inclusive and non-discriminatory language in official communications and documents.',
      file: '/assets/policies/gender-fair-language.pdf'
    },
    {
      title: 'Work-Life Balance Policy',
      description: 'Policies supporting employee wellbeing, flexible work arrangements, and work-life integration.',
      file: '/assets/policies/work-life-balance.pdf'
    },
    {
      title: 'Maternity and Paternity Leave Policy',
      description: 'Comprehensive leave provisions and benefits for employees during maternity, paternity, and parental responsibilities.',
      file: '/assets/policies/parental-leave.pdf'
    }
  ];

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            GAD Policies and Guidelines
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
          <p className="text-lg text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Official institutional policies governing gender equality, non-discrimination, and inclusive practices at Technological University of the Philippines - Taguig
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Policy Overview</h2>
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              The Gender and Development (GAD) Office of TUP Taguig has established a comprehensive framework of policies and guidelines to ensure gender equality, protect rights, and promote inclusive practices throughout the institution.
            </p>
            <p>
              These policies are developed in accordance with Republic Act No. 9710 (Magna Carta of Women), Republic Act No. 11313 (Safe Spaces Act), and other relevant national legislation. They serve as the institutional foundation for creating a gender-responsive environment that values diversity, equity, and respect.
            </p>
            <p>
              All members of the university community—students, faculty, staff, and administrators—are expected to understand and comply with these policies. The GAD Office is committed to providing guidance, support, and mechanisms for implementation and enforcement.
            </p>
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Institutional Policies</h2>
          
          <div className="space-y-6">
            {policies.map((policy, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-lg p-8 hover:border-violet-400 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-6 flex-1">
                    <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-7 h-7 text-slate-600" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-3">
                        {policy.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {policy.description}
                      </p>
                    </div>
                  </div>

                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-3 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-medium text-sm flex-shrink-0">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default PoliciesPage;