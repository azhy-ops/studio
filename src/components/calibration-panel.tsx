
"use client";

import type { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from './ui/label';
import type { CalibrationStats } from '@/lib/ocr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface CalibrationPanelProps {
  stats: CalibrationStats;
  onStatChange: (statName: keyof CalibrationStats, value: string) => void;
}

const calibrationStatInputs: { key: keyof CalibrationStats; label: string }[] = [
  { key: 'firingStability', label: 'Firing Stability (%)' },
  { key: 'extraControl', label: 'Extra Control (%)' },
  { key: 'stabilityWhenMoving', label: 'Stability When Moving (%)' },
  { key: 'adsMovementSpeed', label: 'ADS Movement Speed (%)' },
  { key: 'ads', label: 'ADS Speed (%)' },
  { key: 'hipFireAimSpeed', label: 'Hip Fire Aim Speed (%)' },
];

const StatInput = ({ label, value, onChange }: { label: string; value: number; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) => (
    <div className='grid grid-cols-2 items-center gap-2'>
        <Label htmlFor={label.toLowerCase()} className='text-right text-muted-foreground capitalize text-xs'>
            {label}
        </Label>
        <Input
            id={label.toLowerCase()}
            type="number"
            value={value || ''}
            onChange={onChange}
            className='h-8 text-sm'
            placeholder="0"
        />
    </div>
);

const CalibrationPanel = ({ stats, onStatChange }: CalibrationPanelProps) => {
  return (
    <div className="p-3 bg-muted/50 rounded-lg mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pt-2">
            {calibrationStatInputs.map(({ key, label }) => (
                <StatInput
                    key={key}
                    label={label}
                    value={stats[key]}
                    onChange={(e) => onStatChange(key, e.target.value)}
                />
            ))}
        </div>
    </div>
  );
};

export default CalibrationPanel;

    