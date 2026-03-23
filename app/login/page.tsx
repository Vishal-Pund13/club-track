"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";

const militaryLoaderPhrases = {
  otpSend: ["Transmitting signal...", "Encoding message...", "Dispatching orders..."],
  otpVerify: ["Authenticating...", "Verifying clearance...", "Cross-checking records..."],
};

function MilitaryLoader({ phrases }: { phrases: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, 800);
    return () => clearInterval(timer);
  }, [phrases]);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
      <style>
        {`@keyframes pulseBlink { 0% { opacity: 0.1; } 100% { opacity: 1; } }`}
      </style>
      <span style={{ color: "#10b981", animation: "pulseBlink 0.6s infinite alternate", fontSize: "0.85em" }}>●</span>
      {phrases[index]}
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { enterAsGuest, sendOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const clearMessages = () => { setError(""); setSuccess(""); };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    
    setLoading(true);
    try {
      const result = await sendOtp(email, { shouldCreateUser: false });
      if (!result.ok) { setError(result.error || "Login failed - account may not exist."); return; }
      
      setSuccess(`8-digit code dispatched to ${email}`);
      setStep("otp");
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (otp.length < 8) { setError("Enter the 8-digit code."); return; }
    
    setLoading(true);
    try {
      const result = await verifyOtp(email, otp);
      if (!result.ok) { 
        setError(result.error || "Verification failed.");
        setLoading(false);
        return; 
      }
      
      router.push("/ops");
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleGuest = () => {
    enterAsGuest();
    router.push("/ops");
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
        {step === "otp" && (
          <button
            onClick={() => { setStep("email"); setOtp(""); clearMessages(); }}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", fontWeight: 500, padding: 0, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.4rem", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
          >
            ← Back
          </button>
        )}

        <div style={{ marginBottom: "2rem" }}>
          {step === "email" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
              <div style={{ width: 34, height: 34, background: "var(--accent)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Activity size={18} strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--text)" }}>ClubTrack</span>
            </div>
          )}
          <h1 style={{ fontSize: "1.65rem", fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
            {step === "email" ? "Report for Duty" : "Authenticate"}
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            {step === "email" ? "Sign in using your registered email address" : `Check your comms. Code sent to ${email}`}
          </p>
        </div>

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

        {step === "email" && (
          <>
            <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  Registered Email
                </label>
                <input
                  type="email"
                  placeholder="HQ@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  style={{ padding: "0.85rem 1rem", fontSize: "0.95rem" }}
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
                {loading ? <MilitaryLoader phrases={militaryLoaderPhrases.otpSend} /> : "Request Login Code"}
              </button>

              <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                Not enlisted yet?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/enlist")}
                  style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem", padding: 0 }}
                >
                  Create an account →
                </button>
              </div>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "2rem 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <button onClick={handleGuest} className="btn-outline" style={{ width: "100%", padding: "1rem" }}>
              Enter as Guest Observer
            </button>
          </>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>8-Digit Code</label>
              <input
                type="text" inputMode="numeric" pattern="\d{8}" maxLength={8}
                placeholder="00000000" value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                required className="input-field"
                style={{ letterSpacing: "0.5rem", fontSize: "1.5rem", textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
            <button type="submit" disabled={loading || otp.length !== 8} className="btn-amber" style={{ padding: "1.1rem", fontSize: "1rem", marginTop: "0.5rem" }}>
              {loading ? <MilitaryLoader phrases={militaryLoaderPhrases.otpVerify} /> : "Verify Identity"}
            </button>
            <button type="button" onClick={async () => { setError(""); setOtp(""); await handleSendOtp({ preventDefault: () => {} } as React.FormEvent); }}
              style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.80rem", cursor: "pointer", textAlign: "center", width: "100%", marginTop: "0.5rem" }}>
              Didn't receive orders? Resend code
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
