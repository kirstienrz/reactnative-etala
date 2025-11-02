
// import React from "react";
// import {
//   LayoutDashboard,
//   Users,
//   LogOut,
//   User,
//   FileText,
//   Repeat,
//   MessageSquare,
//   BarChart3,
//   Image,
//   CalendarDays,
//   BookOpen,
//   Lightbulb,
//   Newspaper,
//   FileSpreadsheet,
//   FileSignature,
//   Briefcase,
//   DollarSign,
// } from "lucide-react";

// const SuperAdminSidebar = ({ activePage, onNavigate }) => {
//   return (
//     <div className="flex flex-col bg-gray-900 text-white w-64 h-screen">
//       {/* Header */}
//       <div className="p-6 border-b border-gray-700">
//         <h1 className="text-xl font-bold text-white">SuperAdmin Panel</h1>
//         <p className="text-xs text-gray-400 mt-1">Management Dashboard</p>
//       </div>

//       {/* Scrollable Menu Section */}
//       <div 
//         className="flex-1 overflow-y-auto px-3 py-4"
//         style={{
//           scrollbarWidth: 'thin',
//           scrollbarColor: '#4B5563 #111827'
//         }}
//       >
//         <style>{`
//           .flex-1::-webkit-scrollbar {
//             width: 5px;
//           }
//           .flex-1::-webkit-scrollbar-track {
//             background: #111827;
//           }
//           .flex-1::-webkit-scrollbar-thumb {
//             background: #4B5563;
//             border-radius: 10px;
//           }
//           .flex-1::-webkit-scrollbar-thumb:hover {
//             background: #6B7280;
//           }
//         `}</style>

//         <nav>
//           {/* Main Section */}
//           <div className="mb-6">
//             <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
//               Main
//             </h2>
//             <ul className="space-y-1">
//               <SidebarItem
//                 icon={<User size={18} />}
//                 label="My Profile"
//                 page="profile"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//               <SidebarItem
//                 icon={<Users size={18} />}
//                 label="User Management"
//                 page="user-management"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//             </ul>
//           </div>

//           {/* Report Handling */}
//           <div className="mb-6">
//             <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
//               Report Handling
//             </h2>
//             <ul className="space-y-1">
//               <SidebarItem
//                 icon={<FileText size={18} />}
//                 label="Report Management"
//                 page="reports"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//               <SidebarItem
//                 icon={<Repeat size={18} />}
//                 label="Referral & Assignment"
//                 page="referral"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//               <SidebarItem
//                 icon={<MessageSquare size={18} />}
//                 label="Messaging System"
//                 page="messages"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//               <SidebarItem
//                 icon={<BarChart3 size={18} />}
//                 label="Monitoring & Analytics"
//                 page="analytics"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//             </ul>
//           </div>

//           {/* Content Management */}
//           <div className="mb-6">
//             <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
//               Content Management
//             </h2>
//             <ul className="space-y-1">
//               <SidebarItem
//                 icon={<Image size={18} />}
//                 label="Carousel"
//                 page="carousel"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//               <SidebarItem
//                 icon={<CalendarDays size={18} />}
//                 label="Events"
//                 page="events"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//               <SidebarItem
//                 icon={<BookOpen size={18} />}
//                 label="Knowledge Hub"
//                 page="knowledge"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//               <SidebarItem
//                 icon={<Lightbulb size={18} />}
//                 label="Suggestion Box"
//                 page="suggestions"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//               <SidebarItem
//                 icon={<Newspaper size={18} />}
//                 label="News & Announcements"
//                 page="news"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//             </ul>
//           </div>

//           {/* Admin Tools */}
//           <div className="mb-6">
//             <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
//               Admin Tools
//             </h2>
//             <ul className="space-y-1">
//               <SidebarItem
//                 icon={<FileSpreadsheet size={18} />}
//                 label="Export Reports"
//                 page="exports"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//               <SidebarItem
//                 icon={<FileSignature size={18} />}
//                 label="Templates"
//                 page="templates"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//               <SidebarItem
//                 icon={<Briefcase size={18} />}
//                 label="Projects & Activities"
//                 page="projects"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//               <SidebarItem
//                 icon={<DollarSign size={18} />}
//                 label="Budget & Programs"
//                 page="budget"
//                 activePage={activePage}
//                 onNavigate={onNavigate}
//               />
//             </ul>
//           </div>
//         </nav>
//       </div>

