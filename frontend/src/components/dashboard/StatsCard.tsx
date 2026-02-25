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
    <div className="glossy-card custom-shadow p-4 sm:p-5 rounded-lg sm:rounded-xl border border-white/20 dark:border-slate-700 hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <Icon className="w-5 sm:w-6 h-5 sm:h-6 text-primary p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0" />
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
