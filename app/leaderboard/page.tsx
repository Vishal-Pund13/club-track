"use client";

import { useApp } from "@/lib/store";
import { CLUBS, TODAY } from "@/lib/data";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileTabBar from "@/components/MobileTabBar";
import { Trophy, Flame } from "lucide-react";

type Filter = "alltime" | "week" | "today";

export default function LeaderboardPage() {
    const { state } = useApp();
    const [filter, setFilter] = useState<Filter>("alltime");

    const scores = useMemo(() => {
        const today = new Date(TODAY).getTime();
        const startOfWeek = new Date(TODAY);
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        const sevenDaysAgo = startOfWeek.getTime();

        const data: Record<string, { today: number; week: number }> = {};
        state.users.forEach(u => { data[u.id] = { today: 0, week: 0 }; });

        state.completions.forEach(c => {
            const task = state.tasks.find(t => t.id === c.task_id);
            if (!task) return;
            const cDate = new Date(c.completed_at).getTime();
            if (c.completed_at.startsWith(TODAY)) data[c.user_id].today += task.pts;
            if (cDate >= sevenDaysAgo) data[c.user_id].week += task.pts;
        });
        return data;
    }, [state.completions, state.tasks, state.users]);

    const sorted = useMemo(() => {
        return [...state.users]
            .map(u => {
                let score = u.total_pts;
                if (filter === "today") score = scores[u.id]?.today ?? 0;
                if (filter === "week") score = scores[u.id]?.week ?? 0;
                return { ...u, score };
            })
            .sort((a, b) => b.score - a.score);
    }, [state.users, state.completions, state.tasks, filter, scores]);

    const maxScore = sorted[0]?.score ?? 1;
    const myRank = sorted.findIndex(u => u.id === state.currentUserId) + 1;

    const filterOptions: { id: Filter; label: string }[] = [
        { id: "alltime", label: "All Time" },
        { id: "week", label: "This Week" },
        { id: "today", label: "Today" },
    ];

    const rankBadge = (rank: number) =>
        rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`;

    const rankColor = (rank: number) =>
        rank === 1 ? "#FFD700" : rank === 2 ? "#A8A8A8" : rank === 3 ? "#CD7F32" : "var(--text-muted)";

    return (
        <>
            <div className="page-wrapper">
                <Sidebar />

                <main className="page-main">
                    <div style={{ maxWidth: 760, margin: "0 auto" }}>
                        {/* Header */}
                        <div className="page-header">
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
                                <Trophy size={20} style={{ color: "var(--accent)" }} />
                                <h1 style={{ margin: 0 }}>Rankings</h1>
                                {myRank > 0 && (
                                    <span style={{ fontSize: "0.75rem", fontWeight: 600, background: "var(--accent-light)", color: "var(--accent)", border: "1px solid var(--accent-dim)", borderRadius: 9999, padding: "0.2rem 0.65rem", marginLeft: "auto" }}>
                                        You're #{myRank}
                                    </span>
                                )}
                            </div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                                Points earned by all members · updated in real-time
                            </p>
                        </div>

                        {/* Filter Pills */}
                        <div style={{ display: "flex", gap: "0.35rem", marginBottom: "1.5rem" }}>
                            {filterOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setFilter(opt.id)}
                                    style={{
                                        padding: "0.4rem 0.9rem",
                                        borderRadius: 9999,
                                        fontSize: "0.82rem",
                                        fontWeight: 600,
                                        border: "1px solid",
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                        background: filter === opt.id ? "var(--accent)" : "transparent",
                                        color: filter === opt.id ? "#fff" : "var(--text-muted)",
                                        borderColor: filter === opt.id ? "var(--accent)" : "var(--border-dark)",
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Top 3 Podium */}
                        {sorted.length >= 3 && filter === "alltime" && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                                {[sorted[1], sorted[0], sorted[2]].map((u, podiumIdx) => {
                                    const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
                                    const isMe = u.id === state.currentUserId;
                                    const heights = ["70%", "100%", "55%"];
                                    return (
                                        <div key={u.id} style={{
                                            display: "flex", flexDirection: "column", alignItems: "center",
                                            justifyContent: "flex-end", order: podiumIdx === 1 ? -1 : podiumIdx,
                                        }}>
                                            <div style={{
                                                width: "100%",
                                                background: isMe ? "var(--accent-light)" : "var(--surface)",
                                                border: `1px solid ${isMe ? "var(--accent-dim)" : "var(--border)"}`,
                                                borderRadius: "var(--radius)",
                                                padding: "1rem 0.75rem",
                                                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem",
                                                boxShadow: rank === 1 ? "var(--shadow)" : "none",
                                                order: rank === 1 ? 2 : 1,
                                            }}>
                                                <span style={{ fontSize: "1.5rem" }}>{rankBadge(rank)}</span>
                                                <div className="avatar" style={{ width: 36, height: 36, fontSize: "0.7rem", background: isMe ? "var(--accent)" : "var(--surface-2)", color: isMe ? "#fff" : "var(--text)" }}>
                                                    {u.initials}
                                                </div>
                                                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)", textAlign: "center", lineHeight: 1.2, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {u.name.split(" ")[0]}
                                                </div>
                                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", fontWeight: 700, color: isMe ? "var(--accent)" : "var(--text)" }}>
                                                    {u.score} <span style={{ fontSize: "0.65rem", fontWeight: 500, color: "var(--text-muted)" }}>pts</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Table column headers */}
                        <div className="full-lb-row" style={{ padding: "0.3rem 0.75rem", marginBottom: "0.35rem" }}>
                            <span style={{ fontSize: "0.67rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rank</span>
                            <span />
                            <span style={{ fontSize: "0.67rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Name</span>
                            {CLUBS.map(c => (
                                <span key={c.id} className="club-pts-col" style={{ fontSize: "0.67rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", textAlign: "center" }} title={c.name}>
                                    {c.icon}
                                </span>
                            ))}
                            <span style={{ fontSize: "0.67rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>Total</span>
                        </div>

                        {/* Rows */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={filter}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                                style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}
                            >
                                {sorted.length === 0 && (
                                    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                                        <Trophy size={32} style={{ marginBottom: "0.75rem", opacity: 0.35 }} />
                                        <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>No data yet</div>
                                        <div style={{ fontSize: "0.82rem" }}>Complete tasks to appear on the leaderboard.</div>
                                    </div>
                                )}
                                {sorted.map((u, i) => {
                                    const isMe = u.id === state.currentUserId;
                                    const rank = i + 1;
                                    const pct = maxScore === 0 ? 0 : (u.score / maxScore) * 100;

                                    return (
                                        <div
                                            key={u.id}
                                            className="full-lb-row"
                                            style={{
                                                padding: "0.75rem",
                                                background: isMe ? "var(--accent-light)" : "var(--surface)",
                                                border: `1px solid ${isMe ? "var(--accent-dim)" : "var(--border)"}`,
                                                borderRadius: "var(--radius-sm)",
                                                transition: "background 0.12s, border-color 0.12s",
                                            }}
                                        >
                                            <span style={{ fontSize: rank <= 3 ? "1rem" : "0.82rem", fontWeight: 700, color: rankColor(rank), textAlign: "center" }}>
                                                {rankBadge(rank)}
                                            </span>

                                            <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.6rem", background: isMe ? "var(--accent)" : "var(--surface-2)", color: isMe ? "#fff" : "var(--text-sub)", border: "1px solid var(--border)" }}>
                                                {u.initials}
                                            </div>

                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                                    <span style={{ fontSize: "0.875rem", fontWeight: isMe ? 600 : 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {u.name}
                                                    </span>
                                                    {isMe && <span style={{ fontSize: "0.62rem", color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>← you</span>}
                                                    {u.streak > 0 && (
                                                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", flexShrink: 0, display: "flex", alignItems: "center", gap: "0.15rem" }}>
                                                            🔥{u.streak}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* progress bar */}
                                                <div style={{ height: 3, background: "var(--surface-2)", borderRadius: 9999, marginTop: 4, overflow: "hidden", width: "100%", maxWidth: 120 }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.55, ease: "easeOut" }}
                                                        style={{ height: "100%", background: isMe ? "var(--accent)" : "var(--border-dark)", borderRadius: 9999 }}
                                                    />
                                                </div>
                                            </div>

                                            {CLUBS.map(c => {
                                                const pts = state.userClubPoints[u.id]?.[c.id] ?? 0;
                                                return (
                                                    <span key={c.id} className="club-pts-col" style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-sub)", textAlign: "center" }}>
                                                        {pts}
                                                    </span>
                                                );
                                            })}

                                            <div style={{ textAlign: "right" }}>
                                                <span style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: isMe ? "var(--accent)" : "var(--text)" }}>
                                                    {u.score}
                                                </span>
                                                <span style={{ fontSize: "0.63rem", color: "var(--text-muted)", marginLeft: "0.2rem" }}>pts</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
            <MobileTabBar />
        </>
    );
}
