
"use client";

import { useState, useMemo } from 'react';
import type { WeaponStats } from '@/lib/ocr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

type CombatRange = "Close Range" | "Mid Range" | "Long Range";

interface ComparatorStats {
    weapon1Stats: WeaponStats;
    weapon2Stats: WeaponStats;
}

const normalizeStat = (value: number, max: number) => (value / max) * 100;

const formulas: Record<CombatRange, Record<keyof Omit<WeaponStats, 'name' | 'ttk' | 'range'>, number>> = {
    "Close Range": {
        damage: 0.15,
        accuracy: 0.25,
        control: 0.15,
        stability: 0.03,
        handling: 0.25,
        fireRate: 0.30,
        muzzleVelocity: 0.02,
    },
    "Mid Range": {
        damage: 0.25,
        accuracy: 0.10,
        control: 0.20,
        stability: 0.15,
        handling: 0.20,
        fireRate: 0.15,
        muzzleVelocity: 0.07,
    },
    "Long Range": {
        damage: 0.30,
        accuracy: 0.10,
        control: 0.30,
        stability: 0.30,
        handling: 0.10,
        fireRate: 0.10,
        muzzleVelocity: 0.30,
    },
};

const rangeFormulas: Record<CombatRange, (range: number) => number> = {
    "Close Range": (range) => range * 0.05,
    "Mid Range": (range) => range * 0.10,
    "Long Range": (range) => range * 0.30,
};

const rangeDistances: Record<CombatRange, string> = {
    "Close Range": "0-20m",
    "Mid Range": "21-50m",
    "Long Range": "51m+",
};

const calculateScore = (stats: WeaponStats, range: CombatRange): number => {
  const formula = formulas[range];
  const rangeFormula = rangeFormulas[range];
  let score = 0;
  
  const normalizedStats = {
    ...stats,
    fireRate: normalizeStat(stats.fireRate, 1200),
    muzzleVelocity: normalizeStat(stats.muzzleVelocity, 1200),
  };

  for (const key in formula) {
    const statKey = key as keyof typeof formula;
    score += (normalizedStats[statKey] || 0) * formula[statKey];
  }
  
  score += rangeFormula(stats.range || 0);

  return parseFloat(score.toFixed(2));
};

interface CombatRangeComparisonProps {
  data: ComparatorStats;
}

const CombatRangeComparison = ({ data }: CombatRangeComparisonProps) => {
  const [selectedRange, setSelectedRange] = useState<CombatRange>("Mid Range");

  const { weapon1Score, weapon2Score, winner } = useMemo(() => {
    const weapon1Score = calculateScore(data.weapon1Stats, selectedRange);
    const weapon2Score = calculateScore(data.weapon2Stats, selectedRange);
    let winner: string | null = null;
    if (weapon1Score > weapon2Score) {
      winner = data.weapon1Stats.name || 'Weapon 1';
    } else if (weapon2Score > weapon1Score) {
      winner = data.weapon2Stats.name || 'Weapon 2';
    }
    return { weapon1Score, weapon2Score, winner };
  }, [data, selectedRange]);

  const maxScore = Math.max(weapon1Score, weapon2Score, 1);

  return (
    <div className="animate-in fade-in-0 duration-500">
      <Card className="w-full bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl sm:text-4xl">Combat Range Analysis</CardTitle>
          <CardDescription>Select a combat range to see the recommended weapon.</CardDescription>
          <div className="pt-2 flex justify-center flex-col items-center">
            <Select onValueChange={(value: CombatRange) => setSelectedRange(value)} defaultValue={selectedRange}>
              <SelectTrigger className="w-[200px] font-headline">
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Close Range">Close Range</SelectItem>
                <SelectItem value="Mid Range">Mid Range</SelectItem>
                <SelectItem value="Long Range">Long Range</SelectItem>
              </SelectContent>
            </Select>
             <p className="text-xs text-muted-foreground mt-2">{rangeDistances[selectedRange]}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Weapon 1 Score */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-headline text-lg">{data.weapon1Stats.name || 'Weapon 1'}</h4>
                <span className="font-code text-xl font-bold">{weapon1Score}</span>
              </div>
              <Progress value={(weapon1Score / maxScore) * 100} className={cn(winner === (data.weapon1Stats.name || 'Weapon 1') && '[&>div]:bg-accent')} />
            </div>
            {/* Weapon 2 Score */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-headline text-lg">{data.weapon2Stats.name || 'Weapon 2'}</h4>
                <span className="font-code text-xl font-bold">{weapon2Score}</span>
              </div>
              <Progress value={(weapon2Score / maxScore) * 100} className={cn(winner === (data.weapon2Stats.name || 'Weapon 2') && '[&>div]:bg-accent')} />
            </div>
          </div>
          {winner && (
            <div className="text-center bg-accent/20 border border-accent rounded-lg p-4">
              <h3 className="font-headline text-2xl text-accent flex items-center justify-center gap-2">
                <Trophy className="w-7 h-7" /> Best for {selectedRange}: {winner}
              </h3>
            </div>
          )}
           {winner === null && (
            <div className="text-center bg-muted/50 border border-muted-foreground/20 rounded-lg p-4">
              <h3 className="font-headline text-2xl text-muted-foreground">It's a tie!</h3>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CombatRangeComparison;
