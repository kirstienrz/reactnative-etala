import React from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { Outlet } from "react-router-dom";
import useUnreadMessages from '../hooks/useUnreadMessages';

const SuperAdminLayout = () => {
    useUnreadMessages(); // ← mount unread count sync

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar (fixed width) */}
            <SuperAdminSidebar />

            {/* Main Content - fill all remaining space */}
            <main className="flex-grow w-full overflow-y-auto p-6">
                <div className="max-w-full">
                    <Outlet />
                </div>
            </main>
        </div>

    );
};

export default SuperAdminLayout;
