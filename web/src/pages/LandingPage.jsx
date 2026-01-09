import React, { useState, useEffect } from 'react';
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
  Bell, Calendar, X
} from 'lucide-react';
import { getInfographics } from "../api/infographics";
import { getNews, getAnnouncements } from "../api/newsAnnouncement";
import { getAllCalendarEvents } from "../api/calendar";


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

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [infographics, setInfographics] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const navigate = useNavigate();

  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);

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
    const fetchNews = async () => {
      try {
        const data = await getNews(); // fetch non-archived news
        setNewsItems(data.slice(0, 3)); // only top 3 latest
      } catch (err) {
        console.error("Failed to fetch news:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await getAnnouncements();
        setAnnouncements(data.slice(0, 3)); // only top 3 latest
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);


  const heroSlides = [
    // {
    //   image: '/assets/carousel/CAROUSEL.png'
    // },
    {
      image: '/assets/carousel/CAROUSEL1.jpg'
    },
    // {
    //   image: '/assets/carousel/CAROUSEL2.jpg'
    // }
  ];

  const departments = [
    {
      code: 'BASD',
      name: 'Basic Arts and Sciences Department',
      color: 'from-indigo-600 to-purple-700',
      image: '/assets/departments/basd.png'
    },
    {
      code: 'CAAD',
      name: 'Civil and Allied Department',
      color: 'from-emerald-600 to-teal-700',
      image: '/assets/departments/caad.png'
    },
    {
      code: 'EEAD',
      name: 'Electrical and Allied Department',
      color: 'from-orange-500 to-red-600',
      image: '/assets/departments/eaad.png'
    },
    {
      code: 'MAAD',
      name: 'Mechanical and Allied Department',
      color: 'from-cyan-600 to-blue-700',
      image: '/assets/departments/maad.png'
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

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[500px] md:h-[600px] bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            {slide.image ? (
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-900 to-purple-900"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/10"></div>
          </div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6 max-w-5xl relative z-10">
            {heroSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`transition-all duration-1000 ${idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 absolute inset-0 pointer-events-none'}`}
              >
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 transition-all duration-300 backdrop-blur-md border border-white/20 group"
        >
          <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 transition-all duration-300 backdrop-blur-md border border-white/20 group"
        >
          <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 transition-all duration-500 ${idx === currentSlide ? 'bg-white w-12' : 'bg-white/40 w-6 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </section>
      {/* Quick Links */}

      <section className="py-32 bg-gradient-to-b from-gray-50 to-white border-t-4 border-b-4 border-gray-300">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">

            {/* Left side - Logo */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <img
                  src="/assets/about/logo.png"
                  alt="GAD Office Logo"
                  className="w-full max-w-xl h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Right side - Content */}
            <div>
              <h2 className="text-6xl lg:text-7xl font-black text-slate-900 mb-10 leading-tight">
                GAD Agenda
              </h2>

              <div className="space-y-8 text-slate-700 text-xl leading-relaxed mb-12">
                <p>
                  The GAD Office promotes gender equality and women's empowerment,
                  a unified approach to developing human capital, and initiatives aligned
                  with sustainability goals. It underscores data-driven decisions, global
                  competitiveness through inclusivity, and strong governance and
                  institutional systems.
                </p>
              </div>

              <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-14 py-5 hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl hover:scale-105 text-xl">
                Know more about GAD Office
              </button>
            </div>

          </div>
        </div>
      </section>


      <section className="py-40 bg-slate-50">
        <div className="max-w-7xl mx-auto px-10">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-24 border-b-4 border-violet-600 pb-8">
            <h2 className="text-6xl font-black text-slate-800">Press Releases</h2>
            <button className="text-violet-700 font-bold text-xl hover:text-violet-600 transition-colors flex items-center gap-3">
              View All <ArrowRight className="w-7 h-7" />
            </button>
          </div>

          {/* Press Releases Grid */}
          {loading ? (
            <div className="text-center py-32">
              <div className="inline-block animate-spin rounded-full h-20 w-20 border-4 border-violet-200 border-t-violet-600"></div>
              <p className="mt-8 text-slate-600 text-2xl">Loading press releases...</p>
            </div>
          ) : newsItems.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-xl border-2 border-dashed border-slate-300">
              <p className="text-slate-600 text-2xl">No press releases available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-12">
              {newsItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="h-80 bg-slate-200 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                        <svg
                          className="w-20 h-20 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1">
                    {/* Date Badge */}
                    <div className="bg-violet-600 text-white p-8 flex flex-col items-center justify-center w-28 flex-shrink-0">
                      <div className="text-4xl font-bold leading-none">
                        {item.date.split(' ')[1] || '01'}
                      </div>
                      <div className="text-base font-semibold mt-2">
                        {item.date.split(' ')[0] || 'Jan'}
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-2xl font-bold text-slate-800 mb-6 line-clamp-3 leading-snug flex-1">
                        {item.title}
                      </h3>
                      <a
                        href={item.link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-700 font-bold text-xl hover:text-violet-600 transition-colors"
                      >
                        Read More
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* University Departments Section
      <section className="py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-violet-600 tracking-wider uppercase mb-4 inline-block">Our Departments</span>
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6">University Departments</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Discover our academic departments and their contributions to gender and development initiatives</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {departments.map((dept, idx) => (
              <a
                key={idx}
                href="#"
                className="group relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col bg-white border-2 border-slate-100 hover:border-violet-300 hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  {dept.image ? (
                    <img src={dept.image} alt={dept.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                      <span className="text-slate-500 font-medium">Department Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                <div className={`bg-gradient-to-br ${dept.color} p-6 flex-1 flex flex-col justify-between text-white`}>
                  <div>
                    <span className="inline-block text-xs font-bold mb-3 tracking-wider bg-white/20 px-3 py-1 backdrop-blur-sm">
                      {dept.code}
                    </span>
                    <h3 className="text-xl font-bold mb-2 leading-tight">{dept.name}</h3>
                  </div>
                  <div className="border-t border-white/30 pt-4 mt-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
                      Explore Department
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section> */}


      {/* Stats Section */}
      {/* <section className="py-28 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-4 text-center">
            Calendar of Events
          </h2>
          <p className="text-xl text-violet-200 text-center mb-16 max-w-3xl mx-auto">
            Upcoming programs, projects, and activities
          </p>

          <div className="space-y-6 max-w-4xl mx-auto">
            {calendarLoading ? (
              <p className="text-center text-violet-200">
                Loading events...
              </p>
            ) : calendarEvents.length === 0 ? (
              <p className="text-center text-violet-200">
                No events
              </p>
            ) : (
              calendarEvents
                .slice()
                .sort((a, b) => new Date(b.start) - new Date(a.start)) // pinaka-bago first
                .slice(0, 3) // 3 lang
                .map((event, idx) => {
                  const date = new Date(event.start);
                  const day = date.getDate();
                  const month = date
                    .toLocaleString("default", { month: "short" })
                    .toUpperCase();

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-6 p-6 bg-white/10 border-2 border-white/20 backdrop-blur-sm 
           hover:bg-white/15 hover:scale-[1.02] transition-all duration-300"
                    >
                      <div className="w-20 h-20 flex flex-col items-center justify-center 
                bg-violet-500/20 rounded-lg text-white font-black">
                        <span className="text-2xl">{day}</span>
                        <span className="text-sm tracking-widest">{month}</span>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {event.title}
                        </h3>
                        <p className="text-violet-200 text-sm mb-3">
                          {date.toLocaleDateString()} •{" "}
                          {event.extendedProps?.location || "—"}
                        </p>

                        <span className="inline-block px-3 py-1 rounded-full 
                   bg-violet-500/20 text-violet-200 text-sm font-medium">
                          {event.extendedProps?.type}
                        </span>
                      </div>
                    </div>
                  );
                })
            )}

          </div>
          <div className="text-center  mt-16">
            <button
              onClick={() => navigate("/Calendar")}
              className="inline-flex items-center gap-3 
               border-2 border-white/30 text-white 
               px-10 py-4 bg-white/10 hover:bg-white/20 
               transition-all duration-300 font-bold 
               hover:scale-105 backdrop-blur-md"
            >
              <Calendar className="w-5 h-5" />
              View Full Calendar
            </button>
          </div>

        </div>
      </section> */}


      {/* About Section */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block mb-4">
                <span className="text-sm font-bold text-violet-600 tracking-wider uppercase">Who We Are</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">About GAD Office</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-violet-600 to-purple-600 mb-6"></div>
              <div className="space-y-5 text-slate-700 text-base leading-relaxed mb-8">
                <p>The Gender and Development (GAD) Office of TUP Taguig is committed to promoting gender equality and women's empowerment within the university community.</p>
                <p>We implement programs, policies, and activities that address gender issues, eliminate discrimination, and ensure equal opportunities for all students, faculty, and staff regardless of gender.</p>
              </div>
              <div className="flex gap-4">
                <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3 hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105">
                  Learn More
                </button>
                <button className="border-2 border-violet-600 text-violet-700 px-8 py-3 bg-white hover:bg-violet-50 transition-all duration-300 font-bold hover:scale-105">
                  Contact Us
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="h-72 bg-slate-200 shadow-xl overflow-hidden border-4 border-white hover:scale-105 transition-transform duration-300">
                  <img
                    src="/assets/about/about.jpg"
                    alt="GAD Office Team"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-56 bg-slate-200 shadow-xl overflow-hidden border-4 border-white hover:scale-105 transition-transform duration-300">
                  <img
                    src="/assets/about/about3.jpg"
                    alt="GAD Activities"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-6 pt-12">
                <div className="h-56 bg-slate-200 shadow-xl overflow-hidden border-4 border-white hover:scale-105 transition-transform duration-300">
                  <img
                    src="/assets/about/about2.jpg"
                    alt="Gender Equality Workshop"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-72 bg-slate-200 shadow-xl overflow-hidden border-4 border-white hover:scale-105 transition-transform duration-300">
                  <img
                    src="/assets/about/about1.jpg"
                    alt="Community Outreach"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}


      {/* Resources Section */}
      {/* <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-violet-200 to-purple-200 -z-10"></div>
              <div className="h-[500px] bg-slate-200 shadow-2xl overflow-hidden border-8 border-white">
                <img
                  src="/assets/campus.png"
                  alt="University Campus"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-violet-600 tracking-wider uppercase mb-4 inline-block">Explore</span>
              <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                Our University Campus
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-violet-600 to-purple-600 mb-8"></div>
              <p className="text-lg text-slate-700 mb-10 leading-relaxed">
                Explore our vibrant campus through these images! From the facilities to beautiful green spaces, our campus provides an inspiring environment for learning, collaboration, and student life. Enjoy a glimpse of the places that make our university unique!
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://www.tupt.edu.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-bold inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
                    Visit Site
                  </button>
                </a>

              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* Report Section with ACHIEVE-style UI */}
      <section className="py-40 bg-gradient-to-b from-gray-50 to-white border-t-4 border-b-4 border-gray-300">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center max-w-5xl mx-auto">

            <h2 className="text-6xl lg:text-7xl font-black text-slate-900 mb-12 leading-tight">
              Report an Issue
            </h2>

            <div className="space-y-8 text-slate-700 text-2xl leading-relaxed mb-16">
              <p>
                If you've experienced any harm, issue, or unfair treatment, we encourage you to report it confidentially so it can be addressed and improved.
              </p>
            </div>

            <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-16 py-6 hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl hover:scale-105 text-2xl inline-flex items-center gap-4">
              Report Now
              <ArrowRight className="w-7 h-7" />
            </button>

          </div>
        </div>
      </section>

    </main>
  );
};

export default LandingPage;
