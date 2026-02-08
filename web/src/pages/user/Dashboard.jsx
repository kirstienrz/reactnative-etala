import React from "react";
import { useSelector } from "react-redux"; // Add this import
import { 
  FileText, 
  ListTodo, 
  Inbox, 
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    
    // Get actual user from Redux store
    const { user, role } = useSelector((state) => state.auth);
    
    // Fallback if user data is missing
    const displayName = user?.firstName || user?.username || "User";
    const displayRole = user?.role || role || "User";
    // ONLY 4 MAIN FUNCTIONS
    const mainActions = [
        {
            title: "File a Report",
            subtitle: "Submit new case or incident",
            icon: FileText,
            color: "#1E40AF",
            path: "/user/report",
        },
        {
            title: "My Reports",
            subtitle: "View and track your submissions",
            icon: ListTodo,
            color: "#047857",
            path: "/user/reports",
        },
        {
            title: "Inbox",
            subtitle: "Check your messages",
            icon: Inbox,
            color: "#7C2D12",
            path: "/user/inbox",
        },
        {
            title: "Edit Profile",
            subtitle: "Update your account information",
            icon: User,
            color: "#6B21A8",
            path: "/user/profile",
        },
    ];

    return (
        <div style={{ 
            backgroundColor: "#F9FAFB", 
            minHeight: "100vh", 
            fontFamily: "'Inter', -apple-system, sans-serif" 
        }}>
          
            {/* Main Content */}
            <div style={{ 
                maxWidth: 1200, 
                margin: "0 auto", 
                padding: "32px 20px",
                minHeight: "calc(100vh - 80px)",
                display: "flex",
                flexDirection: "column"
            }}>
                
                {/* Welcome Banner - More Professional */}
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
                                {displayRole} • GAD Reporting System
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

                {/* Main Actions Grid - ONLY 4 FUNCTIONS */}
                <div style={{ flex: 1 }}>
                  
                    
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: { 
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(2, 1fr)",
                            lg: "repeat(4, 1fr)"
                        }, 
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