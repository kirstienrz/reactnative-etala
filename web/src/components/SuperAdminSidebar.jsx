
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  Newspaper,
  FileSpreadsheet,
  FileSignature,
  Briefcase,
  DollarSign,
  Award,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

const SuperAdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logout()); // ✅ Clears Redux state and localStorage
      alert("Logged out successfully!");
      navigate("/login"); // ✅ Redirect to login
    }
  };

  return (
    <div className="flex flex-col bg-gray-900 text-white w-64 h-screen">
      {/* Header */}
      <div
        className="p-6 border-b border-gray-700 cursor-pointer"
        onClick={() => navigate("/superadmin/dashboard")}
      >
        <h1 className="text-xl font-bold text-white">SuperAdmin Panel</h1>
        <p className="text-xs text-gray-400 mt-1">Management Dashboard</p>
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
          <SidebarSection title="Main">
            <SidebarItem icon={<User size={18} />} label="My Profile" to="/superadmin/profile" />
            <SidebarItem icon={<Users size={18} />} label="User Management" to="/superadmin/users" />
          </SidebarSection>

          {/* REPORT HANDLING */}
          <SidebarSection title="Report Handling">
            <SidebarItem icon={<FileText size={18} />} label="Report Management" to="/superadmin/reports" />
            <SidebarItem icon={<Repeat size={18} />} label="Referral & Assignment" to="/superadmin/referral" />
            <SidebarItem icon={<MessageSquare size={18} />} label="Messaging System" to="/superadmin/messages" />
          </SidebarSection>

          {/* CONTENT MANAGEMENT */}
          <SidebarSection title="Content Management">
            <SidebarItem icon={<Image size={18} />} label="Carousel" to="/superadmin/carousel" />
            <SidebarItem icon={<BookOpen size={18} />} label="Knowledge Hub" to="/superadmin/knowledge" />
            <SidebarItem icon={<Newspaper size={18} />} label="News & Announcements" to="/superadmin/news" />
            <SidebarItem icon={<Briefcase size={18} />} label="Projects" to="/superadmin/projects" />
            <SidebarItem icon={<DollarSign size={18} />} label="Budget & Programs" to="/superadmin/budget" />
            <SidebarItem icon={<BarChart3 size={18} />} label="Infographics" to="/superadmin/infographics" />
            <SidebarItem icon={<Award size={18} />} label="Accomplishments" to="/superadmin/accomplishments" />
            <SidebarItem icon={<FileText size={18} />} label="Policies & Issuances" to="/superadmin/policies" />

          </SidebarSection>

          {/* ADMIN TOOLS */}
          <SidebarSection title="Admin Tools">
            <SidebarItem icon={<CalendarDays size={18} />} label="Calendar" to="/superadmin/events" />
            <SidebarItem icon={<Lightbulb size={18} />} label="Suggestion Box" to="/superadmin/suggestions" />
            {/* <SidebarItem icon={<FileSpreadsheet size={18} />} label="Export Reports" to="/superadmin/exports" /> */}
            <SidebarItem icon={<FileSignature size={18} />} label="Templates" to="/superadmin/templates" />

          </SidebarSection>
        </nav>
      </div>

      {/* LOGOUT */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

// Reusable components
const SidebarItem = ({ icon, label, to }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  </li>
);

const SidebarSection = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
      {title}
    </h2>
    <ul className="space-y-1">{children}</ul>
  </div>
);

export default SuperAdminSidebar;
