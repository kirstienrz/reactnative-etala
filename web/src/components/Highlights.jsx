import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, X, Play, Pause, Volume2, VolumeX } from 'lucide-react';
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
        
        {/* Top Navigation - Glass Header */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/80 to-transparent z-30 flex items-center justify-between px-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-xl p-1.5 border border-slate-100 transition-transform group-hover/viewer:scale-110">
              <img src="/assets/about/logo.png" className="w-full h-full object-contain" alt="" />
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-xl leading-tight tracking-tight">{highlight.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-violet-100 text-violet-600 text-[10px] font-black rounded-md uppercase tracking-wider">
                  Highlight {currentIndex + 1}
                </span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-l border-slate-200 pl-2">
                   {items.length} total pieces
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border border-slate-100"
          >
            <X size={24} strokeWidth={3} />
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

          {/* Info Card Overlay - Glass Bottom */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl z-30 px-6 opacity-0 group-hover/viewer:opacity-100 translate-y-4 group-hover/viewer:translate-y-0 transition-all duration-500">
            <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              <h4 className="text-slate-900 font-black text-2xl mb-2">{highlight.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{highlight.description}</p>
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
                  relative rounded-[2.5rem] overflow-hidden group/story cursor-pointer shadow-lg hover:shadow-violet-200/50 transition-all duration-500 snap-start hover:-translate-y-2 border-2 border-transparent hover:border-violet-500
                  ${highlights.length >= 5 
                    ? 'flex-shrink-0 w-[180px] md:w-[220px] aspect-[9/16]' 
                    : 'flex-1 min-w-[280px] max-w-[600px] h-[200px] md:h-[300px] lg:h-[380px] xl:h-[420px]'
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

                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90" />
                
                {/* Profile Circle */}
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full border-2 border-violet-600 p-0.5 bg-white shadow-lg z-10">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-50">
                    <img src="/assets/about/logo.png" className="w-full h-full object-contain" alt="" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="absolute bottom-5 left-5 right-5 z-10">
                  <h3 className="text-white font-black text-xs md:text-sm leading-tight drop-shadow-lg line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-white/60 text-[8px] md:text-[10px] font-bold mt-1.5 uppercase tracking-widest">
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