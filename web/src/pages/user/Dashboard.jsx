import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  FileText, 
  ListTodo, 
  Inbox, 
  User,
  ChevronRight,
  Calendar,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

export default function Dashboard() {
    const navigate = useNavigate();
    const [isNativeApp, setIsNativeApp] = useState(false);
    
    useEffect(() => {
        try {
            const platform = Capacitor.getPlatform();
            setIsNativeApp(platform === "android" || platform === "ios");
        } catch (e) {
            setIsNativeApp(false);
        }
    }, []);
    
    // Get actual user from Redux store
    const { user, role } = useSelector((state) => state.auth);
    
    // Fallback if user data is missing
    const displayName = user?.firstName || user?.username || "User";
    const displayRole = user?.role || role || "User";
    
    // ONLY 4 MAIN FUNCTIONS (Plus Edit Profile)
    const mainActions = [
        {
            title: "File a Report",
            subtitle: "Submit new case",
            icon: FileText,
            color: "#1E40AF",
            bgLight: "#EFF6FF",
            path: "/user/report",
        },
        {
            title: "My Reports",
            subtitle: "Track submissions",
            icon: ListTodo,
            color: "#047857",
            bgLight: "#ECFDF5",
            path: "/user/reports",
        },
        {
            title: "Inbox",
            subtitle: "Check messages",
            icon: Inbox,
            color: "#7C2D12",
            bgLight: "#FFF7ED",
            path: "/user/inbox",
        },
        {
            title: "Consultations",
            subtitle: "Track bookings",
            icon: User,
            color: "#F59E42",
            bgLight: "#FFFBEB",
            path: "/user/consultations",
        },
        {
            title: "Edit Profile",
            subtitle: "Update account",
            icon: User,
            color: "#6B21A8",
            bgLight: "#FAF5FF",
            path: "/user/profile",
        },
    ];

    if (isNativeApp) {
        return (
            <div className="bg-[#F4F6F8] min-h-screen pb-24 font-sans">
                {/* Modern App Header */}
                <div className="bg-gradient-to-b from-violet-700 to-violet-600 px-6 pt-14 pb-20 rounded-b-[2rem] relative shadow-md">
                    {/* Header Top Row */}
                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-violet-200 text-xs font-medium uppercase tracking-wider mb-0.5">Good Day,</p>
                                <h1 className="text-white text-xl font-bold leading-none tracking-tight">
                                    {displayName}
                                </h1>
                            </div>
                        </div>
                        {/* Role Badge */}
                        <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                            <span className="text-white text-xs font-semibold capitalize">{displayRole}</span>
                        </div>
                    </div>
                </div>

                {/* Main Menu Stack */}
                <div className="px-5 -mt-10 relative z-20">
                    <div className="flex flex-col gap-3.5">
                        {mainActions.map((action, i) => {
                            const Icon = action.icon;
                            // Make the first action (File a Report) slightly more prominent
                            const isPrimary = i === 0;
                            
                            return (
                                <button
                                    key={i}
                                    onClick={() => navigate(action.path)}
                                    className={`w-full bg-white rounded-2xl p-4 shadow-sm border ${isPrimary ? 'border-violet-100 shadow-[0_8px_20px_rgb(0,0,0,0.06)] py-5' : 'border-gray-100'} flex items-center gap-4 active:scale-[0.98] transition-transform text-left`}
                                >
                                    <div 
                                        className={`w-12 h-12 rounded-[1rem] flex items-center justify-center flex-shrink-0 ${isPrimary ? 'w-14 h-14 bg-violet-100 text-violet-600' : ''}`}
                                        style={!isPrimary ? { backgroundColor: action.bgLight, color: action.color } : {}}
                                    >
                                        <Icon size={isPrimary ? 28 : 24} strokeWidth={isPrimary ? 2 : 2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-gray-900 font-bold ${isPrimary ? 'text-lg mb-1' : 'text-base mb-0.5'} leading-tight`}>
                                            {action.title}
                                        </h3>
                                        <p className="text-gray-500 text-xs font-medium">
                                            {action.subtitle}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                        <ChevronRight size={20} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                {/* Extra Native App element: Info Banner */}
                <div className="mt-8 px-5">
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100 flex gap-4 items-center shadow-sm">
                         <div className="flex-1">
                             <h4 className="text-violet-900 font-bold text-sm mb-1">Need Assistance?</h4>
                             <p className="text-violet-700/80 text-xs leading-relaxed font-medium">If you have questions, talk to our chatbot for instant assistance.</p>
                         </div>
                    </div>
                </div>

            </div>
        );
    }

    // Web Dashboard (Unchanged)
    return (
        <div style={{ 
            backgroundColor: "#F9FAFB", 
            minHeight: "100vh", 
            fontFamily: "'Inter', -apple-system, sans-serif" 
        }}>
            <div className="content-container py-8 min-h-[calc(100vh-80px)] flex flex-col">
                <div style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: 12,
                    padding: "32px",
                    color: "#111827",
                    marginBottom: 48,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}>
                    <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 16,
                        marginBottom: 16
                    }}>
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FFFFFF",
                            fontWeight: 600,
                            fontSize: 20
                        }}>
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 style={{ 
                                margin: "0 0 4px 0", 
                                fontSize: 24, 
                                fontWeight: 700,
                                color: "#111827"
                            }}>
                                Welcome back, {displayName}
                            </h1>
                            <div style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                backgroundColor: "#F3F4F6",
                                padding: "4px 12px",
                                borderRadius: 20,
                                fontSize: 13,
                                color: "#4B5563"
                            }}>
                                <span style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    backgroundColor: "#10B981"
                                }}></span>
                                {displayRole} 
                            </div>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: 14, 
                        color: "#6B7280",
                        margin: 0,
                        lineHeight: 1.6
                    }}>
                        Access your reports, submit new cases, and manage your profile from this dashboard.
                    </p>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ 
                        display: "flex", 
                        flexDirection: "column",
                        gap: 16,
                        maxWidth: 1000,
                        margin: "0 auto"
                    }}>
                        {mainActions.map((action, i) => {
                            const Icon = action.icon;
                            return (
                                <div
                                    key={i}
                                    onClick={() => navigate(action.path)}
                                    style={{
                                        backgroundColor: "#FFFFFF",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: 12,
                                        padding: "24px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        textAlign: "left",
                                        height: "100%"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                                        e.currentTarget.style.borderColor = action.color;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.style.borderColor = "#E5E7EB";
                                    }}
                                >
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 10,
                                        backgroundColor: `${action.color}10`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: 20,
                                        border: `1px solid ${action.color}20`
                                    }}>
                                        <Icon size={24} color={action.color} />
                                    </div>
                                    <h3 style={{ 
                                        fontSize: 16, 
                                        fontWeight: 600, 
                                        color: "#111827", 
                                        marginBottom: 8,
                                        marginTop: 0
                                    }}>
                                        {action.title}
                                    </h3>
                                    <p style={{ 
                                        fontSize: 13, 
                                        color: "#6B7280",
                                        lineHeight: 1.5,
                                        margin: 0,
                                        flex: 1
                                    }}>
                                        {action.subtitle}
                                    </p>
                                    <div style={{
                                        marginTop: 20,
                                        width: "100%",
                                        height: 1,
                                        backgroundColor: "#F3F4F6"
                                    }}></div>
                                    <div style={{
                                        marginTop: 16,
                                        fontSize: 12,
                                        color: action.color,
                                        fontWeight: 500,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4
                                    }}>
                                        Access
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 12L10 8L6 4" stroke={action.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}