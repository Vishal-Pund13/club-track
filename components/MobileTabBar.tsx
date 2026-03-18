"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Crosshair, Trophy, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/store";

export default function MobileTabBar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { state, dispatch } = useApp();
    const router = useRouter();

    const tabs = [
        { href: "/ops", icon: Crosshair, label: "Ops" },
        { href: "/leaderboard", icon: Trophy, label: "Rankings" },
        ...(user?.role === "admin" ? [{ href: "/admin", icon: Settings, label: "Armory" }] : []),
    ];

    const iconStyle = (active: boolean): React.CSSProperties => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.2rem",
        color: active ? "var(--amber)" : "var(--text-muted)",
        textDecoration: "none",
        fontSize: "0.62rem",
        fontWeight: 500,
        padding: "0.35rem 0.65rem",
        background: "none",
        border: "none",
        cursor: "pointer",
        flex: 1,
        justifyContent: "center",
    });

    return (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "var(--surface)", borderTop: "0.5px solid var(--border)" }}>
            {/* Club Selector Strip (Ops only) */}
            {pathname === "/ops" && (
                <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", padding: "0.75rem 1rem", borderBottom: "0.5px solid var(--border)", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    <button
                        onClick={() => dispatch({ type: "SET_ACTIVE_CLUB", clubId: "all" })}
                        style={{
                            padding: "0.4rem 0.8rem", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600, border: "none", whiteSpace: "nowrap",
                            background: state.activeClubId === "all" ? "var(--amber)" : "var(--surface-2)",
                            color: state.activeClubId === "all" ? "#fff" : "var(--text-sub)",
                        }}
                    >
                        🌐 All
                    </button>
                    {state.clubs.map(club => (
                        <button
                            key={club.id}
                            onClick={() => dispatch({ type: "SET_ACTIVE_CLUB", clubId: club.id })}
                            style={{
                                padding: "0.4rem 0.8rem", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600, border: "none", whiteSpace: "nowrap",
                                background: state.activeClubId === club.id ? "var(--amber)" : "var(--surface-2)",
                                color: state.activeClubId === club.id ? "#fff" : "var(--text-sub)",
                            }}
                        >
                            {club.icon} {club.name}
                        </button>
                    ))}
                    <style>{`.mobile-club-strip::-webkit-scrollbar { display: none; }`}</style>
                </div>
            )}

            <nav className="mobile-tab-bar" style={{ position: "static", borderTop: "none" }}>
                {tabs.map((tab) => {
                    const active = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            style={iconStyle(active) as React.CSSProperties & { textDecoration: string }}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </Link>
                    );
                })}

                {/* Logout */}
                <button
                    onClick={() => { logout(); router.push("/"); }}
                    style={iconStyle(false)}
                >
                    <LogOut size={20} />
                    Leave
                </button>
            </nav>
        </div>
    );
}
