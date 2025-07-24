
"use client";

import type { WeaponStats } from '@/lib/ocr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatBarComparison } from './stat-bar';
import { Badge } from './ui/badge';

interface ComparatorStats {
    weapon1Stats: WeaponStats;
    weapon2Stats: WeaponStats;
}
interface StatsComparisonProps {
  data: ComparatorStats;
}

const statDisplayOrder: (keyof Omit<WeaponStats, 'name' | 'handling' | 'ttk'>)[] = [
  'damage',
  'fireRate',
  'range',
  'accuracy',
  'control',
  'stability',
  'mobility',
  'muzzleVelocity',
];

const StatsComparison = ({ data }: StatsComparisonProps) => {
  const { weapon1Stats, weapon2Stats } = data;
  const ttkWinner = weapon1Stats.ttk < weapon2Stats.ttk ? weapon1Stats.name : weapon2Stats.name;

  return (
    <div className="animate-in fade-in-0 duration-500">
      <Card className="w-full bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl sm:text-4xl">Stat Comparison</CardTitle>
          <CardDescription>The superior stat for each category is highlighted in violet. Hover over a stat's info icon for details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 px-4 mb-4">
             <h3 className="text-lg font-headline text-right">{weapon1Stats.name || 'Weapon 1'}</h3>
             <div></div>
             <h3 className="text-lg font-headline text-left">{weapon2Stats.name || 'Weapon 2'}</h3>
          </div>

          <div className="space-y-5">
            {statDisplayOrder.map((statName, index) => {
              const value1 = weapon1Stats[statName];
              const value2 = weapon2Stats[statName];

              if (typeof value1 === 'undefined' || typeof value2 === 'undefined') {
                return null;
              }

              const formattedStatName = statName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
              let unit: string | undefined;
              if (statName === 'fireRate') unit = 'RPM';
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
                <div className="flex justify-center items-center gap-4">
                  <Badge variant={ttkWinner === weapon1Stats.name ? "default" : "secondary"} className="text-lg px-4 py-1 bg-primary/20 text-primary-foreground border-primary">
                    {weapon1Stats.ttk}ms
                  </Badge>
                  <span className='text-muted-foreground'>vs</span>
                  <Badge variant={ttkWinner === weapon2Stats.name ? "default" : "secondary"} className="text-lg px-4 py-1 bg-primary/20 text-primary-foreground border-primary">
                    {weapon2Stats.ttk}ms
                  </Badge>
                </div>
                <p className='text-sm text-accent mt-2'>
                  🏆 {ttkWinner} has a faster time-to-kill.
                </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsComparison;
