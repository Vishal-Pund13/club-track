"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Trophy, User, Shield, Moon, Sun, LogOut } from "lucide-react";
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
        { href: "/ops", icon: LayoutDashboard, label: "Home" },
        { href: "/leaderboard", icon: Trophy, label: "Rankings" },
        ...(user ? [{ href: "/profile", icon: User, label: "Profile" }] : []),
        ...((user?.role === "admin" || (captainClubs && captainClubs.length > 0))
            ? [{ href: "/admin", icon: Shield, label: user?.role === "admin" ? "Admin" : "Verify" }]
            : []),
    ];

    return (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "var(--surface)", borderTop: "1px solid var(--border)", boxShadow: "0 -2px 16px rgba(0,0,0,0.07)" }}>
            {/* Club chips — only on dashboard */}
            {pathname === "/ops" && (
                <div className="mobile-club-bar">
                    <button
                        className={`mobile-club-chip ${state.activeClubId === "all" ? "active" : ""}`}
                        onClick={() => dispatch({ type: "SET_ACTIVE_CLUB", clubId: "all" })}
                    >
                        🌐 All
                    </button>
                    {state.clubs.map(club => (
                        <button key={club.id}
                            className={`mobile-club-chip ${state.activeClubId === club.id ? "active" : ""}`}
                            onClick={() => dispatch({ type: "SET_ACTIVE_CLUB", clubId: club.id })}
                        >
                            {club.icon} {club.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Tab bar */}
            <nav className="mobile-tab-bar" style={{ position: "static" }}>
                {tabs.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`mobile-tab-bar-item ${active ? "active" : ""}`}
                        >
                            <Icon size={19} />
                            {label}
                        </Link>
                    );
                })}

                {/* Dark mode */}
                <button
                    className="mobile-tab-bar-item"
                    onClick={() => dispatch({ type: "TOGGLE_DARK_MODE" })}
                >
                    {state.darkMode ? <Sun size={19} /> : <Moon size={19} />}
                    {state.darkMode ? "Light" : "Dark"}
                </button>

                {/* Logout — only for authenticated users */}
                {user ? (
                    <button
                        className="mobile-tab-bar-item danger"
                        onClick={handleLogout}
                    >
                        <LogOut size={19} />
                        Logout
                    </button>
                ) : (
                    <Link href="/login" className="mobile-tab-bar-item">
                        <User size={19} />
                        Sign In
                    </Link>
                )}
            </nav>
        </div>
    );
}
