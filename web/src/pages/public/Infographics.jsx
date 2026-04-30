import React, { useEffect, useState } from 'react';
import { getInfographics } from '../../api/infographics';
import { Download, Eye, Search, X } from 'lucide-react';
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredInfographics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInfographics = filteredInfographics.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const handleView = (imageUrl) => setFullscreenImage(imageUrl);


  return (
    <main className="bg-white min-h-screen relative">
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight select-none">
            Informative <span className="text-violet-400">Infographics</span>
          </h1>
          <div className="w-20 h-1.5 bg-violet-500 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-violet-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Visual guides and educational materials on fundamental gender and development topics.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
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

          <div className="flex gap-2 flex-wrap">
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
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
              <p className="mt-4 text-slate-600">Loading infographics...</p>
            </div>
          ) : currentInfographics.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No infographics found matching your criteria.
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentInfographics.map(info => (
                <div
                  key={info._id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-violet-400 hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="h-64 overflow-hidden relative cursor-pointer" onClick={() => handleView(info.imageUrl)}>
                    <img
                      src={info.imageUrl}
                      alt={info.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">{info.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{info.title}</h3>
                    <p className="text-sm text-slate-600 mb-4 flex-1">{info.description}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(info.imageUrl)}
                        className="bg-white text-violet-700 border border-violet-200 rounded-lg px-4 py-2 shadow hover:bg-violet-50 transition-colors flex-1 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>

                    </div>
                  </div>
                </div>
              ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-20 pb-12">
                  <button
                    onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={currentPage === 1}
                    className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200/50"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="bg-white px-8 py-4 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center gap-4">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Page</span>
                    <span className="font-black text-slate-900 text-lg">{currentPage}</span>
                    <span className="text-slate-300 font-bold">/</span>
                    <span className="font-black text-slate-400 text-lg">{totalPages}</span>
                  </div>
                  <button
                    onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={currentPage === totalPages}
                    className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200/50"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </>
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
