"use client";

import { useApp, usePendingVerifications, Verification, VerifStatus } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { CLUBS, TODAY } from "@/lib/data";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileTabBar from "@/components/MobileTabBar";
import { Plus, ChevronDown, ChevronUp, Check, X, Clock, ExternalLink, Shield } from "lucide-react";

type AdminTab = "overview" | "missions" | "deploy" | "roster" | "verify" | "captains";

interface CaptainAssignment {
    club_id: string;
    profile_id: string;
}

interface NewMissionForm {
    club_id: string;
    title: string;
    pts: number;
    description: string;
    requires_proof: boolean;
}

const DEFAULT_FORM: NewMissionForm = { club_id: CLUBS[0].id, title: "", pts: 20, description: "", requires_proof: true };

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, accent }: {
    icon: string; label: string; value: string | number; sub: string; accent?: boolean;
}) {
    return (
        <div style={{
            background: accent ? "rgba(78,95,59,0.07)" : "var(--surface)",
            border: `0.5px solid ${accent ? "rgba(78,95,59,0.3)" : "var(--border)"}`,
            borderRadius: 12, padding: "1.25rem 1.4rem",
        }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{icon}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.85rem", fontWeight: 700, color: accent ? "var(--amber)" : "var(--text)", lineHeight: 1, marginBottom: "0.2rem" }}>{value}</div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.1rem" }}>{label}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{sub}</div>
        </div>
    );
}

// ─── Verification Review Card ─────────────────────────────────────────────────

