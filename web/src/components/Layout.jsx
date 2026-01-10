import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import AdminSidebar from "../components/AdminSidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Layout = ({ children }) => {
  const { user, role, department } = useSelector((state) => state.auth);
  const location = useLocation();

  const effectiveRole = (user?.role || role)?.toLowerCase();
  const effectiveDepartment = (user?.department || department)?.toLowerCase();

  const isSuperAdmin = effectiveRole === "superadmin";
  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAdmin = ["osa", "hr", "depthead"].includes(effectiveDepartment);

  // Check if current route is user chat details
  const isUserChatRoute = location.pathname === "/user/chat";

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

  // ================= ADMIN LAYOUT =================
  if (isAdminRoute && isAdmin) {
    return (
      <div className="flex h-screen w-screen overflow-hidden">
        <AdminSidebar
          role={effectiveDepartment}
          userName={user?.name}
        />
        <main className="flex-1 p-6 overflow-y-auto">
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