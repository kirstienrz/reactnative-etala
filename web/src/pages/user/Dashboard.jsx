import React, { useEffect, useState } from "react";

export default function Dashboard() {
    const [user, setUser] = useState({ name: "User" });
    const [stats, setStats] = useState({
        projects: 0,
        tasks: 0,
        visits: 0,
    });
    const [loading, setLoading] = useState(false);

    // simulate loading initial data
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setUser({ name: "Kirst" });
            setStats({ projects: 3, tasks: 12, visits: 42 });
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    function refreshStats() {
        setLoading(true);
        // simulate an API call that updates stats
        setTimeout(() => {
            setStats((s) => ({
                projects: s.projects,
                tasks: s.tasks + Math.floor(Math.random() * 3),
                visits: s.visits + 1,
            }));
            setLoading(false);
        }, 400);
    }

    const containerStyle = {
        maxWidth: 760,
        margin: "32px auto",
        padding: 20,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        color: "#222",
    };

    const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center" };
    const cardStyle = {
        display: "flex",
        gap: 12,
        marginTop: 16,
    };
    const statStyle = {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        background: "#f7f7fb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        textAlign: "center",
    };
    const buttonStyle = {
        padding: "8px 12px",
        borderRadius: 6,
        border: "1px solid #ccc",
        background: "#fff",
        cursor: "pointer",
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h2 style={{ margin: 0 }}>Dashboard</h2>
                    <div style={{ color: "#555", fontSize: 14 }}>Welcome back, {user.name}.</div>
                </div>
                <div>
                    <button style={buttonStyle} onClick={refreshStats} disabled={loading}>
                        {loading ? "Loading..." : "Refresh"}
                    </button>
                </div>
            </div>

            <div style={{ marginTop: 20 }}>
                <p style={{ margin: 0, color: "#666" }}>
                    Summary of your account and recent activity.
                </p>

                <div style={cardStyle}>
                    <div style={statStyle}>
                        <div style={{ fontSize: 28, fontWeight: 600 }}>{stats.projects}</div>
                        <div style={{ color: "#777", marginTop: 6 }}>Projects</div>
                    </div>

                    <div style={statStyle}>
                        <div style={{ fontSize: 28, fontWeight: 600 }}>{stats.tasks}</div>
                        <div style={{ color: "#777", marginTop: 6 }}>Open Tasks</div>
                    </div>

                    <div style={statStyle}>
                        <div style={{ fontSize: 28, fontWeight: 600 }}>{stats.visits}</div>
                        <div style={{ color: "#777", marginTop: 6 }}>Profile Visits</div>
                    </div>
                </div>
            </div>
        </div>
    );
}