import React, { useState } from 'react';
import { Download, Eye, Search } from 'lucide-react';

const Infographics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const infographics = [
    {
      id: 1,
      title: 'Understanding Gender Mainstreaming',
      category: 'Policy',
      description: 'Key concepts and strategies for implementing gender mainstreaming in higher education.',
      image: '/assets/infographics/gender-mainstreaming.jpg',
      fileSize: '1.2 MB',
      dimensions: '1080x1080'
    },
    {
      id: 2,
      title: 'Safe Spaces Act (RA 11313)',
      category: 'Legal',
      description: 'Guidelines on preventing and addressing gender-based harassment in educational settings.',
      image: '/assets/infographics/safe-spaces.jpg',
      fileSize: '980 KB',
      dimensions: '1080x1350'
    },
    {
      id: 3,
      title: 'Reporting Gender-Based Violence',
      category: 'Safety',
      description: 'Step-by-step guide on how to report incidents and access support services.',
      image: '/assets/infographics/reporting-gbv.jpg',
      fileSize: '1.1 MB',
      dimensions: '1080x1080'
    },
    {
      id: 4,
      title: 'Magna Carta of Women Highlights',
      category: 'Legal',
      description: 'Essential provisions of RA 9710 and their implications for the university community.',
      image: '/assets/infographics/magna-carta.jpg',
      fileSize: '1.3 MB',
      dimensions: '1080x1350'
    },
    {
      id: 5,
      title: 'Gender-Fair Language Guide',
      category: 'Communication',
      description: 'Practical tips for using inclusive and gender-sensitive language in academic settings.',
      image: '/assets/infographics/gender-fair-language.jpg',
      fileSize: '850 KB',
      dimensions: '1080x1080'
    },
    {
      id: 6,
      title: 'Women in STEM Statistics',
      category: 'Education',
      description: 'Data visualization on women\'s participation and achievements in STEM fields.',
      image: '/assets/infographics/women-stem.jpg',
      fileSize: '1.4 MB',
      dimensions: '1080x1350'
    },
    {
      id: 7,
      title: 'GAD Budget Allocation 2024',
      category: 'Budget',
      description: 'Visual breakdown of GAD plan and budget allocation across university programs.',
      image: '/assets/infographics/gad-budget.jpg',
      fileSize: '920 KB',
      dimensions: '1080x1080'
    },
    {
      id: 8,
      title: 'Consent and Boundaries',
      category: 'Awareness',
      description: 'Educational infographic on understanding and respecting personal boundaries.',
      image: '/assets/infographics/consent.jpg',
      fileSize: '1.0 MB',
      dimensions: '1080x1350'
    }
  ];

  const categories = ['All', 'Policy', 'Legal', 'Safety', 'Communication', 'Education', 'Budget', 'Awareness'];

  const filteredInfographics = infographics.filter(info => {
    const matchesSearch = info.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         info.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || info.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleView = (title) => {
    alert(`Viewing: ${title}\n\nThis would open the infographic in a preview window.`);
  };

  const handleDownload = (title) => {
    alert(`Downloading: ${title}\n\nThis would initiate the infographic download.`);
  };

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Infographics
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
          <p className="text-lg text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Visual guides and educational materials on gender and development topics
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">About Our Infographics</h2>
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
            <p>
              Browse our collection of infographics covering essential GAD topics. These visual resources are designed to make complex information accessible and easy to understand for the university community.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search infographics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    selectedCategory === category
                      ? 'bg-violet-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-violet-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Infographics Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-8">
          {filteredInfographics.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">No infographics found matching your search.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInfographics.map((info) => (
                <div
                  key={info.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-violet-400 hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Image Preview */}
                  <div className="h-64 bg-gradient-to-br from-slate-200 to-slate-300 flex-shrink-0 overflow-hidden relative">
                    <img 
                      src={info.image} 
                      alt={info.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center absolute inset-0 bg-gradient-to-br from-violet-100 to-purple-100">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl text-white font-bold">IG</span>
                        </div>
                        <p className="text-sm text-slate-600">{info.dimensions}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                        {info.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                      {info.title}
                    </h3>

                    <p className="text-sm text-slate-600 mb-4 flex-1">
                      {info.description}
                    </p>

                    <div className="text-xs text-slate-500 mb-4 pb-4 border-b border-slate-200">
                      <span>{info.dimensions}</span>
                      <span className="mx-2">•</span>
                      <span>{info.fileSize}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(info.title)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(info.title)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:border-violet-600 hover:text-violet-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Infographics;