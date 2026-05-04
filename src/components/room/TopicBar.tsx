"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TopicBarProps {
  topic: string;
  isHost: boolean;
  onUpdate: (topic: string) => void;
}

export default function TopicBar({ topic, isHost, onUpdate }: TopicBarProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(topic);

  useEffect(() => { setDraft(topic); }, [topic]);

  const save = () => { onUpdate(draft.trim()); setEditing(false); };
  const cancel = () => { setDraft(topic); setEditing(false); };

  if (!topic && !isHost) return null;

  return (
    <div
      className="relative z-20 border-b"
      style={{ background: "var(--header-bg)", borderColor: "var(--border)", backdropFilter: "blur(12px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        <span className="text-[10px] font-[600] uppercase tracking-widest shrink-0" style={{ color: "var(--text-muted)" }}>
          Topic
        </span>

        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 flex-1">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
                placeholder="What are we estimating?"
                className="flex-1 bg-transparent text-sm focus:outline-none pb-0.5"
                style={{ color: "var(--text-primary)", borderBottom: "1px solid var(--brand-border)" }}
              />
              <button onClick={save} className="text-xs font-[500] transition-colors px-2 py-0.5 rounded-md"
                style={{ color: "var(--brand)", background: "var(--brand-soft)" }}>Save</button>
              <button onClick={cancel} className="text-xs transition-colors" style={{ color: "var(--text-muted)" }}>Cancel</button>
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 flex-1 min-w-0">
              {topic ? (
                <span className="text-sm truncate font-[500]" style={{ color: "var(--text-primary)" }}>{topic}</span>
              ) : (
                <span className="text-sm italic" style={{ color: "var(--text-muted)" }}>No topic set — click edit to add one</span>
              )}
              {isHost && (
                <button onClick={() => setEditing(true)}
                  className="text-[11px] shrink-0 px-2 py-0.5 rounded-md transition-colors"
                  style={{ color: "var(--text-muted)", background: "var(--bg-card2)" }}>
                  ✏️ Edit
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
