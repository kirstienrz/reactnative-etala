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

  const effectiveRole = (user?.role || role)?.toLowerCase();
  const effectiveDepartment = (user?.department || department)?.toLowerCase();

  const isSuperAdmin = effectiveRole === "superadmin";
  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");

  // Check if current route is user chat details
  const isUserChatRoute = location.pathname === "/user/chat";

  // Call useUnreadMessages only for superadmin routes
  useUnreadMessages(isSuperAdmin || isSuperAdminRoute);

  // ================= SUPER ADMIN LAYOUT =================
  if (isSuperAdmin || isSuperAdminRoute) {
    return (
      <div className="flex h-screen w-screen overflow-hidden">
        <SuperAdminSidebar userName={user?.name} />
        <main className="flex-1 bg-white p-6 overflow-y-auto">
          {children}
        </main>
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