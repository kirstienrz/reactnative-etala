import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-violet-950 via-violet-900 min-w-7xl mx-auto px-16 py-12 md:py-16 to-violet-950 text-white relative overflow-hidden min-h-[90vh] flex flex-col">
      {/* Background decoration matching header exactly */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Main content */}
        <div className="w-full px-6 md:px-12 lg:px-20 py-12 md:py-16 flex-1">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Resources Section */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white tracking-wide">Resources</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/PlanAndBudget" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      Plan & Budget
                    </Link>
                  </li>
                  <li>
                    <Link to="/Accomplishment" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      Accomplishment Reports
                    </Link>
                  </li>
                  <li>

                  </li>
                </ul>
              </div>

              {/* Quick Links Section */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white tracking-wide">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/Mission-Vision" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      About 
                    </Link>
                  </li>
                  <li>
                    <Link to="/Organization" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                     Committee
                    </Link>
                  </li>
                  <li>
                    <Link to="/Projects" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      Programs & Projects
                    </Link>
                  </li>
                  <li>
                    <Link to="/SuggestionBox" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      Suggestion Box
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Knowledge Hub */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white tracking-wide">Knowledge Hub</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/SexDisaggregated" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      Sex Disaggregated Data
                    </Link>
                  </li>
                  <li>
                    <Link to="/album" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      Gallery
                    </Link>
                  </li>
                  <li>
                    <Link to="/Knowledge" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      Videos
                    </Link>
                  </li>
                  <li>
                    <Link to="/Research" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      Research
                    </Link>
                  </li>
                  <li>
                    <Link to="/Infographics" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                      Infographics
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact Section */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white tracking-wide">Contact Us</h3>
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <MapPin size={20} className="text-violet-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-violet-200">GAD Office, TUP Taguig</p>
                      <p className="text-sm text-violet-200">KM14 East Service Road, Western Bicutan, Taguig City</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Mail size={20} className="text-violet-300 flex-shrink-0" />
                    <span className="text-sm text-violet-200">
                      officialgadtupt@gmail.com
                    </span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Globe size={20} className="text-violet-300 flex-shrink-0" />
                    <a 
                      href="https://www.tupt.edu.ph" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-violet-200 hover:text-white transition-colors"
                    >
                      www.tupt.edu.ph
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;