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

const Layout = ({ children }) => {
  const { user, role, department } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
        <SuperAdminSidebar
          userName={user?.name}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header for Admin */}
          <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-gray-900 text-white shadow-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <p className="text-sm font-bold leading-tight">GAD Admin Panel</p>
                <p className="text-[10px] text-gray-400 leading-tight">{user?.name || "Superadmin"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                {(user?.name || "A")[0]}
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

          <main className="flex-1 p-4 md:p-6 pt-2 md:pt-4 overflow-y-auto">
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
      <Footer />
      <MobileBottomNav />
    </>
  );
};


export default Layout;