import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
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
      {/* About Section */}
      <section className="py-20 bg-white">
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
      </section>

      {/* University Departments Section */}
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
      </section>

{/* Gender and Development Infographics Section */}
<section className="py-28 bg-gradient-to-b from-slate-50 to-white">
  <div className="max-w-7xl mx-auto px-8">
    <div className="text-center mb-16">
      <span className="text-sm font-bold text-violet-600 tracking-wider uppercase mb-4 inline-block">Data Visualization</span>
      <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6">Gender and Development Infographics</h2>
      <p className="text-xl text-slate-600 max-w-3xl mx-auto">Visual representation of our institutional progress and gender equality initiatives</p>
    </div>
    
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {infographics.length === 0 ? (
        <p className="col-span-full text-center text-slate-600">No infographics available</p>
      ) : (
        infographics.map((item) => (
          <div
            key={item._id}
            className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-slate-100"
          >
            <div className="h-40 relative overflow-hidden cursor-pointer" onClick={() => setFullscreenImage(item.imageUrl)}>
              <img
                src={item.imageUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-300"
              />
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Uploaded: {new Date(item.uploadDate).toLocaleDateString()}
              </p>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setFullscreenImage(item.imageUrl)}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:from-violet-700 hover:to-purple-700 transition-all duration-300 inline-flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg"
              >
                View Infographic
              </button>
            </div>
          </div>
        ))
      )}
    </div>

    {/* Fullscreen modal for these infographics */}
    {fullscreenImage && (
      <InfographicModal image={fullscreenImage} onClose={() => setFullscreenImage(null)} />
    )}

    <div className="text-center mt-16">
      <button 
        className="border-2 border-violet-600 text-violet-700 px-8 py-3 bg-white hover:bg-violet-50 transition-all duration-300 font-semibold hover:scale-105 rounded-lg shadow-md hover:shadow-lg"
        onClick={() => navigate("Infographics")}
      >
        View All Infographics
      </button>
    </div>
  </div>
</section>


      {/* Stats Section */}
      <section className="py-28 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-4 text-center">Our Impact</h2>
          <p className="text-xl text-violet-200 text-center mb-16 max-w-2xl mx-auto">Making a difference through dedicated programs and initiatives</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '50+', label: 'GAD Activities' },
              { num: '2,000+', label: 'Beneficiaries' },
              { num: '15', label: 'Active Programs' },
              { num: '100%', label: 'Compliance Rate' }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-8 bg-white/10 border-2 border-white/20 backdrop-blur-sm hover:bg-white/15 hover:scale-105 transition-all duration-300"
              >
                <h3 className="text-6xl font-black bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent mb-3">{stat.num}</h3>
                <p className="text-violet-100 text-lg font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-28 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-bold text-violet-600 tracking-wider uppercase mb-4 inline-block">Updates</span>
          <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6">Latest News</h2>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {loading ? (
            <p className="col-span-full text-center py-16 text-slate-600">Loading news...</p>
          ) : newsItems.length === 0 ? (
            <p className="col-span-full text-center text-slate-600">No news available</p>
          ) : (
            newsItems.map((item) => (
              <a
                key={item._id}
                href={item.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white overflow-hidden border-2 border-slate-200 hover:border-violet-400 hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-2"
              >
                <div className="h-56 bg-slate-200 overflow-hidden relative">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                      <span className="text-slate-500 font-medium">News Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-sm text-violet-600 font-bold mb-3 uppercase tracking-wide">{item.date}</p>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-violet-700 transition-colors leading-snug flex-1">{item.title}</h3>
                  <span className="text-violet-700 font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                    Read more
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </div>
              </a>
            ))
          )}
        </div>

        {/* "See All News and Articles" Button */}
        <div className="text-center mt-16">
          <button
            className="border-2 border-violet-600 text-violet-700 px-8 py-3 bg-white hover:bg-violet-50 transition-all duration-300 font-semibold hover:scale-105 rounded-lg shadow-md hover:shadow-lg"
          >
            See All News and Articles
          </button>
        </div>
      </div>
    </section>

      {/* Resources Section */}
      <section className="py-28 bg-white">
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
                <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-bold inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
                  <BookOpen className="w-5 h-5" />
                  View Gallery
                </button>
                <button className="border-2 border-violet-600 text-violet-700 px-8 py-4 bg-white hover:bg-violet-50 transition-all duration-300 font-bold hover:scale-105">
                  Virtual Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Announcements Section */}
 <section className="py-28 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-bold text-violet-600 tracking-wider uppercase mb-4 inline-block">
            Updates
          </span>
          <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6">
            Latest Announcements
          </h2>
          <p className="text-xl text-slate-600">
            Stay updated with our latest news and information
          </p>
        </div>

        {/* Announcements List */}
        <div className="space-y-6">
          {loading ? (
            <p className="text-center py-16 text-slate-600">Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <p className="text-center text-slate-600">No announcements available</p>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="group bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 hover:border-violet-400 p-8 transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-[1.01]"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                        {announcement.title}
                      </h3>
                    </div>
                    <p className="text-slate-700 text-lg leading-relaxed">{announcement.content}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm md:flex-col md:items-end">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{announcement.date}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* See Older Announcements Button */}
        <div className="text-center mt-12">
          <button className="group inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105">
            <span>See Older Announcements</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>

      {/* CTA Section */}
      <section className="py-28 bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-white/10 border border-white/20 backdrop-blur-sm text-violet-200 text-sm font-bold tracking-wider uppercase mb-6">
              Your Voice Matters
            </span>
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6">Report an Issue</h2>
            <p className="text-xl text-violet-200 mb-12 max-w-2xl mx-auto leading-relaxed">
              If you’ve experienced any harm, issue, or unfair treatment, we encourage you to report it confidentially so it can be addressed and improved.
            </p>

            {/* Updated Button */}
            <button className="group bg-white text-violet-900 px-12 py-5 hover:bg-violet-50 transition-all duration-300 font-black text-lg inline-flex items-center gap-3 shadow-2xl hover:shadow-3xl hover:scale-105">
              Report Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

    </main>
  );
};

export default LandingPage;