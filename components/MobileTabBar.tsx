"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Crosshair, Trophy, Settings, LogOut, Moon, Sun } from "lucide-react";
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
        <nav className="mobile-tab-bar" style={{ justifyContent: "space-around" }}>
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

            {/* Dark mode toggle */}
            <button
                onClick={() => dispatch({ type: "TOGGLE_DARK_MODE" })}
                style={iconStyle(false)}
                title={state.darkMode ? "Switch to Light" : "Switch to Dark"}
            >
                {state.darkMode ? <Sun size={20} /> : <Moon size={20} />}
                {state.darkMode ? "Light" : "Dark"}
            </button>

            {/* Logout */}
            <button
                onClick={() => { logout(); router.push("/"); }}
                style={iconStyle(false)}
            >
                <LogOut size={20} />
                Leave
            </button>
        </nav>
    );
}
