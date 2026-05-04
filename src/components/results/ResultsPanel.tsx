"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RoomStats, VotingScale } from "@/types";
import { getVoteTier, getVoteColors } from "@/lib/voteColors";

interface ResultsPanelProps {
  stats: RoomStats;
  scale: VotingScale;
}

export default function ResultsPanel({ stats, scale }: ResultsPanelProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const proPalette = ["#6366f1", "#0891b2", "#059669", "#7c3aed", "#db2777", "#ea580c"];

  const createSlice = (startAngle: number, endAngle: number, radius: number) => {
    const cx = 50, cy = 50;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const { chartData, totalPointsSum } = useMemo(() => {
    const entries = Object.entries(stats.distribution).map(([value, count]) => ({
      value,
      count,
      totalScoreValue: (Number(value) || 0) * count || 0.1,
      voters: stats.results.filter(r => r.value === value).map(r => r.nickname)
    }));
    const sum = entries.reduce((acc, curr) => acc + curr.totalScoreValue, 0);
    return { 
      chartData: entries.sort((a, b) => scale.values.indexOf(a.value) - scale.values.indexOf(b.value)), 
      totalPointsSum: sum 
    };
  }, [stats.distribution, stats.results, scale.values]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 p-2 select-none antialiased">
      
      {/* Kompakt ve Yukarı Çekilmiş Stat Bar */}
      <div className="flex gap-2 items-stretch h-14">
        {/* Ortalama - Vurgulu Renk ve Hafif Geniş (1.2 oranında) */}
        <div className="flex-[1.2] bg-indigo-600 dark:bg-indigo-500 rounded-xl px-4 flex items-center justify-between shadow-md">
          <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">Average</span>
          <span className="text-3xl font-black text-white tabular-nums tracking-tighter">
            {stats.average || 0}
          </span>
        </div>

        {/* Min & Max - Daha Küçük ve Nötr */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl px-4 flex items-center justify-between border border-slate-100 dark:border-white/5 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Min</span>
          <span className="text-xl font-bold text-slate-700 dark:text-slate-200 tabular-nums">{stats.min || 0}</span>
        </div>
        
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl px-4 flex items-center justify-between border border-slate-100 dark:border-white/5 shadow-sm">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Max</span>
          <span className="text-xl font-bold text-slate-700 dark:text-slate-200 tabular-nums">{stats.max || 0}</span>
        </div>
      </div>

      {/* Ana Veri Paneli (Daha Az Padding) */}
      <div className="relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-lg">
        
        <div className="relative w-36 h-36 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            {(() => {
              let currentAngle = -Math.PI / 2;
              const total = totalPointsSum || 1;
              return chartData.map((d, i) => {
                const percent = d.totalScoreValue / total;
                const angle = percent * 2 * Math.PI;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                currentAngle += angle;
                const isHovered = hoveredIndex === i;
                return (
                  <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
                    <motion.path
                      d={createSlice(startAngle, endAngle, 46)}
                      fill={proPalette[i % proPalette.length]}
                      animate={{ 
                        scale: isHovered ? 1.08 : 1,
                        opacity: hoveredIndex === null || isHovered ? 1 : 0.4,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="stroke-white dark:stroke-slate-900"
                      strokeWidth="2"
                    />
                  </g>
                );
              });
            })()}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">{stats.totalVotes}</span>
            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Votes</span>
          </div>
        </div>

        <div className="flex-grow w-full space-y-2.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {chartData.map((d, i) => {
            const isFocused = hoveredIndex === i;
            return (
              <motion.div 
                key={i} 
                animate={{ 
                  opacity: hoveredIndex === null || isFocused ? 1 : 0.3,
                  x: isFocused ? 4 : 0
                }}
                className="flex flex-col gap-0.5"
              >
                <div className="flex justify-between items-end px-0.5">
                  <span className={`text-[9px] font-black uppercase tracking-wider ${isFocused ? "text-indigo-500" : "text-slate-400"}`}>
                    Value {d.value}
                  </span>
                  <span className="text-[8px] font-bold text-slate-500 italic">
                    {d.count} Users
                  </span>
                </div>
                <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(d.totalScoreValue / totalPointsSum) * 100}%` }}
                    className="h-full rounded-full" 
                    style={{ backgroundColor: proPalette[i % proPalette.length] }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Katılımcılar */}
      <div className="flex flex-wrap justify-center gap-1.5 pt-1">
        {stats.results.map((result) => {
          const colors = getVoteColors(getVoteTier(result.value));
          return (
            <div key={result.userId} className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm group">
              <span className="text-xs group-hover:scale-110 transition-transform">{result.avatar.emoji}</span>
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[60px]">{result.nickname}</span>
              <span className="text-[9px] font-black leading-none" style={{ color: colors.color }}>{result.value || "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}