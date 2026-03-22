"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { ArrowRight, CheckCircle2, Trophy, BarChart3, ShieldCheck, Activity } from "lucide-react";

const QUOTES = [
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    title: "Global Leader",
  },
  {
    text: "We did not choose this path — this path chose us.",
    author: "Zorawar Chand",
    title: "Param Vir Chakra",
  },
  {
    text: "Do not be led by others; carve your own path and leave a trail.",
    author: "K.M. Cariappa",
    title: "First Commander-in-Chief",
  },
  {
    text: "The hard days are what make you stronger.",
    author: "Aly Raisman",
    title: "Olympic Champion",
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    title: "Philosopher",
  },
];

const FEATURES = [
  { icon: <CheckCircle2 size={16} />, label: "Daily Task Tracking" },
  { icon: <Trophy size={16} />, label: "Live Leaderboard" },
  { icon: <BarChart3 size={16} />, label: "Progress Analytics" },
  { icon: <ShieldCheck size={16} />, label: "Verified Submissions" },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, enterAsGuest } = useAuth();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [visible, setVisible] = useState(true);

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
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle modern background glow */}
      <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "70vw", height: "60vh", background: "radial-gradient(ellipse at 50% 0%, var(--accent-light) 0%, transparent 65%)", pointerEvents: "none", opacity: 0.5 }} />

      {/* Top nav bar */}
      <nav style={{
        width: "100%", padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--border)", background: "rgba(12, 14, 10, 0.4)", backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{ width: 34, height: 34, background: "var(--accent)", color: "#fff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
            ClubTrack
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => { enterAsGuest(); router.push("/ops"); }}
            className="btn-outline"
            style={{ padding: "0.5rem 1.1rem", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            Browse
          </button>
          <button
            onClick={() => router.push("/login")}
            className="btn-amber"
            style={{ padding: "0.5rem 1.1rem" }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "3.5rem", padding: "4rem 1.5rem 6rem", zIndex: 2, width: "100%", maxWidth: "760px", margin: "0 auto", textAlign: "center",
      }}>

        {/* Hero headline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 999, padding: "0.4rem 1.1rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.7rem", fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.08em", color: "var(--text-sub)", textTransform: "uppercase" }}>
              Performance Tracking Platform
            </span>
          </div>
          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800, color: "var(--text)",
            lineHeight: 1.1, letterSpacing: "-0.04em", margin: 0,
          }}>
            Track your progress.<br />
            <span style={{ color: "var(--accent)" }}>Master your routine.</span>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 540, margin: 0 }}>
            Complete daily tasks, earn points, and climb the leaderboard alongside a dedicated community. Build the habits that lead to success.
          </p>
        </motion.div>

        {/* Quote Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.2, ease: "easeOut" }}
          style={{
            width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: "2.5rem 2.5rem 2rem",
            boxShadow: "var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.04)",
            minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center",
            position: "relative", overflow: "hidden"
          }}
        >
          <div style={{ position: "absolute", top: -15, left: 15, fontFamily: "Georgia, serif", fontSize: "7rem", lineHeight: 1, color: "var(--accent)", opacity: 0.08, userSelect: "none" }}>"</div>

          <AnimatePresence mode="wait">
            {visible && (
              <motion.div
                key={quoteIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem", position: "relative", zIndex: 1 }}
              >
                <p style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--text)", lineHeight: 1.6, margin: 0, fontStyle: "italic", maxWidth: "90%" }}>
                  "{quote.text}"
                </p>
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "var(--accent)", margin: 0 }}>
                    {quote.author}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.2rem 0 0", fontWeight: 500 }}>
                    {quote.title}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dots */}
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "2rem", zIndex: 1 }}>
            {QUOTES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setVisible(false); setTimeout(() => { setQuoteIdx(i); setVisible(true); }, 300); }}
                style={{ width: i === quoteIdx ? 24 : 6, height: 6, borderRadius: 9999, background: i === quoteIdx ? "var(--accent)" : "var(--border-dark)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s ease" }}
                aria-label={`Go to quote ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", justifyContent: "center" }}
        >
          {FEATURES.map((f) => (
            <span key={f.label} style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9999, padding: "0.45rem 1.1rem", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "var(--shadow-sm)" }}>
              <span style={{ color: "var(--accent)", display: "flex" }}>{f.icon}</span> {f.label}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.5 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", marginTop: "1rem" }}
        >
          <button
            onClick={() => router.push("/login")}
            className="btn-amber"
            style={{
              padding: "1rem 2.8rem",
              fontSize: "1.05rem", fontWeight: 600,
              boxShadow: "0 0 30px var(--accent-light), 0 8px 20px rgba(0,0,0,0.2)",
              transform: "translateY(0)",
            }}
          >
            Get Started <ArrowRight size={18} style={{ marginLeft: "0.4rem" }}/>
          </button>
          <button
            onClick={() => { enterAsGuest(); router.push("/ops"); }}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", fontWeight: 500, transition: "color 0.2s", padding: "0.5rem" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Continue as Guest →
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer style={{ width: "100%", padding: "1.5rem 2rem", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
          © {new Date().getFullYear()} ClubTrack
        </span>
      </footer>
    </div>
  );
}
