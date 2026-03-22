"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";

const QUOTES = [
  {
    text: "If a man says he is not afraid of dying, he is either lying or he is a Gorkha.",
    author: "Field Marshal Sam Manekshaw",
    title: "Field Marshal, Indian Army",
  },
  {
    text: "Yeh dil maange more!",
    author: "Captain Vikram Batra, PVC",
    title: "Param Vir Chakra · Kargil War",
  },
  {
    text: "Do not be led by others; carve your own path.",
    author: "Field Marshal K.M. Cariappa",
    title: "First Commander-in-Chief, Indian Army",
  },
  {
    text: "The safety, honour and welfare of your country comes first, always and every time.",
    author: "Field Marshal Sam Manekshaw",
    title: "Field Marshal, Indian Army",
  },
  {
    text: "A soldier's greatest reward is to see his country safe and his countrymen smiling.",
    author: "Air Marshal Arjan Singh, DFC",
    title: "Marshal of the Air Force, IAF",
  },
  {
    text: "We did not choose this path — this path chose us.",
    author: "Lt Gen. Zorawar Chand Bakshi, PVC",
    title: "Param Vir Chakra, Indian Army",
  },
];

const FEATURES = [
  { icon: "✅", label: "Daily Task Tracking" },
  { icon: "🏆", label: "Live Leaderboard" },
  { icon: "📊", label: "Progress Analytics" },
  { icon: "🛡", label: "Verified Completions" },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, enterAsGuest } = useAuth();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (user) {
      router.push(user.role === "admin" ? "/admin" : "/ops");
    }
  }, [user, router]);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setQuoteIdx((p) => (p + 1) % QUOTES.length);
        setVisible(true);
      }, 450);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const quote = QUOTES[quoteIdx];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(160deg, #0c0e0a 0%, #101410 50%, #0e100c 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Subtle background glow */}
      <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "70vw", height: "60vh", background: "radial-gradient(ellipse at 50% 0%, rgba(78,95,59,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, right: "10%", width: "40vw", height: "40vh", background: "radial-gradient(ellipse at 80% 100%, rgba(58,71,44,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Top nav bar */}
      <nav style={{
        width: "100%", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(78,95,59,0.12)", background: "rgba(12,14,10,0.6)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#5d7047,#4E5F3B)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
            ⚔️
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "1rem", color: "#cdd5c5", letterSpacing: "-0.02em" }}>
            ClubTrack
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button
            onClick={() => { enterAsGuest(); router.push("/ops"); }}
            style={{ background: "transparent", border: "1px solid rgba(78,95,59,0.3)", borderRadius: 8, padding: "0.45rem 1rem", color: "rgba(160,180,130,0.7)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(78,95,59,0.6)"; e.currentTarget.style.color = "rgba(160,180,130,1)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(78,95,59,0.3)"; e.currentTarget.style.color = "rgba(160,180,130,0.7)"; }}
          >
            Browse
          </button>
          <button
            onClick={() => router.push("/login")}
            style={{ background: "#4E5F3B", border: "none", borderRadius: 8, padding: "0.45rem 1.1rem", color: "#e8eddf", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#5d7047"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#4E5F3B"; }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "3rem", padding: "4rem 1.5rem 5rem", zIndex: 2, width: "100%", maxWidth: "720px", margin: "0 auto", textAlign: "center",
      }}>

        {/* Hero headline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(78,95,59,0.1)", border: "1px solid rgba(78,95,59,0.25)", borderRadius: 999, padding: "0.3rem 1rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.65rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: "0.18em", color: "#4E5F3B", textTransform: "uppercase" }}>
              SSB Aspirant Platform
            </span>
          </div>
          <h1 style={{
            fontSize: "clamp(2.2rem, 6vw, 3.5rem)", fontWeight: 800, color: "#cdd5c5",
            lineHeight: 1.15, letterSpacing: "-0.03em", margin: 0,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            Track your preparation,<br />
            <span style={{ color: "#4E5F3B" }}>earn your commission.</span>
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(185,200,170,0.6)", lineHeight: 1.75, maxWidth: 500, margin: 0 }}>
            Complete daily tasks across your squads, earn points, and track your progress alongside fellow aspirants — all in one place.
          </p>
        </motion.div>

        {/* Quote Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          style={{
            width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(78,95,59,0.22)",
            borderRadius: 18, padding: "2rem 2.25rem 1.75rem", backdropFilter: "blur(16px)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
            minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center",
          }}
        >
          <div style={{ fontFamily: "Georgia, serif", fontSize: "4rem", lineHeight: 0.6, color: "#4E5F3B", opacity: 0.25, alignSelf: "flex-start", userSelect: "none", marginBottom: "0.5rem" }}>"</div>

          <AnimatePresence mode="wait">
            {visible && (
              <motion.div
                key={quoteIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.38 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}
              >
                <p style={{ fontSize: "1rem", fontWeight: 500, color: "#b8c4af", lineHeight: 1.8, letterSpacing: "0.01em", margin: 0, fontStyle: "italic" }}>
                  {quote.text}
                </p>
                <div>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.73rem", fontWeight: 700, color: "#4E5F3B", margin: 0, letterSpacing: "0.04em" }}>
                    — {quote.author}
                  </p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", color: "rgba(78,95,59,0.55)", margin: "0.2rem 0 0", letterSpacing: "0.04em" }}>
                    {quote.title}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dots */}
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "1.5rem" }}>
            {QUOTES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setVisible(false); setTimeout(() => { setQuoteIdx(i); setVisible(true); }, 300); }}
                style={{ width: i === quoteIdx ? 20 : 6, height: 6, borderRadius: 9999, background: i === quoteIdx ? "#4E5F3B" : "rgba(78,95,59,0.22)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.25s" }}
              />
            ))}
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center" }}
        >
          {FEATURES.map((f) => (
            <span key={f.label} style={{ fontSize: "0.78rem", fontWeight: 500, color: "rgba(160,180,130,0.6)", background: "rgba(78,95,59,0.08)", border: "1px solid rgba(78,95,59,0.18)", borderRadius: 9999, padding: "0.3rem 0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {f.icon} {f.label}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.55 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}
        >
          <button
            id="get-started-btn"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => router.push("/login")}
            style={{
              background: hovered ? "linear-gradient(135deg,#5d7047,#4E5F3B)" : "linear-gradient(135deg,#4E5F3B,#3a472c)",
              color: "#e8eddf", border: "none", borderRadius: 12, padding: "1rem 2.4rem",
              fontFamily: "'Inter', sans-serif", fontSize: "1rem", fontWeight: 700, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: "0.6rem", transition: "all 0.2s",
              boxShadow: hovered ? "0 0 40px rgba(78,95,59,0.5), 0 8px 28px rgba(0,0,0,0.4)" : "0 0 20px rgba(78,95,59,0.2), 0 4px 16px rgba(0,0,0,0.35)",
              transform: hovered ? "translateY(-2px)" : "none",
            }}
          >
            Get Started
            <span style={{ fontSize: "0.95rem", transition: "transform 0.2s", transform: hovered ? "translateX(4px)" : "none", display: "inline-block" }}>→</span>
          </button>
          <button
            onClick={() => { enterAsGuest(); router.push("/ops"); }}
            style={{ background: "none", border: "none", color: "rgba(160,180,130,0.4)", fontSize: "0.8rem", cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "color 0.2s", padding: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(160,180,130,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(160,180,130,0.4)")}
          >
            Continue as Guest →
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer style={{ width: "100%", padding: "0.75rem 2rem", borderTop: "1px solid rgba(78,95,59,0.12)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", color: "rgba(78,95,59,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          ClubTrack · SSB Aspirant Tracker · India
        </span>
      </footer>
    </div>
  );
}
