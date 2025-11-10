import React, { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, role } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const menuItems = [
    {
      title: 'About GAD',
      submenu: ['Mission & Vision', 'Organizational Structure', 'GAD Committee', 'Accomplishments']
    },
    {
      title: 'Policies',
      submenu: ['Circulars', 'Resolutions', 'Memorandan', 'Office Order']
    },
    {
      title: 'Programs',
      submenu: ['Workshops', 'Seminars', 'Advocacy', 'Student Programs']
    },
    {
      title: 'Resources',
      submenu: ['Handbook', 'Knowledge Hub', 'Suggestion Box']
    },
    {
      title: 'Contact',
      submenu: []
    }
  ];

  const dashboardLink =
    role === "superadmin"
      ? "/superadmin/dashboard"
      : role === "admin"
        ? "/admin/dashboard"
        : role === "user"
          ? "/user/dashboard"
          : null;

  return (
    <header className="sticky top-0 z-[9999]">
      <div className="relative bg-gradient-to-r from-violet-800 via-violet-700 to-violet-800">
        {/* Background visuals */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-violet-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-4 z-50">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="/assets/logo.jpg" 
                  alt="GAD Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">GAD PORTAL</h1>
                <p className="text-xs text-violet-100">TUP Taguig - Gender and Development Office</p>
              </div>
            </div>

            {/* Hamburger for mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white z-[10000]"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-7 relative z-[60]">
              <nav>
                <ul className="flex gap-2">
                  {menuItems.map((item, index) => (
                    <li
                      key={index}
                      className="relative group"
                      onMouseEnter={() => setOpenDropdown(item.title)}
                      onMouseLeave={() => setOpenDropdown('')}
                    >
                      <a
                        href={`#${item.title.toLowerCase().replace(' ', '-')}`}
                        className="flex items-center gap-1 px-4 py-2 font-medium text-white hover:bg-white/20 rounded-lg transition-all no-underline hover:text-white"
                      >
                        {item.title}
                        {item.submenu.length > 0 && <ChevronDown size={16} />}
                      </a>

                      {item.submenu.length > 0 && (
                        <ul
                          className={`absolute top-full left-0 mt-2 bg-white border border-violet-100 shadow-xl rounded-lg py-2 w-52 transition-all duration-200 z-[99999] ${openDropdown === item.title
                              ? 'opacity-100 visible translate-y-0'
                              : 'opacity-0 invisible -translate-y-2'
                            }`}
                        >
                          {item.submenu.map((subitem, subindex) => (
                            <li key={subindex}>
                              <a
                                href={`#${subitem.toLowerCase().replace(/\s+/g, '-')}`}
                                className="block px-4 py-2 text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors no-underline"
                              >
                                {subitem}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Auth Section */}
              <div className="flex items-center gap-4 text-sm border-l border-violet-400 pl-6">
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    className="text-white hover:text-white hover:bg-white/20 px-3 py-1 rounded-lg transition-all font-medium no-underline"
                  >
                    Login
                  </Link>
                ) : (
                  <>
                    {dashboardLink && (
                      <Link
                        to={dashboardLink}
                        className="text-white hover:text-white hover:bg-white/20 px-3 py-1 rounded-lg transition-all font-medium no-underline"
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-white bg-violet-600 hover:bg-violet-700 px-3 py-1 rounded-lg transition-all font-medium"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-violet-700 border-t border-violet-600 z-[9999] relative">
          <nav className="max-w-7xl mx-auto px-8 py-4">
            <ul className="flex flex-col gap-3">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={`#${item.title.toLowerCase().replace(' ', '-')}`}
                    className="block font-semibold text-white py-2 hover:bg-white/20 rounded-lg px-2 transition-all no-underline hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
              <li className="mt-4 border-t border-violet-600 pt-3">
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    className="block text-white font-medium hover:bg-white/20 rounded-lg px-2 py-2 no-underline"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                ) : (
                  <>
                    {dashboardLink && (
                      <Link
                        to={dashboardLink}
                        className="block text-white font-medium hover:bg-white/20 rounded-lg px-2 py-2 mb-2 no-underline"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left text-white font-medium hover:bg-white/20 rounded-lg px-2 py-2"
                    >
                      Logout
                    </button>
                  </>
                )}
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;