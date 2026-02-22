import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ icon, label, to, indent = false, isCollapsed = false, badge = 0 }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
        } ${indent ? 'ml-2' : ''} ${isCollapsed ? 'justify-center' : ''}`
      }
      title={isCollapsed ? label : ""}
    >
      {/* Icon with dot when collapsed */}
      <div className="relative flex-shrink-0">
        {icon}
        {badge > 0 && isCollapsed && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>

      {/* Label with badge when expanded */}
      {!isCollapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  </li>
);

export default SidebarItem;
