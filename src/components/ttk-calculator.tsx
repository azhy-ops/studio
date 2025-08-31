
'use client';

import { useState, useMemo, ChangeEvent } from 'react';
import type { WeaponStats } from '@/lib/ocr';
import { extractStatsFromImage, defaultMaxRpm } from '@/lib/ocr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const weaponTypes = ["SMG", "Assault Rifle", "LMG"];

const initialWeaponStats = (): Omit<WeaponStats, 'name' | 'stability' | 'range' | 'accuracy' | 'control' | 'handling' | 'muzzleVelocity'> => ({
  type: 'Assault Rifle',
  damage: 25,
  fireRate: 800,
  ttk: 0,
  fireRateInputType: 'rpm',
});

const TtkCalculator = () => {
  const [stats, setStats] = useState(initialWeaponStats());

  const calculatedStats = useMemo(() => {
    if (!stats.type || stats.damage <= 0 || stats.fireRate <= 0) {
      return { ttk: 0, shotsToKill: 0, rpmUsed: 0 };
    }
    return extractStatsFromImage.calculateTTK(
      stats.damage,
      stats.fireRate,
      stats.fireRateInputType,
      stats.type,
      stats.maxRpmOverride
    );
  }, [stats]);

  const handleStatChange = (statName: keyof typeof stats, value: string) => {
    setStats(prev => ({
      ...prev,
      [statName]: value,
    }));
  };

  const handleNumericStatChange = (statName: keyof typeof stats, value: string) => {
    const numericValue = parseInt(value, 10);
    setStats(prev => ({
      ...prev,
      [statName]: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  const handleWeaponTypeChange = (value: string) => {
    setStats(prev => ({
      ...prev,
      type: value,
      maxRpmOverride: undefined, // Reset override when type changes
    }));
  };

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Enter Weapon Stats</CardTitle>
        <CardDescription>Input the base damage and fire rate to see the calculated TTK.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
             <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="weapon-type">Weapon Type</Label>
              <Select
                value={stats.type}
                onValueChange={handleWeaponTypeChange}
              >
                <SelectTrigger id="weapon-type">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {weaponTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="damage">Damage per Shot</Label>
              <Input
                id="damage"
                type="number"
                value={stats.damage || ''}
                onChange={(e) => handleNumericStatChange('damage', e.target.value)}
                placeholder="e.g., 25"
              />
            </div>
            <div>
              <Label className='text-sm text-muted-foreground'>Fire Rate Input Type</Label>
               <RadioGroup value={stats.fireRateInputType} onValueChange={(v) => handleStatChange('fireRateInputType', v as 'rpm'|'stat')} className="flex gap-2 mt-1">
                    <Label htmlFor={`fr-type-stat-calc`} className={cn("flex-1 text-center text-xs p-2 rounded-md border cursor-pointer", stats.fireRateInputType === 'stat' && 'bg-primary/20 border-primary')}>
                         <RadioGroupItem value="stat" id={`fr-type-stat-calc`} className='sr-only'/>
                         Stat Bar (0-100)
                    </Label>
                    <Label htmlFor={`fr-type-rpm-calc`} className={cn("flex-1 text-center text-xs p-2 rounded-md border cursor-pointer", stats.fireRateInputType === 'rpm' && 'bg-primary/20 border-primary')}>
                        <RadioGroupItem value="rpm" id={`fr-type-rpm-calc`} className='sr-only'/>
                        RPM (Actual)
                    </Label>
                </RadioGroup>
            </div>
             <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="firerate">{stats.fireRateInputType === 'rpm' ? 'Rounds per Minute (RPM)' : 'Fire Rate (0-100)'}</Label>
              <Input
                id="firerate"
                type="number"
                value={stats.fireRate || ''}
                onChange={(e) => handleNumericStatChange('fireRate', e.target.value)}
                placeholder={stats.fireRateInputType === 'rpm' ? "e.g., 800" : "e.g., 85"}
              />
            </div>
             {stats.fireRateInputType === 'stat' && (
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="max-rpm">Max RPM for Weapon Type</Label>
                <Input
                  id="max-rpm"
                  type="number"
                  value={stats.maxRpmOverride ?? defaultMaxRpm[stats.type!]}
                  onChange={(e) => handleStatChange('maxRpmOverride', e.target.value)}
                  placeholder="e.g., 850"
                />
              </div>
            )}
          </div>
          <div className="p-4 bg-muted/50 rounded-lg flex flex-col justify-center items-center space-y-4">
             <div className="text-center">
                <Label className='font-bold flex items-center gap-1.5'>
                    Time to Kill (100 HP)
                     <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground/70 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className='max-w-xs'>
                                <p>TTK is how fast a weapon can neutralize a 100 HP target, calculated as (Shots to Kill - 1) * Time Between Shots.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Label>
                <div className='font-code text-5xl font-bold mt-2'>{calculatedStats.ttk}<span className="text-2xl text-muted-foreground">ms</span></div>
            </div>
            <div className="w-full space-y-2 pt-4 border-t border-muted-foreground/20 text-sm">
                <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Shots to Kill:</span>
                    <span className='font-semibold'>{calculatedStats.shotsToKill || 0}</span>
                </div>
                 <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Effective RPM:</span>
                     <span className='font-semibold'>{calculatedStats.rpmUsed || 0}</span>
                </div>
                 {stats.fireRateInputType === 'stat' && (
                    <div className='text-center text-xs text-amber-500 flex items-center justify-center gap-1 pt-2'>
                       <AlertTriangle className='h-3 w-3' /> TTK is an estimate based on the stat bar value.
                    </div>
                 )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TtkCalculator;
