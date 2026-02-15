import React from 'react';
import { BookOpen, Download } from 'lucide-react';

const Handbook = () => {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            TUP Taguig Handbook
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
          <p className="text-lg text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Official guide and reference material for students, faculty, and staff at Technological University of the Philippines - Taguig
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">About the Handbook</h2>
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              The TUP Taguig Handbook serves as a comprehensive resource that outlines the policies, procedures, rights, and responsibilities for all members of the university community. This document is regularly updated to reflect current regulations and institutional standards.
            </p>
            <p>
              All students, faculty members, and staff are encouraged to familiarize themselves with the handbook to ensure compliance with university policies and to understand the support services and resources available to them.
            </p>
            <p>
              For questions or clarifications regarding handbook content, please contact the Office of Student Affairs or the appropriate university office.
            </p>
          </div>
        </div>
      </section>

      {/* Handbook Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-8">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-violet-400 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="md:w-96 h-96 bg-gradient-to-br from-slate-200 to-slate-300 flex-shrink-0 overflow-hidden relative">
                <img 
                  src="/assets/handbook/tup-handbook.jpg" 
                  alt="TUP Taguig Handbook"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center absolute inset-0">
                  <div className="w-32 h-32 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-12 flex-1 flex flex-col justify-center">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  TUP Taguig Official Handbook
                </h3>
                <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                  Complete handbook containing academic policies, student rights and responsibilities, faculty guidelines, employee regulations, campus rules, support services, and institutional procedures.
                </p>
                <div className="space-y-4">
                  <button
                    className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl dark:from-violet-600 dark:to-purple-600 dark:text-white"
                  >
                    <Download className="w-5 h-5" />
                    Download Handbook (PDF)
                  </button>
                  <p className="text-sm text-slate-500">
                    Last updated: Academic Year 2024-2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};

export default Handbook;