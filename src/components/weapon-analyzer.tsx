
'use client';

import { useState, useTransition, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { extractStatsFromImage, type WeaponStats } from '@/lib/ocr';
import WeaponUploader from '@/components/weapon-uploader';
import { Badge } from './ui/badge';
import { List, ShieldCheck, ShieldPlus, ShieldAlert, Loader2, HelpCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SimpleStatBar } from './stat-bar';

type WeaponType = "Assault Rifle" | "Submachine Gun" | "Shotgun" | "Pistol" | "Marksman Rifle" | "Sniper Rifle" | "LMG";

const weaponTypes: WeaponType[] = ["Assault Rifle", "Submachine Gun", "Shotgun", "Pistol", "Marksman Rifle", "Sniper Rifle", "LMG"];

interface AnalysisOutput {
    stats: WeaponStats;
    score: number;
    weaponType: WeaponType;
}

const formulas: Record<WeaponType, Partial<Record<keyof Omit<WeaponStats, 'name' | 'ttk'>, number>>> = {
    "Assault Rifle": { damage: 0.20, accuracy: 0.15, control: 0.15, range: 0.15, stability: 0.10, fireRate: 0.10, handling: 0.10, mobility: 0.05 },
    "Submachine Gun": { fireRate: 0.25, mobility: 0.20, handling: 0.15, damage: 0.15, control: 0.10, accuracy: 0.10, range: 0.05 },
    "Shotgun": { damage: 0.30, handling: 0.20, control: 0.15, range: 0.10, stability: 0.10, mobility: 0.10, accuracy: 0.05 },
    "Pistol": { damage: 0.25, handling: 0.20, accuracy: 0.15, fireRate: 0.15, mobility: 0.15, stability: 0.10 },
    "Marksman Rifle": { damage: 0.25, accuracy: 0.20, range: 0.20, control: 0.15, stability: 0.10, handling: 0.10 },
    "Sniper Rifle": { damage: 0.35, accuracy: 0.25, range: 0.20, stability: 0.10, handling: 0.05, control: 0.05 },
    "LMG": { control: 0.20, stability: 0.20, fireRate: 0.20, damage: 0.15, range: 0.10, accuracy: 0.10, handling: 0.05 }
};

const normalizeStat = (value: number, max: number) => (value / max) * 100;

const calculateScore = (stats: WeaponStats, weaponType: WeaponType): number => {
  const formula = formulas[weaponType];
  let rawScore = 0;
  
  const normalizedStats = {
    ...stats,
    fireRate: normalizeStat(stats.fireRate, 1200),
    muzzleVelocity: normalizeStat(stats.muzzleVelocity, 1200),
  };

  const applicableStats = Object.keys(formula).filter(key => stats[key as keyof WeaponStats] > 0) as (keyof typeof formula)[];
  
  if (applicableStats.length === 0) return 0;

  const totalWeight = applicableStats.reduce((sum, key) => sum + (formula[key] || 0), 0);
  
  if (totalWeight === 0) return 0;

  for (const key of applicableStats) {
    const originalWeight = formula[key] || 0;
    const rebalancedWeight = originalWeight / totalWeight;
    const statValue = normalizedStats[key] || 0;
    rawScore += statValue * rebalancedWeight;
  }
  
  const finalScore = rawScore / 10;
  return parseFloat(finalScore.toFixed(1));
};


function AnalysisSkeleton() {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-10 w-28" />
                </div>
            </div>
            <div className='space-y-3 pt-4'>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    );
}


