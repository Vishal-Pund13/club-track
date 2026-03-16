"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";

const QUOTES = [
  {
    text: "If a man says he is not afraid of dying, he is either lying or he is a Gorkha.",
    author: "Field Marshal Sam Manekshaw",
    rank: "Field Marshal · Indian Army",
  },
  {
    text: "Yeh dil maange more!",
    author: "Captain Vikram Batra, PVC",
    rank: "Param Vir Chakra · Kargil War Hero",
  },
  {
    text: "Do not be led by others; carve your own path.",
    author: "Field Marshal K.M. Cariappa",
    rank: "First Commander-in-Chief · Indian Army",
  },
  {
    text: "The safety, honour and welfare of your country comes first, always and every time. The honour, welfare and comfort of the men you command comes next. Your own ease, comfort and safety comes last, always and every time.",
    author: "Field Marshal Sam Manekshaw",
    rank: "Field Marshal · Indian Army",
  },
  {
    text: "Name, rank and service number is not enough. You must be ready to give everything you have.",
    author: "General Bipin Rawat",
    rank: "Chief of Defence Staff · India",
  },
  {
    text: "There is no better friend, no worse enemy than a soldier who knows his duty.",
    author: "General V.P. Malik",
    rank: "Chief of Army Staff · Kargil War",
  },
  {
    text: "A soldier's greatest reward is to see his country safe and his countrymen smiling.",
    author: "Air Marshal Arjan Singh, DFC",
    rank: "Marshal of the Air Force · IAF",
  },
  {
    text: "We did not choose this path — this path chose us. We fight not for glory, but for the nation behind us.",
    author: "Lt Gen. Zorawar Chand Bakshi, PVC",
    rank: "Param Vir Chakra · Indian Army",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, isGuest, enterAsGuest } = useAuth();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);

  // If already authenticated, redirect directly
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
      }, 500);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const quote = QUOTES[quoteIdx];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#0c0e0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Grid overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(78,95,59,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(78,95,59,0.07) 1px,transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "90vw", height: "55vh", background: "radial-gradient(ellipse at 50% 0%,rgba(78,95,59,0.22) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "60vw", height: "30vh", background: "radial-gradient(ellipse at 50% 100%,rgba(58,71,44,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />

      {/* Top bar */}
      <div style={{ width: "100%", padding: "0.55rem 1.5rem", background: "rgba(78,95,59,0.12)", borderBottom: "1px solid rgba(78,95,59,0.25)", textAlign: "center", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
        <span style={{ color: "rgba(78,95,59,0.5)", fontSize: "0.7rem" }}>◈</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.28em", color: "rgba(160,180,130,0.7)", textTransform: "uppercase" }}>
          SSB Operations Command · ClubTrack
        </span>
        <span style={{ color: "rgba(78,95,59,0.5)", fontSize: "0.7rem" }}>◈</span>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2.8rem", padding: "3rem 1.5rem 4rem", zIndex: 2, width: "100%", maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>

        {/* Crest */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}
        >
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "rgba(78,95,59,0.15)", border: "1.5px solid rgba(78,95,59,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.4rem", boxShadow: "0 0 32px rgba(78,95,59,0.35), inset 0 0 20px rgba(78,95,59,0.1)", position: "relative" }}>
            <span style={{ filter: "drop-shadow(0 0 8px rgba(78,95,59,0.8))" }}>⚔️</span>
            <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "1px solid rgba(78,95,59,0.2)" }} />
          </div>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.9rem", fontWeight: 700, color: "#cdd5c5", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              ClubTrack
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.28em", color: "#4E5F3B", textTransform: "uppercase", marginTop: "0.2rem" }}>
              Mission Headquarters
            </div>
          </div>
        </motion.div>

        {/* Quote Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          style={{ width: "100%", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(78,95,59,0.28)", borderRadius: 16, padding: "2.25rem 2rem 1.75rem", backdropFilter: "blur(10px)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}
        >
          {/* Corner accents */}
          {[["top:12px;left:16px", "borderTop,borderLeft"], ["top:12px;right:16px", "borderTop,borderRight"], ["bottom:12px;left:16px", "borderBottom,borderLeft"], ["bottom:12px;right:16px", "borderBottom,borderRight"]].map((_, i) => (
            <div key={i} style={{ position: "absolute", ...(i === 0 ? { top: 12, left: 16, borderTop: "1.5px solid rgba(78,95,59,0.5)", borderLeft: "1.5px solid rgba(78,95,59,0.5)" } : i === 1 ? { top: 12, right: 16, borderTop: "1.5px solid rgba(78,95,59,0.5)", borderRight: "1.5px solid rgba(78,95,59,0.5)" } : i === 2 ? { bottom: 12, left: 16, borderBottom: "1.5px solid rgba(78,95,59,0.5)", borderLeft: "1.5px solid rgba(78,95,59,0.5)" } : { bottom: 12, right: 16, borderBottom: "1.5px solid rgba(78,95,59,0.5)", borderRight: "1.5px solid rgba(78,95,59,0.5)" }), width: 12, height: 12 }} />
          ))}

          <div style={{ fontFamily: "Georgia, serif", fontSize: "5.5rem", lineHeight: 0.5, color: "#4E5F3B", opacity: 0.2, alignSelf: "flex-start", marginBottom: "0.75rem", userSelect: "none" }}>"</div>

          <AnimatePresence mode="wait">
            {visible && (
              <motion.div key={quoteIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                <p style={{ fontSize: "1.02rem", fontWeight: 500, color: "#b8c4af", lineHeight: 1.75, letterSpacing: "0.01em", margin: 0 }}>
                  {quote.text}
                </p>
                <div>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 700, color: "#4E5F3B", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    — {quote.author}
                  </p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "rgba(78,95,59,0.55)", margin: "0.2rem 0 0", letterSpacing: "0.06em" }}>
                    {quote.rank}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "flex", gap: "0.4rem", marginTop: "1.5rem" }}>
            {QUOTES.map((_, i) => (
              <button key={i} onClick={() => { setVisible(false); setTimeout(() => { setQuoteIdx(i); setVisible(true); }, 300); }} style={{ width: i === quoteIdx ? 20 : 6, height: 6, borderRadius: 9999, background: i === quoteIdx ? "#4E5F3B" : "rgba(78,95,59,0.25)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.25s" }} />
            ))}
          </div>
        </motion.div>

        {/* Briefing */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ height: 1, width: 32, background: "rgba(78,95,59,0.4)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.22em", color: "#4E5F3B", textTransform: "uppercase" }}>Mission Briefing</span>
            <div style={{ height: 1, width: 32, background: "rgba(78,95,59,0.4)" }} />
          </div>
          <p style={{ fontSize: "0.88rem", color: "rgba(185,200,170,0.55)", lineHeight: 1.75, maxWidth: 500, margin: 0 }}>
            Aspirant, your preparation starts here. Complete daily missions, earn intel points across squads, and rise through the ranks to secure your commission.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.75 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
          <button
            id="deploy-btn"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => router.push("/login")}
            style={{ background: hovered ? "linear-gradient(135deg,#5d7047,#4E5F3B)" : "linear-gradient(135deg,#4E5F3B,#3a472c)", color: "#e8eddf", border: "none", borderRadius: 10, padding: "1.05rem 2.2rem", fontFamily: "'Inter', sans-serif", fontSize: "1rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.65rem", transition: "all 0.2s", boxShadow: hovered ? "0 0 40px rgba(78,95,59,0.6),0 8px 28px rgba(0,0,0,0.5)" : "0 0 24px rgba(78,95,59,0.3),0 4px 16px rgba(0,0,0,0.4)", transform: hovered ? "translateY(-2px)" : "none" }}
          >
            <span style={{ fontSize: "1.15rem" }}>🎯</span>
            Let's take our tasks down, just like the enemy
            <span style={{ fontSize: "1rem", transition: "transform 0.2s", transform: hovered ? "translateX(4px)" : "none", display: "inline-block" }}>→</span>
          </button>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.57rem", fontWeight: 600, letterSpacing: "0.22em", color: "rgba(78,95,59,0.55)", textTransform: "uppercase" }}>
            Report for Duty · Authenticate & Deploy
          </span>

          {/* Guest link */}
          <button
            onClick={() => { enterAsGuest(); router.push("/ops"); }}
            style={{ background: "none", border: "none", color: "rgba(160,180,130,0.4)", fontSize: "0.78rem", cursor: "pointer", marginTop: "0.25rem", fontFamily: "'Inter', sans-serif", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(160,180,130,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(160,180,130,0.4)")}
          >
            👁 Enter as Civilian Observer (Guest)
          </button>
        </motion.div>

        {/* Badges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.1 }} style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap", justifyContent: "center" }}>
          {["🎖 SSB Ready", "⭐ Mission Tracker", "🏆 Rankings", "🔐 Intel Points"].map((b) => (
            <span key={b} style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(160,180,130,0.45)", background: "rgba(78,95,59,0.08)", border: "1px solid rgba(78,95,59,0.18)", borderRadius: 9999, padding: "0.28rem 0.8rem", letterSpacing: "0.03em" }}>
              {b}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom status bar */}
      <div style={{ width: "100%", padding: "0.5rem 1.5rem", background: "rgba(78,95,59,0.07)", borderTop: "1px solid rgba(78,95,59,0.15)", display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", zIndex: 2 }}>
        {["● SECURE CHANNEL", "● ENCRYPTED", "● BHARAT"].map((s, i) => (
          <span key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.15em", color: i === 0 ? "rgba(80,160,80,0.6)" : "rgba(78,95,59,0.4)", textTransform: "uppercase" }}>{s}</span>
        ))}
      </div>
    </div>
  );
}
