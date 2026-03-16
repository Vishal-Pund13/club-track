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
  password: string;
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
  login: (mobile: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginAdmin: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
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

const LS_USERS = "ct_users";
const LS_SESSION = "ct_session";
const LS_TODOS = "ct_personal_todos";
const ADMIN_CREDS = { username: "admin", password: "admin@ct2025" };

function ls_getUsers(): (RegisterData & { id: string; initials: string })[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_USERS) || "[]"); } catch { return []; }
}
function ls_saveUsers(u: (RegisterData & { id: string; initials: string })[]) {
  localStorage.setItem(LS_USERS, JSON.stringify(u));
}
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [captainClubs, setCaptainClubs] = useState<string[]>([]);
  const [personalTodos, setPersonalTodos] = useState<PersonalTodo[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Load session on mount ────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      if (!isSupabaseConfigured || !supabase) {
        // LocalStorage fallback
        const session = ls_getSession();
        if (session) {
          setUser(session);
          setPersonalTodos(ls_getTodos());
        }
        setLoading(false);
        return;
      }

      // Supabase: get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadProfileAndTodos(session.user.id);
      }
      setLoading(false);

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await loadProfileAndTodos(session.user.id);
        } else {
          setUser(null);
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
      setUser(profileToAuthUser(profile as DBProfile));
      setIsGuest(false);
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

  // ── Login ────────────────────────────────────────────────────────────────────

  const login = async (mobile: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      // LocalStorage fallback
      const users = ls_getUsers();
      const found = users.find((u) => u.mobile === mobile && u.password === password);
      if (!found) return { ok: false, error: "Invalid mobile number or password." };
      const authUser: AuthUser = {
        id: found.id, name: found.name, initials: found.initials,
        mobile: found.mobile, city: found.city, aspirantType: found.aspirantType,
        role: "aspirant", streak: 0,
      };
      setUser(authUser); setIsGuest(false);
      ls_saveSession(authUser);
      setPersonalTodos(ls_getTodos());
      return { ok: true };
    }

    // Supabase: use mobile as email surrogate → mobile@clubtrack.app
    const email = `${mobile.replace(/\s/g, "")}@clubtrack.app`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: "Invalid mobile number or password." };
    return { ok: true };
  };

  // ── Admin Login ──────────────────────────────────────────────────────────────

  const loginAdmin = async (username: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      if (username === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
        const adminUser: AuthUser = {
          id: "admin", name: "Admin", initials: "AD", mobile: "", city: "HQ",
          aspirantType: "Other", role: "admin", streak: 0,
        };
        setUser(adminUser); setIsGuest(false); ls_saveSession(adminUser);
        return { ok: true };
      }
      return { ok: false, error: "Invalid admin credentials." };
    }

    // In production: admin logs in with email/password (admin@clubtrack.app)
    const email = `${username}@clubtrack.app`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: "Invalid admin credentials." };
    return { ok: true };
  };

  // ── Register ─────────────────────────────────────────────────────────────────

  const register = async (data: RegisterData): Promise<{ ok: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      // LocalStorage fallback
      const users = ls_getUsers();
      if (users.find((u) => u.mobile === data.mobile)) {
        return { ok: false, error: "Mobile number already registered. Please login." };
      }
      const newUser = { ...data, id: `u_${Date.now()}`, initials: makeInitials(data.name) };
      ls_saveUsers([...users, newUser]);
      const authUser: AuthUser = {
        id: newUser.id, name: newUser.name, initials: newUser.initials,
        mobile: newUser.mobile, city: newUser.city, aspirantType: newUser.aspirantType,
        role: "aspirant", streak: 0,
      };
      setUser(authUser); setIsGuest(false); ls_saveSession(authUser);
      return { ok: true };
    }

    const email = `${data.mobile.replace(/\s/g, "")}@clubtrack.app`;
    const initials = makeInitials(data.name);

    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          initials,
          mobile: data.mobile,
          city: data.city,
          aspirant_type: data.aspirantType,
          role: "aspirant",
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return { ok: false, error: "Mobile number already registered. Please login." };
      }
      return { ok: false, error: authError.message };
    }

    if (!authData.user) return { ok: false, error: "Authentication failed. No user created." };

    // 2. Manual Profile Creation (Insurance against trigger delay)
    // We use .upsert so it doesn't crash if the trigger already did it.
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: authData.user.id,
      name: data.name,
      initials,
      mobile: data.mobile,
      city: data.city,
      aspirant_type: data.aspirantType,
      role: "aspirant",
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // We don't block here because the trigger might eventually succeed
    }

    // 3. Force load the profile into state
    await loadProfileAndTodos(authData.user.id);
    
    return { ok: true };
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
        login, loginAdmin, register, logout, enterAsGuest,
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