//       {/* Logout Section */}
//       <div className="border-t border-gray-700 p-4">
//         <button
//           onClick={() => onNavigate("logout")}
//           className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
//         >
//           <LogOut size={18} />
//           <span>Logout</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// // Reusable Sidebar Item Component
// const SidebarItem = ({ icon, label, page, activePage, onNavigate }) => (
//   <li
//     className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 ${
//       activePage === page 
//         ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50" 
//         : "text-gray-300 hover:bg-gray-800 hover:text-white"
//     }`}
//     onClick={() => onNavigate(page)}
//   >
//     {icon}
//     <span>{label}</span>
//   </li>
// );

// export default SuperAdminSidebar;


// import React, { useState } from "react";
// import {
//   LayoutDashboard,
//   Users,
//   LogOut,
//   User,
//   FileText,
//   Repeat,
//   MessageSquare,
//   BarChart3,
//   Image,
//   CalendarDays,
//   BookOpen,
//   Lightbulb,
//   Newspaper,
//   FileSpreadsheet,
//   FileSignature,
//   Briefcase,
//   DollarSign,
// } from "lucide-react";

// // Import your pages here
// import SuperAdminDashboard from "../pages/superadmin/Dashboard";
// import ProfilePage from "../pages/superadmin/Profile";
// import UserManagementPage from "../pages/superadmin/UserManagement";
// import ReportsPage from "../pages/superadmin/Reports";
// import ReferralPage from "../pages/superadmin/Referral";
// import MessagesPage from "../pages/superadmin/Messages";
// import AnalyticsPage from "../pages/superadmin/Analytics";
// import CarouselPage from "../pages/superadmin/Carousel";
// import EventsPage from "../pages/superadmin/Events";
// import KnowledgeHubPage from "../pages/superadmin/KnowledgeHub";
// import SuggestionsPage from "../pages/superadmin/Suggestions";
// import NewsPage from "../pages/superadmin/News";
// import ExportsPage from "../pages/superadmin/Exports";
// import TemplatesPage from "../pages/superadmin/Templates";
// import ProjectsPage from "../pages/superadmin/Projects";
// import BudgetPage from "../pages/superadmin/Budget";

// const SuperAdminSidebar = () => {
//   const [activePage, setActivePage] = useState("dashboard");

//   // Page mapping - Just add your component here!
//   const pages = {
//     dashboard: <SuperAdminDashboard />,
//     profile: <ProfilePage />,
//     "user-management": <UserManagementPage />,
//     reports: <ReportsPage />,
//     referral: <ReferralPage />,
//     messages: <MessagesPage />,
//     analytics: <AnalyticsPage />,
//     carousel: <CarouselPage />,
//     events: <EventsPage />,
//     knowledge: <KnowledgeHubPage />,
//     suggestions: <SuggestionsPage />,
//     news: <NewsPage />,
//     exports: <ExportsPage />,
//     templates: <TemplatesPage />,
//     projects: <ProjectsPage />,
//     budget: <BudgetPage />,
//   };

//   const handleNavigation = (page) => {
//     if (page === "logout") {
//       if (window.confirm("Are you sure you want to logout?")) {
//         console.log("Logging out...");
//         alert("Logged out successfully!");
//       }
//     } else {
//       setActivePage(page);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className="flex flex-col bg-gray-900 text-white w-64 h-screen">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-700">
//           <h1 className="text-xl font-bold text-white">SuperAdmin Panel</h1>
//           <p className="text-xs text-gray-400 mt-1">Management Dashboard</p>
//         </div>

//         {/* Scrollable Menu Section */}
//         <div 
//           className="flex-1 overflow-y-auto px-3 py-4"
//           style={{
//             scrollbarWidth: 'thin',
//             scrollbarColor: '#4B5563 #111827'
//           }}
//         >
//           <style>{`
//             .flex-1::-webkit-scrollbar {
//               width: 5px;
//             }
//             .flex-1::-webkit-scrollbar-track {
//               background: #111827;
//             }
//             .flex-1::-webkit-scrollbar-thumb {
//               background: #4B5563;
//               border-radius: 10px;
//             }
//             .flex-1::-webkit-scrollbar-thumb:hover {
//               background: #6B7280;
//             }
//           `}</style>

//           <nav>
//             {/* Main Section */}
//             <div className="mb-6">
//               <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
//                 Main
//               </h2>
//               <ul className="space-y-1">
//                 <SidebarItem
//                   icon={<User size={18} />}
//                   label="My Profile"
//                   page="profile"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//                 <SidebarItem
//                   icon={<Users size={18} />}
//                   label="User Management"
//                   page="user-management"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//               </ul>
//             </div>

