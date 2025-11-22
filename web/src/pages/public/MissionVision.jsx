import React from 'react';
import { Target, Eye, Heart, Users } from 'lucide-react';

const MissionVisionPage = () => {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <span className="text-sm font-bold text-violet-300 tracking-wider uppercase mb-6 inline-block">
            Our Purpose
          </span>
          <h1 className="text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Mission & Vision
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
          <p className="text-xl text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Guiding principles that drive our commitment to gender equality and inclusive development
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-3 mb-6 bg-violet-50 px-6 py-3 rounded-full">
                <Target className="w-6 h-6 text-violet-600" />
                <span className="text-sm font-bold text-violet-600 tracking-wider uppercase">Our Mission</span>
              </div>
              
              <h2 className="text-5xl font-black text-slate-900 mb-8 leading-tight">
                What We Do
              </h2>
              
              <div className="prose prose-lg text-slate-700 space-y-6">
                <p className="text-xl leading-relaxed">
                  To promote gender equality and women's empowerment through comprehensive programs, policies, and activities that eliminate discrimination and ensure equal opportunities for all members of the TUP Taguig community.
                </p>
                
                <p className="text-lg leading-relaxed text-slate-600">
                  We are committed to integrating gender perspectives into all institutional operations, fostering an inclusive environment where every individual—regardless of gender—can thrive academically, professionally, and personally.
                </p>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl -z-10"></div>
                <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-12 shadow-2xl">
                  <Target className="w-24 h-24 text-white mb-6" />
                  <h3 className="text-3xl font-black text-white mb-4">Core Focus</h3>
                  <ul className="space-y-4 text-violet-100">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-violet-300 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-lg">Gender mainstreaming across all university operations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-violet-300 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-lg">Policy development and advocacy initiatives</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-violet-300 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-lg">Evidence-based research and programs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl -z-10"></div>
                <div className="bg-gradient-to-br from-purple-700 to-violet-600 rounded-2xl p-12 shadow-2xl">
                  <Eye className="w-24 h-24 text-white mb-6" />
                  <h3 className="text-3xl font-black text-white mb-4">Future Outlook</h3>
                  <ul className="space-y-4 text-purple-100">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-300 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-lg">Gender-responsive campus culture</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-300 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-lg">Equal opportunities for all genders</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-300 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-lg">Leading institution in gender advocacy</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <div className="inline-flex items-center gap-3 mb-6 bg-purple-50 px-6 py-3 rounded-full">
                <Eye className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-bold text-purple-600 tracking-wider uppercase">Our Vision</span>
              </div>
              
              <h2 className="text-5xl font-black text-slate-900 mb-8 leading-tight">
                Where We're Going
              </h2>
              
              <div className="prose prose-lg text-slate-700 space-y-6">
                <p className="text-xl leading-relaxed">
                  To be a leading institution in gender and development, fostering a gender-responsive campus culture where equality, respect, and empowerment are foundational to every aspect of university life.
                </p>
                
                <p className="text-lg leading-relaxed text-slate-600">
                  We envision a future where TUP Taguig serves as a model for gender-sensitive education, producing graduates who champion equality and contribute to building a more just and equitable society.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};

export default MissionVisionPage;