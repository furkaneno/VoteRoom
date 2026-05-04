/** Map a vote value to its tier label */
export type VoteTier = "low" | "mid" | "good" | "high" | "special";

export function getVoteTier(value: string | number | null): VoteTier {
  if (value === null) return "special";
  const n = Number(value);
  if (isNaN(n)) return "special";
  if (n <= 3) return "low";
  if (n <= 6) return "mid";
  if (n <= 8) return "good";
  return "high";
}

export function getVoteColors(tier: VoteTier) {
  switch (tier) {
    case "low":
      return {
        color: "var(--vote-low)",
        bg: "var(--vote-low-bg)",
        glow: "var(--vote-low-glow)",
        border: "rgba(239,68,68,0.3)",
        chartFill: "#ef4444",
      };
    case "mid":
      return {
        color: "var(--vote-mid)",
        bg: "var(--vote-mid-bg)",
        glow: "var(--vote-mid-glow)",
        border: "rgba(245,158,11,0.3)",
        chartFill: "#f59e0b",
      };
    case "good":
      return {
        color: "var(--vote-good)",
        bg: "var(--vote-good-bg)",
        glow: "var(--vote-good-glow)",
        border: "rgba(59,130,246,0.3)",
        chartFill: "#3b82f6",
      };
    case "high":
      return {
        color: "var(--vote-high)",
        bg: "var(--vote-high-bg)",
        glow: "var(--vote-high-glow)",
        border: "rgba(16,185,129,0.3)",
        chartFill: "#10b981",
      };
    default:
      return {
        color: "var(--text-secondary)",
        bg: "var(--bg-card2)",
        glow: "transparent",
        border: "var(--border)",
        chartFill: "#6366f1",
      };
  }
}
