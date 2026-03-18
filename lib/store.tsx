"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import {
    CLUBS,
    TASKS,
    USERS,
    INITIAL_COMPLETIONS,
    USER_CLUB_POINTS,
    Club,
    Task,
    User,
    Completion,
} from "./data";
import { supabase, isSupabaseConfigured, DBVerification } from "./supabase";

// ─── Verification status ─────────────────────────────────────────────────────
export type VerifStatus = "pending" | "approved" | "rejected";

export interface Verification {
    id: string;
    task_id: string;
    user_id: string;
    proof_text: string | null;
    status: VerifStatus;
    reviewed_by: string | null;
    reviewed_at: string | null;
    review_note: string | null;
    submitted_at: string;
}

// ─── State ───────────────────────────────────────────────────────────────────

interface AppState {
    clubs: Club[];
    tasks: Task[];
    users: User[];
    completions: Completion[];         // Only APPROVED verifications
    verifications: Verification[];     // All verifications (pending/approved/rejected)
    activeClubId: string;
    currentUserId: string;
    darkMode: boolean;
    userClubPoints: Record<string, Record<string, number>>;
    isLoaded: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
    | { type: "INIT_DATA"; clubs: Club[]; tasks: Task[]; users: User[]; completions: Completion[]; verifications: Verification[] }
    | { type: "SET_ACTIVE_CLUB"; clubId: string }
    | { type: "SUBMIT_VERIFICATION"; verification: Verification }
    | { type: "UPDATE_VERIFICATION"; id: string; status: VerifStatus; reviewNote?: string; reviewedBy?: string }
    | { type: "UPSERT_VERIFICATION"; verification: Verification }
    | { type: "UPDATE_USER"; user: Partial<User> & { id: string } }
    | { type: "TOGGLE_DARK_MODE" }
    | { type: "ADD_TASK"; task: Task }
    | { type: "TOGGLE_TASK_ACTIVE"; taskId: string }
    | { type: "SET_USER_ID"; userId: string };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function buildClubPoints(
    completions: Completion[],
    tasks: Task[],
    users: User[]
): { userClubPoints: Record<string, Record<string, number>>; updatedUsers: User[] } {
    const newUserClubPoints: Record<string, Record<string, number>> = {};
    const newUsers = users.map(u => ({ ...u, total_pts: 0 }));

    completions.forEach(c => {
        const task = tasks.find(t => t.id === c.task_id);
        if (task) {
            if (!newUserClubPoints[c.user_id]) newUserClubPoints[c.user_id] = {};
            newUserClubPoints[c.user_id][task.club_id] = (newUserClubPoints[c.user_id][task.club_id] || 0) + task.pts;
            const userIdx = newUsers.findIndex(u => u.id === c.user_id);
            if (userIdx !== -1) newUsers[userIdx].total_pts += task.pts;
        }
    });

    return { userClubPoints: newUserClubPoints, updatedUsers: newUsers };
}

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case "INIT_DATA": {
            const { userClubPoints, updatedUsers } = buildClubPoints(action.completions, action.tasks, action.users);
            return {
                ...state,
                clubs: action.clubs,
                tasks: action.tasks,
                users: updatedUsers,
                completions: action.completions,
                verifications: action.verifications,
                userClubPoints,
                isLoaded: true,
            };
        }

        case "SET_ACTIVE_CLUB":
            return { ...state, activeClubId: action.clubId };

        case "SUBMIT_VERIFICATION": {
            // Add to verifications list; points not yet credited (pending approval)
            const existing = state.verifications.find(
                v => v.task_id === action.verification.task_id && v.user_id === action.verification.user_id
            );
            const verifications = existing
                ? state.verifications.map(v => v.id === existing.id ? action.verification : v)
                : [...state.verifications, action.verification];
            return { ...state, verifications };
        }

