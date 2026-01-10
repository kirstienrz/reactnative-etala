import React, { useEffect, useState } from "react";
import { 
  FileText, 
  ListTodo, 
  Inbox, 
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: "User", role: "Case Worker" });

    useEffect(() => {
        const timer = setTimeout(() => {
            setUser({ name: "Kirst", role: "GAD Focal Person" });
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    // ONLY 4 MAIN FUNCTIONS
    const mainActions = [
        {
            title: "File a Report",
            subtitle: "Submit new case or incident",
            icon: FileText,
            color: "#7C3AED",
            path: "/user/report",
        },
        {
            title: "My Reports",
            subtitle: "View and track your submissions",
            icon: ListTodo,
            color: "#10B981",
            path: "/user/reports",
        },
        {
            title: "Inbox",
            subtitle: "Check your messages",
            icon: Inbox,
            color: "#0EA5E9",
            path: "/user/inbox",
        },
        {
            title: "Edit Profile",
            subtitle: "Update your account information",
            icon: User,
            color: "#F59E0B",
            path: "/user/profile",
        },
    ];

    return (
        <div style={{ 
            background: "linear-gradient(135deg, #f6f8ff 0%, #f0f4ff 100%)", 
            minHeight: "100vh", 
            fontFamily: "system-ui, -apple-system, sans-serif" 
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
                
                {/* Welcome Banner */}
                <div style={{
                    background: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
                    borderRadius: 16,
                    padding: "40px 32px",
                    color: "#fff",
                    marginBottom: 48,
                    boxShadow: "0 10px 30px rgba(124, 58, 237, 0.25)",
                }}>
                    <h1 style={{ 
                        margin: "0 0 12px 0", 
                        fontSize: 36, 
                        fontWeight: 700,
                        letterSpacing: "-0.5px"
                    }}>
                        Welcome back, {user.name}! 👋
                    </h1>
                    <p style={{ 
                        margin: 0, 
                        fontSize: 18, 
                        opacity: 0.95,
                        fontWeight: 400
                    }}>
                        {user.role} • GAD Reporting System
                    </p>
                </div>

                {/* Main Actions Grid - ONLY 4 FUNCTIONS */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ 
                        fontSize: 24, 
                        fontWeight: 600, 
                        color: "#1F1F1F", 
                        marginBottom: 32,
                        textAlign: "center"
                    }}>
                        What would you like to do today?
                    </h2>
                    
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: { 
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(2, 1fr)",
                            lg: "repeat(4, 1fr)"
                        }, 
                        gap: 24,
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
                                        background: "#fff",
                                        border: "none",
                                        borderRadius: 20,
                                        padding: "32px 24px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                                        textAlign: "center",
                                        height: "100%"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-8px)";
                                        e.currentTarget.style.boxShadow = `0 20px 40px ${action.color}20, 0 8px 30px rgba(0,0,0,0.12)`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
                                    }}
                                >
                                    <div style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 20,
                                        background: `${action.color}10`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: 24,
                                        border: `2px solid ${action.color}20`
                                    }}>
                                        <Icon size={40} color={action.color} />
                                    </div>
                                    <h3 style={{ 
                                        fontSize: 20, 
                                        fontWeight: 700, 
                                        color: action.color, 
                                        marginBottom: 8,
                                        marginTop: 0
                                    }}>
                                        {action.title}
                                    </h3>
                                    <p style={{ 
                                        fontSize: 14, 
                                        color: "#666",
                                        lineHeight: 1.5,
                                        margin: 0
                                    }}>
                                        {action.subtitle}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Info */}
                    <div style={{
                        marginTop: 64,
                        padding: "32px",
                        background: "rgba(255, 255, 255, 0.7)",
                        borderRadius: 20,
                        border: "1px solid rgba(124, 58, 237, 0.1)",
                        textAlign: "center"
                    }}>
                        <h3 style={{ 
                            fontSize: 18, 
                            fontWeight: 600, 
                            color: "#7C3AED", 
                            marginBottom: 12 
                        }}>
                            Need Help?
                        </h3>
                        <p style={{ 
                            fontSize: 14, 
                            color: "#666", 
                            margin: 0,
                            lineHeight: 1.6
                        }}>
                            If you're unsure about reporting or need assistance,<br />
                            please contact your supervisor or use the help resources.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}