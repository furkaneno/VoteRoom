"use client";

import { motion } from "framer-motion";
import { Room, Participant } from "@/types";
import { formatTime } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";
import toast from "react-hot-toast";

interface RoomHeaderProps {
  room: Room;
  roomId: string;
  participants: Participant[];
  isHost: boolean;
  myParticipant: Participant | undefined;
  voteCount: number;
  elapsedSeconds: number;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onAddTime: (s: number) => void;
}

export default function RoomHeader({
  room, roomId, participants, isHost, myParticipant,
  voteCount, elapsedSeconds,
  onStartTimer, onPauseTimer, onResetTimer, onAddTime,
}: RoomHeaderProps) {
  const isRunning = room.timer.isRunning;
  const onlineCount = participants.filter((p) => p.isOnline).length;

  const copyLink = () => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied! 🔗"));
  };

  return (
    <header
      className="relative z-30 border-b"
      style={{
        background: "var(--header-bg)",
        borderColor: "var(--header-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center gap-3">

        {/* ── Logo ── */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl">🗳️</span>
          <span className="font-display font-[700] text-lg hidden sm:block" style={{ color: "var(--text-primary)" }}>
            Vote<span style={{ color: "var(--brand)" }}>Room</span>
          </span>
        </div>

        <div className="w-px h-5 shrink-0" style={{ background: "var(--border-strong)" }} />

        {/* ── Room ID + badges ── */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="font-mono text-xs px-2 py-0.5 rounded-md"
            style={{ background: "var(--brand-soft)", color: "var(--brand)", border: "1px solid var(--brand-border)" }}
          >
            {roomId}
          </span>
          {isHost && (
            <span className="text-[10px] px-2 py-0.5 rounded-md font-[600]"
              style={{ background: "rgba(234,179,8,0.12)", color: "#ca8a04", border: "1px solid rgba(234,179,8,0.25)" }}>
              HOST
            </span>
          )}
        </div>

        {/* ── spacer ── */}
        <div className="flex-1" />

        {/* ── Timer display ── */}
        <div className="flex items-center gap-2">
          <motion.span
            animate={isRunning ? { opacity: [1, 0.55, 1] } : {}}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="font-mono text-base tabular-nums font-[500]"
            style={{ color: isRunning ? "var(--brand)" : "var(--text-muted)" }}
          >
            {formatTime(elapsedSeconds)}
          </motion.span>

          {/* Timer controls — host only */}
          {isHost && (
            <div className="flex items-center gap-1">
              <TBtn onClick={isRunning ? onPauseTimer : onStartTimer} title={isRunning ? "Pause" : "Start"}>
                {isRunning ? "⏸" : "▶"}
              </TBtn>
              <TBtn onClick={onResetTimer} title="Reset">⏹</TBtn>
              <TBtn onClick={() => onAddTime(10)} small>+10s</TBtn>
              <TBtn onClick={() => onAddTime(20)} small>+20s</TBtn>
              <TBtn onClick={() => onAddTime(30)} small>+30s</TBtn>
            </div>
          )}
        </div>

        <div className="w-px h-5 shrink-0" style={{ background: "var(--border)" }} />

        {/* ── Vote count ── */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
          style={{ background: "var(--bg-card2)", border: "1px solid var(--border)" }}>
          <span style={{ color: "var(--text-muted)" }}>Votes</span>
          <span className="font-[600]" style={{ color: "var(--brand)" }}>{voteCount}/{participants.length}</span>
        </div>

        {/* ── Round ── */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs"
          style={{ background: "var(--bg-card2)", border: "1px solid var(--border)" }}>
          <span style={{ color: "var(--text-muted)" }}>Round</span>
          <span className="font-[600]" style={{ color: "var(--text-primary)" }}>#{room.round}</span>
        </div>

        {/* ── Online indicator ── */}
        <div className="hidden md:flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="ping-ring absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "#22c55e" }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#22c55e" }} />
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{onlineCount}</span>
        </div>

        {/* ── Copy link ── */}
        <motion.button
          onClick={copyLink}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-[500] transition-colors"
          style={{
            background: "var(--brand-soft)",
            color: "var(--brand)",
            border: "1px solid var(--brand-border)",
          }}
        >
          <span>🔗</span>
          <span className="hidden sm:block">Copy Link</span>
        </motion.button>

        {/* ── Theme toggle ── */}
        <ThemeToggle />

        {/* ── My avatar ── */}
        {myParticipant && (
          <div
            title={myParticipant.nickname}
            className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
            style={{ background: `${myParticipant.avatar.color}20`, border: "2px solid var(--border-strong)" }}
          >
            {myParticipant.avatar.emoji}
          </div>
        )}
      </div>
    </header>
  );
}

function TBtn({ children, onClick, title, small }: {
  children: React.ReactNode; onClick: () => void; title?: string; small?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={title}
      className="rounded-md transition-colors"
      style={{
        background: "var(--bg-card2)",
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
        ...(small
          ? { padding: "2px 6px", fontSize: "10px", fontFamily: "JetBrains Mono, monospace", fontWeight: 500 }
          : { width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }),
      }}
    >
      {children}
    </motion.button>
  );
}
