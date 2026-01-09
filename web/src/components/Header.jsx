import React, { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, LayoutDashboard, FileText, Inbox, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, role } = useSelector((state) => state.auth);

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
    dispatch(logout());
    navigate("/");
  };

  const menuItems = [
    {
      title: 'About',
      submenu: [
        { title: 'Mission & Vision', path: '/Mission-Vision' },
        { title: 'Organizational Structure', path: '/Organization' },
        { title: 'Accomplishments', path: '/Accomplishment' }
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
        { title: 'Infographics', path: '/Infographics' },
        { title: 'Brochures', path: '/Brochures' },
        { title: 'Pictures', path: '/Pictures' },
        { title: 'Videos', path: '/Knowledge' },
        { title: 'Posters', path: '/Posters' },
        { title: 'Research', path: '/Research' },

      ]
    },
    {
      title: 'Resources',
      submenu: [
        { title: 'Policies', path: '/Policies' },
        { title: 'Plan and Budget', path: '/PlanAndBudget' },
        { title: 'Accomplishment Report', path: '/AccomplishmentReport' },
        { title: 'Suggestion Box', path: '/SuggestionBox' }

        // { title: 'Committee Report', path: '/CommitteeReport' }
      ]
    },
    {
      title: 'Etala',
      path: '/login',
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
    { title: "Reports", path: "/user/reports", icon: <FileText size={16} /> },
    { title: "Inbox", path: "/user/inbox", icon: <Inbox size={16} /> },
    { title: "My Profile", path: "/user/profile", icon: <User size={16} /> },
  ];

  const toggleMobileDropdown = (title) => {
    setOpenDropdown(openDropdown === title ? '' : title);
  };

  return (
    <header className="sticky top-0 z-[9999]">
      {/* Top Bar */}
      <div className="bg-purple-900 text-white py-2 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Republic of the Philippines</span>
          <div className="hidden md:flex gap-4">
            <a href="#transparency" className="hover:text-purple-200 transition-colors no-underline">Transparency Seal</a>
            <a href="#foi" className="hover:text-purple-200 transition-colors no-underline">FOI</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
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
              <h1 className="text-xl font-bold text-purple-900 group-hover:text-purple-700 transition-colors">
                Gender and Development Office
              </h1>
              <p className="text-sm text-gray-600">
                Technological University of the Philippines - Taguig
              </p>
            </div>
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors"
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
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all font-medium"
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
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium"
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
                      className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all font-medium"
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
                  className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-all font-medium mt-1"
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
    </header>
  );
};

export default Header;