function AnalysisResult({ data }: { data: AnalysisOutput }) {
  const { stats, score, weaponType } = data;

  const statDisplayOrder: (keyof Omit<WeaponStats, 'name' | 'ttk'>)[] = [
    'damage',
    'fireRate',
    'range',
    'accuracy',
    'control',
    'handling',
    'stability',
    'mobility',
    'muzzleVelocity',
  ];

  const applicableStats = statDisplayOrder.filter(statKey => stats[statKey] !== undefined && stats[statKey] > 0);
  const notApplicableStats = statDisplayOrder.filter(statKey => stats[statKey] === 0 || stats[statKey] === undefined);

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm animate-in fade-in-0 duration-500">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-3xl sm:text-4xl">{stats.name}</CardTitle>
                <CardDescription>
                    Analysis for <span className="font-semibold text-accent">{weaponType}</span> role.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-end bg-muted/50 p-4 rounded-lg">
            <div>
                <p className='text-sm text-muted-foreground'>Weapon Score</p>
                <p className='font-headline text-5xl text-primary'>{score}<span className='text-3xl text-muted-foreground'>/10</span></p>
            </div>
            <div>
                <p className='text-sm text-muted-foreground text-right'>Time to Kill</p>
                <p className='font-code text-4xl text-foreground'>
                    {stats.ttk > 0 ? `${stats.ttk}ms` : 'N/A'}
                </p>
            </div>
        </div>

        <div>
            <h3 className="font-headline text-xl mb-3 flex items-center gap-2">
                Base Stats
            </h3>
             {notApplicableStats.length > 0 && (
                <p className="text-xs text-muted-foreground mb-3">
                    Note: The following stats were not detected and have been excluded from scoring: {notApplicableStats.map(s => s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())).join(', ')}.
                </p>
            )}
            <div className='space-y-3'>
                {applicableStats.map((statKey, index) => {
                    return (
                        <div key={statKey} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 50}ms`}}>
                            <SimpleStatBar
                                statName={statKey}
                                value={stats[statKey]}
                                label={statKey}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WeaponAnalyzer() {
  const [weaponPreview, setWeaponPreview] = useState<string | null>(null);
  const [weaponStats, setWeaponStats] = useState<WeaponStats | null>(null);
  const [weaponType, setWeaponType] = useState<WeaponType | null>(null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setWeaponPreview(dataUrl);
        setAnalysisResult(null);
        setWeaponStats(null);
        setIsProcessing(true);
        try {
          const { name, ...stats } = await extractStatsFromImage(dataUrl);
          const extractedName = name || 'Unknown Weapon';
          setWeaponStats({ name: extractedName, ...stats });
        } catch (err) {
          console.error(err);
          toast({ title: 'OCR Failed', description: 'Could not read stats from the image. Please enter stats manually.', variant: 'destructive' });
          setWeaponPreview(null);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };
  
  const performAnalysis = (type: WeaponType, stats: WeaponStats) => {
    if (!type || !stats) return;

    setIsLoading(true);
    setAnalysisResult(null);

    startTransition(() => {
        const score = calculateScore(stats, type);
        
        setAnalysisResult({
            stats: stats,
            score: score,
            weaponType: type,
        });

        setIsLoading(false);
    });
  }

  const handleAnalyze = async () => {
    if (!weaponStats) {
      toast({ title: 'Missing Stats', description: 'Please upload a screenshot or enter stats manually.', variant: 'destructive' });
      return;
    }
    if(!weaponStats.name || weaponStats.name === "Unknown Weapon") {
        toast({ title: 'Missing Weapon Name', description: 'Please enter a name for the weapon.', variant: 'destructive' });
        return;
    }
    if (!weaponType) {
      toast({ title: 'Missing Weapon Type', description: 'Please select a weapon type before analyzing.', variant: 'destructive' });
      return;
    }
    performAnalysis(weaponType, weaponStats);
  };
  
  const handleWeaponTypeChange = (type: WeaponType) => {
    setWeaponType(type);
    if (analysisResult && weaponStats) {
      performAnalysis(type, weaponStats);
    }
  }
  
  const handleStatChange = (statName: keyof WeaponStats, value: string) => {
    if (!weaponStats) return;
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) && value !== '') return;

    const updatedStats = {...weaponStats, [statName]: isNaN(numericValue) ? 0 : numericValue};
    
    if (statName === 'damage' || statName === 'fireRate') {
      updatedStats.ttk = extractStatsFromImage.calculateTTK(updatedStats.damage, updatedStats.fireRate);
    }
    setWeaponStats(updatedStats);

    if (analysisResult && weaponType) {
        performAnalysis(weaponType, updatedStats);
    }
  };
  
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (weaponStats) {
      setWeaponStats({ ...weaponStats, name: e.target.value });
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="grid w-full grid-cols-1 gap-8">
            <WeaponUploader
                weaponNumber={1}
                previewUrl={weaponPreview}
                onFileChange={handleFileChange}
                weaponName={weaponStats?.name || ''}
                onNameChange={handleNameChange}
                isSingleUploader={true}
                stats={weaponStats}
                onStatChange={handleStatChange}
                isLoading={isProcessing}
            >
                <div className="w-full">
                    <Select onValueChange={(value: WeaponType) => handleWeaponTypeChange(value)} disabled={!weaponStats}>
                        <SelectTrigger className="font-headline">
                            <SelectValue placeholder="Select Weapon Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {weaponTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </WeaponUploader>
        </div>

        <div className="flex w-full justify-center">
            <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={!weaponStats || !weaponType || isLoading || isPending || isProcessing}
                className="font-headline text-lg"
            >
                {(isLoading || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {(isLoading || isPending) ? 'Analyzing...' : 'Analyze Weapon'}
            </Button>
        </div>
        
        <div className="w-full">
            {(isLoading || isPending) && analysisResult === null && <AnalysisSkeleton />}
            {analysisResult && !(isLoading || isPending) && <AnalysisResult data={analysisResult} />}
        </div>
    </div>
  );
}

    