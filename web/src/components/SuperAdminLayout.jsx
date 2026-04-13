import React, { useState } from "react";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { Outlet } from "react-router-dom";
import useUnreadMessages from '../hooks/useUnreadMessages';
import { Menu } from "lucide-react";


const SuperAdminLayout = () => {
    useUnreadMessages();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-100 relative">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white flex items-center justify-between px-4 z-[900] shadow-md">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>
            </header>

            {/* Sidebar */}
            <SuperAdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <main className="flex-grow w-full overflow-y-auto p-4 md:p-6 lg:ml-0 pt-20 lg:pt-6">
                <div className="max-w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default SuperAdminLayout;
