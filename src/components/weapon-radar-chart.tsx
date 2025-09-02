
"use client"

import * as React from "react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import type { WeaponStats } from "@/lib/ocr"
import type { ComparatorStats } from "./weapon-comparator"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

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

export function WeaponRadarChart({ data }: { data: ComparatorStats }) {
    const { weapon1Stats, weapon2Stats } = data;

    const chartData = React.useMemo(() => {
        const norm1 = normalizeData(weapon1Stats);
        const norm2 = normalizeData(weapon2Stats);

        return statKeyMapping
            .filter(key => (weapon1Stats[key] || 0) > 0 && (weapon2Stats[key] || 0) > 0)
            .map(key => ({
                stat: formatLabel(key),
                weapon1: norm1[key] || 0,
                weapon2: norm2[key] || 0,
            }));
    }, [weapon1Stats, weapon2Stats]);

    const chartConfig = {
        weapon1: {
            label: weapon1Stats.name || "Weapon 1",
            color: "hsl(var(--chart-1))",
        },
        weapon2: {
            label: weapon2Stats.name || "Weapon 2",
            color: "hsl(var(--chart-2))",
        },
    }

    if (chartData.length < 3) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground text-center p-8">
                <p>Not enough comparable stats to render chart. Please ensure at least 3 stats are available for both weapons.</p>
            </div>
        )
    }

    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto w-full max-w-lg h-full"
        >
            <RadarChart data={chartData}>
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            labelKey="stat"
                            indicator="dot"
                            formatter={(value, name, item) => (
                                <div className="flex items-center gap-2">
                                     <div
                                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                        style={{ backgroundColor: item.payload.fill }}
                                    />
                                    <span className={cn(name === 'weapon1' ? 'text-chart-1' : 'text-chart-2')}>{chartConfig[name as keyof typeof chartConfig].label}: </span>
                                    <span className="font-bold">{value.toFixed(1)}</span>
                                </div>
                            )}
                         />
                    }
                />
                 <PolarGrid className="fill-background stroke-border" />
                <PolarAngleAxis dataKey="stat" className="fill-foreground text-xs" />
                <Radar
                    name="weapon1"
                    dataKey="weapon1"
                    fill="var(--color-weapon1)"
                    fillOpacity={0.4}
                    stroke="var(--color-weapon1)"
                    strokeWidth={2}
                />
                <Radar
                    name="weapon2"
                    dataKey="weapon2"
                    fill="var(--color-weapon2)"
                    fillOpacity={0.4}
                    stroke="var(--color-weapon2)"
                    strokeWidth={2}
                />
                 <ChartLegend
                    content={<ChartLegendContent />}
                 />
            </RadarChart>
        </ChartContainer>
    )
}
