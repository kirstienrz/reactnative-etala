import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileBottomNav from "../components/MobileBottomNav";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import useUnreadMessages from "../hooks/useUnreadMessages";
import useMessageNotifications from "../hooks/useMessageNotifications";
import NotificationCenter from "./NotificationCenter";
import { Capacitor } from "@capacitor/core";

const getPageInfo = (pathname, userName) => {
  const name = userName || "Admin";
  if (pathname === "/superadmin/dashboard" || pathname === "/superadmin") {
    return { title: "Dashboard", subtitle: `Welcome back, ${name}` };
  }
  if (pathname.startsWith("/superadmin/reports")) {
    return { title: "Reports", subtitle: "Report Management" };
  }
  if (pathname.startsWith("/superadmin/users")) {
    return { title: "Users", subtitle: "User Management" };
  }
  if (pathname.startsWith("/superadmin/messages")) {
    return { title: "Messages", subtitle: "Messaging System" };
  }
  if (pathname.startsWith("/superadmin/profile")) {
    return { title: "Profile", subtitle: "My Profile" };
  }
  if (pathname.startsWith("/superadmin/events")) {
    return { title: "Calendar", subtitle: "Calendar Events" };
  }
  if (pathname.startsWith("/superadmin/suggestions")) {
    return { title: "Suggestions", subtitle: "Suggestion Box" };
  }
  if (pathname.startsWith("/superadmin/documentation")) {
    return { title: "Documentation", subtitle: "Documentation Hub" };
  }
  if (pathname.startsWith("/superadmin/finance")) {
    return { title: "Finance", subtitle: "Finance & Budget" };
  }
  if (pathname.startsWith("/superadmin/carousel")) {
    return { title: "Highlights", subtitle: "Carousel Management" };
  }
  if (pathname.startsWith("/superadmin/datasets")) {
    return { title: "GAD Data", subtitle: "Sex-Disaggregated Data" };
  }
  if (pathname.startsWith("/superadmin/infographics")) {
    return { title: "Infographics", subtitle: "Posters & Infographics" };
  }
  if (pathname.startsWith("/superadmin/gallery")) {
    return { title: "Gallery", subtitle: "Gallery Hub" };
  }
  if (pathname.startsWith("/superadmin/knowledge")) {
    return { title: "Videos", subtitle: "GAD Videos Hub" };
  }
  if (pathname.startsWith("/superadmin/research")) {
    return { title: "Research", subtitle: "Studies & Research" };
  }
  if (pathname.startsWith("/superadmin/news")) {
    return { title: "News", subtitle: "Announcements & News" };
  }
  if (pathname.startsWith("/superadmin/projects")) {
    return { title: "Projects", subtitle: "GAD Projects" };
  }
  if (pathname.startsWith("/superadmin/budget")) {
    return { title: "Budget", subtitle: "Budget & Programs" };
  }
  if (pathname.startsWith("/superadmin/accomplishments")) {
    return { title: "Accomplishments", subtitle: "Milestones & Achievements" };
  }
  if (pathname.startsWith("/superadmin/policies")) {
    return { title: "Policies", subtitle: "GAD Policies & Issuances" };
  }
  if (pathname.startsWith("/superadmin/organizational")) {
    return { title: "Org Chart", subtitle: "Organizational Chart" };
  }
  return { title: "GAD Admin Panel", subtitle: name };
};

