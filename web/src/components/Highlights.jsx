import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import io from 'socket.io-client';
import { getCarouselImages } from '../api/carousel'; // Adjust path as needed

const HighlightsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Fetch highlights from backend using the API function
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

  // Initial fetch
  useEffect(() => {
    fetchHighlights();
  }, []);

  // Socket.IO real-time updates
  useEffect(() => {
    const newSocket = io('https://reactnative-etala.onrender.com/', {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    // Listen for real-time updates
    newSocket.on('carouselUpdated', () => {
      console.log('🟢 Carousel updated in real-time!');
      fetchHighlights();
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (highlights.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % highlights.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [highlights.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % highlights.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + highlights.length) % highlights.length);
  };

  if (loading) {
    return (
      <section className="relative h-[700px] bg-slate-100 overflow-hidden flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
      </section>
    );
  }

  if (highlights.length === 0) {
    return (
      <section className="relative h-[700px] bg-slate-100 overflow-hidden flex items-center justify-center">
        <p className="text-slate-500 text-lg">No highlights available</p>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Highlights</h2>
            <p className="text-slate-500 font-medium">Internal activities and community updates</p>
          </div>

          <div className="w-full max-w-5xl relative aspect-[1.91/1] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            {/* Slides */}
            {highlights.map((slide, idx) => (
              <div
                key={slide._id || slide.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                  }`}
              >
                {/* Render Media */}
                {slide.imageUrl && (slide.type === 'video' || slide.imageUrl.endsWith('.mp4') || slide.imageUrl.endsWith('.webm')) ? (
                  <video
                    src={slide.imageUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : slide.imageUrl ? (
                  <img
                    src={slide.imageUrl}
                    alt={slide.title || `Highlight ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                    <span className="text-slate-500 text-2xl font-bold">Highlight Media {idx + 1}</span>
                  </div>
                )}

                {/* Optional: Display title and description overlay */}
                {(slide.title || slide.description) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 md:p-10">
                    <div className="max-w-3xl">
                      {slide.title && (
                        <h3 className="text-white text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">{slide.title}</h3>
                      )}
                      {slide.description && (
                        <p className="text-white/90 text-sm md:text-lg line-clamp-2 drop-shadow-md">{slide.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Carousel Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 md:p-3 rounded-full transition-all duration-300 backdrop-blur-md border border-white/30 group z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 md:p-3 rounded-full transition-all duration-300 backdrop-blur-md border border-white/30 group z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" />
            </button>

            {/* Carousel Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {highlights.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 transition-all duration-500 rounded-full ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HighlightsSection;