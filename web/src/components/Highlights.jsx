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
    const newSocket = io('http://localhost:5000', {
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
    <section className="relative h-[700px] bg-slate-100 overflow-hidden">
      {/* Slides */}
      {highlights.map((slide, idx) => (
        <div
          key={slide._id || slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {slide.imageUrl ? (
            <img 
              src={slide.imageUrl} 
              alt={slide.title || `Highlight ${idx + 1}`}
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-slate-300 flex items-center justify-center">
              <span className="text-slate-500 text-2xl font-bold">Highlight Image {idx + 1}</span>
            </div>
          )}
          
          {/* Optional: Display title and description overlay */}
          {(slide.title || slide.description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
              {slide.title && (
                <h3 className="text-white text-3xl font-bold mb-2">{slide.title}</h3>
              )}
              {slide.description && (
                <p className="text-white/90 text-lg line-clamp-2">{slide.description}</p>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Carousel Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 transition-all duration-300 backdrop-blur-md border border-white/20 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 transition-all duration-300 backdrop-blur-md border border-white/20 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {highlights.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-3 transition-all duration-500 ${
              idx === currentSlide ? 'bg-white w-16' : 'bg-white/40 w-8 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HighlightsSection;