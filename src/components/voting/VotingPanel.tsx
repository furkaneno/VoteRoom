"use client";

import { motion, AnimatePresence } from "framer-motion";
import { VotingScale, Vote } from "@/types";
import { getVoteTier, getVoteColors } from "@/lib/voteColors";

interface VotingPanelProps {
  scale: VotingScale;
  myVote: Vote | undefined;
  onVote: (value: string | number) => void;
  isRevealed: boolean;
}

export default function VotingPanel({ scale, myVote, onVote, isRevealed }: VotingPanelProps) {
  const selectedValue = myVote?.value ?? null;

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-base font-[600]" style={{ color: "var(--text-primary)" }}>
            Cast Your Vote
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {isRevealed
              ? "Voting is closed — waiting for next round"
              : selectedValue != null
              ? `You voted ${selectedValue} — tap again to change`
              : "Pick a card to submit your estimate"}
          </p>
        </div>

        <AnimatePresence>
          {selectedValue != null && !isRevealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.5 }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#22c55e" }}
              />
              <span className="text-xs font-[500]" style={{ color: "#22c55e" }}>Voted!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cards grid */}
      <div className="flex flex-wrap gap-3 justify-center">
        {scale.values.map((value, i) => {
          const isSelected = selectedValue === value;
          const isSpecial = typeof value === "string" && (value === "?" || value === "☕");
          const tier = isSpecial ? "special" : getVoteTier(value);
          const colors = getVoteColors(tier);

          // For unselected cards use a muted version; for selected use the tier colour
          const cardBg = isSelected ? colors.bg : "var(--bg-card2)";
          const cardBorder = isSelected ? colors.border : "var(--border)";
          const cardColor = isSelected ? colors.color : "var(--text-secondary)";
          const cardGlow = isSelected ? "0 4px 12px rgba(0,0,0,0.2)" : "var(--shadow-card)";
          const hoverGlow = `0 0 16px ${colors.glow}, 0 6px 20px rgba(0,0,0,0.12)`;

          return (
            <motion.button
              key={String(value)}
              onClick={() => !isRevealed && onVote(value)}
              disabled={isRevealed}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.035, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              whileHover={!isRevealed ? { scale: 1.05 } : {}}
              whileTap={!isRevealed ? { scale: 0.94 } : {}}
              className="relative group select-none disabled:cursor-default"
              style={{ cursor: isRevealed ? "not-allowed" : "pointer" }}
            >
              <div
                className="relative w-[52px] h-[76px] rounded-full flex flex-col items-center justify-center font-display font-[700] transition-150 ease-out"                 style={{
                  background: cardBg,
                  border: `2px solid ${cardBorder}`,
                  color: cardColor,
                  boxShadow: cardGlow,
                }}
              >
                {/* Top pip */}
                {!isSpecial && (
                  <span className="absolute top-1.5 left-2 font-mono opacity-40" style={{ fontSize: "9px" }}>{value}</span>
                )}

                {/* Center value */}
                <span className={isSpecial ? "text-2xl" : "text-xl"}>{value}</span>

                {/* Bottom pip */}
                {!isSpecial && (
                  <span className="absolute bottom-1.5 right-2 font-mono opacity-40 rotate-180" style={{ fontSize: "9px" }}>{value}</span>
                )}

                {/* Hover shimmer overlay */}
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ background: "linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.06) 50%, transparent 80%)" }}
                />
              </div>

              {/* Selected checkmark badge */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: colors.color,
                      boxShadow: `0 0 12px ${colors.glow}`,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Scale legend */}
      {scale.type !== "tshirt" && (
        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
          {[
            { label: "Low", color: "var(--vote-low)", range: "1–3" },
            { label: "Medium", color: "var(--vote-mid)", range: "4–6" },
            { label: "Good", color: "var(--vote-good)", range: "7–8" },
            { label: "High", color: "var(--vote-high)", range: "9–10" },
          ].map((tier) => (
            <div key={tier.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: tier.color }} />
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {tier.label} ({tier.range})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
