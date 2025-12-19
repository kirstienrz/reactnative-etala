import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  User,
  Users,
  FileText,
  Repeat,
  MessageSquare,
  BarChart3,
  FileSpreadsheet,
  FileSignature,
  LogOut,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

const roleColors = {
  osa: {
    sidebarBg: "bg-blue-900",
    active: "bg-blue-800 shadow-blue-800/50",
    hover: "hover:bg-blue-800",
  },
  hr: {
    sidebarBg: "bg-teal-900",
    active: "bg-teal-800 shadow-teal-800/50",
    hover: "hover:bg-teal-800",
  },
  depthead: {
    sidebarBg: "bg-purple-900",
    active: "bg-purple-800 shadow-purple-800/50",
    hover: "hover:bg-purple-800",
  },
};


const AdminSidebar = ({ role, userName }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logout());
      alert("Logged out successfully!");
      navigate("/login");
    }
  };

  const colors = roleColors[role] || roleColors.osa;

  const menuSections = {
    osa: [
      { title: "Main", items: [
        { icon: <User size={18} />, label: "Dashboard", to: "/admin/dashboard" },
        { icon: <User size={18} />, label: "Profile", to: "/admin/profile" },
        { icon: <User size={18} />, label: "Inbox", to: "/admin/Inbox" },
      ]},
      { title: "Reports", items: [
        { icon: <Repeat size={18} />, label: "Referred Cases", to: "/admin/cases" },
        { icon: <MessageSquare size={18} />, label: "Notifications", to: "/admin/notifications" },
      ]},
      { title: "Analytics", items: [
        { icon: <BarChart3 size={18} />, label: "Analytics", to: "/admin/analytics" },
      ]},
      { title: "Admin Tools", items: [
        { icon: <FileSpreadsheet size={18} />, label: "Audit Logs", to: "/admin/audit-logs" },
        { icon: <FileSignature size={18} />, label: "Settings", to: "/admin/settings" },
      ]},
    ],
    hr: [
      { title: "Main", items: [
        { icon: <User size={18} />, label: "Dashboard", to: "/admin/dashboard" },
        { icon: <User size={18} />, label: "Profile", to: "/admin/profile" },
        { icon: <User size={18} />, label: "Inbox", to: "/admin/Inbox" },
      ]},
      { title: "Reports", items: [
        { icon: <Repeat size={18} />, label: "Referred Cases", to: "/admin/cases" },
        { icon: <MessageSquare size={18} />, label: "Notifications", to: "/admin/notifications" },
      ]},
      { title: "Analytics", items: [
        { icon: <BarChart3 size={18} />, label: "Analytics", to: "/admin/analytics" },
      ]},
      { title: "Admin Tools", items: [
        { icon: <FileSpreadsheet size={18} />, label: "Audit Logs", to: "/admin/audit-logs" },
        { icon: <FileSignature size={18} />, label: "Settings", to: "/admin/settings" },
      ]},
    ],
    depthead: [
      { title: "Main", items: [
        { icon: <User size={18} />, label: "Dashboard", to: "/admin/dashboard" },
        { icon: <User size={18} />, label: "Profile", to: "/admin/profile" },
        { icon: <User size={18} />, label: "Inbox", to: "/admin/Inbox" },
      ]},
      { title: "Reports", items: [
        { icon: <Repeat size={18} />, label: "Referred Cases", to: "/admin/cases" },
        { icon: <MessageSquare size={18} />, label: "Notifications", to: "/admin/notifications" },
      ]},
      { title: "Analytics", items: [
        { icon: <BarChart3 size={18} />, label: "Analytics", to: "/admin/analytics" },
      ]},
      { title: "Admin Tools", items: [
        { icon: <FileSpreadsheet size={18} />, label: "Audit Logs", to: "/admin/audit-logs" },
        { icon: <FileSignature size={18} />, label: "Settings", to: "/admin/settings" },
      ]},
    ],
  };

  return (
    <div className={`flex flex-col text-white w-64 h-screen ${colors.sidebarBg}`}>
      {/* Header */}
      <div
        className="p-6 border-b border-gray-700 cursor-pointer"
        onClick={() => navigate("/admin/dashboard")}
      >
        <h1 className="text-xl font-bold">{role.toUpperCase()} Panel</h1>
        <p className="text-xs text-gray-200 mt-1">{userName}</p>
      </div>

      {/* Scrollable Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav>
          {menuSections[role]?.map((section, i) => (
            <SidebarSection key={i} title={section.title}>
              {section.items.map((item) => (
                <SidebarItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  colors={colors}
                />
              ))}
            </SidebarSection>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg 
            text-gray-600 
            hover:bg-red-600 hover:text-white 
            transition-colors duration-200`}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, to, colors }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? `${colors.active} text-white shadow-lg`
            : `text-gray-200 ${colors.hover}`
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
    <h2 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3 px-3">
      {title}
    </h2>
    <ul className="space-y-1">{children}</ul>
  </div>
);

export default AdminSidebar;
