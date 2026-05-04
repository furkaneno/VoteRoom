"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Participant, Vote } from "@/types";
import { getVoteTier, getVoteColors } from "@/lib/voteColors";

interface ParticipantGridProps {
  participants: Participant[];
  votes: Vote[];
  isRevealed: boolean;
  currentUserId: string | undefined;
  round: number;
}

export default function ParticipantGrid({
  participants, votes, isRevealed, currentUserId, round,
}: ParticipantGridProps) {
  const getVote = (userId: string) =>
    votes.find((v) => v.userId === userId && v.round === round);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xs font-[600] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
          Participants
        </h2>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{participants.length} in room</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        <AnimatePresence>
          {participants.map((participant, i) => {
            const vote = getVote(participant.id);
            const hasVoted = !!(vote?.value != null && vote.value !== null && vote.round === round);
            const isMe = participant.id === currentUserId;
            const tier = isRevealed ? getVoteTier(vote?.value ?? null) : "special";
            const colors = getVoteColors(tier);

            return (
              <motion.div
                key={participant.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.75, y: -8 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-2xl p-4 text-center transition-all"
                style={{
                  background: isMe ? "var(--brand-soft)" : "var(--bg-card)",
                  border: `1px solid ${isMe ? "var(--brand-border)" : "var(--border)"}`,
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* Host badge */}
                {participant.isHost && (
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap font-[600]"
                    style={{ background: "rgba(234,179,8,0.15)", color: "#ca8a04", border: "1px solid rgba(234,179,8,0.3)" }}
                  >
                    HOST
                  </div>
                )}

                {/* Online dot */}
                <div className="absolute top-2.5 right-2.5">
  		<div
    		  className={`w-2 h-2 rounded-full ${
                  participant.isOnline ? "bg-green-400" : "bg-red-500"
                 }`}
                 />
  
  		{participant.isOnline && (
    		<div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-50" />
  		)}
		</div>

                {/* Avatar */}
                <motion.div
                  animate={hasVoted && !isRevealed ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className="relative mx-auto mb-3 w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                  style={{ background: `${participant.avatar.color}18` }}
                >
                  {participant.avatar.emoji}
                  {/* voted checkmark */}
                  <AnimatePresence>
                    {hasVoted && !isRevealed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: "#22c55e" }}
                      >
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Name */}
                <p className="text-xs font-[500] truncate mb-2.5" style={{ color: isMe ? "var(--brand)" : "var(--text-secondary)" }}>
                  {participant.nickname}{isMe ? " (you)" : ""}
                </p>

                {/* Vote card */}
                <AnimatePresence mode="wait">
                  {isRevealed && vote?.value != null ? (
                    /* Revealed: flip animation + color coding */
                    <motion.div
                      key={`revealed-${round}`}
                      className="flip-in mx-auto w-10 h-10 rounded-xl flex items-center justify-center font-display font-[700] text-base"
                      style={{
                        background: colors.bg,
                        color: colors.color,
                        border: `1px solid ${colors.border}`,
                        boxShadow: `0 0 16px ${colors.glow}`,
                      }}
                    >
                      {vote.value}
                    </motion.div>
                  ) : hasVoted ? (
                    /* Voted but hidden */
                    <motion.div
                      key="hidden"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: "var(--brand-soft)",
                        border: "1px solid var(--brand-border)",
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--brand)" }} />
                    </motion.div>
                  ) : (
                    /* Waiting */
                    <motion.div
                      key="waiting"
                      className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "var(--bg-card2)", border: "1px solid var(--border)" }}
                    >
                      <motion.div
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                        className="w-1 h-1 rounded-full"
                        style={{ background: "var(--text-muted)" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
