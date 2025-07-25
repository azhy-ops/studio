
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

type WeaponType = "Shotgun" | "Pistol" | "SMG" | "Assault Rifle" | "Marksman Rifle" | "Sniper Rifle";

const weaponTypes: WeaponType[] = ["Shotgun", "Pistol", "SMG", "Assault Rifle", "Marksman Rifle", "Sniper Rifle"];

interface AnalysisOutput {
    stats: WeaponStats;
    score: number;
    scoreBreakdown: Record<string, number>;
    weaponType: WeaponType;
    summaryPoints: { point: string; type: 'strength' | 'secondary-strength' | 'weakness'}[];
}

const statDescriptions: Record<string, string> = {
    damage: 'damage per shot',
    range: 'effective distance',
    control: 'recoil manageability',
    handling: 'ADS & swap speed',
    stability: 'aim steadiness during continuous fire',
    accuracy: 'shot grouping precision',
    mobility: 'movement speed while equipped',
    fireRate: 'bullets fired per minute',
    muzzleVelocity: 'bullet travel speed',
};

const formulas: Record<WeaponType, Partial<Record<keyof Omit<WeaponStats, 'name' | 'ttk'>, number>>> = {
    "Shotgun": { damage: 0.30, handling: 0.25, mobility: 0.15, control: 0.10, stability: 0.10, accuracy: 0.05, range: 0.03, fireRate: 0.02 },
    "Pistol": { handling: 0.30, mobility: 0.25, accuracy: 0.15, control: 0.10, damage: 0.10, stability: 0.05, range: 0.03, fireRate: 0.02 },
    "SMG": { fireRate: 0.30, mobility: 0.25, control: 0.15, stability: 0.10, handling: 0.10, accuracy: 0.05, damage: 0.03, range: 0.02 },
    "Assault Rifle": { accuracy: 0.20, damage: 0.18, control: 0.15, stability: 0.15, handling: 0.10, range: 0.10, fireRate: 0.07, mobility: 0.03, muzzleVelocity: 0.02 },
    "Marksman Rifle": { accuracy: 0.25, range: 0.20, damage: 0.18, stability: 0.15, control: 0.10, handling: 0.05, muzzleVelocity: 0.05, mobility: 0.02 },
    "Sniper Rifle": { accuracy: 0.30, range: 0.25, muzzleVelocity: 0.20, stability: 0.10, damage: 0.08, control: 0.05, handling: 0.02 }
};


const normalizeStat = (value: number, max: number) => (value / max) * 100;

const calculateScore = (stats: WeaponStats, weaponType: WeaponType): { score: number, breakdown: Record<string, number> } => {
  const formula = formulas[weaponType];
  let score = 0;
  const breakdown: Record<string, number> = {};
  
  const normalizedStats = {
    ...stats,
    fireRate: normalizeStat(stats.fireRate, 1200),
    muzzleVelocity: normalizeStat(stats.muzzleVelocity, 1200),
  };

  for (const key in formula) {
    const statKey = key as keyof typeof formula;
    const weight = formula[statKey] || 0;
    const statValue = normalizedStats[statKey] || 0;
    const contribution = statValue * weight;
    score += contribution;
    breakdown[statKey] = parseFloat(contribution.toFixed(2));
  }
  return { score: parseFloat(score.toFixed(2)), breakdown };
};

const getSummaryPoints = (stats: WeaponStats): { point: string; type: 'strength' | 'secondary-strength' | 'weakness' }[] => {
    const points: { point: string; type: 'strength' | 'secondary-strength' | 'weakness' }[] = [];
    const statKeys = Object.keys(statDescriptions) as (keyof typeof statDescriptions)[];

    const normalizedStats = { ...stats, fireRate: normalizeStat(stats.fireRate, 1200), muzzleVelocity: normalizeStat(stats.muzzleVelocity, 1200) };

    for (const key of statKeys) {
        if (!Object.prototype.hasOwnProperty.call(stats, key)) continue;
        const value = normalizedStats[key as keyof WeaponStats];
        if (typeof value !== 'number') continue;

        if (value >= 80) {
            points.push({ point: `Exceptional ${statDescriptions[key]}.`, type: 'strength' });
        } else if (value >= 60) {
            points.push({ point: `Strong ${statDescriptions[key]}.`, type: 'secondary-strength' });
        } else if (value <= 30) {
            points.push({ point: `Low ${statDescriptions[key]}.`, type: 'weakness' });
        }
    }
    return points.sort((a,b) => {
        const order = { 'strength': 1, 'secondary-strength': 2, 'weakness': 3 };
        return order[a.type] - order[b.type];
    }).slice(0, 5);
};

function AnalysisSkeleton() {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
               <div key={i} className="flex items-center gap-3">
                 <Skeleton className="h-5 w-5 rounded-full" />
                 <Skeleton className="h-4 w-full" />
               </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
}

const pointTypeIcons: Record<string, React.ReactNode> = {
    strength: <ShieldCheck className="h-5 w-5 text-green-400" />,
    'secondary-strength': <ShieldPlus className="h-5 w-5 text-blue-400" />,
    weakness: <ShieldAlert className="h-5 w-5 text-red-400" />,
};

function AnalysisResult({ data }: { data: AnalysisOutput }) {
  
  const sortedBreakdown = useMemo(() => {
    return Object.entries(data.scoreBreakdown).sort(([, a], [, b]) => b - a);
  }, [data.scoreBreakdown]);

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm animate-in fade-in-0 duration-500">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-3xl sm:text-4xl">{data.stats.name}</CardTitle>
                <CardDescription>
                    Best for <span className="font-semibold text-accent">{data.weaponType}</span> role.
                </CardDescription>
            </div>
            <div className='text-right'>
                <p className='text-sm text-muted-foreground'>Role Score</p>
                <p className='font-headline text-5xl text-primary'>{data.score}</p>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div>
                <h3 className="font-headline text-xl mb-3 flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Key Characteristics
                </h3>
                <ul className="space-y-2.5">
                    {data.summaryPoints.map((summary, index) => (
                        <li key={index} className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 100}ms`}}>
                            <span className="shrink-0">{pointTypeIcons[summary.type]}</span>
                            <span>{summary.point}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                 <h3 className="font-headline text-xl mb-3 flex items-center gap-2">
                    Score Contribution
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                        <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground/70 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>How much each stat contributes to the final role score.</p>
                        </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                 </h3>
                 <div className='space-y-2'>
                    {sortedBreakdown.map(([stat, value], index) => (
                        <div key={stat} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 50}ms`}}>
                            <SimpleStatBar 
                                statName={stat}
                                value={value}
                                label={stat}
                                isSuperior={index < 3}
                            />
                        </div>
                    ))}
                 </div>
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
        const { score, breakdown } = calculateScore(stats, type);
        const summaryPoints = getSummaryPoints(stats);
        
        setAnalysisResult({
            stats: stats,
            score: score,
            scoreBreakdown: breakdown,
            weaponType: type,
            summaryPoints,
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
    if (isNaN(numericValue)) return;

    const updatedStats = {...weaponStats, [statName]: numericValue};
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
