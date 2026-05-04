"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Room, Participant } from "@/types";
import {
  subscribeToRoom,
  subscribeToParticipants,
  updateRoom,
  setVotingType,
  revealVotes,
  resetVotes,
  startTimer,
  pauseTimer,
  resetTimer,
  addTimerSeconds,
  setOnlineStatus,
  updateTopic,
} from "@/lib/firebase/rooms";
import { VotingType } from "@/types";

export function useRoom(roomId: string, userId: string | undefined) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to room
  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToRoom(roomId, (r) => {
      setRoom(r);
      setLoading(false);
    });
    return () => unsub();
  }, [roomId]);

  // Subscribe to participants
  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToParticipants(roomId, setParticipants);
    return () => unsub();
  }, [roomId]);

  // Online presence
  useEffect(() => {
    if (!roomId || !userId) return;
    setOnlineStatus(roomId, userId, true);
    const handleUnload = () => setOnlineStatus(roomId, userId, false);
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      setOnlineStatus(roomId, userId, false);
    };
  }, [roomId, userId]);

  // Timer sync
  useEffect(() => {
    if (!room?.timer) return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (room.timer.isRunning && room.timer.startedAt) {
      const base = room.timer.seconds;
      const startedAt = room.timer.startedAt;

const tick = () => {
  const now = Date.now();
  const elapsed = Math.floor((now - startedAt) / 1000);

  const remaining = Math.max(base - elapsed, 0);

  setElapsedSeconds(remaining);
};

      tick();
      timerIntervalRef.current = setInterval(tick, 1000);
    } else {
      setElapsedSeconds(room.timer.seconds);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [room?.timer]);

  const isHost = room?.hostId === userId;

  const handleReveal = useCallback(async () => {
    if (!isHost) return;
    await revealVotes(roomId);
  }, [roomId, isHost]);

  const handleReset = useCallback(async () => {
    if (!isHost || !room) return;
    await resetVotes(roomId, room.round);
  }, [roomId, isHost, room]);

  const handleSetVotingType = useCallback(async (type: VotingType) => {
    if (!isHost) return;
    await setVotingType(roomId, type);
  }, [roomId, isHost]);

  const handleStartTimer = useCallback(async () => {
    if (!isHost) return;
    await startTimer(roomId, elapsedSeconds);
  }, [roomId, isHost, elapsedSeconds]);

  const handlePauseTimer = useCallback(async () => {
    if (!isHost) return;
    await pauseTimer(roomId, elapsedSeconds);
  }, [roomId, isHost, elapsedSeconds]);

  const handleResetTimer = useCallback(async () => {
    if (!isHost) return;
    await resetTimer(roomId);
  }, [roomId, isHost]);

  const handleAddTime = useCallback(async (seconds: number) => {
    if (!isHost) return;
    await addTimerSeconds(roomId, elapsedSeconds, seconds, room?.timer.isRunning ?? false);
  }, [roomId, isHost, elapsedSeconds, room?.timer.isRunning]);

  const handleUpdateTopic = useCallback(async (topic: string) => {
    if (!isHost) return;
    await updateTopic(roomId, topic);
  }, [roomId, isHost]);

  return {
    room,
    participants,
    loading,
    isHost,
    elapsedSeconds,
    handleReveal,
    handleReset,
    handleSetVotingType,
    handleStartTimer,
    handlePauseTimer,
    handleResetTimer,
    handleAddTime,
    handleUpdateTopic,
  };
}
