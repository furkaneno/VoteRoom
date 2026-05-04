"use client";

import { useState, useEffect, useCallback } from "react";
import { Vote, Participant, RoomStats, VoteResult } from "@/types";
import { subscribeToVotes, castVote, clearVote } from "@/lib/firebase/rooms";

export function useVotes(
  roomId: string,
  userId: string | undefined,
  participants: Participant[],
  round: number
) {
  const [allVotes, setAllVotes] = useState<Vote[]>([]);

  /* ── Live subscription to all votes ── */
  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToVotes(roomId, (votes) => {
      setAllVotes(votes);
    });
    return () => unsub();
  }, [roomId]);

  /* ── Filter to current round only, excluding null values ── */
  const currentRoundVotes = allVotes.filter(
    (v) => v.round === round && v.value !== null && v.value !== undefined
  );

  /* ── My vote this round ── */
  const myVote = allVotes.find((v) => v.userId === userId && v.round === round) ?? undefined;

  /* ── Cast or toggle vote ── */
  const handleVote = useCallback(
    async (value: string | number) => {
      if (!userId) return;
      // Toggle: clicking same card clears it
      if (myVote?.value === value) {
        await clearVote(roomId, userId);
      } else {
        await castVote(roomId, userId, value, round);
      }
    },
    [roomId, userId, round, myVote?.value]
  );

  /* ── Compute stats for results panel ── */
  const computeStats = useCallback((): RoomStats => {
    // Build per-participant results — use currentRoundVotes map for lookups
    const voteMap = new Map<string, Vote>(
      currentRoundVotes.map((v) => [v.userId, v])
    );

    const results: VoteResult[] = participants.map((p) => {
      const vote = voteMap.get(p.id);
      return {
        userId: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        value: vote?.value ?? null,
      };
    });

    // Numeric stats — only count votes with actual numeric values
    const numericVals = currentRoundVotes
      .map((v) => Number(v.value))
      .filter((n) => !isNaN(n) && isFinite(n));

    const average =
      numericVals.length > 0
        ? Math.round((numericVals.reduce((a, b) => a + b, 0) / numericVals.length) * 10) / 10
        : null;

    const sortedNums = [...numericVals].sort((a, b) => a - b);
    const min = sortedNums.length > 0 ? sortedNums[0] : null;
    const max = sortedNums.length > 0 ? sortedNums[sortedNums.length - 1] : null;

    // Distribution over all non-null votes this round
    const distribution: Record<string, number> = {};
    currentRoundVotes.forEach((v) => {
      const key = String(v.value);
      distribution[key] = (distribution[key] ?? 0) + 1;
    });

    return {
      average,
      min,
      max,
      distribution,
      results,
      totalVotes: currentRoundVotes.length,
      totalParticipants: participants.length,
    };
  }, [currentRoundVotes, participants]);

  return {
    votes: allVotes,
    currentRoundVotes,
    myVote,
    handleVote,
    computeStats,
    hasVoted: myVote?.value != null,
    voteCount: currentRoundVotes.length,
  };
}
