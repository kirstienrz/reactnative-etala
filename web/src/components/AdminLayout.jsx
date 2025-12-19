import React from "react";
import AdminSidebar from "../components/AdminSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar (fixed width) */}
            <AdminSidebar />

            {/* Main Content - fill all remaining space */}
            <main className="flex-grow w-full overflow-y-auto p-6">
                <div className="max-w-full">
                    <Outlet />
                </div>
            </main>
        </div>

    );
};

export default AdminLayout;