//             {/* Report Handling */}
//             <div className="mb-6">
//               <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
//                 Report Handling
//               </h2>
//               <ul className="space-y-1">
//                 <SidebarItem
//                   icon={<FileText size={18} />}
//                   label="Report Management"
//                   page="reports"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//                 <SidebarItem
//                   icon={<Repeat size={18} />}
//                   label="Referral & Assignment"
//                   page="referral"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//                 <SidebarItem
//                   icon={<MessageSquare size={18} />}
//                   label="Messaging System"
//                   page="messages"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//                 <SidebarItem
//                   icon={<BarChart3 size={18} />}
//                   label="Monitoring & Analytics"
//                   page="analytics"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//               </ul>
//             </div>

//             {/* Content Management */}
//             <div className="mb-6">
//               <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
//                 Content Management
//               </h2>
//               <ul className="space-y-1">
//                 <SidebarItem
//                   icon={<Image size={18} />}
//                   label="Carousel"
//                   page="carousel"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//                 <SidebarItem
//                   icon={<CalendarDays size={18} />}
//                   label="Events"
//                   page="events"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//                 <SidebarItem
//                   icon={<BookOpen size={18} />}
//                   label="Knowledge Hub"
//                   page="knowledge"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//                 <SidebarItem
//                   icon={<Lightbulb size={18} />}
//                   label="Suggestion Box"
//                   page="suggestions"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//                 <SidebarItem
//                   icon={<Newspaper size={18} />}
//                   label="News & Announcements"
//                   page="news"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//               </ul>
//             </div>

//             {/* Admin Tools */}
//             <div className="mb-6">
//               <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
//                 Admin Tools
//               </h2>
//               <ul className="space-y-1">
//                 <SidebarItem
//                   icon={<FileSpreadsheet size={18} />}
//                   label="Export Reports"
//                   page="exports"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//                 <SidebarItem
//                   icon={<FileSignature size={18} />}
//                   label="Templates"
//                   page="templates"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//                 <SidebarItem
//                   icon={<Briefcase size={18} />}
//                   label="Projects & Activities"
//                   page="projects"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//                 <SidebarItem
//                   icon={<DollarSign size={18} />}
//                   label="Budget & Programs"
//                   page="budget"
//                   activePage={activePage}
//                   onNavigate={handleNavigation}
//                 />
//               </ul>
//             </div>
//           </nav>
//         </div>

//         {/* Logout Section */}
//         <div className="border-t border-gray-700 p-4">
//           <button
//             onClick={() => handleNavigation("logout")}
//             className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
//           >
//             <LogOut size={18} />
//             <span>Logout</span>
//           </button>
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <main className="flex-1 overflow-y-auto p-8">
//         {pages[activePage] || pages.dashboard}
//       </main>
//     </div>
//   );
// };

// // Reusable Sidebar Item Component
// const SidebarItem = ({ icon, label, page, activePage, onNavigate }) => (
//   <li
//     className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 ${
//       activePage === page 
//         ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50" 
//         : "text-gray-300 hover:bg-gray-800 hover:text-white"
//     }`}
//     onClick={() => onNavigate(page)}
//   >
//     {icon}
//     <span>{label}</span>
//   </li>
// );

// export default SuperAdminSidebar;
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
    <div className="p-6 border-b border-gray-700">
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
          <SidebarItem icon={<BarChart3 size={18} />} label="Monitoring & Analytics" to="/superadmin/analytics" />
        </SidebarSection>

        {/* CONTENT MANAGEMENT */}
        <SidebarSection title="Content Management">
          <SidebarItem icon={<Image size={18} />} label="Carousel" to="/superadmin/carousel" />
          <SidebarItem icon={<CalendarDays size={18} />} label="Events" to="/superadmin/events" />
          <SidebarItem icon={<BookOpen size={18} />} label="Knowledge Hub" to="/superadmin/knowledge" />
          <SidebarItem icon={<Lightbulb size={18} />} label="Suggestion Box" to="/superadmin/suggestions" />
          <SidebarItem icon={<Newspaper size={18} />} label="News & Announcements" to="/superadmin/news" />
        </SidebarSection>

        {/* ADMIN TOOLS */}
        <SidebarSection title="Admin Tools">
          <SidebarItem icon={<FileSpreadsheet size={18} />} label="Export Reports" to="/superadmin/exports" />
          <SidebarItem icon={<FileSignature size={18} />} label="Templates" to="/superadmin/templates" />
          <SidebarItem icon={<Briefcase size={18} />} label="Projects & Activities" to="/superadmin/projects" />
          <SidebarItem icon={<DollarSign size={18} />} label="Budget & Programs" to="/superadmin/budget" />
        </SidebarSection>
      </nav>
    </div>

    {/* LOGOUT */}
    <div className="border-t border-gray-700 p-4">
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
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
