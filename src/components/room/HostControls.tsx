"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Room, VotingType, VOTING_SCALES } from "@/types";

interface HostControlsProps {
  room: Room;
  voteCount: number;
  totalParticipants: number;
  onReveal: () => void;
  onReset: () => void;
  onSetVotingType: (type: VotingType) => void;
}

export default function HostControls({
  room, voteCount, totalParticipants, onReveal, onReset, onSetVotingType,
}: HostControlsProps) {
  const [showScales, setShowScales] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const allVoted = voteCount === totalParticipants && totalParticipants > 0;
  const remaining = totalParticipants - voteCount;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowScales(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl px-4 py-3"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex flex-wrap items-center gap-3">

        {/* ── Status indicator ── */}
        <div className="flex items-center gap-2 mr-auto min-w-0">
          <motion.div
            animate={allVoted ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: room.isRevealed ? "#22c55e" : allVoted ? "#f59e0b" : "var(--text-muted)" }}
          />
          <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
            {room.isRevealed
              ? "✓ Results revealed — start a new round when ready"
              : allVoted
              ? `🎉 All ${totalParticipants} voted — ready to reveal!`
              : `Waiting for ${remaining} more vote${remaining !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* ── Scale picker ── */}
        <div className="relative" ref={dropdownRef} style={{ zIndex: 50 }}>
          <motion.button
            onClick={() => setShowScales((v) => !v)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-[500] transition-all"
            style={{
              background: "var(--bg-card2)",
              border: `1px solid ${showScales ? "var(--brand-border)" : "var(--border)"}`,
              color: showScales ? "var(--brand)" : "var(--text-secondary)",
            }}
          >
            <span>📊</span>
            <span className="hidden sm:block">{VOTING_SCALES[room.votingType].label}</span>
            <motion.span animate={{ rotate: showScales ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ opacity: 0.5 }}>
              ▾
            </motion.span>
          </motion.button>

          {/* Dropdown — rendered in a portal-like fixed position to avoid clipping */}
          <AnimatePresence>
            {showScales && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute top-full mt-2 left-0 w-56 rounded-xl overflow-hidden"
                style={{
                  zIndex: 9999,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-strong)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.12)",
                }}
              >
                <div className="grid grid-cols-2 gap-1 p-2">
                  {(Object.entries(VOTING_SCALES) as [VotingType, typeof VOTING_SCALES[VotingType]][]).map(([key, scale]) => {
                    const isActive = room.votingType === key;
                    return (
                      <button
                        key={key}
                        onClick={() => { onSetVotingType(key); setShowScales(false); }}
                        className="flex items-center justify-center h-10 text-xs rounded-xl transition-all"
                        style={{
  				background: isActive ? "var(--brand-soft)" : "var(--bg-card2)",
  				color: isActive ? "var(--brand)" : "var(--text-secondary)",
  				border: "1px solid var(--border)",
			    }}
                        onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--bg-card2)"; }}
                        onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <span className="font-[600] capitalize">{key.replace("-", " ")}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── New Round ── */}
        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="hidden"
          style={{
            background: "var(--bg-card2)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <span>🔄</span>
          <span>New Round</span>
        </motion.button>

        {/* ── Reveal Results ── */}
        {!room.isRevealed && (
          <motion.button
            onClick={onReveal}
            disabled={voteCount === 0}
            whileHover={voteCount > 0 ? { scale: 1.03 } : {}}
            whileTap={voteCount > 0 ? { scale: 0.97 } : {}}
            animate={allVoted ? { boxShadow: ["0 0 16px rgba(99,102,241,0.3)", "0 0 32px rgba(99,102,241,0.6)", "0 0 16px rgba(99,102,241,0.3)"] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-[600] font-display text-white disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: allVoted ? "0 0 24px rgba(99,102,241,0.5)" : "0 0 12px rgba(99,102,241,0.2)",
            }}
          >
            <span>👁</span>
            <span>Reveal Results</span>
          </motion.button>
        )}

        {/* ── Post-reveal: "New Round" CTA ── */}
        {room.isRevealed && (
          <motion.button
            onClick={onReset}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-[600] font-display text-white"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 0 16px rgba(16,185,129,0.35)",
            }}
          >
            <span>▶</span>
            <span>Start New Round</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
