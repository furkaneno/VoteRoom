"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${className}`}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
        color: "var(--text-secondary)",
      }}
    >
      <AnimatedIcon isDark={isDark} />
    </motion.button>
  );
}

function AnimatedIcon({ isDark }: { isDark: boolean }) {
  return (
    <motion.div
      key={isDark ? "moon" : "sun"}
      initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
      animate={{ rotate: 0, opacity: 1, scale: 1 }}
      exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
      transition={{ duration: 0.25 }}
      className="text-base leading-none"
    >
      {isDark ? "🌙" : "☀️"}
    </motion.div>
  );
}
