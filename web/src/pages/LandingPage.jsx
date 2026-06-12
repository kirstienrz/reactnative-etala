import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Users,
  Target,
  BookOpen,
  FileText,
  BarChart3,
  Users2,
  BookOpenCheck,
  MessageSquare,
  GraduationCap,
  Sparkles,
  Bell, Calendar, X, Download
} from 'lucide-react';
import { Capacitor } from "@capacitor/core";
import { getInfographics } from "../api/infographics";
import { getNews } from "../api/newsAnnouncement";
import { getAllCalendarEvents } from "../api/calendar";
import { getOrgChartImages } from "../api/organizational";
import { getSexDatasets } from "../api/sexData";
import { getAlbums } from "../api/albums";
import { getWebinars } from "../api/webinar";
import { getAllResearch } from "../api/research";
import { getResources } from "../api/resource";
import { getDocuments } from "../api/documents";
import HighlightsSection from '../components/Highlights';

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
        style={{ backdropFilter: 'blur(4px)' }}
      >
        <X className="w-6 h-6" />
      </button>
    </div>,
    document.body
  );
};

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [infographics, setInfographics] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [additionalWhatsNew, setAdditionalWhatsNew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const navigate = useNavigate();

  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);

  // ✅ Use reactive state so Capacitor is fully initialized before checking platform
  const [isApkAccess, setIsApkAccess] = useState(false);

  useEffect(() => {
    try {
      const platform = Capacitor.getPlatform();
      setIsApkAccess(platform === "android" || platform === "ios");
    } catch (e) {
      setIsApkAccess(false);
    }
  }, []);

  const getWebUrl = () => {
    if (!isApkAccess) {
      return window.location.origin;
    }
    return "https://etala.vercel.app";
  };

  const getQrData = () => {
    if (isApkAccess) {
      return "https://etala.vercel.app";
    } else {
      return window.location.origin + "/download";
    }
  };

  const heroRef = useRef(null);

  // Center the hero section on load and resize if scrollable (mobile)
  useEffect(() => {
    const centerHero = () => {
      if (heroRef.current) {
        const { scrollWidth, clientWidth } = heroRef.current;
        if (scrollWidth > clientWidth) {
          heroRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
        }
      }
    };

    // Slight delay to ensure layout is computed after image load
    const timeoutId = setTimeout(centerHero, 150);
    window.addEventListener('resize', centerHero);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', centerHero);
    };
  }, []);

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const res = await getAllCalendarEvents();

        if (res.success) {
          // EVENTS / PROGRAM / PROJECT LANG
          const filtered = res.data.filter(event =>
            ["program_event", "event", "project"].includes(
              event.extendedProps?.type
            )
          );

          // sort by date (optional but nice)
          filtered.sort(
            (a, b) => new Date(a.start) - new Date(b.start)
          );

          setCalendarEvents(filtered.slice(0, 5)); // top 5 only (landing page)
        }
      } catch (err) {
        console.error("Failed to fetch calendar events", err);
      } finally {
        setCalendarLoading(false);
      }
    };

    fetchCalendarEvents();
  }, []);

  useEffect(() => {
    const fetchInfographics = async () => {
      try {
        const data = await getInfographics();
        setInfographics(data.slice(0, 8)); // store dynamic data
      } catch (err) {
        console.error(err);
      }
    };
    fetchInfographics();
  }, []);

  useEffect(() => {
    const fetchWhatsNewData = async () => {
      try {
        const [newsRes, orgRes, sexRes, infoRes, albumRes, webRes, resRes, rscRes, docRes] = await Promise.all([
          getNews().catch(() => []),
          getOrgChartImages().catch(() => ({ data: [] })),
          getSexDatasets().catch(() => []),
          getInfographics().catch(() => []),
          getAlbums().catch(() => ({ data: [] })),
          getWebinars().catch(() => []),
          getAllResearch().catch(() => ({ data: [] })),
          getResources().catch(() => []),
          getDocuments().catch(() => [])
        ]);

        // Add 'News' type to news items
        setNewsItems((newsRes || []).map(item => ({ ...item, type: "News" })));

        const extras = [
          ...(docRes?.data || docRes || []).map(item => ({
            ...item,
            title: item.title || "Policy/Issuance",
            content: item.description || "Official university issuance.",
            imageUrl: null,
            link: item.files?.[0]?.fileUrl || item.url || null,
            date: item.date_issued || item.createdAt || item.date,
            type: item.document_type ? item.document_type.replace('_', ' ').toUpperCase() : "POLICY/ISSUANCE"
          })),
          ...(orgRes?.data || orgRes || []).map(item => ({
            ...item,
            title: item.title || item.name || "Organizational Structure",
            content: item.description || "Organizational Structure Update",
            imageUrl: item.imageUrl || item.fileUrl,
            date: item.createdAt || item.date,
            type: "Organizational Structure"
          })),
          ...(sexRes?.data || sexRes || []).map(item => ({
            ...item,
            title: item.title || "Sex-Disaggregated Data",
            content: item.description || "Dataset Update",
            imageUrl: item.imageUrl || item.fileUrl,
            link: item.link || item.url,
            date: item.createdAt || item.date,
            type: "Knowledge Hub"
          })),
          ...(infoRes?.data || infoRes || []).map(item => ({
            ...item,
            title: item.title || "Infographic",
            content: item.description || "Infographic Update",
            imageUrl: item.imageUrl || item.fileUrl,
            date: item.createdAt || item.date,
            type: "Knowledge Hub"
          })),
          ...(albumRes?.data || albumRes || []).map(item => ({
            ...item,
            title: item.title || "Gallery Album",
            content: item.description || "Gallery Update",
            imageUrl: item.coverImage?.imageUrl || item.imageUrl,
            date: item.createdAt || item.date,
            type: "Knowledge Hub"
          })),
          ...(webRes?.data || webRes || []).map(item => ({
            ...item,
            title: item.title || "Webinar/Video",
            content: item.description || "Video Update",
            link: item.videoUrl,
            date: item.createdAt || item.date,
            type: "Knowledge Hub"
          })),
          ...(resRes?.data || resRes || []).map(item => ({
            ...item,
            title: item.title || "Research",
            content: item.abstract || item.description || "Research Update",
            imageUrl: item.fileUrl || item.imageUrl,
            link: item.url,
            date: item.createdAt || item.date,
            type: "Knowledge Hub"
          })),
          ...(rscRes?.data || rscRes || []).map(item => ({
            ...item,
            title: item.title || "Resource",
            content: item.description || "Resource Update",
            imageUrl: item.fileUrl || item.imageUrl,
            link: item.url,
            date: item.createdAt || item.date,
            type: "Resources"
          }))
        ];

        setAdditionalWhatsNew(extras);
      } catch (err) {
        console.error("Failed to fetch what's new items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWhatsNewData();
  }, []);

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const isVideo = (url) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith(".mp4") || lowerUrl.endsWith(".webm") || lowerUrl.endsWith(".mov") || lowerUrl.includes("video/upload");
  };

  const isDocument = (url) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|csv|txt)$/) || lowerUrl.includes('raw/upload');
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    const lowerUrl = url.toLowerCase();

    // Microsoft Office Formats (Excel, PowerPoint, Word)
    if (lowerUrl.match(/\.(xls|xlsx|ppt|pptx|doc|docx)$/)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }

    // All documents (PDF, CSV, TXT)
    if (lowerUrl.match(/\.(pdf|csv|txt)$/) || url.includes('/raw/upload/')) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }

    return `${url}#toolbar=0`;
  };

  const heroSlides = [
    {
      image: '/assets/carousel/CAROUSEL 1.jpg'
    },
  ];

  const departments = [
    {
      code: 'COE',
      name: 'College of Engineering',
      color: 'from-indigo-600 to-purple-700',
      image: '/assets/departments/coe.png'
    },
    {
      code: 'CET',
      name: 'College of Engineering Technology',
      color: 'from-emerald-600 to-teal-700',
      image: '/assets/departments/cet.png'
    },
    {
      code: 'CES',
      name: 'College of Education and Sciences',
      color: 'from-orange-500 to-red-600',
      image: '/assets/departments/ces.png'
    }
  ];

  const quickLinks = [
    { name: 'GAD Plan & Budget', icon: 'document', component: FileText },
    { name: 'Accomplishment Report', icon: 'chart', component: BarChart3 },
    { name: 'GAD Committee', icon: 'users', component: Users2 },
    { name: 'Resource Materials', icon: 'book', component: BookOpenCheck },
    { name: 'Suggestion Box', icon: 'message', component: MessageSquare },
    { name: 'Knowledge Hub', icon: 'learn', component: GraduationCap }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const whatsNewItems = [...newsItems, ...additionalWhatsNew].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt || 0);
    const dateB = new Date(b.date || b.createdAt || 0);
    return dateB - dateA;
  });

  if (isApkAccess) {
    return (
      <main className="bg-gray-50 min-h-screen flex flex-col font-sans relative overflow-x-hidden">
        <style>
          {`
            .hide-scroll::-webkit-scrollbar { display: none; }
            .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          `}
        </style>

        {/* Hero Banner Slider (Full Width) */}
        <div className="relative w-full h-64 bg-slate-900 shadow-sm">
          <div className="w-full h-full relative">
            {heroSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                {slide.image ? (
                  <img src={slide.image} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-800 to-purple-900"></div>
                )}
                {/* Optional dark overlay if needed, removed text */}
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            ))}

            {/* Dots */}
            {heroSlides.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                {heroSlides.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}></div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Primary Actions (Report/Login) */}
        <div className="px-4 mt-6 flex gap-3">
          <button onClick={() => navigate('/login')} className="flex-1 bg-violet-600 text-white font-bold py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-transform text-center flex items-center justify-center gap-2 text-sm">
            Get Started <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/login')} className="flex-1 bg-white text-violet-700 font-bold py-3.5 rounded-xl border border-violet-100 shadow-sm active:scale-[0.98] transition-transform text-center text-sm">
            Report an Issue
          </button>
        </div>

        {/* What's New Section */}
        <div className="mt-8 px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-800">What's New?</h2>
            <button onClick={() => navigate('/news')} className="text-violet-600 text-xs font-bold bg-violet-50 px-3 py-1.5 rounded-full active:scale-[0.95] transition-transform">View All</button>
          </div>
        </div>

        <div className="flex overflow-x-auto hide-scroll px-4 pb-4 gap-4 snap-x">
          {loading ? (
            <div className="flex justify-center w-full py-8"><div className="animate-spin h-8 w-8 border-4 border-violet-200 border-t-violet-600 rounded-full"></div></div>
          ) : whatsNewItems.length > 0 ? (
            whatsNewItems.slice(0, 5).map((item, idx) => (
              <div key={item._id || idx} onClick={() => setSelectedNews(item)} className="snap-center shrink-0 w-64 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col active:scale-[0.98] transition-transform">
                <div className="h-32 bg-gray-100 relative">
                  {item.imageUrl && !isVideo(item.imageUrl) && !isDocument(item.imageUrl) ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white p-4">
                      <img src="/assets/about/logo.png" alt="Default GAD Logo" className="w-full h-full object-contain opacity-90" />
                    </div>
                  )}
                  {item.type && (
                    <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded shadow-sm">
                      {item.type}
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-800 text-xs line-clamp-2 mb-2 leading-snug">{item.title}</h3>
                  <div className="mt-auto flex items-center text-[11px] text-violet-600 font-bold">
                    Read More <ChevronRight size={12} className="ml-0.5" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm w-full text-center py-4 bg-white rounded-xl border border-gray-100 shadow-sm">No updates available right now.</p>
          )}
        </div>

        {/* GAD Agenda Card */}
        <div className="px-4 mt-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-slate-900 mb-2">GAD Agenda</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              The GAD Office promotes gender equality and women's empowerment, a unified approach to developing human capital, and initiatives aligned with sustainability goals. It underscores data-driven decisions, global competitiveness through inclusivity, and strong governance.
            </p>
          </div>
        </div>

        {/* Highlights Section */}
        <div className="mt-6">
          <HighlightsSection />
        </div>



        {/* Case Handling Process */}
        <div className="mt-6 px-4">
          <h2 className="text-lg font-black text-slate-800 mb-4">Case Handling Process</h2>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-violet-600 mb-4 bg-violet-50 p-2 rounded-lg inline-block">Before You Proceed</p>
            <div className="space-y-6 relative">
              {/* Timeline Line */}
              <div className="absolute top-2 left-[7px] bottom-2 w-0.5 bg-violet-100"></div>

              {[
                { step: "First Action", label: "Initial Approach & Appointment", desc: "The concerned student or faculty member will formally approach the office and set an appointment." },
                { step: "Second Action", label: "Consultation & Assessment", desc: "A consultation will be conducted to assess the nature of the concern." },
                { step: "Third Action", label: "Committee Formation", desc: "Based on the assessment, a formal committee will be constituted when necessary." },
                { step: "Final Step", label: "Turnover / Referral", desc: "The case may be officially endorsed to the appropriate office." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 relative z-10">
                  <div className="w-4 h-4 rounded-full bg-violet-600 mt-1 flex-shrink-0 border-4 border-white shadow-sm"></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-violet-500 mb-0.5">{item.step}</p>
                    <p className="text-sm font-bold text-slate-800 mb-1">{item.label}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Share/Web Link (formerly Download) */}
        <div className="mt-8 px-4 pb-12">
          <div className="bg-gradient-to-br from-violet-600 to-purple-800 rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <h2 className="text-xl font-black mb-2 relative z-10">Stay Connected</h2>
            <p className="text-xs text-violet-200 mb-5 relative z-10">Open portal on another device by scanning this QR code.</p>

            <div className="bg-white p-3 rounded-xl inline-block mx-auto shadow-md relative z-10">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getWebUrl())}`} alt="Web Portal" className="w-24 h-24" />
            </div>
            <p className="mt-3 text-[10px] font-bold tracking-wider uppercase opacity-80 relative z-10">Scan to Share Web</p>
          </div>
        </div>

        {/* Modal for Mobile News */}
        {selectedNews && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedNews(null)}>
            <div
              className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-2 right-2 z-20">
                <button onClick={() => setSelectedNews(null)} className="bg-black/50 text-white p-2 rounded-full backdrop-blur-md">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto pb-6">
                <div className="w-full h-48 bg-gray-100 relative">
                  {getYouTubeEmbedUrl(selectedNews.link) ? (
                    <iframe className="w-full h-full object-cover bg-black" src={getYouTubeEmbedUrl(selectedNews.link)} title={selectedNews.title} frameBorder="0" allowFullScreen />
                  ) : selectedNews.imageUrl ? (
                    isVideo(selectedNews.imageUrl) ? (
                      <video controls autoPlay src={selectedNews.imageUrl} className="w-full h-full object-cover bg-black" />
                    ) : isDocument(selectedNews.imageUrl) ? (
                      <iframe src={getEmbedUrl(selectedNews.imageUrl)} className="w-full h-full border-none" />
                    ) : (
                      <img src={selectedNews.imageUrl} alt={selectedNews.title} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white p-6">
                      <img src="/assets/about/logo.png" alt="Default GAD Logo" className="w-full h-full object-contain opacity-90" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-black text-slate-900 mb-3">{selectedNews.title}</h2>
                  <p className="flex items-center gap-1.5 text-xs text-violet-600 font-bold mb-4">
                    <Calendar size={14} />
                    {selectedNews.date ? new Date(selectedNews.date).toLocaleDateString() : "—"}
                  </p>
                  <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                    {selectedNews.content}
                  </div>
                  {selectedNews.link && (
                    <a href={selectedNews.link} target="_blank" rel="noopener noreferrer" className="inline-flex mt-6 w-full justify-center items-center gap-2 px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition shadow-md">
                      Visit External Link <ArrowRight size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section ref={heroRef} className="relative w-full bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent z-10 pointer-events-none"></div>

        <div className="relative w-full">
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`w-full transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'}`}
            >
              {slide.image ? (
                <img src={slide.image} alt={slide.title || "Hero Banner"} className="w-full h-auto block" />
              ) : (
                <div className="w-full h-[400px] sm:h-[500px] lg:h-[calc(100vh-116px)] bg-gradient-to-br from-violet-900 to-purple-900"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10 pointer-events-none"></div>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center px-4 md:px-6 max-w-5xl relative z-10">
            {heroSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`transition-all duration-1000 ${idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 absolute inset-0 pointer-events-none'}`}
              >
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* GAD Agenda Section */}
      <section className="py-10 md:py-20 bg-gradient-to-b from-gray-50 to-white border-t-4 border-b-4 border-gray-300">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center text-center lg:text-left">

            {/* Left side - Logo */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <img
                  src="/assets/about/logo.png"
                  alt="GAD Office Logo"
                  className="w-48 sm:w-64 md:w-full md:max-w-xl h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Right side - Content */}
            <div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 lg:mb-10 leading-tight">
                GAD Agenda
              </h2>

              <div className="space-y-6 lg:space-y-8 text-slate-700 text-lg md:text-xl leading-relaxed mb-8 lg:mb-12">
                <p>
                  The GAD Office promotes gender equality and women's empowerment,
                  a unified approach to developing human capital, and initiatives aligned
                  with sustainability goals. It underscores data-driven decisions, global
                  competitiveness through inclusivity, and strong governance and
                  institutional systems.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Highlights Section - Added after Hero */}
      <HighlightsSection />

      {/* What's New Section */}
      <section className="py-10 md:py-20 bg-slate-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-6 md:mb-12 border-b-4 border-violet-600 pb-4 md:pb-6 gap-4">
            <h2 className="text-3xl md:text-6xl font-black text-slate-800 text-center sm:text-left">What's New?</h2>
            <button
              onClick={() => navigate("/news")}
              className="bg-white text-violet-700 font-bold text-base md:text-xl hover:text-violet-600 transition-colors flex items-center gap-2 md:gap-3 border border-violet-200 px-4 md:px-6 py-2 rounded-lg shadow dark:bg-white dark:text-violet-700 dark:hover:text-violet-600"
            >
              View All <ArrowRight className="w-5 h-5 md:w-7 md:h-7" />
            </button>
          </div>


          {/* What's New Grid */}
          {loading ? (
            <div className="text-center py-32">
              <div className="inline-block animate-spin rounded-full h-20 w-20 border-4 border-violet-200 border-t-violet-600"></div>
              <p className="mt-8 text-slate-600 text-2xl">Loading updates...</p>
            </div>
          ) : whatsNewItems.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-xl border-2 border-dashed border-slate-300">
              <p className="text-slate-600 text-2xl">No updates available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-12">
              {whatsNewItems.slice(0, 3).map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col relative"
                >
                  {item.type && (
                    <div className="absolute top-4 left-4 z-10 bg-blue-100 text-blue-700 text-xs font-black px-3 py-1.5 rounded shadow-md">
                      {item.type}
                    </div>
                  )}
                  {/* Image */}
                  <div className="h-48 md:h-80 bg-slate-200 overflow-hidden relative">
                    {getYouTubeEmbedUrl(item.link) ? (
                      <iframe
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 bg-black"
                        src={getYouTubeEmbedUrl(item.link)}
                        title={item.title}
                        frameBorder="0"
                        allowFullScreen
                      />
                    ) : item.imageUrl && isVideo(item.imageUrl) ? (
                      <video
                        src={item.imageUrl}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 bg-black"
                      />
                    ) : item.imageUrl && isDocument(item.imageUrl) ? (
                      <div className="w-full h-full bg-violet-100 flex flex-col items-center justify-center text-violet-600">
                        <FileText className="w-16 h-16 mb-2" />
                        <span className="font-bold">Document</span>
                      </div>
                    ) : item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center p-8">
                        <img 
                          src="/assets/about/logo.png" 
                          alt="Default GAD Logo" 
                          className="w-full h-full object-contain opacity-80 hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 p-6">
                    <div className="flex flex-col flex-1">
                      <h3 className="text-lg md:text-2xl font-bold text-slate-800 mb-3 md:mb-6 line-clamp-3 leading-snug flex-1">
                        {item.title}
                      </h3>
                      <button
                        onClick={() => setSelectedNews(item)}
                        className="text-violet-700 font-bold text-base md:text-xl hover:text-violet-600 transition-colors text-left"
                      >
                        Read More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-12 bg-violet-900 text-white overflow-hidden relative">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-violet-200 mb-6 backdrop-blur-md border border-white/10">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Mobile App Available</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Stay Connected<br />Everywhere</h2>
              <p className="text-xl text-violet-100 mb-10 max-w-2xl leading-relaxed">
                Download the ETALA mobile app to report issues on the go.
              </p>
              {!isApkAccess && (
                <div className="flex flex-wrap gap-4 items-center">
                  <Link
                    to="/download"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-violet-900 hover:bg-violet-100 transition-all duration-300 font-extrabold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 text-lg"
                  >
                    <Download className="w-5 h-5 text-violet-900" />
                    Download eTALA APK
                  </Link>
                </div>
              )}
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-400 to-purple-400 rounded-[2.5rem] opacity-20 blur-2xl group-hover:opacity-40 transition duration-1000"></div>
              <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center relative border border-white/20">
                <div className="bg-gray-50 overflow-hidden rounded-2xl mb-6 shadow-inner flex items-center justify-center w-48 h-48 md:w-64 md:h-64">
                  {isApkAccess ? (
                    <a
                      href={getWebUrl()}
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(getWebUrl(), "_system");
                      }}
                      className="block w-full h-full p-3 cursor-pointer"
                      title="Open eTALA Web Portal"
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getQrData())}`}
                        alt="Scan to open web portal"
                        className="w-full h-full object-contain"
                      />
                    </a>
                  ) : (
                    <Link
                      to="/download"
                      className="block w-full h-full p-3 cursor-pointer"
                      title="Click to download eTALA APK"
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getQrData())}`}
                        alt="Scan to download app"
                        className="w-full h-full object-contain"
                      />
                    </Link>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-slate-900 font-black text-xl mb-1">
                    {isApkAccess ? "Scan to Share Web" : "Scan or Click to Download"}
                  </p>
                  <p className="text-slate-500 font-medium">
                    {isApkAccess ? "Open portal on another device" : "Available for Android"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Report Section */}
      <section className="py-10 md:py-20 bg-gradient-to-b from-gray-50 to-white border-t-4 border-b-4 border-gray-300">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top - Case Handling Process */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-10 lg:mb-16">

            {/* Left - Label */}
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-violet-600 mb-4 md:mb-6">
                Before You Proceed
              </p>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 md:mb-10 leading-tight">
                Case Handling Process
              </h3>
              <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
                By submitting this report/request, you acknowledge that the case will undergo the following standard process:
              </p>
            </div>

            {/* Right - Timeline Steps */}
            <div className="space-y-8 md:space-y-10">
              {[
                {
                  step: "First Action",
                  label: "Initial Approach & Appointment",
                  desc: "The concerned student or faculty member will formally approach the office and set an appointment for initial documentation."
                },
                {
                  step: "Second Action",
                  label: "Consultation & Assessment",
                  desc: "A consultation will be conducted to assess the nature of the concern and determine the appropriate personnel to handle the investigation."
                },
                {
                  step: "Third Action",
                  label: "Committee Formation",
                  desc: "Based on the assessment, the case will be handled by OSA (student to student) or referred with HR participation (student and faculty). A formal committee will be constituted when necessary."
                },
                {
                  step: "Final Step",
                  label: "Turnover / Referral",
                  desc: "The case may be officially endorsed to the appropriate office (e.g., OSA, HR) for formal investigation and resolution."
                },
              ].map((item, i, arr) => (
                <div key={i} className="flex gap-4 md:gap-8 items-start">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-3 md:w-4 h-3 md:h-4 rounded-full bg-violet-600 mt-2"></div>
                    {i < arr.length - 1 && (
                      <div className="w-0.5 bg-violet-200 mt-1" style={{ minHeight: '52px' }}></div>
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-violet-400 mb-1">{item.step}</p>
                    <p className="text-lg md:text-xl font-black text-slate-800 mb-1">{item.label}</p>
                    <p className="text-slate-600 text-base md:text-lg leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-200 my-12 lg:my-24" />

          {/* Bottom - Report an Issue */}
          <div className="text-center max-w-5xl mx-auto">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-8 lg:mb-12 leading-tight">
              Report an Issue
            </h2>
            <div className="space-y-6 lg:space-y-8 text-slate-700 text-lg md:text-2xl leading-relaxed mb-10 lg:mb-16">
              <p>
                If you've experienced any harm, issue, or unfair treatment, we encourage you to report it confidentially so it can be addressed and resolved properly.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 md:px-16 py-4 md:py-6 hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl hover:scale-105 text-lg md:text-2xl inline-flex items-center gap-4"
            >
              Report Now
              <ArrowRight className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          </div>

        </div>
      </section>


      {/* Infographic Modal */}
      {fullscreenImage && (
        <InfographicModal
          image={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
        />
      )}

      {/* Modal View for Full News Content */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedNews(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 right-0 z-10 flex justify-end p-4 pointer-events-none">
              <button
                onClick={() => setSelectedNews(null)}
                className="pointer-events-auto bg-gray-100/80 backdrop-blur-md hover:bg-gray-200 text-gray-700 p-2 rounded-full transition shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-8 pb-8 -mt-12">
              <div className="w-full mt-12 mb-6">
                {getYouTubeEmbedUrl(selectedNews.link) ? (
                  <iframe
                    className="w-full h-64 md:h-80 object-cover rounded-xl shadow-md bg-black"
                    src={getYouTubeEmbedUrl(selectedNews.link)}
                    title={selectedNews.title}
                    frameBorder="0"
                    allowFullScreen
                  />
                ) : selectedNews.imageUrl ? (
                  isVideo(selectedNews.imageUrl) ? (
                    <video
                      controls
                      autoPlay
                      src={selectedNews.imageUrl}
                      className="w-full h-64 md:h-80 object-cover rounded-xl shadow-md bg-black"
                    />
                  ) : isDocument(selectedNews.imageUrl) ? (
                    <iframe
                      src={getEmbedUrl(selectedNews.imageUrl)}
                      className="w-full h-[60vh] border-none rounded-xl"
                      title="Document Viewer"
                    />
                  ) : (
                    <img
                      src={selectedNews.imageUrl}
                      alt={selectedNews.title}
                      className="w-full h-64 md:h-80 object-cover rounded-xl shadow-md"
                    />
                  )
                ) : (
                  <div className="w-full h-64 md:h-80 bg-white flex items-center justify-center p-8 rounded-xl shadow-md border border-gray-100">
                    <img 
                      src="/assets/about/logo.png" 
                      alt="Default GAD Logo" 
                      className="w-full h-full object-contain opacity-80" 
                    />
                  </div>
                )}
              </div>
              <h2 className={`text-2xl md:text-3xl font-black text-slate-900 mb-4 ${!selectedNews.imageUrl && !getYouTubeEmbedUrl(selectedNews.link) ? "mt-12" : ""}`}>
                {selectedNews.title}
              </h2>
              <p className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-medium">
                <Calendar size={16} />
                {selectedNews.date ? new Date(selectedNews.date).toLocaleDateString() : "—"}
              </p>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px] md:text-base">
                {selectedNews.content}
              </div>

              {selectedNews.link && (
                <a
                  href={selectedNews.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex mt-8 items-center gap-2 px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition shadow-lg"
                >
                  Visit External Link <ArrowRight size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default LandingPage;