<<<<<<< HEAD
import React, { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, LayoutDashboard, FileText, Inbox, User, LogOut, ChevronRight } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import LogoutModal from "./LogoutModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoggedIn, role, user } = useSelector((state) => state.auth);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Reference for dropdown to close when clicking outside
  const userDropdownRef = useRef(null);

  // Listen for scroll to add shadow/blur
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    setIsLogoutModalOpen(false);
    navigate("/");
  };

  const menuItems = [
    {
      title: "About",
      submenu: [
        { title: "Mission & Vision", path: "/Mission-Vision" },
        { title: "Organizational Structure", path: "/Organization" },
      ],
    },
    {
      title: "Programs and Activities",
      path: "/Projects",
      submenu: [],
    },
    {
      title: "Knowledge Hub",
      submenu: [
        { title: "Sex-Disaggregated Education Data", path: "/SexDisaggregated" },
        { title: "Infographics & Posters", path: "/Infographics" },
        { title: "Gallery", path: "/album" },
        { title: "Videos", path: "/Knowledge" },
        { title: "Research", path: "/Research" },
      ],
    },
    {
      title: "Resources",
      submenu: [
        { title: "Policies", path: "/Policies" },
        { title: "Plan and Budget", path: "/PlanAndBudget" },
        { title: "Accomplishment Report", path: "/Accomplishment" },
        { title: "Suggestion Box", path: "/SuggestionBox" },
      ],
    },
    {
      title: "eTALA",
      path: isLoggedIn ? "/user/report" : "/login",
      submenu: [],
    },
    {
      title: "Contact",
      path: "/Contact",
      submenu: [],
    },
  ];

  const dashboardLink =
    role === "superadmin"
      ? "/superadmin/dashboard"
      : role === "admin"
      ? "/admin/dashboard"
      : role === "user"
      ? "/user/dashboard"
      : null;

  const loggedInItems = [
    { title: "Dashboard", path: dashboardLink, icon: <LayoutDashboard size={16} /> },
  ];

  const toggleMobileDropdown = (title) => {
    setOpenDropdown(openDropdown === title ? "" : title);
  };

  return (
    <header className={`sticky top-0 z-[9999] transition-all duration-300 ${scrolled ? "shadow-lg bg-white/95 backdrop-blur-md" : "bg-white"}`}>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-800 text-white py-1.5 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center font-medium tracking-wide">
          <div className="flex items-center gap-2">
             <span className="hidden sm:inline">Republic of the Philippines</span>
             <span className="sm:hidden">Philippines</span>
          </div>
          <div className="hidden md:flex gap-6 uppercase">
            <a href="#transparency" className="hover:text-purple-300 transition-all no-underline">Transparency Seal</a>
            <a href="#foi" className="hover:text-purple-300 transition-all no-underline">FOI</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center gap-4">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 no-underline group flex-shrink-0 min-w-0">
            <div className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 overflow-hidden rounded-full shadow-md ring-2 ring-purple-100 group-hover:ring-purple-200 transition-all">
              <img
                src="/assets/logo.jpg"
                alt="GAD Logo"
                className="w-full h-full object-cover transform transition-transform group-hover:scale-110"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
            <div className="hidden sm:block truncate">
              <h1 className="text-lg md:text-xl font-bold text-purple-950 leading-tight group-hover:text-purple-800 transition-colors">
                Gender and Development Office
              </h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                TUP-Taguig
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-purple-950">GADO</h1>
            </div>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden xl:flex items-center gap-1">
            {menuItems.map((item, index) => (
              <div key={index} className="relative group/item">
                <Link
                  to={item.path || "#"}
                  className={`flex items-center px-4 py-2 text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-full transition-all duration-200 font-semibold text-[15px] no-underline whitespace-nowrap ${location.pathname === item.path ? "text-purple-700 bg-purple-50" : ""}`}
                >
                  {item.title}
                  {item.submenu.length > 0 && <ChevronDown size={14} className="ml-1 opacity-60 group-hover/item:rotate-180 transition-transform duration-300" />}
                </Link>
                {item.submenu.length > 0 && (
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 transform group-hover/item:translate-y-0 translate-y-2 z-50">
                    <ul className="bg-white border border-gray-100 shadow-xl rounded-2xl py-3 w-64 ring-1 ring-black/5 overflow-hidden">
                      {item.submenu.map((sub, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            to={sub.path || "#"}
                            className="flex items-center justify-between px-5 py-2.5 text-[14px] text-gray-600 hover:bg-purple-50 hover:text-purple-700 no-underline transition-all group/sub"
                          >
                            <span>{sub.title}</span>
                            <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all duration-200" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section: Auth & Hamburger */}
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <div className="hidden xl:block relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-full transition-all font-bold border border-purple-100"
                >
                  <div className="w-6 h-6 bg-purple-700 text-white rounded-full flex items-center justify-center">
                    <User size={14} />
                  </div>
                  <span className="text-sm">{user?.name || "User"}</span>
                  <ChevronDown size={14} className={`${userDropdownOpen ? "rotate-180" : ""} transition-transform duration-200 opacity-60`} />
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 bg-white border border-gray-100 shadow-xl rounded-2xl py-2 w-56 z-50 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {loggedInItems.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.path}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-purple-50 hover:text-purple-700 no-underline transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <div className="text-purple-600 bg-purple-50 p-1.5 rounded-lg">
                          {item.icon}
                        </div>
                        <span className="text-sm font-semibold">{item.title}</span>
                      </Link>
                    ))}
                    <div className="mx-2 my-1 border-t border-gray-100"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-[calc(100%-16px)] mx-2 px-3 py-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-bold rounded-xl"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger Toggle */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="xl:hidden bg-purple-50 text-purple-900 p-2.5 hover:bg-purple-100 rounded-full transition-all border border-purple-100 shadow-sm"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] transition-opacity duration-300 xl:hidden ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Drawer Content */}
      <div 
        className={`fixed top-0 right-0 h-full w-[280px] max-w-[85vw] bg-white z-[10001] shadow-2xl transition-transform duration-300 transform xl:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full bg-white">
          <div className="p-5 flex items-center justify-between border-b border-gray-50 flex-shrink-0 bg-purple-900 text-white">
            <span className="font-bold text-lg">Menu</span>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-5 px-4 custom-scrollbar">
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <div key={index} className="mb-1">
                  {item.submenu.length > 0 ? (
                    <div>
                      <button
                        onClick={() => toggleMobileDropdown(item.title)}
                        className={`flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all font-bold ${openDropdown === item.title ? "bg-purple-50 text-purple-900" : "bg-white text-gray-700 hover:bg-gray-50 border border-transparent"}`}
                      >
                        <span className="text-[15px]">{item.title}</span>
                        <ChevronDown size={18} className={`transition-transform duration-300 ${openDropdown === item.title ? "rotate-180" : ""}`} />
                      </button>
                      <div 
                        className={`overflow-hidden transition-all duration-300 ${openDropdown === item.title ? "max-h-[500px] mt-1" : "max-h-0"}`}
                      >
                        {item.submenu.map((sub, subIndex) => (
                          <Link
                            key={subIndex}
                            to={sub.path || "#"}
                            className="flex items-center gap-2 pl-8 pr-4 py-2.5 text-gray-600 hover:text-purple-700 transition-all text-sm font-medium border-l-2 border-purple-100 ml-4 mb-1 no-underline"
                            onClick={() => setIsMenuOpen(false)}
                          >
                             <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
                             {sub.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.path || "#"}
                      className={`block px-4 py-3.5 rounded-2xl transition-all font-bold no-underline ${location.pathname === item.path ? "bg-purple-50 text-purple-900" : "bg-white text-gray-700 hover:bg-gray-50 border border-transparent"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-[15px]">{item.title}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Account Section in Mobile */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              {isLoggedIn ? (
                <div className="space-y-2">
                   <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Account</div>
                   {loggedInItems.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      className="flex items-center gap-3 px-4 py-3.5 bg-gray-50 text-gray-900 rounded-2xl transition-all font-bold no-underline"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="text-purple-600">
                        {item.icon}
                      </div>
                      <span className="text-[15px]">{item.title}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3.5 bg-red-50 text-red-600 rounded-2xl transition-all font-bold mt-2"
                  >
                    <LogOut size={18} />
                    <span className="text-[15px]">Logout</span>
                  </button>
                </div>
              ) : null}
            </div>
          </nav>

          {/* Mobile Footer Area */}
          <div className="p-6 bg-gray-50 text-center flex-shrink-0">
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
               &copy; 2024 Gender and Development Office<br/>
               TUP-Taguig Campus
             </p>
          </div>
        </div>
      </div>

      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}} />
    </header>
  );
};

export default Header;
=======
import React, { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, LayoutDashboard, FileText, Inbox, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import LogoutModal from "./LogoutModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Reference for dropdown to close when clicking outside
  const userDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    setIsLogoutModalOpen(false);
    navigate("/");
  };

  const menuItems = [
    {
      title: 'About',
      submenu: [
        { title: 'Mission & Vision', path: '/Mission-Vision' },
        { title: 'Organizational Structure', path: '/Organization' },
        // { title: 'Accomplishments', path: '/Accomplishment' }
      ]
    },
    {
      title: 'Programs and Activities',
      path: '/Projects',
      submenu: []
    },
    {
      title: 'Knowledge Hub',
      submenu: [
        // { title: 'Handbook', path: '/Handbook' },
        { title: 'Sex-Disaggregated Education Data', path: '/SexDisaggregated' },
        { title: 'Infographics & Posters', path: '/Infographics' },
        { title: 'Gallery', path: '/album' },
        { title: 'Videos', path: '/Knowledge' },
        { title: 'Research', path: '/Research' },

      ]
    },
    {
      title: 'Resources',
      submenu: [
        { title: 'Policies', path: '/Policies' },
        { title: 'Plan and Budget', path: '/PlanAndBudget' },
        { title: 'Accomplishment Report', path: '/Accomplishment' },
        { title: 'Suggestion Box', path: '/SuggestionBox' }

        // { title: 'Committee Report', path: '/CommitteeReport' }
      ]
    },
    {
      title: 'eTALA',
      path: isLoggedIn ? '/user/report' : '/login',
      submenu: []
    },
    {
      title: 'Contact Us',
      path: '/Contact',
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

  // Logged-in menu items for the dropdown
  const loggedInItems = [
    { title: "Dashboard", path: dashboardLink, icon: <LayoutDashboard size={16} /> },
    // { title: "Reports", path: "/user/reports", icon: <FileText size={16} /> },
    // { title: "Inbox", path: "/user/inbox", icon: <Inbox size={16} /> },
    // { title: "My Profile", path: "/user/profile", icon: <User size={16} /> },
  ];

  const toggleMobileDropdown = (title) => {
    setOpenDropdown(openDropdown === title ? '' : title);
  };

  return (
    <header className="sticky top-0 z-[9999]">
      {/* Top Bar */}
      <div className="bg-purple-900 text-white py-2 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <span>Republic of the Philippines</span>
          <div className="hidden md:flex gap-4">
            <a href="#transparency" className="hover:text-purple-200 transition-colors no-underline">Transparency Seal</a>
            <a href="#foi" className="hover:text-purple-200 transition-colors no-underline">FOI</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 no-underline group">
            <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-full shadow-sm">
              <img
                src="/assets/logo.jpg"
                alt="GAD Logo"
                className="w-full h-full object-cover"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-purple-900 group-hover:text-purple-700 transition-colors">
                Gender and Development Office
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                Technological University of the Philippines - Taguig
              </p>
            </div>
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden bg-white text-purple-900 p-2 hover:bg-purple-100 rounded-lg transition-colors shadow border border-gray-200 dark:bg-white dark:text-purple-900 dark:hover:bg-purple-200"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {/* Site Menu */}
            {menuItems.map((item, index) => (
              <div key={index} className="relative group">
                <Link
                  to={item.path || "#"}
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all font-medium no-underline"
                >
                  {item.title}
                  {item.submenu.length > 0 && <ChevronDown size={16} className="ml-1" />}
                </Link>
                {item.submenu.length > 0 && (
                  <ul className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded py-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {item.submenu.map((sub, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          to={sub.path || "#"}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 no-underline"
                        >
                          {sub.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Logged-in Dropdown */}
            {isLoggedIn && (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-all font-medium border border-gray-200 dark:bg-white dark:text-gray-700 dark:hover:bg-purple-100"
                >
                  <User size={18} />
                  <span></span>
                  <ChevronDown size={16} className={`${userDropdownOpen ? 'rotate-180' : ''} transition-transform duration-200`} />
                </button>
                {userDropdownOpen && (
                  <ul className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-lg py-2 w-56 z-50">
                    {loggedInItems.map((item, idx) => (
                      <li key={idx}>
                        <Link
                          to={item.path}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 no-underline transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <div className="text-purple-600">
                            {item.icon}
                          </div>
                          <span className="text-sm font-medium">{item.title}</span>
                        </Link>
                      </li>
                    ))}
                    <li className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 bg-white text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors text-sm font-medium rounded-lg border border-gray-200 dark:bg-white dark:text-red-500 dark:hover:bg-red-100"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}

            {/* Login Button */}
            {/* {!isLoggedIn && (
              <Link
                to="/login"
                className="ml-2 px-5 py-2 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800 transition-all font-medium no-underline hover:shadow-md"
              >
                Login
              </Link>
            )} */}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.submenu.length > 0 ? (
                  <>
                    <button
                      onClick={() => toggleMobileDropdown(item.title)}
                      className="flex items-center justify-between w-full px-4 py-3 bg-white text-gray-700 hover:bg-purple-100 hover:text-purple-700 rounded-lg transition-all font-medium border border-gray-200 dark:bg-white dark:text-gray-700 dark:hover:bg-purple-100"
                    >
                      <span>{item.title}</span>
                      <ChevronDown size={18} className={`${openDropdown === item.title ? 'rotate-180' : ''} transition-transform`} />
                    </button>
                    {openDropdown === item.title && (
                      <div className="ml-6 pl-2 border-l-2 border-purple-100 my-1">
                        {item.submenu.map((sub, subIndex) => (
                          <Link
                            key={subIndex}
                            to={sub.path || "#"}
                            className="block px-4 py-2.5 text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all text-sm"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path || "#"}
                    className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}

            {isLoggedIn && (
              <>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <p className="px-4 py-2 text-xs text-gray-500 font-semibold uppercase">My Account</p>
                  {loggedInItems.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="text-purple-600">
                        {item.icon}
                      </div>
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-white text-red-500 hover:bg-red-100 rounded-lg transition-all font-medium mt-1 border border-gray-200 dark:bg-white dark:text-red-500 dark:hover:bg-red-100"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}

            {!isLoggedIn && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800 transition-all font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Login</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </header>
  );
};

export default Header;
>>>>>>> 8eae28e343f541fd0ab3a7c8751536852f82efd6
