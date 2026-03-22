"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Crosshair, Trophy, Settings, Shield, Moon, Sun, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/store";

export default function MobileTabBar() {
    const pathname = usePathname();
    const { user, logout, captainClubs } = useAuth();
    const { state, dispatch } = useApp();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    const tabs = [
        { href: "/ops", icon: Crosshair, label: "Dashboard" },
        { href: "/leaderboard", icon: Trophy, label: "Rankings" },
        ...(user ? [{ href: "/profile", icon: Settings, label: "Profile" }] : []),
        ...((user?.role === "admin" || (captainClubs && captainClubs.length > 0)) ? [{ href: "/admin", icon: Shield, label: "Armory" }] : []),
    ];

    const tabStyle = (active: boolean): React.CSSProperties => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.2rem",
        color: active ? "var(--amber)" : "var(--text-muted)",
        textDecoration: "none",
        fontSize: "0.6rem",
        fontWeight: 600,
        padding: "0.35rem 0.5rem",
        background: "none",
        border: "none",
        cursor: "pointer",
        flex: 1,
        justifyContent: "center",
        letterSpacing: "0.02em",
        textTransform: "uppercase" as const,
    });

    return (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "var(--surface)", borderTop: "0.5px solid var(--border)" }}>
            {/* Club Selector Strip (Ops only) */}
            {pathname === "/ops" && (
                <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", padding: "0.6rem 1rem", borderBottom: "0.5px solid var(--border)", scrollbarWidth: "none" }}>
                    <button
                        onClick={() => dispatch({ type: "SET_ACTIVE_CLUB", clubId: "all" })}
                        style={{
                            padding: "0.35rem 0.75rem", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600, border: "none", whiteSpace: "nowrap", cursor: "pointer",
                            background: state.activeClubId === "all" ? "var(--amber)" : "var(--surface-2)",
                            color: state.activeClubId === "all" ? "#fff" : "var(--text-sub)",
                        }}
                    >All</button>
                    {state.clubs.map(club => (
                        <button key={club.id}
                            onClick={() => dispatch({ type: "SET_ACTIVE_CLUB", clubId: club.id })}
                            style={{
                                padding: "0.35rem 0.75rem", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600, border: "none", whiteSpace: "nowrap", cursor: "pointer",
                                background: state.activeClubId === club.id ? "var(--amber)" : "var(--surface-2)",
                                color: state.activeClubId === club.id ? "#fff" : "var(--text-sub)",
                            }}
                        >
                            {club.icon} {club.name}
                        </button>
                    ))}
                </div>
            )}

            <nav className="mobile-tab-bar" style={{ position: "static", borderTop: "none" }}>
                {tabs.map((tab) => {
                    const active = pathname === tab.href;
                    return (
                        <Link key={tab.href} href={tab.href} style={tabStyle(active) as React.CSSProperties & { textDecoration: string }}>
                            <tab.icon size={19} />
                            {tab.label}
                        </Link>
                    );
                })}

                {/* Theme toggle */}
                <button onClick={() => dispatch({ type: "TOGGLE_DARK_MODE" })} style={tabStyle(false)}>
                    {state.darkMode ? <Sun size={19} /> : <Moon size={19} />}
                    {state.darkMode ? "Light" : "Dark"}
                </button>

                {/* Logout — always visible */}
                <button
                    onClick={handleLogout}
                    style={{ ...tabStyle(false), color: "rgba(248,113,113,0.7)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(248,113,113,0.7)")}
                >
                    <LogOut size={19} />
                    Logout
                </button>
            </nav>
        </div>
    );
}
