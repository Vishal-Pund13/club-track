"use client";

import { useApp } from "@/lib/store";
import { CLUBS, TODAY } from "@/lib/data";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileTabBar from "@/components/MobileTabBar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Filter = "alltime" | "week" | "today";

export default function LeaderboardPage() {
    const { state } = useApp();
    const [filter, setFilter] = useState<Filter>("alltime");

    // Dynamic Score Computation
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
            
            if (c.completed_at.startsWith(TODAY)) {
                data[c.user_id].today += task.pts;
            }
            if (cDate >= sevenDaysAgo) {
                data[c.user_id].week += task.pts;
            }
        });
        return data;
    }, [state.completions, state.tasks, state.users]);

    const sorted = useMemo(() => {
        return [...state.users]
            .map((u) => {
                let score = u.total_pts;
                if (filter === "today") score = scores[u.id]?.today ?? 0;
                if (filter === "week") score = scores[u.id]?.week ?? 0;
                return { ...u, score };
            })
            .sort((a, b) => b.score - a.score);
    }, [state.users, state.completions, state.tasks, filter, scores]);

    const maxScore = sorted[0]?.score ?? 1;

    return (
        <>
            <div className="page-wrapper">
                <Sidebar />

                <main className="page-main">
                    {/* Header */}
                    <div style={{ marginBottom: "2rem", maxWidth: 760 }}>
                        <Link
                            href="/"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                fontSize: "0.8rem",
                                color: "var(--text-muted)",
                                textDecoration: "none",
                                marginBottom: "1rem",
                            }}
                        >
                            <ArrowLeft size={13} /> Back to Dashboard
                        </Link>
                        <h1 style={{ marginBottom: "0.25rem" }}>Leaderboard</h1>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-sub)" }}>
                            Rankings across all clubs and aspirants
                        </p>
                    </div>

                    {/* Filter tabs */}
                    <div className="tab-bar" style={{ maxWidth: 760 }}>
                        {(
                            [
                                { id: "alltime", label: "All Time" },
                                { id: "week", label: "This Week" },
                                { id: "today", label: "Today" },
                            ] as { id: Filter; label: string }[]
                        ).map((t) => (
                            <button
                                key={t.id}
                                className={`tab ${filter === t.id ? "active" : ""}`}
                                style={{ background: "none", border: "none" }}
                                onClick={() => setFilter(t.id)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Table header */}
                    <div
                        className="full-lb-row"
                        style={{
                            maxWidth: 760,
                            padding: "0.4rem 0.75rem",
                            marginBottom: "0.35rem",
                        }}
                    >
                        <span style={{ fontSize: "0.67rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                            Rank
                        </span>
                        <span />
                        <span style={{ fontSize: "0.67rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                            Name
                        </span>
                        {CLUBS.map((c) => (
                            <span
                                key={c.id}
                                className="club-pts-col"
                                style={{
                                    fontSize: "0.67rem",
                                    color: "var(--text-muted)",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    textAlign: "center",
                                }}
                                title={c.name}
                            >
                                {c.icon}
                            </span>
                        ))}
                        <span
                            style={{
                                fontSize: "0.67rem",
                                color: "var(--text-muted)",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                textAlign: "right",
                            }}
                        >
                            Total
                        </span>
                    </div>

                    {/* Rows */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={filter}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: "0.4rem" }}
                        >
                            {sorted.map((u, i) => {
                                const isMe = u.id === state.currentUserId;
                                const rank = i + 1;
                                const rankLabel =
                                    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`;

                                return (
                                    <div
                                        key={u.id}
                                        className="full-lb-row"
                                        style={{
                                            padding: "0.75rem 0.75rem",
                                            background: isMe ? "var(--amber-light)" : "var(--surface)",
                                            border: `0.5px solid ${isMe ? "var(--amber-dim)" : "var(--border)"}`,
                                            borderRadius: "10px",
                                            transition: "background 0.15s",
                                        }}
                                    >
                                        {/* Rank */}
                                        <span
                                            style={{
                                                fontSize: rank <= 3 ? "1rem" : "0.82rem",
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
                                            {u.initials}
                                        </div>

                                        {/* Name */}
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: "0.875rem",
                                                    fontWeight: isMe ? 600 : 400,
                                                    color: "var(--text)",
                                                }}
                                            >
                                                {u.name}
                                                {isMe && (
                                                    <span
                                                        style={{
                                                            fontSize: "0.65rem",
                                                            color: "var(--amber)",
                                                            fontWeight: 600,
                                                            marginLeft: "0.4rem",
                                                        }}
                                                    >
                                                        ← you
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                                {u.ssb_board}
                                            </div>
                                        </div>

                                        {/* Per-club pts */}
                                        {CLUBS.map((c) => {
                                            const pts = state.userClubPoints[u.id]?.[c.id] ?? 0;
                                            return (
                                                <span
                                                    key={c.id}
                                                    className="club-pts-col"
                                                    style={{
                                                        fontSize: "0.825rem",
                                                        fontWeight: 500,
                                                        color: "var(--text-sub)",
                                                        textAlign: "center",
                                                        fontFamily: "'Inter', sans-serif",
                                                    }}
                                                >
                                                    {pts}
                                                </span>
                                            );
                                        })}

                                        {/* Total */}
                                        <div style={{ textAlign: "right" }}>
                                            <span
                                                style={{
                                                    fontSize: "1rem",
                                                    fontWeight: 700,
                                                    fontFamily: "'JetBrains Mono', monospace",
                                                    color: isMe ? "var(--amber)" : "var(--text)",
                                                }}
                                            >
                                                {u.score}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "0.65rem",
                                                    color: "var(--text-muted)",
                                                    marginLeft: "0.2rem",
                                                }}
                                            >
                                                pts
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            <MobileTabBar />
        </>
    );
}
