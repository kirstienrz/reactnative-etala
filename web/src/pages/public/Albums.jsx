import React, { useEffect, useState, useCallback } from 'react';
import { getAlbums, getAlbum } from '../../api/albums';
import { Download, Eye, Search, X, Calendar, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

// Modal for viewing album images
const AlbumModal = ({ album, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [fullAlbumData, setFullAlbumData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch full album data when modal opens
    const fetchFullAlbum = async () => {
      if (album && album._id) {
        setLoading(true);
        try {
          const response = await getAlbum(album._id);
          setFullAlbumData(response.data);
        } catch (err) {
          console.error('Error fetching full album:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFullAlbum();
  }, [album]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!fullAlbumData?.images) return;
      
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullAlbumData, selectedImageIndex]);

  const goToNext = () => {
    if (!fullAlbumData?.images) return;
    setSelectedImageIndex((prev) => 
      prev < fullAlbumData.images.length - 1 ? prev + 1 : 0
    );
  };

  const goToPrev = () => {
    if (!fullAlbumData?.images) return;
    setSelectedImageIndex((prev) => 
      prev > 0 ? prev - 1 : fullAlbumData.images.length - 1
    );
  };

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleImageClick = (e) => {
    // Get click position on image
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // If clicked on right side, go next; left side, go prev
    if (x > width / 2) {
      goToNext();
    } else {
      goToPrev();
    }
  };

  if (!album) return null;

  const currentAlbum = fullAlbumData || album;
  const currentImage = currentAlbum.images?.[selectedImageIndex];

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-[10000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-6xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{currentAlbum.title}</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(currentAlbum.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>{currentAlbum.images?.length || 0} photos</span>
                </div>
              </div>
              {currentAlbum.description && (
                <p className="mt-3 text-violet-200">{currentAlbum.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="relative p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
              <p className="mt-4 text-slate-600">Loading album photos...</p>
            </div>
          ) : !currentAlbum.images || currentAlbum.images.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600">No photos in this album yet.</p>
            </div>
          ) : currentImage ? (
            <>
              {/* Main Image with Navigation Arrows */}
              <div className="relative flex justify-center items-center min-h-[60vh]">
                {/* Left Arrow */}
                <button
                  onClick={goToPrev}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                {/* Image */}
                <div 
                  className="relative cursor-pointer group"
                  onClick={handleImageClick}
                >
                  <img
                    src={currentImage.imageUrl}
                    alt={currentImage.caption || `Photo ${selectedImageIndex + 1}`}
                    className="max-h-[60vh] max-w-full object-contain rounded-lg"
                  />
                  
                  {/* Image Navigation Overlay (for touch devices) */}
                  <div className="absolute inset-0 flex">
                    <div 
                      className="flex-1 cursor-pointer hover:bg-black/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrev();
                      }}
                    ></div>
                    <div 
                      className="flex-1 cursor-pointer hover:bg-black/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Right Arrow */}
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              {/* Image Info and Controls */}
              <div className="mt-6">
                {/* Caption */}
                {currentImage.caption && (
                  <div className="text-center mb-4">
                    <p className="text-slate-700 font-medium text-lg">{currentImage.caption}</p>
                  </div>
                )}
                
                {/* Image Counter */}
                <div className="text-center mb-4">
                  <p className="text-slate-600">
                    {selectedImageIndex + 1} of {currentAlbum.images.length}
                  </p>
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-center gap-4 mb-6">
                  <button
                    onClick={goToPrev}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = currentImage.imageUrl;
                      link.download = `photo_${selectedImageIndex + 1}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                  
                  <button
                    onClick={goToNext}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Thumbnail Strip */}
              <div className="mt-6">
                <div className="flex justify-center mb-2">
                  <p className="text-slate-600 text-sm">Click thumbnails to navigate:</p>
                </div>
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-2 justify-center min-w-max px-4">
                    {currentAlbum.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => handleThumbnailClick(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all transform hover:scale-105 ${
                          selectedImageIndex === index
                            ? 'border-violet-600 ring-2 ring-violet-300 scale-105'
                            : 'border-slate-300 hover:border-violet-400'
                        }`}
                      >
                        <img
                          src={img.imageUrl}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await getAlbums();
        console.log('Fetched albums:', response.data);
        setAlbums(response.data || []);
      } catch (err) {
        console.error('Failed to fetch albums:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  // Filter albums based on search
  const filteredAlbums = albums.filter(album => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      album.title.toLowerCase().includes(searchLower) ||
      (album.description && album.description.toLowerCase().includes(searchLower))
    );
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleViewAlbum = (album) => {
    console.log('Viewing album:', album);
    setSelectedAlbum(album);
  };

  return (
    <main className="bg-white min-h-screen relative">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">Photo Gallery</h1>
          <div className="w-24 h-1 bg-violet-400 mx-auto mb-8"></div>
          <p className="text-xl text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Browse through our collection of photos from university events and activities
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search albums by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
              <p className="mt-4 text-slate-600">Loading albums...</p>
            </div>
          ) : filteredAlbums.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-6">
                <ImageIcon className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                {searchTerm ? 'No albums found' : 'No albums available yet'}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {searchTerm ? 'Try a different search term' : 'Check back soon for new photo albums'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlbums.map(album => (
                <div
                  key={album._id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-violet-400 hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Album Cover */}
                  <div 
                    className="h-64 overflow-hidden relative cursor-pointer group"
                    onClick={() => handleViewAlbum(album)}
                  >
                    <img
                      src={album.coverImage?.imageUrl || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop"}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-sm">{album.images?.length || 0} photos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(album.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Album Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                      {album.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 flex-1 line-clamp-2">
                      {album.description || "No description available"}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewAlbum(album)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View Album
                      </button>
                      
                      {album.coverImage?.imageUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const link = document.createElement('a');
                            link.href = album.coverImage.imageUrl;
                            link.download = `${album.title.replace(/\s+/g, '_')}_cover.jpg`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="px-4 py-2 border-2 border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:border-violet-600 hover:text-violet-600 transition-colors"
                          title="Download Cover"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedAlbum && (
        <AlbumModal album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />
      )}
    </main>
  );
};

export default Gallery;