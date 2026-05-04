"use client";

import { motion } from "framer-motion";
import { formatTime } from "@/lib/utils";

interface TimerWidgetProps {
  elapsedSeconds: number;
  isRunning: boolean;
  isHost: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onAdd: (s: number) => void;
}

export default function TimerWidget({
  elapsedSeconds, isRunning, isHost, onStart, onPause, onReset, onAdd,
}: TimerWidgetProps) {
  return (
    <div className="flex items-center gap-2">
      <motion.span
        animate={isRunning ? { opacity: [1, 0.5, 1] } : {}}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="font-mono text-sm tabular-nums"
        style={{ color: isRunning ? "var(--brand)" : "var(--text-muted)" }}
      >
        {formatTime(elapsedSeconds)}
      </motion.span>

      {isHost && (
        <div className="flex items-center gap-1">
          {[
            { label: isRunning ? "⏸" : "▶", action: isRunning ? onPause : onStart },
            { label: "⏹", action: onReset },
            { label: "+10s", action: () => onAdd(10), small: true },
            { label: "+20s", action: () => onAdd(20), small: true },
            { label: "+30s", action: () => onAdd(30), small: true },
          ].map((btn, i) => (
            <motion.button
              key={i}
              onClick={btn.action}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-md transition-colors"
              style={{
                background: "var(--bg-card2)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                ...(btn.small
                  ? { padding: "2px 6px", fontSize: "10px", fontFamily: "JetBrains Mono, monospace" }
                  : { width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }),
              }}
            >
              {btn.label}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
