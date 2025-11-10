import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: '/assets/carousel/CAROUSEL.png'
    },
    {
      image: '/assets/carousel/CAROUSEL1.jpg'
    },
    {
      image: '/assets/carousel/CAROUSEL2.jpg'
    }
  ];

  const focusAreas = [
    { name: 'Gender Mainstreaming', code: 'GM', description: 'Integrating gender perspectives into all institutional operations and policies.' },
    { name: 'Policy & Advocacy', code: 'PA', description: 'Developing and implementing gender-responsive policies and advocacy initiatives.' },
    { name: 'Programs & Projects', code: 'PP', description: 'Executing targeted programs that address gender issues and advance equality.' },
    { name: 'Research & Development', code: 'RD', description: 'Conducting research to inform evidence-based gender equality strategies.' }
  ];

  const news = [
    {
      date: '10 October, 2025',
      title: 'Women\'s Month Celebration: Empowering Women in STEM',
      image: '/assets/carousel/CAROUSEL.png'
    },
    {
      date: '28 September, 2025',
      title: 'GAD Training Workshop for Faculty and Staff',
      image: '/assets/carousel/CAROUSEL1.jpg'
    },
    {
      date: '15 September, 2025',
      title: 'Gender-Responsive Research Forum 2025',
      image: '/assets/carousel/CAROUSEL2.jpg'
    }
  ];

  const network = ['GAD Committee', 'GAD Focal Persons', 'Partner Organizations'];

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
      <section className="relative h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
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
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {quickLinks.map((link, idx) => {
              const IconComponent = link.component;
              return (
                <a
                  key={idx}
                  href="#"
                  className="group text-center p-6 transition-all duration-300 hover:bg-violet-50 rounded-2xl hover:shadow-md hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-4 rounded-full group-hover:from-violet-600 group-hover:to-purple-600 transition-all duration-300 group-hover:scale-110">
                    <IconComponent className="w-7 h-7 text-violet-700 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-violet-700 transition-colors">
                    {link.name}
                  </p>
                </a>

              );
            })}
          </div>
        </div>
      </section>

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

      {/* Focus Areas */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-violet-600 tracking-wider uppercase mb-4 inline-block">What We Do</span>
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6">Focus Areas</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Comprehensive programs addressing gender equality across all university operations</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {focusAreas.map((area, idx) => (
              <div
                key={idx}
                className="group bg-white p-8 border-2 border-slate-200 hover:border-violet-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-6 mb-6">
                  <span className="text-3xl font-black text-white bg-gradient-to-br from-violet-600 to-purple-600 w-16 h-16 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">{area.code}</span>
                  <h3 className="text-2xl font-bold text-slate-900 pt-2">{area.name}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">{area.description}</p>
                <a href="#" className="text-violet-700 font-bold hover:text-violet-800 inline-flex items-center gap-2 transition-colors group-hover:gap-3">
                  Learn more
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            ))}
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
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-violet-600 tracking-wider uppercase mb-4 inline-block">Updates</span>
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6">Latest News</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item, idx) => (
              <a
                key={idx}
                href="#"
                className="group bg-white overflow-hidden border-2 border-slate-200 hover:border-violet-400 hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-2"
              >
                <div className="h-56 bg-slate-200 overflow-hidden relative">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
            ))}
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

      {/* Network Section */}
      <section className="py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-violet-600 tracking-wider uppercase mb-4 inline-block">Connect</span>
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6">Our Network</h2>
          </div>
          <div className="space-y-6">
            {network.map((item, idx) => (
              <a
                key={idx}
                href="#"
                className="group bg-gradient-to-r from-violet-600 to-purple-600 p-8 hover:from-violet-700 hover:to-purple-700 transition-all duration-300 text-white flex items-center justify-between shadow-lg hover:shadow-2xl hover:scale-[1.02]"
              >
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">{item}</h3>
                    <p className="text-violet-100 text-lg">Connect and collaborate with our team</p>
                  </div>
                </div>
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-white/10 border border-white/20 backdrop-blur-sm text-violet-200 text-sm font-bold tracking-wider uppercase mb-6">Annual Report</span>
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6">GAD Accomplishment Report</h2>
            <p className="text-xl text-violet-200 mb-12 max-w-2xl mx-auto leading-relaxed">
              Stay informed on GAD activities, programs, and achievements throughout the year
            </p>
            <button className="group bg-white text-violet-900 px-12 py-5 hover:bg-violet-50 transition-all duration-300 font-black text-lg inline-flex items-center gap-3 shadow-2xl hover:shadow-3xl hover:scale-105">
              Download Report
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;