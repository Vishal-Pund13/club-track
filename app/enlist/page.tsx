"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, AspirantType } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

const ASPIRANT_TYPES: AspirantType[] = [
  "NDA", "CDS", "TGC", "SSC Tech", "ACC", "UES", "NCC Special Entry", "Other",
];

export default function EnlistPage() {
  const router = useRouter();
  const { sendOtp, verifyOtp, setPassword } = useAuth();

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    city: "",
    aspirantType: "" as AspirantType | "",
  });
  const [otp, setOtp] = useState("");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"form" | "otp" | "password">("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.mobile.length !== 10 || !/^\d+$/.test(form.mobile)) {
      return setError("Mobile number must be exactly 10 digits.");
    }
    if (!form.aspirantType) return setError("Select your aspirant entry type.");

    setLoading(true);
    try {
      const result = await sendOtp(form.mobile, {
        name: form.name,
        city: form.city,
        aspirantType: form.aspirantType as AspirantType,
        role: "aspirant",
      });
      if (!result.ok) return setError(result.error || "Failed to send OTP. Try again.");
      setStep("otp");
    } catch (err) {
      console.error(err);
      setError("A tactical error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp(form.mobile, otp, {
        name: form.name,
        city: form.city,
        aspirantType: form.aspirantType as AspirantType,
      });
      if (!result.ok) return setError(result.error || "OTP verification failed. Try again.");
      setStep("password");
    } catch (err) {
      console.error(err);
      setError("A tactical error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match. Soldier, stay sharp!");
    setLoading(true);
    try {
      const r = await setPassword(password);
      if (!r.ok) return setError(r.error || "Failed to set password.");
      router.push("/ops");
    } finally {
      setLoading(false);
    }
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
        padding: "2rem 1.5rem",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* BG */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(78,95,59,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(78,95,59,0.06) 1px,transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "80vw", height: "40vh", background: "radial-gradient(ellipse at 50% 0%,rgba(78,95,59,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(78,95,59,0.25)",
          borderRadius: 16,
          padding: "2.5rem 2rem",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Corners */}
        <div style={{ position: "absolute", top: 12, left: 16, width: 12, height: 12, borderTop: "1.5px solid rgba(78,95,59,0.5)", borderLeft: "1.5px solid rgba(78,95,59,0.5)" }} />
        <div style={{ position: "absolute", top: 12, right: 16, width: 12, height: 12, borderTop: "1.5px solid rgba(78,95,59,0.5)", borderRight: "1.5px solid rgba(78,95,59,0.5)" }} />
        <div style={{ position: "absolute", bottom: 12, left: 16, width: 12, height: 12, borderBottom: "1.5px solid rgba(78,95,59,0.5)", borderLeft: "1.5px solid rgba(78,95,59,0.5)" }} />
        <div style={{ position: "absolute", bottom: 12, right: 16, width: 12, height: 12, borderBottom: "1.5px solid rgba(78,95,59,0.5)", borderRight: "1.5px solid rgba(78,95,59,0.5)" }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🪖</div>
          <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.35rem", fontWeight: 700, color: "#cdd5c5", margin: 0 }}>
            Enlist Now
          </h1>
          <p style={{ fontSize: "0.8rem", color: "rgba(160,180,130,0.5)", marginTop: "0.3rem" }}>
            Join the SSB aspirant community. Fill your field report.
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: "rgba(220,50,50,0.12)", border: "1px solid rgba(220,50,50,0.25)", borderRadius: 8, padding: "0.65rem 1rem", marginBottom: "1rem", fontSize: "0.82rem", color: "#f87171" }}
            >
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {step === "form" && (
          <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              placeholder="e.g. Rajesh Kumar Singh"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#4E5F3B")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(78,95,59,0.3)")}
            />
          </div>

          {/* Mobile */}
          <div>
            <label style={labelStyle}>Mobile Number</label>
            <input
              type="tel"
              placeholder="10-digit mobile"
              value={form.mobile}
              onChange={(e) => set("mobile", e.target.value)}
              required
              maxLength={10}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#4E5F3B")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(78,95,59,0.3)")}
            />
          </div>

          {/* City */}
          <div>
            <label style={labelStyle}>City / Station</label>
            <input
              type="text"
              placeholder="e.g. Dehradun, Pune, Chennai"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#4E5F3B")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(78,95,59,0.3)")}
            />
          </div>

          {/* Aspirant Type */}
          <div>
            <label style={labelStyle}>Aspirant Entry Type</label>
            <select
              value={form.aspirantType}
              onChange={(e) => set("aspirantType", e.target.value)}
              required
              style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
              onFocus={(e) => (e.target.style.borderColor = "#4E5F3B")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(78,95,59,0.3)")}
            >
              <option value="" style={{ background: "#1a1f16" }}>— Select entry type —</option>
              {ASPIRANT_TYPES.map((t) => (
                <option key={t} value={t} style={{ background: "#1a1f16" }}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ background: "linear-gradient(135deg,#4E5F3B,#3a472c)", color: "#e8eddf", border: "none", borderRadius: 8, padding: "0.9rem", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: "0 0 20px rgba(78,95,59,0.3)", transition: "all 0.2s" }}
          >
            {loading ? "Sending OTP…" : "📲 Send OTP"}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(160,180,130,0.5)", margin: 0 }}>
            Already enlisted?{" "}
            <button type="button" onClick={() => router.push("/login")} style={{ background: "none", border: "none", color: "#4E5F3B", fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", padding: 0 }}>
              Report for Duty →
            </button>
          </p>
        </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <label style={labelStyle}>OTP</label>
              <input
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#4E5F3B")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(78,95,59,0.3)")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ background: "linear-gradient(135deg,#4E5F3B,#3a472c)", color: "#e8eddf", border: "none", borderRadius: 8, padding: "0.9rem", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: "0 0 20px rgba(78,95,59,0.3)", transition: "all 0.2s" }}
            >
              {loading ? "Verifying…" : "✅ Verify & Enter"}
            </button>

            <div style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(160,180,130,0.5)" }}>
              Wrong number?{" "}
              <button
                type="button"
                onClick={() => { setStep("form"); setOtp(""); setError(""); }}
                style={{ background: "none", border: "none", color: "#4E5F3B", fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", padding: 0 }}
              >
                Edit details →
              </button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleSetPassword} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <label style={labelStyle}>Set Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPasswordValue(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#4E5F3B")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(78,95,59,0.3)")}
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#4E5F3B")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(78,95,59,0.3)")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ background: "linear-gradient(135deg,#4E5F3B,#3a472c)", color: "#e8eddf", border: "none", borderRadius: 8, padding: "0.9rem", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: "0 0 20px rgba(78,95,59,0.3)", transition: "all 0.2s" }}
            >
              {loading ? "Saving…" : "🔒 Save Password & Enter"}
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", fontSize: "0.65rem", color: "rgba(78,95,59,0.35)", marginTop: "1.25rem", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>
          SSB MISSION HEADQUARTERS · INDIA
        </p>
      </motion.div>
    </div>
  );
}
