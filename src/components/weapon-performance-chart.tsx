
"use client";

import { useMemo } from 'react';
import type { WeaponStats } from '@/lib/ocr';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface WeaponPerformanceChartProps {
  stats: WeaponStats;
}

const calculateScores = (stats: WeaponStats) => {
  const normalizedStats = {
    fire_rate: (stats.fireRate / 1200) * 100,
    damage: stats.damage,
    control: stats.control,
    handling: stats.handling,
    stability: stats.stability,
    muzzle_velocity: (stats.muzzleVelocity / 1200) * 100,
    accuracy: stats.accuracy,
    range: stats.range,
  };

  const close_range_score =
    (normalizedStats.fire_rate * 0.50) +
    (normalizedStats.handling * 0.50) +
    (normalizedStats.control * 0.20) +
    (normalizedStats.damage * 0.20) +
    (normalizedStats.accuracy * 0.50) +
    (normalizedStats.stability * 0.20) +
    (normalizedStats.muzzle_velocity * 0.15) +
    (normalizedStats.range * 0.15);

  const mid_range_score =
    (normalizedStats.damage * 0.50) +
    (normalizedStats.control * 0.40) +
    (normalizedStats.accuracy * 0.30) +
    (normalizedStats.fire_rate * 0.25) +
    (normalizedStats.stability * 0.30) +
    (normalizedStats.muzzle_velocity * 0.15) +
    (normalizedStats.handling * 0.40) +
    (normalizedStats.range * 0.30);

  const long_range_score =
    (normalizedStats.accuracy * 0.20) +
    (normalizedStats.damage * 0.50) +
    (normalizedStats.stability * 0.50) +
    (normalizedStats.muzzle_velocity * 0.40) +
    (normalizedStats.control * 0.50) +
    (normalizedStats.fire_rate * 0.20) +
    (normalizedStats.handling * 0.20) +
    (normalizedStats.range * 0.40);

  return {
    close: parseFloat(close_range_score.toFixed(2)),
    mid: parseFloat(mid_range_score.toFixed(2)),
    long: parseFloat(long_range_score.toFixed(2)),
  };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border border-border rounded-md shadow-lg">
        <p className="font-headline text-lg">{`${label} Range`}</p>
        <p className="text-accent font-code text-xl">{`Score: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const WeaponPerformanceChart = ({ stats }: WeaponPerformanceChartProps) => {
  const scores = useMemo(() => calculateScores(stats), [stats]);

  const data = [
    { name: 'Close', score: scores.close },
    { name: 'Mid', score: scores.mid },
    { name: 'Long', score: scores.long },
  ];

  return (
    <div>
        <h3 className="font-headline text-xl mb-3 flex items-center gap-2">
            Combat Performance
        </h3>
        <div className="aspect-video w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent) / 0.1)' }} />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default WeaponPerformanceChart;
