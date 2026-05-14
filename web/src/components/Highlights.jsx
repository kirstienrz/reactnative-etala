import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, X, Play, Pause, Volume2, VolumeX, Info } from 'lucide-react';
import io from 'socket.io-client';
import { getCarouselImages } from '../api/carousel';
import { createPortal } from 'react-dom';

const StoryViewer = ({ highlight, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const items = highlight.items && highlight.items.length > 0 
    ? highlight.items 
    : highlight.imageUrl 
      ? [{ imageUrl: highlight.imageUrl, type: 'image' }] 
      : [];
  const currentMedia = items[currentIndex];

  useEffect(() => {
    if (isPaused) return;

    const duration = currentMedia?.type === 'video' ? 10000 : 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, currentMedia]);

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  if (!currentMedia) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-white/40 flex items-center justify-center backdrop-blur-3xl px-4 md:px-10 overflow-hidden">
      {/* Dynamic Background Blobs for depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-200/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative w-full max-w-6xl aspect-[9/16] md:aspect-video bg-white/60 rounded-[2rem] md:rounded-[3rem] border border-white/40 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex flex-col group/viewer backdrop-blur-md transition-all duration-500">
        
        {/* Top Navigation - Compact Glass Header */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/40 to-transparent z-30 flex items-center justify-between px-6 md:px-10 pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white shadow-xl p-1.5 border border-slate-100 transition-transform group-hover/viewer:scale-110 shrink-0">
              <img src="/assets/about/logo.png" className="w-full h-full object-contain" alt="" />
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-black text-sm md:text-base leading-tight drop-shadow-md truncate">{highlight.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest bg-violet-600/80 px-2 py-0.5 rounded-full">
                  {currentIndex + 1} / {items.length}
                </span>
                <span className="hidden md:block text-[9px] text-white/60 font-black uppercase tracking-widest truncate max-w-[300px]">
                  {highlight.description}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-red-500 text-white flex items-center justify-center backdrop-blur-md transition-all pointer-events-auto active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cinematic Content Stage */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-50/30">
          <div className="w-full h-full flex items-center justify-center" onClick={() => setIsPaused(!isPaused)}>
            {currentMedia.type === 'video' ? (
              <video
                src={currentMedia.imageUrl}
                className="w-full h-full object-contain transition-transform duration-700"
                autoPlay
                muted
                playsInline
                onEnded={handleNext}
              />
            ) : (
              <img src={currentMedia.imageUrl} className="w-full h-full object-contain transition-transform duration-700" alt="" />
            )}
          </div>

          {/* Precision Controls */}
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover/viewer:opacity-100 transition-opacity duration-300">
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className={`w-16 h-16 bg-white/90 hover:bg-violet-600 text-slate-900 hover:text-white rounded-3xl flex items-center justify-center shadow-2xl border border-white transition-all pointer-events-auto ${currentIndex === 0 ? 'scale-0' : 'scale-100'}`}
            >
              <ChevronLeft size={32} strokeWidth={3} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="w-16 h-16 bg-white/90 hover:bg-violet-600 text-slate-900 hover:text-white rounded-3xl flex items-center justify-center shadow-2xl border border-white transition-all pointer-events-auto"
            >
              <ChevronRight size={32} strokeWidth={3} />
            </button>
          </div>

          {/* Overlays are now handled by the compact header and this discreet chip */}
          <div className="absolute bottom-6 left-6 z-30 group/desc max-w-[80%] md:max-w-md">
            <div className="bg-black/20 hover:bg-black/60 backdrop-blur-xl border border-white/10 p-3 md:p-4 rounded-2xl md:rounded-[1.5rem] transition-all duration-500 cursor-help">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-violet-500 flex items-center justify-center text-white shrink-0">
                  <Info size={14} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-white/40 text-[8px] font-black uppercase tracking-widest leading-none mb-1">Album Description</p>
                  <p className="text-white text-[10px] md:text-xs font-medium leading-relaxed line-clamp-1 group-hover/desc:line-clamp-none transition-all duration-500">
                    {highlight.description || "No description available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Progress Hub */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-100/50 z-40 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-75 ease-linear"
            style={{ width: `${((currentIndex + progress/100) / items.length) * 100}%` }}
          />
        </div>

        {/* Side Thumbnails Drawer */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3 z-20">
          {items.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => { setCurrentIndex(idx); setProgress(0); }}
              className={`w-16 aspect-video rounded-xl overflow-hidden cursor-pointer border-4 transition-all duration-300 ${idx === currentIndex ? 'border-violet-500 scale-125 shadow-xl' : 'border-white/80 opacity-40 hover:opacity-100 shadow-sm'}`}
            >
              <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
            </div>
          ))}
        </div>

        {/* Pause State UI */}
        {isPaused && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-10 flex items-center justify-center" onClick={() => setIsPaused(false)}>
            <div className="w-28 h-28 bg-white/90 rounded-full flex items-center justify-center text-violet-600 shadow-2xl scale-110 animate-pulse">
              <Play size={56} fill="currentColor" />
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

const HighlightsSection = () => {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHighlight, setSelectedHighlight] = useState(null);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      const data = await getCarouselImages();
      setHighlights(data);
    } catch (error) {
      console.error('Error fetching highlights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  useEffect(() => {
    const newSocket = io(window.location.origin.includes('localhost') ? 'http://localhost:5000' : 'https://reactnative-etala.onrender.com/', {
      transports: ['websocket'],
    });

    newSocket.on('carouselUpdated', () => {
      fetchHighlights();
    });

    return () => newSocket.disconnect();
  }, []);

  if (loading) {
    return (
      <section className="relative h-[400px] bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
      </section>
    );
  }

  if (highlights.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 flex items-center gap-3">
            <Sparkles className="text-violet-600 w-8 h-8 md:w-12 md:h-12" />
            Highlights
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs md:text-sm">Explore our latest highlights</p>
        </div>

        <div className="relative group">
          {/* Decorative Minimalist Space Consumers (Only show when not full) */}
          {highlights.length < 5 && (
            <div className="absolute inset-0 pointer-events-none hidden xl:block z-0">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                <div className="w-32 h-32 border border-slate-100 rounded-3xl backdrop-blur-[1px]" />
                <div className="w-16 h-16 border border-violet-100 rounded-2xl translate-x-16" />
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-4 items-end">
                <div className="w-40 h-24 border border-slate-100 rounded-3xl backdrop-blur-[1px]" />
                <div className="w-20 h-20 border border-blue-100 rounded-2xl -translate-x-16" />
              </div>
            </div>
          )}

          <div 
            className={`
              transition-all duration-500 ease-out relative z-10
              ${highlights.length <= 5 
                ? 'flex flex-wrap md:flex-nowrap justify-center gap-4' 
                : 'flex gap-4 overflow-x-auto pb-12 snap-x no-scrollbar'
              }
            `}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {highlights.map((item) => (
              <div 
                key={item._id}
                onClick={() => setSelectedHighlight(item)}
                className={`
                  relative rounded-2xl md:rounded-[2.5rem] overflow-hidden group/story cursor-pointer shadow-lg hover:shadow-violet-200/50 transition-all duration-500 snap-start hover:-translate-y-2 border-2 border-transparent hover:border-violet-500
                  ${highlights.length >= 5 
                    ? 'flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] aspect-[9/16]' 
                    : 'w-full sm:flex-1 min-w-[260px] max-w-[600px] aspect-video md:aspect-auto md:h-[300px] lg:h-[380px] xl:h-[420px]'
                  }
                `}
              >
                {/* Background (Cover Media) */}
                {item.coverImage?.type === 'video' || (item.items && item.items[0]?.type === 'video') ? (
                  <video
                    src={item.coverImage?.imageUrl || (item.items && item.items[0]?.imageUrl)}
                    className="absolute inset-0 w-full h-full object-cover group-hover/story:scale-110 transition-transform duration-700"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={item.coverImage?.imageUrl || (item.items && item.items[0]?.imageUrl) || item.imageUrl}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover/story:scale-110 transition-transform duration-700"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/60" />
                
                {/* Profile Circle */}
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full border-2 border-violet-600 p-0.5 bg-white shadow-lg z-10">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-50">
                    <img src="/assets/about/logo.png" className="w-full h-full object-contain" alt="" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="text-white font-black text-sm md:text-base leading-tight drop-shadow-md line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-white/80 text-[10px] md:text-xs font-bold mt-1.5 uppercase tracking-widest drop-shadow">
                    {item.items?.length || 1} {item.items?.length === 1 ? 'Highlight' : 'Highlights'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedHighlight && (
        <StoryViewer 
          highlight={selectedHighlight} 
          onClose={() => setSelectedHighlight(null)} 
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
};

export default HighlightsSection;