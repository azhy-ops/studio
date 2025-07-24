"use client";

import type { ExtractWeaponStatsOutput } from '@/ai/flows/extract-weapon-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatBar from './stat-bar';

interface StatsComparisonProps {
  data: ExtractWeaponStatsOutput;
}

const statDisplayOrder: (keyof ExtractWeaponStatsOutput['weapon1Stats'])[] = [
  'damage',
  'range',
  'accuracy',
  'control',
  'stability',
  'mobility',
];

const StatsComparison = ({ data }: StatsComparisonProps) => {
  return (
    <div className="animate-in fade-in-0 duration-500">
      <Card className="w-full bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl sm:text-4xl">Comparison Results</CardTitle>
          <CardDescription>The superior stat for each category is highlighted in violet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 px-4 mb-4">
             <h3 className="text-lg font-headline text-right">Weapon 1</h3>
             <div></div>
             <h3 className="text-lg font-headline text-left">Weapon 2</h3>
          </div>

          <div className="space-y-5">
            {statDisplayOrder.map((statName, index) => {
              const value1 = data.weapon1Stats[statName];
              const value2 = data.weapon2Stats[statName];

              // Handle cases where a stat might not be found on the object
              if (typeof value1 === 'undefined' || typeof value2 === 'undefined') {
                return null;
              }

              const formattedStatName = statName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

              return (
                 <div key={statName} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms`}}>
                    <StatBar
                      statName={formattedStatName}
                      value1={value1}
                      value2={value2}
                    />
                 </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsComparison;