        case "UPDATE_VERIFICATION": {
            const verifications = state.verifications.map(v =>
                v.id === action.id
                    ? { ...v, status: action.status, review_note: action.reviewNote ?? null, reviewed_by: action.reviewedBy ?? null, reviewed_at: new Date().toISOString() }
                    : v
            );

            // Recompute completions from approved verifications
            const approvedCompletions: Completion[] = verifications
                .filter(v => v.status === "approved")
                .map(v => ({ user_id: v.user_id, task_id: v.task_id, completed_at: v.submitted_at }));

            const { userClubPoints, updatedUsers } = buildClubPoints(approvedCompletions, state.tasks, state.users);

            return {
                ...state,
                verifications,
                completions: approvedCompletions,
                userClubPoints,
                users: updatedUsers,
            };
        }

        case "UPSERT_VERIFICATION": {
            const incoming = action.verification;
            const idx = state.verifications.findIndex(v => v.id === incoming.id);
            const verifications =
                idx === -1
                    ? [...state.verifications, incoming]
                    : state.verifications.map(v => (v.id === incoming.id ? incoming : v));

            const approvedCompletions: Completion[] = verifications
                .filter(v => v.status === "approved")
                .map(v => ({ user_id: v.user_id, task_id: v.task_id, completed_at: v.submitted_at }));

            const { userClubPoints, updatedUsers } = buildClubPoints(approvedCompletions, state.tasks, state.users);

            return {
                ...state,
                verifications,
                completions: approvedCompletions,
                userClubPoints,
                users: updatedUsers,
            };
        }

        case "UPDATE_USER": {
            const updatedUsers = state.users.map(u => (u.id === action.user.id ? { ...u, ...action.user } : u));
            return { ...state, users: updatedUsers };
        }

        case "TOGGLE_DARK_MODE":
            return { ...state, darkMode: !state.darkMode };

        case "ADD_TASK":
            return { ...state, tasks: [...state.tasks, action.task] };

        case "TOGGLE_TASK_ACTIVE": {
            const updated = state.tasks.map(t => t.id === action.taskId ? { ...t, active: !t.active } : t);
            return { ...state, tasks: updated };
        }

        case "SET_USER_ID":
            return { ...state, currentUserId: action.userId };

