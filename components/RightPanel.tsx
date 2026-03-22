"use client";

import { useApp, useCurrentUser } from "@/lib/store";
import { motion } from "framer-motion";
import { Flame, Trophy } from "lucide-react";

function LeaderRow({ rank, initials, name, pts, maxPts, isMe }: {
    rank: number; initials: string; name: string; pts: number; maxPts: number; isMe: boolean;
}) {
    const pct = maxPts === 0 ? 0 : (pts / maxPts) * 100;
    const rankLabel = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`;

    return (
        <div className={`lb-row ${isMe ? "me" : ""}`}>
            <span style={{
                fontSize: rank <= 3 ? "0.9rem" : "0.75rem",
                fontWeight: 700,
                color: rank === 1 ? "#FFD700" : rank === 2 ? "#A8A8A8" : rank === 3 ? "#CD7F32" : "var(--text-muted)",
                textAlign: "center",
            }}>
                {rankLabel}
            </span>

            <div className="avatar" style={{
                width: 28, height: 28, fontSize: "0.6rem",
                background: isMe ? "var(--accent)" : "var(--surface-2)",
                color: isMe ? "#fff" : "var(--text-sub)",
                border: "1px solid var(--border)",
            }}>
                {initials}
            </div>

            <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.8rem", fontWeight: isMe ? 600 : 400, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {name}
                    {isMe && <span style={{ fontSize: "0.6rem", color: "var(--accent)", fontWeight: 600, marginLeft: "0.3rem" }}>(you)</span>}
                </div>
                <div style={{ height: 3, background: "var(--surface-2)", borderRadius: 9999, overflow: "hidden", marginTop: 3, border: "none" }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
                        style={{ height: "100%", background: isMe ? "var(--accent)" : "var(--border-dark)", borderRadius: 9999 }}
                    />
                </div>
            </div>

            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: isMe ? "var(--accent)" : "var(--text-sub)", fontFamily: "'JetBrains Mono', monospace" }}>
                {pts}
            </span>
        </div>
    );
}

export default function RightPanel() {
    const { state } = useApp();
    const user = useCurrentUser();

    const sorted = [...state.users].sort((a, b) => b.total_pts - a.total_pts);
    const maxPts = sorted[0]?.total_pts ?? 1;

    return (
        <aside className="right-panel">
            {/* Streak card */}
            <div style={{
                background: user.streak > 0 ? "linear-gradient(135deg, rgba(78,95,59,0.08) 0%, transparent 100%)" : "var(--surface-2)",
                border: `1px solid ${user.streak > 0 ? "rgba(78,95,59,0.25)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                padding: "1.1rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
            }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.1rem" }}>
                    <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>🔥</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.6rem", fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>
                        {user.streak}
                    </span>
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text)" }}>
                        {user.streak === 0 ? "No streak yet" : `${user.streak}-day streak`}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                        {user.streak === 0 ? "Complete a task today to start!" : "Keep it going — don't break it!"}
                    </div>
                </div>
            </div>

            <div className="divider" />

            {/* Rankings mini */}
            <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.65rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Trophy size={13} style={{ color: "var(--accent)" }} />
                        <span style={{ fontSize: "0.73rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                            Top Members
                        </span>
                    </div>
                    <a href="/leaderboard" style={{ fontSize: "0.72rem", color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                        View all →
                    </a>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.05rem" }}>
                    {sorted.slice(0, 7).map((u, i) => (
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
            </div>
        </aside>
    );
}
