import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  const location = useLocation();

  const handleLinkClick = (path) => {
    if (path && location.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="flex flex-col bg-gradient-to-r from-violet-950 via-violet-900 to-violet-950 text-white relative overflow-hidden py-8 md:py-10">
      {/* Background decoration matching header exactly */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 border-b border-white/10">
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
              {/* Resources Section */}
              <div>
                <h3 className="text-sm sm:text-lg font-bold mb-3 text-white tracking-wide uppercase">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/PlanAndBudget" className="text-xs sm:text-sm text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block" onClick={() => handleLinkClick("/PlanAndBudget")}>
                      Plan & Budget
                    </Link>
                  </li>
                  <li>
                    <Link to="/Accomplishment" className="text-xs sm:text-sm text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block" onClick={() => handleLinkClick("/Accomplishment")}>
                      Accomplishment Reports
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Quick Links Section */}
              <div>
                <h3 className="text-sm sm:text-lg font-bold mb-3 text-white tracking-wide uppercase">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/Mission-Vision" className="text-xs sm:text-sm text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block" onClick={() => handleLinkClick("/Mission-Vision")}>
                      About 
                    </Link>
                  </li>
                  <li>
                    <Link to="/Organization" className="text-xs sm:text-sm text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block" onClick={() => handleLinkClick("/Organization")}>
                     Committee
                    </Link>
                  </li>
                  <li>
                    <Link to="/Projects" className="text-xs sm:text-sm text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block" onClick={() => handleLinkClick("/Projects")}>
                      Programs & Projects
                    </Link>
                  </li>
                  <li>
                    <Link to="/SuggestionBox" className="text-xs sm:text-sm text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block" onClick={() => handleLinkClick("/SuggestionBox")}>
                      Suggestion Box
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Knowledge Hub */}
              <div>
                <h3 className="text-sm sm:text-lg font-bold mb-3 text-white tracking-wide uppercase">Knowledge Hub</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/SexDisaggregated" className="text-xs sm:text-sm text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block" onClick={() => handleLinkClick("/SexDisaggregated")}>
                      Sex Disaggregated Data
                    </Link>
                  </li>
                  <li>
                    <Link to="/album" className="text-xs sm:text-sm text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block" onClick={() => handleLinkClick("/album")}>
                      Gallery
                    </Link>
                  </li>
                  <li>
                    <Link to="/Knowledge" className="text-xs sm:text-sm text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block" onClick={() => handleLinkClick("/Knowledge")}>
                      Videos
                    </Link>
                  </li>
                  <li>
                    <Link to="/Research" className="text-xs sm:text-sm text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block" onClick={() => handleLinkClick("/Research")}>
                      Research
                    </Link>
                  </li>
                  <li>
                    <Link to="/Infographics" className="text-xs sm:text-sm text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block" onClick={() => handleLinkClick("/Infographics")}>
                      Infographics
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact Section */}
              <div>
                <h3 className="text-sm sm:text-lg font-bold mb-3 text-white tracking-wide uppercase">Contact Us</h3>
                <div className="space-y-3">
                  <div className="flex gap-2 items-start">
                    <MapPin size={16} className="text-violet-300 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-violet-200">KM14 East Service Road, Western Bicutan, Taguig City</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Mail size={16} className="text-violet-300 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-violet-200 break-all">
                      officialgadtupt@gmail.com
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Globe size={16} className="text-violet-300 flex-shrink-0" />
                    <a 
                      href="https://www.tupt.edu.ph" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs sm:text-sm text-violet-200 hover:text-white transition-colors"
                    >
                      www.tupt.edu.ph
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="w-full border-t border-white/5 bg-black/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4 text-center">
            <p className="text-xs sm:text-sm text-violet-200/80 font-medium">
              &copy; {new Date().getFullYear()} eTALA. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;