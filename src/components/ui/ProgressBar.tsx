import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ProgressBarProps {
  value: number; // Percentage (e.g. 75, 95, 110)
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  colorScheme?: 'budget' | 'goal' | 'emerald' | 'blue';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  size = 'md',
  showLabel = false,
  colorScheme = 'budget',
}) => {
  const percentage = Math.max(0, (value / max) * 100);
  const displayPercentage = Math.round(percentage);

  // Determine fill color
  let barColor = 'bg-emerald-500';
  if (colorScheme === 'budget') {
    if (percentage > 100) {
      barColor = 'bg-rose-500';
    } else if (percentage >= 80) {
      barColor = 'bg-amber-500';
    } else {
      barColor = 'bg-emerald-500';
    }
  } else if (colorScheme === 'goal') {
    barColor = percentage >= 100 ? 'bg-emerald-500' : 'bg-blue-500';
  } else if (colorScheme === 'blue') {
    barColor = 'bg-blue-500';
  }

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>Progress</span>
          <span className="tabular-nums font-semibold">{displayPercentage}%</span>
        </div>
      )}
      <div
        className={twMerge(
          clsx(
            'w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden',
            heights[size],
            className
          )
        )}
      >
        <div
          className={twMerge(clsx('h-full transition-all duration-500 rounded-full', barColor))}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
};
