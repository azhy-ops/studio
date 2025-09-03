
"use client";

import type { WeaponStats } from '@/lib/ocr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';
import type { ComparatorStats } from './weapon-comparator';
import { AlertCircle } from 'lucide-react';
import { WeaponRadarChart } from './weapon-radar-chart';

interface StatsComparisonProps {
  data: ComparatorStats;
}

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
  
  const score1 = weapon1Stats.finalScore || 0;
  const score2 = weapon2Stats.finalScore || 0;
  const scoreWinner = score1 > score2 ? weapon1Stats.name : (score2 > score1 ? weapon2Stats.name : null);


  return (
    <div className="animate-in fade-in-0 duration-500">
      <Card className="w-full bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl sm:text-4xl">Stat Comparison</CardTitle>
          <CardDescription>A visual breakdown of each weapon's strengths and weaknesses.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-2 items-center gap-2 sm:gap-4 px-4 mb-4 text-center">
             <div className="text-right">
                <h3 className="text-lg font-headline text-chart-2">{weapon1Stats.name || 'Weapon 1'}</h3>
                <p className="text-xs text-muted-foreground">{weapon1Stats.type}</p>
             </div>
             <div className="text-left">
                <h3 className="text-lg font-headline text-chart-1">{weapon2Stats.name || 'Weapon 2'}</h3>
                <p className="text-xs text-muted-foreground">{weapon2Stats.type}</p>
             </div>
          </div>

          <div className="w-full aspect-square max-h-[500px] mx-auto">
             <WeaponRadarChart data={data} />
          </div>

          <div className="text-center pt-8 mt-4 border-t border-border/50">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsComparison;
