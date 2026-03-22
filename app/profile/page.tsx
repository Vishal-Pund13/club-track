"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileTabBar from "@/components/MobileTabBar";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, CheckCircle2, AlertCircle } from "lucide-react";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, setPassword } = useAuth();
  const { state } = useApp();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalPts = user ? (state.userClubPoints[user.id] ? Object.values(state.userClubPoints[user.id]).reduce((s, v) => s + v, 0) : 0) : 0;
  const myRank = [...state.users].sort((a, b) => b.total_pts - a.total_pts).findIndex(u => u.id === user?.id) + 1;

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  useEffect(() => {
    async function load() {
      if (!user?.id || !isSupabaseConfigured || !supabase) return;
      const { data } = await supabase.from("profiles").select("username").eq("id", user.id).single();
      if (data?.username) setUsername(data.username);
    }
    load();
  }, [user?.id]);

  const clearFeedback = () => { setError(""); setSuccess(""); };

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    clearFeedback();
    if (!user) return;
    if (!isSupabaseConfigured || !supabase) return setError("Supabase is not configured.");
    if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return setError("Username must be 3–20 chars (letters, numbers, underscore).");
    }
    setLoading(true);
    try {
      const { error: upErr } = await supabase.from("profiles").update({ username: username || null, name }).eq("id", user.id);
      if (upErr) return setError(upErr.message);
      setSuccess("Profile updated successfully.");
    } finally { setLoading(false); }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    clearFeedback();
    if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords don't match.");
    setLoading(true);
    try {
      const r = await setPassword(newPassword);
      if (!r.ok) return setError(r.error || "Failed to change password.");
      setNewPassword(""); setConfirmPassword("");
      setSuccess("Password updated successfully.");
    } finally { setLoading(false); }
  }

  return (
    <>
      <div className="page-wrapper">
        <Sidebar />
        <main className="page-main">
          <div style={{ maxWidth: 600, margin: "0 auto" }}>

            {/* Header with user overview */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", padding: "1.25rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
              <div className="avatar-lg" style={{ width: 52, height: 52, fontSize: "1rem" }}>
                {user?.initials ?? "?"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", marginBottom: "0.15rem" }}>
                  {user?.name ?? "Guest"}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {user?.role === "admin" ? "Administrator" : user?.city ? `${user?.aspirantType ?? "Aspirant"} · ${user.city}` : "Aspirant"}
                </div>
              </div>
              {user && (
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <div style={{ textAlign: "center", padding: "0.4rem 0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1rem", fontWeight: 700, color: "var(--accent)" }}>{totalPts}</div>
                    <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Points</div>
                  </div>
                  {myRank > 0 && (
                    <div style={{ textAlign: "center", padding: "0.4rem 0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>#{myRank}</div>
                      <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Rank</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Feedback banner */}
            <AnimatePresence>
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.6rem",
                    background: error ? "rgba(248,113,113,0.08)" : "rgba(16,185,129,0.08)",
                    border: `1px solid ${error ? "rgba(248,113,113,0.3)" : "rgba(16,185,129,0.3)"}`,
                    borderRadius: "var(--radius-sm)",
                    padding: "0.75rem 1rem",
                    marginBottom: "1rem",
                    fontSize: "0.85rem",
                    color: error ? "#f87171" : "#10b981",
                  }}
                >
                  {error ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                  {error || success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Account info form */}
            <div className="card" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.1rem" }}>
                <User size={15} style={{ color: "var(--accent)" }} />
                <h2 style={{ margin: 0 }}>Account Details</h2>
              </div>
              <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <Field label="Display Name">
                  <input className="input-field" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
                </Field>
                <Field label="Username (optional)">
                  <input className="input-field" placeholder="e.g. rajesh_nda" value={username} onChange={e => setUsername(e.target.value)} />
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>3–20 characters · letters, numbers, underscore only</p>
                </Field>
                <button className="btn-amber" disabled={loading} type="submit" style={{ alignSelf: "flex-start" }}>
                  {loading ? "Saving…" : "Save Changes"}
                </button>
              </form>
            </div>

            {/* Password change */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.1rem" }}>
                <Lock size={15} style={{ color: "var(--accent)" }} />
                <h2 style={{ margin: 0 }}>Change Password</h2>
              </div>
              <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <Field label="New Password">
                  <input className="input-field" type="password" placeholder="Minimum 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </Field>
                <Field label="Confirm Password">
                  <input className="input-field" type="password" placeholder="Re-enter new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </Field>
                <button className="btn-amber" disabled={loading} type="submit" style={{ alignSelf: "flex-start" }}>
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            </div>

          </div>
        </main>
      </div>
      <MobileTabBar />
    </>
  );
}
