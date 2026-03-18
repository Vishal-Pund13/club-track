"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase, isSupabaseConfigured, DBProfile } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AspirantType =
  | "NDA"
  | "CDS"
  | "TGC"
  | "SSC Tech"
  | "ACC"
  | "UES"
  | "NCC Special Entry"
  | "Other";

export interface AuthUser {
  id: string;           // UUID from Supabase auth
  name: string;
  initials: string;
  mobile: string;
  city: string;
  aspirantType: AspirantType;
  ssb_board?: string;
  role: "aspirant" | "admin";
  streak: number;
}

export interface PersonalTodo {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

export interface RegisterData {
  name: string;
  mobile: string;
  city: string;
  aspirantType: AspirantType;
}

interface AuthState {
  user: AuthUser | null;
  isGuest: boolean;
  isAdmin: boolean;
  personalTodos: PersonalTodo[];
  loading: boolean;
  captainClubs: string[]; // club IDs this user is captain of
}

interface AuthContextValue extends AuthState {
  sendOtp: (
    mobile: string,
    options?: {
      name?: string;
      city?: string;
      aspirantType?: AspirantType;
      role?: "aspirant" | "admin";
    }
  ) => Promise<{ ok: boolean; error?: string }>;
  verifyOtp: (
    mobile: string,
    otp: string,
    registrationData?: { name: string; city: string; aspirantType: AspirantType }
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  enterAsGuest: () => void;
  addPersonalTodo: (title: string) => Promise<void>;
  togglePersonalTodo: (id: string) => Promise<void>;
  deletePersonalTodo: (id: string) => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function profileToAuthUser(p: DBProfile): AuthUser {
  return {
    id: p.id,
    name: p.name,
    initials: p.initials,
    mobile: p.mobile ?? "",
    city: p.city ?? "",
    aspirantType: (p.aspirant_type as AspirantType) ?? "NDA",
    ssb_board: p.ssb_board ?? undefined,
    role: p.role,
    streak: p.streak,
  };
}

// ─── LocalStorage fallback (used when supabase is not configured) ─────────────

const LS_SESSION = "ct_session";
const LS_TODOS = "ct_personal_todos";
function ls_getSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(LS_SESSION) || "null"); } catch { return null; }
}
function ls_saveSession(u: AuthUser | null) {
  if (u) localStorage.setItem(LS_SESSION, JSON.stringify(u));
  else localStorage.removeItem(LS_SESSION);
}
function ls_getTodos(): PersonalTodo[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_TODOS) || "[]"); } catch { return []; }
}
function ls_saveTodos(t: PersonalTodo[]) {
  localStorage.setItem(LS_TODOS, JSON.stringify(t));
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

function formatIndianMobileToE164(mobile: string) {
  const digits = mobile.replace(/\D/g, "");
  const ten = digits.slice(-10);
  return `+91${ten}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [captainClubs, setCaptainClubs] = useState<string[]>([]);
  const [personalTodos, setPersonalTodos] = useState<PersonalTodo[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Load session on mount ────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      // 1. Check local session first
      let localSession = ls_getSession();
      
      // CRITICAL FIX: If Supabase is ONLINE, aggressively destroy any fake offline "admin" 
      // ghosts from localStorage. Otherwise, their user.id = "admin" instead of a UUID,
      // which causes Supabase to brutally reject any updates like mission approvals!
      if (isSupabaseConfigured && localSession?.id === "admin") {
          console.warn("[Auth] Purging fake offline admin session because Supabase is active.");
          ls_saveSession(null);
          localSession = null;
      }

      if (localSession) {
        setUser(localSession);
        if (localSession.id !== "admin") {
          setPersonalTodos(ls_getTodos());
        }
      }

      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      // 2. Supabase: get current session (Overrides local if found)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadProfileAndTodos(session.user.id);
        } else if (!localSession) {
          setUser(null);
        }
      } catch (e) {
        console.warn("Supabase auth init failed:", e);
      }
      
      setLoading(false);

      // 3. Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await loadProfileAndTodos(session.user.id);
        } else {
          // Only clear if we're not using the admin master bypass AND supabase is offline
          setUser((curr) => {
            if (!isSupabaseConfigured && curr?.id === "admin") return curr;
            return null;
          });
          setCaptainClubs([]);
          setPersonalTodos([]);
        }
      });
      return () => subscription.unsubscribe();
    }
    init();
  }, []);

  async function loadProfileAndTodos(userId: string) {
    if (!supabase) return;
    const [{ data: profile }, { data: todos }, { data: captains }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("personal_todos").select("*").eq("user_id", userId).order("created_at"),
      supabase.from("captain_assignments").select("club_id").eq("profile_id", userId),
    ]);
    if (profile) {
      const authUser = profileToAuthUser(profile as DBProfile);
      setUser(authUser);
      setIsGuest(false);
      ls_saveSession(authUser); // Crucial: sync database role to local cache
    } else {
      // 2. Fallback: If profile table is slow, use Auth metadata
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.warn("Profile table missing entry, using Auth metadata fallback.");
        const meta = session.user.user_metadata;
        const fallbackUser: AuthUser = {
          id: session.user.id,
          name: meta?.name || "Aspirant",
          initials: meta?.initials || "XX",
          mobile: meta?.mobile || "",
          city: meta?.city || "",
          aspirantType: meta?.aspirant_type || "Other",
          role: meta?.role || "aspirant",
          streak: 0,
        };
        setUser(fallbackUser);
        setIsGuest(false);
        ls_saveSession(fallbackUser);
      }
    }
    if (todos) {
      setPersonalTodos(todos.map((t: { id: string; title: string; done: boolean; created_at: string }) => ({
        id: t.id, title: t.title, done: t.done, createdAt: t.created_at,
      })));
    }
    if (captains) {
      setCaptainClubs(captains.map((c: { club_id: string }) => c.club_id));
    }
  }

  // ── Phone OTP Auth (Supabase) ────────────────────────────────────────────────

  const sendOtp: AuthContextValue["sendOtp"] = async (mobile, options) => {
    const cleanMobile = mobile.trim();
    const digits = cleanMobile.replace(/\D/g, "");
    if (digits.length !== 10) return { ok: false, error: "Mobile number must be exactly 10 digits." };

    if (!isSupabaseConfigured || !supabase) {
      return { ok: false, error: "Supabase is not configured. Phone OTP login is unavailable." };
    }

    const phone = formatIndianMobileToE164(cleanMobile);
    const initials = options?.name ? makeInitials(options.name) : undefined;
    const role = options?.role ?? "aspirant";

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: options
        ? {
            data: {
              ...(options.name ? { name: options.name } : {}),
              ...(initials ? { initials } : {}),
              mobile: cleanMobile,
              ...(options.city ? { city: options.city } : {}),
              ...(options.aspirantType ? { aspirant_type: options.aspirantType } : {}),
              role,
            },
          }
        : undefined,
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const verifyOtp: AuthContextValue["verifyOtp"] = async (mobile, otp, registrationData) => {
    const cleanMobile = mobile.trim();
    const digits = cleanMobile.replace(/\D/g, "");
    if (digits.length !== 10) return { ok: false, error: "Mobile number must be exactly 10 digits." };
    if (!otp.trim()) return { ok: false, error: "Enter the 6-digit OTP." };

    if (!isSupabaseConfigured || !supabase) {
      return { ok: false, error: "Supabase is not configured. Phone OTP login is unavailable." };
    }

    setLoading(true);
    try {
      const phone = formatIndianMobileToE164(cleanMobile);
      const { data, error } = await supabase.auth.verifyOtp({
        type: "sms",
        phone,
        token: otp.trim(),
      });

      if (error) return { ok: false, error: error.message };

      if (data.user) {
        // If this was registration, ensure profile exists/updated
        if (registrationData) {
          const initials = makeInitials(registrationData.name);
          const { error: upsertError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            name: registrationData.name,
            initials,
            mobile: cleanMobile,
            city: registrationData.city,
            aspirant_type: registrationData.aspirantType,
            role: "aspirant",
          });
          if (upsertError) return { ok: false, error: upsertError.message };
        }

        await loadProfileAndTodos(data.user.id);
      }

      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "OTP verification failed." };
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────────

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null); setIsGuest(false);
    ls_saveSession(null);
    setPersonalTodos([]);
    setCaptainClubs([]);
  };

  // ── Guest ────────────────────────────────────────────────────────────────────

  const enterAsGuest = () => { setUser(null); setIsGuest(true); };

  // ── Personal Todos ───────────────────────────────────────────────────────────

  const addPersonalTodo = async (title: string) => {
    if (!isSupabaseConfigured || !supabase || !user) {
      const todo: PersonalTodo = { id: `pt_${Date.now()}`, title, done: false, createdAt: new Date().toISOString() };
      const updated = [...personalTodos, todo];
      setPersonalTodos(updated); ls_saveTodos(updated); return;
    }
    const { data } = await supabase.from("personal_todos").insert({ user_id: user.id, title }).select().single();
    if (data) setPersonalTodos(prev => [...prev, { id: data.id, title: data.title, done: data.done, createdAt: data.created_at }]);
  };

  const togglePersonalTodo = async (id: string) => {
    const todo = personalTodos.find(t => t.id === id);
    if (!todo) return;
    const updated = personalTodos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setPersonalTodos(updated);
    if (!isSupabaseConfigured || !supabase) { ls_saveTodos(updated); return; }
    await supabase.from("personal_todos").update({ done: !todo.done }).eq("id", id);
  };

  const deletePersonalTodo = async (id: string) => {
    const updated = personalTodos.filter(t => t.id !== id);
    setPersonalTodos(updated);
    if (!isSupabaseConfigured || !supabase) { ls_saveTodos(updated); return; }
    await supabase.from("personal_todos").delete().eq("id", id);
  };

  return (
    <AuthContext.Provider
      value={{
        user, isGuest, isAdmin: user?.role === "admin",
        personalTodos, loading, captainClubs,
        sendOtp, verifyOtp, logout, enterAsGuest,
        addPersonalTodo, togglePersonalTodo, deletePersonalTodo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
