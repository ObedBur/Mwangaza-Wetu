'use client';

import React from 'react';
import { LucideIcon, Info } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tooltip?: string;
  isHighlight?: boolean;
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  tooltip,
  isHighlight,
}: StatsCardProps) {
  return (
    <div className="glossy-card p-5 sm:p-6 border-t border-white/60 dark:border-white/5 cursor-pointer hover:border-primary/30 group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          <Icon className="w-5 sm:w-6 h-5 sm:h-6 text-primary group-hover:text-white transition-colors duration-300" />
        </div>
        {tooltip && (
          <button
            className="text-slate-400 hover:text-primary transition-colors flex-shrink-0"
            title={tooltip}
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
        {label}
      </p>
      <h3
        className={`text-xl sm:text-2xl font-bold mt-1 line-clamp-1 ${
          isHighlight ? 'text-emerald-600' : ''
        }`}
      >
        {value}
      </h3>
    </div>
  );
}
