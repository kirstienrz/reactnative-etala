// components/AdminSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/students", label: "Students", icon: "🎓" },
    { path: "/admin/cases", label: "Cases", icon: "📋" },
    { path: "/admin/reports", label: "Reports", icon: "📈" },
  ];

  return (
    <aside className="sidebar admin-sidebar">
      <div className="sidebar-header">
        <h3>Administrator</h3>
        <p>Management Access</p>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;