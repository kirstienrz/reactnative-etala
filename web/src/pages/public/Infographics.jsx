import React, { useEffect, useState } from 'react';
import { getInfographics } from '../../api/infographics';
import { Download, Eye, Search, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, LayoutGrid, List, Filter } from 'lucide-react';
import { createPortal } from 'react-dom';

const InfographicModal = ({ image, onClose }) => {
  if (!image) return null;
  return createPortal(
<div
  className="fixed inset-0 bg-black bg-opacity-90 z-[10000] flex items-center justify-center p-4"
  onClick={onClose}
>

      <img
        src={image}
        alt="Infographic Fullscreen"
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white p-2 rounded-full bg-black/30 hover:bg-black/60 shadow-md transition"
      >
        <X className="w-6 h-6" />
      </button>
    </div>,
    document.body
  );
};

const Infographics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [infographics, setInfographics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const [viewMode, setViewMode] = useState('grid');
  const [collapsedYears, setCollapsedYears] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const toggleYearCollapse = (year) => {
    setCollapsedYears(prev => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const fetchInfographics = async () => {
      try {
        const data = await getInfographics();
        setInfographics(data);
      } catch (err) {
        console.error('Failed to fetch infographics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfographics();
  }, []);

  const categories = ['All', 'Policy', 'Legal', 'Safety', 'Communication', 'Education', 'Budget', 'Awareness'];

  const filteredInfographics = infographics.filter(info => {
    const matchesSearch =
      info.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || info.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedInfographics = filteredInfographics.reduce((acc, curr) => {
    const year = curr.academicYear || 'Uncategorized';
    if (!acc[year]) acc[year] = [];
    acc[year].push(curr);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedInfographics).sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return b.localeCompare(a);
  });

  const handleView = (imageUrl) => setFullscreenImage(imageUrl);


  return (
    <main className="bg-white min-h-screen relative">
      {/* Hero */}
      <section className="relative py-12 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight select-none">
            Informative <span className="text-violet-400">Infographics</span>
          </h1>
          <div className="w-16 h-1.5 bg-violet-500 mx-auto rounded-full mb-6"></div>
          <p className="text-lg md:text-xl text-violet-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Visual guides and educational materials on fundamental gender and development topics.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row gap-4 items-center">
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

          <div className="flex gap-2 flex-wrap flex-1 justify-end items-center">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all ${
                showFilters || selectedCategory !== 'All' 
                  ? 'bg-violet-100 text-violet-700 border border-violet-200' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:border-violet-400'
              }`}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters {selectedCategory !== 'All' && `(${selectedCategory})`}</span>
            </button>

            <div className="flex bg-slate-200 rounded-xl p-1 h-fit">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-500 hover:text-slate-700'}`} title="Grid View">
                <LayoutGrid size={18} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-500 hover:text-slate-700'}`} title="List View">
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="max-w-6xl mx-auto px-8 mt-4">
            <div className="flex gap-2 flex-wrap justify-end">
              {categories.map(category => (
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
        )}
      </section>

      {/* Gallery Grid */}
      <section className="py-8 bg-slate-50">
        <div className="max-w-6xl mx-auto px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
              <p className="mt-4 text-slate-600">Loading infographics...</p>
            </div>
          ) : sortedYears.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No infographics found matching your criteria.
            </div>
          ) : (
            <div className="space-y-8">
              {sortedYears.map(year => (
                <div key={year} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-5 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => toggleYearCollapse(year)}
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-black text-slate-800">
                        {year === 'Uncategorized' ? 'Uncategorized' : `A.Y. ${year}`}
                      </h2>
                      <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                        {groupedInfographics[year].length} items
                      </span>
                    </div>
                    {collapsedYears.has(year) ? (
                      <ChevronDown className="text-slate-400" />
                    ) : (
                      <ChevronUp className="text-slate-400" />
                    )}
                  </div>
                  
                  {!collapsedYears.has(year) && (
                    <div className="p-5">
                      <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
                        {groupedInfographics[year].map(info => (
                          <div
                            key={info._id}
                            className={`group relative bg-white transition-all duration-300 ${viewMode === 'list' ? 'flex flex-row items-center p-3 border border-slate-200 rounded-xl hover:border-violet-300 hover:shadow-md' : 'border border-slate-200 rounded-xl overflow-hidden hover:border-violet-400 hover:shadow-xl flex flex-col'}`}
                          >
                            <div className={`${viewMode === 'list' ? 'w-16 h-16 rounded-lg mr-4' : 'h-48'} overflow-hidden relative cursor-pointer flex-shrink-0`} onClick={() => handleView(info.imageUrl)}>
                              <img
                                src={info.imageUrl}
                                alt={info.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {viewMode === 'grid' ? (
                              <div className="p-4 flex flex-col">
                                <div className="mb-2">
                                  <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-full uppercase tracking-wider">{info.category}</span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{info.title}</h3>
                                {info.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{info.description}</p>}
                              </div>
                            ) : (
                              <div className="flex-1 min-w-0 pr-4 flex flex-col justify-center">
                                <h3 className="font-bold text-slate-900 truncate text-sm">{info.title}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold uppercase tracking-widest rounded-md">
                                    {info.category || 'General'}
                                  </span>
                                  {info.description && (
                                    <span className="text-xs text-slate-500 line-clamp-1">
                                      {info.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <InfographicModal image={fullscreenImage} onClose={() => setFullscreenImage(null)} />
      )}
    </main>
  );
};

export default Infographics;
