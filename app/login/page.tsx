"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, enterAsGuest, sendOtp, verifyOtp, setPassword: authSetPassword } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"member" | "admin">("member");

  // Forgot Password state
  // null = showing normal login
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "password" | null>(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotPass, setForgotPass] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");

  const clearMessages = () => { setError(""); setSuccess(""); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!identifier.trim()) { setError("Please enter your email or mobile number."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    setLoading(true);
    try {
      const result = await login(identifier, password);
      if (!result.ok) { setError(result.error || "Login failed."); return; }
      router.push(mode === "admin" ? "/admin" : "/ops");
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    enterAsGuest();
    router.push("/ops");
  };

  const handleForgotSend = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!forgotEmail.includes("@")) { setError("Please enter a valid email."); return; }
    setLoading(true);
    try {
      const result = await sendOtp(forgotEmail, { shouldCreateUser: false });
      if (!result.ok) { setError(result.error || "Failed to send reset code."); return; }
      setSuccess(`Reset code sent to ${forgotEmail}`);
      setForgotStep("otp");
    } catch (err) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (forgotOtp.length < 8) { setError("Enter the 8-digit code."); return; }
    setLoading(true);
    try {
      // This will actually log the user in if the OTP is correct!
      const result = await verifyOtp(forgotEmail, forgotOtp);
      if (!result.ok) { setError(result.error || "Verification failed."); return; }
      setSuccess("Code verified. Set your new password.");
      setForgotStep("password");
    } catch (err) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (forgotPass.length < 8) { setError("Password must be at least 8 chars."); return; }
    if (forgotPass !== forgotConfirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      const result = await authSetPassword(forgotPass);
      if (!result.ok) { setError(result.error || "Failed to set password."); return; }
      // Fully successful, they are logged in with new password
      router.push("/ops");
    } catch (err) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const resetForgotState = () => {
    setForgotStep(null);
    setForgotEmail("");
    setForgotOtp("");
    setForgotPass("");
    setForgotConfirm("");
    clearMessages();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "80vw", height: "45vh", background: "radial-gradient(ellipse at 50% 0%, var(--accent-light) 0%, transparent 70%)", pointerEvents: "none", opacity: 0.6 }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "2.5rem 2.25rem",
          boxShadow: "var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.04)",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Back link */}
        <button
          onClick={() => {
            if (forgotStep) resetForgotState();
            else router.push("/");
          }}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", fontWeight: 500, padding: 0, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.4rem", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          {!forgotStep && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
              <div style={{ width: 34, height: 34, background: "var(--accent)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Activity size={18} strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--text)" }}>ClubTrack</span>
            </div>
          )}
          <h1 style={{ fontSize: "1.65rem", fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
            {forgotStep === "email" && "Reset Password"}
            {forgotStep === "otp" && "Verify Code"}
            {forgotStep === "password" && "New Password"}
            {!forgotStep && "Welcome back"}
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            {forgotStep === "email" && "Enter your registered email to receive a reset code."}
            {forgotStep === "otp" && `We sent an 8-digit code to ${forgotEmail}.`}
            {forgotStep === "password" && "Enter a new secure password."}
            {!forgotStep && "Sign in to your account"}
          </p>
        </div>

        {/* Feedback Messages */}
        <AnimatePresence>
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: error ? "rgba(248,113,113,0.08)" : "rgba(16,185,129,0.08)",
                border: `1px solid ${error ? "rgba(248,113,113,0.3)" : "rgba(16,185,129,0.3)"}`,
                borderRadius: 10, padding: "0.85rem", marginBottom: "1.25rem", fontSize: "0.85rem",
                color: error ? "#f87171" : "#10b981", overflow: "hidden", display: "flex", gap: "0.5rem", alignItems: "flex-start"
              }}
            >
              <span style={{ marginTop: 2 }}>{error ? "⚠" : "✓"}</span> {error || success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- FORGOT PASSWORD FLOW --- */}
        {forgotStep === "email" && (
          <form onSubmit={handleForgotSend} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Registered Email</label>
              <input
                type="email" placeholder="name@example.com" value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)} required
                className="input-field" style={{ padding: "0.85rem 1rem", fontSize: "0.95rem" }}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-amber" style={{ padding: "1.1rem", fontSize: "1rem", marginTop: "0.5rem" }}>
              {loading ? "Sending…" : "Send Reset Code"}
            </button>
          </form>
        )}

        {forgotStep === "otp" && (
          <form onSubmit={handleForgotVerify} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>8-Digit Code</label>
              <input
                type="text" inputMode="numeric" pattern="\d{8}" maxLength={8}
                placeholder="00000000" value={forgotOtp}
                onChange={e => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                required className="input-field"
                style={{ letterSpacing: "0.5rem", fontSize: "1.5rem", textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
            <button type="submit" disabled={loading || forgotOtp.length !== 8} className="btn-amber" style={{ padding: "1.1rem", fontSize: "1rem", marginTop: "0.5rem" }}>
              {loading ? "Verifying…" : "Verify Code"}
            </button>
          </form>
        )}

        {forgotStep === "password" && (
          <form onSubmit={handleForgotSetPassword} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>New Password</label>
              <input
                type="password" placeholder="Min 8 characters" value={forgotPass}
                onChange={e => setForgotPass(e.target.value)} required
                className="input-field" style={{ padding: "0.85rem 1rem", fontSize: "0.95rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Confirm Password</label>
              <input
                type="password" placeholder="Re-enter password" value={forgotConfirm}
                onChange={e => setForgotConfirm(e.target.value)} required
                className="input-field" style={{ padding: "0.85rem 1rem", fontSize: "0.95rem" }}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-amber" style={{ padding: "1.1rem", fontSize: "1rem", marginTop: "0.5rem" }}>
              {loading ? "Updating…" : "Update Password & Sign In"}
            </button>
          </form>
        )}

        {/* --- NORMAL LOGIN FLOW --- */}
        {!forgotStep && (
          <>
            {/* Role toggle */}
            <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--border-dark)", borderRadius: 10, padding: 4, marginBottom: "2rem" }}>
              {(["member", "admin"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); clearMessages(); }}
                  style={{
                    flex: 1, padding: "0.65rem", border: "none", borderRadius: 8,
                    fontSize: "0.85rem", fontWeight: 600,
                    background: mode === m ? "var(--accent)" : "transparent",
                    color: mode === m ? "#fff" : "var(--text-muted)",
                    cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize",
                    boxShadow: mode === m ? "var(--shadow-sm)" : "none",
                  }}
                >
                  {m === "member" ? "Member" : "Admin"}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  {mode === "admin" ? "Admin Email" : "Mobile Number or Email"}
                </label>
                <input
                  type={mode === "admin" ? "email" : "text"}
                  inputMode={mode === "member" ? "numeric" : undefined}
                  placeholder={mode === "admin" ? "admin@clubtrack.app" : "10-digit mobile or email"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="input-field"
                  style={{ padding: "0.85rem 1rem", fontSize: "0.95rem" }}
                />
                {mode === "member" && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "0.35rem" }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", flex: 1 }}>
                      Enter your 10-digit mobile number or registered email.
                    </p>
                  </div>
                )}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>Password</label>
                  <button type="button" onClick={() => { clearMessages(); setForgotStep("email"); }}
                    style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", padding: 0 }}>
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  style={{ padding: "0.85rem 1rem", fontSize: "0.95rem", fontFamily: "small-caption" }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-amber"
                style={{
                  padding: "1.1rem", fontSize: "1rem", marginTop: "0.5rem",
                  opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>

              <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/enlist")}
                  style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem", padding: 0 }}
                >
                  Create an account →
                </button>
              </div>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "2rem 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <button onClick={handleGuest} className="btn-outline" style={{ width: "100%", padding: "1rem" }}>
              Continue as Guest
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
