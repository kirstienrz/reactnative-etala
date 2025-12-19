import React from 'react';
import { Users } from 'lucide-react';

const Organizational = () => {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <span className="text-sm font-bold text-violet-300 tracking-wider uppercase mb-6 inline-block">
            Our Team
          </span>
          <h1 className="text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Organizational Structure
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
          <p className="text-xl text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Meet the dedicated team working to promote gender equality and development at TUP Taguig
          </p>
        </div>
      </section>

      {/* Organizational Chart Section */}
      <section className="py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-violet-600 tracking-wider uppercase mb-4 inline-block">
              Structure Overview
            </span>
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6">
              Office Hierarchy
            </h2>
          </div>

          {/* Org Chart Placeholder */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-100">
            <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 aspect-[16/10] flex items-center justify-center">
              <img 
                src="/assets/org-chart.png" 
                alt="GAD Office Organizational Chart"
                className="w-full h-full object-contain p-8"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-black text-slate-700 mb-4">
                  Organizational Chart
                </h3>
                <p className="text-lg text-slate-500 max-w-md">
                  Office organizational structure and hierarchy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Organizational;