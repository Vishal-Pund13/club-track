"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileTabBar from "@/components/MobileTabBar";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, Shield, Flame } from "lucide-react";

// ─── Reusable field wrapper ────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: "0.72rem", fontWeight: 700,
        color: "var(--text-muted)", textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: "0.4rem",
      }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: "0.71rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>{hint}</p>}
    </div>
  );
}

// ─── Read-only info chip ───────────────────────────────────────────────────────

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: "var(--surface-2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)", padding: "0.6rem 0.85rem",
    }}>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.9rem", color: "var(--text)", fontWeight: 500 }}>{value || "—"}</div>
    </div>
  );
}

// ─── Feedback banner ───────────────────────────────────────────────────────────

function Feedback({ error, success }: { error: string; success: string }) {
  const msg = error || success;
  const isError = !!error;
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            display: "flex", alignItems: "center", gap: "0.6rem", overflow: "hidden",
            background: isError ? "rgba(248,113,113,0.08)" : "rgba(16,185,129,0.08)",
            border: `1px solid ${isError ? "rgba(248,113,113,0.3)" : "rgba(16,185,129,0.3)"}`,
            borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem",
            marginBottom: "1rem", fontSize: "0.85rem",
            color: isError ? "#f87171" : "#10b981",
          }}
        >
          {isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, setPassword } = useAuth();
  const { state } = useApp();

  // Editable fields
  const [name, setName] = useState("");

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Loading states (separate per form)
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Feedback — shared display, but error/success are distinct
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Derived stats
  const totalPts = user
    ? Object.values(state.userClubPoints[user.id] ?? {}).reduce((s, v) => s + v, 0)
    : 0;
  const myRank =
    [...state.users].sort((a, b) => b.total_pts - a.total_pts).findIndex(u => u.id === user?.id) + 1;
  const myUser = state.users.find(u => u.id === user?.id);

  // Fill name from auth user
  useEffect(() => {
    if (user) setName(user.name);
  }, [user?.name]);

  // ── Save display name ──────────────────────────────────────────────────────
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(""); setProfileSuccess("");
    if (!user) return;
    if (!name.trim()) { setProfileError("Display name cannot be empty."); return; }
    if (!isSupabaseConfigured || !supabase) { setProfileError("Supabase is not configured."); return; }

    setProfileLoading(true);
    try {
      const { error: upErr } = await supabase
        .from("profiles")
        .update({ name: name.trim() })
        .eq("id", user.id);
      if (upErr) { setProfileError(upErr.message); return; }
      setProfileSuccess("Display name updated.");
    } finally {
      setProfileLoading(false);
    }
  }

  // ── Change password ────────────────────────────────────────────────────────
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(""); setPasswordSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const r = await setPassword(newPassword);
      if (!r.ok) { setPasswordError(r.error || "Failed to change password."); return; }
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password updated successfully. Use it next time you sign in.");
    } finally {
      setPasswordLoading(false);
    }
  }

  if (!user) {
    return (
      <>
        <div className="page-wrapper">
          <Sidebar />
          <main className="page-main">
            <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
              <User size={32} style={{ marginBottom: "1rem", opacity: 0.4 }} />
              <div style={{ fontWeight: 600 }}>Not signed in</div>
              <p style={{ fontSize: "0.85rem", marginTop: "0.4rem" }}>Please sign in to view your profile.</p>
            </div>
          </main>
        </div>
        <MobileTabBar />
      </>
    );
  }

  return (
    <>
      <div className="page-wrapper">
        <Sidebar />
        <main className="page-main">
          <div style={{ maxWidth: 600, margin: "0 auto" }}>

            {/* ── User header card ── */}
            <div style={{
              display: "flex", alignItems: "center", gap: "1rem",
              marginBottom: "1.75rem", padding: "1.5rem",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}>
              <div className="avatar-lg" style={{ width: 56, height: 56, fontSize: "1.1rem", flexShrink: 0 }}>
                {user.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--text)", marginBottom: "0.15rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.name}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {user.role === "admin"
                    ? "Administrator"
                    : `${user.aspirantType ?? "Aspirant"}${user.city ? ` · ${user.city}` : ""}`}
                </div>
                {user.mobile && (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    📱 {user.mobile}
                  </div>
                )}
              </div>

              {/* Stats chips */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0 }}>
                <div style={{ textAlign: "center", padding: "0.4rem 0.75rem", background: "var(--bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.05rem", fontWeight: 700, color: "var(--accent)" }}>{totalPts}</div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Points</div>
                </div>
                {myRank > 0 && (
                  <div style={{ textAlign: "center", padding: "0.4rem 0.75rem", background: "var(--bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.05rem", fontWeight: 700, color: "var(--text)" }}>#{myRank}</div>
                    <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Rank</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Read-only info grid ── */}
            {user.role !== "admin" && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  Account Info
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  <InfoChip label="Mobile" value={user.mobile || "—"} />
                  <InfoChip label="City" value={user.city || "—"} />
                  <InfoChip label="Entry Type" value={user.aspirantType || "—"} />
                  <div style={{
                    background: (myUser?.streak ?? 0) > 0 ? "rgba(78,95,59,0.07)" : "var(--surface-2)",
                    border: `1px solid ${(myUser?.streak ?? 0) > 0 ? "var(--accent-dim)" : "var(--border)"}`,
                    borderRadius: "var(--radius-sm)", padding: "0.6rem 0.85rem",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                  }}>
                    <Flame size={16} style={{ color: (myUser?.streak ?? 0) > 0 ? "var(--accent)" : "var(--text-muted)", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.15rem" }}>Streak</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: (myUser?.streak ?? 0) > 0 ? "var(--accent)" : "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {myUser?.streak ?? 0} day{(myUser?.streak ?? 0) !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.6rem" }}>
                  Mobile, city, and entry type cannot be changed. Contact an administrator if needed.
                </p>
              </div>
            )}

            {/* ── Edit display name ── */}
            <div className="card" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.1rem" }}>
                <User size={15} style={{ color: "var(--accent)" }} />
                <h2 style={{ margin: 0 }}>Display Name</h2>
              </div>

              <Feedback error={profileError} success={profileSuccess} />

              <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <Field label="Full Name" hint="This is the name shown on the leaderboard and your profile.">
                  <input
                    className="input-field"
                    placeholder="Your full name"
                    value={name}
                    onChange={e => { setName(e.target.value); setProfileError(""); setProfileSuccess(""); }}
                  />
                </Field>
                <button
                  className="btn-amber"
                  disabled={profileLoading || name.trim() === user.name}
                  type="submit"
                  style={{ alignSelf: "flex-start" }}
                >
                  {profileLoading ? "Saving…" : "Save Name"}
                </button>
              </form>
            </div>

            {/* ── Change password ── */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Lock size={15} style={{ color: "var(--accent)" }} />
                <h2 style={{ margin: 0 }}>Change Password</h2>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1.1rem" }}>
                Update the password you use to sign in with your mobile number.
              </p>

              <Feedback error={passwordError} success={passwordSuccess} />

              <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <Field label="New Password" hint="Minimum 8 characters.">
                  <div style={{ position: "relative" }}>
                    <input
                      className="input-field"
                      type={showNewPass ? "text" : "password"}
                      placeholder="New password"
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setPasswordError(""); setPasswordSuccess(""); }}
                      style={{ paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(p => !p)}
                      style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}
                    >
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>

                <Field label="Confirm Password">
                  <div style={{ position: "relative" }}>
                    <input
                      className="input-field"
                      type={showConfirmPass ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setPasswordError(""); setPasswordSuccess(""); }}
                      style={{ paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(p => !p)}
                      style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}
                    >
                      {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>

                {/* Password strength indicator */}
                {newPassword.length > 0 && (
                  <div>
                    <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.3rem" }}>
                      {[1, 2, 3, 4].map(i => {
                        const strength = Math.min(4, Math.floor(newPassword.length / 3));
                        return (
                          <div key={i} style={{
                            flex: 1, height: 3, borderRadius: 9999,
                            background: i <= strength
                              ? (strength <= 1 ? "#f87171" : strength <= 2 ? "#fbbf24" : strength <= 3 ? "#a3e635" : "#10b981")
                              : "var(--border-dark)",
                            transition: "background 0.2s",
                          }} />
                        );
                      })}
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      {newPassword.length < 8 ? "Too short" : newPassword.length < 10 ? "Weak" : newPassword.length < 13 ? "Good" : "Strong"}
                    </span>
                  </div>
                )}

                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <div style={{ fontSize: "0.72rem", color: newPassword === confirmPassword ? "#10b981" : "#f87171", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    {newPassword === confirmPassword ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {newPassword === confirmPassword ? "Passwords match" : "Passwords don't match"}
                  </div>
                )}

                <button
                  className="btn-amber"
                  disabled={passwordLoading || newPassword.length < 8 || newPassword !== confirmPassword}
                  type="submit"
                  style={{ alignSelf: "flex-start" }}
                >
                  {passwordLoading ? "Updating…" : "Update Password"}
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
