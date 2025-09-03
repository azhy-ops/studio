
"use client"

import * as React from "react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, PolarRadiusAxis } from "recharts"
import type { WeaponStats } from "@/lib/ocr"
import type { ComparatorStats } from "./weapon-comparator"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useIsMobile } from "@/hooks/use-mobile"

const statKeyMapping: (keyof Omit<WeaponStats, 'name' | 'ttk' | 'type' | 'fireRateInputType' | 'maxRpmOverride' | 'shotsToKill' | 'timeBetweenShots' | 'rpmUsed' | 'finalScore'>)[] = [
  'damage',
  'fireRate',
  'range',
  'accuracy',
  'control',
  'handling',
  'stability',
  'muzzleVelocity',
]

const formatLabel = (label: string) => {
    if (label === 'muzzleVelocity') return 'Muzzle Vel.';
    if (label === 'fireRate') return 'Fire Rate';
    return label.charAt(0).toUpperCase() + label.slice(1);
}

const normalizeData = (stats: WeaponStats) => {
    const normalized: { [key: string]: number } = {};
    for (const key of statKeyMapping) {
        let value = stats[key] || 0;
        if (key === 'fireRate') {
            const maxRpm = stats.maxRpmOverride || 1200;
            const rpm = stats.fireRateInputType === 'rpm' ? stats.fireRate : (stats.fireRate / 100) * maxRpm;
            value = (rpm / 1200) * 100;
        } else if (key === 'muzzleVelocity') {
            value = (stats.muzzleVelocity / 1500) * 100;
        }
        normalized[key] = Math.min(value, 100);
    }
    return normalized;
}

const CustomAngleTick = ({ payload, x, y, textAnchor, isMobile, ...rest }: any) => {
  const fontSize = isMobile ? 10 : 12;
  return (
    <g>
      <text
        {...rest}
        y={y + (y - 150) / 10} // Adjust y position based on distance from center
        x={x + (x - 150) / 12} // Adjust x position based on distance from center
        textAnchor={textAnchor}
        fontSize={fontSize}
        fill="hsl(var(--foreground))"
      >
        {payload.value}
      </text>
    </g>
  );
}


export function WeaponRadarChart({ data }: { data: ComparatorStats }) {
    const { weapon1Stats, weapon2Stats } = data;
    const isMobile = useIsMobile();

    const chartData = React.useMemo(() => {
        const norm1 = normalizeData(weapon1Stats);
        const norm2 = normalizeData(weapon2Stats);

        return statKeyMapping
            .filter(key => (weapon1Stats[key] || 0) > 0 || (weapon2Stats[key] || 0) > 0)
            .map(key => ({
                stat: formatLabel(key),
                weapon1: norm1[key] || 0,
                weapon2: norm2[key] || 0,
            }));
    }, [weapon1Stats, weapon2Stats]);

    const chartConfig = {
        weapon1: {
            label: weapon1Stats.name || "Weapon 1",
            color: "hsl(var(--chart-2))",
        },
        weapon2: {
            label: weapon2Stats.name || "Weapon 2",
            color: "hsl(var(--chart-1))",
        },
    }

    if (chartData.length < 3) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground text-center p-8">
                <p>Not enough comparable stats to render chart. Please ensure at least 3 stats are available for both weapons.</p>
            </div>
        )
    }

    const radarMargin = isMobile ? { top: 10, right: 20, bottom: 10, left: 20 } : { top: 20, right: 40, bottom: 20, left: 40 };

    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto w-full h-full"
        >
            <RadarChart 
                data={chartData}
                margin={radarMargin}
                outerRadius={isMobile ? '80%' : '75%'}
            >
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                           indicator="line"
                           labelClassName="font-bold text-lg"
                        />
                    }
                />
                 <PolarAngleAxis 
                    dataKey="stat" 
                    tick={<CustomAngleTick isMobile={isMobile} />}
                 />
                 <PolarRadiusAxis tickCount={4} tick={false} axisLine={false} />
                 <PolarGrid gridType="polygon" className="stroke-border" />
                <Radar
                    name={chartConfig.weapon1.label}
                    dataKey="weapon1"
                    fill="var(--color-weapon1)"
                    fillOpacity={0.1}
                    stroke="var(--color-weapon1)"
                    strokeWidth={2}
                />
                <Radar
                    name={chartConfig.weapon2.label}
                    dataKey="weapon2"
                    fill="var(--color-weapon2)"
                    fillOpacity={0.1}
                    stroke="var(--color-weapon2)"
                    strokeWidth={2}
                />
            </RadarChart>
        </ChartContainer>
    )
}
