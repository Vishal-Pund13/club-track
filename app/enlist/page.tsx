"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, AspirantType } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

const ASPIRANT_TYPES: AspirantType[] = [
  "NDA", "CDS", "TGC", "SSC Tech", "ACC", "UES", "NCC Special Entry", "Other",
];

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
  boxSizing: "border-box" as const,
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "rgba(185,200,170,0.65)",
  marginBottom: "0.45rem",
  display: "block",
};

export default function EnlistPage() {
  const router = useRouter();
  const { sendOtp, verifyOtp, setPassword } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    city: "",
    aspirantType: "" as AspirantType | "",
  });
  const [otp, setOtp] = useState("");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"form" | "otp" | "password">("form");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.email.includes("@")) return setError("Enter a valid email address.");
    if (form.mobile && (form.mobile.length !== 10 || !/^\d+$/.test(form.mobile))) {
      return setError("Mobile number must be exactly 10 digits.");
    }
    if (!form.aspirantType) return setError("Select your aspirant entry type.");

    setLoading(true);
    try {
      const result = await sendOtp(form.email, {
        name: form.name,
        mobile: form.mobile,
        city: form.city,
        aspirantType: form.aspirantType as AspirantType,
        role: "aspirant",
      });
      if (!result.ok) return setError(result.error || "Failed to send OTP. Try again.");
      setSuccess(`An 8-digit code has been sent to ${form.email}`);
      setStep("otp");
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp(form.email, otp, {
        name: form.name,
        mobile: form.mobile,
        city: form.city,
        aspirantType: form.aspirantType as AspirantType,
      });
      if (!result.ok) return setError(result.error || "Verification failed. Try again.");
      setStep("password");
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const r = await setPassword(password);
      if (!r.ok) return setError(r.error || "Failed to set password.");
      router.push("/ops");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = {
    form: { title: "Create account", sub: "Fill in your details to get started" },
    otp: { title: "Verify your email", sub: success || `Enter the code sent to ${form.email}` },
    password: { title: "Set a password", sub: "You'll use this to sign in later" },
  };

  const current = stepTitles[step];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0c0e0a 0%, #101410 50%, #0e100c 100%)",
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
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "80vw", height: "40vh", background: "radial-gradient(ellipse at 50% 0%, rgba(78,95,59,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Steps indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.75rem", zIndex: 2 }}>
        {(["form", "otp", "password"] as const).map((s, i) => (
          <React.Fragment key={s}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: step === s ? "#4E5F3B" : ["form", "otp", "password"].indexOf(step) > i ? "rgba(78,95,59,0.4)" : "rgba(78,95,59,0.12)",
              border: step === s ? "none" : "1px solid rgba(78,95,59,0.25)",
              fontSize: "0.72rem", fontWeight: 700, color: step === s ? "#fff" : "rgba(78,95,59,0.6)",
              transition: "all 0.3s",
            }}>
              {["form", "otp", "password"].indexOf(step) > i ? "✓" : i + 1}
            </div>
            {i < 2 && <div style={{ width: 32, height: 1, background: ["form", "otp", "password"].indexOf(step) > i ? "rgba(78,95,59,0.5)" : "rgba(78,95,59,0.2)" }} />}
          </React.Fragment>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          width: "100%", maxWidth: 460,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(78,95,59,0.22)",
          borderRadius: 20,
          padding: "2.5rem 2.25rem",
          boxShadow: "0 12px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
          position: "relative", zIndex: 2,
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Back button */}
        <button
          onClick={() => step === "form" ? router.push("/login") : step === "otp" ? setStep("form") : setStep("otp")}
          style={{ background: "none", border: "none", color: "rgba(78,95,59,0.6)", fontSize: "0.78rem", cursor: "pointer", padding: 0, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.3rem", transition: "color 0.2s", fontFamily: "'Inter', sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.color = "#4E5F3B"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(78,95,59,0.6)"}
        >
          ← {step === "form" ? "Back to Sign In" : "Back"}
        </button>

        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#cdd5c5", margin: 0, letterSpacing: "-0.02em" }}>
            {current.title}
          </h1>
          <p style={{ fontSize: "0.83rem", color: "rgba(160,180,130,0.5)", marginTop: "0.35rem" }}>
            {current.sub}
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.28)", borderRadius: 8, padding: "0.65rem 1rem", marginBottom: "1rem", fontSize: "0.82rem", color: "#f87171", overflow: "hidden" }}
            >
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 1: Details form */}
        {step === "form" && (
          <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" placeholder="e.g. Rajesh Kumar Singh" value={form.name}
                onChange={e => set("name", e.target.value)} required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(78,95,59,0.7)")}
                onBlur={e => (e.target.style.borderColor = "rgba(78,95,59,0.25)")} />
            </div>

            <div>
              <label style={labelStyle}>Email Address <span style={{ color: "#4E5F3B", fontSize: "0.7rem" }}>(for verification)</span></label>
              <input type="email" placeholder="your@email.com" value={form.email}
                onChange={e => set("email", e.target.value)} required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(78,95,59,0.7)")}
                onBlur={e => (e.target.style.borderColor = "rgba(78,95,59,0.25)")} />
            </div>

            <div>
              <label style={labelStyle}>Mobile Number <span style={{ color: "rgba(78,95,59,0.45)", fontSize: "0.7rem" }}>(optional)</span></label>
              <input type="tel" placeholder="10-digit mobile number" value={form.mobile}
                onChange={e => set("mobile", e.target.value)} maxLength={10} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(78,95,59,0.7)")}
                onBlur={e => (e.target.style.borderColor = "rgba(78,95,59,0.25)")} />
            </div>

            <div>
              <label style={labelStyle}>City</label>
              <input type="text" placeholder="e.g. Dehradun, Pune, Chennai" value={form.city}
                onChange={e => set("city", e.target.value)} required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(78,95,59,0.7)")}
                onBlur={e => (e.target.style.borderColor = "rgba(78,95,59,0.25)")} />
            </div>

            <div>
              <label style={labelStyle}>Aspirant Entry Type</label>
              <select value={form.aspirantType} onChange={e => set("aspirantType", e.target.value)} required
                style={{ ...inputStyle, appearance: "none" as const, cursor: "pointer", background: "rgba(255,255,255,0.04)" }}
                onFocus={e => (e.target.style.borderColor = "rgba(78,95,59,0.7)")}
                onBlur={e => (e.target.style.borderColor = "rgba(78,95,59,0.25)")}
              >
                <option value="" style={{ background: "#1a1f16" }}>— Select entry type —</option>
                {ASPIRANT_TYPES.map(t => <option key={t} value={t} style={{ background: "#1a1f16" }}>{t}</option>)}
              </select>
            </div>

            <button type="submit" disabled={loading}
              style={{ background: loading ? "rgba(78,95,59,0.5)" : "#4E5F3B", color: "#e8eddf", border: "none", borderRadius: 10, padding: "0.9rem", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", marginTop: "0.25rem" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#5d7047"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#4E5F3B"; }}
            >
              {loading ? "Sending code…" : "Send Verification Code →"}
            </button>

            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(160,180,130,0.45)", margin: 0 }}>
              Already have an account?{" "}
              <button type="button" onClick={() => router.push("/login")}
                style={{ background: "none", border: "none", color: "#4E5F3B", fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", padding: 0 }}>
                Sign In →
              </button>
            </p>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ background: "rgba(78,95,59,0.08)", border: "1px solid rgba(78,95,59,0.2)", borderRadius: 10, padding: "1rem", fontSize: "0.82rem", color: "rgba(185,200,170,0.7)", lineHeight: 1.6 }}>
              📧 Check your inbox at <strong style={{ color: "#cdd5c5" }}>{form.email}</strong>. Enter the 8-digit code below.
            </div>

            <div>
              <label style={labelStyle}>Verification Code</label>
              <input
                inputMode="numeric" pattern="\d{8}" maxLength={8}
                placeholder="00000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                required style={{ ...inputStyle, letterSpacing: "0.5rem", fontSize: "1.5rem", textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}
                onFocus={e => (e.target.style.borderColor = "rgba(78,95,59,0.7)")}
                onBlur={e => (e.target.style.borderColor = "rgba(78,95,59,0.25)")}
              />
            </div>

            <button type="submit" disabled={loading || otp.length < 8}
              style={{ background: loading || otp.length < 8 ? "rgba(78,95,59,0.4)" : "#4E5F3B", color: "#e8eddf", border: "none", borderRadius: 10, padding: "0.9rem", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", fontWeight: 700, cursor: loading || otp.length < 8 ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
              {loading ? "Verifying…" : "Verify & Continue →"}
            </button>

            <button type="button" onClick={async () => { setError(""); setOtp(""); await handleSendOtp({ preventDefault: () => {} } as React.FormEvent); }}
              style={{ background: "none", border: "none", color: "rgba(78,95,59,0.6)", fontSize: "0.80rem", cursor: "pointer", fontFamily: "'Inter', sans-serif", textAlign: "center" }}>
              Didn't receive it? Resend code
            </button>
          </form>
        )}

        {/* STEP 3: Password */}
        {step === "password" && (
          <form onSubmit={handleSetPassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Create Password</label>
              <input type="password" placeholder="Min 6 characters" value={password}
                onChange={e => setPasswordValue(e.target.value)} required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(78,95,59,0.7)")}
                onBlur={e => (e.target.style.borderColor = "rgba(78,95,59,0.25)")} />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" placeholder="Re-enter password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(78,95,59,0.7)")}
                onBlur={e => (e.target.style.borderColor = "rgba(78,95,59,0.25)")} />
            </div>

            <button type="submit" disabled={loading}
              style={{ background: loading ? "rgba(78,95,59,0.5)" : "#4E5F3B", color: "#e8eddf", border: "none", borderRadius: 10, padding: "0.9rem", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", marginTop: "0.25rem" }}>
              {loading ? "Setting up…" : "Finish & Enter →"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

