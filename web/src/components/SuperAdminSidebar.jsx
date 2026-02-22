import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  LogOut,
  User,
  FileText,
  Repeat,
  MessageSquare,
  BarChart3,
  Image,
  CalendarDays,
  BookOpen,
  Lightbulb,
  FileSignature,
  Newspaper,
  FileSpreadsheet,
  Briefcase,
  DollarSign,
  Award,
  ChevronDown,
  ChevronRight,
  Video,
  Menu,
  X
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import SidebarItem from './SidebarItem';

const SuperAdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    knowledgeHub: false,
  });

  const unreadMessageCount = useSelector(state => state.ui.unreadMessageCount);

  const isKnowledgeHubActive = [
    "/superadmin/datasets",
    "/superadmin/infographics",
    "/superadmin/gallery",
    "/superadmin/knowledge",
    "/superadmin/research"
  ].includes(location.pathname);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logout());
      alert("Logged out successfully!");
      navigate("/login");
    }
  };

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setExpandedMenus({ knowledgeHub: false });
    }
  };

  return (
    <div className={`flex flex-col bg-gray-900 text-white h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header */}
      <div className={`p-6 border-b border-gray-700 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="cursor-pointer" onClick={() => navigate("/superadmin/dashboard")}>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-xs text-gray-400 mt-1">Management Dashboard</p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors text-black"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Scrollable Menu */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#4B5563 #111827" }}
      >
        <style>{`
          .flex-1::-webkit-scrollbar { width: 5px; }
          .flex-1::-webkit-scrollbar-track { background: #111827; }
          .flex-1::-webkit-scrollbar-thumb {
            background: #4B5563; border-radius: 10px;
          }
          .flex-1::-webkit-scrollbar-thumb:hover { background: #6B7280; }
        `}</style>

        <nav>
          {/* MAIN */}
          <SidebarSection title="Main" isCollapsed={isCollapsed}>
            <SidebarItem icon={<User size={18} />} label="My Profile" to="/superadmin/profile" isCollapsed={isCollapsed} />
            <SidebarItem icon={<Users size={18} />} label="User Management" to="/superadmin/users" isCollapsed={isCollapsed} />
          </SidebarSection>

          {/* REPORT HANDLING */}
          <SidebarSection title="Report Handling" isCollapsed={isCollapsed}>
            <SidebarItem icon={<FileText size={18} />} label="Report Management" to="/superadmin/reports" isCollapsed={isCollapsed} />
            <SidebarItem 
              icon={<MessageSquare size={18} />} 
              label="Messaging System" 
              to="/superadmin/messages" 
              isCollapsed={isCollapsed}
              badge={unreadMessageCount}
            />
          </SidebarSection>

          {/* CONTENT MANAGEMENT */}
          <SidebarSection title="Content Management" isCollapsed={isCollapsed}>
            <SidebarItem icon={<Image size={18} />} label="Highlights" to="/superadmin/carousel" isCollapsed={isCollapsed} />

            {/* KNOWLEDGE HUB WITH SUBMENU */}
            {!isCollapsed ? (
              <div className="mb-1">
                <button
                  onClick={() => toggleMenu('knowledgeHub')}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isKnowledgeHubActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50" 
                      : "bg-[#111827] text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} />
                    <span>Knowledge Hub</span>
                  </div>
                  {expandedMenus.knowledgeHub ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {expandedMenus.knowledgeHub && (
                  <div className="ml-7 mt-1 space-y-1 border-l border-gray-700 pl-3">
                    <SidebarItem
                      icon={<BarChart3 size={16} />}
                      label="Sex-Disaggregated Data"
                      to="/superadmin/datasets"
                      indent={true}
                      isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                      icon={<Image size={16} />}
                      label="Infographics & Posters"
                      to="/superadmin/infographics"
                      indent={true}
                      isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                      icon={<Image size={16} />}
                      label="Gallery"
                      to="/superadmin/gallery"
                      indent={true}
                      isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                      icon={<Video size={16} />}
                      label="Videos"
                      to="/superadmin/knowledge"
                      indent={true}
                      isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                      icon={<BookOpen size={16} />}
                      label="Research"
                      to="/superadmin/research"
                      indent={true}
                      isCollapsed={isCollapsed}
                    />
                  </div>
                )}
              </div>
            ) : (
              <SidebarItem 
                icon={<BookOpen size={18} />} 
                label="Knowledge Hub" 
                to="/superadmin/datasets" 
                isCollapsed={isCollapsed}
              />
            )}

            <SidebarItem icon={<Newspaper size={18} />} label="News & Announcements" to="/superadmin/news" isCollapsed={isCollapsed} />
            <SidebarItem icon={<Briefcase size={18} />} label="Projects" to="/superadmin/projects" isCollapsed={isCollapsed} />
            <SidebarItem icon={<DollarSign size={18} />} label="Budget & Programs" to="/superadmin/budget" isCollapsed={isCollapsed} />
            <SidebarItem icon={<Award size={18} />} label="Accomplishments" to="/superadmin/accomplishments" isCollapsed={isCollapsed} />
            <SidebarItem icon={<FileText size={18} />} label="Policies & Issuances" to="/superadmin/policies" isCollapsed={isCollapsed} />
            <SidebarItem icon={<FileSpreadsheet size={18} />} label="Organizational Chart" to="/superadmin/organizational" isCollapsed={isCollapsed} />
          </SidebarSection>

          {/* ADMIN TOOLS */}

          <SidebarSection title="Admin Tools">
            <SidebarItem icon={<CalendarDays size={18} />} label="Calendar" to="/superadmin/events" />
            <SidebarItem icon={<Lightbulb size={18} />} label="Suggestion Box" to="/superadmin/suggestions" />
            <SidebarItem icon={<FileSignature size={18} />} label="Documentation Hub" to="/superadmin/documentation" />
            <SidebarItem icon={<DollarSign size={18} />} label="Finance" to="/superadmin/finance" />
          </SidebarSection>
        </nav>
      </div>

      {/* LOGOUT */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-white rounded-lg hover:bg-red-600 transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

const SidebarSection = ({ title, children, isCollapsed = false }) => (
  <div className="mb-6">
    {!isCollapsed && (
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
        {title}
      </h2>
    )}
    <ul className="space-y-1">{children}</ul>
  </div>
);

export default SuperAdminSidebar;