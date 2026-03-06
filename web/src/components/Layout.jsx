import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import useUnreadMessages from "../hooks/useUnreadMessages";

const Layout = ({ children }) => {
  const { user, role, department } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const effectiveRole = (user?.role || role)?.toLowerCase();
  const effectiveDepartment = (user?.department || department)?.toLowerCase();

  const isSuperAdmin = effectiveRole === "superadmin";
  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");

  // Check if current route is user chat details
  const isUserChatRoute = location.pathname === "/user/chat";

  // Call useUnreadMessages only for superadmin routes
  useUnreadMessages(isSuperAdmin || isSuperAdminRoute);

  // Close sidebar on route change
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // ================= SUPER ADMIN LAYOUT =================
  if (isSuperAdmin || isSuperAdminRoute) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
        <SuperAdminSidebar
          userName={user?.name}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header for Admin */}
          <header className="lg:hidden flex items-center justify-between p-4 bg-gray-900 text-white shadow-md">
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
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
      <main className="min-h-[80vh] bg-gray-50">{children}</main>
      <Footer />
    </>
  );
};


export default Layout;