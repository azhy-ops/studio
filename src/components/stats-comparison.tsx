
"use client";

import type { WeaponStats } from '@/lib/ocr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatBarComparison } from './stat-bar';
import { Badge } from './ui/badge';
import type { ComparatorStats } from './weapon-comparator';
import { AlertCircle } from 'lucide-react';

interface StatsComparisonProps {
  data: ComparatorStats;
}

const statDisplayOrder: (keyof Omit<WeaponStats, 'name' | 'ttk' | 'type' | 'fireRateInputType' | 'maxRpmOverride' | 'shotsToKill' | 'timeBetweenShots' | 'rpmUsed'>)[] = [
  'damage',
  'fireRate',
  'range',
  'accuracy',
  'control',
  'handling',
  'stability',
  'muzzleVelocity',
];

const TTKDisplay = ({ weaponStats, winner }: { weaponStats: WeaponStats, winner: string | null }) => (
    <div className='flex flex-col items-center gap-1'>
        <Badge variant={winner === weaponStats.name ? "default" : "secondary"} className="text-lg px-4 py-1 bg-primary/20 text-primary-foreground border-primary">
            {weaponStats.ttk}ms
        </Badge>
        <span className='text-xs text-muted-foreground'>({weaponStats.shotsToKill} shots)</span>
         {weaponStats.fireRateInputType === 'stat' && (
            <div className='flex items-center gap-1 text-xs text-amber-500 mt-1'>
                <AlertCircle className='h-3 w-3' />
                <span>est. RPM: {weaponStats.rpmUsed}</span>
            </div>
        )}
    </div>
);


const StatsComparison = ({ data }: StatsComparisonProps) => {
  const { weapon1Stats, weapon2Stats } = data;
  
  let ttkWinner: string | null = null;
  if (weapon1Stats.ttk > 0 && weapon2Stats.ttk > 0) {
      if (weapon1Stats.ttk < weapon2Stats.ttk) {
          ttkWinner = weapon1Stats.name;
      } else if (weapon2Stats.ttk < weapon1Stats.ttk) {
          ttkWinner = weapon2Stats.name;
      }
  } else if (weapon1Stats.ttk > 0) {
      ttkWinner = weapon1Stats.name;
  } else if (weapon2Stats.ttk > 0) {
      ttkWinner = weapon2Stats.name;
  }

  return (
    <div className="animate-in fade-in-0 duration-500">
      <Card className="w-full bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl sm:text-4xl">Stat Comparison</CardTitle>
          <CardDescription>The superior stat for each category is highlighted in violet. Hover over a stat's info icon for details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 px-4 mb-4">
             <div className="text-right">
                <h3 className="text-lg font-headline">{weapon1Stats.name || 'Weapon 1'}</h3>
                <p className="text-xs text-muted-foreground">{weapon1Stats.type}</p>
             </div>
             <div></div>
             <div className="text-left">
                <h3 className="text-lg font-headline">{weapon2Stats.name || 'Weapon 2'}</h3>
                <p className="text-xs text-muted-foreground">{weapon2Stats.type}</p>
             </div>
          </div>

          <div className="space-y-5">
            {statDisplayOrder.map((statName, index) => {
              const value1 = weapon1Stats[statName];
              const value2 = weapon2Stats[statName];

              if (typeof value1 === 'undefined' || typeof value2 === 'undefined' || value1 === 0 && value2 === 0) {
                return null;
              }

              let formattedStatName = statName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
              if (statName === 'handling') {
                formattedStatName = 'Handling & Mobility';
              }

              let unit: string | undefined;
              if (statName === 'fireRate') {
                const fr1Type = weapon1Stats.fireRateInputType;
                const fr2Type = weapon2Stats.fireRateInputType;
                if(fr1Type === 'rpm' || fr2Type === 'rpm') unit = 'RPM';
              }
              if (statName === 'muzzleVelocity') unit = 'm/s';

              return (
                 <div key={statName} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms`}}>
                    <StatBarComparison
                      statName={formattedStatName}
                      value1={value1}
                      value2={value2}
                      unit={unit}
                    />
                 </div>
              );
            })}
             <div className="text-center pt-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${statDisplayOrder.length * 100}ms`}}>
                <h4 className='font-headline text-xl mb-2'>Time to Kill (100 HP)</h4>
                <div className="flex justify-center items-start gap-4">
                    <TTKDisplay weaponStats={weapon1Stats} winner={ttkWinner} />
                    <span className='text-muted-foreground pt-2'>vs</span>
                    <TTKDisplay weaponStats={weapon2Stats} winner={ttkWinner} />
                </div>
                { ttkWinner &&
                  <p className='text-sm text-accent mt-2'>
                    🏆 {ttkWinner} has a faster time-to-kill.
                  </p>
                }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsComparison;
