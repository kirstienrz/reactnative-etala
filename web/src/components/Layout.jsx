import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import Header from "../components/Header"; // ✅ Import actual Header component
import Footer from "../components/Footer"; // ✅ Import actual Footer component

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const isSuperAdmin = user?.role === "superadmin";
  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");

  // 🔒 If superadmin or in superadmin routes — hide header/footer and use sidebar layout
  if (isSuperAdmin || isSuperAdminRoute) {
    return (
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Sidebar */}
        <SuperAdminSidebar />

        {/* Main Content */}
        <main className="flex-1 bg-white p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  // 🌐 Default layout for normal users or not logged in
  return (
    <>
      <Header />  {/* ✅ show actual Header component */}
      <main className="min-h-[80vh] bg-gray-50">{children}</main>
      <Footer />  {/* ✅ show actual Footer component */}
    </>
  );
};

export default Layout;
