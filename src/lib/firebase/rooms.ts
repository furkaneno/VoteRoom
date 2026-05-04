import {
  doc,
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import { Room, Participant, Vote, TimerState, VotingType, Avatar } from "@/types";
import { customAlphabet } from "nanoid";
import { doc, updateDoc } from "firebase/firestore";


export const updateRoom = async (roomId: string, data: any) => {
  const ref = doc(db, "rooms", roomId);
  await updateDoc(ref, data);
};
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);
export const generateRoomId = () => nanoid();

// ─── Room ────────────────────────────────────────────────────────────────────

export const createRoom = async (
  roomId: string,
  hostId: string,
  hostNickname: string
): Promise<void> => {
  const initialTimer: TimerState = {
    seconds: 0,
    isRunning: false,
    startedAt: null,
    pausedAt: null,
  };
  await setDoc(doc(db, "rooms", roomId), {
    id: roomId,
    hostId,
    hostNickname,
    votingType: "numeric",
    isRevealed: false,
    round: 1,
    createdAt: Date.now(),
    timer: initialTimer,
    topic: "",
  });
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
  const snap = await getDoc(doc(db, "rooms", roomId));
  return snap.exists() ? (snap.data() as Room) : null;
};

export const subscribeToRoom = (
  roomId: string,
  callback: (room: Room | null) => void
) =>
  onSnapshot(doc(db, "rooms", roomId), (snap) => {
    callback(snap.exists() ? (snap.data() as Room) : null);
  });

export const setVotingType = async (roomId: string, votingType: VotingType) => {
  await updateDoc(doc(db, "rooms", roomId), { votingType, isRevealed: false });
};

/**
 * Reveal: set isRevealed = true.
 * All clients with onSnapshot will immediately re-render.
 */
export const revealVotes = async (roomId: string) => {
  await updateDoc(doc(db, "rooms", roomId), { isRevealed: true });
};

/**
 * New round: bump round number, clear isRevealed, delete all votes.
 * Uses a batch write so everything lands atomically.
 */
export const resetVotes = async (roomId: string, currentRound: number) => {
  const batch = writeBatch(db);

  // 1. Update room document
  batch.update(doc(db, "rooms", roomId), {
    isRevealed: false,
    round: currentRound + 1,
  });

  // 2. Delete all existing vote documents
  const votesSnap = await getDocs(collection(db, "rooms", roomId, "votes"));
  votesSnap.forEach((voteDoc) => {
    batch.delete(voteDoc.ref);
  });

  await batch.commit();
};

export const updateTopic = async (roomId: string, topic: string) => {
  await updateDoc(doc(db, "rooms", roomId), { topic });
};

// ─── Timer ───────────────────────────────────────────────────────────────────

export const startTimer = async (roomId: string, currentSeconds: number) => {
  await updateDoc(doc(db, "rooms", roomId), {
    timer: {
      seconds: currentSeconds,
      isRunning: true,
      startedAt: Date.now(),
      pausedAt: null,
    },
  });
};

export const pauseTimer = async (roomId: string, elapsedSeconds: number) => {
  await updateDoc(doc(db, "rooms", roomId), {
    timer: {
      seconds: elapsedSeconds,
      isRunning: false,
      startedAt: null,
      pausedAt: Date.now(),
    },
  });
};

export const resetTimer = async (roomId: string) => {
  await updateDoc(doc(db, "rooms", roomId), {
    timer: {
      seconds: 0,
      isRunning: false,
      startedAt: null,
      pausedAt: null,
    },
  });
};

export const addTimerSeconds = async (
  roomId: string,
  currentElapsed: number,
  addSeconds: number,
  isRunning: boolean
) => {
  const newSeconds = currentElapsed + addSeconds;
  await updateDoc(doc(db, "rooms", roomId), {
    "timer.seconds": newSeconds,
    ...(isRunning ? { "timer.startedAt": Date.now() } : {}),
  });
};

// ─── Participants ─────────────────────────────────────────────────────────────

export const joinRoom = async (
  roomId: string,
  userId: string,
  nickname: string,
  avatar: Avatar,
  isHost: boolean
) => {
  await setDoc(doc(db, "rooms", roomId, "participants", userId), {
    id: userId,
    nickname,
    avatar,
    isHost,
    joinedAt: Date.now(),
    isOnline: true,
  });
};

export const setOnlineStatus = async (
  roomId: string,
  userId: string,
  isOnline: boolean
) => {
  try {
    await updateDoc(doc(db, "rooms", roomId, "participants", userId), { isOnline });
  } catch {
    // Participant doc may not exist yet — ignore
  }
};

export const subscribeToParticipants = (
  roomId: string,
  callback: (participants: Participant[]) => void
) =>
  onSnapshot(collection(db, "rooms", roomId, "participants"), (snap) => {
    const list = snap.docs.map((d) => d.data() as Participant);
    callback(list.sort((a, b) => a.joinedAt - b.joinedAt));
  });

// ─── Votes ────────────────────────────────────────────────────────────────────

export const castVote = async (
  roomId: string,
  userId: string,
  value: string | number,
  round: number
) => {
  await setDoc(doc(db, "rooms", roomId, "votes", userId), {
    userId,
    value,
    votedAt: Date.now(),
    round,
  });
};

export const clearVote = async (roomId: string, userId: string) => {
  try {
    await deleteDoc(doc(db, "rooms", roomId, "votes", userId));
  } catch {
    // Already absent — ignore
  }
};

export const subscribeToVotes = (
  roomId: string,
  callback: (votes: Vote[]) => void
) =>
  onSnapshot(collection(db, "rooms", roomId, "votes"), (snap) => {
    callback(snap.docs.map((d) => d.data() as Vote));
  });
