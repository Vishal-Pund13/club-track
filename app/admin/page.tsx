"use client";

import { useApp, usePendingVerifications, Verification, VerifStatus } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { CLUBS, TODAY } from "@/lib/data";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileTabBar from "@/components/MobileTabBar";
import { Plus, ChevronDown, ChevronUp, Check, X, Clock, ExternalLink, Shield, Users, ListTodo, UserPlus, ClipboardCheck } from "lucide-react";

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
        <div className={`stat-card ${accent ? "card-hover" : ""}`} style={{
            background: accent ? "var(--accent-light)" : "var(--surface)",
            borderColor: accent ? "var(--accent-dim)" : "var(--border)",
        }}>
            <div style={{ fontSize: "1.4rem", marginBottom: "0.2rem" }}>{icon}</div>
            <div className="stat-value" style={{ color: accent ? "var(--accent)" : "var(--text)" }}>{value}</div>
            <div className="stat-label">{label}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{sub}</div>
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
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", padding: "1rem" }}>
                {/* Avatar */}
                <div className="avatar" style={{ width: 34, height: 34, fontSize: "0.65rem", flexShrink: 0 }}>
                    {profile.initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>{profile.name}</span>
                        <span className="pill pill-neutral">{club?.icon} {club?.name}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "var(--amber)", fontWeight: 700 }}>+{task.pts} pts</span>
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-sub)", marginBottom: "0.2rem" }}>{task.title}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Submitted {timeLabel}</div>
                </div>

                {/* Expand proof */}
                <button className="icon-btn" onClick={() => setExpanded(e => !e)}>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {/* Proof + review controls */}
            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                        <div style={{ borderTop: "1px solid var(--border)", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.85rem", background: "var(--surface)" }}>
                            {/* Proof */}
                            <div>
                                <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                                    Proof Submitted
                                </div>
                                {verif.proof_text ? (
                                    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0.7rem 0.9rem", fontSize: "0.82rem", color: "var(--text-sub)", wordBreak: "break-all" }}>
                                        {verif.proof_text.startsWith("http") ? (
                                            <a href={verif.proof_text} target="_blank" rel="noopener noreferrer"
                                                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--amber)", textDecoration: "none", fontWeight: 500 }}>
                                                <ExternalLink size={12} /> View attached link
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
                                    Captain's Feedback (optional)
                                </label>
                                <input className="input-field" placeholder="e.g. Good effort on the run!"
                                    value={note} onChange={e => setNote(e.target.value)} />
                            </div>

                            {/* Approve / Reject */}
                            <div style={{ display: "flex", gap: "0.6rem" }}>
                                <button className="btn-amber"
                                    onClick={() => { onReview(verif.id, "approved", note); setExpanded(false); }}
                                    style={{ flex: 1, justifyContent: "center" }}>
                                    <Check size={14} /> Approve
                                </button>
                                <button
                                    onClick={() => { onReview(verif.id, "rejected", note); setExpanded(false); }}
                                    className="btn-danger"
                                    style={{ flex: 1, justifyContent: "center" }}>
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
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

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

    const dateLabel = new Date(TODAY).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    let tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [];

    if (user?.role === "admin") {
        tabs = [
            { id: "overview", label: "Overview", icon: <ClipboardCheck size={15}/> },
            { id: "missions", label: "Tasks", icon: <ListTodo size={15}/> },
            ...(!isMobile ? [{ id: "deploy" as AdminTab, label: "Post Task", icon: <Plus size={15}/> }] : []),
            { id: "roster", label: "Members", icon: <Users size={15}/> },
            { id: "verify", label: "Verify", icon: <Shield size={15}/>, badge: pendingVerifs.length },
            { id: "captains", label: "Captains", icon: <UserPlus size={15}/> },
        ];
    } else if ((authCaptainClubs || []).length > 0) {
        tabs = [
            { id: "verify", label: "Verify Submissions", icon: <Shield size={15}/>, badge: pendingVerifs.length },
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
                    <div className="page-header">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <Shield size={24} style={{ color: "var(--accent)" }} />
                            <h1>
                                {user?.role === "admin" ? "Admin Panel" : "Verification Centre"}
                            </h1>
                        </div>
                        <p>{dateLabel}</p>
                    </div>

                    {/* Tab Bar */}
                    <div className="tab-bar" style={{ overflowX: "auto", overflowY: "hidden" }}>
                        {tabs.map(t => (
                            <button key={t.id} className={`tab flex-center gap-sm ${activeTab === t.id ? "active" : ""}`}
                                style={{ position: "relative", flexShrink: 0, whiteSpace: "nowrap", border: "none", background: "none" }} onClick={() => setActiveTab(t.id)}>
                                {t.icon} {t.label}
                                {t.badge && t.badge > 0 && (
                                    <span style={{
                                        position: "absolute", top: -2, right: -4,
                                        background: "#f87171", color: "#fff",
                                        fontSize: "0.55rem", fontWeight: 700,
                                        borderRadius: "50%", minWidth: 15, height: 15,
                                        display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px"
                                    }}>{t.badge}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ════════════════ OVERVIEW ════════════════════════════════ */}
                    {activeTab === "overview" && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                            <div className="kpi-grid">
                                <KpiCard icon="👥" label="Members" value={state.users.length} sub={enrolledCount > 0 ? `+${enrolledCount} joined` : "Active members"} />
                                <KpiCard icon="📋" label="Tasks Today" value={todayTasks.length} sub={`${allTodayTasks.length - todayTasks.length} paused`} />
                                <KpiCard icon="📈" label="Completion" value={`${completionRate}%`} sub={`${totalDone} of ${totalPossible} done`} accent />
                                <KpiCard icon="🏆" label="Top Member" value={topPerformer?.name.split(" ")[0] ?? "—"} sub={topEntry ? `${topEntry[1]} pts today` : "No activity yet"} />
                                <KpiCard icon="🛡" label="Pending" value={pendingVerifs.length} sub="Awaiting review" accent={pendingVerifs.length > 0} />
                            </div>

                            {/* Pending alert */}
                            {pendingVerifs.length > 0 && (
                                <div style={{ background: "rgba(239,159,39,0.08)", border: "1px solid rgba(239,159,39,0.25)", borderRadius: "var(--radius)", padding: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                    <Clock size={16} style={{ color: "var(--amber)", flexShrink: 0 }} />
                                    <span style={{ fontSize: "0.85rem", color: "var(--text-sub)", fontWeight: 500 }}>
                                        {pendingVerifs.length} submission{pendingVerifs.length > 1 ? "s" : ""} waiting for your review.{" "}
                                        <button onClick={() => setActiveTab("verify")} style={{ background: "none", border: "none", color: "var(--amber)", fontWeight: 700, cursor: "pointer", padding: 0 }}>
                                            Review now →
                                        </button>
                                    </span>
                                </div>
                            )}

                            {/* Needs Attention */}
                            {strugglingAspirants.length > 0 && (
                                <div className="card" style={{ marginBottom: "1.5rem", borderColor: "rgba(248,113,113,0.3)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                        <span>⚠️</span>
                                        <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text)" }}>
                                            Needs Attention — {strugglingAspirants.length} member{strugglingAspirants.length > 1 ? "s" : ""} falling behind
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                        {strugglingAspirants.map(u => (
                                            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 1rem", background: "var(--bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                                                <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.6rem" }}>{u.initials}</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
                                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{u.ssb_board}</div>
                                                </div>
                                                <span style={{ fontSize: "0.75rem", color: "var(--text-sub)", whiteSpace: "nowrap" }}>🔥 {u.streak}d streak</span>
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: "var(--text-muted)" }}>{u.total_pts} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Today's Activity */}
                            <div className="card">
                                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.85rem" }}>
                                    Today's Approved Activity
                                </div>
                                {activityItems.length === 0 ? (
                                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "2rem 1rem", background: "var(--bg)", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border)" }}>
                                        No approved completions recorded yet today.
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                        {activityItems.map(({ user, pts, missionsDone }) => (
                                            <div key={user!.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 1rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                                                <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.6rem" }}>{user!.initials}</div>
                                                <div style={{ flex: 1, fontSize: "0.85rem", color: "var(--text)", fontWeight: 500, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user!.name}</div>
                                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{missionsDone} tasks</span>
                                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.88rem", fontWeight: 700, color: "var(--accent)" }}>+{pts} pts</span>
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
                            <div className="card" style={{ background: "transparent", border: "none", padding: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                                    <Shield size={20} style={{ color: "var(--accent)" }} />
                                    <div>
                                        <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "1.1rem" }}>Proof Verification Queue</div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                            Review submitted proofs before points are credited
                                        </div>
                                    </div>
                                </div>

                                {pendingVerifs.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "4rem 1rem", border: "1px dashed var(--border)", borderRadius: "var(--radius)", background: "var(--surface)", color: "var(--text-muted)" }}>
                                        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✅</div>
                                        <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem", color: "var(--text)" }}>All clear!</div>
                                        <div style={{ fontSize: "0.85rem" }}>No pending submissions right now.</div>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        <AnimatePresence>
                                            {pendingVerifs.map(v => (
                                                <motion.div key={v.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}>
                                                    <VerifCard verif={v} onReview={handleReview} />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ════════════════ MISSIONS ════════════════════════════════ */}
                    {activeTab === "missions" && (
                        <motion.div key="missions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ maxWidth: 820 }}>
                            {CLUBS.map(club => {
                                const clubTasks = allTodayTasks.filter(t => t.club_id === club.id);
                                if (clubTasks.length === 0) return null;
                                return (
                                    <div key={club.id} className="card" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
                                            <span style={{ fontSize: "1.2rem" }}>{club.icon}</span>
                                            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>{club.name} tasks</span>
                                            <span className="pill pill-neutral" style={{ background: "var(--bg)" }}>{clubTasks.length} total</span>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                            {clubTasks.map(task => {
                                                const completions = missionCompletions(task.id);
                                                const isExpanded = expandedMission === task.id;
                                                const pct = state.users.length > 0 ? Math.round((completions.length / state.users.length) * 100) : 0;
                                                const pendingForTask = state.verifications.filter(v => v.task_id === task.id && v.status === "pending").length;
                                                return (
                                                    <div key={task.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem" }}>
                                                            <button className={`toggle ${task.active ? "on" : ""}`} onClick={() => toggleTaskActiveRealtime(task.id, task.active)} title={task.active ? "Pause" : "Activate"} />
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: "0.875rem", fontWeight: 500, color: task.active ? "var(--text)" : "var(--text-muted)", textDecoration: task.active ? "none" : "line-through", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                                    {task.title}
                                                                </div>
                                                                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginTop: "0.35rem" }}>
                                                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{task.pts} pts</span>
                                                                    <div className="progress-track" style={{ width: 80, height: 4 }}>
                                                                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                                                                    </div>
                                                                    <span style={{ fontSize: "0.7rem", fontWeight: 600, color: completions.length === 0 ? "var(--text-muted)" : "var(--accent)" }}>
                                                                        {completions.length}/{state.users.length} approved
                                                                    </span>
                                                                    {pendingForTask > 0 && (
                                                                        <span style={{ fontSize: "0.62rem", color: "var(--amber)", background: "rgba(239,159,39,0.1)", border: "1px solid rgba(239,159,39,0.3)", borderRadius: 5, padding: "0.1rem 0.4rem", fontWeight: 600 }}>
                                                                            <Clock size={9} style={{ display: "inline", marginRight: 2 }} />{pendingForTask} pending
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button className="icon-btn" onClick={() => setExpandedMission(isExpanded ? null : task.id)}>
                                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </button>
                                                        </div>
                                                        <AnimatePresence>
                                                            {isExpanded && (
                                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                                                                    <div style={{ padding: "0.75rem 1rem 1rem", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
                                                                        <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                                                                            Approved completions ({completions.length})
                                                                        </div>
                                                                        {completions.length === 0 ? (
                                                                            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>No approved completions yet.</div>
                                                                        ) : (
                                                                            <div className="completions-list">
                                                                                {completions.map(c => {
                                                                                    const u = state.users.find(usr => usr.id === c.user_id);
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
                                <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius)", background: "var(--surface)" }}>
                                    🎖 No tasks deployed today. Go to 'Post Task' tab to add one.
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ════════════════ DEPLOY ══════════════════════════════════ */}
                    {activeTab === "deploy" && !isMobile && (
                        <motion.div key="deploy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ maxWidth: 480 }}>
                            <div className="card">
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                    <Plus size={18} style={{ color: "var(--accent)" }} />
                                    <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Create a new Task</h2>
                                </div>
                                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 1.5rem" }}>
                                    New tasks are immediately pushed to all users seamlessly in real-time.
                                </p>

                                <form onSubmit={handleDeploy} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-sub)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Club</label>
                                        <select className="input-field" value={form.club_id}
                                            onChange={e => setForm(f => ({ ...f, club_id: e.target.value }))}
                                            style={{ cursor: "pointer" }}>
                                            {CLUBS.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-sub)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Task Title</label>
                                        <input className="input-field" placeholder="e.g. Complete a 5 km morning run"
                                            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-sub)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Description</label>
                                        <input className="input-field" placeholder="Any special instructions..."
                                            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-sub)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Points — <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}>{form.pts}</span></label>
                                        <input type="range" min={5} max={50} step={5} value={form.pts}
                                            onChange={e => setForm(f => ({ ...f, pts: Number(e.target.value) }))}
                                            style={{ width: "100%", accentColor: "var(--accent)" }} />
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                            <span>5 — quick win</span><span>50 — intensive</span>
                                        </div>
                                    </div>

                                    {/* Requires proof toggle */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--bg)", border: "1px solid var(--border)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                                        <button
                                            type="button"
                                            className={`toggle ${form.requires_proof ? "on" : ""}`}
                                            onClick={() => setForm(f => ({ ...f, requires_proof: !f.requires_proof }))}
                                        />
                                        <div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>Require Proof Submission</div>
                                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                                {form.requires_proof ? "Aspirants must submit proof; captain reviews before points credit." : "Points credited immediately on completion."}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingTop: "0.5rem" }}>
                                        <button type="submit" className="btn-amber">
                                            Post Task
                                        </button>
                                        <AnimatePresence>
                                            {submitted && (
                                                <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                                    style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: 600 }}>
                                                    ✓ Task deployed to all!
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
                                    <div className="card">
                                        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem", fontWeight: 500, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span>Showing {total === 0 ? 0 : start + 1} to {end} of {total} total members</span>
                                            <span className="pill pill-neutral border-0">Sorted by Today's Pts</span>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "2.5rem 2.25rem 1fr 4.5rem 4.5rem 5rem", gap: "0.5rem", alignItems: "center", padding: "0.25rem 1rem", marginBottom: "0.4rem" }}>
                                            <div /><div />
                                            <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Aspirant</div>
                                            <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", textAlign: "center" }}>Streak</div>
                                            <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", textAlign: "center" }}>Today</div>
                                            <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", textAlign: "center" }}>Pts</div>
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
                                                        display: "grid", gridTemplateColumns: "2.5rem 2.25rem 1fr 4.5rem 4.5rem 5rem",
                                                        gap: "0.5rem", alignItems: "center", padding: "0.75rem 1rem",
                                                        background: isStruggling ? "var(--surface)" : "var(--bg)",
                                                        border: `1px solid var(--border)`,
                                                        borderRadius: "var(--radius-sm)",
                                                    }}>
                                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textAlign: "center" }}>
                                                            {start + i === 0 ? "🥇" : start + i === 1 ? "🥈" : start + i === 2 ? "🥉" : `${start + i + 1}`}
                                                        </span>
                                                        <div className="avatar" style={{ width: 30, height: 30, fontSize: "0.6rem" }}>{user.initials}</div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
                                                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{user.ssb_board}</div>
                                                        </div>
                                                        <div style={{ textAlign: "center" }}>
                                                            <span style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 600 }}>🔥 {user.streak}d</span>
                                                        </div>
                                                        <div style={{ textAlign: "center" }}>
                                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", fontWeight: 700, color: isStruggling ? "var(--text-sub)" : "var(--text)" }}>
                                                                {missionsDoneToday}/{todayTasks.length}
                                                            </span>
                                                        </div>
                                                        <div style={{ textAlign: "center" }}>
                                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>
                                                                {user.total_pts.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                                            <button
                                                className="btn-outline"
                                                onClick={() => setRosterPage(p => Math.max(0, p - 1))}
                                                disabled={!canPrev}
                                            >
                                                ← Prev
                                            </button>
                                            <button
                                                className="btn-outline"
                                                onClick={() => setRosterPage(p => p + 1)}
                                                disabled={!canNext}
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </motion.div>
                    )}

                    {/* ════════════════ CAPTAINS ════════════════════════════════ */}
                    {activeTab === "captains" && user?.role === "admin" && (
                        <motion.div key="captains" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ maxWidth: 820 }}>
                            <div className="card">
                                <div style={{ marginBottom: "1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <UserPlus size={18} style={{ color: "var(--accent)" }} />
                                        <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Captain Management</h2>
                                    </div>
                                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.3rem 0 0" }}>
                                        Assign Captains to specific squads to help you review and verify proof submissions.
                                    </p>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {CLUBS.filter(c => c.id !== "all").map(club => {
                                        const assignment = captainAssignments.find(a => a.club_id === club.id);
                                        const currentCaptain = assignment ? state.users.find(u => u.id === assignment.profile_id) : null;
                                        const potentialCaptains = state.users.filter(u => u.role !== "admin" && u.id !== currentCaptain?.id);

                                        return (
                                            <div key={club.id} style={{ padding: "1.25rem", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                                    <span style={{ fontSize: "1.2rem" }}>{club.icon}</span>
                                                    <span style={{ fontWeight: 600, fontSize: "1rem" }}>{club.name} Squad</span>
                                                </div>

                                                {currentCaptain ? (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "var(--accent-light)", border: "1px solid var(--accent-dim)", borderRadius: "var(--radius-sm)" }}>
                                                        <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.6rem" }}>{currentCaptain.initials}</div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentCaptain.name}</div>
                                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Assigned Captain</div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeCaptain(club.id, currentCaptain.id)}
                                                            className="btn-danger"
                                                        >
                                                            <X size={14} /> Remove
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: "1rem", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-sm)", textAlign: "center", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                                                        No captain assigned to this squad.
                                                    </div>
                                                )}

                                                <div style={{ marginTop: "1rem" }}>
                                                    <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                                                        Assign New Captain
                                                    </div>
                                                    <select
                                                        className="input-field"
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val) assignCaptain(club.id, val);
                                                        }}
                                                        value=""
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <option value="" disabled>Select an aspirant...</option>
                                                        {potentialCaptains.map(u => (
                                                            <option key={u.id} value={u.id}>{u.name} ({u.city})</option>
                                                        ))}
                                                    </select>
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