        default:
            return state;
    }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    submitVerification: (taskId: string, userId: string, pts: number, proofText: string) => Promise<void>;
    reviewVerification: (verifId: string, status: VerifStatus, reviewNote: string, reviewerId: string) => Promise<void>;
    addTaskRealtime: (task: Omit<Task, "id"> & { id?: string }) => Promise<void>;
    toggleTaskActiveRealtime: (taskId: string, isActive: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialState: AppState = {
    clubs: CLUBS,
    tasks: TASKS,
    users: USERS,
    completions: INITIAL_COMPLETIONS,
    verifications: [],
    activeClubId: "all",
    currentUserId: "u1",
    darkMode: false,
    userClubPoints: USER_CLUB_POINTS,
    isLoaded: false,
};

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Dark Mode Persistence
    useEffect(() => {
        try {
            const saved = localStorage.getItem('ct_darkmode');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialDark = saved !== null ? saved === 'true' : prefersDark;
            if (initialDark) {
                dispatch({ type: "TOGGLE_DARK_MODE" });
            }
        } catch (e) {
            console.error("Dark mode initialization failed", e);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('ct_darkmode', state.darkMode.toString());
            if (state.darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } catch (e) {
            console.error("Failed to save dark mode preference", e);
        }
    }, [state.darkMode]);

    // Load data on mount
    useEffect(() => {
        let mounted = true;
        async function loadData() {
            if (!isSupabaseConfigured || !supabase) {
                // Fallback to mock data — verifications are empty (all completions treated as approved)
                dispatch({
                    type: "INIT_DATA",
                    clubs: CLUBS, tasks: TASKS, users: USERS,
                    completions: INITIAL_COMPLETIONS, verifications: [],
                });
                return;
            }

            try {
                const [
                    { data: clubsData },
                    { data: tasksData },
                    { data: usersData },
                    { data: verifsData },
                ] = await Promise.all([
                    supabase.from("clubs").select("*"),
                    supabase.from("tasks").select("*").order("date", { ascending: false }),
                    supabase.from("profiles").select("*"),
                    supabase.from("task_verifications").select("*"),
                ]);

                if (!mounted) return;

                const verifications: Verification[] = (verifsData ?? []).map((v: DBVerification) => ({
                    id: v.id, task_id: v.task_id, user_id: v.user_id,
                    proof_text: v.proof_text, status: v.status,
                    reviewed_by: v.reviewed_by, reviewed_at: v.reviewed_at,
                    review_note: v.review_note, submitted_at: v.submitted_at,
                }));

                // Approved verifications become "completions"
                const completions: Completion[] = verifications
                    .filter(v => v.status === "approved")
                    .map(v => ({ user_id: v.user_id, task_id: v.task_id, completed_at: v.submitted_at }));

                // Map profiles to User shape
                const users: User[] = (usersData ?? USERS).map((p: {
                    id: string; name: string; initials: string; ssb_board: string | null;
                    streak: number; total_pts?: number;
                    role?: string; city?: string | null; aspirant_type?: string | null;
                }) => ({
                    id: p.id, name: p.name, initials: p.initials,
                    ssb_board: p.ssb_board ?? "Unknown",
                    streak: p.streak, total_pts: 0,
                    role: (p.role === "admin" ? "admin" : "aspirant") as "admin" | "aspirant",
                    city: p.city ?? "",
                    aspirantType: p.aspirant_type ?? "Other",
                }));

                dispatch({
                    type: "INIT_DATA",
                    clubs: clubsData ?? CLUBS,
                    tasks: tasksData ?? TASKS,
                    users,
                    completions,
                    verifications,
                });
            } catch (e) {
                console.error("Supabase load error, falling back to mock:", e);
                if (mounted) {
                    dispatch({ type: "INIT_DATA", clubs: CLUBS, tasks: TASKS, users: USERS, completions: INITIAL_COMPLETIONS, verifications: [] });
                }
            }
        }

        loadData();

        let channels: any[] = [];
        if (isSupabaseConfigured && supabase) {
            // Targeted realtime subscriptions (avoid thundering herd full refetches)
            const verifChannel = supabase
                .channel("task-verifications-changes")
                .on(
                    "postgres_changes",
                    { event: "INSERT", schema: "public", table: "task_verifications" },
                    (payload: any) => {
                        if (!mounted) return;
                        const v = payload.new as DBVerification;
                        const verification: Verification = {
                            id: v.id,
                            task_id: v.task_id,
                            user_id: v.user_id,
                            proof_text: v.proof_text,
                            status: v.status,
                            reviewed_by: v.reviewed_by,
                            reviewed_at: v.reviewed_at,
                            review_note: v.review_note,
                            submitted_at: v.submitted_at,
                        };
                        dispatch({ type: "UPSERT_VERIFICATION", verification });
                    }
                )
                .on(
                    "postgres_changes",
                    { event: "UPDATE", schema: "public", table: "task_verifications" },
                    (payload: any) => {
                        if (!mounted) return;
                        const v = payload.new as DBVerification;
                        const verification: Verification = {
                            id: v.id,
                            task_id: v.task_id,
                            user_id: v.user_id,
                            proof_text: v.proof_text,
                            status: v.status,
                            reviewed_by: v.reviewed_by,
                            reviewed_at: v.reviewed_at,
                            review_note: v.review_note,
                            submitted_at: v.submitted_at,
                        };
                        dispatch({ type: "UPSERT_VERIFICATION", verification });
                    }
                )
                .subscribe();

            const tasksChannel = supabase
                .channel("tasks-inserts")
                .on(
                    "postgres_changes",
                    { event: "INSERT", schema: "public", table: "tasks" },
                    (payload: any) => {
                        if (!mounted) return;
                        const task = payload.new as Task;
                        dispatch({ type: "ADD_TASK", task });
                    }
                )
                .subscribe();

            const profilesChannel = supabase
                .channel("profiles-updates")
                .on(
                    "postgres_changes",
                    { event: "UPDATE", schema: "public", table: "profiles" },
                    (payload: any) => {
                        if (!mounted) return;
                        const p = payload.new as any;
                        dispatch({
                            type: "UPDATE_USER",
                            user: {
                                id: p.id,
                                name: p.name,
                                initials: p.initials,
                                ssb_board: p.ssb_board ?? "Unknown",
                                streak: p.streak,
                                role: (p.role === "admin" ? "admin" : "aspirant") as "admin" | "aspirant",
                                city: p.city ?? "",
                                aspirantType: p.aspirant_type ?? "Other",
                            },
                        });
                    }
                )
                .subscribe();

            channels = [verifChannel, tasksChannel, profilesChannel];
        }

        return () => {
            mounted = false;
            if (supabase) {
                channels.forEach((ch) => {
                    try { supabase.removeChannel(ch); } catch { /* noop */ }
                });
            }
        };
    }, []);

    // ── Submit completion with proof ─────────────────────────────────────────────
    const submitVerification = async (taskId: string, userId: string, _pts: number, proofText: string) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;

        const optimisticVerif: Verification = {
            id: `local_${Date.now()}`,
            task_id: taskId,
            user_id: userId,
            proof_text: proofText,
            status: task.requires_proof ? "pending" : "approved",
            reviewed_by: null,
            reviewed_at: null,
            review_note: null,
            submitted_at: new Date().toISOString(),
        };

        // Instantly update UI for snappy feel
        dispatch({ type: "SUBMIT_VERIFICATION", verification: optimisticVerif });

        if (isSupabaseConfigured && supabase) {
            console.log(`[Sync] Tactical Re-submission/Insert for task ${taskId}...`);
            const { data, error } = await supabase
                .from("task_verifications")
                .upsert({
                    task_id: taskId,
                    user_id: userId,
                    proof_text: proofText,
                    status: task.requires_proof ? "pending" : "approved",
                    reviewed_by: null,
                    reviewed_at: null,
                    review_note: null,
                    submitted_at: new Date().toISOString(),
                }, { 
                    onConflict: "task_id,user_id" 
                })
                .select()
                .single();

            if (error) {
                console.error("[Sync] Verification upsert failed:", error.message);
            } else if (data) {
                // Update the local fake ID with the real DB UUID
                dispatch({ type: "SUBMIT_VERIFICATION", verification: { ...optimisticVerif, id: data.id } });
            }
        }
    };

    // ── Captain / Admin reviews a verification ────────────────────────────────
    const reviewVerification = async (verifId: string, status: VerifStatus, reviewNote: string, reviewerId: string) => {
        dispatch({ type: "UPDATE_VERIFICATION", id: verifId, status, reviewNote, reviewedBy: reviewerId });

        if (isSupabaseConfigured && supabase) {
            console.log(`[Sync] Updating verification ${verifId} to ${status}...`);
            const { data, error } = await supabase
                .from("task_verifications")
                .update({
                    status,
                    review_note: reviewNote,
                    reviewed_by: reviewerId,
                    reviewed_at: new Date().toISOString(),
                })
                .eq("id", verifId)
                .select()
                .single();

            if (error) {
                console.error("[Sync] Verification update failed:", error.message);
            } else if (!data) {
                console.warn("[Sync] Verification update applied to 0 rows. Likely a missing row or RLS block.");
            } else {
                console.log("[Sync] Verification DB update successful:", data.id);
            }
        }
    };

    // ── Add task ─────────────────────────────────────────────────────────────────
    const addTaskRealtime = async (taskData: Omit<Task, "id"> & { id?: string }) => {
        // If not passing an ID, we just let Supabase generate it and it will come down via realtime update
        if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase.from("tasks").insert({
                title: taskData.title,
                club_id: taskData.club_id,
                description: taskData.description,
                pts: taskData.pts,
                date: taskData.date,
                active: taskData.active,
                requires_proof: taskData.requires_proof
            }).select().single();
            
            if (error) {
                console.error("[Deploy] Mission deployment failed:", error.message, error.details);
            } else if (data) {
                dispatch({ type: "ADD_TASK", task: data });
            }
        } else {
            const newTask: Task = { ...taskData, id: taskData.id ?? `task_${Date.now()}` };
            dispatch({ type: "ADD_TASK", task: newTask });
        }
    };

    // ── Toggle task active ────────────────────────────────────────────────────
    const toggleTaskActiveRealtime = async (taskId: string, currentlyActive: boolean) => {
        dispatch({ type: "TOGGLE_TASK_ACTIVE", taskId });
        if (isSupabaseConfigured && supabase) {
            await supabase.from("tasks").update({ active: !currentlyActive }).eq("id", taskId);
        }
    };

    return (
        <AppContext.Provider value={{ state, dispatch, submitVerification, reviewVerification, addTaskRealtime, toggleTaskActiveRealtime }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used within AppProvider");
    return ctx;
}

// ─── Derived Selectors ────────────────────────────────────────────────────────

export function useCurrentUser() {
    const { state } = useApp();
    return state.users.find(u => u.id === state.currentUserId) ?? state.users[0];
}

export function useActiveClub() {
    const { state } = useApp();
    if (state.activeClubId === "all") {
        return { id: "all", name: "All Squads", icon: "🌐", description: "Complete missions across all your squads. Every rep counts, soldier." } as any;
    }
    return state.clubs.find(c => c.id === state.activeClubId)!;
}

export function useTodayTasks(clubId?: string) {
    const { state } = useApp();
    const TODAY = new Date().toISOString().slice(0, 10);
    return state.tasks.filter(t => t.date === TODAY && t.active && (clubId ? t.club_id === clubId : true));
}

export function useTaskVerification(taskId: string, userId: string): Verification | undefined {
    const { state } = useApp();
    return state.verifications.find(v => v.task_id === taskId && v.user_id === userId);
}

export function useIsTaskDone(taskId: string, userId?: string) {
    const { state } = useApp();
    const uid = userId ?? state.currentUserId;
    return state.completions.some(c => c.task_id === taskId && c.user_id === uid);
}

export function useClubPoints(userId: string, clubId: string) {
    const { state } = useApp();
    if (clubId === "all") {
        const clubPts = state.userClubPoints[userId] ?? {};
        return Object.values(clubPts).reduce((s, v) => s + v, 0);
    }
    return state.userClubPoints[userId]?.[clubId] ?? 0;
}

export function useDatePoints(userId: string, dateStr: string) {
    const { state } = useApp();
    const doneTasks = state.completions
        .filter(c => c.user_id === userId && c.completed_at.startsWith(dateStr))
        .map(c => state.tasks.find(t => t.id === c.task_id))
        .filter(Boolean);
    return doneTasks.reduce((sum, t) => sum + (t?.pts ?? 0), 0);
}

export function useAllClubsTotal(userId: string) {
    const { state } = useApp();
    const clubPts = state.userClubPoints[userId] ?? {};
    return Object.values(clubPts).reduce((s, v) => s + v, 0);
}

// ── Pending verifications for a set of club IDs (captain view) ────────────────
export function usePendingVerifications(clubIds: string[]) {
    const { state } = useApp();
    if (clubIds.length === 0) return [];
    return state.verifications.filter(v => {
        const task = state.tasks.find(t => t.id === v.task_id);
        return v.status === "pending" && task && clubIds.includes(task.club_id);
    });
}
