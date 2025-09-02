
"use client";

import { cn } from '@/lib/utils';
import { StatIcon } from './stat-icons';
import { ArrowDown, ArrowUp, Minus, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const statDescriptions: { [key: string]: string } = {
  'Damage': 'How much health each shot removes from the enemy.',
  'Range': 'How far the weapon remains effective before damage drop-off.',
  'Control': 'How easy it is to manage the weapon’s recoil.',
  'Handling & Mobility': 'How fast you can aim down sights and switch weapons. Affects handling.',
  'Stability': 'How steady the aim stays while shooting continuously.',
  'Accuracy': 'How closely shots follow the crosshair during firing.',
  'Fire Rate': 'How many bullets the gun fires per minute (RPM).',
  'Muzzle Velocity': 'How fast bullets travel after being fired.',
  'damage': 'How much health each shot removes from the enemy.',
  'range': 'How far the weapon remains effective before damage drop-off.',
  'control': 'How easy it is to manage the weapon’s recoil.',
  'handling': 'Handling & Mobility',
  'stability': 'How steady the aim stays while shooting continuously.',
  'accuracy': 'How closely shots follow the crosshair during firing.',
  'fireRate': 'How many bullets the gun fires per minute (RPM).',
  'muzzleVelocity': 'How fast bullets travel after being fired.',
};

interface StatBarProps {
  statName: string;
  value: number;
  label: string;
  isSuperior?: boolean;
}

const isHighValue = (statName: string, value: number) => {
    const lowerCaseStatName = statName.toLowerCase();
    if (lowerCaseStatName.includes('firerate') || lowerCaseStatName.includes('fire rate')) {
        return value > 800;
    }
    if (lowerCaseStatName.includes('muzzlevelocity') || lowerCaseStatName.includes('muzzle velocity')) {
        return value > 1000;
    }
    return value > 75;
}

const SimpleStatBar = ({ statName, value, label, isSuperior = false }: StatBarProps) => {
  const isScoreContribution = !statDescriptions[label];
  const maxStatValue = isScoreContribution ? 40 : (statName.toLowerCase() === 'firerate' || statName.toLowerCase() === 'muzzlevelocity' ? 1200 : 100);
  const barWidth = Math.min((value / maxStatValue) * 100, 100);
  const normalizedStatName = statName.toLowerCase().replace(/\s/g, '');
  const displayLabel = label === 'handling' ? 'Handling & Mobility' : label.replace(/([A-Z])/g, ' $1');

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground w-32">
        <StatIcon name={normalizedStatName} className="h-5 w-5" />
        <span className='capitalize'>{displayLabel}</span>
        {statDescriptions[label] && (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/70 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{statDescriptions[label]}</p>
                  </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
      </div>
      <div className="w-full overflow-hidden rounded-full bg-muted h-3">
        <div
          className={cn('h-3 rounded-full transition-all duration-500', isSuperior ? 'bg-accent' : 'bg-primary/50')}
          style={{ width: `${barWidth}%` }}
        />
      </div>
       <span
        className={cn(
          'font-code text-lg font-bold transition-colors w-12 text-right',
          isSuperior ? 'text-accent' : (isHighValue(statName, value) ? 'text-foreground' : 'text-muted-foreground'),
          'drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]'
        )}
      >
        {value}
      </span>
    </div>
  );
};


export { SimpleStatBar };
