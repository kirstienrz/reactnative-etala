import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-violet-950 via-violet-900 min-w-7xl mx-auto px-16 py-12 md:py-16 to-violet-950 text-white relative overflow-hidden min-h-[90vh] flex flex-col">
      {/* Background decoration matching header exactly */}
      {/* <div className="max-w-7xl mx-auto px-8 py-12 md:py-16 flex-1"></div> */}
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
                <h3 className="text-lg font-bold mb-4 text-white tracking-wide">GAD Resources</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200">GAD Plan & Budget</a></li>
                  <li><a href="#" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200">Accomplishment Reports</a></li>
                  <li><a href="#" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200">Resource Materials</a></li>
                  <li><a href="#" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200">Knowledge Hub</a></li>
                </ul>
              </div>

              {/* Policies Section */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white tracking-wide">Policies</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200">Circulars</a></li>
                  <li><a href="#" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200">Resolutions</a></li>
                  <li><a href="#" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200">Memoranda</a></li>
                  <li><a href="#" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200">Office Orders</a></li>
                </ul>
              </div>

              {/* Quick Links Section */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white tracking-wide">Quick Links</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200">About GAD</a></li>
                  <li><a href="#" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200">GAD Committee</a></li>
                  <li><a href="#" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200">Programs & Projects</a></li>
                  <li><a href="#" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200">Suggestion Box</a></li>
                  <li><a href="#" className="text-violet-200 hover:text-white hover:translate-x-1 transition-all duration-200">Infographics</a></li>
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
                  {/* <div className="flex gap-3 items-center">
                    <Phone size={20} className="text-violet-300 flex-shrink-0" />
                    <p className="text-sm text-violet-200">(+632) 8247-5250 to 54</p>
                  </div> */}
                  <div className="flex gap-3 items-center">
                    <Mail size={20} className="text-violet-300 flex-shrink-0" />
                    <a href="mailto:gad@tup.edu.ph" className="text-sm text-violet-200 hover:text-white transition-colors">gad@tup.edu.ph</a>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Globe size={20} className="text-violet-300 flex-shrink-0" />
                    <a href="#" className="text-sm text-violet-200 hover:text-white transition-colors">www.tupt.edu.ph/gad</a>
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