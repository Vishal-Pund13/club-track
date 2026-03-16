"use client";

import { useApp, useCurrentUser } from "@/lib/store";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

// ─── Streak ───────────────────────────────────────────────────────────────────

function StreakPanel({ streak }: { streak: number }) {
    return (
        <div className="streak-badge">
            <motion.div
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                style={{
                    fontSize: "2.5rem",
                    marginBottom: "0.25rem",
                }}
            >
                🔥
            </motion.div>
            <div
                style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "2.25rem",
                    fontWeight: 700,
                    color: "var(--amber)",
                    lineHeight: 1,
                }}
            >
                {streak}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                Day Streak
            </div>
        </div>
    );
}

// ─── Leaderboard Row ──────────────────────────────────────────────────────────

function LeaderRow({
    rank,
    initials,
    name,
    pts,
    maxPts,
    isMe,
}: {
    rank: number;
    initials: string;
    name: string;
    pts: number;
    maxPts: number;
    isMe: boolean;
}) {
    const pct = maxPts === 0 ? 0 : (pts / maxPts) * 100;
    const rankLabel =
        rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`;

    return (
        <div
            className={`lb-row ${isMe ? "me" : ""}`}
            style={{ position: "relative" }}
        >
            {/* Rank */}
            <span
                style={{
                    fontSize: rank <= 3 ? "0.9rem" : "0.75rem",
                    fontWeight: 700,
                    color:
                        rank === 1
                            ? "#FFD700"
                            : rank === 2
                                ? "#A8A8A8"
                                : rank === 3
                                    ? "#CD7F32"
                                    : "var(--text-muted)",
                    textAlign: "center",
                }}
            >
                {rankLabel}
            </span>

            {/* Avatar */}
            <div
                className="avatar"
                style={{
                    background: isMe ? "var(--amber)" : "var(--surface-2)",
                    color: isMe ? "#fff" : "var(--text-sub)",
                    border: "0.5px solid var(--border)",
                    fontSize: "0.65rem",
                }}
            >
                {initials}
            </div>

            {/* Name + bar */}
            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        fontSize: "0.78rem",
                        fontWeight: isMe ? 600 : 400,
                        color: "var(--text)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {name}
                    {isMe && (
                        <span
                            style={{
                                fontSize: "0.6rem",
                                color: "var(--amber)",
                                fontWeight: 600,
                                marginLeft: "0.3rem",
                            }}
                        >
                            (you)
                        </span>
                    )}
                </div>
                <div
                    style={{
                        height: 3,
                        background: "var(--surface-2)",
                        borderRadius: 9999,
                        overflow: "hidden",
                        marginTop: "0.25rem",
                        border: "0.5px solid var(--border)",
                    }}
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        style={{
                            height: "100%",
                            background: isMe ? "var(--amber)" : "var(--border-dark)",
                            borderRadius: 9999,
                        }}
                    />
                </div>
            </div>

            {/* Score */}
            <span
                style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: isMe ? "var(--amber)" : "var(--text-sub)",
                    fontFamily: "'JetBrains Mono', monospace",
                }}
            >
                {pts}
            </span>
        </div>
    );
}



// ─── Right Panel ──────────────────────────────────────────────────────────────

export default function RightPanel() {
    const { state } = useApp();
    const user = useCurrentUser();

    const sorted = [...state.users].sort((a, b) => b.total_pts - a.total_pts);
    const maxPts = sorted[0]?.total_pts ?? 1;

    return (
        <aside className="right-panel">
            {/* Streak */}
            <StreakPanel streak={user.streak} />

            <div className="divider" style={{ margin: "1.25rem 0" }} />

            {/* Leaderboard */}
            <div
                style={{
                    fontSize: "0.67rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text-muted)",
                    marginBottom: "0.65rem",
                }}
            >
                Rankings
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                {sorted.slice(0, 6).map((u, i) => (
                    <LeaderRow
                        key={u.id}
                        rank={i + 1}
                        initials={u.initials}
                        name={u.name}
                        pts={u.total_pts}
                        maxPts={maxPts}
                        isMe={u.id === state.currentUserId}
                    />
                ))}
            </div>


        </aside>
    );
}
