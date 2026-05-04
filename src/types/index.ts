export type VotingType = "numeric" | "fibonacci" | "tshirt" | "custom";

export type VotingScale = {
  type: VotingType;
  values: (string | number)[];
  label: string;
};

export const VOTING_SCALES: Record<VotingType, VotingScale> = {
  numeric: {
    type: "numeric",
    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    label: "Numeric",
  },
  fibonacci: {
    type: "fibonacci",
    values: [1, 2, 3, 5, 8, 13, 21],
    label: "Fibonacci",
  },
  tshirt: {
    type: "tshirt",
    values: ["XS", "S", "M", "L", "XL"],
    label: "T-Shirt Sizes",
  },
  custom: {
    type: "custom",
    values: [1, 2, 3, 5, 8, 13, 21, "?", "☕"],
    label: "Custom",
  },
};

export const ANIMAL_AVATARS = [
  { emoji: "🦊", name: "Fox", color: "#f97316" },
  { emoji: "🐼", name: "Panda", color: "#6b7280" },
  { emoji: "🐱", name: "Cat", color: "#a855f7" },
  { emoji: "🦉", name: "Owl", color: "#78716c" },
  { emoji: "🐸", name: "Frog", color: "#22c55e" },
  { emoji: "🐨", name: "Koala", color: "#94a3b8" },
  { emoji: "🦁", name: "Lion", color: "#eab308" },
  { emoji: "🐺", name: "Wolf", color: "#64748b" },
  { emoji: "🦝", name: "Raccoon", color: "#8b5cf6" },
  { emoji: "🐻", name: "Bear", color: "#92400e" },
  { emoji: "🦅", name: "Eagle", color: "#3b82f6" },
  { emoji: "🐯", name: "Tiger", color: "#f59e0b" },
  { emoji: "🦊", name: "Red Fox", color: "#ef4444" },
  { emoji: "🐧", name: "Penguin", color: "#1e293b" },
  { emoji: "🦋", name: "Butterfly", color: "#ec4899" },
  { emoji: "🐙", name: "Octopus", color: "#7c3aed" },
];

export type Avatar = {
  emoji: string;
  name: string;
  color: string;
};

export type TimerState = {
  seconds: number;
  isRunning: boolean;
  startedAt: number | null;
  pausedAt: number | null;
};

export type Room = {
  id: string;
  hostId: string;
  hostNickname: string;
  votingType: VotingType;
  isRevealed: boolean;
  round: number;
  createdAt: number;
  timer: TimerState;
  topic?: string;
};

export type Participant = {
  id: string;
  nickname: string;
  avatar: Avatar;
  isHost: boolean;
  joinedAt: number;
  isOnline: boolean;
};

export type Vote = {
  userId: string;
  value: string | number | null;
  votedAt: number | null;
  round: number;
};

export type VoteResult = {
  userId: string;
  nickname: string;
  avatar: Avatar;
  value: string | number | null;
};

export type RoomStats = {
  average: number | null;
  min: string | number | null;
  max: string | number | null;
  distribution: Record<string, number>;
  results: VoteResult[];
  totalVotes: number;
  totalParticipants: number;
};
