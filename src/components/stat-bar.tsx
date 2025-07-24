"use client";

import { cn } from '@/lib/utils';
import { StatIcon } from './stat-icons';

interface StatBarProps {
  statName: string;
  value1: number;
  value2: number;
}

const StatBar = ({ statName, value1, value2 }: StatBarProps) => {
  const is1Superior = value1 > value2;
  const is2Superior = value2 > value1;
  const maxStatValue = 100; // Assume stats are out of 100 for normalization
  const bar1Width = Math.min((value1 / maxStatValue) * 100, 100);
  const bar2Width = Math.min((value2 / maxStatValue) * 100, 100);

  const normalizedStatName = statName.toLowerCase().replace(/\s/g, '');

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
      {/* Weapon 1 Stat */}
      <div className="flex items-center justify-end gap-2">
        <span
          className={cn(
            'font-code text-lg font-semibold transition-colors',
            is1Superior ? 'text-accent' : 'text-foreground'
          )}
        >
          {value1}
        </span>
        <div className="w-full overflow-hidden rounded-full bg-muted h-3">
          <div
            className={cn('h-3 rounded-full transition-all duration-500', is1Superior ? 'bg-accent' : 'bg-primary/50')}
            style={{ width: `${bar1Width}%` }}
          />
        </div>
      </div>

      {/* Stat Name and Icon */}
      <div className="flex flex-col items-center text-center">
        <StatIcon name={normalizedStatName} className="h-6 w-6 text-muted-foreground" />
        <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {statName}
        </span>
      </div>

      {/* Weapon 2 Stat */}
      <div className="flex items-center gap-2">
        <div className="w-full overflow-hidden rounded-full bg-muted h-3">
          <div
            className={cn('h-3 rounded-full transition-all duration-500', is2Superior ? 'bg-accent' : 'bg-primary/50')}
            style={{ width: `${bar2Width}%` }}
          />
        </div>
        <span
          className={cn(
            'font-code text-lg font-semibold transition-colors',
            is2Superior ? 'text-accent' : 'text-foreground'
          )}
        >
          {value2}
        </span>
      </div>
    </div>
  );
};

export default StatBar;