const Layout = ({ children }) => {
  const { user, role, department } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const handleOpen = () => setIsSidebarOpen(true);
    const handleClose = () => setIsSidebarOpen(false);
    const handleToggle = () => setIsSidebarOpen(prev => !prev);
    
    window.addEventListener("open-admin-sidebar", handleOpen);
    window.addEventListener("close-admin-sidebar", handleClose);
    window.addEventListener("toggle-admin-sidebar", handleToggle);
    
    return () => {
      window.removeEventListener("open-admin-sidebar", handleOpen);
      window.removeEventListener("close-admin-sidebar", handleClose);
      window.removeEventListener("toggle-admin-sidebar", handleToggle);
    };
  }, []);

  // ✅ Detect if running inside APK (Capacitor) — evaluated after mount
  const [isNativeApp, setIsNativeApp] = React.useState(false);
  React.useEffect(() => {
    try {
      const platform = Capacitor.getPlatform();
      setIsNativeApp(platform === "android" || platform === "ios");
    } catch (e) {
      setIsNativeApp(false);
    }
  }, []);

  // Initialize notifications
  useMessageNotifications();

  const effectiveRole = (user?.role || role)?.toLowerCase();
  const effectiveDepartment = (user?.department || department)?.toLowerCase();

  const isSuperAdmin = effectiveRole === "superadmin";
  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");

  // Check if current route is user chat details
  const isUserChatRoute = location.pathname === "/user/chat";

  // Call useUnreadMessages only for superadmin routes
  useUnreadMessages(isSuperAdmin || isSuperAdminRoute);

  const dispatch = useDispatch();
  
  // Close sidebar on route change
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // ================= IDLE TIMEOUT LOGIC =================
  React.useEffect(() => {
    if (!user) return; // Only track if logged in

    // Set timeout based on role: 1 hour for superadmin, 15 minutes for others
    const TIMEOUT_MS = isSuperAdmin ? 60 * 60 * 1000 : 15 * 60 * 1000;
    let idleTimer;

    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        console.log(`🕒 Idle timeout reached (${TIMEOUT_MS/60000} mins). Logging out...`);
        dispatch(logout());
        window.location.href = "/login"; // Force redirect to login
      }, TIMEOUT_MS);
    };

    // Events to monitor for activity
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    
    // Add event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, isSuperAdmin, dispatch]);

  // ================= SUPER ADMIN LAYOUT =================
  if (isSuperAdminRoute) {
    const pageInfo = getPageInfo(location.pathname, user?.name || user?.firstName);
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
        <SuperAdminSidebar
          userName={user?.name}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header for Admin */}
          <header className="lg:hidden flex items-center justify-between px-4 admin-header-pt pb-4 bg-gray-900 text-white shadow-md border-b border-gray-800 admin-mobile-header">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center text-white active:scale-95 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Page Title (Only on Dashboard) */}
              {(location.pathname === "/superadmin/dashboard" || location.pathname === "/superadmin") && (
                <div>
                  <p className="text-white text-sm font-bold leading-tight">{pageInfo.title}</p>
                  <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">{pageInfo.subtitle}</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden xs:block text-right mr-1">
                <p className="text-white text-xs font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                <p className="text-gray-400 text-[10px]">{new Date().toLocaleDateString('en-US', { weekday: 'short' })}</p>
              </div>
              <NotificationCenter />
              
              {/* Profile Icon on the Right */}
              <div className="w-9 h-9 rounded-full bg-violet-600 border border-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-md ml-1">
                {(user?.name || "A")[0]?.toUpperCase()}
              </div>
            </div>
          </header>

          {/* Desktop Top Bar for Admin */}
          <header className="hidden lg:flex items-center justify-between px-8 py-2 bg-white border-b border-gray-200">
            <div className="flex items-center gap-4">
              {/* Title removed as requested */}
            </div>
            <div className="flex items-center gap-6">
              <NotificationCenter />
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{user?.name || "Admin"}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user?.role || "Superadmin"}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                  {(user?.name || "A")[0]}
                </div>
              </div>
            </div>
          </header>

          <main className={`flex-1 overflow-y-auto ${
            (isNativeApp && (
              location.pathname === "/superadmin/dashboard" || 
              location.pathname === "/superadmin" ||
              location.pathname.startsWith("/superadmin/messages")
            ))
              ? "" 
              : "p-4 md:p-6 pt-2 md:pt-4"
          }`}>
            {children}
          </main>
        </div>
      </div>
    );
  }

  // ================= USER CHAT LAYOUT (FULL SCREEN) =================
  if (isUserChatRoute) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        <Header />
        <main className="flex-1 bg-gray-50 overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  // ================= DEFAULT USER LAYOUT =================
  return (
    <>
      <Header />
      <main className="min-h-[80vh] bg-gray-50 pb-0 sm:pb-0">{children}</main>
      {!isNativeApp && <Footer />}
      <MobileBottomNav />
    </>
  );
};

export default Layout;