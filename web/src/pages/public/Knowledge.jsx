import React from 'react';
import { BookOpen, Calendar, ArrowRight, Tag } from 'lucide-react';

const Knowledge = () => {
  const articles = [
    {
      title: 'Understanding Gender Mainstreaming in Higher Education Institutions',
      excerpt: 'Gender mainstreaming is a globally accepted strategy for promoting gender equality. This comprehensive guide explores how higher education institutions can effectively integrate gender perspectives into all aspects of their operations, from curriculum development to administrative policies...',
      category: 'Policy & Framework',
      date: 'November 15, 2024',
      readTime: '8 min read',
      image: '/assets/knowledge/gender-mainstreaming.jpg',
      link: '/knowledge/gender-mainstreaming'
    },
    {
      title: 'The Magna Carta of Women: Empowering Filipino Women Through Legislation',
      excerpt: 'Republic Act No. 9710, also known as the Magna Carta of Women, is a comprehensive women\'s human rights law that seeks to eliminate discrimination against women. This article examines the key provisions of the law and their implications for educational institutions in the Philippines...',
      category: 'Legal Framework',
      date: 'November 10, 2024',
      readTime: '10 min read',
      image: '/assets/knowledge/magna-carta.jpg',
      link: '/knowledge/magna-carta-women'
    },
    {
      title: 'Creating Safe Spaces: Implementing RA 11313 in Campus Settings',
      excerpt: 'The Safe Spaces Act (RA 11313) aims to address gender-based sexual harassment in streets, public spaces, online, workplaces, and educational institutions. Learn about practical strategies for creating and maintaining safe, respectful environments in universities...',
      category: 'Campus Safety',
      date: 'November 5, 2024',
      readTime: '7 min read',
      image: '/assets/knowledge/safe-spaces.jpg',
      link: '/knowledge/safe-spaces-implementation'
    },
    {
      title: 'Women in STEM: Breaking Barriers and Building Futures',
      excerpt: 'Despite progress in recent years, women remain underrepresented in Science, Technology, Engineering, and Mathematics fields. This article explores the challenges women face in STEM education and careers, and highlights successful initiatives that are making a difference...',
      category: 'Education & Career',
      date: 'October 28, 2024',
      readTime: '12 min read',
      image: '/assets/knowledge/women-stem.jpg',
      link: '/knowledge/women-in-stem'
    },
    {
      title: 'Gender-Responsive Budgeting: A Practical Guide for Universities',
      excerpt: 'Gender-responsive budgeting is a tool for ensuring that public resources are allocated and spent in ways that promote gender equality. This practical guide demonstrates how universities can integrate gender analysis into their budget planning and monitoring processes...',
      category: 'Finance & Planning',
      date: 'October 20, 2024',
      readTime: '15 min read',
      image: '/assets/knowledge/gender-budget.jpg',
      link: '/knowledge/gender-responsive-budgeting'
    },
    {
      title: 'Addressing Gender-Based Violence in Academic Communities',
      excerpt: 'Gender-based violence remains a critical issue in educational settings worldwide. This comprehensive article discusses the forms of gender-based violence that occur in academic communities, their impact on students and staff, and evidence-based prevention strategies...',
      category: 'Safety & Wellbeing',
      date: 'October 12, 2024',
      readTime: '11 min read',
      image: '/assets/knowledge/gbv-prevention.jpg',
      link: '/knowledge/gender-based-violence'
    },
    {
      title: 'Inclusive Language: A Guide to Gender-Fair Communication',
      excerpt: 'Language shapes our perceptions and reinforces social norms. This guide provides practical tips for using inclusive, gender-fair language in academic and professional settings, helping to create a more equitable communication culture...',
      category: 'Communication',
      date: 'October 5, 2024',
      readTime: '6 min read',
      image: '/assets/knowledge/inclusive-language.jpg',
      link: '/knowledge/gender-fair-language'
    },
    {
      title: 'Work-Life Balance and Gender Equity in Academia',
      excerpt: 'Achieving work-life balance is a challenge for many in academia, with gendered dimensions that often go unrecognized. This article examines how work-life policies can either reinforce or challenge gender inequities, and proposes institutional strategies for supporting all faculty and staff...',
      category: 'Workplace Culture',
      date: 'September 28, 2024',
      readTime: '9 min read',
      image: '/assets/knowledge/work-life-balance.jpg',
      link: '/knowledge/work-life-balance'
    },
    {
      title: 'Gender Analysis in Research: Methods and Best Practices',
      excerpt: 'Integrating gender analysis into research design and methodology strengthens the quality and relevance of research outcomes. This article provides researchers with practical frameworks and tools for conducting gender-sensitive research across various disciplines...',
      category: 'Research Methods',
      date: 'September 20, 2024',
      readTime: '13 min read',
      image: '/assets/knowledge/gender-research.jpg',
      link: '/knowledge/gender-analysis-research'
    }
  ];

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            GAD Knowledge Hub
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
          <p className="text-lg text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Explore articles, insights, and resources on gender and development topics
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">About the Knowledge Hub</h2>
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              The GAD Knowledge Hub is your comprehensive resource for understanding gender and development concepts, policies, and best practices. Our curated collection of articles provides in-depth analysis, practical guidance, and evidence-based insights on topics ranging from gender mainstreaming to workplace equity.
            </p>
            <p>
              Whether you're a student, faculty member, administrator, or community partner, you'll find valuable information to support your learning, research, and advocacy efforts. All content is regularly updated to reflect current thinking and emerging issues in the field of gender and development.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Feed */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="space-y-8">
            {articles.map((article, idx) => (
              <article
                key={idx}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-violet-400 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Image */}
                  <div className="lg:w-80 h-64 lg:h-auto bg-gradient-to-br from-slate-200 to-slate-300 flex-shrink-0 overflow-hidden relative">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center absolute inset-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                      <span className="inline-flex items-center gap-2 text-sm text-violet-600 font-semibold">
                        <Tag className="w-4 h-4" />
                        {article.category}
                      </span>
                      <span className="text-sm text-slate-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {article.date}
                      </span>
                      <span className="text-sm text-slate-500">
                        {article.readTime}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-violet-700 transition-colors leading-snug">
                      {article.title}
                    </h2>

                    <p className="text-slate-600 leading-relaxed mb-6 flex-1">
                      {article.excerpt}
                    </p>

                    <a
                      href={article.link}
                      className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:gap-3 transition-all group/link"
                    >
                      Read Full Article
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <p className="text-slate-600 leading-relaxed mb-4">
            Have suggestions for topics or want to contribute content to the Knowledge Hub?
          </p>
          <a href="mailto:gad@tup.edu.ph" className="text-violet-600 hover:underline font-medium text-lg">
            Contact the GAD Office
          </a>
        </div>
      </section>
    </main>
  );
};

export default Knowledge;