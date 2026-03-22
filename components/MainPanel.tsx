"use client";

import {
    useApp, useIsTaskDone, useActiveClub, useCurrentUser,
    useTaskVerification, VerifStatus
} from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Club, Task, CLUBS, TODAY } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, Lock, Clock, X, ExternalLink, ShieldCheck, Shield, ChevronRight, ListTodo, ClipboardEdit } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Proof Submission Modal ────────────────────────────────────────────────────

function ProofModal({
    task,
    onSubmit,
    onClose,
}: {
    task: Task;
    onSubmit: (proofText: string) => Promise<void> | void;
    onClose: () => void;
}) {
    const [proof, setProof] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handle(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await Promise.race([
                onSubmit(proof.trim()),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000))
            ]);
        } catch (err) {
            console.warn("[Submission] Failed or timed out:", err);
        } finally {
            setSubmitting(false);
            onClose();
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0, zIndex: 50,
                    background: "rgba(0,0,0,0.55)", display: "flex",
                    alignItems: "center", justifyContent: "center", padding: "1rem",
                }}
            >
                <motion.div
                    key="modal"
                    initial={{ opacity: 0, scale: 0.92, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: "var(--bg)", border: "1px solid var(--border)",
                        borderRadius: 14, padding: "1.75rem", width: "100%", maxWidth: 460,
                        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                    }}
                >
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.2rem" }}>
                        <div>
                            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--amber)", marginBottom: "0.25rem" }}>
                                Submit Proof of Completion
                            </div>
                            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
                                {task.title}
                            </div>
                        </div>
                        <button onClick={onClose} className="icon-btn">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Info banner */}
                    <div style={{
                        background: "rgba(239,159,39,0.07)", border: "0.5px solid rgba(239,159,39,0.2)",
                        borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.25rem",
                        fontSize: "0.78rem", color: "var(--text-sub)",
                        display: "flex", alignItems: "flex-start", gap: "0.5rem",
                    }}>
                        <Shield size={14} style={{ color: "var(--amber)", marginTop: 1, flexShrink: 0 }} />
                        <span>
                            Your submission will be reviewed by your <strong>Captain</strong>.
                            Paste an activity link, screenshot URL, or short description.
                        </span>
                    </div>

                    <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-sub)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                Proof / Activity Link
                            </label>
                            <textarea
                                className="input-field"
                                placeholder="e.g. https://strava.com/activity/... "
                                value={proof}
                                onChange={(e) => setProof(e.target.value)}
                                rows={3}
                                style={{ resize: "vertical", fontFamily: "inherit", minHeight: 80 }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "0.6rem" }}>
                            <button type="button" onClick={onClose} className="btn-outline" style={{ flex: 1 }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-amber" disabled={submitting} style={{ flex: 2 }}>
                                {submitting ? "Submitting…" : <><ShieldCheck size={14} /> Submit for Review</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function VerifBadge({ status, note }: { status: VerifStatus; note?: string | null }) {
    const config = {
        pending: { icon: <Clock size={11} />, label: "Pending", bg: "rgba(239,159,39,0.1)", border: "rgba(239,159,39,0.3)", color: "var(--amber)" },
        approved: { icon: <Check size={11} />, label: "Approved", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", color: "#10b981" },
        rejected: { icon: <X size={11} />, label: "Rejected", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)", color: "#f87171" },
    }[status];

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem" }}>
            <div style={{
                display: "flex", alignItems: "center", gap: "0.3rem",
                background: config.bg, border: `0.5px solid ${config.border}`,
                borderRadius: 6, padding: "0.15rem 0.5rem",
                fontSize: "0.65rem", fontWeight: 600, color: config.color,
                letterSpacing: "0.02em"
            }}>
                {config.icon}
                {config.label}
            </div>
            {note && status === "rejected" && (
                <div style={{ fontSize: "0.62rem", color: "#f87171", maxWidth: 140, textAlign: "right" }}>
                    {note}
                </div>
            )}
        </div>
    );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, isGuest, userId }: { task: Task; isGuest: boolean; userId?: string }) {
    const { submitVerification, state } = useApp();
    const isDone = useIsTaskDone(task.id, userId);
    const verif = useTaskVerification(task.id, userId ?? state.currentUserId);
    const [modalOpen, setModalOpen] = useState(false);

    const handleCheck = () => {
        if (isGuest || isDone) return;
        if (task.requires_proof !== false) {
            setModalOpen(true);
        } else {
            submitVerification(task.id, state.currentUserId, task.pts, "");
        }
    };

    return (
        <>
            <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                style={{
                    display: "flex", alignItems: "flex-start", gap: "0.85rem",
                    padding: "0.85rem 1rem",
                    background: isDone ? "var(--accent-light)" : "var(--bg)",
                    border: `1px solid ${isDone ? "var(--accent-dim)" : verif?.status === "pending" ? "rgba(239,159,39,0.25)" : "var(--border)"}`,
                    borderRadius: 10,
                    opacity: isDone ? 0.8 : 1,
                    transition: "all 0.15s",
                }}
            >
                {/* Checkbox */}
                <button
                    className={`custom-checkbox ${isDone ? "checked" : ""}`}
                    style={{ marginTop: 2, flexShrink: 0, cursor: isGuest || isDone || verif?.status === "pending" ? "default" : "pointer" }}
                    onClick={handleCheck}
                    title={isGuest ? "Sign in to complete" : isDone ? "Approved" : verif?.status === "pending" ? "Awaiting review" : "Complete"}
                    disabled={isGuest || isDone || verif?.status === "pending"}
                >
                    <AnimatePresence>
                        {isDone && (
                            <motion.span key="check" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
                                <Check size={12} color="#fff" strokeWidth={3} />
                            </motion.span>
                        )}
                        {verif?.status === "pending" && !isDone && (
                            <motion.span key="clock" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <Clock size={11} color="var(--amber)" />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 500, color: isDone ? "var(--text-muted)" : "var(--text)", textDecoration: isDone ? "line-through" : "none" }}>
                        {task.title}
                    </div>
                    {task.description && (
                        <div style={{ fontSize: "0.775rem", color: "var(--text-sub)", marginTop: "0.15rem" }}>
                            {task.description}
                        </div>
                    )}
                    {/* Proof link */}
                    {verif?.proof_text && verif.proof_text.startsWith("http") && (
                        <a href={verif.proof_text} target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.65rem", color: "var(--amber)", marginTop: "0.35rem", textDecoration: "none" }}>
                            <ExternalLink size={10} /> View proof
                        </a>
                    )}
                </div>

                {/* Right side */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem", flexShrink: 0 }}>
                    {isGuest ? (
                        <Lock size={14} style={{ color: "var(--text-muted)" }} />
                    ) : verif ? (
                        <VerifBadge status={verif.status} note={verif.review_note} />
                    ) : (
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.875rem", fontWeight: 700, color: "var(--amber)" }}>
                            {isDone ? `✓ ${task.pts}` : `+${task.pts}`}
                            <span style={{ fontSize: "0.65rem", fontWeight: 500, fontFamily: "'Inter', sans-serif", color: "var(--text-muted)", marginLeft: 2 }}>pts</span>
                        </div>
                    )}
                    {task.requires_proof !== false && !verif && !isGuest && (
                        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontStyle: "italic" }}>Requires proof</span>
                    )}
                </div>
            </motion.div>

            {/* Proof Modal */}
            {modalOpen && (
                <ProofModal
                    task={task}
                    onSubmit={(proof) => submitVerification(task.id, state.currentUserId, task.pts, proof)}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </>
    );
}

// ─── Squad Group (for "All Squads" grouped view) ─────────────────────────────

function SquadGroup({ club, tasks, isGuest, userId }: { club: Club; tasks: Task[]; isGuest: boolean; userId?: string }) {
    if (tasks.length === 0) return null;
    return (
        <div style={{ marginBottom: "1.75rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1rem" }}>{club.icon}</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                    {club.name}
                </span>
                <span className="pill pill-neutral" style={{ fontSize: "0.62rem", background: "var(--bg)" }}>{tasks.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <AnimatePresence mode="popLayout">
                    {tasks.map(task => <TaskCard key={task.id} task={task} isGuest={isGuest} userId={userId} />)}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Personal Mission Card ────────────────────────────────────────────────────

function PersonalMissionCard({ todo, onToggle, onDelete }: {
    todo: { id: string; title: string; done: boolean };
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    return (
        <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "center", gap: "0.85rem", padding: "0.7rem 1rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, opacity: todo.done ? 0.6 : 1 }}
        >
            <button className={`custom-checkbox ${todo.done ? "checked" : ""}`} onClick={() => onToggle(todo.id)}>
                <AnimatePresence>
                    {todo.done && (
                        <motion.span key="chk" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Check size={12} color="#fff" strokeWidth={3} />
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>
            <span style={{ flex: 1, fontSize: "0.875rem", color: "var(--text)", textDecoration: todo.done ? "line-through" : "none" }}>
                {todo.title}
            </span>
            <button onClick={() => onDelete(todo.id)} className="icon-btn" onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")} onMouseLeave={(e) => (e.currentTarget.style.color = "")}>
                <Trash2 size={14} />
            </button>
        </motion.div>
    );
}

// ─── History Calendar ─────────────────────────────────────────────────────────

function HistoryCalendar({
    selectedDate, onSelectDate, currentUserId,
}: {
    selectedDate: string; onSelectDate: (d: string) => void; currentUserId: string;
}) {
    const { state } = useApp();

    const days = useMemo(() => {
        const arr: string[] = [];
        const base = new Date(TODAY);
        for (let i = 13; i >= 0; i--) {
            const d = new Date(base);
            d.setDate(base.getDate() - i);
            arr.push(d.toISOString().slice(0, 10));
        }
        return arr;
    }, []);

    return (
        <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
                Calendar
            </div>
            <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.5rem", scrollbarWidth: "none" }}>
                {days.map((dateStr) => {
                    const isToday = dateStr === TODAY;
                    const isSelected = dateStr === selectedDate;
                    const dateObj = new Date(dateStr);
                    const dayName = dateObj.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2);
                    const dayNum = dateObj.getDate();

                    const tasksOnDate = state.tasks.filter(t => t.date === dateStr && t.active);
                    const completedOnDate = tasksOnDate.filter(t =>
                        state.completions.some(c =>
                            c.task_id === t.id && c.user_id === currentUserId && c.completed_at.startsWith(dateStr)
                        )
                    );
                    const hasActivity = completedOnDate.length > 0;
                    const allDone = tasksOnDate.length > 0 && completedOnDate.length === tasksOnDate.length;
                    const dotColor = allDone ? "#10b981" : hasActivity ? "var(--amber)" : "var(--border-dark)";

                    return (
                        <button key={dateStr} onClick={() => onSelectDate(dateStr)} title={isToday ? "Today" : dateStr} style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem",
                            padding: "0.5rem 0.65rem",
                            background: isSelected ? "var(--accent)" : isToday ? "var(--surface-2)" : "var(--surface)",
                            border: `1px solid ${isSelected ? "var(--accent)" : isToday ? "var(--border-dark)" : "var(--border)"}`,
                            borderRadius: 10, cursor: "pointer", flexShrink: 0, minWidth: 46, transition: "all 0.15s",
                            boxShadow: isSelected ? "var(--shadow-sm)" : "none",
                        }}>
                            <span style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", color: isSelected ? "rgba(255,255,255,0.8)" : "var(--text-muted)", letterSpacing: "0.05em" }}>
                                {dayName}
                            </span>
                            <span style={{ fontSize: "1.05rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: isSelected ? "#fff" : isToday ? "var(--accent)" : "var(--text)" }}>
                                {dayNum}
                            </span>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? "rgba(255,255,255,0.7)" : dotColor, marginTop: "0.1rem", opacity: (tasksOnDate.length === 0 && !isToday) ? 0.2 : 1 }} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Progress Banner ─────────────────────────────────────────────────

function ProgressBanner({ done, total, pts, streak, isGuest, isHistory, pending }: {
    done: number; total: number; pts: number; streak: number; isGuest: boolean; isHistory: boolean; pending: number;
}) {
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    const allDone = done === total && total > 0;

    return (
        <div style={{
            background: allDone ? "var(--accent-light)" : "var(--surface)",
            border: `1px solid ${allDone ? "var(--accent-dim)" : "var(--border)"}`,
            borderRadius: "var(--radius)", padding: "1rem 1.25rem", marginBottom: "1.25rem",
        }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: isGuest ? 0 : "0.55rem" }}>
                        {isGuest
                            ? "Sign in to track your progress limitlessly."
                            : isHistory
                                ? `You completed ${done} of ${total} tasks`
                                : allDone
                                    ? "All tasks done. Great work today!"
                                    : `${done} of ${total} done ${total > 0 ? `· ${pct}%` : ""}`}
                    </div>
                    {!isGuest && (
                        <>
                            <div className="progress-track" style={{ height: 6, background: "var(--surface-2)" }}>
                                <motion.div className="progress-fill" initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
                                    style={{ background: "var(--accent)" }}
                                />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "0.7rem", color: "var(--text-sub)", fontWeight: 500 }}>
                                    {pts} <span style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>pts earned</span>
                                </span>
                                {pending > 0 && (
                                    <span style={{ fontSize: "0.65rem", background: "rgba(239,159,39,0.1)", border: "1px solid rgba(239,159,39,0.3)", borderRadius: 6, padding: "0.15rem 0.45rem", color: "var(--amber)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                                        <Clock size={10} /> {pending} awaiting review
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {!isGuest && streak > 0 && (
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        background: "var(--bg)", border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)", padding: "0.5rem 0.75rem", flexShrink: 0, minWidth: 60,
                    }}>
                        <span style={{ fontSize: "1.35rem", lineHeight: 1 }}>🔥</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)", lineHeight: 1.1 }}>
                            {streak}
                        </span>
                        <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", fontWeight: 500, marginTop: "0.1rem" }}>streak</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

type PanelTab = "missions" | "personal";

export default function MainPanel() {
    const { state, dispatch } = useApp();
    const { user, isGuest, personalTodos, addPersonalTodo, togglePersonalTodo, deletePersonalTodo, captainClubs } = useAuth();
    const pathname = usePathname();
    const currentUser = useCurrentUser();
    const [selectedDate, setSelectedDate] = useState(TODAY);
    const [activeTab, setActiveTab] = useState<PanelTab>("missions");
    const [newTodo, setNewTodo] = useState("");

    const isAllSquads = state.activeClubId === "all";
    const isHistory = selectedDate !== TODAY;
    const activeClub = useActiveClub();
    const userId = state.currentUserId;

    // Tasks for selected date
    const allDateTasks = state.tasks.filter(t => t.date === selectedDate && t.active);
    const clubTasks = isAllSquads ? allDateTasks : allDateTasks.filter(t => t.club_id === state.activeClubId);

    // Completions for selected date (approved only)
    const doneTasks = useMemo(
        () => clubTasks.filter(t =>
            state.completions.some(c =>
                c.task_id === t.id && c.user_id === userId && c.completed_at.startsWith(selectedDate)
            )
        ),
        [clubTasks, state.completions, userId, selectedDate]
    );

    // Pending verifications
    const pendingCount = useMemo(
        () => clubTasks.filter(t =>
            state.verifications.some(v => v.task_id === t.id && v.user_id === userId && v.status === "pending")
        ).length,
        [clubTasks, state.verifications, userId]
    );

    // Points for selected date
    const datePts = useMemo(() =>
        state.completions
            .filter(c => c.user_id === userId && c.completed_at.startsWith(selectedDate))
            .reduce((sum, c) => {
                const task = state.tasks.find(t => t.id === c.task_id);
                return sum + (task?.pts ?? 0);
            }, 0),
        [state.completions, userId, state.tasks, selectedDate]
    );

    const pendingVerifsForCaptain = useMemo(() => 
        state.verifications.filter(v => 
            v.status === "pending" && (captainClubs || []).includes(state.tasks.find(t => t.id === v.task_id)?.club_id || "")
        ),
        [state.verifications, state.tasks, captainClubs]
    );

    const streak = currentUser?.streak ?? 0;
    const dateLabel = new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });

    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim()) return;
        addPersonalTodo(newTodo.trim());
        setNewTodo("");
    };

    return (
        <main className="main-panel">
            {/* Captain Alert */}
            {pendingVerifsForCaptain.length > 0 && pathname === "/ops" && (
                <div style={{ background: "rgba(239,159,39,0.08)", border: "1px solid rgba(239,159,39,0.3)", borderRadius: "var(--radius)", padding: "0.85rem 1.1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Shield size={18} style={{ color: "var(--amber)", flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: "0.85rem", color: "var(--text-sub)", fontWeight: 500 }}>
                        <span style={{ fontWeight: 700, color: "var(--amber)" }}>Captain Action Required:</span>
                        {" "}You have {pendingVerifsForCaptain.length} pending proof submission{pendingVerifsForCaptain.length > 1 ? "s" : ""} to review.
                    </div>
                    <Link href="/admin" className="btn-amber" style={{ padding: "0.4rem 0.85rem", fontSize: "0.75rem", textDecoration: "none" }}>
                        Review
                    </Link>
                </div>
            )}

            {/* Heading */}
            <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "1.5rem" }}>{activeClub.icon}</span>
                        <h1 style={{ margin: 0, fontSize: "1.65rem" }}>{activeClub.name}</h1>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: isHistory ? "var(--amber)" : "var(--text-muted)", fontWeight: isHistory ? 600 : 400, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>📅 {isHistory ? "Viewing past: " : ""}{dateLabel}</span>
                        {isHistory && (
                            <button onClick={() => setSelectedDate(TODAY)}
                                style={{ fontSize: "0.7rem", color: "var(--accent)", background: "rgba(78,95,59,0.1)", border: "1px solid rgba(78,95,59,0.2)", borderRadius: 6, cursor: "pointer", padding: "0.1rem 0.4rem", fontWeight: 600 }}>
                                Go to Today
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ProgressBanner
                done={doneTasks.length} total={clubTasks.length}
                pts={datePts} streak={streak}
                isGuest={isGuest} isHistory={isHistory} pending={pendingCount}
            />

            <HistoryCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} currentUserId={userId} />

            {/* Guest notice */}
            {isGuest && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1rem", marginBottom: "1.25rem", fontSize: "0.85rem", color: "var(--text-sub)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Lock size={15} style={{ color: "var(--text-muted)" }} />
                    <span style={{flex: 1}}>Browsing in Guest Mode</span>
                    <a href="/login" className="btn-amber" style={{ textDecoration: "none", padding: "0.4rem 0.75rem" }}>Sign In</a>
                </div>
            )}

            {/* Tab bar — logged-in aspirants only */}
            {user && user.role !== "admin" && (
                <div className="tab-bar" style={{ gap: "0.5rem" }}>
                    <button className={`tab ${activeTab === "missions" ? "active" : ""}`} onClick={() => setActiveTab("missions")} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <ListTodo size={14} /> Tasks
                    </button>
                    <button className={`tab ${activeTab === "personal" ? "active" : ""}`} onClick={() => setActiveTab("personal")} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <ClipboardEdit size={14} /> Personal
                        {personalTodos.filter(t => !t.done).length > 0 && (
                            <span className={`pill ${activeTab === "personal" ? "pill-amber" : "pill-neutral"}`} style={{ marginLeft: "0.2rem", fontSize: "0.6rem" }}>
                                {personalTodos.filter(t => !t.done).length}
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* ── Tasks ── */}
            {(activeTab === "missions" || !user || user.role === "admin") && (
                <>
                    {user && user.role !== "admin" && !isHistory && !isGuest && (
                        <div style={{ background: "rgba(239,159,39,0.04)", border: "1px solid rgba(239,159,39,0.15)", borderRadius: "var(--radius-sm)", padding: "0.6rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-sub)" }}>
                            <Shield size={13} style={{ color: "var(--amber)", flexShrink: 0 }} />
                            Tasks requiring proof are reviewed by a verified Captain before points are awarded.
                        </div>
                    )}

                    {isAllSquads ? (
                        clubTasks.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius)" }}>
                                {isHistory ? "No tasks were scheduled for this date." : "No tasks scheduled for today."}
                            </div>
                        ) : (
                            CLUBS.map(club => {
                                const tasks = allDateTasks.filter(t => t.club_id === club.id);
                                return <SquadGroup key={club.id} club={club} tasks={tasks} isGuest={isGuest || isHistory} userId={userId} />;
                            })
                        )
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <AnimatePresence mode="popLayout">
                                {clubTasks.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="empty"
                                        style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius)", fontSize: "0.85rem" }}>
                                        {isHistory ? "No tasks for this specific club on this date." : "No tasks for this club today."}
                                    </motion.div>
                                ) : (
                                    clubTasks.map(task => <TaskCard key={task.id} task={task} isGuest={isGuest || isHistory} userId={userId} />)
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </>
            )}

            {/* ── Personal Log ── */}
            {activeTab === "personal" && user && user.role !== "admin" && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.25rem" }}>
                    <div style={{ marginBottom: "1rem" }}>
                        <h2 style={{ margin: "0 0 0.2rem", fontSize: "1.1rem" }}>Personal Routine</h2>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
                            Add your own sub-tasks for the day (not counted towards rank).
                        </p>
                    </div>

                    <form onSubmit={handleAddTodo} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                        <input className="input-field" type="text" placeholder="E.g. Stretch for 15 mins..."
                            value={newTodo} onChange={(e) => setNewTodo(e.target.value)} style={{ flex: 1 }} />
                        <button type="submit" className="btn-amber" disabled={!newTodo.trim()} style={{ padding: "0.55rem 0.9rem", flexShrink: 0 }}>
                            <Plus size={16} />
                        </button>
                    </form>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        {(() => {
                            const todosByDate = personalTodos.reduce((acc, todo) => {
                                const d = todo.createdAt ? todo.createdAt.slice(0, 10) : TODAY;
                                if (!acc[d]) acc[d] = [];
                                acc[d].push(todo);
                                return acc;
                            }, {} as Record<string, typeof personalTodos>);

                            const sortedDates = Object.keys(todosByDate).sort((a, b) => b.localeCompare(a));

                            if (personalTodos.length === 0) {
                                return (
                                    <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)", fontSize: "0.85rem", border: "1px dashed var(--border)", borderRadius: "var(--radius)" }}>
                                        No personal routine items yet.
                                    </div>
                                );
                            }

                            return sortedDates.map(dateKey => {
                                const isToday = dateKey === TODAY;
                                const dateLabel = isToday ? "Today" : new Date(dateKey).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
                                const todos = todosByDate[dateKey];
                                const doneCount = todos.filter(t => t.done).length;

                                return (
                                    <div key={dateKey}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.65rem" }}>
                                            <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                                {dateLabel}
                                            </span>
                                            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                                            <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                                                {doneCount}/{todos.length}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: "0.5rem", border: "1px solid var(--border)" }}>
                                            <AnimatePresence mode="popLayout">
                                                {todos.map(todo => (
                                                    <PersonalMissionCard key={todo.id} todo={todo} onToggle={togglePersonalTodo} onDelete={deletePersonalTodo} />
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}
        </main>
    );
}
