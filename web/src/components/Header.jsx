// import React, { useState } from "react";
// import { Menu, X, ChevronDown } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../store/authSlice";

// const Header = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [openDropdown, setOpenDropdown] = useState('');
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { isLoggedIn, role } = useSelector((state) => state.auth);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/");
//   };

//   const menuItems = [
//     {
//       title: 'About GAD',
//       submenu: ['Mission & Vision', 'Organizational Structure', 'GAD Committee', 'Accomplishments']
//     },
//     {
//       title: 'Policies',
//       submenu: ['Circulars', 'Resolutions', 'Memorandan', 'Office Order']
//     },
//     {
//       title: 'Programs',
//       submenu: ['Workshops', 'Seminars', 'Advocacy', 'Student Programs']
//     },
//     {
//       title: 'Resources',
//       submenu: ['Handbook', 'Knowledge Hub', 'Suggestion Box']
//     },
//     {
//       title: 'Contact',
//       submenu: []
//     }
//   ];

//   const dashboardLink =
//     role === "superadmin"
//       ? "/superadmin/dashboard"
//       : role === "admin"
//         ? "/admin/dashboard"
//         : role === "user"
//           ? "/user/dashboard"
//           : null;

//   return (
//     <header className="sticky top-0 z-[9999]">
//       <div className="relative bg-gradient-to-r from-violet-800 via-violet-700 to-violet-800">
//         {/* Background visuals */}
//         <div className="absolute inset-0 opacity-10 pointer-events-none">
//           <div className="absolute top-0 left-0 w-96 h-96 bg-violet-400 rounded-full blur-3xl"></div>
//           <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500 rounded-full blur-3xl"></div>
//         </div>

//         <div className="relative max-w-7xl mx-auto px-8 py-4 z-50">
//           <div className="flex justify-between items-center">
//             {/* Logo */}
//             <div className="flex items-center gap-3">
//               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
//                 <img 
//                   src="/assets/logo.jpg" 
//                   alt="GAD Logo" 
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-white tracking-wide">GAD PORTAL</h1>
//                 <p className="text-xs text-violet-100">TUP Taguig - Gender and Development Office</p>
//               </div>
//             </div>

//             {/* Hamburger for mobile */}
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="md:hidden text-white z-[10000]"
//             >
//               {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
//             </button>

//             {/* Desktop Navigation */}
//             <div className="hidden md:flex items-center gap-7 relative z-[60]">
//               <nav>
//                 <ul className="flex gap-2">
//                   {menuItems.map((item, index) => (
//                     <li
//                       key={index}
//                       className="relative group"
//                       onMouseEnter={() => setOpenDropdown(item.title)}
//                       onMouseLeave={() => setOpenDropdown('')}
//                     >
//                       <a
//                         href={`#${item.title.toLowerCase().replace(' ', '-')}`}
//                         className="flex items-center gap-1 px-4 py-2 font-medium text-white hover:bg-white/20 rounded-lg transition-all no-underline hover:text-white"
//                       >
//                         {item.title}
//                         {item.submenu.length > 0 && <ChevronDown size={16} />}
//                       </a>

//                       {item.submenu.length > 0 && (
//                         <ul
//                           className={`absolute top-full left-0 mt-2 bg-white border border-violet-100 shadow-xl rounded-lg py-2 w-52 transition-all duration-200 z-[99999] ${openDropdown === item.title
//                               ? 'opacity-100 visible translate-y-0'
//                               : 'opacity-0 invisible -translate-y-2'
//                             }`}
//                         >
//                           {item.submenu.map((subitem, subindex) => (
//                             <li key={subindex}>
//                               <a
//                                 href={`#${subitem.toLowerCase().replace(/\s+/g, '-')}`}
//                                 className="block px-4 py-2 text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors no-underline"
//                               >
//                                 {subitem}
//                               </a>
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                     </li>
//                   ))}
//                 </ul>
//               </nav>

//               {/* Auth Section */}
//               <div className="flex items-center gap-4 text-sm border-l border-violet-400 pl-6">
//                 {!isLoggedIn ? (
//                   <Link
//                     to="/login"
//                     className="text-white hover:text-white hover:bg-white/20 px-3 py-1 rounded-lg transition-all font-medium no-underline"
//                   >
//                     Login
//                   </Link>
//                 ) : (
//                   <>
//                     {dashboardLink && (
//                       <Link
//                         to={dashboardLink}
//                         className="text-white hover:text-white hover:bg-white/20 px-3 py-1 rounded-lg transition-all font-medium no-underline"
//                       >
//                         Dashboard
//                       </Link>
//                     )}
//                     <button
//                       onClick={handleLogout}
//                       className="text-white bg-violet-600 hover:bg-violet-700 px-3 py-1 rounded-lg transition-all font-medium"
//                     >
//                       Logout
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Dropdown */}
//       {isMenuOpen && (
//         <div className="md:hidden bg-violet-700 border-t border-violet-600 z-[9999] relative">
//           <nav className="max-w-7xl mx-auto px-8 py-4">
//             <ul className="flex flex-col gap-3">
//               {menuItems.map((item, index) => (
//                 <li key={index}>
//                   <a
//                     href={`#${item.title.toLowerCase().replace(' ', '-')}`}
//                     className="block font-semibold text-white py-2 hover:bg-white/20 rounded-lg px-2 transition-all no-underline hover:text-white"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     {item.title}
//                   </a>
//                 </li>
//               ))}
//               <li className="mt-4 border-t border-violet-600 pt-3">
//                 {!isLoggedIn ? (
//                   <Link
//                     to="/login"
//                     className="block text-white font-medium hover:bg-white/20 rounded-lg px-2 py-2 no-underline"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     Login
//                   </Link>
//                 ) : (
//                   <>
//                     {dashboardLink && (
//                       <Link
//                         to={dashboardLink}
//                         className="block text-white font-medium hover:bg-white/20 rounded-lg px-2 py-2 mb-2 no-underline"
//                         onClick={() => setIsMenuOpen(false)}
//                       >
//                         Dashboard
//                       </Link>
//                     )}
//                     <button
//                       onClick={() => {
//                         handleLogout();
//                         setIsMenuOpen(false);
//                       }}
//                       className="block w-full text-left text-white font-medium hover:bg-white/20 rounded-lg px-2 py-2"
//                     >
//                       Logout
//                     </button>
//                   </>
//                 )}
//               </li>
//             </ul>
//           </nav>
//         </div>
//       )}
//     </header>
//   );
// };

