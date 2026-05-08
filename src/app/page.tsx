"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { createRoom, joinRoom, generateRoomId } from "@/lib/firebase/rooms";
import { ANIMAL_AVATARS } from "@/types";
import ThemeToggle from "@/components/ui/ThemeToggle";

const FLOATING_EMOJIS = ["🦊", "🐼", "🐱", "🦉", "🐸", "🦁", "🐯", "🐺", "🦝", "🐻"];

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [nickname, setNickname] = useState("");
  const [creating, setCreating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = sessionStorage.getItem("vr_nickname");
    if (saved) setNickname(saved);
  }, []);

  const handleCreate = async () => {
    if (!nickname.trim() || !user || creating) return;
    setCreating(true);
    try {
      const roomId = generateRoomId();
      const avatar = ANIMAL_AVATARS[Math.floor(Math.random() * ANIMAL_AVATARS.length)];
      sessionStorage.setItem("vr_nickname", nickname.trim());
      sessionStorage.setItem("vr_avatar", JSON.stringify(avatar));
      await createRoom(roomId, user.uid, nickname.trim());
      await joinRoom(roomId, user.uid, nickname.trim(), avatar, true);
      router.push(`/room/${roomId}`);
    } catch {
      setCreating(false);
    }
  };

  if (!mounted) return null;
  const isDark = theme === "dark";

  return (
    <div className={`page-bg grid-overlay relative min-h-screen flex items-center justify-center overflow-hidden`}>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Floating animals */}
      {FLOATING_EMOJIS.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl select-none pointer-events-none"
          style={{
            left: `${(i * 17 + 5) % 90}%`,
            top: `${(i * 23 + 8) % 85}%`,
            opacity: isDark ? 0.15 : 0.25,
          }}
          animate={{ y: [0, -14, 0], rotate: [-4, 4, -4], opacity: isDark ? [0.1, 0.18, 0.1] : [0.2, 0.3, 0.2] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-3 mb-3">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-4xl"
            >🗳️</motion.span>
            <h1 className="font-display text-4xl font-[800] tracking-tight" style={{ color: "var(--text-primary)" }}>
              Vote<span style={{ color: "var(--brand)" }}>Room</span>
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)" }} className="text-sm">
            Real-time planning poker for agile teams
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card rounded-2xl p-8"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-[600] uppercase tracking-[0.12em] mb-2" style={{ color: "var(--text-muted)" }}>
                Your nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Enter your name..."
                maxLength={24}
                autoFocus
                className="themed-input w-full px-4 py-3.5 rounded-xl text-sm transition-all"
              />
            </div>

            <motion.button
              onClick={handleCreate}
              disabled={!nickname.trim() || creating || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="neon-btn w-full py-3.5 px-6 rounded-xl font-display font-[600] text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
            >
              <AnimatePresence mode="wait">
                {creating ? (
                  <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Creating room...
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2">
                    Create Room <span>→</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Feature pills */}
          <div className="mt-7 pt-6 grid grid-cols-3 gap-3" style={{ borderTop: "1px solid var(--border)" }}>
            {[
              { icon: "⚡", label: "Real-time" },
              { icon: "🔒", label: "Private" },
              { icon: "🎯", label: "Precise" },
            ].map((f) => (
              <div key={f.label} className="text-center">
                <div className="text-lg mb-1">{f.icon}</div>
                <div className="text-[10px] uppercase tracking-wider font-[500]" style={{ color: "var(--text-muted)" }}>{f.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[11px] mt-5"
          style={{ color: "var(--text-muted)" }}
        >
          Developed by @FurkanUzunabdullah
        </motion.p>
      </motion.div>
    </div>
  );
}
