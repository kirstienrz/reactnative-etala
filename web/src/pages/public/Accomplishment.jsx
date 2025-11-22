import React from 'react';
import { Download } from 'lucide-react';

const Accomplishment = () => {
  const accomplishmentYears = [
    { year: '2024', file: '/assets/accomplishments/2024.pdf' },
    { year: '2023', file: '/assets/accomplishments/2023.pdf' },
    { year: '2022', file: '/assets/accomplishments/2022.pdf' },
    { year: '2021', file: '/assets/accomplishments/2021.pdf' }
  ];

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Accomplishment Reports
          </h1>
          <div className="w-20 h-1 bg-violet-400 mx-auto"></div>
        </div>
      </section>

      {/* Reports Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="space-y-4">
            {accomplishmentYears.map((item, idx) => (
              <a
                key={idx}
                href={item.file}
                download
                className="group flex items-center justify-between p-6 bg-white border border-slate-200 hover:border-violet-600 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    {item.year} Annual Accomplishment Report
                  </h3>
                  <p className="text-slate-500 text-sm">
                    GAD Office - TUP Taguig
                  </p>
                </div>
                <div className="flex items-center gap-3 text-violet-600 font-semibold group-hover:gap-4 transition-all">
                  <span>Download</span>
                  <Download className="w-5 h-5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Accomplishment;