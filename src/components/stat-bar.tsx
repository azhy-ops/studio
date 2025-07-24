
"use client";

import { cn } from '@/lib/utils';
import { StatIcon } from './stat-icons';
import { ArrowDown, ArrowUp, Minus, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const statDescriptions: { [key: string]: string } = {
  'Damage': 'How much health each shot removes from the enemy.',
  'Range': 'How far the weapon remains effective before damage drop-off.',
  'Control': 'How easy it is to manage the weapon’s recoil.',
  'Handling': 'How fast you can aim down sights and switch weapons.',
  'Mobility': 'How fast you can move while holding the weapon. Affects handling.',
  'Stability': 'How steady the aim stays while shooting continuously.',
  'Accuracy': 'How closely shots follow the crosshair during firing.',
  'Fire Rate': 'How many bullets the gun fires per minute (RPM).',
  'Muzzle Velocity': 'How fast bullets travel after being fired.',
};

interface StatBarProps {
  statName: string;
  value1: number;
  value2: number;
  unit?: string;
}

const StatBar = ({ statName, value1, value2, unit }: StatBarProps) => {
  const is1Superior = value1 > value2;
  const is2Superior = value2 > value1;
  const maxStatValue = statName === 'Fire Rate' || statName === 'Muzzle Velocity' ? 1200 : 100;
  const bar1Width = Math.min((value1 / maxStatValue) * 100, 100);
  const bar2Width = Math.min((value2 / maxStatValue) * 100, 100);

  const normalizedStatName = statName.toLowerCase().replace(/\s/g, '');

  const percentageDiff = Math.round(
    ((value1 - value2) / Math.max(value1, value2, 1)) * 100
  );

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

      {/* Stat Name, Icon, and Percentage Difference */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center h-6">
          {percentageDiff !== 0 && (
            <div
              className={cn(
                'flex items-center text-xs font-bold',
                percentageDiff > 0 ? 'text-green-400' : 'text-red-400'
              )}
            >
              {percentageDiff > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span>{Math.abs(percentageDiff)}%</span>
            </div>
          )}
          {percentageDiff === 0 && (
             <Minus className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <StatIcon name={normalizedStatName} className="h-6 w-6 text-muted-foreground" />
        <div className="flex items-center gap-1.5 mt-1">
           <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
             {statName}
             {unit && <span className="ml-1 opacity-70">({unit})</span>}
           </span>
          {statDescriptions[statName] && (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/70 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{statDescriptions[statName]}</p>
                  </TooltipContent>
                </Tooltip>
            </TooltipProvider>
           )}
        </div>
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
