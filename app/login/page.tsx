"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login, enterAsGuest } = useAuth();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(mobile, password);
      if (!result.ok) return setError(result.error || "Login failed.");
      router.push("/ops");
    } catch (err) {
      console.error(err);
      setError("A tactical error occurred.");
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
    border: "1px solid rgba(78,95,59,0.3)",
    borderRadius: 8,
    padding: "0.75rem 1rem",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
    color: "#cdd5c5",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.62rem",
    fontWeight: 700,
    letterSpacing: "0.18em",
    color: "#4E5F3B",
    textTransform: "uppercase",
    marginBottom: "0.4rem",
    display: "block",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0c0e0a",
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
      {/* Grid BG */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(78,95,59,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(78,95,59,0.06) 1px,transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "80vw", height: "40vh", background: "radial-gradient(ellipse at 50% 0%,rgba(78,95,59,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(78,95,59,0.25)",
          borderRadius: 16,
          padding: "2.5rem 2rem",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Corner accents */}
        <div style={{ position: "absolute", top: 12, left: 16, width: 12, height: 12, borderTop: "1.5px solid rgba(78,95,59,0.5)", borderLeft: "1.5px solid rgba(78,95,59,0.5)" }} />
        <div style={{ position: "absolute", top: 12, right: 16, width: 12, height: 12, borderTop: "1.5px solid rgba(78,95,59,0.5)", borderRight: "1.5px solid rgba(78,95,59,0.5)" }} />
        <div style={{ position: "absolute", bottom: 12, left: 16, width: 12, height: 12, borderBottom: "1.5px solid rgba(78,95,59,0.5)", borderLeft: "1.5px solid rgba(78,95,59,0.5)" }} />
        <div style={{ position: "absolute", bottom: 12, right: 16, width: 12, height: 12, borderBottom: "1.5px solid rgba(78,95,59,0.5)", borderRight: "1.5px solid rgba(78,95,59,0.5)" }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚔️</div>
          <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.35rem", fontWeight: 700, color: "#cdd5c5", margin: 0, letterSpacing: "-0.02em" }}>
            Report for Duty
          </h1>
          <p style={{ fontSize: "0.82rem", color: "rgba(160,180,130,0.5)", marginTop: "0.35rem" }}>
            Authenticate your identity to access Command Center
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: "rgba(220,50,50,0.12)", border: "1px solid rgba(220,50,50,0.3)", borderRadius: 8, padding: "0.65rem 1rem", marginBottom: "1rem", fontSize: "0.82rem", color: "#f87171" }}
            >
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Password login form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <label style={labelStyle}>Mobile Number</label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#4E5F3B")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(78,95,59,0.3)")}
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
                onFocus={(e) => (e.target.style.borderColor = "#4E5F3B")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(78,95,59,0.3)")}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ background: "#4E5F3B", color: "#e8eddf", border: "none", borderRadius: 8, padding: "0.85rem", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              {loading ? "Authenticating…" : "🎯 Authenticate & Deploy"}
            </button>

            <div style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(160,180,130,0.5)" }}>
              Not enlisted yet?{" "}
              <button type="button" onClick={() => router.push("/enlist")} style={{ background: "none", border: "none", color: "#4E5F3B", fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", padding: 0 }}>
                Enlist Now →
              </button>
            </div>
          </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(78,95,59,0.2)" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "rgba(78,95,59,0.5)", letterSpacing: "0.1em" }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "rgba(78,95,59,0.2)" }} />
        </div>

        <button
          onClick={handleGuest}
          style={{ width: "100%", background: "transparent", border: "1px solid rgba(78,95,59,0.2)", borderRadius: 8, padding: "0.75rem", color: "rgba(160,180,130,0.55)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(78,95,59,0.4)"; e.currentTarget.style.color = "rgba(160,180,130,0.8)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(78,95,59,0.2)"; e.currentTarget.style.color = "rgba(160,180,130,0.55)"; }}
        >
          👁 Observe as Civilian (Guest)
        </button>

        <p style={{ textAlign: "center", fontSize: "0.72rem", color: "rgba(78,95,59,0.4)", marginTop: "1.25rem", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}>
          SECURED · SSB OPERATIONS · INDIA
        </p>
      </motion.div>
    </div>
  );
}