// export default Header;

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
     title: 'About',
    submenu: [
      { title: 'Mission & Vision', path: '/Mission-Vision' },
      { title: 'Organizational Structure', path: '/Organization' },
      { title: 'Accomplishments', path: '/Accomplishment' }
    ]
  },
  {
    title: 'Programs & Policies',
    submenu: [
      { title: 'Policies', path: '/Policies' },
      { title: 'Plan and Budget', path: '/PlanAndBudget' },
      { title: 'Committee Report', path: '/CommitteeReport' }
    ]
  },
  {
    title: 'Projects',
    path: '/Projects',
    submenu: []
  },
  {
    title: 'Resources',
    submenu: [
      { title: 'Handbook', path: '/Handbook' },
      { title: 'Knowledge Hub', path: '/Knowledge' },
      { title: 'Infographics', path: '/Infographics' },
      { title: 'Suggestion Box', path: '/SuggestionBox' }
    ]
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
      {/* Top Header Bar - Government Style */}
      <div className="bg-purple-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs">
          <div className="flex items-center gap-4">
            <span>Republic of the Philippines</span>
            <span className="text-purple-300">|</span>
            <span>All content is in the public domain unless otherwise stated.</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="#transparency" className="hover:text-purple-200 transition-colors no-underline">
              Transparency Seal
            </a>
            <a href="#foi" className="hover:text-purple-200 transition-colors no-underline">
              FOI
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <Link to="/" className="flex items-center gap-4 no-underline group">
              <div className="w-14 h-14 flex-shrink-0 overflow-hidden">
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

            {/* Hamburger for mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <nav>
                <ul className="flex items-center gap-1">
                  {menuItems.map((item, index) => (
                    <li
                      key={index}
                      className="relative group"
                      onMouseEnter={() => setOpenDropdown(item.title)}
                      onMouseLeave={() => setOpenDropdown('')}
                    >
                     <a
                        href={item.path ? item.path : `#${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded transition-all font-medium no-underline"
                      >
                        {item.title}
                        {item.submenu.length > 0 && (
                          <ChevronDown 
                            size={16} 
                            className={`transition-transform ${openDropdown === item.title ? 'rotate-180' : ''}`}
                          />
                        )}
                      </a>

                      {item.submenu.length > 0 && (
                        <ul
                          className={`absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded py-2 w-56 transition-all duration-200 ${
                            openDropdown === item.title
                              ? 'opacity-100 visible translate-y-0'
                              : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                          }`}
                        >
                          {item.submenu.map((subitem, subindex) => (
                            <li key={subindex}>
                              <a
                                href={subitem.path ? subitem.path : `#${subitem.title.toLowerCase().replace(/\s+/g, '-')}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors no-underline"
                              >
                                {subitem.title}
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
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-300">
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 px-4 py-2 rounded transition-all font-medium no-underline"
                  >
                    Login
                  </Link>
                ) : (
                  <>
                    {dashboardLink && (
                      <Link
                        to={dashboardLink}
                        className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 px-4 py-2 rounded transition-all font-medium no-underline"
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-white bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded transition-all font-medium"
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            <ul className="flex flex-col gap-1">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <div>
                    <a
                      href={`#${item.title.toLowerCase().replace(' ', '-')}`}
                      className="flex items-center justify-between font-semibold text-gray-800 py-3 px-3 hover:bg-purple-50 hover:text-purple-700 rounded transition-all no-underline"
                      onClick={() => {
                        if (item.submenu.length === 0) {
                          setIsMenuOpen(false);
                        }
                      }}
                    >
                      {item.title}
                      {item.submenu.length > 0 && (
                        <ChevronDown 
                          size={16}
                          className={`transition-transform ${
                            openDropdown === item.title ? 'rotate-180' : ''
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === item.title ? '' : item.title);
                          }}
                        />
                      )}
                    </a>
                    
                    {/* Mobile Submenu */}
                    {item.submenu.length > 0 && openDropdown === item.title && (
                      <ul className="pl-6 mt-1 mb-2 space-y-1">
                        {item.submenu.map((subitem, subindex) => (
                          <li key={subindex}>
                            <a
                              href={`#${subitem.toLowerCase().replace(/\s+/g, '-')}`}
                              className="block text-sm text-gray-600 py-2 px-3 hover:bg-purple-50 hover:text-purple-700 rounded transition-colors no-underline"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {subitem}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
              
              {/* Mobile Auth Section */}
              <li className="mt-4 pt-4 border-t border-gray-200">
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    className="block text-center text-white bg-purple-700 hover:bg-purple-800 rounded px-4 py-3 font-medium no-underline transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                ) : (
                  <div className="space-y-2">
                    {dashboardLink && (
                      <Link
                        to={dashboardLink}
                        className="block text-center text-gray-700 bg-purple-50 hover:bg-purple-100 rounded px-4 py-3 font-medium no-underline transition-colors"
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
                      className="block w-full text-center text-white bg-purple-700 hover:bg-purple-800 rounded px-4 py-3 font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
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