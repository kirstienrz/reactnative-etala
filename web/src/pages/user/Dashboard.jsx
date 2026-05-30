import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  FileText, 
  ListTodo, 
  Inbox, 
  User,
  ChevronRight,
  Calendar,
  Settings,
  LogOut,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import LogoutModal from "../../components/LogoutModal";
import { appealArchive } from "../../api/user";

export default function Dashboard() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isNativeApp, setIsNativeApp] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    
    // Get actual user from Redux store
    const { user, role } = useSelector((state) => state.auth);

    // Option A States
    const [userArchiveStatus, setUserArchiveStatus] = useState(user?.archiveStatus || "Active");
    const [userArchiveReason, setUserArchiveReason] = useState(user?.archiveReason || "");
    const [userArchiveGraceEnds, setUserArchiveGraceEnds] = useState(user?.archiveGracePeriodEndsAt || null);
    
    const [showAppealModal, setShowAppealModal] = useState(false);
    const [appealReasonText, setAppealReasonText] = useState("");
    const [appealLoading, setAppealLoading] = useState(false);
    const [appealError, setAppealError] = useState("");
    const [appealSuccess, setAppealSuccess] = useState("");
    
    useEffect(() => {
        if (user) {
            setUserArchiveStatus(user.archiveStatus || "Active");
            setUserArchiveReason(user.archiveReason || "");
            setUserArchiveGraceEnds(user.archiveGracePeriodEndsAt || null);
        }
    }, [user]);

    const handleSendAppeal = async (e) => {
        e.preventDefault();
        if (!appealReasonText.trim()) {
            setAppealError("Please write a reason for your appeal.");
            return;
        }

        try {
            setAppealLoading(true);
            setAppealError("");
            setAppealSuccess("");
            const response = await appealArchive({ appealReason: appealReasonText.trim() });
            setAppealSuccess("Your appeal has been submitted successfully!");
            setUserArchiveStatus(response.archiveStatus || "Appeal Under Review");
            
            // Clean up
            setTimeout(() => {
                setShowAppealModal(false);
                setAppealSuccess("");
                setAppealReasonText("");
            }, 3000);
        } catch (err) {
            setAppealError(err.response?.data?.message || "Failed to submit appeal");
        } finally {
            setAppealLoading(false);
        }
    };
    
    useEffect(() => {
        try {
            const platform = Capacitor.getPlatform();
            setIsNativeApp(platform === "android" || platform === "ios");
        } catch (e) {
            setIsNativeApp(false);
        }
    }, []);
    
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
        ...(isNativeApp ? [{
            title: "Logout",
            subtitle: "Sign out of account",
            icon: LogOut,
            color: "#DC2626",
            bgLight: "#FEF2F2",
            action: "logout",
        }] : [])
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
                    {/* Banners */}
                    {userArchiveStatus === "Pending Archive" && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-2xl shadow-sm flex flex-col justify-between items-stretch gap-3">
                            <div className="flex gap-3 items-start">
                                <div className="p-2 bg-orange-100 text-orange-700 rounded-xl shadow-inner flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-orange-950 text-sm leading-tight mb-1">Account Archiving Scheduled</h3>
                                    <p className="text-xs text-orange-850 leading-normal font-semibold">
                                        Scheduled to be archived on <strong className="underline">{userArchiveGraceEnds ? new Date(userArchiveGraceEnds).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</strong>.
                                    </p>
                                    <p className="text-[11px] text-orange-700 mt-1 italic font-bold">
                                        Reason: "{userArchiveReason}"
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAppealModal(true)}
                                className="w-full py-2.5 bg-orange-600 active:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-md transition-all text-center flex items-center justify-center gap-1"
                            >
                                ✏️ Submit Appeal
                            </button>
                        </div>
                    )}

                    {userArchiveStatus === "Appeal Under Review" && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl shadow-sm flex gap-3 items-center">
                            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl shadow-inner flex-shrink-0">
                                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-indigo-950 text-sm leading-tight mb-0.5">Appeal Under Review</h3>
                                <p className="text-[11px] text-indigo-700 font-semibold leading-normal">
                                    Your appeal is currently being reviewed by GAD administrators.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3.5">
                        {mainActions.map((action, i) => {
                            const Icon = action.icon;
                            // Make the first action (File a Report) slightly more prominent
                            const isPrimary = i === 0;
                            
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (action.action === "logout") {
                                            setIsLogoutModalOpen(true);
                                        } else {
                                            navigate(action.path);
                                        }
                                    }}
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

                <LogoutModal
                    isOpen={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    onConfirm={() => {
                        dispatch(logout());
                        setIsLogoutModalOpen(false);
                        navigate("/");
                    }}
                />

                {showAppealModal && (
                    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-6">
                        {/* Overlay */}
                        <div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-modal-fade"
                            onClick={() => !appealLoading && setShowAppealModal(false)}
                        />
                        
                        {/* Modal Content */}
                        <form 
                            onSubmit={handleSendAppeal}
                            className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-slide-up sm:animate-modal-zoom flex flex-col max-h-[90vh]"
                        >
                            {/* Mobile Handle */}
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden flex-shrink-0" />

                            <div className="absolute top-4 right-4 hidden sm:block">
                                <button 
                                    type="button"
                                    onClick={() => !appealLoading && setShowAppealModal(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                    disabled={appealLoading}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 sm:p-8 overflow-y-auto">
                                <div className="flex flex-col items-center sm:items-start">
                                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 text-amber-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center sm:text-left">
                                        Submit Archive Appeal
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-6 text-center sm:text-left leading-relaxed">
                                        Your account is scheduled for archiving due to: <strong className="text-gray-800">"{userArchiveReason}"</strong>.
                                        If you believe this is a mistake or have reasons to keep your account active, please state them below. Your appeal will freeze the deactivation countdown while under review.
                                    </p>

                                    {appealError && (
                                        <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium flex items-center gap-2">
                                            <span className="flex-shrink-0">⚠️</span>
                                            <span>{appealError}</span>
                                        </div>
                                    )}

                                    {appealSuccess && (
                                        <div className="w-full mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl font-semibold flex items-center gap-2">
                                            <span className="flex-shrink-0">✅</span>
                                            <span>{appealSuccess}</span>
                                        </div>
                                    )}

                                    <div className="w-full">
                                        <label htmlFor="appealReasonMobile" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            Reason for Appeal
                                        </label>
                                        <textarea
                                            id="appealReasonMobile"
                                            rows={4}
                                            value={appealReasonText}
                                            onChange={(e) => setAppealReasonText(e.target.value)}
                                            placeholder="Explain in detail why your account should remain active (e.g., ongoing consultations, active report tracking, etc.)..."
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-sm resize-none placeholder:text-gray-400 font-medium text-gray-800"
                                            disabled={appealLoading || !!appealSuccess}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-3 w-full justify-end flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowAppealModal(false)}
                                    className="px-5 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm w-full sm:w-auto"
                                    disabled={appealLoading || !!appealSuccess}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 shadow-md shadow-violet-200 transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto disabled:opacity-50"
                                    disabled={appealLoading || !!appealSuccess}
                                >
                                    {appealLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Appeal"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
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
                {/* ⚠️ Warning Banner: Pending Archive */}
                {userArchiveStatus === "Pending Archive" && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-3.5 items-start">
                            <div className="p-2.5 bg-orange-100 text-orange-700 rounded-lg shadow-inner flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-orange-900 text-base leading-tight mb-1">Account Archiving Scheduled</h3>
                                <p className="text-sm text-orange-700 font-semibold leading-relaxed">
                                    Your account is scheduled to be archived and detached on <strong className="text-orange-950 underline">{userArchiveGraceEnds ? new Date(userArchiveGraceEnds).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</strong>.
                                </p>
                                <p className="text-xs text-orange-600 mt-1 font-semibold">
                                    Reason: <span className="italic font-bold">"{userArchiveReason}"</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAppealModal(true)}
                            className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all font-bold text-sm shadow-md active:scale-95 whitespace-nowrap"
                        >
                            ✏️ Submit Appeal
                        </button>
                    </div>
                )}

                {/* ⏳ Info Banner: Appeal Under Review */}
                {userArchiveStatus === "Appeal Under Review" && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl shadow-sm flex items-center gap-3.5">
                        <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg shadow-inner flex-shrink-0">
                            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-indigo-900 text-base leading-tight mb-1">Archive Appeal Under Review</h3>
                            <p className="text-sm text-indigo-700 font-semibold leading-relaxed">
                                You have successfully submitted an appeal to keep your account active. GAD administrators are currently reviewing your request.
                            </p>
                        </div>
                    </div>
                )}

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
                                    onClick={() => {
                                        if (action.action === "logout") {
                                            dispatch(logout());
                                            navigate("/login");
                                        } else {
                                            navigate(action.path);
                                        }
                                    }}
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
                
                <LogoutModal
                    isOpen={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    onConfirm={() => {
                        dispatch(logout());
                        setIsLogoutModalOpen(false);
                        navigate("/");
                    }}
                />

                {showAppealModal && (
                    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-6">
                        {/* Overlay */}
                        <div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-modal-fade"
                            onClick={() => !appealLoading && setShowAppealModal(false)}
                        />
                        
                        {/* Modal Content */}
                        <form 
                            onSubmit={handleSendAppeal}
                            className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-slide-up sm:animate-modal-zoom flex flex-col max-h-[90vh]"
                        >
                            {/* Mobile Handle */}
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden flex-shrink-0" />

                            <div className="absolute top-4 right-4 hidden sm:block">
                                <button 
                                    type="button"
                                    onClick={() => !appealLoading && setShowAppealModal(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                    disabled={appealLoading}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 sm:p-8 overflow-y-auto">
                                <div className="flex flex-col items-center sm:items-start">
                                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 text-amber-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center sm:text-left">
                                        Submit Archive Appeal
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-6 text-center sm:text-left leading-relaxed">
                                        Your account is scheduled for archiving due to: <strong className="text-gray-800">"{userArchiveReason}"</strong>.
                                        If you believe this is a mistake or have reasons to keep your account active, please state them below. Your appeal will freeze the deactivation countdown while under review.
                                    </p>

                                    {appealError && (
                                        <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium flex items-center gap-2">
                                            <span className="flex-shrink-0">⚠️</span>
                                            <span>{appealError}</span>
                                        </div>
                                    )}

                                    {appealSuccess && (
                                        <div className="w-full mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl font-semibold flex items-center gap-2">
                                            <span className="flex-shrink-0">✅</span>
                                            <span>{appealSuccess}</span>
                                        </div>
                                    )}

                                    <div className="w-full">
                                        <label htmlFor="appealReasonWeb" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            Reason for Appeal
                                        </label>
                                        <textarea
                                            id="appealReasonWeb"
                                            rows={4}
                                            value={appealReasonText}
                                            onChange={(e) => setAppealReasonText(e.target.value)}
                                            placeholder="Explain in detail why your account should remain active (e.g., ongoing consultations, active report tracking, etc.)..."
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-sm resize-none placeholder:text-gray-400 font-medium text-gray-800"
                                            disabled={appealLoading || !!appealSuccess}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-3 w-full justify-end flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowAppealModal(false)}
                                    className="px-5 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm w-full sm:w-auto"
                                    disabled={appealLoading || !!appealSuccess}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 shadow-md shadow-violet-200 transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto disabled:opacity-50"
                                    disabled={appealLoading || !!appealSuccess}
                                >
                                    {appealLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Appeal"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}