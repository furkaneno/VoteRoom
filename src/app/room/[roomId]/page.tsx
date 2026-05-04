"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useRoom } from "@/hooks/useRoom";
import { useVotes } from "@/hooks/useVotes";
import { getRoom, joinRoom } from "@/lib/firebase/rooms";
import { ANIMAL_AVATARS, VOTING_SCALES } from "@/types";
import RoomHeader from "@/components/room/RoomHeader";
import ParticipantGrid from "@/components/room/ParticipantGrid";
import VotingPanel from "@/components/voting/VotingPanel";
import ResultsPanel from "@/components/results/ResultsPanel";
import HostControls from "@/components/room/HostControls";
import TopicBar from "@/components/room/TopicBar";

/* ── Inline join gate (shown when url opened by non-member) ── */
function JoinGate({ roomId, onJoined }: { roomId: string; onJoined: () => void }) {
  const { user } = useAuth();
  const [nickname, setNickname] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("vr_nickname");
    if (saved) setNickname(saved);
  }, []);

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
      onJoined();
    } catch {
      setJoining(false);
    }
  };

  return (
    <div className="page-bg grid-overlay min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="text-center mb-8">
          <motion.div animate={{ rotate: [0,10,-10,0] }} transition={{ duration: 3, repeat: Infinity }} className="text-4xl mb-3">🗳️</motion.div>
          <h2 className="font-display text-2xl font-[700]" style={{ color: "var(--text-primary)" }}>You're invited!</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Enter your nickname to join</p>
        </div>
        <div className="card rounded-2xl p-6">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="Your nickname..."
            maxLength={24}
            autoFocus
            className="themed-input w-full px-4 py-3 rounded-xl text-sm mb-4 transition-all"
          />
          <motion.button
            onClick={handleJoin}
            disabled={!nickname.trim() || joining}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="neon-btn w-full py-3 rounded-xl font-display text-sm text-white disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            {joining ? "Joining..." : "Join Room →"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main room page ── */
export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const { user, loading: authLoading } = useAuth();
  const [isParticipant, setIsParticipant] = useState(false);
  const [checking, setChecking] = useState(true);

  const {
    room, participants, loading, isHost, elapsedSeconds,
    handleReveal, handleReset, handleSetVotingType,
    handleStartTimer, handlePauseTimer, handleResetTimer,
    handleAddTime, handleUpdateTopic,
  } = useRoom(roomId, user?.uid);

  const {
    currentRoundVotes, myVote, handleVote, computeStats, voteCount,
  } = useVotes(roomId, user?.uid, participants, room?.round ?? 1);

  /* ── Participant check ── */
  useEffect(() => {
    if (authLoading || !roomId) return;
    const joined = sessionStorage.getItem(`vr_joined_${roomId}`);
    getRoom(roomId).then((r) => {
      if (!r) { router.replace("/"); return; }
      if (r.hostId === user!.uid || joined) {
  setIsParticipant(true);
}
      setChecking(false);
    });
  }, [authLoading, user, roomId, router]);

  /* ── Loading ── */
  if (authLoading || checking || (loading && isParticipant)) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 rounded-full border-2"
          style={{ borderColor: "var(--border-strong)", borderTopColor: "var(--brand)" }}
        />
      </div>
    );
  }

  if (!isParticipant) return <JoinGate roomId={roomId} onJoined={() => setIsParticipant(true)} />;

  if (!room) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p style={{ color: "var(--text-muted)" }}>Room not found</p>
        </div>
      </div>
    );
  }

  const scale = VOTING_SCALES[room.votingType];
  // ⬇️  KEY FIX: stats computed from live votes every render, shown when isRevealed=true
  const stats = room.isRevealed ? computeStats() : null;
  const myParticipant = participants.find((p) => p.id === user?.uid);

  return (
    <div className="page-bg grid-overlay min-h-screen flex flex-col">

      {/* Header */}
      <RoomHeader
        room={room}
        roomId={roomId}
        participants={participants}
        isHost={isHost}
        myParticipant={myParticipant}
        voteCount={voteCount}
        elapsedSeconds={elapsedSeconds}
        onStartTimer={handleStartTimer}
        onPauseTimer={handlePauseTimer}
        onResetTimer={handleResetTimer}
        onAddTime={handleAddTime}
      />

      {/* Topic */}
      <TopicBar topic={room.topic ?? ""} isHost={isHost} onUpdate={handleUpdateTopic} />

      {/* Main content */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col gap-5">

        {/* Host controls bar */}
        {isHost && (
          <HostControls
            room={room}
            voteCount={voteCount}
            totalParticipants={participants.length}
            onReveal={handleReveal}
            onReset={handleReset}
            onSetVotingType={handleSetVotingType}
          />
        )}

        {/* Results ↔ Voting panel */}
        <AnimatePresence mode="wait">
          {room.isRevealed && stats ? (
            <motion.div
              key={`results-${room.round}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <ResultsPanel stats={stats} scale={scale} />
            </motion.div>
          ) : (
            <motion.div
              key={`voting-${room.round}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <VotingPanel
                scale={scale}
                myVote={myVote}
                onVote={handleVote}
                isRevealed={room.isRevealed}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Participant avatars */}
        <ParticipantGrid
          participants={participants}
          votes={currentRoundVotes}
          isRevealed={room.isRevealed}
          currentUserId={user?.uid}
          round={room.round}
        />
      </main>
    </div>
  );
}
