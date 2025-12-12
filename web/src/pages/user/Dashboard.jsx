import React, { useEffect, useState } from "react";
import { Search, Bell, User, ChevronRight, AlertCircle, FileText, Users, Clock, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";

export default function Dashboard() {
    const [user, setUser] = useState({ name: "User", role: "Case Worker" });
    const [stats, setStats] = useState({
        totalCases: 0,
        pendingCases: 0,
        resolvedCases: 0,
        activeBeneficiaries: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setUser({ name: "Kirst", role: "GAD Focal Person" });
            setStats({
                totalCases: 47,
                pendingCases: 12,
                resolvedCases: 35,
                activeBeneficiaries: 89
            });
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    function refreshStats() {
        setLoading(true);
        setTimeout(() => {
            setStats(s => ({
                ...s,
                totalCases: s.totalCases + Math.floor(Math.random() * 2),
                pendingCases: Math.max(0, s.pendingCases - Math.floor(Math.random() * 2)),
                resolvedCases: s.resolvedCases + Math.floor(Math.random() * 2),
            }));
            setLoading(false);
        }, 400);
    }

    const recentCases = [
        { 
            caseNo: "GAD-2024-001", 
            type: "Violence Against Women", 
            status: "Under Investigation", 
            priority: "High",
            date: "Dec 1, 2024",
            badge: "Urgent",
            color: "#DC2626"
        },
        { 
            caseNo: "GAD-2024-002", 
            type: "Child Protection", 
            status: "Counseling Phase", 
            priority: "Medium",
            date: "Nov 28, 2024",
            badge: "Active",
            color: "#F59E0B"
        },
        { 
            caseNo: "GAD-2024-003", 
            type: "Economic Empowerment", 
            status: "Monitoring", 
            priority: "Low",
            date: "Nov 25, 2024",
            badge: "Ongoing",
            color: "#10B981"
        },
    ];

    const quickActions = [
        { title: "File New Case", subtitle: "Register a new GAD case", icon: FileText, color: "#0056D2" },
        { title: "View Reports", subtitle: "Access case analytics", icon: TrendingUp, color: "#10B981" },
        { title: "Pending Actions", subtitle: `${stats.pendingCases} cases need attention`, icon: AlertCircle, color: "#F59E0B" },
    ];

    return (
        <div style={{ background: "#F5F5F5", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
            {/* Header */}
            <header style={{
                background: "#fff",
                borderBottom: "1px solid #E0E0E0",
                padding: "16px 0",
                position: "sticky",
                top: 0,
                zIndex: 100,
            }}>
                <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#7C3AED" }}>GAD Dashboard</h1>
                        <nav style={{ display: "flex", gap: 24 }}>
                            {["Home", "Cases", "Beneficiaries", "Reports", "Programs"].map(item => (
                                <a key={item} href="#" style={{
                                    textDecoration: "none",
                                    color: item === "Home" ? "#7C3AED" : "#1F1F1F",
                                    fontSize: 14,
                                    fontWeight: item === "Home" ? 600 : 400,
                                    borderBottom: item === "Home" ? "2px solid #7C3AED" : "none",
                                    paddingBottom: 4,
                                }}>
                                    {item}
                                </a>
                            ))}
                        </nav>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        <div style={{ position: "relative", width: 320 }}>
                            <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#666" }} />
                            <input
                                placeholder="Search cases, beneficiaries..."
                                style={{
                                    width: "100%",
                                    padding: "10px 16px 10px 40px",
                                    border: "1px solid #D0D0D0",
                                    borderRadius: 4,
                                    fontSize: 14,
                                    outline: "none",
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = "#7C3AED"}
                                onBlur={(e) => e.currentTarget.style.borderColor = "#D0D0D0"}
                            />
                        </div>
                        <div style={{ position: "relative" }}>
                            <Bell size={20} style={{ color: "#666", cursor: "pointer" }} />
                            <div style={{
                                position: "absolute",
                                top: -4,
                                right: -4,
                                width: 16,
                                height: 16,
                                background: "#DC2626",
                                borderRadius: "50%",
                                fontSize: 10,
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 600,
                            }}>3</div>
                        </div>
                        <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "#7C3AED",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}>
                            {user.name[0]}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
                {/* Welcome Banner */}
                <div style={{
                    background: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
                    borderRadius: 8,
                    padding: "32px",
                    color: "#fff",
                    marginBottom: 32,
                }}>
                    <h2 style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 600 }}>
                        Welcome back, {user.name}! 👋
                    </h2>
                    <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>
                        {user.role} • {stats.pendingCases} cases require your attention today
                    </p>
                </div>

                {/* Stats Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
                    {[
                        { label: "Total Cases", value: stats.totalCases, icon: FileText, change: "+3 this month", color: "#7C3AED" },
                        { label: "Pending Cases", value: stats.pendingCases, icon: Clock, change: "Need action", color: "#F59E0B" },
                        { label: "Resolved Cases", value: stats.resolvedCases, icon: CheckCircle, change: "74% resolution rate", color: "#10B981" },
                        { label: "Active Beneficiaries", value: stats.activeBeneficiaries, icon: Users, change: "+7 this week", color: "#0EA5E9" },
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} style={{
                                background: "#fff",
                                border: "1px solid #E0E0E0",
                                borderRadius: 8,
                                padding: 20,
                                transition: "all 0.2s",
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 8,
                                    background: `${stat.color}15`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 12,
                                }}>
                                    <Icon size={24} color={stat.color} />
                                </div>
                                <div style={{ fontSize: 32, fontWeight: 700, color: "#1F1F1F", marginBottom: 4 }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>{stat.label}</div>
                                <div style={{ fontSize: 12, color: stat.color, fontWeight: 500 }}>{stat.change}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: "#1F1F1F", marginBottom: 16 }}>Quick Actions</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                        {quickActions.map((action, i) => {
                            const Icon = action.icon;
                            return (
                                <div key={i} style={{
                                    background: "#fff",
                                    border: "1px solid #E0E0E0",
                                    borderRadius: 8,
                                    padding: 20,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = action.color;
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "#E0E0E0";
                                    e.currentTarget.style.boxShadow = "none";
                                }}>
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 8,
                                        background: `${action.color}15`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        <Icon size={24} color={action.color} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: "#1F1F1F", marginBottom: 4 }}>
                                            {action.title}
                                        </div>
                                        <div style={{ fontSize: 13, color: "#666" }}>
                                            {action.subtitle}
                                        </div>
                                    </div>
                                    <ChevronRight size={20} color="#999" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Cases */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 600, color: "#1F1F1F", margin: 0 }}>Recent Cases</h3>
                        <button
                            onClick={refreshStats}
                            disabled={loading}
                            style={{
                                padding: "8px 16px",
                                border: "1px solid #E0E0E0",
                                borderRadius: 6,
                                background: "#fff",
                                color: "#666",
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.borderColor = "#7C3AED")}
                            onMouseLeave={(e) => !loading && (e.currentTarget.style.borderColor = "#E0E0E0")}
                        >
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
                        {recentCases.map((caseItem, i) => (
                            <div key={i} style={{
                                background: "#fff",
                                border: "1px solid #E0E0E0",
                                borderRadius: 8,
                                overflow: "hidden",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                                e.currentTarget.style.transform = "translateY(-4px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}>
                                <div style={{
                                    height: 6,
                                    background: caseItem.color,
                                }} />
                                
                                <div style={{ padding: 20 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                                                {caseItem.date}
                                            </div>
                                            <div style={{ fontSize: 16, fontWeight: 700, color: "#1F1F1F" }}>
                                                {caseItem.caseNo}
                                            </div>
                                        </div>
                                        <div style={{
                                            background: `${caseItem.color}15`,
                                            color: caseItem.color,
                                            padding: "4px 12px",
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }}>
                                            {caseItem.badge}
                                        </div>
                                    </div>
                                    
                                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1F1F1F", marginBottom: 8 }}>
                                        {caseItem.type}
                                    </div>
                                    
                                    <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
                                        Status: {caseItem.status}
                                    </div>
                                    
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <AlertTriangle size={14} color={caseItem.color} />
                                        <span style={{ fontSize: 12, color: caseItem.color, fontWeight: 600 }}>
                                            {caseItem.priority} Priority
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}