function VerifCard({ verif, onReview }: {
    verif: Verification;
    onReview: (id: string, status: VerifStatus, note: string) => void;
}) {
    const { state } = useApp();
    const task = state.tasks.find(t => t.id === verif.task_id);
    const club = state.clubs.find(c => c.id === task?.club_id);
    const profile = state.users.find(u => u.id === verif.user_id);
    const [note, setNote] = useState("");
    const [expanded, setExpanded] = useState(false);

    if (!task || !profile) return null;

    const submittedAt = new Date(verif.submitted_at);
    const timeLabel = submittedAt.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });

    return (
        <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", padding: "1rem 1.1rem" }}>
                {/* Avatar */}
                <div className="avatar" style={{ width: 34, height: 34, fontSize: "0.65rem", flexShrink: 0 }}>
                    {profile.initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>{profile.name}</span>
                        <span className="pill pill-neutral" style={{ fontSize: "0.62rem" }}>{club?.icon} {club?.name}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "var(--amber)", fontWeight: 700 }}>+{task.pts} pts</span>
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-sub)", marginBottom: "0.2rem" }}>{task.title}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Submitted {timeLabel}</div>
                </div>

                {/* Expand proof */}
                <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: "0.2rem" }}>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {/* Proof + review controls */}
            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
                        <div style={{ borderTop: "0.5px solid var(--border)", padding: "1rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            {/* Proof */}
                            <div>
                                <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                                    Proof Submitted
                                </div>
                                {verif.proof_text ? (
                                    <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: 8, padding: "0.7rem 0.9rem", fontSize: "0.82rem", color: "var(--text-sub)", wordBreak: "break-all" }}>
                                        {verif.proof_text.startsWith("http") ? (
                                            <a href={verif.proof_text} target="_blank" rel="noopener noreferrer"
                                                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--amber)", textDecoration: "none" }}>
                                                <ExternalLink size={12} /> Open proof link
                                            </a>
                                        ) : verif.proof_text}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>No proof text provided.</div>
                                )}
                            </div>

                            {/* Captain's note */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                                    Captain's Note (optional)
                                </label>
                                <input className="input-field" placeholder="e.g. Video was clear, good effort / Screenshot didn't match"
                                    value={note} onChange={e => setNote(e.target.value)} />
                            </div>

                            {/* Approve / Reject */}
                            <div style={{ display: "flex", gap: "0.6rem" }}>
                                <button className="btn-amber"
                                    onClick={() => { onReview(verif.id, "approved", note); setExpanded(false); }}
                                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                                    <Check size={14} /> Approve
                                </button>
                                <button
                                    onClick={() => { onReview(verif.id, "rejected", note); setExpanded(false); }}
                                    style={{
                                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                                        background: "rgba(248,113,113,0.08)", border: "0.5px solid rgba(248,113,113,0.3)",
                                        borderRadius: 8, color: "#f87171", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
                                        padding: "0.55rem",
                                    }}>
                                    <X size={14} /> Reject
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
    const { state, addTaskRealtime, toggleTaskActiveRealtime, reviewVerification } = useApp();
    const { user, captainClubs: authCaptainClubs } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>("overview");
    const [rosterPage, setRosterPage] = useState(0);
    const [form, setForm] = useState<NewMissionForm>(DEFAULT_FORM);
    const [submitted, setSubmitted] = useState(false);
    const [expandedMission, setExpandedMission] = useState<string | null>(null);
    const [enrolledCount, setEnrolledCount] = useState(0);
    const [captainAssignments, setCaptainAssignments] = useState<CaptainAssignment[]>([]);

    useEffect(() => {
        try {
            const users = JSON.parse(localStorage.getItem("ct_users") || "[]");
            setEnrolledCount(users.length);
        } catch { /* ignore */ }
    }, []);

    // Set default tab for Captains
    useEffect(() => {
        if (user && user.role !== "admin" && (authCaptainClubs || []).length > 0) {
            setActiveTab("verify");
        }
    }, [user, authCaptainClubs]);

    const fetchCaptainAssignments = async () => {
        const { supabase } = await import("@/lib/supabase");
        if (!supabase) return;
        const { data, error } = await supabase.from("captain_assignments").select("*");
        if (!error && data) setCaptainAssignments(data);
    };

    useEffect(() => {
        if (user?.role === "admin") {
            fetchCaptainAssignments();
        }
    }, [user]);

    // Reset roster pagination when roster size changes (or on mount)
    useEffect(() => {
        setRosterPage(0);
    }, [state.users.length]);

    async function assignCaptain(clubId: string, profileId: string) {
        const { supabase } = await import("@/lib/supabase");
        if (!supabase) return;
        const { error } = await supabase.from("captain_assignments").upsert({ club_id: clubId, profile_id: profileId }, { onConflict: "club_id,profile_id" });
        if (!error) fetchCaptainAssignments();
    }

    async function removeCaptain(clubId: string, profileId: string) {
        const { supabase } = await import("@/lib/supabase");
        if (!supabase) return;
        const { error } = await supabase.from("captain_assignments").delete().match({ club_id: clubId, profile_id: profileId });
        if (!error) fetchCaptainAssignments();
    }

    // All club IDs — admins see everything; captains only see their clubs
    const captainClubs = user?.role === "admin"
        ? CLUBS.map(c => c.id)
        : authCaptainClubs;

    const pendingVerifs = usePendingVerifications(captainClubs);

    // ── Derived stats ───────────────────────────────────────────────────────────

    const todayTasks = state.tasks.filter(t => t.date === TODAY && t.active);
    const allTodayTasks = state.tasks.filter(t => t.date === TODAY);

    const todayPtsPerUser: Record<string, number> = {};
    state.completions.forEach(c => {
        const task = state.tasks.find(t => t.id === c.task_id);
        if (task?.date === TODAY && task?.active) {
            todayPtsPerUser[c.user_id] = (todayPtsPerUser[c.user_id] ?? 0) + task.pts;
        }
    });

    const totalPossible = todayTasks.length * state.users.length;
    const totalDone = state.completions.filter(c => state.tasks.find(t => t.id === c.task_id)?.date === TODAY).length;
    const completionRate = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

    const topEntry = Object.entries(todayPtsPerUser).sort((a, b) => b[1] - a[1])[0];
    const topPerformer = topEntry ? state.users.find(u => u.id === topEntry[0]) : null;
    const strugglingAspirants = state.users.filter(u => !todayPtsPerUser[u.id]);
    const activityItems = Object.entries(todayPtsPerUser)
        .sort((a, b) => b[1] - a[1])
        .map(([userId, pts]) => {
            const user = state.users.find(u => u.id === userId);
            const missionsDone = state.completions.filter(c => {
                const t = state.tasks.find(t2 => t2.id === c.task_id);
                return c.user_id === userId && t?.date === TODAY;
            }).length;
            return { user, pts, missionsDone };
        })
        .filter(x => x.user);
    const missionCompletions = (taskId: string) => state.completions.filter(c => c.task_id === taskId);

    // Deploy handler
    async function handleDeploy(e: React.FormEvent) {
        e.preventDefault();
        if (!form.title.trim()) return;
        await addTaskRealtime({ ...form, date: TODAY, active: true });
        setSubmitted(true);
        setForm(DEFAULT_FORM);
        setTimeout(() => setSubmitted(false), 3000);
    }

    const dateLabel = new Date(TODAY).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    let tabs: { id: AdminTab; label: string; icon: string; badge?: number }[] = [];

    if (user?.role === "admin") {
        tabs = [
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "missions", label: "Missions", icon: "🎖" },
            { id: "deploy", label: "Deploy", icon: "🎯" },
            { id: "roster", label: "Roster", icon: "🪖" },
            { id: "verify", label: "Verify", icon: "🛡", badge: pendingVerifs.length },
            { id: "captains", label: "Captains", icon: "🎖️" },
        ];
    } else if ((authCaptainClubs || []).length > 0) {
        tabs = [
            { id: "verify", label: "Verify", icon: "🛡", badge: pendingVerifs.length },
        ];
    }

    async function handleReview(id: string, status: VerifStatus, note: string) {
        if (!user) return;
        await reviewVerification(id, status, note, user.id);
    }

    return (
        <>
            <div className="page-wrapper">
                <Sidebar />

                <main className="page-main">
                    {/* Header */}
                    <div style={{ marginBottom: "2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.2rem" }}>
                            <span style={{ fontSize: "1.4rem" }}>⚔️</span>
                            <h1 style={{ margin: 0 }}>Armory Command</h1>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>{dateLabel}</p>
                    </div>

                    {/* Tab Bar */}
                    <div className="tab-bar" style={{ marginBottom: "2rem" }}>
                        {tabs.map(t => (
                            <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`}
                                style={{ background: "none", border: "none", position: "relative" }} onClick={() => setActiveTab(t.id)}>
                                {t.icon} {t.label}
                                {t.badge && t.badge > 0 && (
                                    <span style={{
                                        position: "absolute", top: -3, right: -4,
                                        background: "#f87171", color: "#fff",
                                        fontSize: "0.6rem", fontWeight: 700,
                                        borderRadius: "50%", width: 14, height: 14,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>{t.badge}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ════════════════ OVERVIEW ════════════════════════════════ */}
                    {activeTab === "overview" && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
                                <KpiCard icon="🪖" label="Operatives" value={state.users.length} sub={enrolledCount > 0 ? `+${enrolledCount} enlisted` : "Mock dataset"} />
                                <KpiCard icon="🎯" label="Missions Today" value={todayTasks.length} sub={`${allTodayTasks.length - todayTasks.length} paused`} />
                                <KpiCard icon="✅" label="Completion Rate" value={`${completionRate}%`} sub={`${totalDone} of ${totalPossible} done`} accent />
                                <KpiCard icon="🏆" label="Top Operative" value={topPerformer?.name.split(" ")[0] ?? "—"} sub={topEntry ? `${topEntry[1]} pts today` : "No activity yet"} />
                                <KpiCard icon="🛡" label="Pending Reviews" value={pendingVerifs.length} sub="Awaiting captain action" accent={pendingVerifs.length > 0} />
                            </div>

                            {/* Pending alert */}
                            {pendingVerifs.length > 0 && (
                                <div style={{ background: "rgba(239,159,39,0.06)", border: "1px solid rgba(239,159,39,0.22)", borderRadius: 10, padding: "0.9rem 1.1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                    <Clock size={16} style={{ color: "var(--amber)", flexShrink: 0 }} />
                                    <span style={{ fontSize: "0.82rem", color: "var(--text-sub)", fontWeight: 500 }}>
                                        {pendingVerifs.length} submission{pendingVerifs.length > 1 ? "s" : ""} waiting for your review.{" "}
                                        <button onClick={() => setActiveTab("verify")} style={{ background: "none", border: "none", color: "var(--amber)", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: "0.82rem" }}>
                                            Review now →
                                        </button>
                                    </span>
                                </div>
                            )}

                            {/* Needs Attention */}
                            {strugglingAspirants.length > 0 && (
                                <div style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: "1.1rem 1.25rem", marginBottom: "1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                        <span>⚠️</span>
                                        <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>
                                            Needs Attention — {strugglingAspirants.length} operative{strugglingAspirants.length > 1 ? "s" : ""} with no missions today
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                        {strugglingAspirants.map(u => (
                                            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", background: "var(--surface)", borderRadius: 8, border: "0.5px solid var(--border)" }}>
                                                <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.6rem" }}>{u.initials}</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{u.name}</div>
                                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{u.ssb_board}</div>
                                                </div>
                                                <span style={{ fontSize: "0.75rem", color: "var(--text-sub)" }}>🔥 {u.streak}d streak</span>
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: "var(--text-muted)" }}>{u.total_pts} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Today's Activity */}
                            <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: "1.25rem" }}>
                                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.85rem" }}>
                                    Today's Activity (Approved)
                                </div>
                                {activityItems.length === 0 ? (
                                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>No approved completions recorded yet today.</div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                        {activityItems.map(({ user, pts, missionsDone }) => (
                                            <div key={user!.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.55rem 0.75rem", background: "var(--surface-2)", borderRadius: 8 }}>
                                                <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.6rem" }}>{user!.initials}</div>
                                                <div style={{ flex: 1, fontSize: "0.85rem", color: "var(--text)", fontWeight: 500 }}>{user!.name}</div>
                                                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{missionsDone} missions</span>
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.88rem", fontWeight: 700, color: "var(--amber)" }}>+{pts}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ════════════════ VERIFY ══════════════ */}
                    {activeTab === "verify" && (
                        <motion.div key="verify" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ maxWidth: 660 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                                <Shield size={18} style={{ color: "var(--amber)" }} />
                                <div>
                                    <div style={{ fontWeight: 600, color: "var(--text)" }}>Mission Verification Queue</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                        Review aspirant proof submissions before points are credited
                                    </div>
                                </div>
                            </div>

                            {pendingVerifs.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "3rem 1rem", border: "0.5px dashed var(--border)", borderRadius: 12, color: "var(--text-muted)" }}>
                                    <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✅</div>
                                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>All clear, Captain!</div>
                                    <div style={{ fontSize: "0.8rem" }}>No pending submissions right now.</div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    <AnimatePresence>
                                        {pendingVerifs.map(v => (
                                            <motion.div key={v.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}>
                                                <VerifCard verif={v} onReview={handleReview} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ════════════════ MISSIONS ════════════════════════════════ */}
                    {activeTab === "missions" && (
                        <motion.div key="missions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ maxWidth: 820 }}>
                            {CLUBS.map(club => {
                                const clubTasks = allTodayTasks.filter(t => t.club_id === club.id);
                                if (clubTasks.length === 0) return null;
                                return (
                                    <div key={club.id} style={{ marginBottom: "1.75rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.55rem" }}>
                                            <span style={{ fontSize: "1rem" }}>{club.icon}</span>
                                            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>{club.name}</span>
                                            <span className="pill pill-neutral" style={{ fontSize: "0.62rem" }}>{clubTasks.length}</span>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                            {clubTasks.map(task => {
                                                const completions = missionCompletions(task.id);
                                                const isExpanded = expandedMission === task.id;
                                                const pct = state.users.length > 0 ? Math.round((completions.length / state.users.length) * 100) : 0;
                                                const pendingForTask = state.verifications.filter(v => v.task_id === task.id && v.status === "pending").length;
                                                return (
                                                    <div key={task.id} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem" }}>
                                                            <button className={`toggle ${task.active ? "on" : ""}`} onClick={() => toggleTaskActiveRealtime(task.id, task.active)} title={task.active ? "Pause" : "Activate"} />
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: "0.875rem", fontWeight: 500, color: task.active ? "var(--text)" : "var(--text-muted)", textDecoration: task.active ? "none" : "line-through" }}>
                                                                    {task.title}
                                                                </div>
                                                                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginTop: "0.35rem" }}>
                                                                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{task.pts} pts</span>
                                                                    <div className="progress-track" style={{ width: 80, height: 4 }}>
                                                                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                                                                    </div>
                                                                    <span style={{ fontSize: "0.7rem", fontWeight: 600, color: completions.length === 0 ? "var(--text-muted)" : "var(--amber)" }}>
                                                                        {completions.length}/{state.users.length} approved
                                                                    </span>
                                                                    {pendingForTask > 0 && (
                                                                        <span style={{ fontSize: "0.62rem", color: "var(--amber)", background: "rgba(239,159,39,0.1)", border: "0.5px solid rgba(239,159,39,0.3)", borderRadius: 5, padding: "0.1rem 0.4rem", fontWeight: 600 }}>
                                                                            <Clock size={9} style={{ display: "inline", marginRight: 2 }} />{pendingForTask} pending
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button onClick={() => setExpandedMission(isExpanded ? null : task.id)}
                                                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                                                                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                                            </button>
                                                        </div>
                                                        <AnimatePresence>
                                                            {isExpanded && (
                                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
                                                                    <div style={{ padding: "0.75rem 1rem 1rem", borderTop: "0.5px solid var(--border)" }}>
                                                                        <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                                                                            Approved by ({completions.length})
                                                                        </div>
                                                                        {completions.length === 0 ? (
                                                                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>No approved completions yet</div>
                                                                        ) : (
                                                                            <div className="completions-list">
                                                                                {completions.map(c => {
                                                                                    const u = state.users.find(u => u.id === c.user_id);
                                                                                    return u ? (
                                                                                        <div key={c.user_id} className="completion-chip">
                                                                                            <div className="avatar" style={{ width: 22, height: 22, fontSize: "0.55rem" }}>{u.initials}</div>
                                                                                            {u.name}
                                                                                        </div>
                                                                                    ) : null;
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                            {allTodayTasks.length === 0 && (
                                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)", border: "0.5px dashed var(--border)", borderRadius: 10 }}>
                                    🎖 No missions deployed today. Go to Deploy tab to add one.
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ════════════════ DEPLOY ══════════════════════════════════ */}
                    {activeTab === "deploy" && (
                        <motion.div key="deploy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ maxWidth: 480 }}>
                            <div className="card">
                                <h2 style={{ fontSize: "1rem", margin: "0 0 0.3rem" }}>🎯 Deploy Daily Mission</h2>
                                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "0 0 1.5rem" }}>
                                    Deployed missions are immediately visible to all enrolled aspirants.
                                </p>

                                <form onSubmit={handleDeploy} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-sub)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Squad</label>
                                        <select className="input-field" value={form.club_id}
                                            onChange={e => setForm(f => ({ ...f, club_id: e.target.value }))}
                                            style={{ background: "var(--surface)", cursor: "pointer" }}>
                                            {CLUBS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-sub)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Mission Title</label>
                                        <input className="input-field" placeholder="e.g. Complete a 5 km morning run"
                                            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-sub)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Description</label>
                                        <input className="input-field" placeholder="e.g. Log your run on Strava and share the activity link."
                                            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-sub)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                            Intel Points — <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--amber)" }}>{form.pts}</span>
                                        </label>
                                        <input type="range" min={5} max={50} step={5} value={form.pts}
                                            onChange={e => setForm(f => ({ ...f, pts: Number(e.target.value) }))}
                                            style={{ width: "100%", accentColor: "var(--amber)" }} />
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                            <span>5 — quick win</span><span>50 — intensive</span>
                                        </div>
                                    </div>

                                    {/* Requires proof toggle */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <button
                                            type="button"
                                            className={`toggle ${form.requires_proof ? "on" : ""}`}
                                            onClick={() => setForm(f => ({ ...f, requires_proof: !f.requires_proof }))}
                                        />
                                        <div>
                                            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>Require Proof Submission</div>
                                            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                                                {form.requires_proof ? "Aspirants must submit proof; captain reviews before points credit." : "Points credited immediately on completion."}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "0.25rem" }}>
                                        <button type="submit" className="btn-amber">
                                            <Plus size={14} /> Deploy Mission
                                        </button>
                                        <AnimatePresence>
                                            {submitted && (
                                                <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                                    style={{ fontSize: "0.8rem", color: "var(--amber)", fontWeight: 500 }}>
                                                    ✓ Mission deployed!
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* ════════════════ ROSTER ══════════════════════════════════ */}
                    {activeTab === "roster" && (
                        <motion.div key="roster" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ maxWidth: 820 }}>
                            {(() => {
                                const pageSize = 20;
                                const sortedUsers = [...state.users].sort(
                                    (a, b) => (todayPtsPerUser[b.id] ?? 0) - (todayPtsPerUser[a.id] ?? 0)
                                );
                                const total = sortedUsers.length;
                                const start = rosterPage * pageSize;
                                const end = Math.min(total, start + pageSize);
                                const pageUsers = sortedUsers.slice(start, end);
                                const canPrev = rosterPage > 0;
                                const canNext = end < total;

                                return (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1rem", fontWeight: 500 }}>
                                showing {total === 0 ? 0 : start + 1} to {end} of {total} aspirants {"·"} sorted by approved pts
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "2rem 2.25rem 1fr 5rem 5rem 5.5rem", gap: "0.5rem", alignItems: "center", padding: "0.25rem 1rem", marginBottom: "0.4rem" }}>
                                <div /><div />
                                <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Operative</div>
                                <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", textAlign: "center" }}>Streak</div>
                                <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", textAlign: "center" }}>Today</div>
                                <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", textAlign: "center" }}>Total Pts</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                {pageUsers.map((user, i) => {
                                    const todayPts = todayPtsPerUser[user.id] ?? 0;
                                    const missionsDoneToday = state.completions.filter(c => {
                                        const t = state.tasks.find(t2 => t2.id === c.task_id);
                                        return c.user_id === user.id && t?.date === TODAY && t?.active;
                                    }).length;
                                    const isStruggling = todayPts === 0;

                                    return (
                                        <div key={user.id} style={{
                                            display: "grid", gridTemplateColumns: "2rem 2.25rem 1fr 5rem 5rem 5.5rem",
                                            gap: "0.5rem", alignItems: "center", padding: "0.75rem 1rem",
                                            background: isStruggling ? "rgba(248,113,113,0.04)" : "var(--surface)",
                                            border: `0.5px solid ${isStruggling ? "rgba(248,113,113,0.18)" : "var(--border)"}`,
                                            borderRadius: 10,
                                        }}>
                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textAlign: "center" }}>
                                                {start + i === 0 ? "🥇" : start + i === 1 ? "🥈" : start + i === 2 ? "🥉" : `${start + i + 1}`}
                                            </span>
                                            <div className="avatar" style={{ width: 30, height: 30, fontSize: "0.6rem" }}>{user.initials}</div>
                                            <div>
                                                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>{user.name}</div>
                                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{user.ssb_board}</div>
                                            </div>
                                            <div style={{ textAlign: "center" }}>
                                                <span style={{ fontSize: "0.82rem", color: "var(--amber)" }}>🔥 {user.streak}d</span>
                                            </div>
                                            <div style={{ textAlign: "center" }}>
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", fontWeight: 700, color: isStruggling ? "#f87171" : "var(--amber)" }}>
                                                    {missionsDoneToday}/{todayTasks.length}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: "center" }}>
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>
                                                    {user.total_pts.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ display: "flex", justifyContent: "center", gap: "0.6rem", marginTop: "1rem" }}>
                                <button
                                    className="btn-neutral"
                                    onClick={() => setRosterPage(p => Math.max(0, p - 1))}
                                    disabled={!canPrev}
                                    style={{ opacity: canPrev ? 1 : 0.5, cursor: canPrev ? "pointer" : "not-allowed" }}
                                >
                                    Previous
                                </button>
                                <button
                                    className="btn-neutral"
                                    onClick={() => setRosterPage(p => p + 1)}
                                    disabled={!canNext}
                                    style={{ opacity: canNext ? 1 : 0.5, cursor: canNext ? "pointer" : "not-allowed" }}
                                >
                                    Next
                                </button>
                            </div>
                                );
                            })()}
                        </motion.div>
                    )}

                    {/* ════════════════ CAPTAINS ════════════════════════════════ */}
                    {activeTab === "captains" && user?.role === "admin" && (
                        <motion.div key="captains" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ maxWidth: 820 }}>
                            <div style={{ padding: "1.25rem", background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12 }}>
                                <div style={{ marginBottom: "1.5rem" }}>
                                    <h2 style={{ fontSize: "1rem", margin: "0 0 0.3rem" }}>🎖️ Captain Management</h2>
                                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
                                        Assign Captains to specific squads. Captains can only verify proof submissions for their assigned squads.
                                    </p>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    {CLUBS.filter(c => c.id !== "all").map(club => {
                                        const assignment = captainAssignments.find(a => a.club_id === club.id);
                                        const currentCaptain = assignment ? state.users.find(u => u.id === assignment.profile_id) : null;
                                        const potentialCaptains = state.users.filter(u => u.role !== "admin" && u.id !== currentCaptain?.id);

                                        return (
                                            <div key={club.id} style={{ padding: "1.1rem", background: "var(--surface-2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                                    <span style={{ fontSize: "1.2rem" }}>{club.icon}</span>
                                                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{club.name} Squad</span>
                                                </div>

                                                {currentCaptain ? (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 8 }}>
                                                        <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.6rem" }}>{currentCaptain.initials}</div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{currentCaptain.name}</div>
                                                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Current Captain</div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeCaptain(club.id, currentCaptain.id)}
                                                            className="btn-neutral"
                                                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.72rem", color: "#f87171" }}
                                                        >
                                                            <X size={12} style={{ display: "inline", marginRight: 4 }} /> Remove
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: "0.75rem", background: "rgba(78,95,59,0.05)", border: "1px dashed rgba(78,95,59,0.2)", borderRadius: 8, textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                                                        No captain assigned to this squad.
                                                    </div>
                                                )}

                                                <div style={{ marginTop: "1rem" }}>
                                                    <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                                                        Assign New Captain
                                                    </div>
                                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                                        <select
                                                            className="input-field"
                                                            style={{ flex: 1, fontSize: "0.8rem", background: "var(--surface)" }}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val) assignCaptain(club.id, val);
                                                            }}
                                                            value=""
                                                        >
                                                            <option value="" disabled>Select an aspirant...</option>
                                                            {potentialCaptains.map(u => (
                                                                <option key={u.id} value={u.id}>{u.name} ({u.city})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </main>
            </div>
            <MobileTabBar />
        </>
    );
}
