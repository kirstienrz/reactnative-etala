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

  const handleView = (imageUrl) => setFullscreenImage(imageUrl);
  const handleDownload = async (imageUrl, title) => {
    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = title.replace(/\s+/g, '_') + '.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  return (
    <main className="bg-white min-h-screen relative">
      {/* Hero */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">Infographics</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
          <p className="text-lg text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Visual guides and educational materials on gender and development topics
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

      {/* Infographics Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-8">
          {loading ? (
            <div className="text-center py-12 text-slate-600">Loading infographics...</div>
          ) : filteredInfographics.length === 0 ? (
            <div className="text-center py-12 text-slate-600">No infographics found.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInfographics.map(info => (
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
                      <button
                        onClick={() => handleDownload(info.imageUrl, info.title)}
                        className="bg-white text-violet-700 border border-violet-200 rounded-lg px-4 py-2 shadow hover:bg-violet-50 transition-colors flex-1 flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                    </div>
                  </div>
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
