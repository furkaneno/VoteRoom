"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { getRoom, joinRoom } from "@/lib/firebase/rooms";
import { ANIMAL_AVATARS } from "@/types";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  const { user, loading } = useAuth();

  const [nickname, setNickname] = useState("");
  const [joining, setJoining] = useState(false);
  const [roomValid, setRoomValid] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = sessionStorage.getItem("vr_nickname");
    if (saved) setNickname(saved);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    getRoom(roomId).then((room) => setRoomValid(!!room));
  }, [roomId]);

  // If already joined, redirect straight in
  useEffect(() => {
    if (!user || !roomId) return;
    if (sessionStorage.getItem(`vr_joined_${roomId}`)) {
      router.replace(`/room/${roomId}`);
    }
  }, [user, roomId, router]);

  const handleJoin = async () => {
    if (!nickname.trim() || !user || joining) return;
    setJoining(true);
    try {
      const savedAvatar = sessionStorage.getItem("vr_avatar");
      const avatar = savedAvatar
        ? JSON.parse(savedAvatar)
        : ANIMAL_AVATARS[Math.floor(Math.random() * ANIMAL_AVATARS.length)];
      sessionStorage.setItem("vr_nickname", nickname.trim());
      sessionStorage.setItem("vr_avatar", JSON.stringify(avatar));
      sessionStorage.setItem(`vr_joined_${roomId}`, "true");
      await joinRoom(roomId, user.uid, nickname.trim(), avatar, false);
      router.push(`/room/${roomId}`);
    } catch {
      setJoining(false);
    }
  };

  if (!mounted || loading) return null;

  if (roomValid === false) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="font-display text-2xl font-[700] mb-2" style={{ color: "var(--text-primary)" }}>Room not found</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>This room may have expired or the link is invalid.</p>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 rounded-xl text-sm font-[500] transition-colors"
            style={{ background: "var(--brand-soft)", color: "var(--brand)", border: "1px solid var(--brand-border)" }}
          >
            Create a new room
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-bg grid-overlay min-h-screen flex items-center justify-center">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="inline-block text-4xl mb-3">🗳️</motion.span>
          <h1 className="font-display text-3xl font-[700]" style={{ color: "var(--text-primary)" }}>
            Join <span style={{ color: "var(--brand)" }}>VoteRoom</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            Room <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>{roomId}</span>
          </p>
        </div>

        <div className="card rounded-2xl p-7">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-[600] uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                Your nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                placeholder="Enter your name..."
                maxLength={24}
                autoFocus
                className="themed-input w-full px-4 py-3.5 rounded-xl text-sm"
              />
            </div>

            <motion.button
              onClick={handleJoin}
              disabled={!nickname.trim() || joining || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="neon-btn w-full py-3.5 rounded-xl font-display font-[600] text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <AnimatePresence mode="wait">
                {joining ? (
                  <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Joining...
                  </motion.span>
                ) : (
                  <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2">
                    Join Room →
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
