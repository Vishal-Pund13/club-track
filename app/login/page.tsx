"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login, enterAsGuest } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"aspirant" | "admin">("aspirant");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(identifier, password);
      if (!result.ok) return setError(result.error || "Login failed.");
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(78,95,59,0.25)",
    borderRadius: 10,
    padding: "0.8rem 1rem",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
    color: "#cdd5c5",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "rgba(185,200,170,0.65)",
    marginBottom: "0.45rem",
    display: "block",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0c0e0a 0%, #101410 50%, #0e100c 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Glow */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "80vw", height: "45vh", background: "radial-gradient(ellipse at 50% 0%, rgba(78,95,59,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(78,95,59,0.22)",
          borderRadius: 20,
          padding: "2.5rem 2.25rem",
          boxShadow: "0 12px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
          position: "relative",
          zIndex: 2,
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Back link */}
        <button
          onClick={() => router.push("/")}
          style={{ background: "none", border: "none", color: "rgba(78,95,59,0.6)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Inter', sans-serif", padding: 0, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.3rem", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#4E5F3B"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(78,95,59,0.6)"}
        >
          ← Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
            <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#5d7047,#4E5F3B)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
              ⚔️
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "1rem", color: "#cdd5c5" }}>ClubTrack</span>
          </div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#cdd5c5", margin: 0, letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "0.83rem", color: "rgba(160,180,130,0.5)", marginTop: "0.3rem" }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Role toggle */}
        <div style={{ display: "flex", background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: 3, marginBottom: "1.75rem" }}>
          {(["aspirant", "admin"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: "0.55rem", border: "none", borderRadius: 8,
                fontSize: "0.78rem", fontWeight: 600, fontFamily: "'Inter', sans-serif",
                background: mode === m ? "#4E5F3B" : "transparent",
                color: mode === m ? "#e8eddf" : "rgba(160,180,130,0.5)",
                cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize",
              }}
            >
              {m === "aspirant" ? "Aspirant" : "Admin"}
            </button>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.28)", borderRadius: 8, padding: "0.65rem 1rem", marginBottom: "1rem", fontSize: "0.82rem", color: "#f87171", overflow: "hidden" }}
            >
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>
              {mode === "admin" ? "Admin Email" : "Mobile Number"}
            </label>
            <input
              type="text"
              placeholder={mode === "admin" ? "admin@clubtrack.app" : "10-digit mobile number"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(78,95,59,0.7)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(78,95,59,0.25)")}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(78,95,59,0.7)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(78,95,59,0.25)")}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "rgba(78,95,59,0.5)" : "#4E5F3B",
              color: "#e8eddf", border: "none", borderRadius: 10, padding: "0.88rem",
              fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              marginTop: "0.25rem",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#5d7047"; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#4E5F3B"; }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(160,180,130,0.45)" }}>
            New here?{" "}
            <button
              type="button"
              onClick={() => router.push("/enlist")}
              style={{ background: "none", border: "none", color: "#4E5F3B", fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", padding: 0 }}
            >
              Create account →
            </button>
          </div>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(78,95,59,0.18)" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(78,95,59,0.45)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(78,95,59,0.18)" }} />
        </div>

        <button
          onClick={handleGuest}
          style={{
            width: "100%", background: "transparent", border: "1px solid rgba(78,95,59,0.18)",
            borderRadius: 10, padding: "0.75rem", color: "rgba(160,180,130,0.5)",
            fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(78,95,59,0.38)"; e.currentTarget.style.color = "rgba(160,180,130,0.8)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(78,95,59,0.18)"; e.currentTarget.style.color = "rgba(160,180,130,0.5)"; }}
        >
          Continue as Guest
        </button>
      </motion.div>
    </div>
  );
}
