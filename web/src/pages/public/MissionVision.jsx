import React from 'react';
import { Target, Eye, Heart, Users } from 'lucide-react';

const MissionVisionPage = () => {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight select-none">
            Mission & <span className="text-violet-400">Vision</span>
          </h1>
          <div className="w-20 h-1.5 bg-violet-500 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-violet-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Our guiding principles and aspirations towards a gender-responsive and inclusive university community.
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

              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
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

              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
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