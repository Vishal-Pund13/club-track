"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileTabBar from "@/components/MobileTabBar";
import { useAuth } from "@/lib/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const { user, setPassword } = useAuth();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      // username is stored in profiles; we load it below if available
    }
  }, [user]);

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      if (!isSupabaseConfigured || !supabase) return;
      const { data } = await supabase.from("profiles").select("username").eq("id", user.id).single();
      if (data?.username) setUsername(data.username);
    }
    load();
  }, [user?.id]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!user) return;
    if (!isSupabaseConfigured || !supabase) return setError("Supabase is not configured.");
    if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return setError("Username must be 3–20 chars (letters/numbers/underscore).");
    }
    setLoading(true);
    try {
      const { error: upErr } = await supabase
        .from("profiles")
        .update({ username: username || null, name })
        .eq("id", user.id);
      if (upErr) return setError(upErr.message);
      setSuccess("Profile updated.");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const r = await setPassword(newPassword);
      if (!r.ok) return setError(r.error || "Failed to change password.");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="app-grid">
        <Sidebar />
        <main className="page-main" style={{ maxWidth: 760 }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <h1 style={{ marginBottom: "0.25rem" }}>Profile</h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Update your username and password.
            </p>
          </div>

          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: error ? "rgba(220,50,50,0.12)" : "rgba(78,95,59,0.10)",
                  border: error ? "1px solid rgba(220,50,50,0.3)" : "1px solid rgba(78,95,59,0.25)",
                  borderRadius: 10,
                  padding: "0.8rem 1rem",
                  marginBottom: "1rem",
                  color: error ? "#f87171" : "var(--text-sub)",
                  fontSize: "0.85rem",
                }}
              >
                {error ? `⚠ ${error}` : `✓ ${success}`}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="card" style={{ marginBottom: "1rem" }}>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Account</h2>
            <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                  Unique Username
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. rajesh_nda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                  Display Name
                </label>
                <input
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <button className="btn-amber" disabled={loading} type="submit">
                {loading ? "Saving…" : "Save Profile"}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Password</h2>
            <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <input
                className="input-field"
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                className="input-field"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button className="btn-amber" disabled={loading} type="submit">
                {loading ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>
        </main>
      </div>
      <MobileTabBar />
    </>
  );
}

