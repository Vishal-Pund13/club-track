"use client";

import { useApp } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Club } from "@/lib/data";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Crosshair, Trophy, Settings, LogOut, Shield } from "lucide-react";

function ClubItem({ club }: { club: Club }) {
    const { state, dispatch } = useApp();
    const isActive = state.activeClubId === club.id;
    const pathname = usePathname();
    const isDashboard = pathname === "/ops";

    const pts = (() => {
        const clubPts = state.userClubPoints[state.currentUserId] ?? {};
        if (club.id === "all") return Object.values(clubPts).reduce((s, v) => s + v, 0);
        return clubPts[club.id] ?? 0;
    })();

    return (
        <button
            className={`club-item w-full text-left ${isActive && isDashboard ? "active" : ""}`}
            onClick={() => dispatch({ type: "SET_ACTIVE_CLUB", clubId: club.id })}
            style={{ background: "none", border: "none" }}
        >
            <span style={{ fontSize: "1.15rem" }}>{club.icon}</span>
            <span style={{ flex: 1, fontSize: "0.825rem", fontWeight: isActive && isDashboard ? 600 : 400, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {club.name}
            </span>
            <span className="pill pill-amber" style={{ fontSize: "0.65rem" }}>{pts}</span>
        </button>
    );
}

export default function Sidebar() {
    const { state, dispatch } = useApp();
    const { user, isGuest, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    // Display info: auth user takes priority, else fallback to store
    const displayName = user ? user.name : "Civilian Observer";
    const displayInitials = user ? user.initials : "CO";
    const displaySub = user
        ? (user.role === "admin" ? "⭐ Admin · Armory" : `${user.aspirantType} · ${user.city}`)
        : "Guest Mode";

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div style={{ padding: "1.5rem 1.25rem 1rem", borderBottom: "0.5px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: 32, height: 32, background: "var(--amber)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
                        ⚔️
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "1.05rem", color: "var(--text)" }}>
                        ClubTrack
                    </span>
                </div>
            </div>

            {/* Guest banner */}
            {isGuest && !user && (
                <div style={{ margin: "0.75rem 1rem 0", padding: "0.55rem 0.75rem", background: "rgba(78,95,59,0.1)", border: "1px solid rgba(78,95,59,0.25)", borderRadius: 8, fontSize: "0.75rem", color: "var(--text-sub)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>👁 Civilian Observer</span>
                    <span>You&apos;re in guest mode.{" "}
                        <Link href="/login" style={{ color: "var(--amber)", fontWeight: 600, textDecoration: "none" }}>
                            Enlist to participate →
                        </Link>
                    </span>
                </div>
            )}

            {/* Nav links */}
            <div style={{ padding: "0.75rem 0.5rem 0.25rem" }}>
                <Link href="/ops" className={`nav-link ${pathname === "/ops" ? "active-nav" : ""}`} style={{ display: "flex", marginBottom: "0.15rem" }}>
                    <Crosshair size={14} />
                    Command Center
                </Link>
                <Link href="/leaderboard" className={`nav-link ${pathname === "/leaderboard" ? "active-nav" : ""}`} style={{ display: "flex", marginBottom: "0.15rem" }}>
                    <Trophy size={14} />
                    Rankings
                </Link>
                {user?.role === "admin" && (
                    <Link href="/admin" className={`nav-link ${pathname === "/admin" ? "active-nav" : ""}`} style={{ display: "flex" }}>
                        <Shield size={14} />
                        Armory
                    </Link>
                )}
            </div>

            <div className="divider" style={{ margin: "0.5rem 1rem" }} />

            {/* Squad list heading */}
            <div style={{ padding: "0 1.25rem", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.67rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    My Squads
                </span>
            </div>

            {/* Squads */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem", flex: 1 }}>
                <ClubItem club={{ id: "all", name: "All Squads", icon: "🌐", description: "", color: "var(--amber)" }} />
                {state.clubs.map((club) => <ClubItem key={club.id} club={club} />)}
            </div>

            {/* Bottom: user row */}
            <div style={{ borderTop: "0.5px solid var(--border)", padding: "0.75rem 1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div className="avatar" style={{ width: 34, height: 34 }}>
                        {displayInitials}
                    </div>
                    <div style={{ overflow: "hidden", flex: 1 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {displayName}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{displaySub}</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Stand Down (Logout)"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem", borderRadius: 4, display: "flex", alignItems: "center", transition: "color 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
