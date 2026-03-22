"use client";

import { useApp } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Club } from "@/lib/data";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Trophy, Settings, LogOut, Shield, Moon, Sun, User, ChevronRight
} from "lucide-react";

function ClubChip({ club }: { club: Club }) {
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
      style={{ background: "none", border: "none", width: "100%" }}
    >
      <span style={{ fontSize: "1rem", flexShrink: 0 }}>{club.icon}</span>
      <span style={{
        flex: 1, fontSize: "0.82rem",
        fontWeight: isActive && isDashboard ? 600 : 400,
        color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
      }}>
        {club.name}
      </span>
      <span style={{
        fontSize: "0.68rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
        color: isActive && isDashboard ? "var(--accent)" : "var(--text-muted)",
        background: isActive && isDashboard ? "var(--accent-light)" : "var(--surface-2)",
        borderRadius: 9999, padding: "0.1rem 0.45rem",
        transition: "all 0.15s",
      }}>
        {pts}
      </span>
    </button>
  );
}

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const { user, isGuest, logout, captainClubs } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const displayName = user ? user.name : "Guest";
  const displayInitials = user ? user.initials : "G";
  const displaySub = user
    ? (user.role === "admin" ? "Administrator" : `${user.aspirantType ?? ""} · ${user.city ?? ""}`.trim().replace(/^·\s*/, ""))
    : "Browsing as guest";

  const navItems = [
    { href: "/ops", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/leaderboard", icon: Trophy, label: "Rankings" },
    ...(user ? [{ href: "/profile", icon: User, label: "Profile" }] : []),
    ...((user?.role === "admin" || (captainClubs && captainClubs.length > 0))
      ? [{ href: "/admin", icon: Shield, label: user?.role === "admin" ? "Admin Panel" : "Verify" }]
      : []),
  ];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div style={{ padding: "1.25rem 1rem 0.75rem", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{
            width: 30, height: 30, background: "var(--accent)", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem",
            flexShrink: 0,
          }}>
            🎯
          </div>
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
            ClubTrack
          </span>
        </Link>
      </div>

      {/* Guest banner */}
      {isGuest && !user && (
        <div style={{ margin: "0.75rem 0.75rem 0", padding: "0.6rem 0.85rem", background: "var(--accent-light)", border: "1px solid var(--accent-dim)", borderRadius: 8, fontSize: "0.78rem", color: "var(--text-sub)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <span style={{ fontWeight: 600, color: "var(--text)" }}>Browsing as Guest</span>
          <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none", fontSize: "0.77rem" }}>
            Sign in to earn points →
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav style={{ padding: "0.6rem 0.5rem 0.25rem", display: "flex", flexDirection: "column", gap: "0.1rem" }}>
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${pathname === href ? "active-nav" : ""}`}
          >
            <Icon size={15} style={{ flexShrink: 0 }} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="divider" style={{ margin: "0.5rem 0.75rem" }} />

      {/* Club list */}
      <div style={{ padding: "0 0.5rem 0.25rem" }}>
        <div style={{ padding: "0 0.25rem 0.4rem 0.25rem", fontSize: "0.67rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          My Clubs
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.05rem" }}>
          <ClubChip club={{ id: "all", name: "All Clubs", icon: "🌐", description: "", color: "var(--accent)" }} />
          {state.clubs.map((club) => <ClubChip key={club.id} club={club} />)}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* User row */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "0.75rem 0.85rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div className="avatar" style={{ width: 32, height: 32, fontSize: "0.65rem", cursor: "pointer" }}>
            {displayInitials}
          </div>
          <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {displayName}
              </div>
              {captainClubs.length > 0 && (
                <span style={{ fontSize: "0.58rem", background: "var(--accent-light)", color: "var(--accent)", border: "1px solid var(--accent-dim)", borderRadius: 4, padding: "0.1rem 0.3rem", fontWeight: 700, flexShrink: 0 }}>
                  CAPTAIN
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displaySub}</div>
          </div>
          <div style={{ display: "flex", gap: "0.15rem", flexShrink: 0 }}>
            <button
              onClick={() => dispatch({ type: "TOGGLE_DARK_MODE" })}
              className="icon-btn"
              title={state.darkMode ? "Light mode" : "Dark mode"}
            >
              {state.darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={handleLogout}
              className="icon-btn"
              title="Sign out"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
